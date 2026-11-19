'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { build } = require('./build.cjs');
const { validateTarget } = require('./production-target.cjs');
const target = require('../../config/project.json').verification.production_preparation;

assert.equal(process.env.VERCEL_ENV, 'preview', 'Tema candidate build requires Vercel Preview.');
let selected;
try {
  selected = JSON.parse(process.env.TEMA_PREVIEW_PROFILE_JSON);
} catch {
  throw new Error('Set a valid TEMA_PREVIEW_PROFILE_JSON for the preview branch.');
}
const profile = validateTarget(selected);
assert.ok(profile.apiUrl, 'Preview requires the verified Google endpoint.');
assert.ok(profile.spreadsheetId === target.spreadsheet_id && profile.scriptId === target.script_id,
  'Preview profile targets a different Google project.');

const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-vercel-preview-'));
try {
  const { web } = build({ profile, output: path.join(staging, 'site') });
  execFileSync(process.execPath, [path.join(__dirname, 'security.cjs')], {
    env: { ...process.env, TEMA_SECURITY_WEB_PATH: web },
    stdio: 'inherit',
  });
  const output = path.resolve(__dirname, '../dist/web');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.mkdirSync(output);
  fs.cpSync(web, output, { recursive: true });
} finally {
  fs.rmSync(staging, { recursive: true, force: true });
}
