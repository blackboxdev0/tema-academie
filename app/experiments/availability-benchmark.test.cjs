const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('projection publique identique en BYPASS/MISS/HIT, cache et route témoin isolés', () => {
  let reads = 0, stored = null, ttl;
  const catalogue = { schema_version: 1, timezone: 'America/Toronto', generated_at: new Date().toISOString(), sessions: [{ id_cohorte: 'test', places_restantes: 3, start_at: new Date(Date.now() + 3600000).toISOString() }], formations: [{ contenu: 'programme long' }], contact: { courriel: 'public@example.invalid' } };
  const context = { Date, trialGuard_() {}, trialDependencies_() {}, trialJson_: value => value,
    TemaTrial: { createService: () => ({ catalogue: () => { reads++; return structuredClone(catalogue); } }) },
    CacheService: { getScriptCache: () => ({ get: () => stored, put: (key, value, seconds) => { stored = value; ttl = seconds; } }) }
  };
  vm.runInNewContext(fs.readFileSync(__dirname + '/availability-benchmark.gs', 'utf8'), context);
  const call = mode => context.availabilityBenchmarkGet_({ parameter: { resource: mode } });
  const bypass = call('availability-live'), miss = call('availability-cached'), hit = call('availability-cached');
  assert.equal(reads, 2); assert.equal(ttl, 60);
  assert.deepEqual([bypass.benchmark.cache, miss.benchmark.cache, hit.benchmark.cache], ['BYPASS', 'MISS', 'HIT']);
  assert.equal(JSON.stringify(hit.sessions), JSON.stringify(catalogue.sessions));
  assert.ok(!JSON.stringify(hit).includes('programme long')); assert.equal(hit.contact, undefined);
  assert.equal(call('unknown').formations[0].contenu, 'programme long');
});
