const { test, expect } = require('@playwright/test');
const { harness } = require('../helpers.cjs');
async function setup(page, controls = {}) {
  // Network interception exists in the runner only. The shipped site/static
  // server has no test/reset/injection endpoint or injected fixtures.
  const h = harness({ now: Date.now() }); let drop = controls.drop || false; const commands = [], traffic = { gets: 0 };
  await page.route('**/config.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.TEMA_CONFIG={apiUrl:"http://127.0.0.1:4173/test-api"};' }));
  await page.route('**/test-api', async route => {
    const request = route.request();
    h.advance(Date.now() - h.deps.now());
    if (request.method() === 'GET') { traffic.gets += 1; await route.fulfill({ json: h.service.catalogue() }); return; }
    const fields = Object.fromEntries(new URLSearchParams(request.postData())); const command = require('../../apps-script/engine.js').decodeForm(fields); commands.push(command);
    if (controls.beforePost) controls.beforePost(h, command);
    const receipt = h.service.submit(command), result = controls.reply ? controls.reply(receipt, command, commands.length) : receipt;
    if (controls.beforeReply) await controls.beforeReply(result);
    if (drop) { drop = false; await route.abort('failed'); } else await route.fulfill({ json: result });
  });
  await page.goto('/'); await expect(page.getByRole('heading', { level: 2 }).first()).toContainText('Essai');
  return { h, commands, traffic };
}
async function fill(page) {
  await page.getByRole('button', { name: 'S’inscrire à cette date' }).first().click();
  await page.getByLabel('Prénom (obligatoire)', { exact: true }).fill('Anne'); await page.getByLabel('Nom (obligatoire)', { exact: true }).fill('Fictive'); await page.getByLabel('Entreprise (obligatoire)', { exact: true }).fill('Entreprise essai'); await page.getByLabel('Courriel (obligatoire)', { exact: true }).fill('participant@example.invalid'); await page.locator('#consentement').check();
  // Server anti-spam timing is exercised with a real elapsed second.
  await page.waitForTimeout(1100);
}
test('AC-06/10/14/15 — inscription accessible, confirmation place/email distincts, no PII URL/storage', async ({ page }) => {
  const { h } = await setup(page); await fill(page); await page.getByRole('button', { name: 'Confirmer mon inscription', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Votre place est réservée' })).toBeVisible(); await expect(page.locator('#mail-message')).toContainText('service d’envoi'); expect(h.data.registrations.length).toBe(1);
  expect(page.url()).not.toContain('participant'); expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('AC-07 — date devenue complète garde les coordonnées et propose un changement de date', async ({ page }) => {
  const { h } = await setup(page, { beforePost(h) { h.data.sessions[0].places_max = 1; const c = h.command({ courriel: 'other@example.invalid' }); h.service.register(c); } });
  await fill(page); await page.getByRole('button', { name: 'Confirmer mon inscription', exact: true }).click();
  await expect(page.locator('#form-status')).toContainText('désormais complète'); await expect(page.locator('#prenom')).toHaveValue('Anne'); await expect(page.locator('#change-date')).toBeEnabled(); expect(h.data.registrations.length).toBe(1);
});
test('AC-08 — réponse perdue puis reprise conserve la même demande sans doublon/envoi', async ({ page }) => {
  const { h, commands } = await setup(page, { drop: true }); await fill(page); await page.getByRole('button', { name: 'Confirmer mon inscription', exact: true }).click();
  await expect(page.locator('#form-status')).toContainText('inconnu'); await expect(page.locator('#prenom')).toBeDisabled();
  await page.getByRole('button', { name: 'Reprendre mon inscription' }).click(); await expect(page.getByRole('heading', { name: 'Votre place est réservée' })).toBeVisible();
  expect(commands[0]).toEqual(commands[1]); expect(h.data.registrations.length).toBe(1); expect(h.messages.length).toBe(2);
});
test('AC-08 — réponse lente à vingt secondes reste en cours puis confirme sans reprise ni renvoi', async ({ page }) => {
  await page.clock.install();
  let releaseReply, markReplyHeld;
  const heldReply = new Promise(resolve => { releaseReply = resolve; }), replyHeld = new Promise(resolve => { markReplyHeld = resolve; });
  const { h, commands } = await setup(page, { beforeReply: async () => { markReplyHeld(); await heldReply; } });
  await fill(page); await page.locator('#submit').click(); await replyHeld;
  try {
    await page.clock.fastForward(20000);
    await expect(page.locator('#form-status')).toHaveText('Enregistrement en cours…');
    await expect(page.locator('#retry')).toBeHidden(); await expect(page.locator('#submit')).toBeDisabled(); await expect(page.locator('#prenom')).toBeDisabled();
    expect(commands).toHaveLength(1); expect(h.data.registrations).toHaveLength(1); expect(h.messages).toHaveLength(2);
  } finally { releaseReply(); }
  await expect(page.getByRole('heading', { name: 'Votre place est réservée' })).toBeVisible();
  expect(commands).toHaveLength(1); expect(h.data.registrations).toHaveLength(1); expect(h.messages).toHaveLength(2);
});
test('AC-13 — conditions modifiées demandent relecture puis nouvel accord/nouvelle clé', async ({ page }) => {
  let changed = false;
  const { h, commands } = await setup(page, { beforePost(h) { if (!changed) { h.data.formations[0].prix = 850; changed = true; } } });
  await fill(page); await page.getByRole('button', { name: 'Confirmer mon inscription', exact: true }).click();
  await expect(page.locator('#summary')).toContainText('850'); await expect(page.locator('#submit')).toBeDisabled();
  await page.getByRole('button', { name: 'J’ai relu les nouvelles conditions' }).click(); await expect(page.locator('#consentement')).not.toBeChecked();
  await page.locator('#consentement').check(); await page.waitForTimeout(1100); await page.locator('#submit').click();
  await expect(page.getByRole('heading', { name: 'Votre place est réservée' })).toBeVisible(); expect(commands[0].request_id).not.toBe(commands[1].request_id); expect(h.data.registrations.length).toBe(1);
});
test('AC-02/14 — fermeture/inactivation visibles à l’actualisation, HTML inerte', async ({ page }) => {
  const { h } = await setup(page); h.data.formations[0].titre = '<img src=x onerror="window.XSS=1">'; h.data.sessions[0].inscriptions_ouvertes = false;
  await page.getByRole('button', { name: 'Actualiser les dates' }).click(); await expect(page.locator('#formations')).toContainText('<img src=x'); expect(await page.evaluate(() => window.XSS)).toBeUndefined(); expect(await page.locator('#formations img').count()).toBe(0); await expect(page.getByRole('button', { name: 'S’inscrire à cette date' })).toHaveCount(1);
  h.data.formations[0].actif = false; await page.getByRole('button', { name: 'Actualiser les dates' }).click(); await expect(page.locator('#catalogue-status')).toContainText('Aucune formation disponible');
});
for (const [name, corrupt] of [
  ['erreur null', (result, command) => ({ ...require('../../apps-script/engine.js').envelope('INVALID', command), errors: [null] })],
  ['champ invalide', (result, command) => ({ ...require('../../apps-script/engine.js').envelope('INVALID', command), errors: [{ field: {}, code: 'INVALID' }] })],
  ['code invalide', (result, command) => ({ ...require('../../apps-script/engine.js').envelope('INVALID', command), errors: [{ field: 'courriel', code: {} }] })],
  ['autre demande', result => ({ ...result, request_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff' })]
]) {
  test('AC-08 — reçu mal formé/' + name + ' conserve exactement la commande de reprise', async ({ page }) => {
    const { h, commands } = await setup(page, { reply: (result, command, count) => count === 1 ? corrupt(result, command) : result });
    await fill(page); await page.locator('#submit').click(); await expect(page.locator('#form-status')).toContainText('inconnu'); await expect(page.locator('#prenom')).toBeDisabled();
    await page.locator('#retry').click(); await expect(page.getByRole('heading', { name: 'Votre place est réservée' })).toBeVisible(); expect(commands).toHaveLength(2); expect(commands[1]).toEqual(commands[0]); expect(h.data.registrations).toHaveLength(1); expect(h.messages).toHaveLength(2);
  });
}
test('AC-08 — doublon corrigé permet une nouvelle confirmation avec accord explicite et nouvelle clé', async ({ page }) => {
  let seeded = false;
  const { h, commands } = await setup(page, { beforePost(h, command) { if (!seeded) { h.service.register({ ...command, request_id: h.deps.uuid() }); seeded = true; } } });
  await fill(page); await page.locator('#submit').click(); await expect(page.locator('#form-status')).toContainText('inscription active existe');
  await page.locator('#courriel').fill('corrected@example.invalid'); await page.locator('#consentement').uncheck(); await page.locator('#submit').click(); expect(commands).toHaveLength(1);
  await page.locator('#consentement').check(); await page.locator('#submit').click(); await expect(page.getByRole('heading', { name: 'Votre place est réservée' })).toBeVisible(); expect(commands).toHaveLength(2); expect(commands[1].request_id).not.toBe(commands[0].request_id); expect(commands[1].courriel).toBe('corrected@example.invalid'); expect(h.data.registrations).toHaveLength(2);
});
for (const mailState of ['FAILED', 'BLOCKED']) {
  test('AC-08/12 — reprise annulée avec mail ' + mailState + ' ne promet aucune place conservée', async ({ page }) => {
    const { h } = await setup(page, { drop: true }); if (mailState === 'FAILED') h.options.failParticipant = true; else h.options.blockMail = 'MAIL_QUOTA';
    await fill(page); await page.locator('#submit').click(); await expect(page.locator('#form-status')).toContainText('inconnu'); expect(h.data.registrations[0].mail_participant_etat).toBe(mailState);
    h.data.registrations[0].statut = 'annulee'; const before = h.messages.length;
    await page.locator('#retry').click(); await expect(page.getByRole('heading', { name: 'Cette inscription a été annulée' })).toBeVisible(); await expect(page.locator('#mail-message')).toContainText('annulée'); await expect(page.locator('#mail-message')).not.toContainText('place est conservée'); expect(h.messages).toHaveLength(before);
  });
}
test('AC-02 — onglet masqué ne consulte pas Google ; retour visible puis cadence trente secondes', async ({ page }) => {
  await page.clock.install(); const { traffic } = await setup(page); const initial = traffic.gets;
  await page.evaluate(() => { window.__testHidden = true; Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.__testHidden }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.fastForward(60000); expect(traffic.gets).toBe(initial);
  await page.evaluate(() => { window.__testHidden = false; document.dispatchEvent(new Event('visibilitychange')); }); await expect.poll(() => traffic.gets).toBe(initial + 1);
  await page.clock.fastForward(30000); await expect.poll(() => traffic.gets).toBe(initial + 2);
  await page.getByRole('button', { name: 'S’inscrire à cette date' }).first().click(); await page.clock.fastForward(30000); await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); expect(traffic.gets).toBe(initial + 2);
});
