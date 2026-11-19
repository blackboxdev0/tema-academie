const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
function productionRoot(bundle) {
  const directory = path.resolve(bundle || path.join(os.homedir(), '.config/tema-academie/production-candidate-20261118/bundle'));
  const standalone = fs.existsSync(path.join(directory, '.tema-web-build')) && fs.readFileSync(path.join(directory, '.tema-web-build'), 'utf8').trim() === 'PRODUCTION';
  const candidate = standalone ? { environment: 'PRODUCTION' } : JSON.parse(fs.readFileSync(path.join(directory, 'candidate.json'), 'utf8'));
  const root = fs.realpathSync(path.join(directory, standalone ? 'web' : 'site/web'));
  const config = fs.readFileSync(path.join(root, 'config.js'), 'utf8').match(/^window\.TEMA_CONFIG = (.*);\s*$/);
  if (candidate.environment !== 'PRODUCTION' || !config || JSON.parse(config[1]).environment !== 'PRODUCTION') throw Error('Build the explicit private PRODUCTION candidate first.');
  return root;
}
function createServer(root = path.resolve(__dirname, '..', 'dist/web')) {
const allowed = new Set(['index.html', 'app.js', 'styles.css', 'config.js']);
const assetTypes = { '.png': 'image/png', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
return http.createServer((req, res) => {
  let name; try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//, '') || 'index.html'; } catch (_) { res.writeHead(400); res.end(); return; }
  const asset = /^assets\/[A-Za-z0-9_./-]+$/.test(name) && !name.split('/').includes('..') && assetTypes[path.extname(name)];
  if (req.method !== 'GET' || !(allowed.has(name) || asset)) { res.writeHead(404); res.end('Not found'); return; }
  const file = path.join(root, name);
  try {
    const realRoot = fs.realpathSync(root), realFile = fs.realpathSync(file);
    if (!realFile.startsWith(realRoot + path.sep) || !fs.statSync(realFile).isFile()) { res.writeHead(404); res.end('Not found'); return; }
    const contents = fs.readFileSync(realFile); res.writeHead(200, { 'Content-Type': asset || (name.endsWith('.js') ? 'text/javascript; charset=utf-8' : name.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8'), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' }); res.end(contents);
  }
  catch (_) { res.writeHead(404); res.end('Build the static site first.'); }
});
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length && (args[0] !== '--production' || args.length > 2)) throw Error('Usage: serve.cjs [--production [PRIVATE_BUNDLE_DIRECTORY]]');
  const root = args.length ? productionRoot(args[1]) : undefined;
  const server = createServer(root);
  server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Static ${args.length ? 'private PRODUCTION' : 'local'} preview: http://127.0.0.1:${server.address().port}`));
}
module.exports = { createServer, productionRoot };
