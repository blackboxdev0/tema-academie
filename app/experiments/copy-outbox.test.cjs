'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { harness, engine } = require('./copy-helpers.cjs');
const limits = { COPY_MAIL_LIMITS_JSON: '{"registrations":13,"recipients":26}' };
function setup(options = {}) {
  const h = harness({ ...options, properties: { ...limits, ...options.properties } });
  activate(h); return h;
}
function activate(h, recovery = []) { h.properties.COPY_ASYNC_MAIL_JSON = JSON.stringify({ version: 1, activated_at_ms: h.state.now, recovery_ids: recovery }); }
function post(h, command = h.command()) {
  const parameter = Object.fromEntries(Object.entries(command).filter(([k]) => k !== 'anti_spam').map(([k, v]) => [k, v === null ? '' : String(v)]));
  Object.assign(parameter, command.anti_spam);
  return JSON.parse(h.context.doPost({ postData: { type: 'application/x-www-form-urlencoded', contents: new URLSearchParams(parameter).toString() }, parameter, parameters: Object.fromEntries(Object.entries(parameter).map(([k, v]) => [k, [v]])) }).value);
}
function rows(h) { return h.copy.store().read().registrations; }
function patch(h, id, fields) { h.copy.lock(() => { h.copy.store({ deferDerived: true }).patch(id, fields); h.deps.store.flush(); }); }
function clean(h) { h.properties.COPY_NATIVE_COUNTERS_PENDING = '0'; h.properties.COPY_VIEW_VERSION = h.copy.version(); h.properties.COPY_AUDIT_AT = String(h.state.now + 300000); h.properties.COPY_VIEW_NEXT_CHANGE_AT = String(h.state.now + 300000); }
test('async HTTP admission flushes without mail, counters or view; autonomous minute completes, replay never sends', () => {
  const h = setup({ view: true }), c = h.command();
  assert.equal(post(h, c).mail_status, 'PENDING');
  assert.equal(h.messages.length, 0); assert.equal(rows(h).length, 1);
  assert.equal(h.tables['Disponibilités'][1][9], 1);
  assert.ok(h.events.filter(e => e[0] === 'write').every(e => e[1] === 'Inscriptions'));
  assert.equal(post(h, c).code, 'REPLAY'); assert.equal(h.messages.length, 0);
  h.context.reconcilierCopieTema(); assert.equal(h.messages.length, 2);
  assert.equal(rows(h)[0].mail_tema_etat, 'SENT'); assert.equal(rows(h)[0].mail_participant_etat, 'SENT');
  h.context.reconcilierCopieTema(); assert.equal(h.messages.length, 2);
  assert.equal(h.tables['Disponibilités'][1][9], 0);
});
test('last place stays protected before derived capacity repair', () => {
  const h = setup(); post(h); assert.equal(h.tables['Disponibilités'][1][9], 1);
  assert.equal(post(h, h.command({ courriel: 'second@example.invalid' })).code, 'FULL');
  assert.equal(h.copy.grouped().sessions.find(s => s.id_cohorte === 'C-COPY-FIXTURE-1').places_restantes, 0);
});
test('minute attempts before clean-view return or projection error', () => {
  for (const fail of [false, true]) {
    const h = setup(); post(h);
    if (fail) { h.loadAdmin(); h.context.TemaSheetPrototype.sync = () => { throw Error('projection'); }; } else clean(h);
    if (fail) assert.throws(() => h.context.reconcilierCopieTema(), /projection/); else h.context.reconcilierCopieTema();
    assert.equal(h.messages.length, 2);
  }
});
test('historical stock excluded; explicitly recovered participant preserves SENT Tema and prior budget', () => {
  const h = harness({ properties: limits }), c = h.command();
  h.service.register(c); const id = rows(h)[0].id_inscription;
  patch(h, id, { mail_tema_etat: 'SENT' });
  h.properties.COPY_MAIL_BUDGET_JSON = JSON.stringify({ version: 1, registrations: { [id]: { tema: true } }, recipients: 1 });
  const before = structuredClone(h.tables.Inscriptions); h.state.now += 10000; activate(h);
  h.copy.processPendingMail(); assert.equal(h.messages.length, 0); assert.deepEqual(h.tables.Inscriptions, before);
  activate(h, [id]); h.copy.processPendingMail(); h.copy.processPendingMail();
  assert.equal(h.messages.length, 1); assert.equal(h.messages[0].to, c.courriel);
  assert.equal(rows(h)[0].mail_tema_etat, 'SENT'); assert.equal(JSON.parse(h.properties.COPY_MAIL_BUDGET_JSON).recipients, 2);
});
for (const state of ['SENDING', 'UNKNOWN', 'FAILED', 'BLOCKED', 'SENT']) test('worker never retries ' + state, () => {
  const h = setup(); post(h); patch(h, rows(h)[0].id_inscription, { mail_participant_etat: state, mail_tema_etat: state });
  h.copy.processPendingMail(); assert.equal(h.messages.length, 0); assert.equal(rows(h)[0].mail_participant_etat, state);
});
test('cancellation suppresses both pending channels while preserving ambiguous channel', () => {
  const h = setup(); post(h); const id = rows(h)[0].id_inscription;
  patch(h, id, { statut: 'annulee' }); h.copy.processPendingMail();
  assert.equal(h.messages.length, 0); assert.equal(rows(h)[0].mail_tema_etat, 'SUPPRESSED');
  patch(h, id, { mail_participant_etat: 'UNKNOWN', mail_tema_etat: 'PENDING' }); h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_participant_etat, 'UNKNOWN'); assert.equal(rows(h)[0].mail_tema_etat, 'SUPPRESSED');
});
for (const properties of [{ COPY_MAIL_LIMITS_JSON: '{"registrations":0,"recipients":0}' }, { COPY_MAIL_BUDGET_JSON: 'invalid' }]) test('mail budget fails closed without reset ' + JSON.stringify(properties), () => {
  const h = setup({ properties }); post(h); h.copy.processPendingMail();
  assert.equal(h.messages.length, 0); assert.equal(rows(h)[0].mail_participant_etat, 'BLOCKED');
  for (const [k, v] of Object.entries(properties)) assert.equal(h.properties[k], v);
});
test('quota block is durable, not retried after quota changes', () => {
  const h = setup({ quota: 0 }); post(h); h.copy.processPendingMail(); h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_participant_error_code, 'MAIL_QUOTA'); assert.equal(h.messages.length, 0);
});
test('parallel worker re-entry observes durable claims without duplicating sends', () => {
  const h = setup(); post(h); const send = h.context.MailApp.sendEmail; let nested = false;
  h.context.MailApp.sendEmail = message => { if (!nested) { nested = true; h.copy.processPendingMail(); } send(message); };
  h.copy.processPendingMail(); assert.equal(h.messages.length, 2); assert.equal(JSON.parse(h.properties.COPY_MAIL_BUDGET_JSON).recipients, 2);
});
test('accepted send whose status cannot be persisted stays SENDING without retry', () => {
  const h = setup(); post(h); const send = h.context.MailApp.sendEmail;
  h.context.MailApp.sendEmail = message => { send(message); h.state.source = true; };
  h.copy.processPendingMail(); h.state.source = false; h.context.MailApp.sendEmail = send;
  h.copy.processPendingMail(); assert.equal(h.messages.length, 2); assert.equal(rows(h)[0].mail_participant_etat, 'SENDING');
});
test('bounded rotating batch lets later rows pass a persistent malformed row', () => {
  const h = setup(); h.tables['Disponibilités'][1][5] = 8;
  for (let i = 0; i < 5; i++) { h.state.now += 60000; assert.equal(post(h, h.command({ courriel: i + '@example.invalid' })).code, 'INVALID'); }
  // Seed through allowed addresses, changing the cohort for independent seats/rate keys.
  for (let i = 0; i < 5; i++) { h.state.now += 60000; const c = h.command(); assert.equal(post(h, c).code, 'RECORDED'); patch(h, rows(h).at(-1).id_inscription, { courriel: 'unique' + i + '@example.invalid' }); }
  h.context.TemaCopyConfig.read = (() => { const read = h.context.TemaCopyConfig.read; return () => ({ ...read(), admissions_mode: 'demo' }); })();
  patch(h, rows(h)[0].id_inscription, { formation_snapshot: '{broken' });
  assert.equal(h.copy.processPendingMail(), 3); assert.equal(rows(h)[4].mail_participant_etat, 'PENDING');
  h.copy.processPendingMail(); assert.equal(rows(h)[4].mail_participant_etat, 'SENT');
});
test('absent config preserves synchronous fallback, malformed activation rejects admission', () => {
  const h = harness({ properties: limits }); assert.equal(post(h).code, 'RECORDED'); assert.equal(h.messages.length, 2);
  for (const raw of ['', '{}', 'null', JSON.stringify({ version: 1, activated_at_ms: 0, recovery_ids: [] }), JSON.stringify({ version: 1, activated_at_ms: h.state.now + 1, recovery_ids: [] })]) {
    const bad = setup(); bad.properties.COPY_ASYNC_MAIL_JSON = raw;
    assert.equal(post(bad).code, 'UNAVAILABLE'); assert.equal(bad.tables.Inscriptions.length, 1); assert.equal(bad.messages.length, 0);
  }
});
test('MailApp ambiguity persists UNKNOWN with no retry', () => {
  const h = setup(); post(h);
  h.context.MailApp.sendEmail = () => { const e = Error('acceptance unknown'); e.uncertain = true; throw e; };
  h.copy.processPendingMail(); assert.equal(rows(h)[0].mail_participant_etat, 'UNKNOWN');
  h.copy.processPendingMail(); assert.equal(rows(h)[0].mail_tema_etat, 'UNKNOWN'); assert.equal(JSON.parse(h.properties.COPY_MAIL_BUDGET_JSON).recipients, 2);
});
test('invalid private cursor or recovery ID fails closed before HTTP admission', () => {
  for (const cursor of ['', '-1', '1.5', '01', 'Infinity']) {
    const h = setup(); h.properties.COPY_ASYNC_MAIL_CURSOR = cursor;
    assert.equal(post(h).code, 'UNAVAILABLE'); assert.equal(rows(h).length, 0);
  }
  const h = setup(); activate(h, ['bad ID']); assert.equal(post(h).code, 'UNAVAILABLE'); assert.equal(rows(h).length, 0);
});
test('worker, private config and lock failures never prevent administrative reconciliation', () => {
  for (const failure of ['worker', 'config', 'lock']) {
    const h = setup(), logs = []; let reconciled = 0;
    h.context.console = { log: message => logs.push(JSON.parse(message)) };
    h.copy.reconcile = () => { reconciled++; return 'reconciled'; };
    if (failure === 'worker') h.copy.processPendingMail = () => { throw Error('private identity must not appear'); };
    if (failure === 'config') h.properties.COPY_ASYNC_MAIL_JSON = 'invalid';
    if (failure === 'lock') h.context.LockService.getScriptLock = () => ({ tryLock: () => false });
    assert.equal(h.context.reconcilierCopieTema(), 'reconciled'); assert.equal(reconciled, 1);
    assert.deepEqual(logs, [{ phase: 'copy_pending_mail', code: failure === 'worker' ? 'UNAVAILABLE' : failure === 'config' ? 'PRIVATE_CONFIG' : 'BUSY' }]);
  }
});
test('selection elapsed time exhausts worker before starting any channel; next minute resumes', () => {
  const h = setup(); post(h);
  const api = h.context.Sheets.Spreadsheets.Values, get = api.get;
  api.get = (...args) => { const result = get(...args); h.state.now += 40000; return result; };
  assert.equal(h.copy.processPendingMail(), 0); assert.equal(h.messages.length, 0);
  assert.equal(rows(h)[0].mail_participant_etat, 'PENDING');
  api.get = get; h.copy.processPendingMail(); assert.equal(h.messages.length, 2);
});
test('elapsed channel prevents starting second channel or row; next minute finishes pending work', () => {
  const h = setup(); h.tables['Disponibilités'][1][5] = 2;
  post(h); post(h, h.command({ courriel: 'second@example.invalid' }));
  const send = h.context.MailApp.sendEmail;
  h.context.MailApp.sendEmail = message => { send(message); h.state.now += 40000; };
  h.copy.processPendingMail(); assert.equal(h.messages.length, 1);
  assert.equal(rows(h)[0].mail_participant_etat, 'SENT'); assert.equal(rows(h)[0].mail_tema_etat, 'PENDING');
  assert.equal(rows(h)[1].mail_participant_etat, 'PENDING'); assert.equal(rows(h)[1].mail_tema_etat, 'PENDING');
  h.context.MailApp.sendEmail = send; h.copy.processPendingMail();
  assert.equal(h.messages.length, 4); assert.ok(rows(h).every(row => row.mail_participant_etat === 'SENT' && row.mail_tema_etat === 'SENT'));
});
test('source-only admission leaves notice publication available after projection failure', () => {
  const h = setup({ view: true }); post(h);
  assert.equal(h.properties.COPY_NOTICE_PENDING, undefined);
  assert.ok(h.events.filter(e => e[0] === 'write').every(e => e[1] === 'Inscriptions'));
  h.loadAdmin(); h.context.TemaSheetPrototype.sync = () => { throw Error('projection failed'); };
  assert.throws(() => h.context.reconcilierCopieTema(), /projection failed/);
  assert.equal(h.properties.COPY_NOTICE_PENDING, '1');
  assert.match(h.tables['Suivi des inscriptions'][11][1], /Mise à jour en attente/);
});
test('disabling async preserves admitted pending rows and replay never sends or duplicates; saved config resumes', () => {
  const h = setup(), command = h.command(), saved = h.properties.COPY_ASYNC_MAIL_JSON;
  post(h, command); const before = structuredClone(h.tables.Inscriptions);
  delete h.properties.COPY_ASYNC_MAIL_JSON;
  assert.equal(post(h, command).code, 'REPLAY'); assert.equal(h.messages.length, 0);
  h.context.reconcilierCopieTema(); assert.equal(h.messages.length, 0); assert.deepEqual(h.tables.Inscriptions, before);
  assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, undefined);
  h.properties.COPY_ASYNC_MAIL_JSON = saved;
  h.context.reconcilierCopieTema(); assert.equal(h.messages.length, 2); assert.equal(h.tables.Inscriptions.length, 2);
  assert.equal(post(h, command).code, 'REPLAY'); assert.equal(h.messages.length, 2);
});
test('real minute replans changed confirmed counts, skips mail/counter-only changes and catches missed business edits', () => {
  const h = setup({ view: true }); h.loadAdmin();
  assert.equal(h.context.reconcilierCopieTema(), true);
  const sync = h.context.TemaSheetPrototype.sync; let calls = 0;
  h.context.TemaSheetPrototype.sync = (...args) => { calls++; return sync(...args); };
  const fingerprint = h.copy.adminFingerprint(h.book);
  post(h); assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(calls, 1);
  assert.equal(h.messages.length, 2); assert.equal(h.tables['Disponibilités'][1][9], 0);
  assert.notEqual(h.copy.adminFingerprint(h.book), fingerprint);
  const counted = h.copy.adminFingerprint(h.book);
  patch(h, rows(h)[0].id_inscription, { mail_participant_etat: 'UNKNOWN' });
  assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(calls, 1);
  h.tables['Disponibilités'][1][10] = 'derived diagnostic';
  assert.equal(h.copy.adminFingerprint(h.book), counted);
  h.tables.Formations[1][2] = 'Titre modifié sans événement'; h.state.now += 300001;
  assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(calls, 2);
  assert.equal(h.properties.COPY_ADMIN_SOURCE_HASH, h.copy.adminFingerprint(h.book));
  assert.match(h.tables['Disponibilités'][1][1], /Titre modifié sans événement/);
});
test('COPY onOpen avoids admin sync and Inscriptions onEdit only queues authoritative counter repair', () => {
  const h = setup({ view: true }); h.loadAdmin(); h.context.reconcilierCopieTema();
  h.context.TemaAdminActions.menu = () => {};
  const sync = h.context.TemaSheetPrototype.sync;
  h.context.TemaSheetPrototype.sync = () => { throw Error('unnecessary admin sync'); };
  h.context.onOpen({ source: h.book });
  h.context.TemaSheetPrototype.sync = sync;
  post(h); const commandRow = h.tables.Inscriptions[1]; commandRow[h.tables.Inscriptions[0].indexOf('statut')] = 'annulee';
  h.context.onEdit({ source: h.book, range: { getSheet: () => h.sheets.Inscriptions, getRow: () => 2, getLastRow: () => 2 } });
  assert.equal(h.properties.COPY_NATIVE_COUNTERS_PENDING, '1');
  h.context.reconcilierCopieTema(); assert.equal(h.tables['Disponibilités'][1][9], 1);
});
test('COPY real sync releases admission lock for cosmetic lists/notes; stale decoration stays unacknowledged', () => {
  const h = setup(); h.loadAdmin(); const command = h.command(); let admitted = false, cosmeticCalls = 0;
  for (const name of ['Formations', 'Disponibilités']) {
    const get = h.sheets[name].getRange;
    h.sheets[name].getRange = (...args) => {
      const range = get(...args);
      for (const method of ['setDataValidations', 'setNotes']) {
        const write = range[method];
        range[method] = (...values) => {
          assert.equal(h.state.source, false); assert.equal(h.state.user, true); cosmeticCalls++;
          if (!admitted) { admitted = true; assert.equal(post(h, command).code, 'RECORDED'); }
          return write(...values);
        };
      }
      return range;
    };
  }
  assert.equal(h.context.TemaSheetPrototype.sync(h.book, null), false); assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '1'); assert.ok(cosmeticCalls > 0); assert.equal(rows(h).length, 1);
  delete h.properties.COPY_ADMIN_SOURCE_HASH;
  h.tables.Formations[1][2] = 'Force changed list';
  const get = h.sheets['Disponibilités'].getRange; let changed = false;
  h.sheets['Disponibilités'].getRange = (...args) => { const range = get(...args), write = range.setDataValidations; range.setDataValidations = (...values) => { if (!changed) { changed = true; h.tables.Formations[1][2] = 'Human edit during decoration'; } return write(...values); }; return range; };
  assert.equal(h.context.TemaSheetPrototype.sync(h.book, null), false); assert.equal(h.properties.COPY_ADMIN_SOURCE_HASH, undefined);
});
test('native counters skip unchanged values, read no Formations, group adjacent changes under lock', () => {
  const h = setup(), sessions = h.tables['Disponibilités'];
  const second = structuredClone(sessions[1]); second[0] = 'C-SECOND'; sessions.splice(2, 0, second);
  h.sheets.Formations.getDataRange = () => { throw Error('unnecessary formations read'); };
  h.copy.lock(() => h.copy.nativeCounters(h.book));
  assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
  sessions[1][9] = 999; sessions[2][9] = 999;
  h.copy.lock(() => h.copy.nativeCounters(h.book));
  assert.equal(sessions[1][9], 1); assert.equal(sessions[2][9], 1);
  assert.equal(h.events.filter(e => e[0] === 'write').length, 1);
  assert.equal(h.properties.COPY_NATIVE_COUNTERS_PENDING, '0');
});
test('view acknowledgement validates outside source lock and invalidates delayed edits or read failures', () => {
  for (const failure of ['changed', 'unreadable']) {
    const h = setup(); h.properties.COPY_SOURCE_VERSION = 'v1'; let validations = 0;
    assert.equal(h.copy.acknowledge('v1', () => {
      assert.equal(h.state.source, false); validations++;
      if (validations === 2) { if (failure === 'unreadable') throw Error('read failed'); return false; }
      return true;
    }), false);
    assert.equal(validations, 2); assert.notEqual(h.copy.version(), h.properties.COPY_VIEW_VERSION);
  }
});
test('POST diagnostics contain only safe phase/code and preserve request identity in config failure receipt', () => {
  const h = setup(), logs = [], c = h.command(); h.context.console = { log: message => logs.push(JSON.parse(message)) };
  assert.equal(post(h, c).code, 'RECORDED');
  h.state.source = true; assert.equal(post(h, h.command()).code, 'BUSY'); h.state.source = false;
  h.properties.COPY_ASYNC_MAIL_JSON = 'invalid'; const failed = post(h, c);
  assert.equal(failed.code, 'UNAVAILABLE'); assert.equal(failed.request_id, c.request_id);
  assert.deepEqual(logs, [{ phase: 'copy_post_admission', code: 'RECORDED' }, { phase: 'copy_post_admission', code: 'BUSY' }, { phase: 'copy_post_config', code: 'UNAVAILABLE' }]);
});

