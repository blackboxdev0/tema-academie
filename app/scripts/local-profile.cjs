'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const PROJECT = require('../../config/project.json');
const COPY = Object.freeze({ spreadsheet: '10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8', script: '1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA' });
const URL_PATTERN = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
const profilePath = () => process.env.TEMA_LOCAL_PROFILE_PATH || path.join(os.homedir(), '.config', 'tema-academie', 'local-profile.json');
function validate(profile) {
  if (!profile || profile.version !== 1 || !['TEST', 'COPY'].includes(profile.environment) || !URL_PATTERN.test(profile.apiUrl || '')) throw new Error('Invalid local profile: explicit environment and Google /exec URL required.');
  if (profile.environment === 'COPY' && (profile.spreadsheetId !== COPY.spreadsheet || profile.scriptId !== COPY.script || profile.apiUrl === PROJECT.google.resources.environments.TEST.web_app_url)) throw new Error('COPY profile requires the exact copy IDs and a distinct deployment URL.');
  if (profile.environment === 'TEST' && profile.apiUrl !== PROJECT.google.resources.environments.TEST.web_app_url) throw new Error('TEST profile must target the known TEST deployment.');
  return profile;
}
function read() {
  if (!fs.existsSync(profilePath())) return null;
  return validate(JSON.parse(fs.readFileSync(profilePath(), 'utf8')));
}
function resolve() {
  const saved = read();
  // An active COPY profile cannot be accidentally replaced by an old TEST
  // shell variable. Switching requires the explicit profile command below.
  if (saved) {
    if (process.env.TEMA_TEST_API_URL !== undefined && process.env.TEMA_TEST_API_URL !== saved.apiUrl) throw new Error('The API override conflicts with the saved local profile. Switch profiles explicitly.');
    if (process.env.TEMA_COPY_API_URL !== undefined && (saved.environment !== 'COPY' || process.env.TEMA_COPY_API_URL !== saved.apiUrl)) throw new Error('COPY URL conflicts with the saved profile. Set it with the profile command.');
    return saved;
  }
  if (process.env.TEMA_COPY_API_URL !== undefined) throw new Error('Persist the explicit COPY URL with local-profile.cjs copy <URL> before building.');
  const apiUrl = process.env.TEMA_TEST_API_URL === undefined ? PROJECT.google.resources.environments.TEST.web_app_url : process.env.TEMA_TEST_API_URL;
  if (apiUrl && !URL_PATTERN.test(apiUrl)) throw new Error('TEMA_TEST_API_URL must be a Google /exec URL.');
  return { version: 1, environment: 'TEST', apiUrl: apiUrl || '' };
}
function save(environment, apiUrl) {
  const profile = validate(Object.assign({ version: 1, environment, apiUrl }, environment === 'COPY' ? { spreadsheetId: COPY.spreadsheet, scriptId: COPY.script } : {}));
  fs.mkdirSync(path.dirname(profilePath()), { recursive: true, mode: 0o700 });
  fs.writeFileSync(profilePath(), JSON.stringify(profile, null, 2) + '\n', { mode: 0o600 });
  fs.chmodSync(profilePath(), 0o600);
  return profile;
}
function verifyCopyDeployment(selected, evidence, candidate) {
  validate(selected);
  if (selected.environment !== 'COPY' || !evidence || evidence.version !== 1 || evidence.method !== 'native-google-deployment-ui' || evidence.apiUrl !== selected.apiUrl || evidence.scriptId !== COPY.script || evidence.spreadsheetId !== COPY.spreadsheet || !Number.isSafeInteger(evidence.deploymentVersion) || evidence.deploymentVersion < 1 || !Number.isFinite(Date.parse(evidence.verifiedAt)) || Date.parse(evidence.verifiedAt) > Date.now() || !/^[a-f0-9]{64}$/.test(evidence.canonicalSha256 || '') || !candidate || evidence.canonicalSha256 !== candidate.canonicalSha256) throw new Error('COPY deployment is not independently verified against Google and this candidate. No POST authorized.');
  return evidence;
}
function requireVerifiedCopy(selected) {
  const dir = path.dirname(profilePath());
  // Ce relevé est créé par le pilote depuis l’écran Google du déploiement,
  // séparément de la commande de choix du profil et jamais automatiquement.
  const evidence = JSON.parse(fs.readFileSync(path.join(dir, 'copy-deployment-verified.json'), 'utf8'));
  const candidate = JSON.parse(fs.readFileSync(path.join(dir, 'copy-backend-20261104', 'candidate.json'), 'utf8'));
  return verifyCopyDeployment(selected, evidence, candidate);
}
if (require.main === module) {
  try {
    const [action, url] = process.argv.slice(2);
    if (action === 'copy') save('COPY', url);
    else if (action === 'test') save('TEST', PROJECT.google.resources.environments.TEST.web_app_url);
    else if (action !== 'show') throw new Error('Usage: node scripts/local-profile.cjs copy <COPY_EXEC_URL> | test | show');
    const selected = resolve();
    console.log(JSON.stringify({ environment: selected.environment, apiUrl: selected.apiUrl, profile: profilePath() }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { COPY, URL_PATTERN, profilePath, validate, read, resolve, save, verifyCopyDeployment, requireVerifiedCopy };
