'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { harness, engine, target, local } = require('./copy-helpers.cjs');
const clone = value => JSON.parse(JSON.stringify(value));
test('COPY reads exactly three business tables without Paramètres and ignores a contradictory legacy sheet', () => {
  const h = harness(), requested = [], getSheet = h.book.getSheetByName;
  assert.equal(h.tables['Paramètres'], undefined);
  h.book.getSheetByName = name => { requested.push(name); assert.notEqual(name, 'Paramètres'); return getSheet(name); };
  const before = clone(h.copy.grouped());
  h.copy.nativeRead(h.book);
  assert.deepEqual(requested, ['Formations', 'Disponibilités', 'Inscriptions']);
  h.tables['Paramètres'] = [['cle', 'valeur'], ['politique_version', 'CONTRADICTORY'], ['courriel_contact', 'other@example.invalid']];
  Object.defineProperty(h.sheets, 'Paramètres', { get() { throw Error('Legacy sheet must never be accessed'); } });
  assert.deepEqual(clone(h.copy.grouped()), before);
  const native = h.copy.nativeRead(h.book);
  assert.equal(native.params.politique_version, 'TEST-1');
  assert.equal(native.params.courriel_contact, 'contact@example.invalid');
  native.params.softwares[0].label = 'mutated'; native.params.politique_version = 'mutated';
  assert.equal(h.copy.nativeRead(h.book).params.softwares[0].label, 'Divalto');
  assert.equal(h.copy.store().read().params.politique_version, 'TEST-1');
});
for (const name of ['Formations', 'Disponibilités', 'Inscriptions']) test('missing business sheet still fails CONFIG: ' + name, () => {
  const h = harness(); delete h.sheets[name];
  assert.throws(() => h.copy.nativeRead(h.book), /CONFIG/);
});
for (const count of [2, 4]) test('batch rejects a non-three-table response: ' + count, () => {
  const h = harness(), api = h.context.Sheets.Spreadsheets.Values, batch = api.batchGet;
  api.batchGet = (...args) => { const result = batch(...args); result.valueRanges.length = count; return result; };
  assert.equal(h.copy.grouped().code, 'UNAVAILABLE');
});
test('missing code configuration cannot fall back to a legacy sheet', () => {
  const h = harness(); h.context.TemaCopyConfig = undefined;
  assert.equal(h.copy.grouped().code, 'UNAVAILABLE');
  assert.throws(() => h.copy.nativeRead(h.book), /read/);
});
test('obsolete policy refuses admission without consuming a seat or mail budget', () => {
  const h = harness({ properties: { COPY_MAIL_LIMITS_JSON: '{"registrations":1,"recipients":2}', COPY_MAIL_BUDGET_JSON: '{"registrations":0,"recipients":0}' } });
  const command = h.command({ politique_version: 'TEST-0' }), source = structuredClone(h.tables), mailBudget = h.properties.COPY_MAIL_BUDGET_JSON;
  assert.equal(h.service.submit(command).code, 'POLICY_CHANGED');
  assert.deepEqual(h.tables, source); assert.equal(h.messages.length, 0);
  assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, mailBudget);
});
test('pre-existing historical row retains every cell value and type across candidate reads, admission and replay', () => {
  const h = harness();
  // Seed a former-sheet-era row before any current candidate catalogue/read.
  const oldCommand = { schema_version: 1, request_id: 'b0000000-0000-4000-8000-000000000001', id_cohorte: 'C-COPY-FIXTURE-1', session_revision: 'former-session-revision', prenom: 'Ancien', nom: 'Fictif', entreprise: 'Historique fictif', courriel: 'historical@example.invalid', telephone: null, consentement: true, politique_version: 'FORMER-POLICY-2025', anti_spam: { honeypot: '', form_started_at: '2025-01-01T12:00:00.000Z' } };
  const historical = {
    id_inscription: 'I-HISTORICAL-FICTITIOUS', request_id: oldCommand.request_id, payload_fingerprint: h.deps.hash(engine.fingerprintInput(oldCommand)),
    horodatage: new Date('2025-01-01T12:00:02.000Z'), id_cohorte: oldCommand.id_cohorte, session_revision: oldCommand.session_revision, statut: 'annulee',
    prenom: oldCommand.prenom, nom: oldCommand.nom, entreprise: oldCommand.entreprise, courriel: oldCommand.courriel, telephone: '',
    consentement_loi25: true, consentement_horodatage: new Date('2025-01-01T12:00:02.000Z'), politique_version: oldCommand.politique_version,
    formation_snapshot: JSON.stringify({ id: 'DIV-COPY-FIXTURE', logiciel_id: 'DIV', titre: 'Ancienne formation fictive', duree: '1 jour', prix: 450, prix_qualificatif: '' }),
    debut_snapshot: '2030-01-15T14:00:00.000Z', fin_snapshot: '2030-01-15T17:00:00.000Z', lieu_snapshot: JSON.stringify({ mode: 'en_ligne', adresse_presentiel: null, lien_visio: null }),
    mail_participant_etat: 'SENT', mail_tema_etat: 'SENT', mail_participant_attempt_id: 'former-participant-attempt', mail_participant_attempt_at: '2025-01-01T12:00:03.000Z',
    mail_participant_sent_at: '2025-01-01T12:00:04.000Z', mail_participant_error_code: '', mail_tema_attempt_id: 'former-tema-attempt', mail_tema_attempt_at: '2025-01-01T12:00:05.000Z', mail_tema_sent_at: '2025-01-01T12:00:06.000Z', mail_tema_error_code: ''
  };
  assert.equal(Object.keys(historical).length, engine.HEADERS.Inscriptions.length);
  h.tables.Inscriptions.push(engine.HEADERS.Inscriptions.map(key => historical[key]));
  const before = structuredClone(h.tables.Inscriptions[1]), bytes = require('node:v8').serialize(h.tables.Inscriptions[1]);
  function unchanged() {
    assert.deepEqual(h.tables.Inscriptions[1], before);
    assert.ok(require('node:v8').serialize(h.tables.Inscriptions[1]).equals(bytes));
    assert.equal(h.tables.Inscriptions[1][14], 'FORMER-POLICY-2025');
  }
  h.copy.nativeRead(h.book); h.copy.grouped(); unchanged();
  const command = h.command(); assert.equal(h.service.submit(command).code, 'RECORDED');
  assert.equal(h.tables.Inscriptions[2][14], 'TEST-1'); unchanged();
  assert.equal(h.service.submit(oldCommand).code, 'REPLAY'); unchanged();
  assert.equal(h.service.submit(command).code, 'REPLAY'); unchanged();
  assert.equal(h.tables.Inscriptions.length, 3); assert.equal(h.messages.length, 0);
});
test('administrative choices and formation/session preparation work without Paramètres', () => {
  const h = harness(); h.loadAdmin();
  const actions = h.context.TemaAdminActions, options = clone(actions.options(h.book));
  assert.deepEqual(options.map(s => [s.code, s.label]), [['DIV', 'Divalto'], ['DIMO', 'Dimo'], ['MOOV', 'MoovApps']]);
  assert.equal(options[0].formations[0].id, 'DIV-COPY-FIXTURE');
  const deps = { uuid: h.nextUuid, now: () => h.state.now, confirmed: {}, formatLocal: local, cellText: v => String(v) };
  const formation = actions.prepare(h.tables.Formations, h.tables['Disponibilités'], { kind: 'formation', requestId: h.nextUuid(), software: 'MOOV', title: 'ESSAI configuration code', duration: '1 jour', price: '0', published: true }, deps);
  assert.equal(formation.code, 'MOOV'); assert.equal(formation.rows[0][1], 'MOOV — MoovApps');
  const sessions = actions.prepare(h.tables.Formations, h.tables['Disponibilités'], { kind: 'sessions', requestId: h.nextUuid(), formationId: 'DIV-COPY-FIXTURE', open: true, dates: [{ date: '2030-01-16', start: '09:00', end: '12:00', capacity: '3', mode: 'en_ligne', venue: '' }] }, deps);
  assert.equal(sessions.code, 'DIV'); assert.equal(sessions.rows[0][9], 3);
});
test('COPY batch and native produce the identical public contract, sections excluded and physical rows retained', () => {
  const h = harness(), native = engine.publicCatalogue(h.copy.nativeRead(h.book), h.deps), batch = h.copy.grouped();
  assert.equal(native.formations.length, 2); assert.equal(native.sessions.length, 2); assert.deepEqual(clone(batch), clone(native));
  assert.equal(h.copy.nativeRead(h.book).sessions[1]._sheetRow, 5);
  assert.ok(!JSON.stringify(batch).includes('ALLOWED_RECIPIENTS')); assert.ok(!JSON.stringify(batch).includes('internal@example.invalid'));
});
for (const field of ['ENVIRONMENT', 'SPREADSHEET_ID', 'script']) test('COPY guard rejects wrong ' + field + ' before access or mutation', () => {
  const h = harness(); if (field === 'script') h.state.script = 'other'; else h.properties[field] = field === 'ENVIRONMENT' ? 'TEST' : 'other';
  assert.equal(h.copy.grouped().code, 'UNAVAILABLE'); assert.throws(() => h.copy.nativeRead(h.book), /ENVIRONMENT/); assert.equal(h.state.opened, 0); assert.equal(h.events.length, 0);
});
test('reordered named headers decode and write registrations using physical columns', () => {
  const h = harness();
  for (const name of ['Formations', 'Disponibilités', 'Inscriptions']) h.tables[name].forEach(r => [r[0], r[5]] = [r[5], r[0]]);
  assert.equal(h.service.catalogue().sessions.length, 2);
  const receipt = h.service.submit(h.command()); assert.equal(receipt.code, 'RECORDED');
  const values = h.tables.Inscriptions, c = values[0].indexOf('id_cohorte'); assert.equal(values[1][c], 'C-COPY-FIXTURE-1');
  assert.equal(h.tables['Disponibilités'][1][9], 0);
  h.loadAdmin(); const before = JSON.stringify(h.tables); assert.throws(() => h.context.TemaSheetPrototype.sync(h.book), /Colonnes déplacées/); assert.equal(JSON.stringify(h.tables), before);
});
for (const corruption of ['missing section', 'duplicate header', 'wrong software', 'wrong session section', 'duplicate id', 'extra registration column']) test('ambiguous schema fails closed: ' + corruption, () => {
  const h = harness();
  if (corruption === 'missing section') h.tables.Formations.pop();
  if (corruption === 'duplicate header') h.tables.Formations[0][3] = 'Durée';
  if (corruption === 'wrong software') h.tables.Formations[1][1] = 'DIMO — Dimo';
  if (corruption === 'wrong session section') h.tables['Disponibilités'][1][1] = 'DIMO-COPY-FIXTURE — ESSAI COPY — été';
  if (corruption === 'duplicate id') h.tables.Formations[4][0] = h.tables.Formations[1][0];
  if (corruption === 'extra registration column') h.tables.Inscriptions[0].push('extra');
  assert.equal(h.copy.grouped().code, 'UNAVAILABLE'); assert.equal(h.events.length, 0);
});
test('typed numeric dates and times match native Dates including seconds truncated within the same minute', () => {
  const h = harness(), s = h.tables['Disponibilités'][1];
  s[2] = (Date.parse('2030-01-15T00:00:00Z') - Date.UTC(1899, 11, 30)) / 86400000; s[3] = (9 * 3600 + 59) / 86400; s[4] = .5;
  h.formats['Disponibilités'][1][2] = 'yyyy-mm-dd'; h.formats['Disponibilités'][1][3] = 'hh:mm'; h.formats['Disponibilités'][1][4] = 'hh:mm';
  const batch = h.copy.grouped(); assert.equal(batch.sessions[0].start_at, '2030-01-15T14:00:00.000Z');
  s[2] = new Date('2030-01-15T05:00:00Z'); s[3] = new Date('2030-01-15T14:00:59Z'); s[4] = new Date('2030-01-15T17:00:00Z');
  assert.deepEqual(clone(engine.publicCatalogue(h.copy.nativeRead(h.book), h.deps)), clone(batch));
});
test('format read excludes preformatted empty rows while retaining every numeric temporal cell', () => {
  const h = harness(), s = h.tables['Disponibilités'][1];
  s[2] = 47499; s[3] = 9 / 24; s[4] = .5;
  h.formats['Disponibilités'][1][2] = 'yyyy-mm-dd'; h.formats['Disponibilités'][1][3] = 'hh:mm'; h.formats['Disponibilités'][1][4] = 'hh:mm';
  for (let i = 0; i < 1000; i++) h.tables['Disponibilités'].push(['', '', '', '', '', '', '', '', false]);
  const original = h.context.Sheets.Spreadsheets.get;
  h.context.Sheets.Spreadsheets.get = (id, options) => {
    assert.deepEqual(Array.from(options.ranges), ["'Disponibilités'!A1:E2"]);
    const result = original(id); result.sheets[0].data[0].rowData.length = 2; return result;
  };
  const catalogue = h.copy.grouped(); assert.equal(catalogue.sessions.length, 2);
  h.formats['Disponibilités'][1][2] = '0.00';
  assert.equal(h.copy.grouped().code, 'UNAVAILABLE');
});
test('bounded format range follows moved temporal columns and a later section', () => {
  const h = harness(), values = h.tables['Disponibilités'];
  for (let i = 0; i < values.length; i++) {
    values[i][28] = values[i][2]; values[i][2] = '';
    h.formats['Disponibilités'][i][28] = h.formats['Disponibilités'][i][2];
  }
  values[4][28] = 47680; h.formats['Disponibilités'][4][28] = 'yyyy-mm-dd';
  const original = h.context.Sheets.Spreadsheets.get;
  h.context.Sheets.Spreadsheets.get = (id, options) => {
    assert.deepEqual(Array.from(options.ranges), ["'Disponibilités'!A1:AC5"]); return original(id);
  };
  assert.equal(h.copy.grouped().sessions.length, 2);
});
test('native Dates and strings do not load preformatted number formats', () => {
  const h = harness(), sheet = h.sheets['Disponibilités'], original = sheet.getDataRange;
  const s = h.tables['Disponibilités'][1];
  s[2] = new Date('2030-01-15T05:00:00Z'); s[3] = new Date('2030-01-15T14:00:00Z'); s[4] = new Date('2030-01-15T17:00:00Z');
  sheet.getDataRange = () => { const range = original(); range.getNumberFormats = () => { throw Error('Unbounded format read'); }; return range; };
  assert.equal(engine.publicCatalogue(h.copy.nativeRead(h.book), h.deps).sessions.length, 2);
});
test('native numeric formats are bounded and independently attest the native reader', () => {
  const h = harness(), s = h.tables['Disponibilités'][1], sheet = h.sheets['Disponibilités'], getRange = sheet.getRange;
  s[2] = 47499; s[3] = 9 / 24; s[4] = .5;
  h.formats['Disponibilités'][1].splice(2, 3, 'yyyy-mm-dd', 'hh:mm', 'hh:mm');
  let formats = 0;
  sheet.getRange = (...args) => { assert.deepEqual(args, [1, 1, 2, 5]); formats++; return getRange(...args); };
  assert.equal(h.copy.nativeRead(h.book).sessions[0].heure_debut, '09:00'); assert.equal(formats, 1);
  h.formats['Disponibilités'][1][2] = '0.00'; assert.throws(() => h.copy.nativeRead(h.book), /CONFIG/);
});
test('API snapshots are independent, typed, and hide native values until flush', () => {
  const h = harness(), api = h.context.Sheets.Spreadsheets.Values, settings = { ranges: ["'Formations'", "'Disponibilités'", "'Inscriptions'"], valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER' };
  h.tables['Disponibilités'][1][2] = new Date('2030-01-15T05:00:00Z');
  const before = api.batchGet(target.spreadsheet, settings).valueRanges;
  assert.equal(typeof before[1].values[1][2], 'number'); assert.equal(typeof before[0].values[1][8], 'number');
  assert.equal(typeof api.batchGet(target.spreadsheet, { ...settings, valueRenderOption: 'FORMATTED_VALUE' }).valueRanges[0].values[1][8], 'string');
  before[0].values[1][8] = 999; assert.equal(h.tables.Formations[1][8], 450);
  h.copy.lock(() => {
    h.sheets.Formations.getRange(2, 9).setValue(500);
    assert.equal(api.batchGet(target.spreadsheet, settings).valueRanges[0].values[1][8], 450);
    h.context.SpreadsheetApp.flush();
    assert.equal(api.batchGet(target.spreadsheet, settings).valueRanges[0].values[1][8], 500);
  });
});
for (const key of ['date', 'heure_debut', 'heure_fin']) test('an untyped numeric ' + key + ' is unavailable and cannot admit', () => {
  const h = harness(), c = h.command(); h.tables['Disponibilités'][1][engine.HEADERS['Disponibilités'].indexOf(key)] = .5;
  assert.equal(h.copy.grouped().code, 'UNAVAILABLE'); assert.equal(h.service.register(c).code, 'UNAVAILABLE'); assert.equal(h.tables.Inscriptions.length, 1);
});
for (const [date, time] of [['2030-03-10', '02:30'], ['2030-11-03', '01:30']]) test('DST nonexistent or ambiguous local instant does not appear or admit: ' + date, () => {
  const h = harness(), command = h.command(); h.tables['Disponibilités'][1][2] = date; h.tables['Disponibilités'][1][3] = time;
  assert.ok(!h.copy.grouped().sessions.some(s => s.id_cohorte === command.id_cohorte)); assert.equal(h.service.register(command).code, 'NOT_FOUND');
});
test('budget absent or zero: durable admission, blocked sends, same UUID replays and changed payload conflicts', () => {
  const h = harness(), c = h.command(), result = h.service.submit(c);
  assert.equal(result.code, 'RECORDED'); assert.equal(result.mail_status, 'BLOCKED'); assert.equal(h.messages.length, 0); assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, undefined);
  assert.equal(h.service.submit(c).code, 'REPLAY'); assert.equal(h.service.submit({ ...c, nom: 'Autre fixture' }).code, 'RETRY_CONFLICT'); assert.equal(h.tables.Inscriptions.length, 2);
  assert.equal(h.tables['Disponibilités'][1][9], 0); assert.ok(h.properties.COPY_SOURCE_VERSION); assert.notEqual(h.properties.COPY_SOURCE_VERSION, h.properties.COPY_VIEW_VERSION);
});
test('new admissions require private allowlist; replay precedes missing allowlist and mutable rules', () => {
  const h = harness(), c = h.command(); assert.equal(h.service.submit({ ...c, courriel: 'outside@example.invalid' }).code, 'INVALID'); assert.equal(h.tables.Inscriptions.length, 1);
  assert.equal(h.service.submit(c).code, 'RECORDED'); delete h.properties.ALLOWED_RECIPIENTS_JSON; h.tables['Disponibilités'][1][8] = false;
  assert.equal(h.service.submit(c).code, 'REPLAY'); assert.equal(h.service.submit({ ...c, prenom: 'Changed' }).code, 'RETRY_CONFLICT'); assert.equal(h.messages.length, 0);
});
test('mail reservation is persistent, bounded and never retried on replay', () => {
  const h = harness({ properties: { COPY_MAIL_LIMITS_JSON: '{"registrations":1,"recipients":2}' } }), c = h.command();
  assert.equal(h.service.submit(c).mail_status, 'SENT'); assert.equal(h.messages.length, 2); const saved = h.properties.COPY_MAIL_BUDGET_JSON;
  assert.equal(JSON.parse(saved).recipients, 2); assert.equal(h.service.submit(c).code, 'REPLAY'); assert.equal(h.messages.length, 2); assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, saved);
  h.copy.lock(() => assert.equal(h.copy.reserveMail('new', 'participant', 'participant@example.invalid'), 'COPY_LIMIT')); assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, saved);
});
test('admission reads use the typed API and native writes flush before fresh reads and counters', () => {
  const h = harness({ properties: { COPY_MAIL_LIMITS_JSON: '{"registrations":1,"recipients":2}' } });
  h.tables['Disponibilités'][1].splice(2, 3, new Date('2030-01-15T05:00:00Z'), new Date('2030-01-15T14:00:00Z'), new Date('2030-01-15T17:00:00Z'));
  h.formats['Disponibilités'][1].splice(2, 3, 'yyyy-mm-dd', 'hh:mm', 'hh:mm');
  const c = h.command();
  let flushed = 0, reads = 0;
  const flush = h.context.SpreadsheetApp.flush;
  h.context.SpreadsheetApp.flush = () => { flush(); flushed = h.events.length; };
  const original = h.context.Sheets.Spreadsheets.Values.batchGet;
  h.context.Sheets.Spreadsheets.Values.batchGet = (id, options) => {
    assert.equal(options.valueRenderOption, 'UNFORMATTED_VALUE'); assert.equal(options.dateTimeRenderOption, 'SERIAL_NUMBER');
    assert.ok(!h.events.slice(flushed).some(e => e[0] === 'write'), 'Native changes must reach Sheets before API reread');
    reads++; return original(id, options);
  };
  for (const sheet of Object.values(h.sheets)) sheet.getDataRange = () => { throw Error('Unbounded native source read in admission'); };
  assert.equal(h.service.submit(c).code, 'RECORDED');
  assert.equal(h.tables['Disponibilités'][1][9], 0); assert.equal(h.messages.length, 2); assert.ok(reads > 1);
  assert.equal(h.service.submit(c).code, 'REPLAY'); assert.equal(h.messages.length, 2);
});
test('a failed fresh typed read cannot create an admission or consume a mail reservation', () => {
  const h = harness(), c = h.command();
  h.context.Sheets.Spreadsheets.Values.batchGet = () => { throw Error('Google unavailable'); };
  assert.equal(h.service.submit(c).code, 'UNAVAILABLE'); assert.equal(h.tables.Inscriptions.length, 1); assert.equal(h.messages.length, 0); assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, undefined);
});
for (const phase of ['admission snapshot', 'admission format']) test('failure at the fresh ' + phase + ' cannot admit', () => {
  const h = harness(); h.tables['Disponibilités'][1][2] = 47499; h.formats['Disponibilités'][1][2] = 'yyyy-mm-dd';
  const c = h.command(); let count = 0;
  const owner = phase === 'admission snapshot' ? h.context.Sheets.Spreadsheets.Values : h.context.Sheets.Spreadsheets;
  const key = phase === 'admission snapshot' ? 'batchGet' : 'get', original = owner[key];
  owner[key] = (...args) => { if (++count === 2) throw Error('Fresh Google read failed'); return original(...args); };
  assert.equal(h.service.submit(c).code, 'UNAVAILABLE'); assert.equal(h.tables.Inscriptions.length, 1); assert.equal(h.messages.length, 0);
});
test('counter read failure after insertion preserves admission and replay; reconciliation repairs capacity', () => {
  const h = harness(), c = h.command(), original = h.context.Sheets.Spreadsheets.Values.batchGet; let calls = 0;
  h.context.Sheets.Spreadsheets.Values.batchGet = (...args) => { if (++calls === 3) throw Error('Counter read unavailable'); return original(...args); };
  assert.equal(h.service.submit(c).code, 'RECORDED'); assert.equal(h.tables.Inscriptions.length, 2); assert.equal(h.tables['Disponibilités'][1][9], 1);
  assert.equal(h.service.submit(c).code, 'REPLAY'); assert.equal(h.tables.Inscriptions.length, 2); assert.equal(h.messages.length, 0);
  h.copy.lock(() => h.copy.counters(h.book)); assert.equal(h.tables['Disponibilités'][1][9], 0);
});
test('an optional empty twelfth column does not dirty an unchanged five-minute audit', () => {
  const h = harness(); h.tables['Disponibilités'].forEach(r => { r.length = 11; });
  const sources = h.copy.assertAdministrativeLayout(h.book); assert.ok(sources.sessions.every(r => r.length === 12));
  h.properties.COPY_SOURCE_VERSION = 'clean'; h.properties.COPY_VIEW_VERSION = 'clean';
  h.properties.COPY_VIEW_SOURCE_HASH = h.copy.sourceHash(sources); h.properties.COPY_VIEW_NEXT_CHANGE_AT = String(h.state.now + 600000); h.properties.COPY_AUDIT_AT = '0';
  assert.equal(h.copy.reconcile(), true); assert.equal(h.properties.COPY_SOURCE_VERSION, 'clean'); assert.equal(h.events.length, 0);
});
test('disallowed internal recipient blocks only mail and preserves the admitted line', () => {
  const h = harness({ properties: { COPY_MAIL_LIMITS_JSON: '{"registrations":1,"recipients":2}', ALLOWED_RECIPIENTS_JSON: '["participant@example.invalid"]' } });
  const c = h.command(), result = h.service.submit(c); assert.equal(result.code, 'RECORDED'); assert.equal(h.messages.length, 1);
  const r = h.copy.nativeRead(h.book).registrations[0]; assert.equal(r.mail_tema_etat, 'BLOCKED'); assert.equal(r.mail_tema_error_code, 'ALLOWLIST');
});
test('daily quota and mail failures never revoke the admitted place', () => {
  for (const options of [{ quota: 0 }, { failMail: true }]) {
    const h = harness({ ...options, properties: { COPY_MAIL_LIMITS_JSON: '{"registrations":1,"recipients":2}' } }), result = h.service.submit(h.command());
    assert.equal(result.code, 'RECORDED'); assert.equal(result.reservation_status, 'confirmee'); assert.equal(result.mail_status, options.failMail ? 'FAILED' : 'BLOCKED'); assert.equal(h.tables.Inscriptions.length, 2);
  }
});
test('last seat is serialized, BUSY is retryable and no second line is admitted', () => {
  const h = harness(), c = h.command(), second = h.command({ courriel: 'second@example.invalid' });
  h.state.source = true; assert.equal(h.service.register(c).code, 'BUSY'); h.state.source = false;
  assert.equal(h.service.register(c).code, 'RECORDED'); assert.equal(h.service.register(second).code, 'FULL'); assert.equal(h.tables.Inscriptions.length, 2);
  assert.equal(h.events.filter(e => e[0] === 'source-lock').length, h.events.filter(e => e[0] === 'source-unlock').length);
});
test('cancellation frees derived capacity without deleting or reactivating the original request', () => {
  const h = harness(), c = h.command(); h.service.submit(c); const id = h.copy.nativeRead(h.book).registrations[0].id_inscription;
  h.copy.lock(() => { h.copy.store().patch(id, { statut: 'annulee' }); h.copy.counters(h.book); });
  assert.equal(h.tables['Disponibilités'][1][9], 1); const replay = h.service.submit(c); assert.equal(replay.code, 'REPLAY'); assert.equal(replay.reservation_status, 'annulee'); assert.equal(h.tables.Inscriptions.length, 2);
});
test('formula-looking fields are written as inert text and personal data never enters public output', () => {
  const h = harness(), c = h.command({ prenom: '=IMPORTXML("https://example.invalid")', entreprise: '  +1+2' }); assert.equal(h.service.register(c).code, 'RECORDED');
  const publicData = JSON.stringify(h.copy.grouped()); assert.ok(!publicData.includes('IMPORTXML')); assert.ok(!publicData.includes('participant@example.invalid'));
  assert.equal(engine.inertCell(c.prenom)[0], "'"); assert.equal(engine.inertCell(c.entreprise)[0], "'");
});
test('private rate budget applies to new commands only, no reset by build or replay', () => {
  const h = harness(); for (let i = 0; i < 3; i++) assert.equal(h.service.register(h.command({ consentement: false })).code, 'CONSENT_REQUIRED');
  const saved = h.properties.COPY_RATE_BUDGET_JSON; assert.equal(h.service.register(h.command()).message_key, 'rate_limited'); assert.equal(h.properties.COPY_RATE_BUDGET_JSON, saved);
});
test('same session revision protects changed conditions, closure, full and missing consent', () => {
  for (const [mutate, code] of [[h => { h.tables.Formations[1][8] = 500; }, 'SESSION_CHANGED'], [h => { h.tables['Disponibilités'][1][8] = false; }, 'CLOSED'], [() => {}, 'CONSENT_REQUIRED']]) {
    const h = harness(), c = h.command(); mutate(h); if (code === 'CONSENT_REQUIRED') c.consentement = false;
    assert.equal(h.service.register(c).code, code); assert.equal(h.tables.Inscriptions.length, 1);
  }
});
test('minute reconciliation is a true no-op when clean; owner unknown never acquits and trigger installation is idempotent', () => {
  const h = harness(); h.properties.COPY_SOURCE_VERSION = 'clean'; h.properties.COPY_VIEW_VERSION = 'clean'; h.context.TemaSheetPrototype = { sync() { throw Error('No source read on clean minute'); } };
  h.properties.COPY_AUDIT_AT = String(h.state.now + 300000); h.properties.COPY_VIEW_NEXT_CHANGE_AT = String(h.state.now + 600000);
  assert.equal(h.copy.reconcile(), true); assert.equal(h.state.opened, 0); assert.equal(h.state.calls, 0); assert.equal(h.events.length, 0);
  h.state.owner = ''; assert.equal(h.copy.isOwner(), false); assert.throws(() => h.copy.installTrigger(), /PRIVATE_CONFIG/); h.state.owner = h.properties.COPY_OWNER_EMAIL;
  const triggers = [], script = h.context.ScriptApp; script.getProjectTriggers = () => triggers; script.newTrigger = handler => ({ timeBased() { return this; }, everyMinutes(n) { assert.equal(n, 1); return this; }, create() { const t = { getHandlerFunction: () => handler }; triggers.push(t); return t; } }); script.deleteTrigger = t => triggers.splice(triggers.indexOf(t), 1);
  h.copy.installTrigger(); h.copy.installTrigger(); assert.equal(triggers.length, 1);
});
test('native currency formats are never temporal attestations', () => {
  for (const format of ['0.00 [$CAD]', '0.00 USD', '0.00 "days"']) {
    const h = harness(); h.tables['Disponibilités'][1][2] = 47499; h.formats['Disponibilités'][1][2] = format;
    const metadata = h.context.Sheets.Spreadsheets.get;
    h.context.Sheets.Spreadsheets.get = id => { const result = metadata(id); result.sheets[0].data[0].rowData[1].values[2].effectiveFormat.numberFormat.type = 'NUMBER'; return result; };
    assert.throws(() => h.copy.nativeRead(h.book), /CONFIG/); assert.equal(h.copy.grouped().code, 'UNAVAILABLE');
  }
});
test('real modules: admission, pending notice, dirty minute, rendered participant and clean acknowledgement', () => {
  const h = harness({ view: true }); h.loadAdmin();
  const receipt = h.service.submit(h.command()); assert.equal(receipt.code, 'RECORDED');
  assert.match(h.tables['Suivi des inscriptions'][11][1], /Mise à jour en attente/);
  assert.notEqual(h.properties.COPY_SOURCE_VERSION, h.properties.COPY_VIEW_VERSION);
  assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(h.properties.COPY_SOURCE_VERSION, h.properties.COPY_VIEW_VERSION);
  const view = h.tables['Suivi des inscriptions']; assert.equal(view[5][2], 1); assert.equal(view[5][4], 8);
  assert.ok(view.slice(14).flat().some(v => String(v).includes('ESSAI COPY Fictif')));
  const before = JSON.stringify(h.tables), writes = h.events.length, reads = h.state.calls;
  assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(JSON.stringify(h.tables), before); assert.equal(h.events.length, writes); assert.equal(h.state.calls, reads);
});
test('missed edit and structural deletion are detected by bounded audit; time boundary invalidates clean view', () => {
  const h = harness({ view: true }); h.loadAdmin(); h.service.submit(h.command()); assert.equal(h.context.reconcilierCopieTema(), true);
  h.tables.Inscriptions[1][6] = 'annulee'; // édition dont l’événement a été manqué
  h.state.now += 300001; assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(h.tables['Suivi des inscriptions'][5][2], 0); assert.equal(h.tables['Suivi des inscriptions'][5][3], 1);
  h.tables['Disponibilités'].splice(4, 1); h.state.now += 300001; assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(h.tables['Suivi des inscriptions'][5][1], 1);
  h.tables['Suivi des inscriptions'][9][1] = 'À venir';
  assert.equal(h.context.TemaRegistrationView.refresh(h.book, false), true);
  h.state.now = Date.parse('2030-01-15T14:00:01Z'); assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(h.tables['Suivi des inscriptions'][5][1], 0);
});
test('a human edit is invalidated even while the source lock is busy', () => {
  const h = harness({ view: true }); h.loadAdmin(); h.properties.COPY_SOURCE_VERSION = 'clean'; h.properties.COPY_VIEW_VERSION = 'clean';
  h.state.source = true;
  h.context.onEdit({ source: h.book, range: { getSheet: () => h.sheets.Formations, getRow: () => 2, getLastRow: () => 2 } });
  assert.notEqual(h.properties.COPY_SOURCE_VERSION, 'clean'); assert.equal(h.state.source, true);
  h.state.source = false; assert.equal(h.context.reconcilierCopieTema(), true);
});
test('a session starting during rendering retains its expired deadline and is reclassified on the next minute', () => {
  const h = harness({ view: true }); h.loadAdmin(); h.tables['Suivi des inscriptions'][9][1] = 'À venir';
  h.state.now = Date.parse('2030-01-15T13:59:59Z');
  let advanced = false;
  h.context.SpreadsheetApp.flush = () => { if (!advanced && h.state.user && h.tables['Suivi des inscriptions'].slice(14).flat().some(v => String(v).includes('ESSAI COPY'))) { advanced = true; h.state.now += 2000; } };
  assert.equal(h.context.reconcilierCopieTema(), true);
  assert.ok(Number(h.properties.COPY_VIEW_NEXT_CHANGE_AT) <= h.state.now);
  assert.equal(h.tables['Suivi des inscriptions'][5][1], 2);
  assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(h.tables['Suivi des inscriptions'][5][1], 1);
});
test('view acknowledgement is serialized and cannot accept a dirty or changed source', () => {
  const h = harness(); h.properties.COPY_SOURCE_VERSION = 'v1';
  assert.equal(h.copy.acknowledge('v1', () => false), false); assert.equal(h.properties.COPY_VIEW_VERSION, undefined);
  assert.equal(h.copy.acknowledge('old', () => true), false); assert.equal(h.copy.acknowledge('v1', () => true), true); assert.equal(h.properties.COPY_VIEW_VERSION, 'v1');
});
test('HTTP guards reject duplicate fields, oversized data, wrong media type and wrong environment', () => {
  const h = harness(), event = { postData: { type: 'application/x-www-form-urlencoded', contents: '' }, parameter: {}, parameters: { x: ['one', 'two'] } };
  assert.equal(JSON.parse(h.context.doPost(event).value).code, 'INVALID'); event.parameters = {}; event.postData.contents = 'x'.repeat(16385); assert.equal(JSON.parse(h.context.doPost(event).value).code, 'INVALID'); event.postData.contents = ''; event.postData.type = 'application/json'; assert.equal(JSON.parse(h.context.doPost(event).value).code, 'INVALID'); h.properties.ENVIRONMENT = 'PROD'; assert.equal(JSON.parse(h.context.doPost(event).value).code, 'UNAVAILABLE'); assert.equal(h.events.length, 0);
});
test('installer requests all missing granular permissions before any trigger mutation', () => {
  const h = harness(); h.context.ScriptApp.requireAllScopes = () => { throw Error('CONSENT_REQUIRED'); };
  assert.throws(() => h.copy.installTrigger(), /CONSENT_REQUIRED/); assert.equal(h.events.length, 0);
});
function nativeCancellationFixture() {
  const h = harness({ view: true }); h.loadAdmin();
  const receipt = h.service.register(h.command()); assert.equal(receipt.code, 'RECORDED');
  assert.equal(h.context.reconcilierCopieTema(), true);
  h.context.SpreadsheetApp.getUi = () => ({ ButtonSet: { YES_NO: 'YES_NO' }, Button: { YES: 'YES' }, alert(title, prompt) { assert.equal(h.state.source, false); assert.equal(h.state.user, false); assert.match(prompt, /15 janvier 2030 à 09:00 \(Montréal\)/); assert.match(prompt, /places disponibles seront recalculées/); assert.doesNotMatch(prompt, /T14:00|place libérée/); return 'YES'; } });
  const toasts = []; h.book.toast = message => toasts.push(message);
  function cancel() {
    const view = h.tables['Suivi des inscriptions'], row = view.findIndex(r => r[3] === 'participant@example.invalid') + 1;
    assert.ok(row >= 15); view[row - 1][4] = 'Annulée';
    h.context.onEdit({ source: h.book, range: h.sheets['Suivi des inscriptions'].getRange(row, 5), value: 'Annulée', oldValue: 'Confirmée' });
  }
  return { ...h, cancel, toasts };
}
test('bound onEdit native cancellation never calls Advanced Sheets; exact cohort capacity and mail preserved', () => {
  const h = nativeCancellationFixture(), before = structuredClone(h.tables.Inscriptions), budget = h.properties.COPY_MAIL_BUDGET_JSON;
  h.context.Sheets = new Proxy({}, { get() { throw Error('Advanced Sheets forbidden from simple trigger'); } });
  h.cancel(); assert.equal(h.tables.Inscriptions[1][6], 'annulee'); assert.equal(h.tables['Disponibilités'][1][9], 1);
  before[1][6] = 'annulee'; assert.deepEqual(h.tables.Inscriptions, before); assert.equal(h.messages.length, 0); assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, budget); assert.match(h.toasts.at(-1), /Places disponibles recalculées/);
});
for (const repair of ['menu', 'reconcile']) test('real controller: isolated counter failure, successful refresh, then ' + repair + ' repairs stored places', () => {
  const h = nativeCancellationFixture(), originalRange = h.sheets['Disponibilités'].getRange;
  const before = structuredClone(h.tables.Inscriptions), beforeBudget = h.properties.COPY_MAIL_BUDGET_JSON;
  let failures = 0;
  h.sheets['Disponibilités'].getRange = (...args) => {
    const range = originalRange(...args), set = range.setValues;
    range.setValues = values => { if (args[0] === 2 && args[1] === 10 && failures++ === 0) throw Error('only counter write failed'); return set(values); }; return range;
  };
  h.cancel(); assert.equal(h.tables.Inscriptions[1][6], 'annulee'); assert.equal(h.tables['Disponibilités'][1][9], 0);
  // Real refresh succeeded, displayed the cancellation, and kept capacity repair dirty.
  assert.equal(h.tables['Suivi des inscriptions'][5][3], 1); assert.match(h.tables['Suivi des inscriptions'][11][1], /Contexte vérifié/);
  assert.equal(h.properties.COPY_NATIVE_COUNTERS_PENDING, '1'); assert.notEqual(h.properties.COPY_SOURCE_VERSION, h.properties.COPY_VIEW_VERSION);
  if (repair === 'menu') h.context.actualiserLeSuiviInscriptions(); else assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(h.tables['Disponibilités'][1][9], 1); assert.equal(h.properties.COPY_NATIVE_COUNTERS_PENDING, '0'); assert.equal(h.properties.COPY_SOURCE_VERSION, h.properties.COPY_VIEW_VERSION);
  before[1][6] = 'annulee'; assert.deepEqual(h.tables.Inscriptions, before); assert.equal(h.messages.length, 0); assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, beforeBudget);
});
for (const variant of ['historical', 'overcapacity']) test(variant + ': cancel and recalculate without promising an available seat', () => {
  const h = nativeCancellationFixture();
  if (variant === 'historical') h.tables['Disponibilités'].splice(1, 1);
  else {
    const extra = h.tables.Inscriptions[1].slice(); extra[0] = 'other-stable-id'; extra[1] = 'other-request'; extra[10] = 'another@example.invalid'; h.tables.Inscriptions.push(extra);
    h.copy.lock(() => h.copy.nativeCounters(h.book)); assert.equal(h.tables['Disponibilités'][1][9], 0);
  }
  assert.equal(h.context.TemaRegistrationView.refresh(h.book, false), true);
  h.cancel(); assert.equal(h.tables.Inscriptions[1][6], 'annulee');
  if (variant === 'overcapacity') assert.equal(h.tables['Disponibilités'][1][9], 0);
  assert.match(h.toasts.at(-1), /Annulation enregistrée.*Places disponibles recalculées/); assert.doesNotMatch(h.toasts.at(-1), /place libérée|une place|Place recalculée/);
});
for (const mode of ['simple', 'menu', 'reconcile']) test('slow tracking render preserves short simple-trigger budget and supports ' + mode + ' recovery', () => {
  const h = nativeCancellationFixture(), sheet = h.sheets['Suivi des inscriptions'], getRange = sheet.getRange;
  let delayed = false;
  sheet.getRange = (...args) => {
    const r = getRange(...args), apply = r.setBackgrounds;
    r.setBackgrounds = values => { if (!delayed) { delayed = true; h.state.now += 30000; } return apply(values); }; return r;
  };
  if (mode === 'simple') {
    assert.throws(() => h.context.TemaRegistrationView.refresh(h.book, false), /budget de reprise/);
    assert.equal(h.tables['Suivi des inscriptions'][5][2], '');
  } else {
    if (mode === 'menu') assert.equal(h.context.actualiserLeSuiviInscriptions(), undefined);
    else { h.copy.dirty(); assert.equal(h.context.reconcilierCopieTema(), true); }
    assert.match(h.tables['Suivi des inscriptions'][11][1], /Contexte vérifié/);
  }
  assert.equal(h.tables.Inscriptions[1][6], 'confirmee'); assert.equal(h.messages.length, 0);
});