test('bounded audit repairs stored counters and replans after a missed registration edit', () => {
  const h = setup({ view: true }); h.loadAdmin(); post(h); h.context.reconcilierCopieTema();
  assert.equal(h.tables['Disponibilités'][1][9], 0);
  const sync = h.context.TemaSheetPrototype.sync; let calls = 0;
  h.context.TemaSheetPrototype.sync = (...args) => { calls++; return sync(...args); };
  h.tables.Inscriptions[1][h.tables.Inscriptions[0].indexOf('statut')] = 'annulee'; h.state.now += 300001;
  assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(h.tables['Disponibilités'][1][9], 1); assert.equal(calls, 1);
  assert.equal(h.properties.COPY_NATIVE_COUNTERS_PENDING, '0');
});

test('minute closes overcapacity introduced in Inscriptions and cancellation clears its diagnostic', () => {
  const h = setup({ view: true }); h.loadAdmin(); post(h); h.context.reconcilierCopieTema();
  const extra = [...h.tables.Inscriptions[1]], headers = h.tables.Inscriptions[0];
  extra[headers.indexOf('id_inscription')] = 'I-MANUAL-EXTRA';
  extra[headers.indexOf('request_id')] = 'b0000000-0000-4000-8000-000000000001';
  extra[headers.indexOf('courriel')] = 'manual@example.invalid';
  extra[headers.indexOf('mail_participant_etat')] = 'SENT'; extra[headers.indexOf('mail_tema_etat')] = 'SENT';
  h.tables.Inscriptions.push(extra);
  h.context.onEdit({ source: h.book, range: h.sheets.Inscriptions.getRange(3, 1) });
  h.context.reconcilierCopieTema();
  assert.equal(h.tables['Disponibilités'][1][8], false);
  assert.equal(h.tables['Disponibilités'][1][10], 'La capacité est inférieure aux inscriptions confirmées.');
  assert.equal(h.tables['Disponibilités'][1][9], 0);
  extra[headers.indexOf('statut')] = 'annulee';
  h.context.onEdit({ source: h.book, range: h.sheets.Inscriptions.getRange(3, 1) });
  h.context.reconcilierCopieTema();
  assert.equal(h.tables['Disponibilités'][1][10], '');
  assert.equal(h.tables['Disponibilités'][1][8], false, 'Recovery never reopens a closed session automatically');
  assert.equal(h.messages.length, 2);
});
test('minute crosses a future session start and closes it without any source edit', () => {
  const h = setup({ view: true }); h.loadAdmin(); h.context.reconcilierCopieTema();
  assert.equal(h.tables['Disponibilités'][1][8], true);
  const before = h.copy.adminFingerprint(h.book);
  h.state.now = Date.parse('2030-01-15T14:00:00Z');
  assert.notEqual(h.copy.adminFingerprint(h.book), before);
  h.context.reconcilierCopieTema();
  assert.equal(h.tables['Disponibilités'][1][8], false);
  assert.equal(h.tables['Disponibilités'][1][10], 'La session doit être dans le futur.');
});
for (const method of ['setDataValidations', 'setNotes']) test('failed ' + method + ' on acknowledged source retries through real minute before clearing maintenance', () => {
  const h = setup({ view: true }); h.loadAdmin(); h.context.reconcilierCopieTema();
  const expected = h.properties.COPY_ADMIN_SOURCE_HASH;
  const sheet = h.sheets[method === 'setNotes' ? 'Formations' : 'Disponibilités'], get = sheet.getRange;
  let failed = false;
  sheet.getRange = (...args) => {
    const range = get(...args), write = range[method];
    // Emulate a manually missing decoration without modifying business fields.
    if (method === 'setNotes') range.getNotes = () => [['obsolete']];
    else range.getDataValidations = () => null;
    range[method] = (...values) => { assert.equal(h.state.source, false); failed = true; throw Error('partial decoration'); };
    return range;
  };
  assert.throws(() => h.context.TemaSheetPrototype.sync(h.book, null), /partial decoration/);
  assert.equal(failed, true); assert.equal(h.copy.adminFingerprint(h.book), expected);
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '1');
  sheet.getRange = get;
  assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '0');
  assert.equal(h.properties.COPY_ADMIN_SOURCE_HASH, expected);
});
test('nonowner keeps business changes, publishes no decorations and owner minute resumes maintenance', () => {
  const h = setup({ view: true }); h.loadAdmin(); h.context.reconcilierCopieTema();
  h.state.owner = 'editor@example.invalid'; h.tables.Formations[1][2] = 'Titre édité'; h.events.length = 0;
  h.context.onEdit({ source: h.book, range: h.sheets.Formations.getRange(2, 3) });
  assert.match(h.tables['Disponibilités'][1][1], /Titre édité/);
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '1');
  assert.ok(h.events.filter(e => e[0] === 'write').every(e => e[1] === 'Disponibilités' && e[3] === 2));
  h.state.owner = 'owner@example.invalid'; assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '0');
  assert.equal(h.properties.COPY_ADMIN_SOURCE_HASH, h.copy.adminFingerprint(h.book));
});
test('unchanged administrative maintenance performs no source, list or note writes', () => {
  const h = setup(); h.loadAdmin(); assert.equal(h.context.TemaSheetPrototype.sync(h.book, null), true);
  h.events.length = 0; assert.equal(h.context.TemaSheetPrototype.sync(h.book, null), true);
  assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
});
for (const failure of ['changed', 'unreadable']) test('admin final source ' + failure + ' keeps maintenance pending for next owner minute', () => {
  const h = setup({ view: true }); h.loadAdmin(); h.context.reconcilierCopieTema();
  const expected = h.copy.adminFingerprint(h.book), sheet = h.sheets.Formations, read = sheet.getRange;
  let reads = 0;
  h.properties.COPY_ADMIN_MAINTENANCE_PENDING = '1';
  sheet.getRange = (...args) => {
    const range = read(...args), values = range.getValues;
    range.getValues = () => {
      if (++reads === 2) {
        if (failure === 'unreadable') throw Error('source temporarily unreadable');
        h.tables.Formations[1][2] = 'Changed after acknowledgement';
      }
      return values();
    };
    return range;
  };
  assert.equal(h.copy.acknowledgeAdmin(h.book, expected), false);
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '1');
  sheet.getRange = read;
  assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '0');
  assert.equal(h.properties.COPY_ADMIN_SOURCE_HASH, h.copy.adminFingerprint(h.book));
});
test('planning snapshot rejects a human confirmed insertion between plan and expected fingerprint', () => {
  const h = setup({ view: true }); h.loadAdmin(); post(h); h.context.reconcilierCopieTema();
  const flush = h.context.SpreadsheetApp.flush; let inserted = false;
  h.context.SpreadsheetApp.flush = () => {
    flush();
    if (!inserted) {
      inserted = true;
      const extra = [...h.tables.Inscriptions[1]], headers = h.tables.Inscriptions[0];
      extra[headers.indexOf('id_inscription')] = 'I-BETWEEN-PLAN';
      extra[headers.indexOf('request_id')] = 'b0000000-0000-4000-8000-000000000002';
      extra[headers.indexOf('courriel')] = 'interleaved@example.invalid';
      h.tables.Inscriptions.push(extra);
    }
  };
  assert.equal(h.context.TemaSheetPrototype.sync(h.book, null), false);
  assert.equal(h.tables['Disponibilités'][1][10], '');
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '1');
  h.context.SpreadsheetApp.flush = flush;
  assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(h.tables['Disponibilités'][1][10], 'La capacité est inférieure aux inscriptions confirmées.');
  assert.equal(h.tables['Disponibilités'][1][8], false);
});
test('native edit during grouped counter write preserves pending repair for next minute', () => {
  const h = setup({ view: true }); h.loadAdmin(); post(h); h.context.reconcilierCopieTema();
  h.tables['Disponibilités'][1][9] = 999;
  const sheet = h.sheets['Disponibilités'], get = sheet.getRange; let edited = false;
  sheet.getRange = (...args) => {
    const range = get(...args), write = range.setValues;
    range.setValues = (...values) => {
      const result = write(...values);
      if (!edited && args[1] === 10) {
        edited = true;
        h.tables.Inscriptions[1][h.tables.Inscriptions[0].indexOf('statut')] = 'annulee';
        h.copy.dirty(true); h.copy.markCountersPending();
      }
      return result;
    };
    return range;
  };
  h.copy.lock(() => h.copy.nativeCounters(h.book));
  assert.equal(edited, true); assert.equal(h.tables['Disponibilités'][1][9], 0);
  assert.equal(h.properties.COPY_NATIVE_COUNTERS_PENDING, '1');
  sheet.getRange = get;
  assert.equal(h.context.reconcilierCopieTema(), true);
  assert.equal(h.tables['Disponibilités'][1][9], 1);
  assert.equal(h.properties.COPY_NATIVE_COUNTERS_PENDING, '0');
});
test('COPY opening queues missed business edit despite acknowledging refreshed view', () => {
  const h = setup({ view: true }); h.loadAdmin(); h.context.reconcilierCopieTema();
  h.context.TemaAdminActions.menu = () => {};
  h.tables.Formations[1][2] = 'Missed title before open';
  h.context.onOpen({ source: h.book });
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '1');
  assert.doesNotMatch(h.tables['Disponibilités'][1][1], /Missed title/);
  assert.equal(h.context.reconcilierCopieTema(), true);
  assert.match(h.tables['Disponibilités'][1][1], /Missed title before open/);
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '0');
});
test('nonowner receives computed validation toast without decorative writes', () => {
  const h = setup(); h.loadAdmin(); h.state.owner = 'editor@example.invalid';
  const toasts = []; h.book.toast = (...args) => toasts.push(args);
  h.tables['Disponibilités'][1][5] = 0;
  assert.equal(h.context.TemaSheetPrototype.sync(h.book, { sheet: 'Disponibilités', first: 2, last: 2 }), false);
  assert.ok(toasts.some(t => t[0] === 'La capacité doit être un nombre entier positif.' && t[1] === 'À compléter'));
  assert.equal(h.sheets['Disponibilités'].getRange(2, 2).getNotes()[0][0], '');
  assert.equal(h.properties.COPY_ADMIN_MAINTENANCE_PENDING, '1');
});
test('real minute writes grouped notes to managed adjacent and separated cells and clears only diagnostics', () => {
  const h = setup({ view: true }); h.loadAdmin();
  const forms = h.tables.Formations, sessions = h.tables['Disponibilités'];
  forms.splice(2, 0, [...forms[1]]); forms[2][0] = 'DIV-ADJACENT'; forms[2][2] = 'Adjacent formation';
  for (const index of [1, 2, 5]) forms[index][7] = '';
  sessions.splice(2, 0, [...sessions[1]]); sessions[2][0] = 'C-ADJACENT'; sessions[2][6] = 'invalid';
  sessions[1][5] = 0; sessions[5][2] = '2020-01-15';
  h.copy.lock(() => {
    h.sheets.Formations.getRange(2, 4).setNote('Unmanaged description note');
    h.sheets.Formations.getRange(4, 3).setNote('Unmanaged header note');
    h.sheets['Disponibilités'].getRange(2, 3).setNote('Unmanaged date note');
    h.sheets['Disponibilités'].getRange(4, 2).setNote('Unmanaged session header note');
  });
  h.context.reconcilierCopieTema();
  const note = (name, row, column) => h.sheets[name].getRange(row, column).getNotes()[0][0];
  for (const row of [2, 3, 6]) assert.equal(note('Formations', row, 3), 'Renseignez la durée avant de publier.');
  for (const row of [2, 3, 6]) assert.equal(note('Disponibilités', row, 2), 'Choisissez une formation valide dans la liste.');
  for (const index of [1, 2, 5]) { forms[index][7] = '1 jour'; forms[index][12] = true; }
  sessions[1][5] = 1; sessions[2][6] = 'en_ligne'; sessions[5][2] = '2030-07-15';
  for (const index of [1, 2, 5]) sessions[index][8] = true;
  h.copy.dirty(true); h.context.reconcilierCopieTema();
  for (const row of [2, 3, 6]) { assert.equal(note('Formations', row, 3), ''); assert.equal(note('Disponibilités', row, 2), ''); }
  assert.equal(note('Formations', 2, 4), 'Unmanaged description note');
  assert.equal(note('Formations', 4, 3), 'Unmanaged header note');
  assert.equal(note('Disponibilités', 2, 3), 'Unmanaged date note');
  assert.equal(note('Disponibilités', 4, 2), 'Unmanaged session header note');
});
