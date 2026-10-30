const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { harness, TemaTrial } = require('../helpers.cjs');

// All writes and mail remain inside the Node harness. Even a broken shipped
// config cannot reach Google: every external browser request is aborted here.
async function setup(page, baseURL, controls = {}) {
  const h = harness({ now: Date.now() }), external = [], origin = new URL(baseURL).origin;
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== origin) { external.push(request.url()); await route.abort(); return; }
    if (url.pathname === '/config.js') {
      await route.fulfill({ contentType: 'text/javascript', body: `window.TEMA_CONFIG=${JSON.stringify({ apiUrl: `${origin}/test-api` })};` }); return;
    }
    if (url.pathname !== '/test-api') { await route.continue(); return; }
    h.advance(Date.now() - h.deps.now());
    if (request.method() === 'GET') { const cat = h.service.catalogue(); if (controls.catalogue) controls.catalogue(cat); await route.fulfill({ json: cat }); return; }
    const command = TemaTrial.decodeForm(Object.fromEntries(new URLSearchParams(request.postData())));
    if (controls.drop) { await route.abort('failed'); return; }
    await route.fulfill({ json: controls.reply ? controls.reply(command) : h.service.submit(command) });
  });
  await page.goto('/'); await expect(page.locator('#formations')).toContainText('Essai');
  return { h, external };
}
async function scan(page, state, info) {
  await page.evaluate(() => document.fonts.ready);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = { state, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, failure: n.failureSummary })) })), incomplete: result.incomplete.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })) };
  await info.attach(`axe-${state}`, { body: JSON.stringify(summary, null, 2), contentType: 'application/json' });
  expect.soft(summary.violations, `${state}: violations axe WCAG 2.1 A/AA`).toEqual([]);
}
async function openForm(page) {
  await page.locator('#formations a').first().click();
  await page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true }).click();
  await expect(page.locator('#form-title')).toBeFocused();
}
async function fillForm(page) {
  await page.locator('#prenom').fill('Anne'); await page.locator('#nom').fill('Fictive');
  await page.locator('#entreprise').fill('Entreprise essai'); await page.locator('#courriel').fill('participant@example.invalid');
  await page.locator('#consentement').check(); await page.waitForTimeout(1100);
}

test('A11Y — axe catalogue, fiche, formulaire, confidentialité et confirmation', async ({ page, baseURL }, info) => {
  const { external } = await setup(page, baseURL);
  await scan(page, 'catalogue', info); await page.locator('#formations a').first().click(); await scan(page, 'fiche', info);
  await page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true }).click(); await scan(page, 'formulaire', info);
  await page.locator('#policy').click(); await scan(page, 'confidentialite', info);
  await page.getByRole('button', { name: '← Retour au parcours', exact: true }).click();
  await fillForm(page); await page.locator('#submit').click(); await expect(page.locator('#result-title')).toHaveText('Votre place est réservée');
  await expect(page.locator('#result-title')).toBeFocused(); await scan(page, 'confirmation', info); expect(external).toEqual([]);
});

