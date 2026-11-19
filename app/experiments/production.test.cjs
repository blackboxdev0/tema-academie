'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { harness, target, engine } = require('./copy-helpers.cjs');
const { build } = require('./build-production-backend.cjs');
const { validateTarget, POLICY_VERSION, COPY } = require('../scripts/production-target.cjs');
const LIMITS = { version: 1, recipients: 80, window_ms: 86400000, quota_reserve: 5 };
const newTarget = { environment: 'PRODUCTION', spreadsheetId: 'production_fixture_spreadsheet_01', scriptId: 'production_fixture_script_00001' };
const rows = h => h.copy.table(h.tables.Inscriptions, 'Inscriptions');
function setup(extra = {}) {
  const h = harness({ production: true, ...extra, properties: { PRODUCTION_MAIL_LIMITS_JSON: JSON.stringify(LIMITS), ...extra.properties } });
  h.properties.PRODUCTION_ASYNC_MAIL_JSON = JSON.stringify({ version: 1, activated_at_ms: h.state.now, recovery_ids: [] });
  return h;
}
function reserve(h, id, channel = 'participant', registrations = rows(h)) { return h.copy.lock(() => h.copy.reserveMail(id, channel, 'participant@example.invalid', registrations)); }
function patch(h, id, fields) { h.copy.lock(() => { h.copy.store().patch(id, fields); h.copy.store().flush(); }); }
function capture(h) { h.context.TemaHeaders.capture(h.book); h.events.length = 0; }
function changedCell(h, name = 'Disponibilités', row = 7, col = 10, value = 2) { h.tables[name][row - 1][col - 1] = value; }

test('production cancellation persists a released place even when native maintenance sees an old confirmation', () => {
  const h = setup({ view: true }); h.loadAdmin(); capture(h);
  assert.equal(h.service.register(h.command()).code, 'RECORDED');
  assert.equal(h.copy.reconcile(), true);
  assert.equal(h.tables['Disponibilités'][1][9], 0);
  const view = h.tables['Suivi des inscriptions'];
  const row = view.findIndex(r => r[3] === 'participant@example.invalid') + 1;
  assert.ok(row >= 15);
  const bookBefore = structuredClone(h.tables.Inscriptions);
  const source = h.sheets.Inscriptions, originalDataRange = source.getDataRange;
  let staleRead = true;
  source.getDataRange = () => {
    const range = originalDataRange();
    if (staleRead && h.tables.Inscriptions[1][6] === 'annulee') {
      staleRead = false;
      range.getValues = () => structuredClone(bookBefore);
    }
    return range;
  };
  h.context.SpreadsheetApp.getUi = () => ({ ButtonSet: { YES_NO: 'YES_NO' }, Button: { YES: 'YES' }, alert: () => 'YES' });
  view[row - 1][4] = 'Annulée';
  const edit = { source: h.book, range: h.sheets['Suivi des inscriptions'].getRange(row, 5), value: 'Annulée', oldValue: 'Confirmée' };
  h.context.onEdit(edit);
  assert.equal(rows(h)[0].statut, 'confirmee');
  h.events.length = 0;
  h.context.traiterSaisieFormationTema({ ...edit, triggerUid: 'installed-owner-edit' });
  assert.equal(rows(h)[0].statut, 'annulee');
  assert.equal(h.tables['Disponibilités'][1][9], 1);
  assert.ok(h.events.some(([kind]) => kind === 'api-update'));
  const originalRange = source.getRange;
  source.getRange = (...args) => {
    const range = originalRange(...args);
    if (args[0] === 2 && args[1] === 7) range.getValues = () => [['confirmee']];
    return range;
  };
  h.properties.PRODUCTION_ADMIN_MAINTENANCE_PENDING = '1';
  assert.equal(h.copy.reconcile(), true);
  assert.equal(h.tables['Disponibilités'][1][9], 1);
  bookBefore[1][6] = 'annulee';
  assert.deepEqual(h.tables.Inscriptions, bookBefore);
  assert.equal(h.messages.length, 0);
});

test('production does not acknowledge a counter write that the next provider read cannot confirm', () => {
  const h = setup({ view: true }); h.loadAdmin(); capture(h);
  assert.equal(h.service.register(h.command()).code, 'RECORDED');
  h.copy.lock(() => h.copy.nativeCounters(h.book));
  assert.equal(h.tables['Disponibilités'][1][9], 0);
  const id = rows(h)[0].id_inscription;
  patch(h, id, { statut: 'annulee' });
  const update = h.context.Sheets.Spreadsheets.batchUpdate;
  h.context.Sheets.Spreadsheets.batchUpdate = () => ({ replies: [{}] });
  assert.throws(() => h.copy.lock(() => h.copy.nativeCounters(h.book, 'C-COPY-FIXTURE-1', id)), /CONFIG/);
  assert.equal(h.properties.PRODUCTION_NATIVE_COUNTERS_PENDING, '1');
  assert.equal(h.tables['Disponibilités'][1][9], 0);
  h.context.Sheets.Spreadsheets.batchUpdate = update;
  assert.equal(h.context.reconcilierProductionTema(), true);
  assert.equal(h.tables['Disponibilités'][1][9], 1);
  assert.equal(h.properties.PRODUCTION_NATIVE_COUNTERS_PENDING, '0');
  assert.equal(h.messages.length, 0);
});

for (const change of ['capacity', 'row']) test('production retries the counter if the ' + change + ' changed during the provider write', () => {
  const h = setup(), sessionRows = h.tables['Disponibilités'];
  assert.equal(h.service.register(h.command()).code, 'RECORDED');
  h.copy.lock(() => h.copy.nativeCounters(h.book));
  patch(h, rows(h)[0].id_inscription, { statut: 'annulee' });
  const api = h.context.Sheets.Spreadsheets, update = api.batchUpdate;
  api.batchUpdate = (body, id) => {
    if (change === 'capacity') sessionRows[1][5] = 3;
    else sessionRows.splice(1, 0, Array(12).fill(''));
    return update(body, id);
  };
  assert.throws(() => h.copy.lock(() => h.copy.nativeCounters(h.book)), /CONFIG/);
  assert.equal(h.properties.PRODUCTION_NATIVE_COUNTERS_PENDING, '1');
  api.batchUpdate = update;
  h.copy.lock(() => h.copy.nativeCounters(h.book));
  if (change === 'row') {
    assert.equal(sessionRows[1][9], '');
    assert.equal(sessionRows[2][9], 1);
  } else assert.equal(sessionRows[1][9], 3);
  assert.equal(h.properties.PRODUCTION_NATIVE_COUNTERS_PENDING, '0');
});

test('production refuses every historical target and cannot acquire an unverified endpoint', () => {
  assert.equal(validateTarget(newTarget).apiUrl, '');
  for (const field of ['spreadsheetId', 'scriptId']) for (const id of [target.spreadsheet, target.script, 'short', newTarget[field === 'scriptId' ? 'spreadsheetId' : 'scriptId']]) assert.throws(() => validateTarget({ ...newTarget, [field]: id }));
  for (const resource of Object.values(require('../../config/project.json').google.resources.environments)) for (const id of [resource.spreadsheet_id, resource.script_id]) assert.throws(() => validateTarget({ ...newTarget, spreadsheetId: id }));
  assert.throws(() => validateTarget({ ...newTarget, apiUrl: 'https://script.google.com/macros/s/COPY_FIXTURE/exec' }), /independent/);
  assert.throws(() => validateTarget({ ...newTarget, apiUrl: COPY.apiUrl, deploymentEvidence: { method: 'native-google-deployment-ui', environment: 'PRODUCTION', apiUrl: COPY.apiUrl, spreadsheetId: newTarget.spreadsheetId, scriptId: newTarget.scriptId, deploymentVersion: 1, verifiedAt: '2026-11-18T00:00:00Z' } }), /Invalid/);
});

test('production profile/build selection is explicit and leaves the saved demo profile byte-identical', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-production-profile-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const demo = path.join(dir, 'demo.json'), production = path.join(dir, 'production.json');
  const saved = JSON.stringify({ version: 1, environment: 'COPY', apiUrl: COPY.apiUrl, spreadsheetId: COPY.spreadsheet, scriptId: COPY.script }); fs.writeFileSync(demo, saved); fs.writeFileSync(production, JSON.stringify(newTarget));
  const clean = { ...process.env, TEMA_LOCAL_PROFILE_PATH: demo }; delete clean.TEMA_TEST_API_URL; delete clean.TEMA_COPY_API_URL; delete clean.TEMA_PRODUCTION_PROFILE_PATH;
  function selected(extra) { return spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/local-profile.cjs'), 'show'], { encoding: 'utf8', env: { ...clean, ...extra } }); }
  assert.equal(JSON.parse(selected({}).stdout).environment, 'COPY');
  const explicit = selected({ TEMA_PRODUCTION_PROFILE_PATH: production }); assert.equal(explicit.status, 0, explicit.stderr); assert.equal(JSON.parse(explicit.stdout).environment, 'PRODUCTION');
  assert.equal(selected({ TEMA_PRODUCTION_PROFILE_PATH: production, TEMA_TEST_API_URL: '' }).status, 1);
  assert.equal(selected({ TEMA_PRODUCTION_PROFILE_PATH: production, TEMA_COPY_API_URL: COPY.apiUrl }).status, 1);
  assert.equal(fs.readFileSync(demo, 'utf8'), saved);
});

