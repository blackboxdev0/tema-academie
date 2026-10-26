// Explicit read-only integration check. Never POSTs, resets data or sends mail.
const assert = require('node:assert/strict');
const api = process.env.TEMA_TEST_API_URL;
if (!api || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(api)) throw new Error('Set TEMA_TEST_API_URL to the authorized TEST /exec deployment.');
(async () => {
  const response = await fetch(api, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
  assert.equal(response.ok, true); const data = await response.json();
  assert.equal(data.schema_version, 1); assert.equal(data.timezone, 'America/Toronto');
  assert.deepEqual(Object.keys(data).sort(), ['schema_version', 'generated_at', 'timezone', 'contact', 'policy', 'softwares', 'formations', 'sessions'].sort());
  assert.ok(Array.isArray(data.formations)); assert.ok(Array.isArray(data.sessions));
  const formationKeys = ['id', 'logiciel', 'titre', 'description', 'prerequis', 'contenu', 'resultat', 'duree', 'prix', 'prix_qualificatif'].sort();
  const sessionKeys = ['id_cohorte', 'formation', 'start_at', 'end_at', 'mode', 'adresse_presentiel', 'places_max', 'places_restantes', 'status', 'session_revision'].sort();
  data.formations.forEach(f => assert.deepEqual(Object.keys(f).sort(), formationKeys));
  data.sessions.forEach(s => { assert.deepEqual(Object.keys(s).sort(), sessionKeys); if (s.mode === 'en_ligne') assert.equal(s.adresse_presentiel, null); });
  console.log(JSON.stringify({ outcome: 'PASS', proof: 'real HTTP read only, server runtime', schema_version: 1, formations: data.formations.length, sessions: data.sessions.length, browser_transport: 'NOT VERIFIED', mail_and_calendar: 'NOT VERIFIED' }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
