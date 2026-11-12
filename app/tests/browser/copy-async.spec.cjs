const {test,expect}=require('@playwright/test');
const {harness}=require('../../experiments/copy-helpers.cjs');
test('confirmation durable puis fermeture du navigateur, worker autonome et aucun second envoi',async({page,baseURL})=>{
 const h=harness({config:{admissions_mode:'demo'},properties:{COPY_MAIL_LIMITS_JSON:'{"registrations":13,"recipients":26}'}});h.state.now=Date.now();
 h.properties.COPY_ASYNC_MAIL_JSON=JSON.stringify({version:1,activated_at_ms:h.state.now,recovery_ids:[]});
 await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/copy-async-api'})}));
 await page.route('**/copy-async-api',async r=>{
  h.state.now=Date.now();const request=r.request();
  if(request.method()==='GET')return r.fulfill({json:JSON.parse(h.context.doGet().value)});
  const contents=request.postData(),parameter=Object.fromEntries(new URLSearchParams(contents));
  return r.fulfill({json:JSON.parse(h.context.doPost({postData:{type:'application/x-www-form-urlencoded',contents},parameter,parameters:Object.fromEntries(Object.entries(parameter).map(([k,v])=>[k,[v]]))}).value)});
 });
 await page.goto('/');await page.locator('.card-link').first().click();await page.getByRole('button',{name:'S’inscrire à cette date'}).filter({visible:true}).click();
 await page.locator('#prenom').fill('Essai');await page.locator('#nom').fill('Arrière-plan');await page.locator('#entreprise').fill('Recette fictive');await page.locator('#courriel').fill('outside@example.invalid');await page.locator('#consentement').check();await page.waitForTimeout(1100);await page.locator('#submit').click();
 await expect(page.locator('#result-title')).toHaveText('Votre place est réservée');await expect(page.locator('#mail-message')).toContainText('préparation');expect(h.messages).toHaveLength(0);
 const row=h.copy.store().read().registrations[0];expect(row.mail_participant_etat).toBe('PENDING');expect(row.mail_tema_etat).toBe('PENDING');
 await page.close();h.context.reconcilierCopieTema();expect(h.messages).toHaveLength(2);
 const after=h.copy.store().read().registrations[0];expect(after.mail_participant_etat).toBe('SENT');expect(after.mail_tema_etat).toBe('SENT');h.context.reconcilierCopieTema();expect(h.messages).toHaveLength(2);expect(h.copy.store().read().registrations).toHaveLength(1);
});