test('A11Y — axe erreurs de champs et résultat inconnu, corrections accessibles au clavier', async ({ page, baseURL, browserName }, info) => {
  const controls = { reply: command => ({ ...TemaTrial.envelope('INVALID', command), errors: [{ field: 'courriel', code: 'INVALID' }] }) };
  const { external } = await setup(page, baseURL, controls); await openForm(page); await fillForm(page); await page.locator('#submit').click();
  await expect(page.locator('#form-status')).toBeFocused(); await expect(page.locator('#courriel')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#courriel')).toHaveAttribute('aria-describedby', 'courriel-help courriel-error');
  await scan(page, 'erreur-champ', info);
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(tabKey); await expect(page.getByRole('button', { name: 'Corriger : Courriel (obligatoire)', exact: true })).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#courriel')).toBeFocused();
  controls.drop = true; await page.locator('#submit').click(); await expect(page.locator('#form-status')).toContainText('inconnu');
  await expect(page.locator('#form-status')).toBeFocused(); await scan(page, 'resultat-inconnu', info);
  // A policy link inside the disabled fieldset remains keyboard reachable.
  for (let i = 0; i < 3 && !await page.locator('#retry').evaluate(el => el === document.activeElement); i++) await page.keyboard.press(tabKey);
  await expect(page.locator('#retry')).toBeFocused(); expect(external).toEqual([]);
});

test('A11Y — axe catalogue paginé et focus après changement de page', async ({ page, baseURL, browserName }, info) => {
  await setup(page, baseURL, { catalogue(cat) {
    const f = cat.formations[0];
    cat.formations = Array.from({ length: 24 }, (_, i) => ({ ...f, id: `A11Y-${i}`, titre: `Essai — formation ${i + 1}` }));
    cat.sessions.forEach(s => s.formation = 'A11Y-0');
  } });
  await expect(page.locator('#formations article')).toHaveCount(6); await scan(page, 'catalogue-pagine', info);
  const second = page.getByRole('button', { name: 'Page 2', exact: true }); await second.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#catalogue-status')).toContainText('7–12 sur 24');
  // Pagination scrolls to the start of the new results: focus follows that
  // visible count, then Tab reaches the first formation in the new batch.
  await expect(page.locator('#catalogue-status')).toBeFocused();
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.locator('#formations a').first()).toBeFocused();
});

test('A11Y — parcours clavier, focus visible et reflow à 640 / 320 CSS px', async ({ page, baseURL, browserName }) => {
  const { external } = await setup(page, baseURL);
  // WebKit on macOS may use the native links-navigation preference.
  const tab = async () => { await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab'); };
  await tab(); await expect(page.locator('.skip')).toBeFocused(); await page.keyboard.press('Enter'); await expect(page.locator('#main')).toBeFocused();
  let found = false;
  for (let i = 0; i < 20; i++) {
    await tab();
    const focus = await page.evaluate(() => { const el = document.activeElement, s = getComputedStyle(el), r = el.getBoundingClientRect(); return { tag: el.tagName, visible: r.width > 0 && r.height > 0 && s.visibility !== 'hidden', outlined: parseFloat(s.outlineWidth) > 0 && el.matches(':focus-visible'), card: el.matches('#formations a') }; });
    expect(focus.visible).toBe(true); expect(focus.outlined).toBe(true);
    if (focus.card) { found = true; break; }
  }
  expect(found).toBe(true); await page.keyboard.press('Enter'); await expect(page.locator('#detail-title')).toBeFocused();
  // 640 CSS px exercises the layout width obtained by browser zoom 200 % on
  // a 1280 px window. Native browser zoom and text-only zoom need a manual pass.
  await page.setViewportSize({ width: 640, height: 900 });
  expect.soft(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'fiche à 640 CSS px').toBe(true);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'fiche à 320 CSS px').toBe(true);
  await page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'formulaire à 320 CSS px').toBe(true);
  await page.setViewportSize({ width: 640, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'formulaire à 640 CSS px').toBe(true);
  expect(await page.getByRole('main').count()).toBe(1); await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  expect(external).toEqual([]);
});

test('A11Y — contraste des limites de champs et de leur focus', async ({ page, baseURL }) => {
  await setup(page, baseURL); await openForm(page);
  async function borderContrast() {
    return page.locator('#prenom').evaluate(el => {
      const style = getComputedStyle(el);
      function luminance(rgb) { return rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map(n => n / 255).map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0); }
      const border = luminance(style.borderTopColor), inside = luminance(style.backgroundColor), outside = luminance(getComputedStyle(document.body).backgroundColor);
      const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      return { color: style.borderTopColor, inside: ratio(border, inside), outside: ratio(border, outside) };
    });
  }
  const normal = await borderContrast();
  expect.soft(normal.inside, `limite de champ normale ${normal.color} sur blanc`).toBeGreaterThanOrEqual(3);
  expect.soft(normal.outside, `limite de champ normale ${normal.color} sur fond de page`).toBeGreaterThanOrEqual(3);
  await page.locator('#prenom').focus(); const focused = await borderContrast();
  expect(focused.inside, `focus ${focused.color} sur blanc`).toBeGreaterThanOrEqual(3);
  expect(focused.outside, `focus ${focused.color} sur fond de page`).toBeGreaterThanOrEqual(3);
});