test('production builds only private target-bound artifacts, with recovery hashes, native form, isolated profile and participant text', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-production-build-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const prior = path.join(dir, 'old.gs'), manifest = path.join(dir, 'old.json'), priorNative = path.join(dir, 'old-native.gs'); fs.writeFileSync(prior, 'function old() {}'); fs.writeFileSync(manifest, '{}'); fs.writeFileSync(priorNative, 'function oldNative() {}');
  const result = await build({ target: newTarget, output: path.join(dir, 'candidate'), backupCode: prior, backupManifest: manifest, backupNative: priorNative });
  const code = fs.readFileSync(path.join(result.output, 'Code.gs'), 'utf8'); new vm.Script(code);
  const native = fs.readFileSync(path.join(result.output, 'SaisieNative.gs'), 'utf8');
  assert.ok(code.includes(newTarget.spreadsheetId)); assert.ok(code.includes(newTarget.scriptId)); assert.ok(native.includes('function enregistrerSaisieNativeTema')); assert.ok(code.includes('function reconcilierProductionTema'));
  assert.equal(code.includes('var TemaNativeForm ='), false); assert.equal(native.includes(target.spreadsheet), false);
  assert.equal(code.includes('TEM-6 Trial'), false); assert.equal(code.includes('@tema-academie.test'), false);
  for (const sources of [[code, native], [native, code]]) { const context = {}; vm.createContext(context); for (const source of sources) vm.runInContext(source, context); assert.equal(typeof context.TemaNativeForm.submit, 'function'); assert.equal(context.TemaSheetPrototype.target, newTarget.spreadsheetId); }
  assert.match(result.nativeSha256, /^[a-f0-9]{64}$/); assert.match(result.bundleSha256, /^[a-f0-9]{64}$/);
  assert.equal(code.includes(target.spreadsheet), false); assert.equal(code.includes('COPY_MAIL_BUDGET_JSON'), false);
  assert.ok(result.backup); assert.equal(result.googleChanged, false); assert.equal(result.mailSent, 0);
  const recovery = fs.readFileSync(path.join(result.output, 'RECOVERY.txt'), 'utf8'); assert.match(recovery, /installerActualisationProductionTema/); assert.match(recovery, /installerEditionSaisieProductionTema/); assert.match(recovery, /traiterSaisieFormationTema edit trigger/);
  const integrity = JSON.parse(fs.readFileSync(path.join(result.backup, 'integrity.json'), 'utf8'));
  for (const [name, key, original] of [['Code.gs', 'codeSha256', prior], ['SaisieNative.gs', 'nativeSha256', priorNative], ['appsscript.json', 'manifestSha256', manifest]]) {
    const bytes = fs.readFileSync(path.join(result.backup, name));
    assert.deepEqual(bytes, fs.readFileSync(original)); assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), integrity[key]);
  }
  const installed = setup({ nativeForm: true });
  for (const source of [code, native]) vm.runInNewContext(source, installed.context);
  assert.equal(installed.context.TemaNativeForm.install(installed.book), installed.sheets['Nouvelle formation'].getSheetId());
  assert.equal(installed.sheets['Nouvelle formation'].getImages().length, 1); assert.equal(installed.state.nativeOwnerRetained, true);
  assert.ok(installed.state.nativeUnprotected.every(a1 => !a1.includes('K')));
  const png = Buffer.from(installed.context.TEMA_NATIVE_SAVE_BUTTON, 'base64');
  assert.deepEqual(png, await require('./build-native-form.cjs').buttonPng());
  for (const [left, rgb] of [[3, [255, 0, 143]], [20, [32, 33, 43]]]) {
    const pixel = await require('sharp')(png).extract({ left, top: 50, width: 1, height: 1 }).raw().toBuffer(); assert.deepEqual([...pixel.subarray(0, 3)], rgb);
  }
  installed.tables['Nouvelle formation'][10][1] = 'Saisie à vider'; installed.tables['Nouvelle formation'][64][1] = true;
  const edit = { source: installed.book, range: installed.sheets['Nouvelle formation'].getRange('B65'), value: 'TRUE' };
  installed.context.onEdit(edit); assert.equal(installed.tables['Nouvelle formation'][10][1], 'Saisie à vider');
  installed.context.traiterSaisieFormationTema({ ...edit, triggerUid: 'installed-owner-edit' });
  assert.equal(installed.tables['Nouvelle formation'][10][1], ''); assert.equal(installed.tables['Nouvelle formation'][2][10], 'DRAFT');

  const html = fs.readFileSync(path.join(result.output, 'site/web/index.html'), 'utf8');
  assert.doesNotMatch(html.replace(/<[^>]*>/g, ''), /\bTEST\b|\bCOPY\b|inscription fictive|Document proposé|validation juridique/i);
  assert.match(html, /douze mois/); assert.match(html, /temaacademie@gmail.com/); assert.match(html, new RegExp(POLICY_VERSION));
  assert.equal(fs.statSync(result.output).mode & 0o777, 0o700); assert.equal(fs.statSync(path.join(result.output, 'Code.gs')).mode & 0o777, 0o600);
  assert.equal(fs.existsSync(path.join(result.output, 'site/apps-script')), false);
  const config = {}; vm.runInNewContext(fs.readFileSync(path.join(result.output, 'site/web/config.js'), 'utf8'), { window: config });
  assert.equal(config.TEMA_CONFIG.environment, 'PRODUCTION'); assert.equal(config.TEMA_CONFIG.apiUrl, '');
  await assert.rejects(build({ target: newTarget, output: path.resolve(__dirname, '../dist/production') }), /outside/);
  assert.throws(() => require('../scripts/build.cjs').build({ profile: validateTarget(newTarget), output: dir }), /nonempty/);
});

for (const property of ['ENVIRONMENT', 'SPREADSHEET_ID', 'script']) test('production guard rejects wrong ' + property + ' before opening a spreadsheet', () => {
  const h = setup(); if (property === 'script') h.state.script = target.script; else h.properties[property] = property === 'ENVIRONMENT' ? 'COPY' : target.spreadsheet;
  assert.throws(() => h.copy.book(), /ENVIRONMENT/); assert.equal(h.state.opened, 0); assert.equal(h.events.length, 0);
});

test('production policy is versioned, public admission accepts ordinary recipients, and missing worker activation fails closed', () => {
  const h = setup({ config: { admissions_mode: 'production' } }), c = h.command({ courriel: 'ordinary@example.invalid' });
  assert.equal(h.copy.grouped().policy.version, POLICY_VERSION); assert.equal(h.copy.grouped().policy.url, '#politique');
  assert.equal(h.service.register(c).code, 'RECORDED'); assert.equal(rows(h)[0].politique_version, POLICY_VERSION);
  delete h.properties.PRODUCTION_ASYNC_MAIL_JSON; assert.throws(() => h.copy.asyncConfig(), /PRIVATE_CONFIG/);
  assert.equal(h.messages.length, 0);
});

for (const configuration of ['missing', 'paused', 'quota', 'rolling']) test('production ' + configuration + ' budget defers PENDING before any attempt and resumes safely', () => {
  const h = setup(), c = h.command(); assert.equal(h.service.register(c).code, 'RECORDED');
  if (configuration === 'missing') delete h.properties.PRODUCTION_MAIL_LIMITS_JSON;
  if (configuration === 'paused') h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 0 });
  if (configuration === 'quota') h.state.quota = 5;
  if (configuration === 'rolling') { for (let i = 0; i < 80; i++) assert.equal(reserve(h, 'I-budget-' + i), null); }
  const copyProtected = { COPY_MAIL_BUDGET_JSON: '{"preserve":true}', COPY_MAIL_LIMITS_JSON: '{"preserve":true}' }; Object.assign(h.properties, copyProtected);
  h.copy.processPendingMail(); let row = rows(h)[0];
  assert.equal(row.mail_participant_etat, 'PENDING'); assert.equal(row.mail_tema_etat, 'PENDING'); assert.equal(row.mail_participant_attempt_id, ''); assert.equal(h.messages.length, 0);
  h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify(LIMITS); h.state.quota = 100; if (configuration === 'rolling') h.state.now += 86400000;
  h.copy.processPendingMail(); row = rows(h)[0]; assert.equal(row.mail_participant_etat, 'SENT'); assert.equal(row.mail_tema_etat, 'SENT'); assert.equal(h.messages.length, 2);
  h.copy.processPendingMail(); assert.equal(h.service.submit(c).code, 'REPLAY'); assert.equal(h.messages.length, 2);
  for (const [k, v] of Object.entries(copyProtected)) assert.equal(h.properties[k], v);
});

