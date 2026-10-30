const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'dist', 'web');
const port = Number(process.env.PORT || 4173);
const allowed = new Set(['index.html', 'app.js', 'styles.css', 'config.js']);
const assetTypes = { '.png': 'image/png', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let name; try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//, '') || 'index.html'; } catch (_) { res.writeHead(400); res.end(); return; }
  const asset = /^assets\/[A-Za-z0-9_./-]+$/.test(name) && !name.split('/').includes('..') && assetTypes[path.extname(name)];
  if (req.method !== 'GET' || !(allowed.has(name) || asset)) { res.writeHead(404); res.end('Not found'); return; }
  const file = path.join(root, name);
  try { const contents = fs.readFileSync(file); res.writeHead(200, { 'Content-Type': asset || (name.endsWith('.js') ? 'text/javascript; charset=utf-8' : name.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8'), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' }); res.end(contents); }
  catch (_) { res.writeHead(404); res.end('Build the static site first.'); }
}).listen(port, '127.0.0.1', () => console.log(`Static TEST preview: http://127.0.0.1:${port}`));
