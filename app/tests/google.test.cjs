const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { TemaTrial, fixture, formatLocal, harness } = require('./helpers.cjs');

function googleContext(empty = false) {
  const data = fixture(), sent = [], events = [], validations = [], logs = [], mutations = [];
  const values = Object.fromEntries(Object.entries(TemaTrial.HEADERS).map(([name, headers]) => [name, [headers.slice(), ...(empty ? [] : (name === 'Formations' ? data.formations : name === 'Disponibilités' ? data.sessions : data.registrations).map(row => headers.map(key => row[key] ?? '')))]]));
  values['Paramètres'] = [['cle', 'valeur', 'description', '', 'id', 'label', 'choix'],
    ['courriel_contact', data.params.courriel_contact, 'Public', '', 'DIV', 'Divalto', 'DIV — Divalto'],
    ['courriel_avis_tema', data.params.courriel_avis_tema, 'Interne', '', 'DIMO', 'Dimo', 'DIMO — Dimo'],
    ['nom_expediteur', 'Tema TEST', '', '', 'MOOV', 'MoovApps', 'MOOV — MoovApps'],
    ['politique_url', data.params.politique_url, 'Document', '', '', '', ''],
    ['politique_version', data.params.politique_version, 'Version', '', '', '', '']];
  class Range {
    constructor(tab, row, col, height = 1, width = 1) { Object.assign(this, { tab, row, col, height, width }); }
    getValues() { return Array.from({ length: this.height }, (_, i) => Array.from({ length: this.width }, (_, j) => this.tab.values[this.row + i - 1]?.[this.col + j - 1] ?? '')); }
    setValues(rows) { mutations.push({ kind: 'values', sheet: this.tab.name }); for (let i = 0; i < rows.length; i++) for (let j = 0; j < rows[i].length; j++) { const r = this.row + i - 1; this.tab.values[r] ||= []; this.tab.values[r][this.col + j - 1] = rows[i][j]; } return this; }
    setValue(v) { return this.setValues([[v]]); }
    setNumberFormat(format) { for (let i = 0; i < this.height; i++) for (let j = 0; j < this.width; j++) this.tab.formats.set(`${this.row + i}:${this.col + j}`, format); return this; }
    getNumberFormat() { return this.tab.formats.get(`${this.row}:${this.col}`) || 'General'; }
    setFontWeight() { return this; }
    getSheet() { return this.tab; } getRow() { return this.row; } getColumn() { return this.col; }
    getNotes() { return Array.from({ length: this.height }, (_, i) => Array.from({ length: this.width }, (_, j) => this.tab.notes.get(`${this.row + i}:${this.col + j}`) || '')); }
    setNotes(notes) { mutations.push({ kind: 'notes', sheet: this.tab.name }); for (let i = 0; i < notes.length; i++) for (let j = 0; j < notes[i].length; j++) this.tab.notes.set(`${this.row + i}:${this.col + j}`, notes[i][j]); return this; }
    setDataValidation(rule) { mutations.push({ kind: 'dropdown', sheet: this.tab.name }); validations.push({ name: this.tab.name, column: this.col, rule }); return this; }
    insertCheckboxes() { events.push('checkboxes'); for (let i = 0; i < this.height; i++) this.tab.getRange(this.row + i, this.col).setValue(false); return this; }
    protect() { const protection = { range: this, description: '', warning: false, getRange() { return this.range; }, setRange(range) { this.range = range; return this; }, getDescription() { return this.description; }, setDescription(value) { this.description = value; return this; }, setWarningOnly(value) { this.warning = value; return this; } }; this.tab.protections.push(protection); return protection; }
  }
  class Tab {
    constructor(name, rows) { this.name = name; this.values = rows; this.formats = new Map(); this.notes = new Map(); this.protections = []; }
    getRange(...args) { return new Range(this, ...args); }
    getLastColumn() { return this.values[0].length; }
    getLastRow() { return Math.max(1, this.values.findLastIndex(line => line.some(v => v !== '' && v !== null)) + 1); }
    getMaxRows() { return 100; }
    getDataRange() { return this.getRange(1, 1, this.getLastRow(), this.getLastColumn()); }
    getProtections() { return this.protections; }
  }
  const tabs = Object.fromEntries(Object.entries(values).map(([name, rows]) => [name, new Tab(name, rows)]));
  const properties = new Map([['ENVIRONMENT', 'TEST'], ['SPREADSHEET_ID', '1Zq8s1Jwd4NgpbMIed35W0LJIsUpJ-JPt19BZK89yM3c'], ['ALLOWED_RECIPIENTS_JSON', JSON.stringify(['participant@example.invalid', 'internal@example.invalid'])], ['CONTACT_EMAIL', data.params.courriel_contact], ['TEMA_EMAIL', data.params.courriel_avis_tema]]);
  let quota = 100, acquire = true;
  const spreadsheet = { getSheetByName: name => tabs[name], getId: () => properties.get('SPREADSHEET_ID') };
  const context = vm.createContext({
    console: { log: value => logs.push(value) }, Date, JSON, Object, Array, String, Number, Boolean, Math, Error, RegExp, unescape, encodeURIComponent,
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => properties.get(k) ?? null, setProperty: (k, v) => properties.set(k, v) }) },
    ScriptApp: { getScriptId: () => '1cQXjhw60iKv9n3P4EcLcgsbWBgWmlj47EFUGM5wqJgXDAQqajC5M0k_x', getProjectTriggers: () => [] },
    SpreadsheetApp: { ProtectionType: { RANGE: 'RANGE' }, openById: id => { assert.equal(id, properties.get('SPREADSHEET_ID')); events.push('open'); return spreadsheet; }, flush: () => events.push('flush'), newDataValidation: () => ({ requireValueInList(choices) { this.choices = choices; return this; }, setAllowInvalid() { return this; }, build() { return this; } }) },
    LockService: { getScriptLock: () => ({ tryLock: () => { events.push('tryLock'); return acquire; }, releaseLock: () => events.push('releaseLock') }) },
    MailApp: { getRemainingDailyQuota: () => quota, sendEmail: options => sent.push(options) },
    Utilities: { getUuid: () => crypto.randomUUID(), formatDate: (date, zone, pattern) => { const t = formatLocal(date.getTime()); return pattern === 'yyyy-MM-dd' ? t.slice(0, 10) : pattern === 'HH:mm' ? t.slice(11) : t; }, computeDigest: (algorithm, str) => [...crypto.createHash('sha256').update(str).digest()].map(n => n > 127 ? n - 256 : n), DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' }, newBlob: (content, type, name) => ({ content, type, name }) },
    ContentService: { createTextOutput: str => ({ text: str, setMimeType() { return this; } }), MimeType: { JSON: 'application/json' } }
  });
  for (const name of ['engine.js', 'google.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', name), 'utf8'), context, { filename: name });
  return { context, properties, tabs, sent, events, validations, logs, mutations, setQuota: n => { quota = n; }, setAcquire: v => { acquire = v; } };
}
function formEvent(command) {
  const parameter = Object.fromEntries(Object.entries(command).filter(([key]) => key !== 'anti_spam').map(([key, value]) => [key, value === null ? '' : String(value)]));
  Object.assign(parameter, command.anti_spam);
  return { parameter, parameters: Object.fromEntries(Object.entries(parameter).map(([key, value]) => [key, [value]])), postData: { type: 'application/x-www-form-urlencoded; charset=UTF-8', contents: new URLSearchParams(parameter).toString() } };
}
test('ET-02/03: URL-encoded doPost records once, returns current replay and sends only two initial notifications', () => {
  const g = googleContext(), c = harness().command(); c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString();
  const event = formEvent(c), first = JSON.parse(g.context.doPost(event).text);
  assert.equal(first.code, 'RECORDED'); assert.equal(first.recording_status, 'recorded'); assert.equal(first.mail_status, 'SENT'); assert.equal(first.request_id, c.request_id);
  assert.equal(g.context.trialStore_().read().registrations.length, 1); assert.equal(g.sent.length, 2); assert.equal(g.sent.filter(message => message.attachments).length, 1);
  const replay = JSON.parse(g.context.doPost(event).text); assert.equal(replay.code, 'REPLAY'); assert.equal(replay.replayed, true); assert.equal(replay.request_id, first.request_id); assert.equal(g.sent.length, 2); assert.equal(g.context.trialStore_().read().registrations.length, 1);
});
test('ET-07: native Sheet Date date/time cells convert Toronto winter/summer to UTC through doGet', () => {
  const g = googleContext(), sessions = g.tabs['Disponibilités'].values;
  for (const [index, date, start, end] of [[1, '2030-01-15T05:00:00Z', '2030-01-15T14:00:00Z', '2030-01-15T17:00:00Z'], [2, '2030-07-15T04:00:00Z', '2030-07-15T13:00:00Z', '2030-07-15T16:00:00Z']]) {
    sessions[index][2] = new Date(date); sessions[index][3] = new Date(start); sessions[index][4] = new Date(end);
  }
  const cat = JSON.parse(g.context.doGet({}).text); assert.equal(cat.sessions.length, 2); assert.equal(cat.sessions[0].start_at, '2030-01-15T14:00:00.000Z'); assert.equal(cat.sessions[0].end_at, '2030-01-15T17:00:00.000Z'); assert.equal(cat.sessions[1].start_at, '2030-07-15T13:00:00.000Z'); assert.equal(cat.sessions[1].end_at, '2030-07-15T16:00:00.000Z');
});
test('ET-10: Google adapter enforces fixed TEST workbook and script before Sheets access', () => {
  const g = googleContext(); g.properties.set('ENVIRONMENT', 'PROD');
  const result = JSON.parse(g.context.doGet({ parameter: { environment: 'TEST', spreadsheet_id: 'other' } }).text);
  assert.equal(result.code, 'UNAVAILABLE'); assert.equal(g.events.length, 0);
  g.properties.set('ENVIRONMENT', 'TEST'); g.properties.set('SPREADSHEET_ID', 'wrong'); assert.throws(() => g.context.trialGuard_(), /ENVIRONMENT/);
});
test('ET-04: actual Google adapter tries lock, flushes before release and refuses unavailable lock', () => {
  const g = googleContext(); g.context.trialLock_(() => g.context.SpreadsheetApp.flush()); assert.deepEqual(g.events, ['tryLock', 'flush', 'releaseLock']);
  g.setAcquire(false); assert.throws(() => g.context.trialLock_(() => assert.fail('must not write')), /BUSY/);
});
test('ET-03: Google digest equals Node digest for NFC unicode canonical strings', () => {
  const g = googleContext(), input = 'Été — été ❤️'; const digest = g.context.trialDependencies_().hash(input);
  assert.equal(digest, crypto.createHash('sha256').update(input).digest('hex'));
  const vectors = require('./vectors.json'); assert.equal(g.context.trialDependencies_().hash(vectors.canonical_input), vectors.payload_fingerprint); assert.equal(g.context.trialDependencies_().hash(vectors.session_revision_input), vectors.session_revision);
});
test('ET-10: native software registry read by header, parameter/config separation retained', () => {
  const g = googleContext(); const params = g.context.trialReadParams_({ getSheetByName: name => g.tabs[name] });
  assert.equal(params.softwares[0].id, 'DIV'); assert.equal(params.softwares[0].label, 'Divalto'); assert.equal(params.courriel_avis_tema, 'internal@example.invalid');
  g.tabs['Paramètres'].values[0][1] = 'cle'; assert.throws(() => g.context.trialReadParams_({ getSheetByName: name => g.tabs[name] }), /CONFIG/);
});
test('ET-10: private allowlist checked after replay, before admission; unknown visitor creates no row/mail', () => {
  const g = googleContext(), service = g.context.TemaTrial.createService(g.context.trialDependencies_());
  const c = harness().command(); assert.equal(service.submit({ ...c, courriel: 'outsider@example.invalid' }).code, 'INVALID'); assert.equal(g.tabs.Inscriptions.getLastRow(), 1); assert.equal(g.sent.length, 0);
  // Use server time for a valid fresh command; revision matches identical data.
  c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString();
  const receipt = service.submit(c); assert.equal(receipt.code, 'RECORDED'); assert.equal(g.sent.length, 2);
  g.properties.set('ALLOWED_RECIPIENTS_JSON', '[]'); assert.equal(service.submit(c).code, 'REPLAY'); assert.equal(g.sent.length, 2);
});
test('ET-08: persistent real mail budget never exceeds ten registrations/twenty reserved recipients', () => {
  const g = googleContext();
  for (let i = 0; i < 10; i++) for (const channel of ['participant', 'tema']) assert.equal(g.context.trialReserveMail_(`I-${i}`, channel, 'participant@example.invalid'), null);
  assert.equal(g.context.trialReserveMail_('I-11', 'participant', 'participant@example.invalid'), 'TRIAL_LIMIT');
  const saved = g.properties.get('TRIAL_MAIL_BUDGET_JSON'), budget = JSON.parse(saved); assert.equal(budget.recipients, 20); assert.equal(Object.keys(budget.registrations).length, 10);
  assert.equal(g.context.trialReserveMail_('I-0', 'participant', 'participant@example.invalid'), 'ATTEMPT_RESERVED'); assert.equal(g.properties.get('TRIAL_MAIL_BUDGET_JSON'), saved);
});
test('ET-08/10: no budget consumed for outside address/quota; malformed persisted state fails closed', () => {
  const g = googleContext(); assert.equal(g.context.trialReserveMail_('I-1', 'participant', 'outsider@example.invalid'), 'ALLOWLIST');
  g.setQuota(0); assert.equal(g.context.trialReserveMail_('I-1', 'participant', 'participant@example.invalid'), 'MAIL_QUOTA'); assert.equal(g.properties.has('TRIAL_MAIL_BUDGET_JSON'), false);
  g.setQuota(100); g.properties.set('TRIAL_MAIL_BUDGET_JSON', '{broken'); assert.equal(g.context.trialReserveMail_('I-1', 'participant', 'participant@example.invalid'), 'BUDGET_CONFIG');
});
test('ET-09: reconcile refreshes choices/new IDs/native labels without changing open checkboxes', () => {
  const g = googleContext(); g.tabs.Formations.values.push(['', 'DIMO — Dimo', 'Collage', '', '', '', '', 'Journée', 850, 'À partir de', 6, '', '']);
  g.tabs['Paramètres'].values[1][5] = 'Divalto renommé';
  g.context.reconcileTrial_(); assert.equal(g.tabs.Formations.values[2][0], 'DIMO-COL-002'); assert.equal(g.tabs.Formations.values[2][12], false);
  assert.equal(g.tabs['Disponibilités'].values[1][8], true); assert.ok(!g.events.includes('checkboxes'));
  assert.ok(g.validations.find(v => v.name === 'Formations').rule.choices.includes('DIV — Divalto renommé'));
  assert.ok(g.validations.find(v => v.name === 'Disponibilités').rule.choices.some(v => v.startsWith('DIMO-COL-002 — ')));
  assert.equal(g.tabs.Formations.values[1][1], 'DIV — Divalto renommé');
  const originalId = g.tabs.Formations.values[1][0]; g.tabs.Formations.values[1][2] = 'Titre renommé';
  g.context.reconcileTrial_(); assert.equal(g.tabs.Formations.values[1][0], originalId); assert.equal(g.tabs['Disponibilités'].values[1][1], originalId + ' — Titre renommé'); assert.equal(g.tabs['Disponibilités'].values[2][1], originalId + ' — Titre renommé'); assert.equal(g.tabs['Disponibilités'].values[1][8], true);
});
test('ET-04/09: unchanged reconciliation rewrites no cells/dropdowns/notes; a missed paste and capacity edit are repaired', () => {
  const g = googleContext(); g.context.reconcileTrial_();
  const firstMutations = g.mutations.length, firstProperties = [...g.properties], originalId = g.tabs.Formations.values[1][0];
  assert.ok(firstMutations > 0); assert.match(g.properties.get('TRIAL_ADMIN_DIGEST'), /^[a-f0-9]{64}$/);
  assert.equal(g.context.reconcileTrial_().patches, 0); assert.equal(g.mutations.length, firstMutations); assert.deepEqual([...g.properties], firstProperties);
  g.tabs.Formations.values.push(['', 'DIMO — Dimo', 'Collage manqué', '', '', '', '', 'Journée', 850, 'À partir de', 6, '', '']);
  g.tabs['Disponibilités'].values[1][5] = 4;
  g.context.reconcileTrial_(); assert.equal(g.tabs.Formations.values[2][0], 'DIMO-COL-002'); assert.equal(g.tabs.Formations.values[2][12], false); assert.equal(g.tabs['Disponibilités'].values[1][9], 4); assert.equal(g.tabs['Disponibilités'].values[1][10], ''); assert.equal(g.tabs['Disponibilités'].values[1][8], true); assert.equal(g.tabs.Formations.values[1][0], originalId); assert.equal(g.properties.get('FORMATION_COUNTER'), '2');
  assert.ok(g.validations.at(-1).rule.choices.includes('DIMO-COL-002 — Collage manqué')); assert.ok(g.mutations.length > firstMutations);
  const repairedMutations = g.mutations.length; assert.equal(g.context.reconcileTrial_().patches, 0); assert.equal(g.mutations.length, repairedMutations); assert.equal(g.sent.length, 0);
});
test('ET-04/09: registration/cancellation changes invalidate the checkpoint but mail status updates do not', () => {
  const g = googleContext(), c = harness().command(); c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString();
  g.context.reconcileTrial_(); g.context.doPost(formEvent(c)); g.context.reconcileTrial_(); assert.equal(g.tabs['Disponibilités'].values[1][9], 2);
  const mailColumn = TemaTrial.HEADERS.Inscriptions.indexOf('mail_participant_etat'); g.tabs.Inscriptions.values[1][mailColumn] = 'UNKNOWN';
  const before = g.mutations.length; assert.equal(g.context.reconcileTrial_().patches, 0); assert.equal(g.mutations.length, before);
  g.tabs.Inscriptions.values[1][TemaTrial.HEADERS.Inscriptions.indexOf('statut')] = 'annulee';
  g.context.reconcileTrial_(); assert.equal(g.tabs['Disponibilités'].values[1][9], 3); assert.equal(g.sent.length, 2); assert.equal(g.tabs.Inscriptions.values[1][mailColumn], 'UNKNOWN');
});
test('ET-09: manual computed count/diagnostic overwrites are repaired, then the unchanged run skips', () => {
  const g = googleContext(); g.context.reconcileTrial_();
  for (const [field, wrong] of [['places_restantes', 99], ['etat_validation', 'Diagnostic incorrect']]) {
    const index = TemaTrial.HEADERS['Disponibilités'].indexOf(field), before = g.mutations.length;
    g.tabs['Disponibilités'].values[1][index] = wrong;
    assert.ok(g.context.reconcileTrial_().patches > 0); assert.ok(g.mutations.length > before);
    assert.equal(g.tabs['Disponibilités'].values[1][9], 3); assert.equal(g.tabs['Disponibilités'].values[1][10], '');
    const repaired = g.mutations.length; assert.equal(g.context.reconcileTrial_().patches, 0); assert.equal(g.mutations.length, repaired);
  }
  assert.equal(g.properties.get('FORMATION_COUNTER'), '1'); assert.equal(g.sent.length, 0);
});
test('ET-09: failed flush does not checkpoint unreconciled input and a concurrent edit is not hidden by the cache', () => {
  const g = googleContext(); g.context.reconcileTrial_(); const prior = g.properties.get('TRIAL_ADMIN_DIGEST'), flush = g.context.SpreadsheetApp.flush;
  g.tabs.Formations.values[1][2] = 'Titre modifié'; g.context.SpreadsheetApp.flush = () => { throw Error('flush unavailable'); };
  assert.throws(() => g.context.reconcileTrial_(), /flush unavailable/); assert.equal(g.properties.get('TRIAL_ADMIN_DIGEST'), prior);
  g.context.SpreadsheetApp.flush = () => { g.tabs['Disponibilités'].values[1][5] = 4; flush(); };
  g.context.reconcileTrial_(); assert.equal(g.tabs['Disponibilités'].values[1][9], 3);
  g.context.SpreadsheetApp.flush = flush; g.context.reconcileTrial_(); assert.equal(g.tabs['Disponibilités'].values[1][9], 4);
  const before = g.mutations.length; assert.equal(g.context.reconcileTrial_().patches, 0); assert.equal(g.mutations.length, before);
});
test('ET-09: duplicate stable IDs prevent ambiguous suffix updates; historical snapshots never change', () => {
  const g = googleContext(), c = harness().command(); c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString(); g.context.doPost(formEvent(c));
  const history = structuredClone(g.tabs.Inscriptions.values); const sessionChoice = g.tabs['Disponibilités'].values[1][1];
  g.tabs.Formations.values.push(g.tabs.Formations.values[1].slice()); g.tabs.Formations.values[1][2] = 'Ambiguous'; g.context.reconcileTrial_();
  assert.equal(g.tabs['Disponibilités'].values[1][1], sessionChoice); assert.deepEqual(g.tabs.Inscriptions.values, history);
  assert.match(g.tabs.Formations.getRange(2, 1).getNotes()[0][0], /dupliqué/); assert.match(g.tabs.Formations.getRange(3, 1).getNotes()[0][0], /dupliqué/);
});
test('ET-09: unsafe persisted/imported formation counters stop before allocation or counter mutation', () => {
  for (const imported of [false, true]) {
    const g = googleContext(); g.tabs.Formations.values.push(['', 'DIV — Divalto', 'New', '', '', '', '', 'Journée', 450, '', 3, '', false]);
    if (imported) g.tabs.Formations.values[1][0] = 'DIV-OLD-9007199254740993'; else g.properties.set('FORMATION_COUNTER', '9007199254740993');
    const prior = g.properties.get('FORMATION_COUNTER'); assert.throws(() => g.context.reconcileTrial_(), /COUNTER_RANGE/); assert.equal(g.properties.get('FORMATION_COUNTER'), prior); assert.equal(g.tabs.Formations.values[2][0], '');
  }
  const g = googleContext(); g.properties.set('FORMATION_COUNTER', String(Number.MAX_SAFE_INTEGER)); g.tabs.Formations.values.push(['', 'DIV — Divalto', 'New', '', '', '', '', 'Journée', 450, '', 3, '', false]);
  assert.throws(() => g.context.reconcileTrial_(), /COUNTER_RANGE/); assert.equal(g.properties.get('FORMATION_COUNTER'), String(Number.MAX_SAFE_INTEGER));
});
test('ET-09: editor repair fixes numeric formats/notes/protections idempotently without values, counters or checkbox resets', () => {
  const g = googleContext(), c = harness().command(); c.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString(); g.context.doPost(formEvent(c));
  g.tabs['Disponibilités'].getRange(2, 1, 1, 11).setNumberFormat('@'); g.tabs['Disponibilités'].values[1][5] = '4';
  g.tabs.Formations.values[1][2] = '   '; const before = Object.fromEntries(Object.entries(g.tabs).map(([name, tab]) => [name, structuredClone(tab.values)])), props = [...g.properties];
  const result = g.context.repairTrial(); const protectionCount = Object.values(g.tabs).reduce((n, tab) => n + tab.protections.length, 0); g.context.repairTrial();
  assert.equal(g.tabs['Disponibilités'].getRange(2, 6).getNumberFormat(), '0'); assert.equal(g.tabs['Disponibilités'].getRange(2, 3).getNumberFormat(), '@'); assert.equal(g.tabs.Formations.getRange(2, 9).getNumberFormat(), '0.00'); assert.equal(g.tabs.Formations.getRange(2, 11).getNumberFormat(), '0');
  assert.equal(result.environment, 'TEST'); assert.ok(result.formation_diagnostics > 0); assert.match(g.tabs.Formations.getRange(2, 3).getNotes()[0][0], /Titre requis/);
  for (const column of [5, 7]) assert.ok(g.tabs['Paramètres'].protections.some(p => p.getRange().getColumn() === column && p.getRange().getRow() === 2 && p.warning));
  assert.equal(Object.values(g.tabs).reduce((n, tab) => n + tab.protections.length, 0), protectionCount);
  assert.deepEqual(Object.fromEntries(Object.entries(g.tabs).map(([name, tab]) => [name, tab.values])), before); assert.deepEqual([...g.properties], props); assert.ok(!g.events.includes('checkboxes')); assert.ok(g.logs.every(line => !line.includes('@')));
});
test('ET-09: missing software ID generated once, label rename retains ID, deleted ID not reused', () => {
  const g = googleContext(); g.tabs['Paramètres'].values.push(['', '', '', '', '', 'Nôuveau Outil', '']);
  g.context.reconcileTrial_(); const row = g.tabs['Paramètres'].values.at(-1); assert.equal(row[4], 'NOUVEAUOUTIL');
  row[5] = 'Renommé'; g.context.reconcileTrial_(); assert.equal(row[4], 'NOUVEAUOUTIL');
  row[4] = ''; row[5] = 'Nôuveau Outil'; g.context.reconcileTrial_(); assert.equal(row[4], 'NOUVEAUOUTIL2');
});
test('ET-09/12: private install only empty TEST, preserves native registry/header shape and counters', () => {
  const g = googleContext(true); g.properties.set('TRIAL_MAIL_BUDGET_JSON', JSON.stringify({ version: 1, registrations: { 'I-old': { participant: true } }, recipients: 1 }));
  const result = g.context.installTrial_(); assert.equal(result.formations, 1); assert.equal(result.sessions, 2); assert.equal(g.tabs['Paramètres'].values[0][4], 'id'); assert.equal(g.tabs['Paramètres'].values[1][4], 'DIV'); assert.equal(JSON.parse(g.properties.get('TRIAL_MAIL_BUDGET_JSON')).recipients, 1);
  const installed = g.context.trialStore_().read(); assert.equal(installed.formations.length, 1); assert.equal(installed.sessions.length, 2); g.context.reconcileTrial_(); assert.equal(g.context.trialStore_().read().sessions.length, 2);
  assert.equal(g.tabs.Formations.values[1][12], false); assert.equal(g.tabs['Disponibilités'].values[1][8], false); assert.throws(() => g.context.installTrial_(), /TRIAL_NOT_EMPTY/);
});
test('ET-02/10: HTTP rejects JSON/duplicate form keys and never dispatches admin/fault/reset by URL', () => {
  const g = googleContext();
  const invalid = JSON.parse(g.context.doPost({ postData: { type: 'application/json', contents: '{}' }, parameter: {} }).text); assert.equal(invalid.recording_status, 'unknown');
  const duplicate = JSON.parse(g.context.doPost({ postData: { type: 'application/x-www-form-urlencoded', contents: 'a=b' }, parameter: {}, parameters: { a: ['b', 'c'] } }).text); assert.equal(duplicate.code, 'INVALID');
  const cat = JSON.parse(g.context.doGet({ parameter: { action: 'reset', environment: 'PROD', failMail: 'ALL' } }).text); assert.ok(Array.isArray(cat.sessions)); assert.equal(g.properties.has('TRIAL_SIMULATE_MAIL_FAILURE'), false);
});
module.exports = { googleContext };
