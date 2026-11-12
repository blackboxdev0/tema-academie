'use strict';
// Module de la seule copie : visuel du bouton embarqué, aucun appel réseau.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
async function main() {
  const dir = '/Users/sofiane/.config/tema-academie/native-button-20261108';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1130" height="104"><rect width="1130" height="104" rx="10" fill="#20212B"/><rect width="8" height="104" rx="4" fill="#FF008F"/><text x="46" y="65" font-family="Arial,sans-serif" font-size="31" font-weight="600" fill="white">Enregistrer la formation</text><path d="M1040 51l12 12 24-26" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const code = await fs.readFile(path.join(__dirname, 'admin-native-form.gs'), 'utf8');
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(dir, 'SaisieNative.gs'), code + '\nvar TEMA_NATIVE_SAVE_BUTTON = ' + JSON.stringify(png.toString('base64')) + ';\n');
  console.log(JSON.stringify({ output: path.join(dir, 'SaisieNative.gs') }));
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
