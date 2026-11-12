const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const profile = require('./local-profile.cjs').resolve();
fs.rmSync(out, { recursive: true, force: true });
const backendDirectory = profile.environment === 'COPY' ? 'apps-script-TEST-reference' : 'apps-script';
fs.mkdirSync(path.join(out, backendDirectory), { recursive: true });
// Explicit public assets only: never copy local JSON, backups or source maps.
const permitted = new Set(['.html', '.js', '.css', '.png', '.svg', '.woff', '.woff2', '.txt']);
fs.cpSync(path.join(root, 'web'), path.join(out, 'web'), { recursive: true, filter: source => fs.statSync(source).isDirectory() || permitted.has(path.extname(source)) && !source.endsWith('.local.js') });
const apiUrl = profile.apiUrl;
fs.writeFileSync(path.join(out, 'web', 'config.js'), 'window.TEMA_CONFIG = ' + JSON.stringify({ apiUrl }) + ';\n');
fs.writeFileSync(path.join(out, backendDirectory, 'Code.gs'), ['engine.js', 'google.js', 'catalogue.js'].map(name => fs.readFileSync(path.join(root, 'apps-script', name), 'utf8')).join('\n\n'));
fs.copyFileSync(path.join(root, 'apps-script', 'appsscript.json'), path.join(out, backendDirectory, 'appsscript.json'));
console.log('Site statique : dist/web ; API ' + profile.environment + (apiUrl ? ' configurée.' : ' absente.') + ' Backend TEST de référence : dist/' + backendDirectory + '/Code.gs.');
if (profile.environment === 'COPY') console.log('Le candidat Google COPY se construit séparément hors dépôt : node experiments/build-copy-backend.cjs. Ne pas installer la référence TEST dans la copie.');
