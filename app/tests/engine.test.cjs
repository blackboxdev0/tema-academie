const test = require('node:test');
const assert = require('node:assert/strict');
const { TemaTrial: T, formatLocal, harness, fixture } = require('./helpers.cjs');
const vectors = require('./vectors.json');

test('AC-08/13/ET-03: versioned canonical and revision serializations and SHA-256 vectors', () => {
  const h = harness(); assert.equal(T.fingerprintInput(T.canonical(vectors.command)), vectors.canonical_input); assert.equal(h.deps.hash(vectors.canonical_input), vectors.payload_fingerprint);
  assert.equal(T.revisionInput(h.data.sessions[0], h.data.formations[0]), vectors.session_revision_input); assert.equal(h.deps.hash(vectors.session_revision_input), vectors.session_revision);
});

test('AC-14/ET-10: explicit public whitelist, no registration/internal recipient/video/trainer fields', () => {
  const h = harness(); h.data.formations[0].secret = 'PRIVATE_NEW_COLUMN'; h.service.register(h.command());
  const cat = h.service.catalogue(), serialized = JSON.stringify(cat);
  for (const marker of ['participant@example', 'internal@example', 'PRIVATE_VIDEO', 'PRIVATE_TRAINER', 'PRIVATE_NEW_COLUMN', 'payload_fingerprint', 'registrations']) assert.ok(!serialized.includes(marker), marker);
  assert.deepEqual(Object.keys(cat).sort(), ['schema_version', 'generated_at', 'timezone', 'contact', 'policy', 'softwares', 'formations', 'sessions'].sort());
  assert.equal(cat.sessions[0].adresse_presentiel, null); assert.equal(cat.sessions[1].adresse_presentiel, '123, rue Fictive, Montréal');
});
test('AC-02/ET-05/09: visibility open/full/closed with confirmed rows, cancelled rows excluded', () => {
  const h = harness(); h.data.sessions[0].places_max = 1; const c = h.command(); h.service.register(c);
  assert.equal(h.service.catalogue().sessions[0].status, 'full');
  h.data.sessions[0].inscriptions_ouvertes = false;
  assert.equal(h.service.catalogue().sessions[0].status, 'closed');
  h.data.registrations[0].statut = 'annulee';
  assert.equal(h.service.catalogue().sessions.length, 1); assert.equal(h.service.catalogue().formations.length, 1);
  h.data.sessions[1].inscriptions_ouvertes = false; assert.equal(h.service.catalogue().sessions.length, 0);
  h.data.formations[0].actif = false; assert.equal(h.service.catalogue().formations.length, 0);
});
test('AC-02/ET-09: past and isolated invalid sessions hidden, active formation retained', () => {
  const h = harness(); h.data.sessions[0].date = '2020-01-01'; h.data.sessions[1].heure_fin = '08:00';
  assert.equal(h.service.catalogue().sessions.length, 0); assert.equal(h.service.catalogue().formations.length, 1);
});
test('AC-04/ET-10: moved columns map by name, missing/duplicate headers fail closed', () => {
  assert.deepEqual(T.tableRows([['name', 'id'], ['Title', 'ID']], ['id', 'name']), [{ name: 'Title', id: 'ID' }]);
  assert.throws(() => T.tableRows([['id', 'id']], ['id']), /CONFIG/);
  assert.throws(() => T.tableRows([['title']], ['id']), /CONFIG/);
});
test('ET-10: ambiguous parameters and private registration state fail unavailable', () => {
  const h = harness(); h.data.params.softwares.push({ id: 'DIV', label: 'Another' }); assert.equal(h.service.catalogue().code, 'UNAVAILABLE');
  const h2 = harness(); h2.service.register(h2.command()); h2.data.registrations.push(structuredClone(h2.data.registrations[0])); assert.equal(h2.service.catalogue().code, 'UNAVAILABLE');
});
test('AC-07/ET-02/04: insertion and flush before releasing admission lock; immutable private snapshots', () => {
  const h = harness(), c = h.command(); assert.equal(h.service.register(c).code, 'RECORDED');
  assert.deepEqual(h.events, ['lock', 'insert', 'flush', 'unlock']);
  const row = h.data.registrations[0]; assert.equal(JSON.parse(row.lieu_snapshot).lien_visio, 'https://example.invalid/PRIVATE_VIDEO');
  assert.equal(row.debut_snapshot, '2030-01-15T14:00:00.000Z');
  const snapshot = row.formation_snapshot; h.data.formations[0].titre = 'Renamed'; assert.equal(row.formation_snapshot, snapshot);
});
test('AC-08/ET-03: canonical NFC/trim/email casing fingerprint; transport and anti-spam omitted', () => {
  const h = harness(), c = h.command({ request_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', prenom: '  E\u0301milie  ', courriel: ' Participant@Example.Invalid ', telephone: '  ' });
  const canonical = T.canonical(c); assert.equal(canonical.prenom, 'Émilie'); assert.equal(canonical.telephone, null);
  assert.equal(T.fingerprintInput(canonical), JSON.stringify([1, c.id_cohorte, c.session_revision, 'Émilie', 'Fictive', 'Entreprise essai', 'participant@example.invalid', null, true, 'TEST-1']));
  const first = h.service.register(c); assert.equal(first.code, 'RECORDED');
  c.prenom = 'Émilie'; c.anti_spam = { honeypot: 'changed', form_started_at: 'invalid' }; assert.equal(h.service.register(c).code, 'REPLAY');
  assert.equal(h.data.registrations.length, 1);
});
test('AC-08/ET-03: replay after closure/policy change/cancellation returns current status, no mail', () => {
  const h = harness(), c = h.command(); h.service.submit(c); assert.equal(h.messages.length, 2);
  h.data.sessions[0].inscriptions_ouvertes = false; h.data.params.politique_version = 'TEST-2'; h.data.registrations[0].statut = 'annulee'; h.advance(600000);
  const replay = h.service.submit(c); assert.equal(replay.code, 'REPLAY'); assert.equal(replay.reservation_status, 'annulee'); assert.equal(h.messages.length, 2);
});
test('AC-08/ET-03: changed business payload under same request conflicts without disclosure', () => {
  const h = harness(), c = h.command(); h.service.register(c);
  const receipt = h.service.register({ ...c, entreprise: 'Changed' });
  assert.equal(receipt.code, 'RETRY_CONFLICT'); assert.equal(receipt.recording_status, 'unknown'); assert.equal(receipt.mail_status, null);
  assert.ok(!JSON.stringify(receipt).includes(c.courriel)); assert.equal(h.data.registrations.length, 1);
});
test('AC-08/ET-03: flush/response uncertainty followed by same request recovers existing row', () => {
  const h = harness({ failFlush: true }), c = h.command(); assert.equal(h.service.register(c).recording_status, 'unknown');
  h.options.failFlush = false; assert.equal(h.service.register(c).code, 'REPLAY'); assert.equal(h.data.registrations.length, 1);
});
test('AC-07/ET-04: two simulated contenders consume only last place; second FULL', async () => {
  const h = harness(); h.data.sessions[0].places_max = 1; const c = h.command();
  const results = await Promise.all([Promise.resolve().then(() => h.service.register(c)), Promise.resolve().then(() => h.service.register({ ...c, request_id: h.deps.uuid(), courriel: 'other@example.invalid' }))]);
  assert.deepEqual(results.map(r => r.code), ['RECORDED', 'FULL']); assert.equal(h.data.registrations.length, 1);
});
test('AC-07/ET-04: unavailable script lock returns BUSY/unknown, no mutation', () => {
  const h = harness({ busy: true }), c = h.command(); assert.equal(h.service.register(c).code, 'BUSY'); assert.equal(h.service.register(c).recording_status, 'unknown'); assert.equal(h.data.registrations.length, 0);
});
test('AC-06/ET-05: required fields, limits, CRLF, anti-spam and schema validated before writing', () => {
  const cases = [{ prenom: '' }, { nom: 'a'.repeat(101) }, { entreprise: 'Line\r\nBcc: x' }, { courriel: 'invalid' }, { telephone: '0'.repeat(31) }, { schema_version: 2 }, { anti_spam: { honeypot: 'bot', form_started_at: '2029-12-01T11:59:58.000Z' } }, { anti_spam: { honeypot: '', form_started_at: '2029-12-01T12:00:01.000Z' } }];
  for (const input of cases) { const h = harness(); const r = h.service.register(h.command(input)); assert.equal(r.code, 'INVALID', JSON.stringify(input)); assert.equal(r.recording_status, 'not_recorded'); assert.equal(h.data.registrations.length, 0); }
});
test('ET-05: malformed unidentifiable command remains unknown, no false certain refusal', () => {
  const h = harness(); const r = h.service.register({ schema_version: 1 }); assert.equal(r.code, 'INVALID'); assert.equal(r.recording_status, 'unknown');
});
test('AC-09/ET-05: consent and policy revision independently enforced', () => {
  const h = harness(); assert.equal(h.service.register(h.command({ consentement: false })).code, 'CONSENT_REQUIRED'); assert.equal(h.service.register(h.command({ politique_version: 'OLD' })).code, 'POLICY_CHANGED'); assert.equal(h.data.registrations.length, 0);
});
test('AC-17/ET-05: duplicate ignores cancelled row; new request creates a new ID', () => {
  const h = harness(), c = h.command(); h.service.register(c); assert.equal(h.service.register(h.command()).code, 'DUPLICATE');
  h.data.registrations[0].statut = 'annulee'; assert.equal(h.service.register(h.command()).code, 'RECORDED'); assert.notEqual(h.data.registrations[0].id_inscription, h.data.registrations[1].id_inscription);
});
test('AC-16/ET-05: manual close before fresh admission refuses only that date', () => {
  const h = harness(), c = h.command(); let reads = 0;
  h.options.beforeRead = (n, data) => { reads++; if (reads === 2) data.sessions[0].inscriptions_ouvertes = false; };
  assert.equal(h.service.register(c).code, 'CLOSED'); assert.equal(h.data.registrations.length, 0);
  assert.equal(h.service.catalogue().sessions[0].id_cohorte, h.data.sessions[1].id_cohorte);
});
test('AC-16/ET-05: close after admission allows that row and its initial mail, later requests refused', () => {
  const h = harness({ afterInsert: data => { data.sessions[0].inscriptions_ouvertes = false; } }), c = h.command();
  assert.equal(h.service.submit(c).code, 'RECORDED'); assert.equal(h.messages.length, 2); assert.equal(h.service.register(h.command({ id_cohorte: c.id_cohorte, session_revision: c.session_revision, courriel: 'other@example.invalid' })).code, 'CLOSED');
});
test('AC-16/ET-05: session start exact boundary has no admission grace period', () => {
  const h = harness(), c = h.command(); h.advance(Date.parse('2030-01-15T14:00:00Z') - h.deps.now());
  c.anti_spam.form_started_at = new Date(h.deps.now() - 2000).toISOString();
  assert.equal(h.service.register(c).code, 'CLOSED');
});
test('AC-13/ET-05/09: conditions revision changes with public conditions, not private link or counters', () => {
  const h = harness(), c = h.command(); h.data.sessions[0].lieu_ou_lien = ''; assert.equal(h.service.catalogue().sessions[0].session_revision, c.session_revision);
  h.data.sessions[0].places_max = 6; assert.equal(h.service.catalogue().sessions[0].session_revision, c.session_revision);
  h.data.formations[0].prix = 850; assert.equal(h.service.register(c).code, 'SESSION_CHANGED');
});
test('AC-02/ET-05: inactive formation prevents registration and preserves history', () => {
  const h = harness(), c = h.command(); h.service.register(c); h.data.formations[0].actif = false;
  assert.equal(h.service.register(h.command({ id_cohorte: c.id_cohorte, session_revision: c.session_revision })).code, 'NOT_FOUND'); assert.equal(h.data.registrations.length, 1);
});
test('AC-10/ET-06: participant first, Tema second, snapshots/ICS used; mail accepted does not imply reception', () => {
  const h = harness(), c = h.command(); const r = h.service.submit(c);
  assert.equal(r.mail_status, 'SENT'); assert.equal(h.messages.length, 2); assert.ok(h.messages[0].ics); assert.equal(h.messages[1].ics, null); assert.ok(h.messages[1].body.includes('SENT'));
  assert.ok(h.messages[0].body.includes('PRIVATE_VIDEO')); assert.ok(h.messages[0].ics.includes('URL:https://example.invalid/PRIVATE_VIDEO'));
});
test('AC-10/ET-06: no online link still records, ICS without URL, Tema manual follow-up', () => {
  const h = harness(); h.data.sessions[0].lieu_ou_lien = ''; h.service.submit(h.command());
  assert.ok(h.messages[0].body.includes('jours précédant')); assert.ok(h.messages[0].ics.includes('En ligne — lien à venir')); assert.ok(!h.messages[0].ics.includes('\r\nURL:')); assert.ok(h.messages[1].body.includes('communiquer manuellement'));
});
test('AC-10/ET-06: in-person address identical in public and mail snapshots', () => {
  const h = harness(), cat = h.service.catalogue(), s = cat.sessions[1];
  h.service.submit(h.command({ id_cohorte: s.id_cohorte, session_revision: s.session_revision })); assert.ok(h.messages[0].body.includes(s.adresse_presentiel));
});
test('AC-11/ET-07: summer/winter UTC, invalid dates and ambiguous/nonexistent DST local hours', () => {
  assert.equal(T.localToUtc('2030-01-15', '09:00', formatLocal), '2030-01-15T14:00:00.000Z');
  assert.equal(T.localToUtc('2030-07-15', '09:00', formatLocal), '2030-07-15T13:00:00.000Z');
  assert.throws(() => T.localToUtc('2030-03-10', '02:30', formatLocal), /INVALID_TIME/);
  assert.throws(() => T.localToUtc('2030-11-03', '01:30', formatLocal), /INVALID_TIME/);
  assert.throws(() => T.localToUtc('2030-02-30', '09:00', formatLocal), /INVALID_TIME/);
});
test('AC-11/ET-07: RFC5545 CRLF, UTF-8 octet folding, escaped text, stable UID, UTC Z without TZID', () => {
  const h = harness(); h.data.formations[0].titre = 'Été éà ; , '.repeat(20); h.service.register(h.command());
  const ics = T.makeIcs(h.data.registrations[0]); assert.equal(T.makeIcs(h.data.registrations[0]), ics); assert.ok(ics.includes('DTSTART:20300115T140000Z')); assert.ok(!ics.includes('TZID')); assert.ok(ics.includes('\\;')); assert.ok(ics.includes('\\,'));
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
  assert.ok(!ics.replace(/\r\n/g, '').includes('\n')); assert.ok(ics.endsWith('\r\n'));
});
test('AC-12/ET-08: participant detected failure keeps place; only Tema alert attempted next', () => {
  const h = harness({ failParticipant: true }), c = h.command(); const r = h.service.submit(c);
  assert.equal(r.recording_status, 'recorded'); assert.equal(r.mail_status, 'FAILED'); assert.equal(h.data.registrations[0].statut, 'confirmee'); assert.equal(h.messages.length, 2); assert.ok(h.messages[1].body.includes('FAILED'));
  h.service.submit(c); assert.equal(h.messages.length, 2);
});
test('AC-12/ET-08: global failure stops after two attempts, no recursive third alert', () => {
  const h = harness({ failAllMail: true }); h.service.submit(h.command());
  assert.equal(h.messages.length, 2); assert.equal(h.data.registrations[0].mail_tema_etat, 'FAILED');
});
test('AC-12/ET-08: quota blocked, uncertain send and interrupted status writes stay honest, never resend', () => {
  const h = harness({ blockMail: 'MAIL_QUOTA' }); h.service.submit(h.command()); assert.equal(h.messages.length, 0); assert.equal(h.data.registrations[0].mail_tema_etat, 'BLOCKED');
  const h2 = harness({ failParticipant: true, uncertain: true }); h2.service.submit(h2.command()); assert.equal(h2.data.registrations[0].mail_participant_etat, 'UNKNOWN');
  const h3 = harness({ failStatusWrite: true }), c = h3.command(); h3.service.submit(c); assert.equal(h3.data.registrations[0].mail_participant_etat, 'SENDING'); h3.service.submit(c); assert.equal(h3.messages.length, 2);
});
test('AC-12/ET-08: cancellation/changed conditions before initial send suppress/block participant', () => {
  for (const cancelled of [true, false]) {
    const h = harness(); h.service.register(h.command()); const row = h.data.registrations[0];
    if (cancelled) row.statut = 'annulee'; else h.data.sessions[0].heure_debut = '10:00';
    h.service.notify(row.id_inscription); assert.equal(h.messages.length, 1); assert.equal(row.mail_participant_etat, cancelled ? 'SUPPRESSED' : 'BLOCKED'); assert.equal(h.messages[0].ics, null);
  }
});
test('AC-14/ET-10: formula and HTML inputs inert in Sheet values/plain mail/ICS and no CRLF subject injection', () => {
  const h = harness(); h.service.submit(h.command({ prenom: '=SUM(1,2)', entreprise: '<script>alert(1)</script>' }));
  assert.equal(T.inertCell(h.data.registrations[0].prenom), "'=SUM(1,2)"); assert.ok(h.messages[1].body.includes('<script>')); assert.ok(!h.messages[0].subject.includes('\n')); assert.equal(h.messages[0].htmlBody, undefined);
});
test('AC-04/ET-09: one generator for paste/import, inactive/closed defaults, monotonic IDs and no reallocation', () => {
  const data = fixture(); data.formations.push({ id: '', logiciel: 'DIV — Divalto', titre: 'Érgonomie !', actif: '' }); data.sessions.push({ id_cohorte: '', inscriptions_ouvertes: '', places_max: 4 });
  const h = harness({ data }); const result = T.prepareAdministration(data, h.deps, 40), formationPatch = result.patches.find(p => p.sheet === 'Formations');
  assert.equal(formationPatch.values.id, 'DIV-ERG-041'); assert.equal(formationPatch.values.actif, false); assert.equal(result.counter, 41);
  assert.equal(result.patches.find(p => p.sheet === 'Disponibilités' && p.index === 2).values.inscriptions_ouvertes, false);
  Object.assign(data.formations[1], formationPatch.values); data.formations[1].titre = 'Changed';
  assert.ok(!T.prepareAdministration(data, h.deps, result.counter).patches.some(p => p.sheet === 'Formations')); assert.equal(data.formations[1].id, 'DIV-ERG-041');
  assert.equal(data.sessions[0].places_max, 3); assert.equal(data.formations[0].places_par_defaut, 3);
});
test('ET-09: no usable title does not invent an ID; over-capacity diagnostic never cancels rows', () => {
  const h = harness(); h.service.register(h.command()); h.data.sessions[0].places_max = 0; h.data.formations.push({ id: '', titre: '❤', logiciel: 'DIV — Divalto', actif: '' });
  const result = T.prepareAdministration(h.data, h.deps, 1); assert.equal(result.patches.find(p => p.sheet === 'Formations').values.id, undefined); assert.equal(h.data.registrations[0].statut, 'confirmee');
});
test('ET-09: shared validator writes private diagnostics for invalid hours, duplicate IDs and over-capacity', () => {
  const h = harness(); h.data.sessions[0].heure_fin = '08:00';
  assert.match(T.prepareAdministration(h.data, h.deps, 1).patches.find(p => p.sheet === 'Disponibilités' && p.index === 0).values.etat_validation, /Session invalide/);
  h.data.sessions[0].heure_fin = '12:00'; h.service.register(h.command()); h.data.sessions[0].places_max = 1;
  h.data.registrations.push({ ...h.data.registrations[0], id_inscription: 'I-' + h.deps.uuid(), request_id: h.deps.uuid() });
  assert.match(T.prepareAdministration(h.data, h.deps, 1).patches.find(p => p.sheet === 'Disponibilités' && p.index === 0).values.etat_validation, /Capacité inférieure/);
  h.data.sessions[1].id_cohorte = h.data.sessions[0].id_cohorte;
  assert.match(T.prepareAdministration(h.data, h.deps, 1).patches.find(p => p.sheet === 'Disponibilités' && p.index === 1).values.etat_validation, /Session invalide/);
});
test('ET-10: bad environment fails closed without revealing configuration or performing a write', () => {
  const h = harness(), c = h.command(); h.options.badEnvironment = true;
  assert.deepEqual(h.service.catalogue(), { schema_version: 1, code: 'UNAVAILABLE' }); assert.equal(h.service.register(c).recording_status, 'unknown'); assert.equal(h.data.registrations.length, 0);
});
test('ET-06/07: malformed HTTPS authorities fail closed and legitimate meeting URL vectors retain ICS links', () => {
  const invalid = ['https:///', 'https://#', 'https://?', 'https://', 'https://:443/path', 'https://user@meet.example.invalid/a', 'https://-bad.example/a', 'https://good..invalid/a', 'https://example.invalid:65536/a', 'https://999.0.0.1/a', 'https://[1:::2]/a', 'https://example.invalid\\evil/a'];
  for (const link of invalid) { const h = harness(), c = h.command(); h.data.sessions[0].lieu_ou_lien = link; assert.equal(h.service.register(c).code, 'NOT_FOUND', link); assert.equal(h.service.catalogue().sessions.length, 1); assert.equal(h.messages.length, 0); }
  for (const link of ['https://meet.google.com/abc-defg-hij', 'https://us02web.zoom.us/j/123?pwd=abc%2B123', 'https://teams.microsoft.com/l/meetup-join/test?context=%7B%7D#join', 'https://meeting.example.invalid:8443/a', 'https://[2001:db8::1]/meeting']) {
    const h = harness(); h.data.sessions[0].lieu_ou_lien = link; assert.equal(h.service.submit(h.command()).code, 'RECORDED', link); assert.ok(h.messages[0].ics.replace(/\r\n /g, '').includes('URL:' + link));
  }
  const h = harness(); h.service.register(h.command()); h.data.registrations[0].lieu_snapshot = JSON.stringify({ mode: 'en_ligne', adresse_presentiel: null, lien_visio: 'https://#' }); assert.throws(() => T.makeIcs(h.data.registrations[0]), /CONFIG/);
});
test('ET-09: safe formation counter bounds reject unsafe imports/persistence and stop exactly before overflow', () => {
  const h = harness(), data = h.data; data.formations.push({ id: '', logiciel: 'DIV — Divalto', titre: 'New', duree: 'Journée', prix: null, actif: false });
  assert.throws(() => T.prepareAdministration(data, h.deps, Number.MAX_SAFE_INTEGER + 1), /COUNTER_RANGE/);
  assert.throws(() => T.prepareAdministration(data, h.deps, Number.MAX_SAFE_INTEGER), /COUNTER_RANGE/); assert.equal(data.formations[1].id, '');
  const result = T.prepareAdministration(data, h.deps, Number.MAX_SAFE_INTEGER - 1); assert.equal(result.counter, Number.MAX_SAFE_INTEGER); assert.ok(result.patches.find(p => p.sheet === 'Formations').values.id.endsWith('-9007199254740991'));
  data.formations[0].id = 'DIV-OLD-9007199254740993'; assert.throws(() => T.prepareAdministration(data, h.deps, 0), /COUNTER_RANGE/);
});
test('ET-09/10: whitespace required admin fields are invalid, with private formation notes and unchanged snapshots', () => {
  for (const field of ['titre', 'duree']) { const h = harness(), c = h.command(); h.service.register(c); const snapshot = h.data.registrations[0].formation_snapshot; h.data.formations[0][field] = ' \t\u00a0 '; assert.equal(h.service.catalogue().formations.length, 0); assert.ok(T.formationIssues(h.data)[0][field]); assert.equal(h.data.registrations[0].formation_snapshot, snapshot); }
  const h = harness(); h.data.params.softwares[0].label = '   '; assert.equal(h.service.catalogue().code, 'UNAVAILABLE');
});
test('ET-12: compatible engine recreation preserves recorded rows and does not reset IDs/budget', () => {
  const h = harness(), c = h.command(); h.service.submit(c); const serviceAgain = T.createService(h.deps);
  assert.equal(serviceAgain.submit(c).code, 'REPLAY'); assert.equal(h.data.registrations.length, 1); assert.equal(h.messages.length, 2);
});
test('ET-02/03: URL-encoded command uses exact shared typed contract', () => {
  const h = harness(), c = h.command();
  const fields = Object.fromEntries(Object.entries(c).filter(([k]) => k !== 'anti_spam').map(([k, v]) => [k, v === null ? '' : String(v)])); Object.assign(fields, c.anti_spam);
  assert.deepEqual(T.canonical(T.decodeForm(fields)), T.canonical(c));
  fields.consentement = 'yes'; assert.equal(T.decodeForm(fields).consentement, false);
});
