'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { build } = require('./build.cjs');
const { validateTarget } = require('./production-target.cjs');
const target = require('../../config/project.json').verification.production_preparation;

const output = process.argv[2];
assert.ok(output, 'Provide a private output directory outside the repository.');

let selected;
try {
  selected = JSON.parse(process.env.TEMA_PRODUCTION_PROFILE_JSON);
} catch {
  throw new Error('Set a valid TEMA_PRODUCTION_PROFILE_JSON for Likuid.');
}
delete process.env.TEMA_PRODUCTION_PROFILE_JSON;

const profile = validateTarget(selected);
assert.ok(profile.apiUrl, 'Likuid requires the verified Google deployment URL.');
assert.ok(profile.spreadsheetId === target.spreadsheet_id && profile.scriptId === target.script_id,
  'Likuid requires the attested production spreadsheet and script.');
const { web } = build({ profile, output });
execFileSync(process.execPath, [path.join(__dirname, 'security.cjs')], {
  env: { ...process.env, TEMA_SECURITY_WEB_PATH: web },
  stdio: 'inherit',
});
