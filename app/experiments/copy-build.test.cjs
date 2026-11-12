'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { build } = require('./build-copy-backend.cjs');
const hash = v => crypto.createHash('sha256').update(v).digest('hex');
test('COPY bundle preserves buttons and native entries without historical TEST repair; complete backup stays private', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tema-copy-build-')); t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const codeFile = path.join(dir, 'before.gs'), manifestFile = path.join(dir, 'before.json');
  const prior = 'function priorCopyOnly() {}\n', priorManifest = '{"runtimeVersion":"V8"}';
  await fs.writeFile(codeFile, prior); await fs.writeFile(manifestFile, priorManifest);
  const result = await build({ output: path.join(dir, 'candidate'), backupCode: codeFile, backupManifest: manifestFile });
  const code = await fs.readFile(path.join(result.output, 'Code.gs'), 'utf8');
  const logoMatch = code.match(/var TEMA_MAIL_LOGO_PNG = ("[^"]*");/);
  assert.ok(logoMatch, 'logo intégré au bundle');
  assert.ok(Buffer.from(JSON.parse(logoMatch[1]), 'base64').equals(await fs.readFile(path.join(__dirname, '../web/assets/logo-tema.png'))));
  const h = require('./copy-helpers.cjs').harness({ properties: {
    ALLOWED_RECIPIENTS_JSON: JSON.stringify(['participant@example.invalid', 'temaacademie@gmail.com']),
    COPY_MAIL_LIMITS_JSON: JSON.stringify({ registrations: 1, recipients: 2 })
  } });
  vm.runInNewContext(code, h.context);
  const configuration = h.context.TemaCopyConfig.read();
  assert.deepEqual(JSON.parse(JSON.stringify(configuration)), {
    admissions_mode: 'demo', courriel_contact: 'temaacademie@gmail.com', courriel_avis_tema: 'temaacademie@gmail.com',
    nom_expediteur: 'Tema Académie', politique_url: 'https://example.invalid/politique-essai', politique_version: 'TEST-1',
    softwares: [{ id: 'DIV', label: 'Divalto' }, { id: 'DIMO', label: 'Dimo' }, { id: 'MOOV', label: 'MoovApps' }]
  });
  configuration.softwares[0].label = 'changed'; configuration.politique_version = 'changed';
  assert.equal(h.context.TemaCopyConfig.read().softwares[0].label, 'Divalto');
  assert.equal(h.context.TemaCopyConfig.read().politique_version, 'TEST-1');
  const deps = h.context.TemaCopy.dependencies(), service = h.context.TemaTrial.createService(deps);
  const command = h.command(), receipt = service.submit(command);
  assert.equal(receipt.code, 'RECORDED'); assert.equal(receipt.mail_status, 'SENT');
  assert.deepEqual(h.messages.map(message => message.to), ['participant@example.invalid', 'temaacademie@gmail.com']);
  const data = deps.store.read(), registration = data.registrations[0];
  assert.equal(registration.politique_version, 'TEST-1');
  assert.equal(registration.mail_participant_etat, 'SENT'); assert.equal(registration.mail_tema_etat, 'SENT');
  assert.deepEqual(JSON.parse(h.properties.COPY_MAIL_BUDGET_JSON), {
    version: 1, registrations: { [registration.id_inscription]: { participant: true, tema: true } }, recipients: 2
  });
  const catalogue = service.catalogue();
  assert.deepEqual(JSON.parse(JSON.stringify(catalogue.contact)), { courriel: 'temaacademie@gmail.com' });
  assert.deepEqual(JSON.parse(JSON.stringify(catalogue.policy)), { url: 'https://example.invalid/politique-essai', version: 'TEST-1' });
  for (const message of h.messages) {
    assert.equal(message.name, 'Tema Académie');
    assert.ok(!/\[(?:TEST|COPY)\]/.test(message.subject));
  }
  assert.match(h.messages[0].htmlBody, /mailto:temaacademie%40gmail\.com/);
  const budget = h.properties.COPY_MAIL_BUDGET_JSON;
  assert.equal(service.submit(command).code, 'REPLAY');
  assert.equal(h.messages.length, 2); assert.equal(h.properties.COPY_MAIL_BUDGET_JSON, budget);
  assert.equal(h.messages[0].name, 'Tema Académie'); // Explicit editorial sender without a dash.
  assert.match(h.messages[0].body, /temaacademie@gmail\.com/);
  assert.ok(h.messages[0].htmlBody.includes('src="cid:temaLogo"'));
  assert.equal(h.messages[0].inlineImages.temaLogo.contentType, 'image/png');
  assert.equal(h.messages[0].inlineImages.temaLogo.name, 'logo-tema.png');
  assert.ok(Buffer.from(h.messages[0].inlineImages.temaLogo.bytes).equals(await fs.readFile(path.join(__dirname, '../web/assets/logo-tema.png'))));
  new vm.Script(code); assert.equal(hash(code), result.codeSha256); assert.equal(result.googleChanged, false);
  for (const name of ['function doGet(', 'function doPost(', 'function ajouterUneFormation(', 'function ajouterUneSession(', 'function actualiserLeSuiviInscriptions(', 'TEMA_ADMIN_DIALOG', 'TEMA_ADMIN_BUTTONS']) assert.ok(code.includes(name), name);
  for (const forbidden of ['TEMA_TRIAL_TARGET', 'function installTrial(', 'function reconcileTrial(', '@OnlyCurrentDoc']) assert.ok(!code.includes(forbidden), forbidden);
  const manifest = JSON.parse(await fs.readFile(path.join(result.output, 'appsscript.json'), 'utf8'));
  assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/userinfo.email'));
  assert.equal(manifest.dependencies.enabledAdvancedServices[0].version, 'v4');
  const folders = await fs.readdir(path.join(result.output, 'backups')); assert.equal(folders.length, 1);
  const backup = path.join(result.output, 'backups', folders[0]);
  assert.equal(await fs.readFile(path.join(backup, 'Code.gs'), 'utf8'), prior);
  assert.equal(await fs.readFile(path.join(backup, 'appsscript.json'), 'utf8'), priorManifest);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(backup, 'integrity.json'), 'utf8')), { codeSha256: hash(prior), manifestSha256: hash(priorManifest) });
  assert.equal((await fs.stat(path.join(result.output, 'Code.gs'))).mode & 0o777, 0o600);
  await assert.rejects(build({ output: path.resolve(__dirname, '../dist-copy-unsafe') }), /outside/);
  await assert.rejects(build({ output: path.join(dir, 'incomplete'), backupCode: codeFile }), /both/);
});