test('production rolling budget is bounded at80, exact24h renews, and Google quota retains five including inflight commitments', () => {
  const h = setup(); for (let i = 0; i < 80; i++) assert.equal(reserve(h, 'I-budget-' + i), null);
  assert.equal(reserve(h, 'I-over-limit'), 'MAIL_LIMIT'); const raw = h.properties.PRODUCTION_MAIL_BUDGET_JSON; assert.ok(Buffer.byteLength(raw) < 9216);
  h.state.now += 86400000 - 1; assert.equal(reserve(h, 'I-next'), 'MAIL_LIMIT'); h.state.now++; assert.equal(reserve(h, 'I-next'), null);
  assert.equal(JSON.parse(h.properties.PRODUCTION_MAIL_BUDGET_JSON).attempts.length, 1);
  h.state.quota = 6; assert.equal(reserve(h, 'I-concurrent', 'participant', [{ mail_participant_etat: 'SENDING', mail_participant_attempt_at: new Date(h.state.now).toISOString() }]), 'MAIL_QUOTA');
  assert.equal(reserve(h, 'I-one-available'), null); assert.equal(reserve(h, 'I-one-available'), 'ATTEMPT_RESERVED');
});

test('production can record 100 attempts and preserves its legacy journal when changing the ceiling', () => {
  const h = setup();
  for (let i = 0; i < 80; i++) assert.equal(reserve(h, `I-budget-${i}`), null);
  const legacy = JSON.parse(h.properties.PRODUCTION_MAIL_BUDGET_JSON);
  h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 100, quota_reserve: 0 });
  for (let i = 80; i < 100; i++) assert.equal(reserve(h, `I-budget-${i}`), null);
  const raw = h.properties.PRODUCTION_MAIL_BUDGET_JSON;
  const compact = JSON.parse(raw);
  assert.equal(compact.version, 2);
  assert.equal(compact.attempts.length, 100);
  assert.deepEqual(compact.attempts.slice(0, 80), legacy.attempts.map(({ at, key }) => [at, key]));
  assert.ok(Buffer.byteLength(raw) < 9 * 1024);
  assert.equal(reserve(h, 'I-budget-0'), 'ATTEMPT_RESERVED');
  assert.equal(reserve(h, 'I-budget-100'), 'MAIL_LIMIT');
  h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify(LIMITS);
  assert.equal(reserve(h, 'I-after-ceiling-reduction'), 'MAIL_LIMIT');
  assert.equal(h.properties.PRODUCTION_MAIL_BUDGET_JSON, raw);
  h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 100, quota_reserve: 0 });
  h.state.now += 86400000 - 1;
  assert.equal(reserve(h, 'I-next'), 'MAIL_LIMIT');
  h.state.now++;
  assert.equal(reserve(h, 'I-next'), null);
  assert.equal(JSON.parse(h.properties.PRODUCTION_MAIL_BUDGET_JSON).attempts.length, 1);
});

test('the production worker sends the 100th attempt and waits for the rolling budget to reopen', () => {
  const h = setup({ quota: 100, properties: { PRODUCTION_MAIL_LIMITS_JSON: JSON.stringify({ ...LIMITS, recipients: 100, quota_reserve: 0 }) } });
  for (let i = 0; i < 99; i++) assert.equal(reserve(h, `I-budget-${i}`), null);
  const command = h.command();
  assert.equal(h.service.register(command).code, 'RECORDED');
  h.copy.processPendingMail();
  const first = rows(h)[0];
  assert.equal(first.mail_participant_etat, 'SENT');
  assert.equal(first.mail_tema_etat, 'PENDING');
  assert.equal(first.mail_tema_error_code, 'MAIL_LIMIT');
  assert.equal(h.messages.length, 1);
  h.state.now += 86400000;
  h.copy.processPendingMail();
  h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_tema_etat, 'SENT');
  assert.equal(rows(h)[0].mail_participant_attempt_id, first.mail_participant_attempt_id);
  assert.equal(h.service.submit(command).code, 'REPLAY');
  assert.equal(h.messages.length, 2);
});

test('full-capacity production uses the last available Google recipient and defers the other mail without duplicates', () => {
  const h = setup({ quota: 1, properties: { PRODUCTION_MAIL_LIMITS_JSON: JSON.stringify({ ...LIMITS, recipients: 100, quota_reserve: 0 }) } });
  const active = [{ mail_participant_etat: 'SENDING', mail_participant_attempt_at: new Date(h.state.now).toISOString() }];
  assert.equal(reserve(h, 'I-inflight', 'participant', active), 'MAIL_QUOTA');
  const c = h.command();
  assert.equal(h.service.register(c).code, 'RECORDED');
  h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_participant_etat, 'SENT');
  assert.equal(rows(h)[0].mail_tema_etat, 'PENDING');
  assert.equal(h.messages.length, 1);
  h.state.quota = 1;
  h.copy.processPendingMail();
  h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_tema_etat, 'SENT');
  assert.equal(h.service.submit(c).code, 'REPLAY');
  assert.equal(h.messages.length, 2);
});

for (const raw of ['invalid', '{}', JSON.stringify({ version: 1, last_at_ms: Date.parse('2099-01-01T00:00Z'), attempts: [] }), JSON.stringify({ version: 1, last_at_ms: Date.parse('2026-11-04T15:00Z'), attempts: Array(81).fill({ at: 1, key: 'a'.repeat(64) }) })]) test('corrupt production journal is never reset: ' + raw.slice(0, 50), () => {
  const h = setup(); h.properties.PRODUCTION_MAIL_BUDGET_JSON = raw; assert.equal(reserve(h, 'I-test'), 'BUDGET_CONFIG'); assert.equal(h.properties.PRODUCTION_MAIL_BUDGET_JSON, raw);
});

test('production rejects malformed, duplicate or unbounded compact attempts without touching the journal', () => {
  const h = setup({ properties: { PRODUCTION_MAIL_LIMITS_JSON: JSON.stringify({ ...LIMITS, recipients: 100, quota_reserve: 0 }) } });
  const attempt = [h.state.now, 'a'.repeat(64)];
  for (const attempts of [[[...attempt, null]], [attempt, attempt], Array.from({ length: 101 }, (_, i) => [h.state.now, i.toString(16).padStart(64, '0')])]) {
    const raw = JSON.stringify({ version: 2, last_at_ms: h.state.now, attempts });
    h.properties.PRODUCTION_MAIL_BUDGET_JSON = raw;
    assert.equal(reserve(h, 'I-test'), 'BUDGET_CONFIG');
    assert.equal(h.properties.PRODUCTION_MAIL_BUDGET_JSON, raw);
  }
});

for (const raw of ['invalid', '{}', JSON.stringify({ ...LIMITS, recipients: 101, quota_reserve: 0 }), JSON.stringify({ ...LIMITS, recipients: 100 }), JSON.stringify({ ...LIMITS, quota_reserve: 0 }), JSON.stringify({ ...LIMITS, quota_reserve: 4 }), JSON.stringify({ ...LIMITS, window_ms: 3600000 })]) test('malformed/unbounded production limits fail closed without resetting budget: ' + raw, () => {
  const h = setup({ properties: { PRODUCTION_MAIL_LIMITS_JSON: raw } }); h.properties.PRODUCTION_MAIL_BUDGET_JSON = 'unchanged';
  assert.equal(reserve(h, 'I-test'), 'BUDGET_CONFIG'); assert.equal(h.properties.PRODUCTION_MAIL_BUDGET_JSON, 'unchanged'); assert.equal(h.messages.length, 0);
});

for (const status of ['SENDING', 'UNKNOWN', 'FAILED', 'BLOCKED']) test('production renewal never rearms ' + status + ' or replays its mail', () => {
  const h = setup(), c = h.command(); h.service.register(c); const row = rows(h)[0];
  patch(h, row.id_inscription, { mail_participant_etat: status, mail_tema_etat: status, mail_participant_attempt_id: 'attempt-retained' });
  h.state.now += 86400000; h.copy.processPendingMail(); assert.equal(h.service.submit(c).code, 'REPLAY');
  assert.equal(h.messages.length, 0); assert.equal(rows(h)[0].mail_participant_etat, status); assert.equal(rows(h)[0].mail_participant_attempt_id, 'attempt-retained');
});

test('production transport failure remains FAILED after renewal, and cancellation suppresses an unclaimed deferred message', () => {
  const h = setup({ failMail: true }), c = h.command(); h.service.register(c); h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_participant_etat, 'FAILED'); h.state.now += 86400000; h.copy.processPendingMail(); assert.equal(h.messages.length, 0);
  const cancelled = setup({ quota: 5 }); cancelled.service.register(cancelled.command()); cancelled.copy.processPendingMail();
  patch(cancelled, rows(cancelled)[0].id_inscription, { statut: 'annulee' }); cancelled.state.quota = 100; cancelled.copy.processPendingMail();
  assert.equal(rows(cancelled)[0].mail_participant_etat, 'SUPPRESSED'); assert.equal(cancelled.messages.length, 0);
});

test('production uncertain transport and interrupted durable claim cannot be rearmed by budget renewal', () => {
  const h = setup(), c = h.command(); h.service.register(c); h.context.MailApp.sendEmail = () => { throw Object.assign(Error('uncertain fixture'), { uncertain: true }); }; h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_participant_etat, 'UNKNOWN'); h.state.now += 86400000; h.copy.processPendingMail(); assert.equal(rows(h)[0].mail_participant_etat, 'UNKNOWN');
  const interrupted = setup(); interrupted.service.register(interrupted.command()); const id = rows(interrupted)[0].id_inscription;
  assert.equal(reserve(interrupted, id), null); interrupted.copy.processPendingMail(); assert.equal(rows(interrupted)[0].mail_participant_etat, 'BLOCKED');
  assert.equal(rows(interrupted)[0].mail_participant_error_code, 'ATTEMPT_RESERVED'); interrupted.state.now += 86400000; interrupted.copy.processPendingMail(); assert.equal(rows(interrupted)[0].mail_participant_etat, 'BLOCKED');
});

