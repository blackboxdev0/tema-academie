'use strict';
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { html } = require('../../scripts/web-production.cjs');
const { POLICY_VERSION } = require('../../scripts/production-target.cjs');
const { harness } = require('../../experiments/copy-helpers.cjs');
const source = require('../../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/.working/catalogue-source-24-2026-10-28.json');
const index = html(fs.readFileSync(path.resolve(__dirname, '../../web/index.html'), 'utf8'));
async function setup(page, baseURL, options = {}) {
  const origin = new URL(baseURL).origin, apiUrl = origin + '/production-fixture-api', external = [];
  const h = harness({ production: true, config: { admissions_mode: 'production', courriel_contact: 'temaacademie@gmail.com' }, properties: { PRODUCTION_MAIL_LIMITS_JSON: JSON.stringify({ version: 1, recipients: 0, window_ms: 86400000, quota_reserve: 5 }) } });
  h.state.now = Date.now(); h.properties.PRODUCTION_ASYNC_MAIL_JSON = JSON.stringify({ version: 1, activated_at_ms: h.state.now, recovery_ids: [] });
  h.context.TemaHeaders.capture(h.book);
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) { external.push(url.href); return route.abort(); }
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: index });
    if (url.pathname === '/config.js') return route.fulfill({ contentType: 'text/javascript', body: 'window.TEMA_CONFIG=' + JSON.stringify({ environment: 'PRODUCTION', apiUrl: options.noApi ? '' : apiUrl, policyVersion: POLICY_VERSION }) });
    if (url.pathname !== '/production-fixture-api') return route.continue();
    h.state.now = Date.now();
    if (route.request().method() === 'GET') {
      if (options.hold) await options.hold;
      const cat = JSON.parse(h.context.doGet().value); if (options.catalogue) options.catalogue(cat);
      return route.fulfill({ json: cat });
    }
    const contents = route.request().postData(), parameter = Object.fromEntries(new URLSearchParams(contents));
    return route.fulfill({ json: JSON.parse(h.context.doPost({ postData: { type: 'application/x-www-form-urlencoded', contents }, parameter, parameters: Object.fromEntries(Object.entries(parameter).map(([k, v]) => [k, [v]])) }).value) });
  });
  return { h, external, apiUrl };
}
function fullCatalogue(cat) {
  cat.formations = source.formations.map((f, i) => ({ id: 'F-' + i, logiciel: ({ Divalto: 'DIV', Dimo: 'DIMO', MoovApps: 'MOOV' })[f.software], titre: f.title, description: '', prerequis: f.prerequisites, contenu: f.content, resultat: f.outcome, duree: f.duration, prix: Number(f.price_label.match(/\d+/)[0]), prix_qualificatif: 'À partir de' }));
  cat.sessions = [];
}
test('production —24fiches sans dates, textes participants et politique versionnée', async ({ page, baseURL }) => {
  const { external } = await setup(page, baseURL, { catalogue: fullCatalogue });
  await page.goto('/'); await expect(page.locator('#catalogue-status')).toContainText('sur 24 formations');
  await expect(page.locator('#formations article')).toHaveCount(6); await expect(page.locator('#formations')).toContainText('Dates à venir');
  await expect(page.locator('#general-calendar')).toContainText('Aucune formation planifiée');
  await expect(page.locator('body')).not.toContainText(/\bTEST\b|\bCOPY\b|inscription fictive/);
  await page.getByRole('button', { name: 'Page 4', exact: true }).click(); await expect(page.locator('#catalogue-status')).toContainText('19–24 sur 24');
  await page.locator('.card-link').first().click(); await expect(page.locator('#detail')).toBeVisible();
  await expect(page.getByRole('button', { name: 'S’inscrire à cette date' })).toHaveCount(0);
  await page.locator('#footer-policy').click(); await expect(page.locator('#privacy')).toBeVisible(); await expect(page.locator('#privacy-version')).toHaveText('Version ' + POLICY_VERSION);
  await expect(page.locator('#privacy')).toContainText('douze mois'); await expect(page.locator('#privacy-contact')).toHaveText('temaacademie@gmail.com');
  expect(external).toEqual([]);
});
test('production —accord cohérent, confirmation durable et reprise du worker après plafond renouvelable', async ({ page, baseURL }) => {
  const { h, external } = await setup(page, baseURL);
  await page.goto('/'); await page.locator('.card-link').first().click(); await page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true }).click();
  await expect(page.locator('label[for=consentement]')).toContainText('traiter mon inscription et assurer le suivi de la formation');
  await expect(page.locator('#policy-version')).toHaveText('Version ' + POLICY_VERSION);
  await page.locator('#prenom').fill('Recette'); await page.locator('#nom').fill('Fictive'); await page.locator('#entreprise').fill('Recette isolée'); await page.locator('#courriel').fill('ordinary@example.invalid');
  await page.locator('#policy').click(); await expect(page.locator('#privacy')).toBeVisible(); await page.locator('#privacy-back').click(); await expect(page.locator('#prenom')).toHaveValue('Recette'); await expect(page.locator('#consentement')).not.toBeChecked();
  await page.locator('#consentement').check(); await page.waitForTimeout(1100); await page.locator('#submit').click();
  await expect(page.locator('#result-title')).toHaveText('Votre place est réservée'); expect(h.messages).toHaveLength(0);
  let row = h.copy.store().read().registrations[0]; expect(row.politique_version).toBe(POLICY_VERSION); expect(row.mail_participant_etat).toBe('PENDING');
  await page.close(); h.context.reconcilierProductionTema(); expect(h.messages).toHaveLength(0); row = h.copy.store().read().registrations[0]; expect(row.mail_participant_etat).toBe('PENDING'); expect(row.mail_participant_attempt_id).toBe('');
  h.properties.PRODUCTION_MAIL_LIMITS_JSON = JSON.stringify({ version: 1, recipients: 2, window_ms: 86400000, quota_reserve: 5 });
  h.context.reconcilierProductionTema(); expect(h.messages).toHaveLength(2); h.context.reconcilierProductionTema(); expect(h.messages).toHaveLength(2);
  expect(external).toEqual([]);
});
test('production —cache de démo isolé et ancienne politique refusée avant inscription', async ({ page, baseURL }) => {
  let release; const held = new Promise(resolve => { release = resolve; });
  const { h, apiUrl, external } = await setup(page, baseURL, { hold: held, catalogue: cat => { cat.policy.version = 'TEST-1'; } });
  const old = JSON.parse(h.context.doGet().value); old.formations[0].titre = 'DEMO CACHE INTERDIT';
  await page.addInitScript(({ apiUrl, data }) => localStorage.setItem('tema-public-v2:' + apiUrl, JSON.stringify({ version: 2, saved: Date.now(), data })), { apiUrl, data: old });
  try { await page.goto('/'); await expect(page.locator('#formations article')).toHaveCount(0); await expect(page.locator('body')).not.toContainText('DEMO CACHE INTERDIT'); } finally { release(); }
  await expect(page.locator('#catalogue-status')).toContainText('indisponibles'); await expect(page.locator('#formations article')).toHaveCount(0); await expect(page.locator('#registration')).toBeHidden(); expect(external).toEqual([]);
});
test('production —politique accessible dans le candidat privé sans endpoint', async ({ page, baseURL }) => {
  const { external } = await setup(page, baseURL, { noApi: true }); await page.goto('/'); await expect(page.locator('#catalogue-status')).toContainText('indisponibles');
  await page.locator('#footer-policy').click(); await expect(page.locator('#privacy')).toBeVisible(); await expect(page.locator('#privacy-version')).toHaveText('Version ' + POLICY_VERSION);
  await page.goBack(); await expect(page.locator('#catalogue')).toBeVisible(); await expect(page.locator('#privacy')).toBeHidden();
  await page.goForward(); await expect(page.locator('#privacy')).toBeVisible(); await expect(page.locator('#catalogue')).toBeHidden();
  await page.locator('#privacy-back').click(); await expect(page.locator('#catalogue')).toBeVisible(); expect(external).toEqual([]);
});
test('production —GET répare un en-tête endommagé avant affichage du catalogue', async ({ page, baseURL }) => {
  const { h, external } = await setup(page, baseURL); h.tables['Disponibilités'][6][9] = '';
  await page.goto('/'); await expect(page.locator('#formations article')).toHaveCount(2);
  expect(h.tables['Disponibilités'][6][9]).toBe('Places restantes'); expect(external).toEqual([]);
});
