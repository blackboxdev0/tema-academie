'use strict';
const fs = require('node:fs');
const suffix = '.post.private.txt';
function requireNewAttempt(recipeFile) {
  if (fs.existsSync(recipeFile + suffix)) throw new Error('SAVED_COPY_REQUEST_REQUIRES_EXACT_REPLAY');
}
function captureAttempt(page, recipeFile, apiUrl) {
  let body = '';
  page.on('request', request => {
    if (request.method() !== 'POST' || request.url() !== apiUrl) return;
    const next = request.postData();
    if (typeof next !== 'string' || !next) throw new Error('MISSING_COPY_REQUEST_BODY');
    const file = recipeFile + suffix;
    if (fs.existsSync(file)) {
      if (fs.readFileSync(file, 'utf8') !== next) throw new Error('SAVED_COPY_REQUEST_MUST_NOT_BE_REPLACED');
    } else fs.writeFileSync(file, next, { mode: 0o600, flag: 'wx' });
    body = next;
  });
  return () => body;
}
module.exports = { requireNewAttempt, captureAttempt };
