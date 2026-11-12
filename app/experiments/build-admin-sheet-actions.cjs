'use strict';
// Bundle de la copie uniquement, conservé hors dépôt. Aucun déploiement produit.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
async function assets() {
  const buttons = {};
  for (const [key, label] of [['formation', 'Ajouter une formation'], ['session', 'Ajouter une session']]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="140"><rect width="720" height="140" rx="12" fill="#20212B"/><rect width="8" height="140" rx="4" fill="#FF008F"/><text x="42" y="84" font-family="Arial,sans-serif" font-size="34" font-weight="600" fill="white">${label}</text><path d="M652 56v28m-14-14h28" stroke="white" stroke-width="3"/></svg>`;
    buttons[key] = (await sharp(Buffer.from(svg)).png().toBuffer()).toString('base64');
  }
  const html = await fs.readFile(path.join(__dirname, 'admin-sheet-actions.html'), 'utf8');
  return { html, buttons };
}
async function main() {
  const dir = path.join('/Users/sofiane/.config/tema-academie', 'prototype-boutons-20261104');
  await fs.mkdir(dir, { recursive: true });
  const { html, buttons } = await assets();
  const sources = await Promise.all(['admin-sheet-prototype.gs', 'admin-sheet-actions.gs', 'admin-sheet-registrations.gs'].map(name => fs.readFile(path.join(__dirname,name),'utf8')));
  const bundle = sources.join('\n') + '\nvar TEMA_ADMIN_DIALOG = ' + JSON.stringify(html) + ';\nvar TEMA_ADMIN_BUTTONS = ' + JSON.stringify(buttons) + ';\n';
  const output = path.join(dir, 'Code.gs'); await fs.writeFile(output,bundle);
  console.log(JSON.stringify({ output, bytes: Buffer.byteLength(bundle) }));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { assets };