test('production refuses duplicates/full/closed and retains a durable reservation during quota deferral', () => {
  const h = setup({ quota: 5 }), c = h.command(); assert.equal(h.service.register(c).code, 'RECORDED'); h.copy.processPendingMail();
  assert.equal(h.copy.grouped().sessions[0].places_restantes, 0);
  assert.equal(h.service.register(h.command()).code, 'DUPLICATE'); assert.equal(h.service.register(h.command({ courriel: 'second@example.invalid' })).code, 'FULL');
  const closed = setup(), closedCommand = closed.command(); closed.tables['Disponibilités'][1][8] = false; assert.equal(closed.service.register(closedCommand).code, 'CLOSED');
});

test('production changed conditions during deferral block the stale participant message and restoring them never rearms it', () => {
  const h = setup({ quota: 5 }); h.service.register(h.command()); h.copy.processPendingMail();
  const original = h.tables.Formations[1][2]; h.tables.Formations[1][2] = 'Conditions actualisées'; h.state.quota = 100; h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_participant_etat, 'BLOCKED'); assert.equal(rows(h)[0].mail_participant_error_code, 'SESSION_CHANGED');
  h.tables.Formations[1][2] = original; h.state.now += 86400000; h.copy.processPendingMail();
  assert.equal(rows(h)[0].mail_participant_etat, 'BLOCKED'); assert.equal(h.messages.filter(m => m.to === 'participant@example.invalid').length, 0);
});

test('production captures all seven headers, warnings and native dimension metadata; Places restantes is hidden', () => {
  const h = setup(); assert.equal(h.context.TemaHeaders.capture(h.book).headers, 7);
  assert.equal(h.metadata.filter(m => m.dimension === 'row').length, 7); assert.equal(h.events.filter(e => e[0] === 'warning-protection').length, 7);
  assert.equal(h.events.filter(e => e[0] === 'write').length, 0, 'Capture must preserve all inherited cell values and notes');
  assert.ok(h.events.some(e => e[0] === 'hide-column' && e[1] === 'Disponibilités' && e[2] === 10));
  assert.throws(() => h.context.TemaHeaders.capture(h.book), /existe déjà/);
});

test('native metadata rejects bounded rectangles even when they span current grid dimensions', () => {
  const h = setup(), sheet = h.sheets.Formations;
  for (const range of [sheet.getRange(1, 1, 1, sheet.getMaxColumns()), sheet.getRange(1, 1, sheet.getMaxRows(), 1), sheet.getRange('A1:M1')]) {
    assert.throws(() => h.copy.lock(() => range.addDeveloperMetadata('bounded-fixture', 'rejected')), /arbitrary ranges.*entire row or column/);
  }
  assert.equal(h.metadata.length, 0);
});

for (const value of ['', 2, 'Autre titre']) test('production repairs known damaged header ' + JSON.stringify(value) + ' without changing business data', () => {
  const h = setup(); capture(h); const before = structuredClone(h.tables); changedCell(h, 'Disponibilités', 7, 10, value);
  assert.equal(h.context.TemaHeaders.repair(h.book), 1); assert.deepEqual(h.tables, before); assert.ok(h.properties.PRODUCTION_SOURCE_VERSION);
});

test('production restores before parsing a paste including a new business row', () => {
  const h = setup(); h.loadAdmin(); capture(h);
  changedCell(h, 'Disponibilités', 4, 10, 2);
  h.tables['Disponibilités'][4] = ['', 'DIMO-COPY-FIXTURE — ESSAI COPY — été', '2030-07-15', '09:30', '12:00', 8, 'presentiel', 'Lieu fictif', true, '', '', ''];
  const event = { source: h.book, range: h.sheets['Disponibilités'].getRange(4, 1, 2, 12) };
  h.context.onEdit(event); assert.equal(h.tables['Disponibilités'][3][9], 2); assert.equal(h.tables['Disponibilités'][4][0], '');
  assert.equal(h.events.filter(e => e[0].startsWith('api-')).length, 0);
  h.context.traiterSaisieFormationTema({ ...event, triggerUid: 'installed-owner-edit' });
  assert.equal(h.tables['Disponibilités'][3][9], 'Places restantes'); assert.match(h.tables['Disponibilités'][4][0], /^C-/); assert.equal(h.tables['Disponibilités'][4][9], 8);
});

test('production header row anchors follow row insertion', () => {
  const h = setup(); capture(h);
  h.copy.lock(() => h.sheets['Disponibilités'].insertRowsBefore(4, 2));
  changedCell(h, 'Disponibilités', 6, 10, ''); assert.equal(h.context.TemaHeaders.repair(h.book), 1);
  assert.equal(h.tables['Disponibilités'][5][9], 'Places restantes'); assert.equal(h.tables['Disponibilités'][6][0], 'C-COPY-FIXTURE-2');
});

test('production anchor follows a native row move and minute worker repairs a missed onEdit', () => {
  const h = setup(); capture(h);
  const header = h.tables['Disponibilités'].splice(3, 1)[0]; h.tables['Disponibilités'].splice(2, 0, header);
  h.metadata.find(m => m.value === 'R:Disponibilités:DIMO').position = 3;
  changedCell(h, 'Disponibilités', 3, 10, '');
  h.context.reconcilierProductionTema(); assert.equal(h.tables['Disponibilités'][2][9], 'Places restantes'); assert.equal(h.tables['Disponibilités'][4][0], 'C-COPY-FIXTURE-2');
});

test('production clears a whole header row safely and never parses its temporary damaged cells as business data', () => {
  const h = setup(); capture(h); const header = h.tables.Formations[3].slice(); h.tables.Formations[3].fill('');
  assert.equal(h.context.TemaHeaders.repair(h.book), header.length); assert.deepEqual(h.tables.Formations[3], header);
});

for (const damage of ['delete header row', 'delete column anchor', 'move column', 'duplicate metadata', 'move header contents', 'business row on anchor']) test('production ' + damage + ' diagnoses before any guessed sheet write', () => {
  const h = setup(); capture(h); changedCell(h, 'Disponibilités', 7, 10, '');
  if (damage === 'delete header row') h.copy.lock(() => h.sheets['Disponibilités'].deleteRows(4, 1));
  if (damage === 'delete column anchor') h.metadata.splice(h.metadata.findIndex(m => m.value === 'C:Disponibilités:10'), 1);
  if (damage === 'move column') h.metadata.find(m => m.value === 'C:Disponibilités:10').position = 11;
  if (damage === 'duplicate metadata') h.metadata.push({ ...h.metadata[0] });
  if (damage === 'move header contents') { h.tables.Formations.push([...h.tables.Formations[0]]); h.tables.Formations[0].fill(''); }
  if (damage === 'business row on anchor') h.tables.Formations[0] = [...h.tables.Formations[1]];
  h.events.length = 0; const before = structuredClone(h.tables);
  assert.throws(() => h.context.TemaHeaders.repair(h.book), /HEADERS_/);
  assert.deepEqual(h.tables, before); assert.equal(h.events.filter(e => e[0] === 'write').length, 0); assert.equal(h.properties.PRODUCTION_ADMIN_MAINTENANCE_PENDING, '1');
});

test('production concurrent header edit is preserved with maintenance pending', () => {
  const h = setup(); capture(h); changedCell(h, 'Disponibilités', 7, 10, '');
  const batchGet = h.context.Sheets.Spreadsheets.Values.batchGet; let reads = 0;
  h.context.Sheets.Spreadsheets.Values.batchGet = (...args) => { if (++reads === 2) h.tables['Disponibilités'][6][9] = 'Concurrent'; return batchGet(...args); };
  assert.throws(() => h.context.TemaHeaders.repair(h.book), /HEADERS_CONCURRENT/); assert.equal(h.tables['Disponibilités'][6][9], 'Concurrent');
  assert.equal(h.properties.PRODUCTION_ADMIN_MAINTENANCE_PENDING, '1'); assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
});

test('production structural failure reports unavailable with original request identity and preserves every row', () => {
  const h = setup(), command = h.command(); capture(h); h.metadata.splice(0, 1);
  const fields = { ...command, schema_version: '1', consentement: 'true', telephone: '', honeypot: '', form_started_at: command.anti_spam.form_started_at }; delete fields.anti_spam;
  const before = structuredClone(h.tables), reply = JSON.parse(h.context.doPost({ postData: { type: 'application/x-www-form-urlencoded', contents: new URLSearchParams(fields).toString() }, parameter: fields, parameters: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, [v]])) }).value);
  assert.equal(reply.code, 'UNAVAILABLE'); assert.equal(reply.request_id, command.request_id); assert.deepEqual(h.tables, before); assert.equal(h.messages.length, 0);
});

