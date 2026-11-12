'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const recovery = require('../scripts/copy-recovery.cjs');
const endpoint = 'https://script.google.com/macros/s/COPY-LOCAL-FIXTURE/exec';
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-copy-recovery-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const recipe = path.join(dir, 'recipe.json');
  fs.writeFileSync(recipe, JSON.stringify({ apiUrl: endpoint, formationId: 'RECETTE', sessionIds: ['a', 'b', 'c'] }));
  return recipe;
}
test('the original UUID and body survive a response failure before a receipt exists', async t => {
  const recipe = fixture(t), page = new EventEmitter(), original = 'request_id=a0000000-0000-4000-8000-000000000001&nom=Fixture';
  recovery.requireNewAttempt(recipe); const captured = recovery.captureAttempt(page, recipe, endpoint);
  await assert.rejects(async () => {
    page.emit('request', { method: () => 'POST', url: () => endpoint, postData: () => original });
    assert.equal(fs.readFileSync(recipe + '.post.private.txt', 'utf8'), original);
    throw Error('response interrupted');
  }, /response interrupted/);
  assert.equal(captured(), original); assert.equal(fs.statSync(recipe + '.post.private.txt').mode & 0o777, 0o600);
  page.emit('request', { method: () => 'POST', url: () => endpoint, postData: () => original });
  assert.throws(() => page.emit('request', { method: () => 'POST', url: () => endpoint, postData: () => 'request_id=other' }), /MUST_NOT_BE_REPLACED/);
  assert.equal(fs.readFileSync(recipe + '.post.private.txt', 'utf8'), original);
});
test('the actual campaign refuses a saved attempt before launching any browser', async t => {
  const recipe = fixture(t); fs.writeFileSync(recipe + '.post.private.txt', 'request_id=original');
  let launches = 0; const script = path.resolve(__dirname, '../scripts/real-copy-browser.cjs');
  const fakeProcess = { env: { TEMA_COPY_RECIPE_PATH: recipe }, argv: ['node', script, '--submit'], exitCode: 0 };
  const pending = vm.runInNewContext(fs.readFileSync(script, 'utf8'), {
    __dirname: path.dirname(script), process: fakeProcess, console: { log() {}, error() {} },
    require(name) {
      if (name === '@playwright/test') return { chromium: { launch() { launches++; throw Error('No browser allowed'); } }, devices: {} };
      if (name === './local-profile.cjs') return { resolve: () => ({ environment: 'COPY', apiUrl: endpoint }), requireVerifiedCopy() {} };
      if (name === './copy-recovery.cjs') return recovery;
      return require(name);
    }
  });
  await pending; assert.equal(fakeProcess.exitCode, 1); assert.equal(launches, 0);
  assert.equal(fs.readFileSync(recipe + '.post.private.txt', 'utf8'), 'request_id=original');
});
test('the actual campaign saves its POST when the response is interrupted', async t => {
  const recipe = fixture(t), original = 'request_id=a0000000-0000-4000-8000-000000000003&nom=Fixture';
  const data = JSON.parse(fs.readFileSync(recipe, 'utf8'));
  data.participant = { prenom: 'Recette', nom: 'Fixture', entreprise: 'RECETTE', courriel: 'fixture@example.invalid' };
  fs.writeFileSync(recipe, JSON.stringify(data));
  const page = new EventEmitter(); let responses = 0, rejectPost, closed = false;
  const catalogue = { schema_version: 1, formations: [{ id: 'RECETTE', titre: 'RECETTE' }], sessions: ['a', 'b', 'c'].map(id_cohorte => ({ id_cohorte, formation: 'RECETTE' })) };
  page.setDefaultTimeout = () => {};
  page.goto = page.reload = page.waitForTimeout = async () => {};
  page.evaluate = async () => endpoint;
  page.waitForResponse = () => ++responses < 4 ? Promise.resolve({ json: async () => catalogue }) : new Promise((_, reject) => { rejectPost = reject; });
  page.locator = selector => {
    const locator = { first: () => locator, waitFor: async () => {}, fill: async () => {}, check: async () => {}, click: async () => {
      assert.equal(selector, '#submit');
      page.emit('request', { method: () => 'POST', url: () => endpoint, postData: () => original });
      rejectPost(Error('response interrupted'));
    } };
    return locator;
  };
  const script = path.resolve(__dirname, '../scripts/real-copy-browser.cjs'), fakeProcess = { env: { TEMA_COPY_RECIPE_PATH: recipe }, argv: ['node', script, '--submit'], exitCode: 0 };
  const pending = vm.runInNewContext(fs.readFileSync(script, 'utf8'), {
    __dirname: path.dirname(script), process: fakeProcess, performance, console: { log() {}, error() {} },
    require(name) {
      if (name === '@playwright/test') return { chromium: { launch: async () => ({ newContext: async () => ({ newPage: async () => page }), close: async () => { closed = true; } }) }, devices: { 'Desktop Chrome': {}, 'Pixel 7': {} } };
      if (name === './local-profile.cjs') return { resolve: () => ({ environment: 'COPY', apiUrl: endpoint }), requireVerifiedCopy() {} };
      if (name === './copy-recovery.cjs') return recovery;
      return require(name);
    }
  });
  await pending; assert.equal(fakeProcess.exitCode, 1); assert.equal(responses, 4); assert.equal(closed, true);
  assert.equal(fs.readFileSync(recipe + '.post.private.txt', 'utf8'), original);
  assert.equal(fs.existsSync(recipe + '.result.json'), false);
});
