const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { TemaTrial: T, harness, fixture } = require('./helpers.cjs');
const { googleContext } = require('./google-helpers.cjs');

test('V1 AC-02/13: absent price remains visible, disables admission, zero is explicitly priced', () => {
  for (const price of ['', null]) {
    const h = harness(); h.data.formations[0].prix = price;
    const cat = h.service.catalogue(); assert.equal(cat.formations[0].prix, null); assert.equal(cat.sessions.length, 2);
    assert.equal(cat.sessions[0].status, 'open'); assert.equal(cat.sessions[0].registration_enabled, false); assert.equal(cat.sessions[0].registration_block_reason, 'price_unconfirmed');
    const receipt = h.service.submit(h.command()); assert.equal(receipt.code, 'CLOSED'); assert.equal(receipt.message_key, 'price_unconfirmed'); assert.deepEqual(receipt.errors, [{ field: 'prix', code: 'PRICE_UNCONFIRMED' }]); assert.equal(receipt.recording_status, 'not_recorded'); assert.equal(h.data.registrations.length, 0); assert.equal(h.messages.length, 0);
  }
  const h = harness(); h.data.formations[0].prix = 0; assert.equal(h.service.catalogue().sessions[0].registration_enabled, true); assert.equal(h.service.submit(h.command()).code, 'RECORDED');
});
test('V1 AC-02/08: full/closed priority and existing replay survive removal of accepted price', () => {
  const h = harness(), c = h.command(); h.service.submit(c); h.data.formations[0].prix = null;
  assert.equal(h.service.submit(c).code, 'REPLAY'); assert.equal(h.data.registrations.length, 1); assert.equal(h.messages.length, 2);
  assert.equal(JSON.parse(h.data.registrations[0].formation_snapshot).prix, 450);
  h.data.sessions[0].places_max = 1;
  const full = h.service.catalogue().sessions[0]; assert.equal(full.status, 'full'); assert.equal(full.registration_enabled, false); assert.equal(full.registration_block_reason, null);
  h.data.sessions[0].inscriptions_ouvertes = false;
  const closed = h.service.catalogue().sessions[0]; assert.equal(closed.status, 'closed'); assert.equal(closed.registration_block_reason, null);
});
test('V1 anti-abuse: fourth normalized address attempt is refused, counting business refusals without row/mail', () => {
  const h = harness(); h.data.sessions[0].inscriptions_ouvertes = false; h.data.sessions[1].inscriptions_ouvertes = false;
  for (let n = 0; n < 3; n++) assert.equal(h.service.submit(h.command({ courriel: n === 1 ? ' PARTICIPANT@EXAMPLE.INVALID ' : 'participant@example.invalid' })).code, 'CLOSED');
  const receipt = h.service.submit(h.command()); assert.equal(receipt.code, 'INVALID'); assert.equal(receipt.message_key, 'rate_limited'); assert.deepEqual(receipt.errors, [{ field: 'anti_spam', code: 'RATE_LIMITED' }]); assert.equal(receipt.recording_status, 'not_recorded');
  assert.equal(h.data.registrations.length, 0); assert.equal(h.messages.length, 0);
  h.advance(60000); assert.equal(h.service.submit(h.command()).code, 'CLOSED');
});
test('V1 anti-abuse: global 31st identity refused; fixed boundary renews; no raw email retained', () => {
  const h = harness(); h.data.sessions[0].inscriptions_ouvertes = false; h.data.sessions[1].inscriptions_ouvertes = false;
  for (let n = 0; n < 30; n++) assert.equal(h.service.register(h.command({ courriel: `person${n}@example.invalid` })).code, 'CLOSED');
  assert.equal(h.service.register(h.command({ courriel: 'person31@example.invalid' })).message_key, 'rate_limited');
  h.advance(60000); assert.equal(h.service.register(h.command({ courriel: 'person31@example.invalid' })).code, 'CLOSED');
  let state = null;
  const hash = h.deps.hash('person@example.invalid');
  for (let n = 0; n < 3; n++) state = T.nextRateBudget(state, hash, 59999).state;
  assert.equal(T.nextRateBudget(state, hash, 59999).allowed, false);
  const next = T.nextRateBudget(state, hash, 60000); assert.equal(next.allowed, true); assert.equal(next.state.total, 1); assert.ok(!JSON.stringify(next.state).includes('@'));
});
test('V1 anti-abuse: replay/conflict precedes saturated/unavailable counters and no second notification', () => {
  const h = harness(), c = h.command(); assert.equal(h.service.submit(c).code, 'RECORDED');
  assert.equal(h.service.register(h.command()).code, 'DUPLICATE'); assert.equal(h.service.register(h.command()).code, 'DUPLICATE');
  assert.equal(h.service.register(h.command()).message_key, 'rate_limited');
  h.options.failRateBudget = true;
  assert.equal(h.service.submit(c).code, 'REPLAY'); assert.equal(h.service.submit({ ...c, entreprise: 'changed' }).code, 'RETRY_CONFLICT'); assert.equal(h.messages.length, 2); assert.equal(h.data.registrations.length, 1);
  const fresh = h.service.register(h.command()); assert.equal(fresh.code, 'UNAVAILABLE'); assert.equal(fresh.recording_status, 'unknown'); assert.equal(h.data.registrations.length, 1);
});
test('V1 anti-abuse: corrupt durable state fails closed, fixed window state remains bounded', () => {
  const h = harness(), hash = h.deps.hash('test@example.invalid');
  for (const state of [{}, { version: 1, window: 0, total: 2, addresses: { [hash]: 1 } }, { version: 1, window: 0, total: 4, addresses: { [hash]: 4 } }]) assert.throws(() => T.nextRateBudget(state, hash, 60000), /RATE_CONFIG/);
  let state = null;
  for (let n = 0; n < 30; n++) state = T.nextRateBudget(state, h.deps.hash(String(n)), 1).state;
  assert.equal(Object.keys(state.addresses).length, 30); assert.equal(T.nextRateBudget(state, h.deps.hash('last'), 1).allowed, false); assert.ok(JSON.stringify(state).length < 3000);
});
function sourceManifest(count = 24) {
  return { source_id: 'tema-catalogue-pre-lancement-v1', records: Array.from({ length: count }, (_, i) => ({ source_key: `Sheet1!A${i + 6}:I${i + 6}`, logiciel: i < 18 ? 'DIV' : i < 22 ? 'DIMO' : 'MOOV', titre: `Formation fictive ${i}`, description: '', prerequis: 'Prérequis fictifs', contenu: 'Programme fictif conservé', resultat: 'Résultat fictif', duree: i ? 'Journée' : 'Demi-journée', prix: i ? 850 : 450, prix_qualificatif: 'À partir de', places_par_defaut: 8, formateurs: 'PRIVATE_FICTITIOUS_TRAINER', source_date: 'à venir' })) };
}
function importHarness() {
  const h = harness(), journal = new Map(); let counter = 7, writes = 0;
  h.data.formations = []; h.data.sessions = [];
  h.deps.importState = { get: key => journal.has(key) ? structuredClone(journal.get(key)) : null, set: (key, value) => journal.set(key, structuredClone(value)), counter: () => counter, setCounter: value => { counter = value; } };
  h.deps.importStore = { insertFormation: row => { h.data.formations.push(structuredClone(row)); writes++; if (h.options.interruptAfter === writes) throw Error('interrupt after durable row'); } };
  return { ...h, journal, counter: () => counter };
}
test('V1 1.1 import: all 24/18-4-2 source fields preserved privately, no dates created, inactive, replay stable', () => {
  const h = importHarness(), manifest = sourceManifest(); const first = T.importCatalogue(manifest, h.deps);
  assert.equal(first.imported, 24); assert.deepEqual(first.conflicts, []); assert.equal(h.data.formations.length, 24); assert.equal(h.data.sessions.length, 0); assert.equal(h.counter(), 31);
  const ids = h.data.formations.map(f => f.id); assert.equal(new Set(ids).size, 24); assert.ok(h.data.formations.every(f => f.actif === false && f.formateurs === 'PRIVATE_FICTITIOUS_TRAINER'));
  assert.equal(h.data.formations.filter(f => f.logiciel.startsWith('DIV —')).length, 18); assert.equal(h.data.formations.filter(f => f.logiciel.startsWith('DIMO —')).length, 4); assert.equal(h.data.formations.filter(f => f.logiciel.startsWith('MOOV —')).length, 2);
  const replay = T.importCatalogue(manifest, h.deps); assert.equal(replay.unchanged, 24); assert.equal(replay.imported, 0); assert.equal(h.counter(), 31); assert.deepEqual(h.data.formations.map(f => f.id), ids);
  h.data.formations.forEach(f => { f.actif = true; }); const cat = h.service.catalogue(); assert.equal(cat.formations.length, 24); assert.ok(!JSON.stringify(cat).includes('PRIVATE_FICTITIOUS_TRAINER')); assert.equal(cat.sessions.length, 0);
});
test('V1 1.1 import: durable prepared mapping recovers interruption after write without title matching/reallocation', () => {
  const h = importHarness(), manifest = sourceManifest(); h.options.interruptAfter = 3;
  assert.throws(() => T.importCatalogue(manifest, h.deps), /interrupt/); assert.equal(h.data.formations.length, 3); assert.equal(h.counter(), 10);
  const ids = h.data.formations.map(f => f.id); h.options.interruptAfter = 0;
  const resume = T.importCatalogue(manifest, h.deps); assert.equal(resume.resumed, 1); assert.equal(resume.unchanged, 2); assert.equal(resume.imported, 21); assert.deepEqual(h.data.formations.slice(0, 3).map(f => f.id), ids); assert.equal(h.counter(), 31);
  h.data.formations[0].titre = 'Renommée par Tema'; const before = structuredClone(h.data.formations);
  const conflict = T.importCatalogue(manifest, h.deps); assert.deepEqual(conflict.conflicts, [{ source_key: manifest.records[0].source_key, code: 'DESTINATION_CHANGED' }]); assert.deepEqual(h.data.formations, before); assert.equal(h.counter(), 31);
});
test('V1 1.1 import: reservation before insert resumes; changed source/deleted target/duplicate keys refuse destructive recovery', () => {
  const h = importHarness(), manifest = sourceManifest(1), insert = h.deps.importStore.insertFormation;
  h.deps.importStore.insertFormation = () => { throw Error('interrupt before write'); };
  assert.throws(() => T.importCatalogue(manifest, h.deps), /interrupt/); assert.equal(h.data.formations.length, 0); const reserved = [...h.journal.values()][0].id;
  h.deps.importStore.insertFormation = insert; T.importCatalogue(manifest, h.deps); assert.equal(h.data.formations[0].id, reserved); assert.equal(h.counter(), 8);
  manifest.records[0].titre = 'Source changed'; assert.equal(T.importCatalogue(manifest, h.deps).conflicts[0].code, 'SOURCE_CHANGED');
  manifest.records[0].titre = 'Formation fictive 0'; h.data.formations = []; assert.equal(T.importCatalogue(manifest, h.deps).conflicts[0].code, 'DESTINATION_MISSING'); assert.equal(h.data.formations.length, 0);
  manifest.records.push(manifest.records[0]); assert.throws(() => T.importCatalogue(manifest, h.deps), /IMPORT_SOURCE_AMBIGUOUS/);
});
test('V1 Google: persistent limiter across service recreation and real adapter lock; corruption leaves registration untouched', () => {
  const g = googleContext(), deps = g.context.trialDependencies_(), data = g.context.trialStore_().read();
  const c = harness().command(); c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString();
  for (let i = 0; i < 3; i++) g.context.TemaTrial.createService(deps).register({ ...c, request_id: crypto.randomUUID(), consentement: false });
  const denied = g.context.TemaTrial.createService(g.context.trialDependencies_()).register(c); assert.equal(denied.message_key, 'rate_limited'); assert.equal(g.context.trialStore_().read().registrations.length, data.registrations.length);
  const state = g.properties.get('V1_RATE_BUDGET_JSON'); assert.ok(!state.includes('@')); assert.equal(JSON.parse(state).total, 3); assert.ok(g.events.filter(e => e === 'tryLock').length >= 4);
  g.properties.set('V1_RATE_BUDGET_JSON', '{bad'); const unavailable = g.context.TemaTrial.createService(deps).register(c); assert.equal(unavailable.code, 'UNAVAILABLE'); assert.equal(unavailable.recording_status, 'unknown'); assert.equal(g.sent.length, 0);
});
test('V1 Google: private import preserves existing rows/mail budget, activations/seeds idempotent and fictitious dates closed', () => {
  const g = googleContext(), manifest = sourceManifest(), original = structuredClone(g.tabs.Formations.values[1]);
  g.properties.set('TRIAL_MAIL_BUDGET_JSON', JSON.stringify({ version: 1, registrations: { 'I-historical': { participant: true, tema: true } }, recipients: 2 })); const budget = g.properties.get('TRIAL_MAIL_BUDGET_JSON');
  const result = g.context.importCatalogueTrial_(manifest); assert.equal(result.imported, 24); assert.equal(result.complete, 24); assert.deepEqual(g.tabs.Formations.values[1], original);
  assert.equal(g.context.importCatalogueTrial_(manifest).unchanged, 24); assert.equal(g.properties.get('TRIAL_MAIL_BUDGET_JSON'), budget); assert.equal(g.sent.length, 0);
  g.context.activateV1TrialCatalogue(); const seeds = g.context.seedV1TrialSessions(); assert.equal(seeds.added_fictitious_sessions, 3); assert.equal(g.context.seedV1TrialSessions().added_fictitious_sessions, 0);
  const data = g.context.trialStore_().read(); assert.equal(data.formations.length, 25); assert.equal(data.sessions.length, 5); assert.ok(data.sessions.slice(2).every(s => s.inscriptions_ouvertes === false)); assert.deepEqual(Array.from(data.sessions.slice(2), s => s.places_max), [1, 3, 12]);
  assert.equal(g.properties.get('TRIAL_MAIL_BUDGET_JSON'), budget); assert.equal(g.sent.length, 0);
});
test('V1 Google: cleanup of a past confirmed reservation preserves replay/capacity while stopping pending mail', () => {
  const g = googleContext(), deps = g.context.trialDependencies_(), service = g.context.TemaTrial.createService(deps), c = harness().command(); c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString();
  assert.equal(service.register(c).code, 'RECORDED'); const row = g.context.trialStore_().read().registrations[0], fingerprint = row.payload_fingerprint;
  assert.throws(() => g.context.removeTrialCoordinates_(row.id_inscription), /CLEANUP_DECISION_REQUIRED/);
  const futureBefore = structuredClone(g.tabs.Inscriptions.values), propsBefore = [...g.properties];
  assert.throws(() => g.context.removeTrialCoordinates_(row.id_inscription, false), /CLEANUP_FUTURE_RESERVATION_REQUIRES_CANCELLATION/); assert.deepEqual(g.tabs.Inscriptions.values, futureBefore); assert.deepEqual([...g.properties], propsBefore);
  g.context.Date = class extends Date { static now() { return Date.parse('2031-12-01T12:00:00Z'); } };
  const snapshots = [row.formation_snapshot, row.debut_snapshot, row.fin_snapshot, row.lieu_snapshot];
  const result = g.context.removeTrialCoordinates_(row.id_inscription, false); assert.equal(result.reservation_cancelled, false);
  const cleaned = g.context.trialStore_().read().registrations[0]; assert.equal(cleaned.courriel, ''); assert.equal(cleaned.statut, 'confirmee'); assert.equal(cleaned.payload_fingerprint, fingerprint); assert.equal(cleaned.mail_participant_etat, 'SUPPRESSED'); assert.equal(cleaned.mail_tema_etat, 'SUPPRESSED');
  assert.equal(service.submit(c).code, 'REPLAY'); assert.equal(g.sent.length, 0); assert.equal(g.context.trialStore_().read().sessions[0].places_restantes, 2); assert.deepEqual([cleaned.formation_snapshot, cleaned.debut_snapshot, cleaned.fin_snapshot, cleaned.lieu_snapshot], snapshots);
  const exported = g.context.exportTrialData(); assert.equal(exported.tables.Inscriptions[1][T.HEADERS.Inscriptions.indexOf('courriel')], ''); assert.ok(g.logs.every(log => !log.includes('@')));
  g.context.removeTrialCoordinates_(row.id_inscription, true); assert.equal(service.submit(c).reservation_status, 'annulee'); assert.equal(g.context.trialStore_().read().sessions[0].places_restantes, 3);
});
test('V1 1.2: new cohort receives source capacity seed once, explicit and existing capacities remain independent', () => {
  const h = harness(); h.data.formations[0].places_par_defaut = 12; h.data.sessions[0].id_cohorte = ''; h.data.sessions[0].places_max = ''; h.data.sessions[0].inscriptions_ouvertes = '';
  const first = T.prepareAdministration(h.data, h.deps, 1), patch = first.patches.find(p => p.sheet === 'Disponibilités' && p.index === 0).values;
  assert.equal(patch.places_max, 12); assert.equal(patch.places_restantes, 12); assert.equal(patch.inscriptions_ouvertes, false); assert.equal(patch.etat_validation, '');
  Object.assign(h.data.sessions[0], patch); h.data.formations[0].places_par_defaut = 2;
  const next = T.prepareAdministration(h.data, h.deps, 1).patches.find(p => p.sheet === 'Disponibilités' && p.index === 0).values; assert.ok(!Object.hasOwn(next, 'places_max')); assert.equal(next.places_restantes, 12);
  h.data.sessions[0].id_cohorte = ''; h.data.sessions[0].places_max = 7;
  const explicit = T.prepareAdministration(h.data, h.deps, 1).patches.find(p => p.sheet === 'Disponibilités' && p.index === 0).values; assert.ok(!Object.hasOwn(explicit, 'places_max')); assert.equal(explicit.places_restantes, 7);
});
test('V1 import: a populated unjournaled catalogue is not guessed by title or overwritten', () => {
  const g = googleContext(); g.tabs.Formations.values[1][2] = 'Catalogue déjà exploité'; const before = structuredClone(g.tabs.Formations.values);
  assert.throws(() => g.context.importCatalogueTrial_(sourceManifest()), /IMPORT_DESTINATION_NOT_PRISTINE/); assert.deepEqual(g.tabs.Formations.values, before); assert.equal(g.properties.has('FORMATION_COUNTER'), false);
});
test('V1 fallback: install replaces only own old schedule at five minutes and preserves unrelated triggers', () => {
  const g = googleContext(); const created = [], removed = [];
  let list = ['reconcileTrial_', 'trialOnEdit_', 'unrelatedBusiness'].map(handler => ({ getHandlerFunction: () => handler }));
  g.context.ScriptApp.getProjectTriggers = () => list;
  g.context.ScriptApp.deleteTrigger = t => { removed.push(t.getHandlerFunction()); list = list.filter(item => item !== t); };
  g.context.ScriptApp.newTrigger = handler => ({ timeBased() { return this; }, everyMinutes(n) { assert.equal(n, 5); return this; }, create() { created.push(handler); list.push({ getHandlerFunction: () => handler }); } });
  const result = g.context.installV1TrialTriggers(); assert.equal(result.fallback_minutes, 5); assert.deepEqual(removed, ['reconcileTrial_']); assert.deepEqual(created, ['reconcileTrial_']); assert.equal(list.length, 3); assert.ok(list.some(t => t.getHandlerFunction() === 'unrelatedBusiness')); assert.equal(g.sent.length, 0);
});
test('V1 cadence/load: 24 formations, 48 synthetic dates, 1000 rows preserve counts/privacy; unchanged repair writes nothing', () => {
  const g = googleContext(); g.tabs.Formations.values[1][T.HEADERS.Formations.indexOf('actif')] = false; g.context.importCatalogueTrial_(sourceManifest()); g.context.activateV1TrialCatalogue();
  const ids = JSON.parse(g.properties.get('V1_CATALOGUE_IDS_JSON')), source = fixture().sessions[0], sessionHeaders = T.HEADERS['Disponibilités'], registrationHeaders = T.HEADERS.Inscriptions;
  g.tabs['Disponibilités'].values = [sessionHeaders.slice()];
  const futureYear = new Date().getUTCFullYear() + 1;
  for (let i = 0; i < 48; i++) { const row = { ...source, id_cohorte: `C-${crypto.randomUUID()}`, formation: ids[i % 24], date: `${futureYear}-07-15`, places_max: 100, inscriptions_ouvertes: true }; g.tabs['Disponibilités'].values.push(sessionHeaders.map(k => row[k])); }
  const registration = { id_inscription: '', request_id: '', payload_fingerprint: 'f'.repeat(64), id_cohorte: '', statut: 'confirmee', mail_participant_etat: 'SENT', mail_tema_etat: 'SENT', courriel: 'PRIVATE_LOAD_FICTITIOUS@example.invalid' };
  for (let i = 0; i < 1000; i++) { const row = { ...registration, id_inscription: `I-${crypto.randomUUID()}`, request_id: crypto.randomUUID(), id_cohorte: g.tabs['Disponibilités'].values[1 + i % 48][0] }; g.tabs.Inscriptions.values.push(registrationHeaders.map(k => row[k] ?? '')); }
  g.tabs.Inscriptions.maxRows = 1100; g.context.reconcileTrial_(); const cat = JSON.parse(g.context.doGet({}).text); assert.equal(cat.formations.length, 24); assert.equal(cat.sessions.length, 48); assert.equal(cat.sessions.reduce((sum, row) => sum + (row.places_max - row.places_restantes), 0), 1000); assert.ok(!JSON.stringify(cat).includes('PRIVATE_LOAD'));
  const before = g.mutations.length, timing = g.context.measureV1TrialUnchanged(); assert.equal(timing.unchanged_runs.length, 12); assert.ok(timing.unchanged_runs.every(r => r.patches === 0)); assert.equal(g.mutations.length, before); assert.equal(timing.reserved_recipients_before, timing.reserved_recipients_after); assert.equal(g.sent.length, 0);
});
test('V1 cadence: ten edits, paste/import and deliberately missed event use one no-mail maintenance service', () => {
  const g = googleContext(); g.context.importCatalogueTrial_(sourceManifest()); g.context.activateV1TrialCatalogue();
  const formHeaders = T.HEADERS.Formations, edited = g.tabs.Formations.values[2], id = edited[0];
  const edits = [];
  for (let i = 0; i < 10; i++) {
    edited[formHeaders.indexOf('titre')] = `Édition fictive ${i}`; const start = performance.now();
    g.context.trialOnEdit_({ source: { getId: () => g.properties.get('SPREADSHEET_ID') } });
    const cat = JSON.parse(g.context.doGet({}).text); assert.equal(cat.formations.find(f => f.id === id).titre, `Édition fictive ${i}`); edits.push(performance.now() - start);
  }
  const sample = Object.fromEntries(formHeaders.map((key, i) => [key, edited[i]]));
  for (const title of ['Collage fictif A', 'Collage fictif B']) g.tabs.Formations.values.push(formHeaders.map(key => key === 'id' ? '' : key === 'titre' ? title : key === 'actif' ? '' : sample[key]));
  // The missed event cannot publish invalid unidentified rows. Fallback later
  // assigns stable IDs and inactive defaults, without relying on onEdit.
  assert.equal(JSON.parse(g.context.doGet({}).text).formations.filter(f => f.titre.startsWith('Collage')).length, 0);
  g.context.reconcileTrial_();
  const pasted = g.context.trialStore_().read().formations.slice(-2); assert.ok(pasted.every(f => f.id && f.actif === false)); assert.equal(new Set(pasted.map(f => f.id)).size, 2);
  const firstId = pasted[0].id; g.context.reconcileTrial_(); assert.equal(g.context.trialStore_().read().formations.at(-2).id, firstId);
  assert.equal(g.context.importCatalogueTrial_(sourceManifest()).conflicts[0].code, 'DESTINATION_CHANGED');
  assert.equal(edits.length, 10); assert.equal(g.sent.length, 0); assert.equal(g.properties.has('TRIAL_MAIL_BUDGET_JSON'), false);
});
test('V1 Sheets grid: default false checkboxes do not append at row1001; useful sparse rows remain untouched', () => {
  const g = googleContext();
  for (const [name, checkbox] of [['Formations', 'actif'], ['Disponibilités', 'inscriptions_ouvertes']]) {
    const tab = g.tabs[name], headers = T.HEADERS[name]; tab.maxRows = 1000;
    while (tab.values.length < 1000) { const row = headers.map(() => ''); row[headers.indexOf(checkbox)] = false; tab.values.push(row); }
    assert.equal(tab.getLastRow(), 1000);
  }
  // Sparse human drafts and even orphan computed text are meaningful; skip them.
  const fheaders = T.HEADERS.Formations; g.tabs.Formations.values[2][fheaders.indexOf('description')] = 'Human draft must remain';
  const sheaders = T.HEADERS['Disponibilités']; g.tabs['Disponibilités'].values[3][sheaders.indexOf('etat_validation')] = 'Manual diagnostic retained';
  assert.equal(g.context.trialInsertionRow_(g.tabs.Formations, 'Formations'), 4); assert.equal(g.tabs.Formations.values[2][fheaders.indexOf('description')], 'Human draft must remain');
  g.tabs.Formations.values[2][fheaders.indexOf('description')] = '';
  const imported = g.context.importCatalogueTrial_(sourceManifest()); assert.equal(imported.imported, 24); assert.equal(g.tabs.Formations.values[2][fheaders.indexOf('titre')], 'Formation fictive 0');
  g.context.seedV1TrialSessions(); assert.equal(g.tabs['Disponibilités'].values[3][sheaders.indexOf('etat_validation')], 'Manual diagnostic retained'); assert.match(g.tabs['Disponibilités'].values[4][0], /^C-/); assert.equal(g.tabs.Formations.maxRows, 1000); assert.equal(g.tabs['Disponibilités'].maxRows, 1000);
});
test('V1 Sheets grid: full tables explicitly extend grid before inserting registration/formation/session', () => {
  const g = googleContext();
  const registrations = g.tabs.Inscriptions; registrations.maxRows = 1;
  g.context.trialStore_().insert({ id_inscription: 'I-grid', request_id: crypto.randomUUID(), statut: 'annulee', mail_participant_etat: 'SUPPRESSED', mail_tema_etat: 'SUPPRESSED' });
  assert.equal(registrations.maxRows, 2); assert.equal(registrations.values[1][0], 'I-grid');
  for (const name of ['Formations', 'Disponibilités']) { const tab = g.tabs[name]; tab.maxRows = tab.values.length; const row = g.context.trialInsertionRow_(tab, name); assert.equal(row, tab.values.length + 1); assert.equal(tab.maxRows, row); }
  assert.ok(g.mutations.filter(m => m.kind === 'insertRows').length >= 3);
});
test('V1 catalogue description: explicit manager text wins; absent description uses source sentence/line verbatim', () => {
  const h = harness(), programme = '\r\n  Découvrir les écrans et leurs paramètres. Conserver la suite intégrale.\r\nDeuxième ligne : éléments détaillés.';
  h.data.formations[0].contenu = programme; h.data.formations[0].description = 'Texte choisi par Tema — inchangé.';
  const before = structuredClone(h.data);
  let projected = h.service.catalogue().formations[0]; assert.equal(projected.description, 'Texte choisi par Tema — inchangé.'); assert.equal(projected.contenu, programme); assert.deepEqual(h.data, before);
  for (const empty of ['', ' \t', null]) {
    h.data.formations[0].description = empty; const source = structuredClone(h.data);
    projected = h.service.catalogue().formations[0]; assert.equal(projected.description, '  Découvrir les écrans et leurs paramètres.'); assert.equal(projected.contenu, programme); assert.deepEqual(h.data, source);
  }
  h.data.formations[0].contenu = 'Première ligne sans ponctuation\nProgramme complet conservé'; projected = h.service.catalogue().formations[0]; assert.equal(projected.description, 'Première ligne sans ponctuation'); assert.equal(projected.contenu, h.data.formations[0].contenu);
  h.data.formations[0].contenu = ''; assert.equal(h.service.catalogue().formations[0].description, '');
});