test('production native edit installer is owner-only, idempotent and preserves unrelated triggers', () => {
  const h = setup(); h.loadAdmin(); const created = [], removed = [], triggers = [];
  const trigger = (handler, id, type = 'ON_EDIT') => ({ getHandlerFunction: () => handler, getTriggerSourceId: () => id, getEventType: () => type });
  const unrelated = trigger('unrelated', h.book.getId()), otherBook = trigger('traiterSaisieFormationTema', 'other-book'); triggers.push(unrelated, otherBook);
  Object.assign(h.context.ScriptApp, { EventType: { ON_EDIT: 'ON_EDIT' }, getProjectTriggers: () => triggers, deleteTrigger(t) { removed.push(t); triggers.splice(triggers.indexOf(t), 1); }, newTrigger(handler) { let id; return { forSpreadsheet(value) { id = value; return this; }, onEdit() { return this; }, create() { const t = trigger(handler, id); triggers.push(t); created.push(t); return t; } }; } });
  h.context.installerEditionSaisieProductionTema(); h.context.installerEditionSaisieProductionTema();
  assert.equal(created.length, 1); assert.equal(removed.length, 0); assert.ok(triggers.includes(unrelated)); assert.ok(triggers.includes(otherBook));
  h.state.owner = 'another@example.invalid'; assert.throws(() => h.context.installerEditionSaisieProductionTema(), /PRIVATE_CONFIG/);
});

test('recent SENDING commitment reserves quota, stale claims release only capacity after execution/Google renewal', () => {
  const h = setup({ quota: 6 }), old = { id_inscription: 'I-historical', mail_participant_etat: 'SENDING', mail_participant_attempt_id: 'retained', mail_participant_attempt_at: new Date(h.state.now).toISOString() };
  const before = structuredClone(old);
  assert.equal(reserve(h, 'I-new', 'participant', [old]), 'MAIL_QUOTA');
  h.state.now += 10 * 60000; assert.equal(reserve(h, 'I-after-lifetime', 'participant', [old]), null);
  h.state.now += 86400000; assert.equal(reserve(h, 'I-after-provider-renewal', 'participant', [old]), null); assert.deepEqual(old, before);
});

for (const name of ['Formations', 'Disponibilités']) for (const id of ['', 'unknown']) test('business row with ' + JSON.stringify(id) + ' ID on ' + name + ' anchor is preserved', () => {
  const h = setup(); capture(h); h.tables[name][0] = h.tables[name][1].slice(); h.tables[name][0][0] = id; const before = structuredClone(h.tables);
  assert.throws(() => h.context.TemaHeaders.repair(h.book), /HEADERS_BUSINESS_ROW/); assert.deepEqual(h.tables, before); assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
});

test('moved Inscriptions header is unsupported and diagnosed before repairing another header', () => {
  const h = setup(); capture(h); h.copy.lock(() => h.sheets.Inscriptions.insertRowsBefore(1, 1)); changedCell(h); const before = structuredClone(h.tables); h.events.length = 0;
  assert.throws(() => h.context.TemaHeaders.repair(h.book), /HEADERS_REGISTRATION_POSITION/); assert.deepEqual(h.tables, before); assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
});

test('capture validates final cells/positions and aborts concurrent mutation without creating anchors', () => {
  const h = setup(), original = h.context.Sheets.Spreadsheets.Values.batchGet; let reads = 0;
  h.context.Sheets.Spreadsheets.Values.batchGet = (...args) => { if (++reads === 2) h.tables.Formations[0][0] = 'id'; return original(...args); };
  assert.throws(() => h.context.TemaHeaders.capture(h.book), /HEADERS_CONCURRENT/); assert.equal(h.tables.Formations[0][0], 'id'); assert.equal(h.metadata.length, 0); assert.equal(h.protections.length, 0);
  h.context.Sheets.Spreadsheets.Values.batchGet = original; assert.equal(h.context.TemaHeaders.capture(h.book).headers, 7);
});

test('partial capture cleans only its own anchors/protections and permits clean retry', () => {
  const h = setup(), update = h.context.Sheets.Spreadsheets.batchUpdate; let interrupted = false;
  h.metadata.push({ id: 900001, key: 'OTHER', value: 'keep', name: 'Formations', dimension: 'row', position: 2 });
  h.protections.push({ protectedRangeId: 900002, description: 'Human protection', range: { sheetId: h.sheets.Formations.getSheetId() } });
  h.context.Sheets.Spreadsheets.batchUpdate = (body, id) => { if (!interrupted) { interrupted = true; update({ requests: body.requests.slice(0, 5) }, id); throw Error('partial capture fixture'); } return update(body, id); };
  const before = structuredClone(h.tables); assert.throws(() => h.context.TemaHeaders.capture(h.book), /partial capture/);
  assert.deepEqual(h.tables, before); assert.equal(h.metadata.length, 1); assert.equal(h.metadata[0].key, 'OTHER'); assert.equal(h.protections.length, 1); assert.equal(h.protections[0].description, 'Human protection'); assert.equal(h.properties.PRODUCTION_HEADERS_CAPTURE_PENDING, undefined);
  h.context.Sheets.Spreadsheets.batchUpdate = update; assert.equal(h.context.TemaHeaders.capture(h.book).headers, 7);
});

test('mutation after anchor creation rolls back only created objects and preserves business data', () => {
  const h = setup(), update = h.context.Sheets.Spreadsheets.batchUpdate; let changed = false;
  h.context.Sheets.Spreadsheets.batchUpdate = (body, id) => { const r = update(body, id); if (!changed) { changed = true; h.tables.Formations[0] = h.tables.Formations[1].slice(); h.tables.Formations[0][0] = ''; } return r; };
  assert.throws(() => h.context.TemaHeaders.capture(h.book), /HEADERS_BUSINESS_ROW/); assert.equal(h.tables.Formations[0][2], 'ESSAI COPY — formation'); assert.equal(h.metadata.length, 0); assert.equal(h.protections.length, 0); assert.equal(h.properties.PRODUCTION_HEADERS_V1, undefined);
});

test('header checks batch provider reads and a damaged GET repairs before catalogue parsing', () => {
  const h = setup(); capture(h); h.book.createDeveloperMetadataFinder = () => { throw Error('No native metadata object loop'); };
  assert.equal(h.context.TemaHeaders.repair(h.book), 0);
  assert.equal(h.events.filter(e => e[0] === 'api-properties').length, 1); assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 1); assert.equal(h.events.filter(e => e[0] === 'api-values').length, 1); assert.equal(h.events.filter(e => e[0] === 'api-update').length, 0);
  h.events.length = 0; changedCell(h); const response = JSON.parse(h.context.doGet().value);
  assert.ok(Array.isArray(response.formations)); assert.equal(h.tables['Disponibilités'][6][9], 'Places restantes');
  assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 2); assert.equal(h.events.filter(e => e[0] === 'api-update').length, 1);
});

test('minute maintenance performs one fresh metadata scan even when administrative sync is required', () => {
  const h = setup(); capture(h); h.loadAdmin(); h.events.length = 0;
  h.context.reconcilierProductionTema();
  assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 1);
});

for (const damage of ['span', 'dimension', 'locationType', 'id', 'shape']) test('batched metadata provider rejects malformed ' + damage + ' before writes', () => {
  const h = setup(); capture(h); changedCell(h); const search = h.context.Sheets.Spreadsheets.DeveloperMetadata.search;
  h.context.Sheets.Spreadsheets.DeveloperMetadata.search = (...args) => { const data = search(...args), a = data.matchedDeveloperMetadata[0].developerMetadata; if (damage === 'span') a.location.dimensionRange.endIndex += 1; if (damage === 'dimension') a.location.dimensionRange.dimension = 'SHEET'; if (damage === 'locationType') a.location.locationType = 'SPREADSHEET'; if (damage === 'id') a.metadataId = 'not-a-number'; return damage === 'shape' ? { matchedDeveloperMetadata: {} } : data; };
  assert.throws(() => h.context.TemaHeaders.repair(h.book), /HEADERS_PROVIDER/); assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
});

test('private output guards reject actual symlink destinations and file redirects before changing victims', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-private-output-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const repoLink = path.join(dir, 'repository'); fs.symlinkSync(path.resolve(__dirname, '../..'), repoLink, 'dir');
  await assert.rejects(build({ target: newTarget, output: path.join(repoLink, 'no-write-fixture') }), /outside/);
  assert.throws(() => require('../scripts/build.cjs').build({ profile: validateTarget(newTarget), output: path.join(repoLink, 'no-write-fixture') }), /outside/);
  const victim = path.join(dir, 'victim'); fs.writeFileSync(victim, 'keep exact'); const bundle = path.join(dir, 'candidate'); fs.mkdirSync(bundle); fs.symlinkSync(victim, path.join(bundle, 'Code.gs'));
  await assert.rejects(build({ target: newTarget, output: bundle }), /symlink/); assert.equal(fs.readFileSync(victim, 'utf8'), 'keep exact');
  const site = path.join(dir, 'site-link'); fs.symlinkSync(bundle, site, 'dir'); assert.throws(() => require('../scripts/build.cjs').build({ profile: validateTarget(newTarget), output: site }), /symlink/); assert.equal(fs.readFileSync(victim, 'utf8'), 'keep exact');
});

