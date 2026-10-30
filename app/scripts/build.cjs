const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'apps-script'), { recursive: true });
// Explicit public assets only: never copy local JSON, backups or source maps.
const permitted = new Set(['.html', '.js', '.css', '.png', '.svg', '.woff', '.woff2', '.txt']);
fs.cpSync(path.join(root, 'web'), path.join(out, 'web'), { recursive: true, filter: source => fs.statSync(source).isDirectory() || permitted.has(path.extname(source)) && !source.endsWith('.local.js') });
const project = JSON.parse(fs.readFileSync(path.join(root, '..', 'config', 'project.json'), 'utf8'));
const apiUrl = process.env.TEMA_TEST_API_URL === undefined ? project.google.resources.environments.TEST.web_app_url || '' : process.env.TEMA_TEST_API_URL;
if (apiUrl && !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(apiUrl)) throw new Error('TEMA_TEST_API_URL must be the TEST /exec URL');
fs.writeFileSync(path.join(out, 'web', 'config.js'), 'window.TEMA_CONFIG = ' + JSON.stringify({ apiUrl }) + ';\n');
fs.writeFileSync(path.join(out, 'apps-script', 'Code.gs'), ['engine.js', 'google.js'].map(name => fs.readFileSync(path.join(root, 'apps-script', name), 'utf8')).join('\n\n'));
fs.copyFileSync(path.join(root, 'apps-script', 'appsscript.json'), path.join(out, 'apps-script', 'appsscript.json'));
console.log('Static site: dist/web; Google editor source: dist/apps-script/Code.gs (no real service called). TEST API ' + (apiUrl ? 'configured.' : 'not configured.'));
