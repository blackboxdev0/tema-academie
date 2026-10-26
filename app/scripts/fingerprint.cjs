const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const files = ['package.json', 'package-lock.json', 'playwright.config.cjs'];
function visit(name) {
  for (const entry of fs.readdirSync(path.join(root, name), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = `${name}/${entry.name}`; if (entry.isDirectory()) visit(file); else files.push(file);
  }
}
for (const dir of ['apps-script', 'web', 'scripts', 'tests']) visit(dir);
const entries = files.sort().map(file => ({ file, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex') }));
const manifest = entries.map(entry => `${entry.sha256}  ${entry.file}`).join('\n') + '\n';
console.log(JSON.stringify({ algorithm: 'SHA-256', source_sha256: crypto.createHash('sha256').update(manifest).digest('hex'), files: entries }, null, 2));