test('explicit production preview serves built config/assets and denies all private backend artifacts', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-production-preview-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const candidate = await build({ target: newTarget, output: path.join(dir, 'bundle') });
  fs.symlinkSync(path.join(candidate.output, 'Code.gs'), path.join(candidate.output, 'site/web/assets/backend-redirect.txt'));
  const { createServer, productionRoot } = require('../scripts/serve.cjs'), server = createServer(productionRoot(candidate.output));
  const standalone = require('../scripts/build.cjs').build({ profile: validateTarget(newTarget), output: path.join(dir, 'standalone-web') }); assert.equal(productionRoot(standalone.output), fs.realpathSync(standalone.web));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); t.after(() => new Promise(resolve => server.close(resolve))); const origin = 'http://127.0.0.1:' + server.address().port;
  const config = await (await fetch(origin + '/config.js')).text(); assert.equal(config, fs.readFileSync(path.join(candidate.output, 'site/web/config.js'), 'utf8')); assert.match(config, /PRODUCTION/);
  assert.deepEqual(Buffer.from(await (await fetch(origin + '/assets/logo-tema.png')).arrayBuffer()), fs.readFileSync(path.join(candidate.output, 'site/web/assets/logo-tema.png')));
  for (const route of ['/Code.gs', '/SaisieNative.gs', '/candidate.json', '/appsscript.json', '/backups/Code.gs', '/assets/backend-redirect.txt']) assert.equal((await fetch(origin + route)).status, 404);
});

test('interrupted capture retains only its own journal and retry completes rollback before recapture', () => {
  const h = setup(), update = h.context.Sheets.Spreadsheets.batchUpdate, search = h.context.Sheets.Spreadsheets.DeveloperMetadata.search; let interrupted = false, cleanupBlocked = false;
  h.context.Sheets.Spreadsheets.batchUpdate = (body, id) => { if (!interrupted) { interrupted = true; update({ requests: body.requests.slice(0, 5) }, id); h.context.Sheets.Spreadsheets.DeveloperMetadata.search = () => { cleanupBlocked = true; throw Error('cleanup provider unavailable'); }; throw Error('capture interrupted'); } return update(body, id); };
  assert.throws(() => h.context.TemaHeaders.capture(h.book), /capture interrupted/); assert.equal(cleanupBlocked, true); assert.ok(h.properties.PRODUCTION_HEADERS_CAPTURE_PENDING); assert.ok(h.metadata.length > 0);
  h.context.Sheets.Spreadsheets.DeveloperMetadata.search = search; h.context.Sheets.Spreadsheets.batchUpdate = update;
  assert.equal(h.context.TemaHeaders.capture(h.book).headers, 7); assert.equal(h.metadata.length, 61); assert.equal(h.protections.length, 7); assert.equal(h.properties.PRODUCTION_HEADERS_CAPTURE_PENDING, undefined);
});

test('native metadata omitted default sheetId is accepted only for the independently attested gid0 sheet', () => {
  const h = setup(); h.sheets.Formations.getSheetId = () => 0; capture(h); const before = structuredClone(h.tables);
  const search = h.context.Sheets.Spreadsheets.DeveloperMetadata.search; let omitted = 0;
  h.context.Sheets.Spreadsheets.DeveloperMetadata.search = (...args) => { const result = search(...args); for (const match of result.matchedDeveloperMetadata) { const d = match.developerMetadata.location.dimensionRange; if (d.sheetId === 0) { delete d.sheetId; omitted++; } } return result; };
  assert.equal(h.context.TemaHeaders.repair(h.book), 0); assert.equal(omitted, 16); assert.deepEqual(h.tables, before); assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
  h.tables.Formations[0][0] = ''; assert.equal(h.context.TemaHeaders.repair(h.book), 1); assert.deepEqual(h.tables, before);
});

for (const zeroPresent of [false, true]) test('omitted metadata sheetId cannot select a nonzero sheet (zero present: ' + zeroPresent + ')', () => {
  const h = setup(); if (zeroPresent) h.sheets.Formations.getSheetId = () => 0; capture(h); const before = structuredClone(h.tables), search = h.context.Sheets.Spreadsheets.DeveloperMetadata.search;
  h.context.Sheets.Spreadsheets.DeveloperMetadata.search = (...args) => { const result = search(...args); const victim = result.matchedDeveloperMetadata.find(m => m.developerMetadata.metadataValue === 'C:Disponibilités:6'); delete victim.developerMetadata.location.dimensionRange.sheetId; return result; };
  assert.throws(() => h.context.TemaHeaders.repair(h.book), /HEADERS_PROVIDER/); assert.deepEqual(h.tables, before); assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
});

test('explicit null or string sheet IDs remain invalid even when the named sheet is gid0', () => {
  for (const invalid of [null, '0']) {
    const h = setup(); h.sheets.Formations.getSheetId = () => 0; capture(h); const search = h.context.Sheets.Spreadsheets.DeveloperMetadata.search;
    h.context.Sheets.Spreadsheets.DeveloperMetadata.search = (...args) => { const result = search(...args); result.matchedDeveloperMetadata.find(m => m.developerMetadata.metadataValue === 'C:Formations:6').developerMetadata.location.dimensionRange.sheetId = invalid; return result; };
    assert.throws(() => h.context.TemaHeaders.repair(h.book), /HEADERS_PROVIDER/); assert.equal(h.events.filter(e => e[0] === 'write').length, 0);
  }
});

for (const name of ['Formations', 'Disponibilités', 'Inscriptions']) test('production simple event on ' + name + ' only marks dirty without invoking authorized services', () => {
  const h = setup(); h.loadAdmin(); capture(h); const before = structuredClone(h.tables);
  function unavailable() { throw Error('LIMITED-auth event cannot invoke advanced Sheets API'); }
  h.context.Sheets.Spreadsheets.get = unavailable; h.context.Sheets.Spreadsheets.batchUpdate = unavailable; h.context.Sheets.Spreadsheets.DeveloperMetadata.search = unavailable; h.context.Sheets.Spreadsheets.Values.batchGet = unavailable;
  h.context.TemaRegistrationView.refresh = unavailable; h.book.toast = unavailable;
  h.context.onEdit({ source: h.book, range: h.sheets[name].getRange(2, 1), authMode: 'LIMITED' });
  assert.ok(h.properties.PRODUCTION_SOURCE_VERSION); assert.deepEqual(h.tables, before); assert.equal(h.events.filter(e => e[0] === 'write').length, 0); assert.equal(h.messages.length, 0);
});

test('existing installed production edit handler dispatches followup events while simple events stay inert', () => {
  const h = setup({ view: true }); h.loadAdmin(); let dispatched = 0;
  h.context.TemaRegistrationView.edited = event => { assert.equal(event.triggerUid, 'existing-owner-trigger'); dispatched++; return true; };
  const event = { source: h.book, range: h.sheets['Suivi des inscriptions'].getRange('B10') };
  h.context.onEdit(event); assert.equal(dispatched, 0);
  h.context.traiterSaisieFormationTema({ ...event, triggerUid: 'existing-owner-trigger', authMode: 'FULL' }); assert.equal(dispatched, 1);
});

function quietWorker(h) {
  capture(h); h.context.TemaHeaders.repair(h.book);
  Object.assign(h.properties, { PRODUCTION_ADMIN_MAINTENANCE_PENDING: '0', PRODUCTION_NATIVE_COUNTERS_PENDING: '0', PRODUCTION_VIEW_VERSION: h.copy.version(), PRODUCTION_VIEW_NEXT_CHANGE_AT: String(Number.MAX_SAFE_INTEGER) });
  // Isolate the header audit from the existing independent source/view audit.
  h.copy.reconcile = () => true;
  const poll = h.copy.processPendingMail; h.copy.processPendingMail = () => { h.events.push(['worker-mail-poll']); return poll(); };
  h.events.length = 0;
}

test('quiet minute worker skips header v4 reads between audit deadlines but keeps mail polling each minute', () => {
  const h = setup(); quietWorker(h); let mailReads = 0; const read = h.context.Sheets.Spreadsheets.Values.get;
  h.context.Sheets.Spreadsheets.Values.get = (...args) => { mailReads++; return read(...args); };
  for (let i = 0; i < 3; i++) { h.state.now += 60000; h.context.reconcilierProductionTema(); }
  assert.equal(h.events.filter(e => e[0] === 'api-metadata' || e[0] === 'api-properties' || e[0] === 'api-values').length, 0);
  assert.equal(h.events.filter(e => e[0] === 'worker-mail-poll').length, 3); assert.equal(mailReads, 1); assert.equal(h.messages.length, 0);
});

