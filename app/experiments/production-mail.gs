/* Durable, bounded rolling budget. Caller must own the admission ScriptLock. */
var TemaProductionMail = (function () {
  'use strict';
  var WINDOW = 86400000, MAX = 100, LEGACY_MAX = 80, RESERVE = 5, EXECUTION_LIFETIME = 10 * 60000;
  function deferred(code) { return ['MAIL_LIMIT', 'MAIL_QUOTA', 'MAIL_PAUSED'].indexOf(code) >= 0; }
  function workerIdle() {
    // A fresh control snapshot per invocation: no business data or persistent
    // cache. Invalid state falls through to the existing guarded worker.
    var p = PropertiesService.getScriptProperties().getProperties(), target = TemaCopy.target, now = Date.now();
    if (p.ENVIRONMENT !== 'PRODUCTION' || p.SPREADSHEET_ID !== target.spreadsheet || ScriptApp.getScriptId() !== target.script) return false;
    if (p.PRODUCTION_WORKER_PAUSED === '1') return true;
    try {
      var source = p.PRODUCTION_SOURCE_VERSION || 'initial', config = JSON.parse(p.PRODUCTION_ASYNC_MAIL_JSON), idle = JSON.parse(p.PRODUCTION_MAIL_EMPTY_QUEUE_JSON);
      var cursor = p.PRODUCTION_ASYNC_MAIL_CURSOR === undefined ? 0 : Number(p.PRODUCTION_ASYNC_MAIL_CURSOR);
      if (!config || config.version !== 1 || Object.keys(config).sort().join(',') !== 'activated_at_ms,recovery_ids,version' || !Number.isSafeInteger(config.activated_at_ms) || config.activated_at_ms <= 0 || config.activated_at_ms > now || !Array.isArray(config.recovery_ids) || config.recovery_ids.length > 1 || config.recovery_ids.some(function (id) { return typeof id !== 'string' || !/^I-[A-Za-z0-9-]{1,100}$/.test(id); }) || !Number.isSafeInteger(cursor) || cursor < 0 || p.PRODUCTION_ASYNC_MAIL_CURSOR !== undefined && !/^(0|[1-9][0-9]*)$/.test(p.PRODUCTION_ASYNC_MAIL_CURSOR)) return false;
      function future(value) { var at = Number(value); return Number.isSafeInteger(at) && at > now && at <= now + 300000; }
      if (typeof source !== 'string' || p.PRODUCTION_VIEW_VERSION !== source || p.PRODUCTION_ADMIN_MAINTENANCE_PENDING !== '0' || p.PRODUCTION_NATIVE_COUNTERS_PENDING !== '0' || p.PRODUCTION_NOTICE_PENDING !== '0' || p.PRODUCTION_HEADERS_DIAGNOSTIC || !future(p.PRODUCTION_HEADERS_AUDIT_AT) || !future(p.PRODUCTION_AUDIT_AT) || !Number.isSafeInteger(Number(p.PRODUCTION_VIEW_NEXT_CHANGE_AT)) || Number(p.PRODUCTION_VIEW_NEXT_CHANGE_AT) <= now) return false;
      return !!idle && idle.version === 1 && Object.keys(idle).sort().join(',') === 'activation_key,next_audit_ms,source_version,version' && idle.source_version === source && future(idle.next_audit_ms) && idle.activation_key === TemaCopy.dependencies().hash(JSON.stringify([config.activated_at_ms, config.recovery_ids]));
    } catch (_) { return false; }
  }
  function reserve(id, channel, to, registrations) {
    TemaCopy.guard();
    try {
      if (typeof id !== 'string' || !/^I-[A-Za-z0-9-]{1,100}$/.test(id) || ['participant', 'tema'].indexOf(channel) < 0 || typeof to !== 'string' || !/^[^\s@<>;,\r\n]+@[^\s@<>;,\r\n]+\.[^\s@<>;,\r\n]+$/.test(to)) return 'ALLOWLIST';
      var properties = PropertiesService.getScriptProperties(), raw = properties.getProperty('PRODUCTION_MAIL_LIMITS_JSON');
      if (raw === null) return 'MAIL_PAUSED';
      var limits = JSON.parse(raw);
      if (!limits || limits.version !== 1 || Object.keys(limits).sort().join(',') !== 'quota_reserve,recipients,version,window_ms' || !Number.isSafeInteger(limits.recipients) || limits.recipients < 0 || limits.recipients > MAX || limits.window_ms !== WINDOW) return 'BUDGET_CONFIG';
      if (limits.quota_reserve !== (limits.recipients === MAX ? 0 : RESERVE)) return 'BUDGET_CONFIG';
      if (limits.recipients === 0) return 'MAIL_PAUSED';
      var now = Date.now(), saved = properties.getProperty('PRODUCTION_MAIL_BUDGET_JSON');
      var state = saved === null ? { version: 1, last_at_ms: now, attempts: [] } : JSON.parse(saved);
      if (!state || [1, 2].indexOf(state.version) < 0 || Object.keys(state).sort().join(',') !== 'attempts,last_at_ms,version' || !Number.isSafeInteger(state.last_at_ms) || state.last_at_ms > now || state.last_at_ms < 1 || !Array.isArray(state.attempts) || state.attempts.length > (state.version === 1 ? LEGACY_MAX : MAX)) return 'BUDGET_CONFIG';
      if (state.version === 2) {
        state.attempts = state.attempts.map(function (a) {
          return Array.isArray(a) && a.length === 2 ? { at: a[0], key: a[1] } : null;
        });
      }
      var keys = Object.create(null);
      if (state.attempts.some(function (a) { if (!a || Object.keys(a).sort().join(',') !== 'at,key' || typeof a.key !== 'string' || !/^[a-f0-9]{64}$/.test(a.key) || keys[a.key] || !Number.isSafeInteger(a.at) || a.at < 1 || a.at > state.last_at_ms) return true; keys[a.key] = true; return false; })) return 'BUDGET_CONFIG';
      var key = TemaCopy.dependencies().hash(id + ':' + channel);
      // A reservation without its row claim is ambiguous and must not be retried.
      if (keys[key]) return 'ATTEMPT_RESERVED';
      state.attempts = state.attempts.filter(function (a) { return now - a.at < WINDOW; });
      if (state.attempts.length >= limits.recipients) return 'MAIL_LIMIT';
      var quota = MailApp.getRemainingDailyQuota();
      if (!Number.isSafeInteger(quota) || quota < 0) return 'BUDGET_CONFIG';
      if (!Array.isArray(registrations)) return 'BUDGET_CONFIG';
      // Another worker may have reserved an email but still be outside the
      // lock sending it. Keep its commitment in addition to Google's quota.
      var inflight = registrations.reduce(function (count, row) {
        return count + ['participant', 'tema'].filter(function (channel) {
          var at = Date.parse(row['mail_' + channel + '_attempt_at']);
          // Ten minutes exceeds Apps Script's six-minute execution lifetime.
          // Old ambiguous rows retain their state/attempt; they cannot still
          // consume an external send from that terminated execution.
          return row['mail_' + channel + '_etat'] === 'SENDING' && Number.isFinite(at) && at <= now && now - at < EXECUTION_LIFETIME;
        }).length;
      }, 0);
      if (quota - inflight <= limits.quota_reserve) return 'MAIL_QUOTA';
      state.attempts.push({ key: key, at: now }); state.last_at_ms = now;
      // Above 80 attempts, omit the repeated field names to fit the 9 KB property limit.
      state.version = state.attempts.length > LEGACY_MAX ? 2 : 1;
      if (state.version === 2) state.attempts = state.attempts.map(function (a) { return [a.at, a.key]; });
      properties.setProperty('PRODUCTION_MAIL_BUDGET_JSON', JSON.stringify(state));
      return null;
    } catch (_) { return 'BUDGET_CONFIG'; }
  }
  return { reserve: reserve, deferred: deferred, workerIdle: workerIdle };
})();
