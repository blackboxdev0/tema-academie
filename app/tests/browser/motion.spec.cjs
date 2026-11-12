const {test,expect}=require('@playwright/test');
const {harness}=require('../helpers.cjs');
async function setup(page,baseURL){const h=harness({now:Date.now()});await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/motion-api'})}));await page.route('**/motion-api',r=>r.fulfill({json:h.service.catalogue()}));await page.goto('/');await expect(page.locator('.card')).toHaveCount(1);await page.evaluate(()=>document.fonts.ready);return h;}
test('entrée de vue douce et navigation rapide sans attendre ni laisser de vue animée cachée',async({page,baseURL})=>{
 await setup(page,baseURL);
 const entry=await page.evaluate(()=>new Promise(resolve=>{window.addEventListener('hashchange',()=>{const el=document.getElementById('detail'),a=el.getAnimations()[0];if(a)a.pause();resolve({visible:!el.hidden,focus:document.activeElement.id,animated:!!a,opacity:Number(getComputedStyle(el).opacity)});},{once:true});document.querySelector('.card-link').click();}));
 expect(entry.visible).toBe(true);expect(entry.focus).toBe('detail-title');expect(entry.animated).toBe(true);expect(entry.opacity).toBeLessThan(1);
 const quick=await page.evaluate(()=>{document.querySelector('#detail .selection-summary button').click();return{formVisible:!document.getElementById('registration').hidden,oldHidden:document.getElementById('detail').hidden,oldAnimations:document.getElementById('detail').getAnimations().length,focus:document.activeElement.id};});
 expect(quick).toEqual({formVisible:true,oldHidden:true,oldAnimations:0,focus:'form-title'});await page.locator('#prenom').fill('Saisie pendant transition');await expect(page.locator('#prenom')).toHaveValue('Saisie pendant transition');
 await page.getByRole('link',{name:'Catalogue',exact:true}).click();await expect(page.locator('#catalogue')).toBeVisible();await page.goBack();await expect(page.locator('#registration')).toBeVisible();await expect(page.locator('#prenom')).toHaveValue('Saisie pendant transition');
});
test('réduction des animations respectée dès ouverture et en cours de transition',async({page,baseURL})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await setup(page,baseURL);expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');await page.locator('.card-link').click();await expect(page.locator('#detail')).toBeVisible();expect(await page.locator('#detail').evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.emulateMedia({reducedMotion:'no-preference'});await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');await page.evaluate(()=>new Promise(requestAnimationFrame));
 await page.evaluate(()=>{document.querySelector('#detail .selection-summary button').click();const a=document.getElementById('registration').getAnimations()[0];if(a)a.pause();});
 await expect.poll(()=>page.locator('#registration').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.locator('#registration').evaluate(el=>el.getAnimations().length)).toBe(0);await expect(page.locator('#form-title')).toBeFocused();await expect(page.locator('#submit')).toBeEnabled();
});
test('ancres et retour défilent vers la cible, actualisation conserve immédiatement la position',async({page,baseURL})=>{
 const h=await setup(page,baseURL);expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth');await page.getByRole('link',{name:'Calendrier',exact:true}).click();
 const distance=()=>page.evaluate(()=>{const el=document.getElementById('calendrier'),target=Math.max(0,Math.min(el.getBoundingClientRect().top+scrollY-24,document.documentElement.scrollHeight-innerHeight));return Math.abs(scrollY-target);});
 await expect.poll(distance).toBeLessThan(2);
 const next=page.getByRole('button',{name:'Mois suivant',exact:true});await next.focus();const y=await page.evaluate(()=>scrollY);h.data.formations[0].prix=990;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.locator('.card-price')).toContainText('990');await expect(next).toBeFocused();expect(await page.evaluate(()=>scrollY)).toBeCloseTo(y,0);expect(await page.locator('#catalogue').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.getByRole('link',{name:'Calendrier',exact:true}).click();await page.evaluate(()=>new Promise(requestAnimationFrame));expect(await distance()).toBeLessThan(2);
});

