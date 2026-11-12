'use strict';
const fs = require('node:fs');
const path = require('node:path');
const T = require('../apps-script/engine.js');
const output = process.argv[2];
if (!output) throw new Error('Indiquez un dossier de sortie pour les aperçus fictifs.');
const row = {
 id_inscription:'I-APERCU-FICTIF',horodatage:'2026-11-09T14:00:00.000Z',statut:'confirmee',
 prenom:'Camille',nom:'Exemple',entreprise:'Entreprise exemple',courriel:'camille@example.invalid',telephone:'',
 formation_snapshot:JSON.stringify({titre:'Ergonomie',duree:'½ journée',prix:450,prix_qualificatif:'À partir de'}),
 debut_snapshot:'2027-01-15T14:00:00.000Z',fin_snapshot:'2027-01-15T17:00:00.000Z',
 lieu_snapshot:JSON.stringify({mode:'en_ligne',lien_visio:null}),mail_participant_etat:'SENT'
};
const params={courriel_contact:'contact@example.invalid',nom_expediteur:'Tema Académie'};
const deps={mailLogo:true,privateSheetUrl:'https://example.invalid/suivi-prive',formatLocal(ms){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms)).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;}};
fs.mkdirSync(output,{recursive:true});
for(const [channel,name,place] of [['participant','confirmation-tema',null],['tema','avis-tema',null],['participant','confirmation-avec-lien',{mode:'en_ligne',lien_visio:'https://example.invalid/rejoindre'}],['participant','confirmation-presentiel',{mode:'presentiel',adresse_presentiel:'Salle exemple, Montréal'}]]) {
 row.lieu_snapshot=JSON.stringify(place || {mode:'en_ligne',lien_visio:null});
 const mail=T.makeMail(row,params,channel,'recipient@example.invalid',deps);
 fs.writeFileSync(path.join(output,name+'.html'),mail.htmlBody.replace('cid:temaLogo','data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'../web/assets/logo-tema.png')).toString('base64')));
 fs.writeFileSync(path.join(output,name+'.txt'),mail.subject+'\n\n'+mail.body+'\n');
}
console.log('Quatre aperçus fictifs générés, aucun envoi.');
