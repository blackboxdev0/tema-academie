// Expérience TEST temporaire. Le cache contient uniquement la projection publique.
// Route par défaut conservée. Retirer ce dispatcher après la campagne.
function availabilityBenchmarkGet_(e) {
  var start = Date.now(), mode = e && e.parameter && e.parameter.resource;
  if (mode !== 'availability-live' && mode !== 'availability-cached') return trialJson_(TemaTrial.createService(trialDependencies_()).catalogue());
  try {
    trialGuard_();
    var cache = mode === 'availability-cached' ? CacheService.getScriptCache() : null;
    var key = 'availability-benchmark-20261102-v1', raw = cache && cache.get(key), status = cache ? raw ? 'HIT' : 'MISS' : 'BYPASS';
    var result;
    if (raw) result = JSON.parse(raw);
    else {
      var catalogue = TemaTrial.createService(trialDependencies_()).catalogue();
      if (catalogue.code || !Array.isArray(catalogue.sessions)) throw new Error('UNAVAILABLE');
      result = { schema_version: 1, timezone: catalogue.timezone, generated_at: catalogue.generated_at, sessions: catalogue.sessions };
      if (cache) cache.put(key, JSON.stringify(result), 60);
    }
    result = JSON.parse(JSON.stringify(result));
    result.sessions = result.sessions.filter(function (s) { return Date.parse(s.start_at) > Date.now(); });
    result.benchmark = { cache: status, server_ms: Date.now() - start, ttl_seconds: 60 };
    return trialJson_(result);
  } catch (_) { return trialJson_({ schema_version: 1, code: 'UNAVAILABLE' }); }
}