test('V1 approved copy: all 24 public programmes/prerequisites match approved mockup; audience introduction moves without changing private source', () => {
  const fs = require('node:fs'), path = require('node:path');
  const ux = path.resolve(__dirname, '../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/.working');
  const source = JSON.parse(fs.readFileSync(path.join(ux, 'catalogue-source-24-2026-10-28.json'), 'utf8')).formations;
  const html = fs.readFileSync(path.join(ux, 'fiche-tema-academie.html'), 'utf8'), expected = new Map();
  const decode = value => value.replace(/&#x([0-9a-f]+);|&#(\d+);|&(amp|lt|gt|quot|apos);/gi, (_, hex, number, name) => hex ? String.fromCodePoint(parseInt(hex, 16)) : number ? String.fromCodePoint(Number(number)) : ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[name]);
  for (const article of html.matchAll(/<article class="formation-detail"[^>]*data-source-row="(\d+)"[^>]*>([\s\S]*?)<\/article>/g)) {
    const fields = {};
    for (const paragraph of article[2].matchAll(/<p[^>]*data-client-field="(prerequisites-intro|prerequisites|content|outcome)"[^>]*>([\s\S]*?)<\/p>/g)) fields[paragraph[1]] = decode(paragraph[2]);
    if (!expected.has(Number(article[1]))) expected.set(Number(article[1]), fields);
  }
  assert.equal(source.length, 24); assert.equal(expected.size, 24);
  const h = harness(); h.data.formations = source.map(f => ({ id: 'F-SOURCE-' + f.source_row, logiciel: ({ Divalto: 'DIV', Dimo: 'DIMO', MoovApps: 'MOOV' })[f.software], titre: f.title.trim(), description: '', prerequis: f.prerequisites, contenu: f.content, resultat: f.outcome, duree: f.duration, prix: Number(f.price_label.match(/\d+/)[0]), prix_qualificatif: 'À partir de', actif: true }));
  const privateSource = structuredClone(h.data);
  for (const f of h.service.catalogue().formations) {
    const original = source.find(s => f.id === 'F-SOURCE-' + s.source_row), approved = expected.get(original.source_row);
    assert.equal(f.prerequis, approved.prerequisites, 'prerequisites row ' + original.source_row);
    assert.equal(f.contenu, approved.content, 'programme row ' + original.source_row); assert.equal(f.resultat, approved.outcome);
    if (approved['prerequisites-intro']) assert.equal(f.description, approved['prerequisites-intro']);
    else { assert.equal(f.prerequis, original.prerequisites); assert.ok(original.content.includes(f.description), 'verbatim fallback row ' + original.source_row); }
  }
  assert.deepEqual(h.data, privateSource);
  h.data.formations.forEach(f => { f.description = 'Présentation choisie explicitement par Tema.'; });
  h.service.catalogue().formations.forEach(f => { assert.equal(f.description, 'Présentation choisie explicitement par Tema.'); assert.equal(f.prerequis, source.find(original => Number(f.id.split('-').pop()) === original.source_row).prerequisites); });
});

test('V1 native Google types: text-formatted cells reproduce boolean coercion; all new writers preserve native booleans', () => {
  const g = googleContext();
  const scratch = g.tabs.Formations.getRange(2, T.HEADERS.Formations.indexOf('actif') + 1), original = scratch.getValues()[0][0];
  scratch.setNumberFormat('@').setValue(false); assert.equal(scratch.getValues()[0][0], 'false'); scratch.setNumberFormat('General').setValue(original);
  g.context.importCatalogueTrial_(sourceManifest());
  let imported = g.context.trialStore_().read().formations.slice(1);
  assert.equal(imported.length, 24); assert.ok(imported.every(f => f.actif === false && typeof f.prix === 'number' && typeof f.places_par_defaut === 'number'));
  g.context.activateV1TrialCatalogue(); g.context.seedV1TrialSessions();
  assert.ok(g.context.trialStore_().read().formations.slice(1).every(f => f.actif === true));
  assert.ok(g.context.trialStore_().read().sessions.slice(2).every(s => s.inscriptions_ouvertes === false && typeof s.places_max === 'number'));
  const command = harness().command(); command.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString();
  assert.equal(g.context.TemaTrial.createService(g.context.trialDependencies_()).submit(command).code, 'RECORDED');
  assert.equal(g.context.trialStore_().read().registrations[0].consentement_loi25, true);
});

test('V1 native Google repair: known imported/fixture booleans recover without changing history or coercing invalid human cells', () => {
  const g = googleContext(); g.context.importCatalogueTrial_(sourceManifest()); g.context.seedV1TrialSessions();
  const originalFormation = structuredClone(g.tabs.Formations.values[1]), originalSessions = structuredClone(g.tabs['Disponibilités'].values.slice(1, 3));
  const originalRegistrations = structuredClone(g.tabs.Inscriptions.values), budget = g.properties.get('TRIAL_MAIL_BUDGET_JSON');
  const fColumn = T.HEADERS.Formations.indexOf('actif') + 1, sColumn = T.HEADERS['Disponibilités'].indexOf('inscriptions_ouvertes') + 1;
  const forms = g.context.trialStore_().read().formations.slice(1), sessions = g.context.trialStore_().read().sessions.slice(2);
  forms.forEach((row, i) => g.tabs.Formations.getRange(row._sheetRow, fColumn).setNumberFormat('@').setValue(i % 2 === 0));
  sessions.forEach(row => g.tabs['Disponibilités'].getRange(row._sheetRow, sColumn).setNumberFormat('@').setValue(false));
  assert.ok(g.context.trialStore_().read().formations.slice(1).every(f => typeof f.actif === 'string'));
  const repaired = g.context.repairV1TrialCellTypes(); assert.equal(repaired.formation_boolean_repairs, 24); assert.equal(repaired.session_boolean_repairs, 3); assert.equal(repaired.invalid_known_cells.length, 0);
  assert.ok(g.context.trialStore_().read().formations.slice(1).every((f, i) => f.actif === (i % 2 === 0)));
  assert.ok(g.context.trialStore_().read().sessions.slice(2).every(s => s.inscriptions_ouvertes === false));
  assert.deepEqual(g.tabs.Formations.values[1], originalFormation); assert.deepEqual(g.tabs['Disponibilités'].values.slice(1, 3), originalSessions); assert.deepEqual(g.tabs.Inscriptions.values, originalRegistrations); assert.equal(g.properties.get('TRIAL_MAIL_BUDGET_JSON'), budget); assert.equal(g.sent.length, 0);
  g.tabs.Formations.getRange(forms[0]._sheetRow, fColumn).setNumberFormat('@').setValue('human-invalid');
  const invalid = g.context.repairV1TrialCellTypes(); assert.equal(invalid.invalid_known_cells.length, 1); assert.equal(g.tabs.Formations.getRange(forms[0]._sheetRow, fColumn).getValues()[0][0], 'human-invalid');
  assert.throws(() => g.context.activateV1TrialCatalogue(), /V1_BOOLEAN_INVALID/);
});

test('Review capacity: date-before-formation initializes later once, independently of cohort ID, and manual clear stays clear', () => {
  const g = googleContext(), tab = g.tabs['Disponibilités'], headers = T.HEADERS['Disponibilités'];
  const draft = { id_cohorte: '', formation: '', date: '2030-09-01', heure_debut: '09:00', heure_fin: '12:00', places_max: '', mode: 'en_ligne', lieu_ou_lien: '', inscriptions_ouvertes: false };
  tab.values.push(headers.map(key => draft[key] ?? '')); const index = tab.values.length - 1;
  g.context.reconcileTrial_(); const id = tab.values[index][0]; assert.match(id, /^C-/); assert.equal(tab.values[index][headers.indexOf('places_max')], ''); assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'waiting');
  tab.values[index][headers.indexOf('formation')] = 'DIV-ESS-001'; g.context.reconcileTrial_();
  assert.equal(tab.values[index][headers.indexOf('places_max')], 3); assert.equal(tab.values[index][0], id); assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'complete');
  const formDefault = T.HEADERS.Formations.indexOf('places_par_defaut'); g.tabs.Formations.values[1][formDefault] = 12;
  tab.values[index][headers.indexOf('places_max')] = ''; g.context.reconcileTrial_(); assert.equal(tab.values[index][headers.indexOf('places_max')], ''); assert.equal(tab.values[index][0], id); assert.match(tab.values[index][headers.indexOf('etat_validation')], /Capacité/);
});
test('Review capacity: explicit human value initializes once; historical missing metadata never repopulates a cleared capacity', () => {
  const g = googleContext(), tab = g.tabs['Disponibilités'], headers = T.HEADERS['Disponibilités'], originalId = tab.values[1][0];
  tab.values[1][headers.indexOf('places_max')] = ''; const originalRegistrations = structuredClone(g.tabs.Inscriptions.values);
  g.context.reconcileTrial_(); assert.equal(tab.values[1][headers.indexOf('places_max')], ''); assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + originalId)).status, 'complete');
  const draft = { ...fixture().sessions[0], id_cohorte: '', formation: '', places_max: 7 }; tab.values.push(headers.map(key => draft[key] ?? '')); const index = tab.values.length - 1;
  g.context.reconcileTrial_(); const id = tab.values[index][0]; assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'complete');
  tab.values[index][headers.indexOf('formation')] = 'DIV-ESS-001'; tab.values[index][headers.indexOf('places_max')] = ''; g.context.reconcileTrial_();
  assert.equal(tab.values[index][headers.indexOf('places_max')], ''); assert.equal(tab.values[index][0], id); assert.deepEqual(g.tabs.Inscriptions.values, originalRegistrations);
});
test('Review capacity: failed flush leaves waiting state retryable and does not complete initialization prematurely', () => {
  const g = googleContext(), tab = g.tabs['Disponibilités'], headers = T.HEADERS['Disponibilités'];
  tab.values.push(headers.map(key => key === 'formation' ? 'DIV-ESS-001' : key === 'inscriptions_ouvertes' ? false : ''));
  const flush = g.context.SpreadsheetApp.flush; g.context.SpreadsheetApp.flush = () => { throw Error('flush interrupted'); };
  assert.throws(() => g.context.reconcileTrial_(), /flush interrupted/); const id = tab.values.at(-1)[0]; assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'waiting');
  g.context.SpreadsheetApp.flush = flush; g.context.reconcileTrial_(); assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'complete'); assert.equal(tab.values.at(-1)[headers.indexOf('places_max')], 3);
});
test('Review cleanup: future confirmed identity cannot be removed without cancellation; already cancelled identity can be removed', () => {
  const g = googleContext(), service = g.context.TemaTrial.createService(g.context.trialDependencies_()), c = harness().command(); c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString(); assert.equal(service.register(c).code, 'RECORDED');
  const row = g.context.trialStore_().read().registrations[0], before = structuredClone(g.tabs.Inscriptions.values), properties = [...g.properties];
  assert.throws(() => g.context.removeTrialCoordinates_(row.id_inscription, false), /CLEANUP_FUTURE_RESERVATION_REQUIRES_CANCELLATION/); assert.deepEqual(g.tabs.Inscriptions.values, before); assert.deepEqual([...g.properties], properties);
  assert.equal(service.register({ ...c, request_id: crypto.randomUUID() }).code, 'DUPLICATE');
  g.tabs.Inscriptions.values[1][T.HEADERS.Inscriptions.indexOf('statut')] = 'annulee';
  const cleaned = g.context.removeTrialCoordinates_(row.id_inscription, false); assert.equal(cleaned.coordinates_removed, true); const current = g.context.trialStore_().read().registrations[0]; assert.equal(current.statut, 'annulee'); assert.equal(current.id_inscription, row.id_inscription); assert.equal(current.payload_fingerprint, row.payload_fingerprint); assert.equal(current.formation_snapshot, row.formation_snapshot); assert.equal(current.debut_snapshot, row.debut_snapshot); assert.equal(service.register(c).reservation_status, 'annulee');
});
test('Review cleanup: cancellation during claimed mail leaves unknown trace but cannot recall an in-flight transmission', () => {
  const g = googleContext(), service = g.context.TemaTrial.createService(g.context.trialDependencies_()), c = harness().command(); c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString(); let cleanup;
  const originalSend = g.context.MailApp.sendEmail;
  g.context.MailApp.sendEmail = message => { const row = g.context.trialStore_().read().registrations[0]; assert.equal(row.mail_participant_etat, 'SENDING'); cleanup = g.context.removeTrialCoordinates_(row.id_inscription, true); originalSend(message); };
  service.submit(c); const row = g.context.trialStore_().read().registrations[0]; assert.equal(row.statut, 'annulee'); assert.equal(row.courriel, ''); assert.equal(row.mail_participant_etat, 'UNKNOWN'); assert.equal(row.mail_participant_error_code, 'COORDINATES_REMOVED_AFTER_CLAIM'); assert.equal(row.mail_tema_etat, 'SUPPRESSED'); assert.equal(cleanup.already_claimed_mail_may_still_be_transmitted, true); assert.equal(g.sent.length, 1); assert.equal(g.sent[0].to, c.courriel); assert.equal(service.submit(c).reservation_status, 'annulee'); assert.equal(g.sent.length, 1);
});
test('Review import metadata: retain exact original source_date privately without altering fingerprints or creating sessions', () => {
  const h = importHarness(), manifest = sourceManifest(); manifest.records[0].source_date = '  Dates à venir — après validation Tema  ';
  T.importCatalogue(manifest, h.deps); const key = h.deps.hash(JSON.stringify([manifest.source_id, manifest.records[0].source_key])), mapping = h.journal.get(key);
  assert.equal(mapping.source_metadata.source_date, manifest.records[0].source_date); const fingerprint = mapping.fingerprint, ids = h.data.formations.map(f => f.id);
  manifest.records[0].source_date = 'Nouveau wording non contractuel'; const divergent = T.importCatalogue(manifest, h.deps); assert.equal(divergent.unchanged, 23); assert.deepEqual(divergent.conflicts, [{ source_key: manifest.records[0].source_key, code: 'SOURCE_METADATA_CHANGED' }]); assert.equal(h.journal.get(key).source_metadata.source_date, '  Dates à venir — après validation Tema  '); assert.equal(h.journal.get(key).fingerprint, fingerprint); assert.deepEqual(h.data.formations.map(f => f.id), ids); assert.equal(h.data.sessions.length, 0);
});
test('Review import metadata: explicit compatible replay migrates old mappings only; source/destination conflicts remain untouched', () => {
  const h = importHarness(), manifest = sourceManifest(); T.importCatalogue(manifest, h.deps); h.journal.forEach(value => { delete value.source_metadata; });
  const beforeRows = structuredClone(h.data.formations), beforeCounter = h.counter(); manifest.records[0].titre = 'Source diverged'; h.data.formations[1].titre = 'Tema diverged';
  const firstKey = h.deps.hash(JSON.stringify([manifest.source_id, manifest.records[0].source_key])), secondKey = h.deps.hash(JSON.stringify([manifest.source_id, manifest.records[1].source_key]));
  const firstMap = structuredClone(h.journal.get(firstKey)), secondMap = structuredClone(h.journal.get(secondKey)); const result = T.importCatalogue(manifest, h.deps);
  assert.equal(result.unchanged, 22); assert.deepEqual(result.conflicts.map(c => c.code), ['SOURCE_CHANGED', 'DESTINATION_CHANGED']); assert.deepEqual(h.journal.get(firstKey), firstMap); assert.deepEqual(h.journal.get(secondKey), secondMap); assert.equal([...h.journal.values()].filter(m => m.source_metadata?.source_date === 'à venir').length, 22); assert.equal(h.counter(), beforeCounter); assert.equal(h.data.sessions.length, 0); assert.deepEqual(h.data.formations.slice(2), beforeRows.slice(2));
  manifest.records[0].titre = 'Formation fictive 0'; h.data.formations[1].titre = 'Formation fictive 1'; const replay = T.importCatalogue(manifest, h.deps); assert.equal(replay.unchanged, 24); assert.ok([...h.journal.values()].every(m => m.source_metadata.source_date === 'à venir')); assert.deepEqual(h.data.formations, beforeRows); assert.equal(h.counter(), beforeCounter);
});
test('Review fallback: failed replacement creation preserves every existing recovery and unrelated trigger', () => {
  const g = googleContext(), original = ['reconcileTrial_', 'trialOnEdit_', 'unrelatedBusiness'].map(handler => ({ getHandlerFunction: () => handler })), removed = [];
  g.context.ScriptApp.getProjectTriggers = () => original.slice(); g.context.ScriptApp.deleteTrigger = t => removed.push(t);
  g.context.ScriptApp.newTrigger = () => ({ timeBased() { return this; }, everyMinutes(n) { assert.equal(n, 5); return this; }, create() { throw Error('trigger quota exhausted'); } });
  assert.throws(() => g.context.installV1TrialTriggers(), /trigger quota exhausted/); assert.deepEqual(removed, []); assert.equal(g.context.ScriptApp.getProjectTriggers().length, 3); assert.equal(g.sent.length, 0);
});
test('Review capacity: historical blank adoption remains complete across interrupted flush and retry', () => {
  const g = googleContext(), tab = g.tabs['Disponibilités'], headers = T.HEADERS['Disponibilités'], id = tab.values[1][0], capacityColumn = headers.indexOf('places_max');
  tab.values[1][capacityColumn] = ''; assert.equal(g.properties.has('CAPACITY_INIT_' + id), false);
  const flush = g.context.SpreadsheetApp.flush; g.context.SpreadsheetApp.flush = () => { throw Error('historical adoption flush interrupted'); };
  assert.throws(() => g.context.reconcileTrial_(), /historical adoption flush interrupted/);
  assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'complete'); assert.equal(tab.values[1][capacityColumn], ''); assert.equal(tab.values[1][0], id);
  g.context.SpreadsheetApp.flush = flush; g.context.reconcileTrial_(); assert.equal(tab.values[1][capacityColumn], ''); assert.equal(tab.values[1][0], id); assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'complete'); assert.match(tab.values[1][headers.indexOf('etat_validation')], /Capacité/); assert.equal(g.sent.length, 0);
});

