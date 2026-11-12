const {test,expect}=require('@playwright/test');
const {harness}=require('../helpers.cjs');
async function setup(page,baseURL,controls={}) {
 const h=harness({now:Date.now()});const cached=h.service.catalogue();let release;const gate=new Promise(r=>release=r);const traffic={posts:0,commands:[]};
 await page.addInitScript(({key,data})=>localStorage.setItem(key,JSON.stringify({version:2,saved:Date.now(),data})),{key:'tema-public-v2:'+baseURL+'/seamless-api',data:cached});
 await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/seamless-api'})}));
 await page.route('**/seamless-api',async r=>{if(r.request().method()==='POST'){traffic.posts++;if(!controls.acceptPosts)return r.abort();const command=require('../../apps-script/engine.js').decodeForm(Object.fromEntries(new URLSearchParams(r.request().postData())));traffic.commands.push(command);h.advance(Date.now()-h.deps.now());return r.fulfill({json:h.service.submit(command)});}await gate;return controls.failed?r.abort():r.fulfill({json:h.service.catalogue()});});
 const route=controls.direct?'#formation='+cached.formations[0].id+'&date='+cached.sessions[0].id_cohorte+'&vue=inscription':'';
 await page.goto('/'+route,{waitUntil:'domcontentloaded'});return {h,release,traffic,cached};
}
async function choose(page){await page.locator('.card-link').first().click();await page.getByRole('button',{name:'S’inscrire à cette date',exact:true}).click();}
async function enter(page){await page.locator('#prenom').fill('Essai discret');await page.locator('#nom').fill('Sans stockage');await page.locator('#entreprise').fill('Essai');await page.locator('#courriel').fill('draft-seamless@example.invalid');}
test('aperçu discret, formulaire immédiat, saisie et focus conservés après vérification',async({page,baseURL})=>{
 const {release,traffic}=await setup(page,baseURL);
 try {await expect(page.locator('#catalogue-notice')).toBeHidden();await expect(page.locator('.card .availability-check').first()).toHaveText('Vérification…');await choose(page);await expect(page.locator('#detail-notice')).toBeHidden();await enter(page);await expect(page.locator('#submit')).toBeDisabled();await expect(page.locator('#consentement')).toBeDisabled();
 await page.locator('#form').evaluate(f=>f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));expect(traffic.posts).toBe(0);
 await page.locator('#prenom').focus();release();await expect(page.locator('#submit')).toBeEnabled();await expect(page.locator('#prenom')).toBeFocused();await expect(page.locator('#prenom')).toHaveValue('Essai discret');await expect(page.locator('#consentement')).toBeEnabled();await expect(page.locator('#consentement')).not.toBeChecked();expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('draft-seamless');expect(traffic.posts).toBe(0);
 }finally{release();}
});
for(const change of ['tarif','horaire','supprimée','complète','politique'])test('vérification du formulaire provisoire : '+change,async({page,baseURL})=>{
 const {h,release,traffic}=await setup(page,baseURL,{direct:true});
 try {await expect(page.locator('#registration')).toBeVisible();await enter(page);
 if(change==='tarif')h.data.formations[0].prix=999;
 if(change==='horaire')h.data.sessions[0].heure_debut='10:00';
 if(change==='supprimée')h.data.sessions=[];
 if(change==='complète')for(let i=0;i<h.data.sessions[0].places_max;i++)h.data.registrations.push({id_inscription:'I-'+i,request_id:require('node:crypto').randomUUID(),id_cohorte:h.data.sessions[0].id_cohorte,statut:'confirmee',mail_participant_etat:'SENT',mail_tema_etat:'SENT'});
 if(change==='politique')h.data.params.politique_version='TEST-NEW';
 release();await expect(page.locator('#submit')).toHaveText('Confirmer mon inscription');await expect(page.locator('#prenom')).toHaveValue('Essai discret');
 if(['tarif','horaire'].includes(change)){await expect(page.locator('#changed')).toBeVisible();await expect(page.locator('#submit')).toBeDisabled();await page.locator('#accept-change').click();await expect(page.locator('#submit')).toBeEnabled();await expect(page.locator('#consentement')).not.toBeChecked();}
 else if(change==='politique'){await expect(page.locator('#policy-version')).toHaveText('Version TEST-NEW');await expect(page.locator('#consentement')).not.toBeChecked();await expect(page.locator('#submit')).toBeEnabled();}
 else{await expect(page.locator('#submit')).toBeDisabled();await expect(page.locator('#form-status')).toContainText('Choisissez une autre date');}
 expect(traffic.posts).toBe(0);
 }finally{release();}
});
test('panne locale dans le formulaire, réessai sans perte de saisie',async({page,baseURL})=>{
 const controls={failed:true,direct:true};const {release,traffic}=await setup(page,baseURL,controls);
 try{await enter(page);release();await expect(page.locator('#form-availability')).toContainText('Disponibilité à vérifier');await expect(page.locator('#submit')).toBeDisabled();const retry=page.locator('#form-availability').getByRole('button',{name:'Réessayer',exact:true});await retry.focus();await retry.press('Enter');await expect(retry).toBeFocused();controls.failed=false;await retry.press('Enter');await expect(page.locator('#submit')).toBeEnabled();await expect(page.locator('#submit')).toBeFocused();await expect(page.locator('#prenom')).toHaveValue('Essai discret');expect(traffic.posts).toBe(0);}finally{release();}
});

test('confirmation après vérification et relecture transmet conditions fraîches et saisie',async({page,baseURL})=>{
 const {h,release,traffic,cached}=await setup(page,baseURL,{direct:true,acceptPosts:true});
 try{await enter(page);h.data.formations[0].prix=999;h.data.params.politique_version='TEST-NEW';release();await expect(page.locator('#changed')).toBeVisible();await page.locator('#accept-change').click();await page.locator('#consentement').check();await page.waitForTimeout(1100);await page.locator('#submit').click();await expect(page.locator('#result-title')).toHaveText('Votre place est réservée');expect(traffic.posts).toBe(1);expect(traffic.commands[0].session_revision).toBe(h.service.catalogue().sessions[0].session_revision);expect(traffic.commands[0].session_revision).not.toBe(cached.sessions[0].session_revision);expect(traffic.commands[0].politique_version).toBe('TEST-NEW');expect(traffic.commands[0].prenom).toBe('Essai discret');expect(traffic.commands[0].consentement).toBe(true);expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('draft-seamless');}finally{release();}
});
test('navigation pendant lecture puis retour historique conserve le brouillon',async({page,baseURL})=>{
 const {release,traffic}=await setup(page,baseURL);try{await choose(page);await enter(page);const route=new URL(page.url()).hash;await page.getByRole('link',{name:'Catalogue',exact:true}).click();release();await expect(page.locator('#catalogue .availability-check')).toHaveCount(0);await page.goBack();await expect(page.locator('#registration')).toBeVisible();expect(new URL(page.url()).hash).toBe(route);await expect(page.locator('#prenom')).toHaveValue('Essai discret');await expect(page.locator('#submit')).toBeEnabled();await expect(page.locator('#consentement')).not.toBeChecked();expect(traffic.posts).toBe(0);}finally{release();}
});
test('panne : aucun bouton de reprise imbriqué dans les liens et événements',async({page,baseURL})=>{
 const {release}=await setup(page,baseURL,{failed:true});try{release();await expect(page.locator('.availability-check').first()).toContainText('Disponibilité à vérifier');await expect(page.locator('.calendar-event button')).toHaveCount(0);await page.locator('.card-link').first().click();await expect(page.locator('#detail .calendar-event button')).toHaveCount(0);}finally{release();}
});
