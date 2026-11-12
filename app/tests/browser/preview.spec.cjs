const {test,expect}=require('@playwright/test');
const {harness}=require('../helpers.cjs');
test('première visite attend les données actuelles et ignore toute ancienne copie',async({page,baseURL})=>{
 let release;const gate=new Promise(resolve=>{release=resolve;});const h=harness({now:Date.now()});
 await page.addInitScript(()=>{window.TEMA_CATALOGUE_PREVIEW={formations:[{titre:'ANCIENNE FORMATION'}]};localStorage.setItem('tema-public-catalogue-v1:old','ANCIENNE DATE');});
 await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/fresh-api'})}));
 await page.route('**/fresh-api',async r=>{await gate;await r.fulfill({json:h.service.catalogue()});});
 try{
 await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.locator('#formations')).toBeEmpty();await expect(page.locator('#catalogue-status')).toContainText('Chargement');
 release();await expect(page.locator('#formations')).toContainText('Essai');await expect(page.locator('#formations')).not.toContainText('ANCIENNE');
 h.data.formations[0].titre='Nouvelle formation depuis Sheets';await page.reload();await expect(page.locator('#formations')).toContainText('Nouvelle formation depuis Sheets');
 }finally{release();}
});
test('panne initiale reste vide et permet une nouvelle lecture',async({page,baseURL})=>{
 let failed=true;const h=harness({now:Date.now()});
 await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/fresh-api'})}));
 await page.route('**/fresh-api',r=>failed?r.abort():r.fulfill({json:h.service.catalogue()}));
 await page.goto('/');await expect(page.locator('#formations')).toBeEmpty();await expect(page.locator('#retry-catalogue')).toBeVisible();failed=false;
 await page.locator('#retry-catalogue').click();await expect(page.locator('#formations')).toContainText('Essai');
});
test('cache immédiat puis remplacement frais, confirmation verrouillée et projection publique',async({page,baseURL})=>{
 const h=harness({now:Date.now()});let blocked=false,release;let gate=Promise.resolve();
 await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/cache-api'})}));
 await page.route('**/cache-api',async r=>{if(blocked)await gate;const data=h.service.catalogue();data.secret='NE_PAS_STOCKER';await r.fulfill({json:data});});
 await page.goto('/');await expect(page.locator('#formations')).toContainText('Essai');
 const stored=await page.evaluate(()=>localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('tema-public-v2:'))));expect(stored).not.toContain('NE_PAS_STOCKER');expect(stored).not.toContain('policy');expect(stored).not.toContain('contact');
 blocked=true;gate=new Promise(r=>release=r);h.data.formations[0].titre='Offre modifiée';
 try{await page.goto('about:blank');await page.goto('/#formation='+h.data.formations[0].id+'&date='+h.data.sessions[0].id_cohorte+'&vue=inscription',{waitUntil:'domcontentloaded'});await expect(page.locator('#registration')).toBeVisible();await expect(page.locator('#submit')).toBeDisabled();await page.getByRole('link',{name:'Catalogue',exact:true}).click();await expect(page.locator('#formations')).toContainText('Essai');await expect(page.locator('#catalogue-notice')).toBeHidden();await expect(page.locator('.availability-check').first()).toContainText('Vérification');await expect(page.locator('#formations')).not.toContainText('place restante');await page.locator('.card-link').first().click();await page.locator('#detail .calendar-event').first().click();await expect(page.getByRole('button',{name:'S’inscrire à cette date',exact:true})).toBeEnabled();
 release();await expect(page.locator('#detail')).toContainText('Offre modifiée');await expect(page.getByRole('button',{name:'S’inscrire à cette date',exact:true})).toBeEnabled();
 }finally{release();}
});
for(const mode of ['expiré','corrompu','refusé','structure invalide'])test('cache '+mode+' revient au chargement normal',async({page,baseURL})=>{
 const h=harness({now:Date.now()});let release;const gate=new Promise(r=>release=r);
 await page.addInitScript(({mode,key,data})=>{if(mode==='refusé'){Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});return;}if(mode==='structure invalide')data.sessions[0].end_at='invalid';localStorage.setItem(key,mode==='corrompu'?'{':JSON.stringify({version:2,saved:Date.now()-(mode==='expiré'?86400001:0),data}));},{mode,key:'tema-public-v2:'+baseURL+'/cache-api',data:h.service.catalogue()});
 await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/cache-api'})}));await page.route('**/cache-api',async r=>{await gate;await r.fulfill({json:h.service.catalogue()});});
 try{await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.locator('#formations')).toBeEmpty();release();await expect(page.locator('#formations')).toContainText('Essai');}finally{release();}
});
test('cache avec panne puis suppression Google et dates passées',async({page,baseURL})=>{
 const h=harness({now:Date.now()});const data=h.service.catalogue();data.sessions[0].start_at='2000-01-15T14:00:00Z';data.sessions[0].end_at='2000-01-15T17:00:00Z';let failed=true;
 await page.addInitScript(({key,data})=>localStorage.setItem(key,JSON.stringify({version:2,saved:Date.now(),data})),{key:'tema-public-v2:'+baseURL+'/cache-api',data});
 await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/cache-api'})}));await page.route('**/cache-api',r=>failed?r.abort():r.fulfill({json:{...h.service.catalogue(),formations:[],sessions:[]}}));
 await page.goto('/');await expect(page.locator('#formations')).toContainText('Essai');await expect(page.locator('#formations')).not.toContainText('2000');await expect(page.locator('#catalogue-notice')).toBeHidden();await expect(page.locator('.availability-check').first()).toContainText('Disponibilité à vérifier');await expect(page.locator('#formations')).not.toContainText('places restantes');failed=false;await page.locator('.availability-check').first().getByRole('button',{name:'Réessayer',exact:true}).click();await expect(page.locator('#formations')).toBeEmpty();
});
