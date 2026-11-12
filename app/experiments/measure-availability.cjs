// Mesures API depuis un navigateur de test local. Aucune soumission d'inscription.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const api = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../config/project.json'), 'utf8')).google.resources.environments.TEST.web_app_url;
const destination = process.argv[2];
if (!destination || path.resolve(destination).startsWith(path.resolve(__dirname, '../..') + path.sep)) throw Error('Use a private output path outside the repository');
(async () => {
  const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><html lang="fr"><title>Mesure disponibilités TEST</title><main id="result">Mesure en cours</main></html>'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const measurements = []; let expectedSessions;
  try {
    // Rotation de l'ordre des variantes pour limiter l'effet du réchauffement.
    const oneSheet = process.argv.includes('--one-sheet');
    const variants = oneSheet ? ['catalogue', 'availability-live', 'availability-one-sheet'] : ['catalogue', 'availability-live', 'availability-cached'];
    for (let round = 0; round < 5; round++) {
      for (let offset = 0; offset < variants.length; offset++) {
        const variant = variants[(offset + round) % variants.length];
        const context = await browser.newContext(); const page = await context.newPage();
        await page.goto(origin);
        try {
          for (let visit = 0; visit < 3; visit++) {
            if (visit) await page.reload();
            const url = variant === 'catalogue' ? api : api + '?resource=' + variant;
            const result = await page.evaluate(async url => {
              const start = performance.now();
              const response = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(30000) });
              const text = await response.text(), data = JSON.parse(text);
              if (!response.ok || data.code || !Array.isArray(data.sessions)) throw Error('Invalid benchmark response');
              document.getElementById('result').textContent = data.sessions.map(s => s.start_at + ' / ' + s.places_restantes).join('\n');
              return { elapsed_ms: Math.round(performance.now() - start), bytes: new TextEncoder().encode(text).length, data };
            }, url);
            if (variant === 'availability-live') assert.equal(result.data.benchmark?.cache, 'BYPASS');
            if (variant === 'availability-one-sheet') {
              assert.equal(result.data.benchmark?.sheet_reads, 1);
              assert.equal(result.data.benchmark?.cache, 'BYPASS');
            }
            const sessions = oneSheet ? result.data.sessions.map(s => ({ id_cohorte: s.id_cohorte, formation: s.formation, start_at: s.start_at, end_at: s.end_at, mode: s.mode, places_restantes: s.places_restantes })) : result.data.sessions;
            if (!expectedSessions) expectedSessions = sessions;
            assert.deepEqual(sessions, expectedSessions, 'Availability differs between variants');
            const record = { round: round + 1, variant, visit: visit === 0 ? 'first' : 'subsequent', repeat: visit, elapsed_ms: result.elapsed_ms, bytes: result.bytes, cache: result.data.benchmark?.cache || 'NONE', server_ms: result.data.benchmark?.server_ms ?? null, sheet_reads: result.data.benchmark?.sheet_reads ?? null, sessions: result.data.sessions.length };
            measurements.push(record); fs.writeFileSync(destination, JSON.stringify(measurements, null, 2)); console.log(JSON.stringify(record));
          }
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
