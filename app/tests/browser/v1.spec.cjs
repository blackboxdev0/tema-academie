const { test, expect } = require('@playwright/test');
const { harness } = require('../helpers.cjs');
const source = require('../../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/.working/catalogue-source-24-2026-10-28.json');
async function setup(page, mutate = () => {}, hash = '') {
  const h = harness({ now: Date.now() });
  await page.route('**/config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.TEMA_CONFIG={apiUrl:"http://127.0.0.1:4173/test-api"};' }));
  await page.route('**/test-api', route => { const cat = h.service.catalogue(); mutate(cat); return route.fulfill({ json: cat }); });
  await page.goto('/' + hash); await expect(page.locator('#catalogue-status')).not.toContainText('Chargement'); return h;
}
const enabled = s => ({ ...s, status: 'open', registration_enabled: true, registration_block_reason: null });
function fullCatalogue(cat) {
  cat.formations = source.formations.map((f, i) => ({ id: 'F-' + i, logiciel: ({ Divalto: 'DIV', Dimo: 'DIMO', MoovApps: 'MOOV' })[f.software], titre: f.title, description: '', prerequis: f.prerequisites, contenu: f.content, resultat: f.outcome, duree: f.duration, prix: Number(f.price_label.match(/\d+/)[0]), prix_qualificatif: 'À partir de' }));
  cat.sessions = [];
}
test('2.1 — 24 contenus client, pagination six cartes, filtre partagé et aucune date inventée', async ({ page }) => {
  await setup(page, fullCatalogue); await expect(page.locator('#catalogue-status')).toContainText('1–6 sur 24 formations'); await expect(page.locator('#formations article')).toHaveCount(6);
  await page.getByRole('button', { name: 'Page 4', exact: true }).click(); await expect(page.locator('#catalogue-status')).toContainText('19–24 sur 24');
  await page.getByRole('button', { name: 'Dimo', exact: true }).click(); await expect(page.locator('#formations article')).toHaveCount(4); await expect(page.locator('#catalogue-status')).toContainText('4 formations');
  await expect(page.locator('#general-calendar')).toContainText('Aucune formation planifiée'); await expect(page.locator('#formations')).toContainText('Dates à venir');
  await page.locator('#formations a').first().click(); const f = source.formations.find(f => f.software === 'Dimo'); await expect(page.locator('#detail .program')).toContainText(f.content); await expect(page.locator('#detail .program')).toContainText(f.outcome); await expect(page.getByRole('button', { name: 'S’inscrire à cette date' })).toHaveCount(0);
});
test('2.1 — tri éligible, visible indisponible, sans date ; tarif absent reste consultable', async ({ page }) => {
  await setup(page, cat => {
    const f = cat.formations[0], s = cat.sessions[0]; cat.formations = [{ ...f, id: 'NO-DATE', titre: 'Sans date' }, { ...f, id: 'NO-PRICE', titre: 'Tarif absent', prix: null }, { ...f, id: 'ELIGIBLE', titre: 'Réservable' }];
    cat.sessions = [{ ...s, formation: 'NO-PRICE', id_cohorte: 'C-NO-PRICE', registration_enabled: false, registration_block_reason: 'price_unconfirmed' }, { ...enabled(s), formation: 'ELIGIBLE', id_cohorte: 'C-ENABLED' }];
  });
  await expect(page.locator('#formations h3')).toHaveText(['Réservable', 'Tarif absent', 'Sans date']); await page.locator('#formations a').nth(1).click(); await expect(page.locator('#detail-content')).toContainText('Aucune date réservable');
  await page.locator('#detail .calendar-event').click(); await expect(page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true })).toBeDisabled(); await expect(page.locator('#detail-content')).toContainText('Tarif à confirmer');
});
test('2.2/2.3 — lien date exacte complète, navigation mois neutre et accès direct sans rewrite', async ({ page }) => {
  const mutation = cat => { cat.sessions[0] = { ...cat.sessions[0], status: 'full', registration_enabled: false }; };
  await setup(page, mutation, '#formation=DIV-ESS-001&date=C-11111111-1111-4111-8111-111111111111');
  await expect(page.locator('#detail')).toBeVisible(); await expect(page.locator('#detail .calendar-head h3')).toContainText('janvier 2030'); await expect(page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Mois suivant de la formation', exact: true }).click(); await expect(page.locator('#detail .calendar-head h3')).toContainText('février 2030'); await expect(page.locator('#detail-content')).toContainText('Aucune session pour ce mois'); await expect(page.getByRole('button', { name: 'Mois suivant de la formation' })).toBeFocused();
  await page.reload(); await expect(page.locator('#detail')).toBeVisible(); await expect(page.locator('#detail .calendar-head h3')).toContainText('février 2030'); await expect(page.locator('#detail .calendar-event[aria-pressed=true]')).toHaveCount(0);
});
test('2.3 — présélection prochaine date éligible et programme avant calendrier', async ({ page }) => {
  await setup(page, cat => { cat.sessions[0] = { ...cat.sessions[0], status: 'full', registration_enabled: false }; });
  await page.locator('#formations a').click(); await expect(page.locator('#detail .calendar-head h3')).toContainText('juillet 2030'); await expect(page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true })).toBeEnabled();
  expect(await page.locator('#detail .program').evaluate(el => el.compareDocumentPosition(document.getElementById('dates-formation')) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  const selected = page.locator('#detail .calendar-event[aria-pressed=true]'); await expect(selected).toHaveCount(1);
  if (test.info().project.name.includes('mobile')) expect(await selected.evaluate(el => el.nextElementSibling.classList.contains('mobile-summary'))).toBe(true);
});
test('2.1/2.2 — filtre vide réversible et calendrier lié au logiciel', async ({ page }) => {
  await setup(page); await page.getByRole('button', { name: 'Dimo', exact: true }).click(); await expect(page.locator('#catalogue-status')).toContainText('Aucune formation pour ce logiciel'); await expect(page.locator('#general-calendar')).toContainText('Aucune formation planifiée');
  await page.getByRole('button', { name: 'Voir toutes les formations' }).click(); await expect(page.locator('#formations article')).toHaveCount(1); await expect(page.locator('#general-calendar .calendar-event')).toHaveCount(1);
});
test('3.1/4.3 — politique TEST dédiée et version consultable, retour sans perte ni nouvel accord implicite', async ({ page }) => {
  await setup(page); await page.locator('#formations a').click(); await page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true }).click();
  await page.locator('#prenom').fill('Fictive'); await expect(page.locator('#form-availability')).toContainText('Disponibilité au choix de la date'); await expect(page.locator('#form-availability')).toContainText('3 places restantes'); await expect(page.locator('#entreprise')).toHaveAttribute('aria-describedby', 'entreprise-help'); await expect(page.locator('#courriel')).toHaveAttribute('aria-describedby', 'courriel-help'); await expect(page.locator('#consentement')).not.toBeChecked(); await page.locator('#policy').click(); await expect(page.locator('#privacy')).toBeVisible(); await expect(page.locator('#privacy-version')).toContainText('TEST-1'); await expect(page.locator('#privacy')).toContainText('douze mois'); await expect(page.locator('#privacy')).toContainText('Aucune conformité juridique');
  await page.getByRole('button', { name: '← Retour au parcours', exact: true }).click(); await expect(page.locator('#prenom')).toHaveValue('Fictive'); await expect(page.locator('#consentement')).not.toBeChecked(); expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});
