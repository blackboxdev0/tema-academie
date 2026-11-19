'use strict';
const project = require('../../config/project.json');
const COPY = { spreadsheet: '10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8', script: '1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA', apiUrl: 'https://script.google.com/macros/s/AKfycbyFf4kWeDANC1GMpOjx4d2h0aiwrnpT4qK1cDrj_ftzY7qzbSxFnqQZmSTgis7KcJBj/exec' };
const ID = /^[A-Za-z0-9_-]{20,200}$/;
const EXEC = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
const POLICY_VERSION = 'TEMA-2026-11-18-1';
function validateTarget(target) {
  const known = ['TEST', 'COPY', 'PROD'].map(name => project.google.resources.environments[name]).filter(Boolean);
  const forbidden = new Set([COPY.spreadsheet, COPY.script, ...known.flatMap(e => [e.spreadsheet_id, e.script_id])]);
  if (!target || target.environment !== 'PRODUCTION' || !ID.test(target.spreadsheetId || '') || !ID.test(target.scriptId || '') || target.spreadsheetId === target.scriptId || forbidden.has(target.spreadsheetId) || forbidden.has(target.scriptId)) throw new Error('PRODUCTION requires explicit, distinct new spreadsheet and script IDs; existing COPY/TEST/PROD resources are refused.');
  if (target.apiUrl !== undefined && target.apiUrl !== '' && (!EXEC.test(target.apiUrl) || target.apiUrl === COPY.apiUrl || known.some(e => e.web_app_url === target.apiUrl))) throw new Error('Invalid PRODUCTION deployment URL. Leave it empty until independently verified.');
  if (target.apiUrl) {
    const evidence = target.deploymentEvidence;
    if (!evidence || evidence.method !== 'native-google-deployment-ui' || evidence.environment !== 'PRODUCTION' || evidence.apiUrl !== target.apiUrl || evidence.spreadsheetId !== target.spreadsheetId || evidence.scriptId !== target.scriptId || !Number.isSafeInteger(evidence.deploymentVersion) || evidence.deploymentVersion < 1 || !Number.isFinite(Date.parse(evidence.verifiedAt)) || Date.parse(evidence.verifiedAt) > Date.now()) throw new Error('A PRODUCTION URL requires independent native deployment evidence for these exact new IDs.');
  }
  if (target.apiUrl && target.forbiddenApiUrls && target.forbiddenApiUrls.includes(target.apiUrl)) throw new Error('PRODUCTION cannot use a COPY deployment URL.');
  return Object.assign({ version: 1, environment: 'PRODUCTION', spreadsheetId: target.spreadsheetId, scriptId: target.scriptId, apiUrl: target.apiUrl || '' }, target.apiUrl ? { deploymentEvidence: target.deploymentEvidence } : {});
}
module.exports = { validateTarget, POLICY_VERSION, COPY };