test('réduction pendant défilement termine la navigation au calendrier',async({page,baseURL})=>{
 await setup(page,baseURL);await page.getByRole('link',{name:'Calendrier',exact:true}).click();await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.evaluate(()=>{const el=document.getElementById('calendrier'),target=Math.max(0,Math.min(el.getBoundingClientRect().top+scrollY-24,document.documentElement.scrollHeight-innerHeight));return Math.abs(scrollY-target);})).toBeLessThan(2);
});
test('ancre de dates après changement de vue garde les24px de marge',async({page,baseURL})=>{
 await setup(page,baseURL);await page.evaluate(()=>{location.hash=document.querySelector('.card-link').hash+'&section=dates';});await expect(page.locator('#detail')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>{const el=document.getElementById('dates-formation'),target=Math.max(0,Math.min(el.getBoundingClientRect().top+scrollY-24,document.documentElement.scrollHeight-innerHeight));return Math.abs(scrollY-target);})).toBeLessThan(2);
});
test('données fraîches pendant consultation depuis cache ne changent ni position ni focus',async({page,baseURL})=>{
 const h=harness({now:Date.now()}),data=h.service.catalogue();let release;const gate=new Promise(r=>release=r);
 await page.addInitScript(({key,data})=>localStorage.setItem(key,JSON.stringify({version:2,saved:Date.now(),data})),{key:'tema-public-v2:'+baseURL+'/motion-api',data});await page.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.TEMA_CONFIG='+JSON.stringify({apiUrl:baseURL+'/motion-api'})}));await page.route('**/motion-api',async r=>{await gate;await r.fulfill({json:h.service.catalogue()});});
 try{await page.goto('/#formation='+data.formations[0].id);await page.evaluate(()=>Promise.all(document.getElementById('detail').getAnimations({subtree:true}).map(a=>a.finished)));await page.locator('#detail-title').focus();await page.evaluate(()=>window.scrollTo({top:450,behavior:'instant'}));const y=await page.evaluate(()=>scrollY);h.data.formations[0].prix=990;release();await expect(page.locator('#detail .detail-meta')).toContainText('990');await expect(page.locator('#detail-title')).toBeFocused();expect(await page.evaluate(()=>scrollY)).toBeCloseTo(y,0);expect(await page.locator('#detail').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);}finally{release();}
});

test('réduction arrête aussi un défilement après interaction intermédiaire',async({page,baseURL})=>{
 await setup(page,baseURL);await page.getByRole('link',{name:'Calendrier',exact:true}).click();await page.evaluate(()=>window.dispatchEvent(new PointerEvent('pointerdown')));await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');await page.evaluate(()=>new Promise(requestAnimationFrame));const y=await page.evaluate(()=>scrollY);const samples=await page.evaluate(()=>new Promise(resolve=>{const values=[];function frame(){values.push(scrollY);if(values.length===32)resolve(values);else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));expect(samples.every(value=>Math.abs(value-y)<1)).toBe(true);
});


for(const direction of ['descendant','montant'])test('réduction après interruption du scroll '+direction+' déjà en mouvement',async({page,baseURL})=>{
 // Observer les appels natifs pour comparer la position au moment exact de
 // l’arrêt, sans compter le mouvement légitime avant le signal système.
 await page.addInitScript(()=>{const scroll=window.scrollTo.bind(window);window.scrollTo=function(options){if(matchMedia('(prefers-reduced-motion: reduce)').matches&&!window.stopPosition)window.stopPosition={x:scrollX,y:scrollY};return scroll(options);};});
 await setup(page,baseURL);
 const up=direction==='montant';
 await page.evaluate(up=>window.scrollTo({top:up?document.documentElement.scrollHeight:0,behavior:'instant'}),up);
 const interrupted=await page.evaluate(up=>new Promise(resolve=>{
  const start=scrollY;document.querySelector(up?'header a[data-home="catalogue"]':'header a[href="#calendrier"]').click();
  function frame(){const el=document.getElementById('calendrier'),target=up?0:Math.max(0,Math.min(el.getBoundingClientRect().top+scrollY-24,document.documentElement.scrollHeight-innerHeight));
   if(Math.abs(scrollY-start)>2){const inMotion=Math.abs(scrollY-target)>2;window.dispatchEvent(new PointerEvent('pointerdown'));resolve({inMotion,target});}else requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
 }),up);
 expect(interrupted.inMotion).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.evaluate(()=>window.stopPosition||null)).not.toBeNull();
 const stop=await page.evaluate(()=>window.stopPosition);
 const samples=await page.evaluate(()=>new Promise(resolve=>{const values=[];function frame(){values.push(scrollY);if(values.length===32)resolve(values);else requestAnimationFrame(frame);}requestAnimationFrame(frame);}));
 expect(Math.abs(stop.y-interrupted.target)).toBeGreaterThan(2);
 expect(samples.every(value=>Math.abs(value-stop.y)<1)).toBe(true);
});