test('5.1 — clavier, labels, statut sémantique, zoom 200% sans débordement et police locale', async ({ page, browserName }) => {
  const failures = []; page.on('pageerror', e => failures.push(e.message)); await setup(page);
  // macOS WebKit follows the native links-navigation preference: Option+Tab
  // includes links when the default Tab mode visits only form controls.
  await page.keyboard.press('Tab');
  if (browserName === 'webkit' && !await page.locator('.skip').evaluate(el => el === document.activeElement)) await page.keyboard.press('Alt+Tab');
  await expect(page.locator('.skip')).toBeFocused();
  expect(await page.locator('.skip').evaluate(el => { const style = getComputedStyle(el), box = el.getBoundingClientRect(); return el.matches(':focus-visible') && parseFloat(style.outlineWidth) > 0 && box.top >= 0 && box.bottom <= innerHeight; })).toBe(true);
  await page.keyboard.press('Enter'); await expect(page).toHaveURL(/#main$/); await expect(page.locator('#main')).toBeFocused(); await expect(page.locator('#catalogue')).toBeVisible();
  await page.locator('#formations a').click(); await page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true }).click();
  await expect(page.locator('#form-title')).toBeFocused(); await expect(page.getByLabel('Prénom (obligatoire)', { exact: true })).toHaveAttribute('autocomplete', 'given-name'); await expect(page.locator('#form-status')).toHaveAttribute('role', 'alert');
  await page.evaluate(() => document.body.style.zoom = '2'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#prenom').focus(); expect(await page.locator('#prenom').evaluate(el => getComputedStyle(el).borderTopColor)).toBe('rgb(255, 0, 143)');
  expect(await page.evaluate(() => document.fonts.check('16px Inter'))).toBe(true); expect(failures).toEqual([]);
});
test('2.3 — formation inconnue et lecture indisponible ne simulent pas un succès', async ({ page }) => {
  await setup(page, () => {}, '#formation=UNKNOWN'); await expect(page.locator('#detail-title')).toHaveText('Formation indisponible'); await page.getByRole('button', { name: 'Retour au catalogue' }).click(); await expect(page.locator('#catalogue')).toBeVisible();
  await page.route('**/test-api', route => route.abort()); await page.locator('#reload').click(); await expect(page.locator('#catalogue-status')).toContainText('indisponibles'); await expect(page.locator('#result')).toBeHidden();
});
test('2.2/2.3 — calendrier général ouvre la date exacte, retour garde filtre/mois', async ({ page }) => {
  await setup(page); await page.getByRole('button', { name: 'Divalto', exact: true }).click();
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'Mois suivant', exact: true }).click();
  await expect(page.locator('#general-calendar .calendar-head h3')).toContainText('juillet 2030'); await page.locator('#general-calendar .calendar-event').click();
  await expect(page.locator('#detail .calendar-event[aria-pressed=true]')).toContainText('15 juillet 2030'); await page.locator('#catalogue-back').click();
  await expect(page.getByRole('button', { name: 'Divalto', exact: true })).toHaveAttribute('aria-pressed', 'true'); await expect(page.locator('#general-calendar .calendar-head h3')).toContainText('juillet 2030');
});
test('2.3/5.1 — échec de lecture en fiche visible, anciennes places qualifiées, réessai explicite', async ({ page }) => {
  await page.clock.install(); const h = await setup(page); await page.locator('#formations a').click();
  await expect(page.locator('#detail')).toBeVisible(); let failedReads = 0;
  await page.route('**/test-api', route => { failedReads++; return route.abort(); }); await page.clock.fastForward(30000);
  await expect(page.locator('#detail-notice')).toBeVisible(); await expect(page.locator('#detail-notice')).toContainText('dernière lecture'); await expect(page.locator('#detail-notice')).toContainText('peuvent avoir changé');
  await expect(page.locator('#detail .calendar-event')).toContainText('Dernière lecture : 3 places restantes'); await expect(page.locator('#result')).toBeHidden(); expect(failedReads).toBe(1);
  await page.route('**/test-api', route => route.fulfill({ json: h.service.catalogue() })); await page.locator('#retry-detail').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#detail-notice')).toBeHidden(); await expect(page.locator('#detail-title')).toBeFocused(); await expect(page.locator('#detail .calendar-event')).not.toContainText('Dernière lecture');
});
test('2.3/5.1 — accès rapide aux dates conserve la route et survit à l’actualisation directe', async ({ page }) => {
  await setup(page); await page.locator('#formations a').click(); await page.getByRole('link', { name: 'Voir les dates', exact: true }).click();
  await expect(page).toHaveURL(/formation=DIV-ESS-001.*section=dates/); await expect(page.locator('#dates-formation')).toBeFocused();
  await page.reload(); await expect(page.locator('#detail')).toBeVisible(); await expect(page.locator('#detail-title')).toContainText('Essai'); await expect(page.locator('#dates-formation')).toBeFocused();
  expect(await page.evaluate(() => new URLSearchParams(location.hash.slice(1)).get('date'))).toBe('C-11111111-1111-4111-8111-111111111111');
  await page.goto('/#dates-formation'); await page.reload(); await expect(page.locator('#catalogue')).toBeVisible(); await expect(page.locator('#catalogue-status')).not.toContainText('indisponibles');
});
test('5.1 — actualisation identique ou modifiée conserve le focus clavier dans la fiche', async ({ page }) => {
  await page.clock.install(); const h = await setup(page); await page.locator('#formations a').click();
  const next = page.getByRole('button', { name: 'Mois suivant de la formation', exact: true }); await next.focus(); const original = await next.elementHandle();
  await page.clock.fastForward(30000); await expect(next).toBeFocused(); expect(await original.evaluate(el => el.isConnected)).toBe(true);
  h.data.formations[0].prix = 851; await page.clock.fastForward(30000); await expect(page.locator('#detail-content')).toContainText('851'); await expect(next).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#detail .calendar-head h3')).toContainText('février 2030'); await expect(next).toBeFocused();
});
test('5.1 — composition approuvée, métadonnées de carte, récapitulatif tablette voisin', async ({ page }) => {
  await setup(page); await expect(page.locator('#formations .card-logistics')).toContainText(/09(?:\s*h\s*|:)00/); await expect(page.locator('#formations .card-logistics')).toContainText('En ligne');
  expect(await page.locator('#formations .card-date').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 0, 143)');
  expect(await page.locator('#formations .card-body').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(244, 244, 244)');
  expect(await page.locator('#formations .card-main').evaluate(el => { const date = el.firstElementChild.getBoundingClientRect(), content = el.lastElementChild.getBoundingClientRect(); return Math.abs(date.top - content.top) < 1 && date.right <= content.left + 1; })).toBe(true);
  await page.setViewportSize({ width: 900, height: 1000 }); await page.locator('#formations a').click(); await expect(page.locator('.desktop-summary')).toBeVisible();
  expect(await page.locator('.calendar-layout').evaluate(el => { const cal = el.firstElementChild.getBoundingClientRect(), recap = el.querySelector('.desktop-summary').getBoundingClientRect(); return Math.abs(cal.top - recap.top) < 5 && cal.right <= recap.left; })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await expect(page.locator('.program-intro')).toContainText('Ce que vous allez apprendre'); expect(await page.locator('#detail .calendar-event .availability').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(12);
});
test('review — lectures retardées sérialisées, rafale coalescée et données récentes conservées', async ({ page }) => {
  const h = await setup(page); let active = 0, maximum = 0, reads = 0, releaseOld, markStarted;
  const oldHeld = new Promise(resolve => { releaseOld = resolve; }), started = new Promise(resolve => { markStarted = resolve; });
  const order = [];
  await page.route('**/test-api', async route => {
    reads++; active++; maximum = Math.max(maximum, active); const data = h.service.catalogue(), number = reads; order.push('start-' + number);
    if (number === 1) { markStarted(); await oldHeld; }
    await route.fulfill({ json: data }); active--; order.push('end-' + number);
  });
  await page.locator('#reload').click(); await started;
  h.data.formations[0].prix = 975;
  await page.evaluate(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); }); await page.locator('#reload').click();
  // Keep the old response pending while independent refresh triggers arrive.
  await page.waitForTimeout(60); releaseOld();
  await expect(page.locator('#formations')).toContainText('975 $ CAD'); await expect.poll(() => active).toBe(0);
  expect(maximum).toBe(1); expect(reads).toBe(2); expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2']);
  await page.waitForTimeout(60); await expect(page.locator('#formations')).toContainText('975 $ CAD');
});
test('review — contact public commun et retour politique après évitement préservent formulaire et accord', async ({ page, browserName }) => {
  await setup(page, cat => { cat.contact.courriel = 'support@example.invalid'; });
  await page.locator('#formations a').click(); await page.getByRole('button', { name: 'S’inscrire à cette date' }).filter({ visible: true }).click();
  await page.locator('#prenom').fill('Anne'); await page.locator('#consentement').check();
  for (let i = 0; i < 20 && !await page.locator('.skip').evaluate(el => el === document.activeElement); i++) await page.keyboard.press('Shift+Tab');
  if (browserName === 'webkit' && !await page.locator('.skip').evaluate(el => el === document.activeElement)) for (let i = 0; i < 20 && !await page.locator('.skip').evaluate(el => el === document.activeElement); i++) await page.keyboard.press('Alt+Shift+Tab');
  await expect(page.locator('.skip')).toBeFocused(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(/#main$/); await expect(page.locator('#registration')).toBeVisible();
  await page.locator('#policy').click(); await expect(page.locator('#privacy-contact')).toHaveText('support@example.invalid');
  for (const selector of ['#privacy-contact', '#contact', '.contact-link']) await expect(page.locator(selector)).toHaveAttribute('href', 'mailto:support@example.invalid');
  await page.locator('#privacy-back').click(); await expect(page.locator('#registration')).toBeVisible(); await expect(page.locator('#privacy')).toBeHidden();
  await expect(page).toHaveURL(/formation=DIV-ESS-001.*vue=inscription/); await expect(page.locator('#prenom')).toHaveValue('Anne'); await expect(page.locator('#consentement')).toBeChecked();
  await page.locator('#policy').click(); await page.goBack(); await expect(page.locator('#registration')).toBeVisible(); await expect(page.locator('#prenom')).toHaveValue('Anne'); await expect(page.locator('#consentement')).toBeChecked();
});
for (const [month, blocked, allowed, adjacent] of [
  ['9999-12', 'Mois suivant de la formation', 'Mois précédent de la formation', '9999-11'],
  ['0001-01', 'Mois précédent de la formation', 'Mois suivant de la formation', '0001-02']
]) {
  test('review — calendrier borné à ' + month + ' sans dépassement de Date', async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message)); await setup(page, () => {}, '#formation=DIV-ESS-001&mois=' + month);
    await expect(page.locator('#detail')).toBeVisible(); await expect(page.getByRole('button', { name: blocked, exact: true })).toBeDisabled(); await expect(page.getByRole('button', { name: allowed, exact: true })).toBeEnabled();
    await page.getByRole('button', { name: allowed, exact: true }).click(); await expect(page).toHaveURL(new RegExp('mois=' + adjacent + '$')); await page.getByRole('button', { name: blocked, exact: true }).click();
    await expect(page).toHaveURL(new RegExp('mois=' + month + '$')); await expect(page.getByRole('button', { name: blocked, exact: true })).toBeDisabled();
    await page.reload(); await expect(page.getByRole('button', { name: blocked, exact: true })).toBeDisabled(); expect(errors).toEqual([]);
  });
}
test('review — échec retardé puis lecture identique en attente retire les avis après succès', async ({ page }) => {
  const h = await setup(page); const unchanged = h.service.catalogue(); let reads = 0, releaseFailure, releaseSuccess, markFailureStarted, markSuccessStarted;
  const failureHeld = new Promise(resolve => { releaseFailure = resolve; }), successHeld = new Promise(resolve => { releaseSuccess = resolve; });
  const failureStarted = new Promise(resolve => { markFailureStarted = resolve; }), successStarted = new Promise(resolve => { markSuccessStarted = resolve; });
  await page.route('**/test-api', async route => {
    reads++;
    if (reads === 1) { markFailureStarted(); await failureHeld; await route.abort(); }
    else { markSuccessStarted(); await successHeld; await route.fulfill({ json: unchanged }); }
  });
  await page.locator('#reload').click(); await failureStarted; await page.evaluate(() => window.dispatchEvent(new Event('focus'))); releaseFailure();
  await successStarted; await expect(page.locator('#catalogue-notice')).toBeVisible(); await expect(page.locator('#formations')).toContainText('Dernière lecture'); releaseSuccess();
  await expect(page.locator('#catalogue-notice')).toBeHidden(); await expect(page.locator('#catalogue-status')).not.toContainText('indisponibles'); await expect(page.locator('#formations')).not.toContainText('Dernière lecture'); expect(reads).toBe(2);
});
