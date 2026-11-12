'use strict';
// Local preparation only; the pilot backs up Google and installs the candidate.
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { assets } = require('./build-admin-sheet-actions.cjs');
const { COPY } = require('../scripts/local-profile.cjs');
const repository = path.resolve(__dirname, '../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function build(options = {}) {
  const output = path.resolve(options.output || path.join(os.homedir(), '.config/tema-academie/copy-backend-20261104'));
  if (output === repository || output.startsWith(repository + path.sep)) throw new Error('COPY artifacts and backups must stay outside the repository.');
  await fs.mkdir(output, { recursive: true, mode: 0o700 }); await fs.chmod(output, 0o700);
  const { html, buttons } = await assets();
  const files = [path.join(repository, 'app/apps-script/engine.js'), ...['copy-config.gs', 'copy-backend.gs', 'admin-sheet-prototype.gs', 'admin-sheet-actions.gs', 'admin-sheet-registrations.gs', 'admin-registration-actions.gs'].map(name => path.join(__dirname, name))];
  const sources = await Promise.all(files.map(file => fs.readFile(file, 'utf8')));
  const logo = await fs.readFile(path.join(repository, 'app/web/assets/logo-tema.png'));
  const code = sources.join('\n\n').replace('/** @OnlyCurrentDoc */', '') + '\nvar TEMA_ADMIN_DIALOG = ' + JSON.stringify(html) + ';\nvar TEMA_ADMIN_BUTTONS = ' + JSON.stringify(buttons) + ';\nvar TEMA_MAIL_LOGO_PNG = ' + JSON.stringify(logo.toString('base64')) + ';\n';
  const manifest = await fs.readFile(path.join(__dirname, 'copy-backend.manifest.json'), 'utf8');
  if (options.backupCode || options.backupManifest) {
    if (!options.backupCode || !options.backupManifest) throw new Error('Provide both --backup-code and --backup-manifest for a complete recovery snapshot.');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-'), backup = path.join(output, 'backups', stamp);
    const previous = await Promise.all([options.backupCode, options.backupManifest].map(file => fs.readFile(file)));
    JSON.parse(previous[1].toString('utf8'));
    await fs.mkdir(backup, { recursive: true, mode: 0o700 });
    await fs.writeFile(path.join(backup, 'Code.gs'), previous[0], { mode: 0o600 });
    await fs.writeFile(path.join(backup, 'appsscript.json'), previous[1], { mode: 0o600 });
    await fs.writeFile(path.join(backup, 'integrity.json'), JSON.stringify({ codeSha256: hash(previous[0]), manifestSha256: hash(previous[1]) }, null, 2), { mode: 0o600 });
  }
  await fs.writeFile(path.join(output, 'Code.gs'), code, { mode: 0o600 });
  await fs.writeFile(path.join(output, 'appsscript.json'), manifest, { mode: 0o600 });
  const instructions = `COPY candidate only. No Google operation was executed by this builder.\nTarget spreadsheet: ${COPY.spreadsheet}\nTarget script: ${COPY.script}\n\nBefore installation the pilot exports the CURRENT Google HEAD code and manifest, then reruns:\nnode app/experiments/build-copy-backend.cjs --backup-code /private/current-Code.gs --backup-manifest /private/current-appsscript.json\nVerify both snapshot hashes before replacing Google HEAD. Keep the prior deployment version.\n\nPrivate script properties: ENVIRONMENT=COPY; SPREADSHEET_ID=target above; COPY_OWNER_EMAIL=authorized owner; ALLOWED_RECIPIENTS_JSON=private authorized recipients.\nMail starts CLOSED: COPY_MAIL_LIMITS_JSON absent or {\"registrations\":0,\"recipients\":0}. Never reset COPY_MAIL_BUDGET_JSON, COPY_RATE_BUDGET_JSON or source/view versions. A separate authorization is required to set nonzero mail limits.\nPublish/install/trigger operations require their own pilot authorization. After installation, installerActualisationCopieTema() prepares exactly one owner minute trigger; this builder never invokes it.\n\nLocal activation after the pilot verifies the COPY /exec deployment:\ncd app\nnode scripts/local-profile.cjs copy <VERIFIED_COPY_EXEC_URL>\nnpm run build\nThe explicit URL is persisted privately. No rebuild can silently restore TEST.\n\nRecovery: restore BOTH code and manifest from the verified snapshot in this script, select the prior deployment version, and disable only the reconcilierCopieTema trigger if necessary. Preserve data and all private properties/counters.\nRestore the known local TEST profile explicitly:\nnode scripts/local-profile.cjs test\nnpm run build\nDo not modify old TEST or PROD and do not run their historical repair.\n`;
  await fs.writeFile(path.join(output, 'RECOVERY.txt'), instructions, { mode: 0o600 });
  const result = { output, codeSha256: hash(code), canonicalSha256: hash(code.trimEnd()), manifestSha256: hash(manifest), bytes: Buffer.byteLength(code), googleChanged: false };
  await fs.writeFile(path.join(output, 'candidate.json'), JSON.stringify(result, null, 2) + '\n', { mode: 0o600 });
  return result;
}
if (require.main === module) {
  const args = process.argv.slice(2), options = {}, names = { '--output': 'output', '--backup-code': 'backupCode', '--backup-manifest': 'backupManifest' };
  for (let i = 0; i < args.length; i += 2) { if (!names[args[i]] || !args[i + 1]) throw new Error('Use --output, --backup-code and --backup-manifest with explicit paths.'); options[names[args[i]]] = args[i + 1]; }
  build(options).then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { build };
