'use strict';
// Private artifacts only. No Google API, permission, mail or deployment action.
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { assets } = require('./build-admin-sheet-actions.cjs');
const { validateTarget, COPY, POLICY_VERSION } = require('../scripts/production-target.cjs');
const { assertPrivateOutput } = require('../scripts/private-output.cjs');
const repository = path.resolve(__dirname, '../..');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function adapt(source, target) {
  return source.replaceAll(COPY.spreadsheet, target.spreadsheetId).replaceAll(COPY.script, target.scriptId)
    .replaceAll("'COPY'", "'PRODUCTION'").replaceAll('COPY_', 'PRODUCTION_').replaceAll('CopieTema', 'ProductionTema')
    .replaceAll('copie d’essai', 'préparation de production')
    .replaceAll('TEM-6 Trial', 'Formations').replaceAll('@tema-academie.test', '@tema-academie')
    .replaceAll('Prototype : actualisation interrompue', 'Tema : actualisation interrompue')
    .replaceAll('Actualisez le prototype de saisie avant d’utiliser cette commande.', 'Actualisez la fiche de saisie avant d’utiliser cette commande.')
    .replaceAll('Le bouton existant ne correspond pas au prototype. Aucune saisie modifiée.', 'Le bouton existant ne correspond pas à la fiche de saisie. Aucune saisie modifiée.');
}
async function build(options = {}) {
  if (!options.target) throw new Error('An explicit --target private JSON file is required.');
  const target = validateTarget(typeof options.target === 'string' ? JSON.parse(await fs.readFile(options.target, 'utf8')) : options.target);
  const output = path.resolve(options.output || path.join(os.homedir(), '.config/tema-academie/production-candidate-20261118/bundle'));
  assertPrivateOutput(output, repository);
  await fs.mkdir(output, { recursive: true, mode: 0o700 }); await fs.chmod(output, 0o700);
  const names = ['production-config.gs', 'production-mail.gs', 'production-headers.gs', 'copy-backend.gs', 'admin-sheet-prototype.gs', 'admin-sheet-actions.gs', 'admin-sheet-registrations.gs', 'admin-registration-actions.gs'];
  const sources = [await fs.readFile(path.join(repository, 'app/apps-script/engine.js'), 'utf8'), ...await Promise.all(names.map(name => fs.readFile(path.join(__dirname, name), 'utf8')))];
  const { html, buttons } = await assets(), logo = await fs.readFile(path.join(repository, 'app/web/assets/logo-tema.png'));
  const code = sources.map(source => adapt(source, target)).join('\n\n').replace('/** @OnlyCurrentDoc */', '') + '\nvar TEMA_ADMIN_DIALOG = ' + JSON.stringify(html) + ';\nvar TEMA_ADMIN_BUTTONS = ' + JSON.stringify(buttons) + ';\nvar TEMA_MAIL_LOGO_PNG = ' + JSON.stringify(logo.toString('base64')) + ';\n';
  const native = adapt(await fs.readFile(path.join(__dirname, 'admin-native-form.gs'), 'utf8'), target) + '\nvar TEMA_NATIVE_SAVE_BUTTON = ' + JSON.stringify((await require('./build-native-form.cjs').buttonPng()).toString('base64')) + ';\n';
  if (code.includes(COPY.spreadsheet) || code.includes(COPY.script) || /\bCOPY_[A-Z]/.test(code)) throw new Error('A COPY identity/property escaped production adaptation.');
  if (!code.includes(POLICY_VERSION)) throw new Error('Production policy version is missing.');
  const manifest = await fs.readFile(path.join(__dirname, 'copy-backend.manifest.json'), 'utf8');
  let backup = null;
  async function write(file, value) {
    assertPrivateOutput(output, repository);
    const handle = await fs.open(file, require('node:fs').constants.O_WRONLY | require('node:fs').constants.O_CREAT | require('node:fs').constants.O_TRUNC | require('node:fs').constants.O_NOFOLLOW, 0o600);
    try { await handle.writeFile(value); await handle.chmod(0o600); } finally { await handle.close(); }
  }
  if (options.backupCode || options.backupManifest || options.backupNative) {
    if (!options.backupCode || !options.backupManifest || !options.backupNative) throw new Error('Code, SaisieNative and manifest are all required for a recovery snapshot.');
    backup = path.join(output, 'backups', new Date().toISOString().replace(/[:.]/g, '-'));
    const previous = await Promise.all([options.backupCode, options.backupManifest, options.backupNative].map(file => fs.readFile(file)));
    JSON.parse(previous[1].toString());
    await fs.mkdir(backup, { recursive: true, mode: 0o700 });
    await write(path.join(backup, 'Code.gs'), previous[0]); await write(path.join(backup, 'appsscript.json'), previous[1]);
    await write(path.join(backup, 'SaisieNative.gs'), previous[2]);
    await write(path.join(backup, 'integrity.json'), JSON.stringify({ codeSha256: hash(previous[0]), manifestSha256: hash(previous[1]), nativeSha256: hash(previous[2]) }, null, 2));
  }
  await write(path.join(output, 'Code.gs'), code); await write(path.join(output, 'appsscript.json'), manifest);
  await write(path.join(output, 'SaisieNative.gs'), native);
  await write(path.join(output, 'production-profile.json'), JSON.stringify(target, null, 2) + '\n');
  const web = require('../scripts/build.cjs').build({ profile: target, output: path.join(output, 'site') });
  const webHashes = {};
  async function fingerprint(directory, prefix = '') { for (const entry of await fs.readdir(directory, { withFileTypes: true })) { const name = prefix + entry.name, file = path.join(directory, entry.name); if (entry.isDirectory()) await fingerprint(file, name + '/'); else webHashes[name] = hash(await fs.readFile(file)); } }
  await fingerprint(web.web);
  await write(path.join(output, 'RECOVERY.txt'), `Private PRODUCTION candidate only. No Google operation executed.\nSpreadsheet: ${target.spreadsheetId}\nScript: ${target.scriptId}\nNo public endpoint or site is created. The default API URL is empty.\n\nBefore installing, independently verify the candidate resource identities, all six private tabs (24 formations / 0 sessions / 0 inscriptions), no copied triggers, backups, owners and permissions. Keep COPY/TEST/old PROD untouched.\nBack up Code.gs, SaisieNative.gs and appsscript.json with --backup-code, --backup-native and --backup-manifest; verify all three hashes in integrity.json. Preserve the prior Google version. Restore ALL THREE files for rollback; disable only the explicitly installed reconcilierProductionTema minute trigger and traiterSaisieFormationTema edit trigger for this candidate. Preserve unrelated triggers. Preserve all admission rows, mail attempts and properties.\n\nPrivate properties: ENVIRONMENT=PRODUCTION; SPREADSHEET_ID=the spreadsheet above; PRODUCTION_OWNER_EMAIL=verified owner. Do not copy COPY_* budgets or activation.\nMail is paused by default. Explicit renewable limits are PRODUCTION_MAIL_LIMITS_JSON={"version":1,"recipients":0,"window_ms":86400000,"quota_reserve":5}. A separate bounded mail-test authorization is required before any nonzero value; maximum recipients=80 per rolling 24h, quota reserve=5. Never reset PRODUCTION_MAIL_BUDGET_JSON, row attempts, rate budgets or versions.\nPRODUCTION_ASYNC_MAIL_JSON={"version":1,"activated_at_ms":<verified activation epoch>,"recovery_ids":[]} is required for admissions and worker processing. Missing activation fails closed; no synchronous fallback. No trigger is installed by copying/building.\n\nOwner initialization after header validation: photographierEntetesProductionTema() captures exactly seven header rows, creates native row/column metadata and warning protections, and hides Places restantes. Never recapture a missing/deleted anchor automatically. diagnostiquerEntetesProductionTema() reports structural problems without guessed writes. Native Google Tables, metadata moves and private owner simulations remain mandatory separate checks.\ninstallerActualisationProductionTema() creates one owner minute trigger for reconcilierProductionTema. installerEditionSaisieProductionTema() creates one owner on-edit trigger for traiterSaisieFormationTema in this spreadsheet, required for source/header processing, private followup actions and the B65 reset checkbox. The simple production onEdit only marks a source edit dirty; the installed owner handler delegates authorized events to onEdit. Without it, source processing waits for the minute fallback. Both installers are idempotent and require their own authorization; neither runs from this builder. The minute trigger and mail polling keep their one-minute cadence. Only header auditing may wait until the five-minute deadline while versions, pending flags and temporal boundaries are clean; a missed edit is repaired on that deadline minute, subject to Google scheduling. Pending administration/counters, a source/view mismatch or a due temporal transition force checking before the mail poll. GET, POST and installed edits always check fresh. PRODUCTION_HEADERS_AUDIT_AT is a timestamp only, never a data cache. The worker may skip an invocation only from one fresh getProperties control snapshot with exact identity, clean flags/versions and unexpired header, source and empty-queue markers. Private preparation pause: PRODUCTION_WORKER_PAUSED=1 stops only the worker after identity validation. Remove this flag explicitly at the publication/resumption GO; never reset budgets or mail attempts. No trigger deletion or permission change is needed. Keep the native form sheet protection enforced, especially K2:K9.\n\nThe site uses policy ${POLICY_VERSION}, contact temaacademie@gmail.com and twelve-month retention. Client validation of this text and operational retention rules remains required before publication; no legal compliance is inferred.\nRebuild private web explicitly with TEMA_PRODUCTION_PROFILE_PATH=<this directory>/production-profile.json node app/scripts/build.cjs. Preview this exact private build with: cd app && npm run preview:production -- <this directory>. The normal saved TEST/COPY profile and npm run serve preview are preserved. Never add a URL without independently verifying the production deployment identity.\n`);
  const result = { environment: 'PRODUCTION', output, spreadsheetId: target.spreadsheetId, scriptId: target.scriptId, codeSha256: hash(code), canonicalSha256: hash(code.trimEnd()), nativeSha256: hash(native), nativeCanonicalSha256: hash(native.trimEnd()), manifestSha256: hash(manifest), bundleSha256: hash(JSON.stringify([hash(code), hash(native), hash(manifest)])), webHashes, policyVersion: POLICY_VERSION, backup, googleChanged: false, deploymentCreated: false, mailSent: 0 };
  await write(path.join(output, 'candidate.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}
if (require.main === module) {
  const args = process.argv.slice(2), options = {}, names = { '--target': 'target', '--output': 'output', '--backup-code': 'backupCode', '--backup-manifest': 'backupManifest', '--backup-native': 'backupNative' };
  for (let i = 0; i < args.length; i += 2) { if (!names[args[i]] || !args[i + 1]) throw new Error('Use --target, --output, --backup-code, --backup-native, --backup-manifest with explicit paths.'); options[names[args[i]]] = args[i + 1]; }
  build(options).then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { build, adapt };