for (const reason of ['admin pending', 'counter pending', 'version mismatch', 'temporal boundary', 'missing timestamp', 'invalid timestamp', 'unbounded future timestamp']) test('minute header audit is forced by ' + reason, () => {
  const h = setup(); quietWorker(h);
  if (reason === 'admin pending') h.properties.PRODUCTION_ADMIN_MAINTENANCE_PENDING = '1';
  if (reason === 'counter pending') h.properties.PRODUCTION_NATIVE_COUNTERS_PENDING = '1';
  if (reason === 'version mismatch') h.properties.PRODUCTION_VIEW_VERSION = 'older-view';
  if (reason === 'temporal boundary') h.properties.PRODUCTION_VIEW_NEXT_CHANGE_AT = String(h.state.now);
  if (reason === 'missing timestamp') delete h.properties.PRODUCTION_HEADERS_AUDIT_AT;
  if (reason === 'invalid timestamp') h.properties.PRODUCTION_HEADERS_AUDIT_AT = 'invalid';
  if (reason === 'unbounded future timestamp') h.properties.PRODUCTION_HEADERS_AUDIT_AT = String(h.state.now + 86400000);
  h.context.reconcilierProductionTema();
  assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 1);
  assert.ok(h.events.findIndex(e => e[0] === 'api-metadata') < h.events.findIndex(e => e[0] === 'worker-mail-poll'));
});

test('new durable admission forces fresh headers before the unchanged minute mail poll', () => {
  const h = setup(); quietWorker(h); h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 0 });
  assert.equal(engine.createService(h.copy.dependencies({ deferDerived: true })).register(h.command()).code, 'RECORDED'); h.events.length = 0;
  h.context.reconcilierProductionTema();
  assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 1);
  assert.ok(h.events.findIndex(e => e[0] === 'api-metadata') < h.events.findIndex(e => e[0] === 'worker-mail-poll'));
  assert.equal(rows(h)[0].mail_participant_etat, 'PENDING'); assert.equal(h.messages.length, 0);
});

test('a missed header edit is repaired at the five-minute audit deadline without a source event', () => {
  const h = setup(); quietWorker(h); const deadline = Number(h.properties.PRODUCTION_HEADERS_AUDIT_AT); changedCell(h, 'Disponibilités', 7, 10, '');
  h.state.now = deadline - 1; h.context.reconcilierProductionTema(); assert.equal(h.tables['Disponibilités'][6][9], ''); assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 0);
  h.state.now = deadline; h.context.reconcilierProductionTema(); assert.equal(h.tables['Disponibilités'][6][9], 'Places restantes'); assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 2);
});

test('public GET repairs immediately despite a future idle audit timestamp', () => {
  const h = setup(); quietWorker(h); changedCell(h, 'Disponibilités', 7, 10, '');
  const response = JSON.parse(h.context.doGet().value); assert.ok(Array.isArray(response.formations)); assert.equal(h.tables['Disponibilités'][6][9], 'Places restantes'); assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 2);
});

test('public POST checks and repairs immediately despite a future idle audit timestamp', () => {
  const h = setup(); quietWorker(h); const command = h.command(); changedCell(h, 'Disponibilités', 7, 10, ''); h.events.length = 0;
  const fields = { ...command, schema_version: '1', consentement: 'true', telephone: '', honeypot: '', form_started_at: command.anti_spam.form_started_at }; delete fields.anti_spam;
  const response = JSON.parse(h.context.doPost({ postData: { type: 'application/x-www-form-urlencoded', contents: new URLSearchParams(fields).toString() }, parameter: fields, parameters: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, [v]])) }).value);
  assert.equal(response.code, 'RECORDED'); assert.equal(h.tables['Disponibilités'][6][9], 'Places restantes'); assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 2); assert.equal(h.messages.length, 0);
});

test('worker forwards the actual fresh-check result and never claims a skipped header audit', () => {
  const h = setup(); quietWorker(h); const received = []; h.copy.reconcile = checked => { received.push(checked); return true; };
  h.context.reconcilierProductionTema(); assert.deepEqual(received, [false]);
  h.properties.PRODUCTION_NATIVE_COUNTERS_PENDING = '1'; h.context.reconcilierProductionTema(); assert.deepEqual(received, [false, true]);
});

test('source audit revealing work after a skipped header audit forces repair before administrative parsing', () => {
  const h = setup(), reconcile = h.copy.reconcile; quietWorker(h); h.copy.reconcile = reconcile; h.loadAdmin();
  h.properties.PRODUCTION_AUDIT_AT = '0'; h.properties.PRODUCTION_VIEW_SOURCE_HASH = 'missed-source-edit'; changedCell(h, 'Disponibilités', 7, 10, '');
  const fingerprint = h.copy.adminFingerprint; h.copy.adminFingerprint = (...args) => { assert.equal(h.tables['Disponibilités'][6][9], 'Places restantes'); return fingerprint(...args); };
  const sync = h.context.TemaSheetPrototype.sync; let passed;
  h.context.TemaSheetPrototype.sync = (book, event, checked) => { passed = checked; return sync(book, event, checked); };
  h.context.reconcilierProductionTema(); assert.equal(passed, true); assert.equal(h.tables['Disponibilités'][6][9], 'Places restantes'); assert.equal(h.events.filter(e => e[0] === 'api-metadata').length, 2);
});

function cleanQueueView(h) { Object.assign(h.properties, { PRODUCTION_VIEW_VERSION: h.copy.version(), PRODUCTION_ADMIN_MAINTENANCE_PENDING: '0', PRODUCTION_NATIVE_COUNTERS_PENDING: '0' }); }
function mailScanCounter(h) { let count = 0; const read = h.context.Sheets.Spreadsheets.Values.get; h.context.Sheets.Spreadsheets.Values.get = (...args) => { count++; return read(...args); }; return () => count; }

test('production empty queue requires a real initial scan, then skips only until the five-minute deadline', () => {
  const h = setup(), scans = mailScanCounter(h); cleanQueueView(h);
  const properties = h.context.PropertiesService.getScriptProperties(), set = properties.setProperty;
  properties.setProperty = function (key, value) { if (key === 'PRODUCTION_MAIL_EMPTY_QUEUE_JSON') assert.equal(h.state.source, true, 'Empty acknowledgement owns admission lock'); return set.call(this, key, value); };
  h.copy.processPendingMail(); assert.equal(scans(), 1); const idle = JSON.parse(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON);
  assert.deepEqual(Object.keys(idle).sort(), ['activation_key', 'next_audit_ms', 'source_version', 'version']); assert.equal(idle.source_version, h.copy.version()); assert.match(idle.activation_key, /^[a-f0-9]{64}$/);
  h.state.now = idle.next_audit_ms - 1; h.copy.processPendingMail(); assert.equal(scans(), 1);
  h.state.now++; h.copy.processPendingMail(); assert.equal(scans(), 2); assert.equal(h.messages.length, 0);
});

test('admission immediately after an empty scan invalidates the watermark and remains processed next minute', () => {
  const h = setup(); cleanQueueView(h); h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 0 }); h.copy.processPendingMail();
  const idle = JSON.parse(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON);
  assert.equal(engine.createService(h.copy.dependencies({ deferDerived: true })).register(h.command()).code, 'RECORDED'); assert.notEqual(h.copy.version(), idle.source_version);
  const scans = mailScanCounter(h); h.copy.processPendingMail(); assert.ok(scans() > 0); assert.equal(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON, undefined); assert.equal(rows(h)[0].mail_participant_etat, 'PENDING'); assert.equal(h.messages.length, 0);
});

test('a version change during the empty scan cannot be acknowledged as an empty queue', () => {
  const h = setup(), read = h.context.Sheets.Spreadsheets.Values.get; cleanQueueView(h); let changed = false;
  h.context.Sheets.Spreadsheets.Values.get = (...args) => { const result = read(...args); if (!changed) { changed = true; h.copy.dirty(true); } return result; };
  h.copy.processPendingMail(); assert.equal(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON, undefined);
  cleanQueueView(h); h.copy.processPendingMail(); assert.equal(JSON.parse(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON).source_version, h.copy.version());
});

test('admission queued exactly after selection unlock cannot be hidden by the prior empty acknowledgement', () => {
  const h = setup(); cleanQueueView(h); h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 0 }); const command = h.command(), getLock = h.context.LockService.getScriptLock; let injected = false, receipt;
  h.context.LockService.getScriptLock = () => { const lock = getLock(); return { tryLock: (...args) => lock.tryLock(...args), releaseLock() { lock.releaseLock(); if (!injected) { injected = true; receipt = engine.createService(h.copy.dependencies({ deferDerived: true })).register(command); } } }; };
  h.copy.processPendingMail(); assert.equal(receipt.code, 'RECORDED'); assert.notEqual(JSON.parse(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON).source_version, h.copy.version());
  h.copy.processPendingMail(); assert.equal(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON, undefined); assert.equal(rows(h).length, 1); assert.equal(rows(h)[0].mail_participant_etat, 'PENDING'); assert.equal(h.messages.length, 0);
});

for (const flag of ['PRODUCTION_ADMIN_MAINTENANCE_PENDING', 'PRODUCTION_NATIVE_COUNTERS_PENDING']) test('pending flag invalidates an otherwise current empty watermark: ' + flag, () => {
  const h = setup(), scans = mailScanCounter(h); cleanQueueView(h); h.copy.processPendingMail(); h.properties[flag] = '1'; h.copy.processPendingMail(); assert.equal(scans(), 2);
});

