const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const repository = path.resolve(root, '..');
function build(options = {}) {
  const profile = options.profile || require('./local-profile.cjs').resolve();
  const production = profile.environment === 'PRODUCTION';
  if (production) require('./production-target.cjs').validateTarget(profile);
  const out = path.resolve(options.output || (production ? process.env.TEMA_PRODUCTION_OUTPUT_PATH || path.join(os.homedir(), '.config/tema-academie/production-web') : path.join(root, 'dist')));
  if (production) require('./private-output.cjs').assertPrivateOutput(out, repository);
  const marker = path.join(out, '.tema-web-build');
  if (production && fs.existsSync(out) && !fs.existsSync(marker) && fs.readdirSync(out).length) throw new Error('Refusing a nonempty PRODUCTION output without a build marker.');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true, mode: production ? 0o700 : 0o755 });
  fs.writeFileSync(marker, profile.environment + '\n', { mode: 0o600 });
  const permitted = new Set(['.html', '.js', '.css', '.png', '.svg', '.woff', '.woff2', '.txt']);
  fs.cpSync(path.join(root, 'web'), path.join(out, 'web'), { recursive: true, filter: source => fs.statSync(source).isDirectory() || permitted.has(path.extname(source)) && !source.endsWith('.local.js') });
  const config = production ? { apiUrl: profile.apiUrl, environment: 'PRODUCTION', policyVersion: require('./production-target.cjs').POLICY_VERSION } : { apiUrl: profile.apiUrl };
  fs.writeFileSync(path.join(out, 'web/config.js'), 'window.TEMA_CONFIG = ' + JSON.stringify(config) + ';\n');
  if (production) {
    const index = path.join(out, 'web/index.html');
    fs.writeFileSync(index, require('./web-production.cjs').html(fs.readFileSync(index, 'utf8')));
    function privateFiles(dir) { fs.chmodSync(dir, 0o700); for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); if (entry.isDirectory()) privateFiles(file); else fs.chmodSync(file, 0o600); } }
    privateFiles(out);
    console.log('Private PRODUCTION web candidate: ' + path.join(out, 'web') + '. No deployment or permission change.');
    return { output: out, web: path.join(out, 'web'), environment: 'PRODUCTION' };
  }
  const backendDirectory = profile.environment === 'COPY' ? 'apps-script-TEST-reference' : 'apps-script';
  fs.mkdirSync(path.join(out, backendDirectory), { recursive: true });
  fs.writeFileSync(path.join(out, backendDirectory, 'Code.gs'), ['engine.js', 'google.js', 'catalogue.js'].map(name => fs.readFileSync(path.join(root, 'apps-script', name), 'utf8')).join('\n\n'));
  fs.copyFileSync(path.join(root, 'apps-script/appsscript.json'), path.join(out, backendDirectory, 'appsscript.json'));
  console.log('Site statique : dist/web ; API ' + profile.environment + (profile.apiUrl ? ' configurée.' : ' absente.') + ' Backend TEST de référence : dist/' + backendDirectory + '/Code.gs.');
  if (profile.environment === 'COPY') console.log('Le candidat Google COPY se construit séparément hors dépôt : node experiments/build-copy-backend.cjs. Ne pas installer la référence TEST dans la copie.');
  return { output: out, web: path.join(out, 'web'), environment: profile.environment };
}
if (require.main === module) build();
module.exports = { build };
