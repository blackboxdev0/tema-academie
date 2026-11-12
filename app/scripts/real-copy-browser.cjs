'use strict';
// Recette volontaire : aucune interception réseau, aucun accès privé Google.
// Les ajouts et exports natifs sont réalisés par le pilote avant/après ce runner.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, firefox, webkit, devices } = require('@playwright/test');
const profiles = require('./local-profile.cjs');
const recovery = require('./copy-recovery.cjs');
const profile = profiles.resolve();
let stage = 'configuration';
const sameApi = (response, method) => {
  let request = response.request();
  while (request.redirectedFrom()) request = request.redirectedFrom();
  return response.status() === 200 && request.method() === method && request.url() === profile.apiUrl;
};
async function run() {
  assert.equal(profile.environment, 'COPY', 'COPY_PROFILE_REQUIRED');
  const base = process.env.TEMA_COPY_SITE_URL || 'http://127.0.0.1:4173';
  assert.match(base, /^http:\/\/127\.0\.0\.1:\d+\/?$/, 'LOCAL_SITE_REQUIRED');
  const recipeFile = process.env.TEMA_COPY_RECIPE_PATH;
  assert.ok(recipeFile, 'PRIVATE_RECIPE_REQUIRED');
  const repository = path.resolve(__dirname, '../..');
  const privateFile = fs.realpathSync(recipeFile);
  assert.ok(privateFile !== repository && !privateFile.startsWith(repository + path.sep), 'RECIPE_MUST_STAY_OUTSIDE_REPOSITORY');
  const recipe = JSON.parse(fs.readFileSync(recipeFile, 'utf8'));
  assert.equal(recipe.apiUrl, profile.apiUrl, 'RECIPE_ENDPOINT_MISMATCH');
  assert.equal(typeof recipe.formationId, 'string');
  assert.equal(new Set(recipe.sessionIds).size, 3, 'THREE_DISTINCT_RECIPE_SESSIONS_REQUIRED');
  assert.equal(recipe.sessionIds.length, 3);
  const submit = process.argv.includes('--submit');
  if (submit) { profiles.requireVerifiedCopy(profile); recovery.requireNewAttempt(privateFile); }
  const results = [];
  const targets = [{ name: 'chromium', type: chromium, device: 'Desktop Chrome' }, { name: 'mobile-chromium', type: chromium, device: 'Pixel 7' }];
  if (process.env.TEMA_BROWSER_MATRIX === 'all') targets.push({ name: 'firefox', type: firefox, device: 'Desktop Firefox' }, { name: 'webkit', type: webkit, device: 'Desktop Safari' });
  for (const target of targets) {
    stage = target.name + ':configuration';
    const browser = await target.type.launch();
    try {
      const context = await browser.newContext({ ...devices[target.device] });
      const page = await context.newPage();
      page.setDefaultTimeout(45000);
      const firstFresh = page.waitForResponse(r => sameApi(r, 'GET'), { timeout: 45000 });
      const start = performance.now(); await page.goto(base, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.evaluate(() => window.TEMA_CONFIG.apiUrl), profile.apiUrl);
      stage = target.name + ':catalogue';
      const catalogue = await (await firstFresh).json();
      assert.equal(catalogue.schema_version, 1); assert.ok(Array.isArray(catalogue.formations));
      const formation = catalogue.formations.find(f => f.id === recipe.formationId);
      assert.ok(formation && /ESSAI|RECETTE/i.test(formation.titre), 'MARKED_RECIPE_FORMATION_REQUIRED');
      for (const id of recipe.sessionIds) assert.ok(catalogue.sessions.some(s => s.id_cohorte === id && s.formation === recipe.formationId), 'RECIPE_SESSION_MISSING');
      await page.locator('.card').first().waitFor();
      const firstCardsMs = Math.round(performance.now() - start);
      const nextFresh = page.waitForResponse(r => sameApi(r, 'GET'), { timeout: 45000 });
      const reload = performance.now(); await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('.card').first().waitFor();
      const cachedCardsMs = Math.round(performance.now() - reload);
      await nextFresh;
      assert.ok(cachedCardsMs < 1000, 'CACHED_CARDS_OVER_ONE_SECOND');
      const result = { browser: target.name, firstCardsMs, cachedCardsMs, realRead: true, posts: 0 };
      if (submit && target.name === 'chromium') {
        stage = 'chromium:admission';
        const person = recipe.participant;
        assert.ok(person && ['prenom', 'nom', 'entreprise', 'courriel'].every(k => typeof person[k] === 'string' && person[k].trim()), 'PRIVATE_PARTICIPANT_REQUIRED');
        await page.goto(base + '/#formation=' + encodeURIComponent(recipe.formationId) + '&date=' + encodeURIComponent(recipe.sessionIds[0]) + '&vue=inscription', { waitUntil: 'domcontentloaded' });
        // A hash navigation reuses the existing document and does not fetch.
        // Reload deliberately to exercise a cached form followed by fresh data.
        stage = 'chromium:form-fresh-read';
        const fresh = page.waitForResponse(r => sameApi(r, 'GET'), { timeout: 45000 });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await fresh;
        stage = 'chromium:form-fill';
        for (const k of ['prenom', 'nom', 'entreprise', 'courriel']) await page.locator('#' + k).fill(person[k]);
        if (person.telephone) await page.locator('#telephone').fill(person.telephone);
        await page.locator('#consentement').check(); await page.waitForTimeout(1100);
        const postedBody = recovery.captureAttempt(page, privateFile, profile.apiUrl);
        stage = 'chromium:form-post';
        const response = page.waitForResponse(r => sameApi(r, 'POST'), { timeout: 60000 });
        const sent = performance.now(); await page.locator('#submit').click();
        const receipt = await (await response).json();
        assert.equal(receipt.code, 'RECORDED', 'NEW_RECIPE_ADMISSION_REQUIRED');
        await page.locator('#result-title').filter({ hasText: 'Votre place est réservée' }).waitFor();
        const posted = postedBody(); assert.ok(posted, 'REAL_BROWSER_POST_REQUIRED');
        result.admissionMs = Math.round(performance.now() - sent); result.posts = 1; result.mailState = receipt.mail_status;
        stage = 'chromium:replay-http';
        const replayResponse = await context.request.post(profile.apiUrl, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: posted, timeout: 60000 });
        const replay = await replayResponse.json(); assert.equal(replay.code, 'REPLAY'); assert.ok(receipt.request_id); assert.equal(replay.request_id, receipt.request_id);
        const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
        for (const value of [person.entreprise, receipt.request_id].filter(Boolean)) assert.ok(!stored.includes(value), 'PERSONAL_DATA_IN_STORAGE');
        fs.writeFileSync(privateFile + '.result.json', JSON.stringify({ request_id: receipt.request_id, id_cohorte: recipe.sessionIds[0], mail_status: receipt.mail_status }, null, 2), { mode: 0o600 });
        result.replayHttp = true;
      }
      results.push(result);
    } finally { await browser.close(); }
  }
  console.log(JSON.stringify({ outcome: 'PASS', environment: 'COPY', transport: 'real browser, no route interception', results, native_source_and_view: 'VERIFY_WITH_PRIVATE_EXPORTS', received_mail_and_calendar: 'NOT_VERIFIED' }));
}
run().catch(() => { console.error(JSON.stringify({ outcome: 'FAIL', stage, details: 'Private inputs omitted. Check this stage locally; no conclusion about Google acceptance.' })); process.exitCode = 1; });
