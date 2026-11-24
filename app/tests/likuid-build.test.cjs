const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spreadsheet_id: spreadsheetId, script_id: scriptId } =
  require('../../config/project.json').verification.production_preparation;

test('Likuid build CLI requires the attested endpoint before creating a web artifact', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-likuid-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const script = path.join(__dirname, '../scripts/build-likuid.cjs');
  const apiUrl = 'https://script.google.com/macros/s/SyntheticLikuidOfflineEndpoint/exec';
  const profile = { environment: 'PRODUCTION', spreadsheetId, scriptId };
  const deploymentEvidence = {
    ...profile, apiUrl, method: 'native-google-deployment-ui', deploymentVersion: 1,
    verifiedAt: '2026-01-01T00:00:00.000Z',
  };
  const run = (selected, name) => spawnSync(process.execPath, [script, path.join(directory, name)], {
    env: { ...process.env, TEMA_PRODUCTION_PROFILE_JSON: JSON.stringify(selected) }, encoding: 'utf8',
  });

  const missing = run(profile, 'missing');
  assert.equal(missing.status, 1);
  assert.ok(missing.stderr.includes('Likuid requires the verified Google deployment URL.'));
  assert.equal(fs.existsSync(path.join(directory, 'missing')), false);

  const built = run({ ...profile, apiUrl, deploymentEvidence }, 'attested');
  assert.equal(built.status, 0);
  const config = fs.readFileSync(path.join(directory, 'attested/web/config.js'), 'utf8');
  assert.ok(config.includes(apiUrl) && config.includes('"environment":"PRODUCTION"'));
  assert.ok(built.stdout.includes('PASS: public build/config boundaries'));
});
