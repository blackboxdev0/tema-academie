'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23' });
const context = { module:{exports:{}} };
vm.runInNewContext(fs.readFileSync(__dirname+'/admin-sheet-prototype.gs','utf8'),context);
vm.runInNewContext(fs.readFileSync(__dirname+'/admin-sheet-actions.gs','utf8'),context);
const actions = context.module.exports;
const blank = n => Array(n).fill('');
const row = (n,v) => Object.assign(blank(n),v);
const header = (n,c,s) => row(n,{[c]:s+' — Formation'});
function input() { return {
 f:[header(13,2,'Divalto'),row(13,{0:'DIV-old',1:'DIV — Divalto',2:'Ergonomie',7:'1 jour',8:850,10:8,12:true}),blank(13),header(13,2,'Dimo'),row(13,{0:'DIMO-old',1:'DIMO — Dimo',2:'Dimo existante',7:'1 jour',8:850,10:8,12:true}),blank(13),header(13,2,'MoovApps'),row(13,{0:'MOOV-old',1:'MOOV — MoovApps',2:'MoovApps',7:'1 jour',8:850,10:8,12:false})],
 s:[header(12,1,'Divalto'),row(12,{0:'C-old',1:'DIV-old — Ergonomie',2:'2027-01-15',3:'09:00',4:'12:00',5:8,6:'en_ligne',8:true,9:8}),blank(12),header(12,1,'Dimo'),row(12,{0:'C-dimo',1:'DIMO-old — Dimo existante',2:'2027-06-10',3:'09:00',4:'12:00',5:8,6:'en_ligne',8:false,9:8}),blank(12),header(12,1,'MoovApps'),blank(12)]
}; }
function deps() { let n=0;return { uuid:()=> 'generated-'+ ++n,now:()=>Date.parse('2026-11-04T12:00:00Z'),confirmed:{},cellText:(v,kind)=>v instanceof Date ? (kind==='date'?formatter.format(v).slice(0,10):formatter.format(v).slice(11,16)):String(v),formatLocal:ms=>formatter.format(new Date(ms)).replace(' ','T') }; }
const requestId='b530396f-0000-4000-8000-000000000001';
const formation = extra => Object.assign({kind:'formation',requestId,software:'DIMO',title:'ESSAI boutons',duration:'1 jour',price:'850',published:true},extra);
const sessions = extra => Object.assign({kind:'sessions',requestId,formationId:'DIMO-old',open:true,dates:[{date:'2027-02-10',start:'09:00',end:'17:00',capacity:'6',mode:'en_ligne',venue:''},{date:'2027-03-10',start:'09:00',end:'17:00',capacity:'12',mode:'en_ligne',venue:''}]},extra);
test('nouvelle fiche complète : bon bloc, ID déterministe, tarif numérique et champs de fiche',()=>{
 const x=input(),r=actions.prepare(x.f,x.s,formation({description:'Description',content:'Programme',trainers:'Formateur'}),deps());
 assert.equal(r.after,4);assert.equal(r.rows[0][0],'DIMO-PR-'+requestId);assert.equal(r.rows[0][8],850);assert.equal(r.rows[0][3],'Description');assert.equal(r.rows[0][5],'Programme');assert.equal(r.rows[0][11],'Formateur');assert.equal(r.exists,false);
});
test('tarif vide et tarif zéro restent distincts',()=>{
 const x=input();assert.equal(actions.prepare(x.f,x.s,formation({price:''}),deps()).rows[0][8],'');assert.equal(actions.prepare(x.f,x.s,formation({price:'0'}),deps()).rows[0][8],0);
});
test('plusieurs sessions : référence commune, IDs uniques et capacités indépendantes',()=>{
 const x=input(),r=actions.prepare(x.f,x.s,sessions(),deps());assert.equal(r.after,4);assert.equal(r.rows.length,2);assert.notEqual(r.rows[0][0],r.rows[1][0]);assert.equal(r.rows[0][1],r.rows[1][1]);assert.deepEqual(Array.from(r.rows,r=>r[5]),[6,12]);assert.deepEqual(Array.from(r.rows,r=>r[9]),[6,12]);assert.ok(r.rows.every(r=>r[8]===true));
});
for(const [label,payload] of [['titre absent',formation({title:''})],['durée absente',formation({duration:''})],['logiciel inconnu',formation({software:'constructor'})],['tarif négatif',formation({price:'-1'})],['requête sans ID',formation({requestId:''})],['formation non publiée',sessions({formationId:'MOOV-old'})],['deux dates identiques',sessions({dates:Array(2).fill(sessions().dates[0])})],['date impossible',sessions({dates:[{...sessions().dates[0],date:'2027-02-30'}]})],['horaire inversé',sessions({dates:[{...sessions().dates[0],end:'08:00'}]})],['capacité zéro',sessions({dates:[{...sessions().dates[0],capacity:'0'}]})],['capacité vide',sessions({dates:[{...sessions().dates[0],capacity:''}]})],['format absent',sessions({dates:[{...sessions().dates[0],mode:''}]})],['lieu présentiel absent',sessions({dates:[{...sessions().dates[0],mode:'presentiel'}]})]]) test(label+' : aucune mutation',()=>{
 const x=input(),before=JSON.stringify(x);assert.throws(()=>actions.prepare(x.f,x.s,payload,deps()));assert.equal(JSON.stringify(x),before);
});
test('réessai même requête : session unique, autres contenus sous même ID refusés',()=>{
 const x=input(),payload=sessions(),r=actions.prepare(x.f,x.s,payload,deps());x.s.splice(r.after,0,...Array.from(r.rows,r=>Array.from(r)));
 const retry=actions.prepare(x.f,x.s,payload,deps());assert.equal(retry.exists,true);payload.dates[0].capacity='7';assert.throws(()=>actions.prepare(x.f,x.s,payload,deps()),/déjà enregistré/);
});
test('réessai de fiche : publication et titre identiques requis',()=>{
 const x=input(),payload=formation(),r=actions.prepare(x.f,x.s,payload,deps());x.f.splice(r.after,0,...Array.from(r.rows,r=>Array.from(r)));
 assert.equal(actions.prepare(x.f,x.s,payload,deps()).exists,true);payload.title='Autre titre';assert.throws(()=>actions.prepare(x.f,x.s,payload,deps()),/déjà enregistré/);
});
test('insertion partielle : refus explicite plutôt que duplication',()=>{
 const x=input(),r=actions.prepare(x.f,x.s,sessions(),deps());x.s.splice(r.after,0,Array.from(r.rows[0]));assert.throws(()=>actions.prepare(x.f,x.s,sessions(),deps()),/Vérifiez les lignes/);
});
test('requête de fiche réessayée avec un autre logiciel : aucun second ID',()=>{
 const x=input(),r=actions.prepare(x.f,x.s,formation({software:'DIV'}),deps());x.f.splice(r.after,0,Array.from(r.rows[0]));assert.throws(()=>actions.prepare(x.f,x.s,formation({software:'DIMO'}),deps()),/enregistré/);
});
test('réessai d’un lot raccourci : refus du lot différent',()=>{
 const x=input(),r=actions.prepare(x.f,x.s,sessions(),deps());x.s.splice(r.after,0,...Array.from(r.rows,r=>Array.from(r)));assert.throws(()=>actions.prepare(x.f,x.s,sessions({dates:sessions().dates.slice(0,1)}),deps()),/autres paramètres/);
});
test('hors copie : aucun service ni lecture',()=>{assert.throws(()=>actions.create({getId:()=> 'original'},formation()),/copie/);});
test('contenu commençant par formule : échappé au writer',()=>{assert.equal(actions.literal('=IMPORTXML("x")'),'\'=IMPORTXML("x")');assert.equal(actions.literal(850),850);});
function google(extra={}) {
 const x=input(),log=[],state={released:false};
 function sheet(name,rows){const s={getName:()=>name,getLastRow:()=>rows.length,getSheetId:()=>name==='Formations'?0:336481329,
 insertRowsAfter(r,n){rows.splice(r,0,...Array.from({length:n},()=>blank(rows[0].length)));log.push(['insert',name,r,n]);},deleteRows(r,n){rows.splice(r-1,n);log.push(['rollback',name,r,n]);},autoResizeRows(r){if(extra.failResize){rows[r-1][2]='Saisie humaine conservée';throw Error('resize failed');}},setActiveRange(){},
 getRange(r,c,nr=1,nc=1){return {getValues(){return Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>rows[r+i-1]?.[c+j-1]??''));},copyTo(){},clearDataValidations(){},setNumberFormat(){assert.equal(nc,1,'Google tables format one column at a time');},setValues(values){if(extra.failWrite)throw Error('write failed');assert.ok(['Formations','Disponibilités'].includes(name));values.forEach((v,i)=>v.forEach((w,j)=>rows[r+i-1][c+j-1]=w));log.push(['write',name,r,c]);}};}};return s;}
 const sheets={Formations:sheet('Formations',x.f),'Disponibilités':sheet('Disponibilités',x.s)};
 const book={getId:()=>context.TemaSheetPrototype.target,getSheetByName:n=>sheets[n],setActiveSheet(){}};
 const d=deps();
 const globals={Date:new Proxy(Date,{get(t,k){return k==='now'?d.now:t[k];}}),LockService:{getScriptLock:()=>({tryLock:()=> !extra.busy,releaseLock(){state.released=true;}})},Utilities:{getUuid:d.uuid,formatDate(v,z,pattern){const value=formatter.format(v);return pattern==='yyyy-MM-dd'?value.slice(0,10):pattern==='HH:mm'?value.slice(11,16):value.replace(' ','T');},parseDate(value){return new Date(value.replace(' ','T')+':00-05:00');}},SpreadsheetApp:{CopyPasteType:{PASTE_FORMAT:1,PASTE_DATA_VALIDATION:2},flush(){}}};
 return {x,log,state,book,globals};
}
test('writer autorisé : insertion dans le bon bloc, préservation des lignes existantes et réessai',()=>{
 const g=google(),oldf=JSON.stringify(g.x.f),oldSessions=g.x.s.filter(r=>r[0]).map(r=>r.slice());Object.assign(context,g.globals);const oldSync=context.TemaSheetPrototype.sync;context.TemaSheetPrototype.sync=()=>{};
 try {const result=actions.create(g.book,sessions());assert.equal(result.count,2);assert.equal(g.state.released,true);assert.equal(JSON.stringify(g.x.f),oldf);assert.ok(oldSessions.every(old=>g.x.s.some(r=>JSON.stringify(r)===JSON.stringify(old))));assert.equal(g.x.s[4][2] instanceof Date,true);assert.equal(g.x.s[4][5],6);assert.equal(actions.create(g.book,sessions()).repeated,true);assert.equal(g.log.filter(x=>x[0]==='write').length,1);}finally{context.TemaSheetPrototype.sync=oldSync;}
});
test('verrou occupé : pas de ligne ni écriture',()=>{const g=google({busy:true});Object.assign(context,g.globals);assert.throws(()=>actions.create(g.book,formation()),/mise à jour/);assert.equal(g.log.length,0);});
test('erreur de validation : verrou libéré sans insertion',()=>{const g=google();Object.assign(context,g.globals);assert.throws(()=>actions.create(g.book,formation({title:''})));assert.equal(g.log.length,0);assert.equal(g.state.released,true);});
test('échec d’écriture : lignes insérées retirées et verrou libéré',()=>{const g=google({failWrite:true}),before=JSON.stringify(g.x);Object.assign(context,g.globals);assert.throws(()=>actions.create(g.book,formation()),/write failed/);assert.equal(g.state.released,true);assert.equal(JSON.stringify(g.x),before);assert.ok(g.log.some(x=>x[0]==='rollback'));});
test('actualisation ignorée : succès enregistré accompagné d’un avertissement',()=>{
 const g=google();Object.assign(context,g.globals);const oldSync=context.TemaSheetPrototype.sync;context.TemaSheetPrototype.sync=()=>false;
 try {const result=actions.create(g.book,formation());assert.match(result.notice,/Ajout enregistré/);assert.ok(g.x.f.some(r=>r[0]==='DIMO-PR-'+requestId));}finally{context.TemaSheetPrototype.sync=oldSync;}
});
test('erreur après écriture : ne supprime jamais une ligne contenant une saisie',()=>{
 const g=google({failResize:true});Object.assign(context,g.globals);assert.throws(()=>actions.create(g.book,formation()),/a pu être enregistré/);assert.equal(g.x.f[4][2],'Saisie humaine conservée');assert.ok(!g.log.some(x=>x[0]==='rollback'));assert.equal(g.state.released,true);
});
test('dialogue : titres échappés et champs privés de fiche non transmis au formulaire de sessions',()=>{
 const g=google();g.x.f[4][2]='</script><img src=x onerror=alert(1)>';g.x.f[4][3]='private-description-marker';Object.assign(context,g.globals);let rendered='';
 context.TEMA_ADMIN_DIALOG='<script>const BOOT=/*__TEMA_BOOT__*/null;</script>';
 context.HtmlService={createHtmlOutput(html){rendered=html;return {setWidth(){return this;},setHeight(){return this;}};}};
 context.SpreadsheetApp.getActiveSpreadsheet=()=>g.book;context.SpreadsheetApp.getUi=()=>({showModalDialog(){}});
 actions.show('sessions');assert.ok(rendered.includes('\\u003c/script>'));assert.ok(!rendered.includes('<img'));assert.ok(!rendered.includes('private-description-marker'));
});
test('installation interrompue : seul l’onglet nouvellement créé est retiré',()=>{
 const g=google();Object.assign(context,g.globals);let created,removed=false;
 const chain={};for(const name of ['setBackground','setFontFamily','setFontColor','merge','setValue','setFontSize','setFontWeight'])chain[name]=()=>chain;
 const sheet={getRange:()=>chain,insertImage(){throw Error('image failed');}};
 for(const name of ['setHiddenGridlines','setTabColor','setColumnWidth','setRowHeights','setRowHeight'])sheet[name]=()=>sheet;
 g.book.insertSheet=()=>{created=sheet;return sheet;};g.book.deleteSheet=s=>{assert.equal(s,created);removed=true;};
 context.TEMA_ADMIN_BUTTONS={formation:'png',session:'png'};context.Utilities.newBlob=()=>({});context.Utilities.base64Decode=()=>[];
 assert.throws(()=>actions.install(g.book),/image failed/);assert.equal(removed,true);
});