test('activation changes invalidate an empty watermark without storing registration data', () => {
  const h = setup(), scans = mailScanCounter(h); cleanQueueView(h); h.copy.processPendingMail(); const original = JSON.parse(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON);
  h.properties.PRODUCTION_ASYNC_MAIL_JSON = JSON.stringify({ version: 1, activated_at_ms: h.state.now - 1, recovery_ids: [] }); h.copy.processPendingMail(); assert.equal(scans(), 2); assert.notEqual(JSON.parse(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON).activation_key, original.activation_key);
});

test('budget-deferred eligible PENDING is never marked empty and is inspected every minute', () => {
  const h = setup(); h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 0 }); engine.createService(h.copy.dependencies({ deferDerived: true })).register(h.command()); cleanQueueView(h); const scans = mailScanCounter(h);
  h.copy.processPendingMail(); const first = scans(); assert.equal(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON, undefined);
  h.state.now += 60000; h.copy.processPendingMail(); assert.ok(scans() > first); assert.equal(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON, undefined); assert.equal(rows(h)[0].mail_participant_etat, 'PENDING'); assert.equal(rows(h)[0].mail_participant_attempt_id, ''); assert.equal(h.messages.length, 0);
});

test('cancelled PENDING is suppressed before an empty watermark is allowed; ambiguous SENDING is never retried', () => {
  const h = setup(); h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 0 }); h.service.register(h.command()); const id = rows(h)[0].id_inscription; patch(h, id, { statut: 'annulee' });
  h.copy.processPendingMail(); assert.equal(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON, undefined); assert.equal(rows(h)[0].mail_participant_etat, 'SUPPRESSED');
  h.copy.processPendingMail(); assert.ok(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON); assert.equal(h.messages.length, 0);
  const sending = setup(); sending.service.register(sending.command()); const r = rows(sending)[0]; patch(sending, r.id_inscription, { mail_participant_etat: 'SENDING', mail_tema_etat: 'SENDING', mail_participant_attempt_id: 'retain-attempt', mail_participant_attempt_at: new Date(sending.state.now).toISOString() }); cleanQueueView(sending);
  const before = structuredClone(sending.tables.Inscriptions), scans = mailScanCounter(sending); sending.copy.processPendingMail(); sending.copy.processPendingMail(); assert.equal(scans(), 1); assert.deepEqual(sending.tables.Inscriptions, before); assert.equal(sending.messages.length, 0);
});

function readyFastWorker(h) {
  quietWorker(h); h.properties.PRODUCTION_NOTICE_PENDING = '0'; h.properties.PRODUCTION_AUDIT_AT = String(h.state.now + 300000);
  h.copy.processPendingMail(); h.events.length = 0;
}

test('clean production worker uses one fresh properties snapshot and zero guards, locks or Sheets calls', () => {
  const h = setup(); readyFastWorker(h); const before = structuredClone(h.tables), properties = h.context.PropertiesService.getScriptProperties();
  const unavailable = () => { throw Error('Clean fast worker must not access individual properties, locks or Sheets'); };
  properties.getProperty = unavailable; h.context.LockService.getScriptLock = unavailable; h.context.SpreadsheetApp.openById = unavailable;
  h.context.Sheets.Spreadsheets.get = unavailable; h.context.Sheets.Spreadsheets.DeveloperMetadata.search = unavailable; h.context.Sheets.Spreadsheets.Values.get = unavailable; h.context.Sheets.Spreadsheets.Values.batchGet = unavailable;
  assert.equal(h.context.reconcilierProductionTema(), true); assert.equal(h.events.filter(e => e[0] === 'properties-snapshot').length, 1); assert.equal(h.events.filter(e => e[0] === 'worker-mail-poll').length, 0); assert.deepEqual(h.tables, before); assert.equal(h.messages.length, 0);
});

for (const field of ['ENVIRONMENT', 'SPREADSHEET_ID', 'script']) test('fast worker and preparation pause refuse incorrect identity: ' + field, () => {
  const h = setup(); readyFastWorker(h); h.properties.PRODUCTION_WORKER_PAUSED = '1';
  if (field === 'script') h.state.script = 'wrong-script'; else h.properties[field] = 'wrong-value';
  assert.throws(() => h.context.reconcilierProductionTema(), /ENVIRONMENT/); assert.equal(h.events.filter(e => e[0] === 'properties-snapshot').length, 1); assert.equal(h.messages.length, 0);
});

for (const reason of ['admin', 'counters', 'notice', 'versions', 'diagnostic', 'header deadline', 'source deadline', 'queue deadline', 'temporal deadline', 'invalid config', 'invalid cursor', 'activation hash']) test('fast worker falls back to existing processing for ' + reason, () => {
  const h = setup(); readyFastWorker(h);
  if (reason === 'admin') h.properties.PRODUCTION_ADMIN_MAINTENANCE_PENDING = '1';
  if (reason === 'counters') h.properties.PRODUCTION_NATIVE_COUNTERS_PENDING = '1';
  if (reason === 'notice') h.properties.PRODUCTION_NOTICE_PENDING = '1';
  if (reason === 'versions') h.properties.PRODUCTION_VIEW_VERSION = 'old';
  if (reason === 'diagnostic') h.properties.PRODUCTION_HEADERS_DIAGNOSTIC = 'check';
  if (reason === 'header deadline') h.properties.PRODUCTION_HEADERS_AUDIT_AT = String(h.state.now);
  if (reason === 'source deadline') h.properties.PRODUCTION_AUDIT_AT = String(h.state.now);
  if (reason === 'queue deadline') { const marker = JSON.parse(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON); marker.next_audit_ms = h.state.now; h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON = JSON.stringify(marker); }
  if (reason === 'temporal deadline') h.properties.PRODUCTION_VIEW_NEXT_CHANGE_AT = String(h.state.now);
  if (reason === 'invalid config') h.properties.PRODUCTION_ASYNC_MAIL_JSON = '{}';
  if (reason === 'invalid cursor') h.properties.PRODUCTION_ASYNC_MAIL_CURSOR = '01';
  if (reason === 'activation hash') { const marker = JSON.parse(h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON); marker.activation_key = 'invalid'; h.properties.PRODUCTION_MAIL_EMPTY_QUEUE_JSON = JSON.stringify(marker); }
  h.context.reconcilierProductionTema(); assert.equal(h.events.filter(e => e[0] === 'worker-mail-poll').length, 1); assert.equal(h.events.filter(e => e[0] === 'properties-snapshot').length, 1);
});

test('new admission invalidates the single-snapshot fast worker immediately', () => {
  const h = setup(); readyFastWorker(h); h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 0 });
  assert.equal(engine.createService(h.copy.dependencies({ deferDerived: true })).register(h.command()).code, 'RECORDED'); h.events.length = 0;
  h.context.reconcilierProductionTema(); assert.equal(h.events.filter(e => e[0] === 'worker-mail-poll').length, 1); assert.equal(rows(h)[0].mail_participant_etat, 'PENDING'); assert.equal(h.messages.length, 0);
});

test('admission immediately after a control snapshot remains durable and is picked up on the next tick', () => {
  const h = setup(); readyFastWorker(h); h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ ...LIMITS, recipients: 0 }); const command = h.command(), properties = h.context.PropertiesService.getScriptProperties(), get = properties.getProperties; let inserted = false;
  properties.getProperties = () => { const snapshot = get.call(properties); if (!inserted) { inserted = true; assert.equal(engine.createService(h.copy.dependencies({ deferDerived: true })).register(command).code, 'RECORDED'); } return snapshot; };
  h.context.reconcilierProductionTema(); assert.equal(h.events.filter(e => e[0] === 'worker-mail-poll').length, 0); assert.equal(rows(h).length, 1);
  h.events.length = 0; h.context.reconcilierProductionTema(); assert.equal(h.events.filter(e => e[0] === 'worker-mail-poll').length, 1); assert.equal(rows(h)[0].mail_participant_etat, 'PENDING'); assert.equal(h.messages.length, 0);
});

test('preparation pause uses only one identity-checked snapshot and preserves all rows and attempts', () => {
  const h = setup(); h.service.register(h.command()); const id = rows(h)[0].id_inscription; patch(h, id, { mail_participant_etat: 'SENDING', mail_participant_attempt_id: 'preserve-attempt' }); h.properties.PRODUCTION_WORKER_PAUSED = '1'; delete h.properties.PRODUCTION_ASYNC_MAIL_JSON;
  const before = structuredClone(h.tables); h.events.length = 0;
  h.context.PropertiesService.getScriptProperties().getProperty = () => { throw Error('Paused worker must not read more properties'); };
  assert.equal(h.context.reconcilierProductionTema(), true); assert.equal(h.events.filter(e => e[0] === 'properties-snapshot').length, 1); assert.deepEqual(h.tables, before); assert.equal(h.messages.length, 0);
});

test('COPY worker never reads the production control snapshot or preparation pause', () => {
  const h = harness(); let polls = 0; h.context.PropertiesService.getScriptProperties().getProperties = () => { throw Error('COPY path must stay unchanged'); }; h.copy.processPendingMail = () => { polls++; }; h.copy.reconcile = () => true;
  assert.equal(h.context.reconcilierCopieTema(), true); assert.equal(polls, 1);
});