test('Review capacity: explicit seven survives interrupted ID flush and subsequent manual clear without defaulting or reallocation', () => {
  const g = googleContext(), tab = g.tabs['Disponibilités'], headers = T.HEADERS['Disponibilités'];
  const draft = { id_cohorte: '', formation: 'DIV-ESS-001', date: '2030-09-01', heure_debut: '09:00', heure_fin: '12:00', places_max: 7, mode: 'en_ligne', lieu_ou_lien: '', inscriptions_ouvertes: false };
  tab.values.push(headers.map(key => draft[key] ?? '')); const index = tab.values.length - 1, count = tab.values.length;
  const flush = g.context.SpreadsheetApp.flush; g.context.SpreadsheetApp.flush = () => { throw Error('manual capacity flush interrupted'); };
  assert.throws(() => g.context.reconcileTrial_(), /manual capacity flush interrupted/);
  const id = tab.values[index][0], counter = g.properties.get('FORMATION_COUNTER'); assert.match(id, /^C-/); assert.equal(tab.values[index][headers.indexOf('places_max')], 7);
  assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'complete');
  tab.values[index][headers.indexOf('places_max')] = ''; g.context.SpreadsheetApp.flush = flush; g.context.reconcileTrial_();
  assert.equal(tab.values[index][headers.indexOf('places_max')], ''); assert.equal(tab.values[index][0], id); assert.equal(tab.values.length, count); assert.equal(g.properties.get('FORMATION_COUNTER'), counter);
  assert.equal(JSON.parse(g.properties.get('CAPACITY_INIT_' + id)).status, 'complete'); assert.match(tab.values[index][headers.indexOf('etat_validation')], /Capacité/); assert.equal(g.sent.length, 0);
});
