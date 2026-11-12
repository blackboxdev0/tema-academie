'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const profile = require('../scripts/local-profile.cjs');
const project = require('../../config/project.json');
const fake = 'https://script.google.com/macros/s/COPY_LOCAL_FIXTURE/exec';
const old = project.google.resources.environments.TEST.web_app_url;
function run(file, extra = {}, args = ['show']) {
  const env = { ...process.env, TEMA_LOCAL_PROFILE_PATH: file, ...extra };
  delete env.TEMA_COPY_RECIPE_PATH;
  if (!Object.hasOwn(extra, 'TEMA_TEST_API_URL')) delete env.TEMA_TEST_API_URL;
  if (!Object.hasOwn(extra, 'TEMA_COPY_API_URL')) delete env.TEMA_COPY_API_URL;
  return spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/local-profile.cjs'), ...args], { env, encoding: 'utf8' });
}
test('COPY profile persists privately, survives later builds and refuses silent overrides', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-copy-profile-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'profile.json');
  assert.equal(run(file).status, 0); assert.equal(JSON.parse(run(file).stdout).environment, 'TEST');
  assert.equal(run(file, {}, ['copy', fake]).status, 0);
  const saved = fs.readFileSync(file, 'utf8');
  assert.equal(JSON.parse(run(file).stdout).apiUrl, fake);
  assert.equal(run(file, { TEMA_TEST_API_URL: old }).status, 1);
  assert.equal(run(file, { TEMA_COPY_API_URL: old }).status, 1);
  assert.equal(fs.readFileSync(file, 'utf8'), saved);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  assert.equal(run(file, {}, ['test']).status, 0);
  assert.equal(JSON.parse(run(file).stdout).apiUrl, old);
});
test('bad or incomplete profiles fail closed, including a COPY URL equal to old TEST', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-copy-invalid-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'profile.json');
  for (const candidate of [null, {}, { version: 1, environment: 'COPY', apiUrl: fake }, { version: 1, environment: 'COPY', apiUrl: old, spreadsheetId: profile.COPY.spreadsheet, scriptId: profile.COPY.script }, { version: 1, environment: 'TEST', apiUrl: fake }]) {
    assert.throws(() => profile.validate(candidate));
  }
  fs.writeFileSync(file, '{invalid'); assert.equal(run(file).status, 1);
  fs.unlinkSync(file); assert.equal(run(file, { TEMA_COPY_API_URL: fake }).status, 1);
  assert.equal(fs.existsSync(file), false);
});
test('a selectable COPY URL does not authorize POST without independent deployment evidence matching this candidate', () => {
  const selected = { version: 1, environment: 'COPY', apiUrl: fake, spreadsheetId: profile.COPY.spreadsheet, scriptId: profile.COPY.script };
  const candidate = { canonicalSha256: 'a'.repeat(64) };
  const proof = { version: 1, method: 'native-google-deployment-ui', apiUrl: fake, spreadsheetId: profile.COPY.spreadsheet, scriptId: profile.COPY.script, deploymentVersion: 1, verifiedAt: '2026-11-04T00:00:00Z', canonicalSha256: candidate.canonicalSha256 };
  assert.equal(profile.verifyCopyDeployment(selected, proof, candidate), proof);
  for (const bad of [null, { ...proof, apiUrl: old }, { ...proof, scriptId: 'other' }, { ...proof, canonicalSha256: 'b'.repeat(64) }, { ...proof, method: 'local-profile' }, { ...proof, verifiedAt: '2099-01-01T00:00:00Z' }]) assert.throws(() => profile.verifyCopyDeployment(selected, bad, candidate));
});
test('COPY static build explicitly labels its TEST reference backend without changing the real preview', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-copy-build-profile-')); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const app = path.join(dir, 'app'), scripts = path.join(app, 'scripts'); fs.mkdirSync(scripts, { recursive: true }); fs.mkdirSync(path.join(dir, 'config'));
  fs.writeFileSync(path.join(dir, 'config/project.json'), JSON.stringify(project));
  for (const file of ['build.cjs', 'local-profile.cjs']) fs.copyFileSync(path.resolve(__dirname, '../scripts', file), path.join(scripts, file));
  fs.mkdirSync(path.join(app, 'web')); fs.writeFileSync(path.join(app, 'web/index.html'), '<!doctype html>');
  fs.mkdirSync(path.join(app, 'apps-script'));
  for (const file of ['engine.js', 'google.js', 'catalogue.js', 'appsscript.json']) fs.copyFileSync(path.resolve(__dirname, '../apps-script', file), path.join(app, 'apps-script', file));
  const file = path.join(dir, 'profile.json'); assert.equal(run(file, {}, ['copy', fake]).status, 0);
  const result = spawnSync(process.execPath, [path.join(scripts, 'build.cjs')], { encoding: 'utf8', env: { ...process.env, TEMA_LOCAL_PROFILE_PATH: file, TEMA_TEST_API_URL: fake } });
  assert.equal(result.status, 0, result.stderr); assert.ok(fs.existsSync(path.join(app, 'dist/apps-script-TEST-reference/Code.gs'))); assert.equal(fs.existsSync(path.join(app, 'dist/apps-script/Code.gs')), false);
  assert.match(result.stdout, /Ne pas installer la référence TEST/);
});
