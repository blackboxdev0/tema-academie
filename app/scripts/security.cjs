// Deterministic source/build boundary checks. Does not contact external services.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
function files(directory) { return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]); }
const publicFiles = files(path.join(root, 'dist/web'));
for (const file of publicFiles) {
  assert.ok(!/\.(?:json|xlsx|map|bak)$/.test(file), 'Non-public data file in build');
  if (!/\.(?:html|js|css|txt)$/.test(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|AIza[A-Za-z0-9_-]{30,}|"private_key"\s*:/.test(source), 'Credential material in public bundle');
  assert.ok(!/\b(?:localStorage|sessionStorage|indexedDB)\b/.test(source), 'Durable browser storage violates personal-data boundary');
  assert.ok(!/TEMA_PRIVATE_CATALOGUE_IMPORT|CATALOGUE_IMPORT_\d|TRIAL_SIMULATE_MAIL_FAILURE|SPREADSHEET_ID/.test(source), 'Private server configuration in browser');
}
const config = {}; vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/web/config.js'), 'utf8'), { window: config });
assert.deepEqual(Object.keys(config.TEMA_CONFIG), ['apiUrl']);
for (const name of ['engine.js', 'google.js']) new vm.Script(fs.readFileSync(path.join(root, 'apps-script', name), 'utf8'), { filename: name });
console.log('PASS: public build/config boundaries and Apps Script syntax (offline).');