test('demo admits a new participant address, mails it once and preserves internal allowlist and budget',()=>{
 const h=harness({config:{admissions_mode:'demo'},properties:{COPY_MAIL_LIMITS_JSON:'{"registrations":1,"recipients":2}'}}),c=h.command({courriel:'new-demo@example.invalid'});
 const r=h.service.submit(c);assert.equal(r.code,'RECORDED');assert.equal(r.mail_status,'SENT');assert.deepEqual(h.messages.map(x=>x.to),['new-demo@example.invalid','internal@example.invalid']);
 const saved=h.properties.COPY_MAIL_BUDGET_JSON;assert.equal(h.service.submit(c).code,'REPLAY');assert.equal(h.messages.length,2);assert.equal(h.properties.COPY_MAIL_BUDGET_JSON,saved);
 h.copy.lock(()=>assert.equal(h.copy.reserveMail('another','participant','other@example.invalid'),'COPY_LIMIT'));
});
test('demo never widens internal mail recipients or accepts multiple participant recipients',()=>{
 const h=harness({config:{admissions_mode:'demo'},properties:{COPY_MAIL_LIMITS_JSON:'{"registrations":2,"recipients":4}'}});
 h.copy.lock(()=>{assert.equal(h.copy.reserveMail('x','tema','outside@example.invalid'),'ALLOWLIST');assert.equal(h.copy.reserveMail('x','participant','a@example.invalid,b@example.invalid'),'ALLOWLIST');});assert.equal(h.properties.COPY_MAIL_BUDGET_JSON,undefined);
});
test('invalid demo mode refuses new admission without mail or source mutation',()=>{
 const h=harness({config:{admissions_mode:'typo'}}),before=structuredClone(h.tables);assert.equal(h.service.submit(h.command()).code,'UNAVAILABLE');assert.deepEqual(h.tables,before);assert.equal(h.messages.length,0);
});
for (const externalEdit of [false, true]) test('overlapping minute during held view render ' + (externalEdit ? 'preserves real source invalidation' : 'does not invalidate the same pending work'), () => {
  const h = harness({ view: true }); h.loadAdmin(); h.context.reconcilierCopieTema();
  h.copy.dirty(true); const pendingVersion = h.copy.version(); h.events.length = 0;
  const flush = h.context.SpreadsheetApp.flush; let overlap = false, afterOverlap;
  h.context.SpreadsheetApp.flush = () => {
    flush();
    if (overlap || !h.state.user || !h.tables['Suivi des inscriptions'].slice(14).flat().some(v => String(v).includes('ESSAI COPY'))) return;
    overlap = true; h.state.now += 60001;
    if (externalEdit) { h.tables.Formations[1][2] = 'Title changed during render'; h.tables['Disponibilités'][1][1] = 'DIV-COPY-FIXTURE — Title changed during render'; h.copy.dirty(true); }
    const beforeNested = h.copy.version();
    assert.equal(h.context.reconcilierCopieTema(), false, 'The concurrent pass cannot publish while the owner render holds UserLock');
    afterOverlap = h.copy.version();
    assert.equal(afterOverlap, beforeNested, 'Reconciliation itself must not rotate an already pending source version');
  };
  if (externalEdit) assert.throws(() => h.context.reconcilierCopieTema(), /sources ou la sélection ont changé/);
  else assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(overlap, true);
  const renders = () => h.events.filter(e => e[0] === 'hideColumns').length;
  if (externalEdit) {
    assert.notEqual(afterOverlap, pendingVersion);
    assert.notEqual(h.properties.COPY_VIEW_VERSION, afterOverlap, 'The stale in-flight result cannot acknowledge a real edit');
    h.context.SpreadsheetApp.flush = flush;
    assert.equal(h.context.reconcilierCopieTema(), true);
    assert.equal(h.properties.COPY_VIEW_VERSION, h.copy.version());
    assert.ok(renders() >= 2, 'Real changed sources require another projection');
    assert.ok(h.tables['Suivi des inscriptions'].slice(14).flat().some(v => String(v).includes('Title changed during render')));
  } else {
    assert.equal(afterOverlap, pendingVersion);
    assert.equal(h.properties.COPY_VIEW_VERSION, afterOverlap);
    assert.equal(renders(), 1, 'A blocked concurrent minute must not force a second projection');
  }
});
