const {test,expect}=require('@playwright/test');
const {harness,TemaTrial}=require('../helpers.cjs');
async function setup(page,baseURL,reply){
 const h=harness({now:Date.now()}),commands=[];let release;const gate=new Promise(r=>release=r);
 await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/processing-api'})}));
 await page.route('**/processing-api',async r=>{if(r.request().method()==='GET')return r.fulfill({json:h.service.catalogue()});commands.push(r.request().postData());await gate;h.advance(Date.now()-h.deps.now());const c=TemaTrial.decodeForm(Object.fromEntries(new URLSearchParams(r.request().postData())));await r.fulfill({json:reply?reply(c):h.service.submit(c)});});
 await page.goto('/');await page.locator('.card-link').click();await page.getByRole('button',{name:'S’inscrire à cette date'}).filter({visible:true}).click();
 await page.locator('#prenom').fill('Anne');await page.locator('#nom').fill('Fictive');await page.locator('#entreprise').fill('Essai');await page.locator('#courriel').fill('participant@example.invalid');await page.locator('#consentement').check();await page.waitForTimeout(1100);
 return{h,commands,release};
}
test('suivi immédiat sans confirmation anticipée, navigation et double envoi protégés',async({page,baseURL})=>{
 const {h,commands,release}=await setup(page,baseURL);
 try{await page.locator('#submit').click();await expect(page.locator('#processing-title')).toBeFocused();await expect(page.locator('#processing-summary')).toContainText('Essai');await expect(page.locator('#registration')).toBeHidden();await expect(page.locator('#result')).toBeHidden();await expect.poll(()=>commands.length).toBe(1);
 await page.getByRole('link',{name:'Catalogue',exact:true}).click();await expect(page.locator('#processing')).toBeVisible();await page.goBack();await expect(page.locator('#processing')).toBeVisible();await expect(page).toHaveURL(/vue=inscription/);await expect(page.locator('#prenom')).toHaveValue('Anne');expect(commands.length).toBe(1);
 }finally{release();}
 await expect(page.locator('#result-title')).toHaveText('Votre place est réservée');await expect(page.locator('#processing')).toBeHidden();await expect(page.locator('#result-title')).toBeFocused();expect(h.data.registrations.length).toBe(1);expect(commands.length).toBe(1);
});
for(const code of ['FULL','INVALID','SESSION_CHANGED','POLICY_CHANGED'])test('refus '+code+' après suivi préserve saisie et reconfirmation',async({page,baseURL})=>{
 const {release}=await setup(page,baseURL,c=>TemaTrial.envelope(code,c));
 await page.locator('#submit').click();await expect(page.locator('#processing')).toBeVisible();release();
 await expect(page.locator('#registration')).toBeVisible();await expect(page.locator('#processing')).toBeHidden();await expect(page.locator('#prenom')).toHaveValue('Anne');await expect(page.locator('#courriel')).toHaveValue('participant@example.invalid');await expect(page.locator('#form-status')).toBeFocused();await expect(page.locator('#personal-fields')).toBeEnabled();
 if(['SESSION_CHANGED','POLICY_CHANGED'].includes(code)){await expect(page.locator('#changed')).toBeVisible();await expect(page.locator('#submit')).toBeDisabled();await page.locator('#accept-change').click();await expect(page.locator('#consentement')).not.toBeChecked();await expect(page.locator('#submit')).toBeEnabled();}
 else if(code==='FULL')await expect(page.locator('#submit')).toBeDisabled();else await expect(page.locator('#submit')).toBeEnabled();
});
