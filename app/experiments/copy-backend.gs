/* COPY adapter only. Never bundle the historical TEST repair/install routines. */
var TemaCopy = (function () {
  'use strict';
  var TARGET = Object.freeze({ spreadsheet: '10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8', script: '1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA' });
  var SOFTWARES = { Divalto: 'DIV', Dimo: 'DIMO', MoovApps: 'MOOV' };
  var LABELS = {
    Formations: [['id', 'Identifiant'], ['logiciel', 'Logiciel'], [], ['description', 'Description'], ['prerequis', 'Prérequis'], ['contenu', 'Programme'], ['resultat', 'Résultats attendus'], ['duree', 'Durée'], ['prix', 'Tarif ($ CAD)'], ['prix_qualificatif', 'Qualificatif du tarif'], ['places_par_defaut', 'Capacité par défaut'], ['formateurs', 'Formateurs'], ['actif', 'Publiée']],
    'Disponibilités': [['id_cohorte', 'Identifiant'], [], ['date', 'Date'], ['heure_debut', 'Début'], ['heure_fin', 'Fin'], ['places_max', 'Capacité'], ['mode', 'Format'], ['lieu_ou_lien', 'Lieu ou lien'], ['inscriptions_ouvertes', 'Inscriptions ouvertes'], ['places_restantes', 'Places restantes'], ['etat_validation', 'Contrôle']]
  };
  function props() { return PropertiesService.getScriptProperties(); }
  function guard(book) {
    if (props().getProperty('ENVIRONMENT') !== 'COPY' || props().getProperty('SPREADSHEET_ID') !== TARGET.spreadsheet || ScriptApp.getScriptId() !== TARGET.script || book && book.getId() !== TARGET.spreadsheet) throw TemaTrial.fault('ENVIRONMENT');
  }
  function book() { guard(); return SpreadsheetApp.openById(TARGET.spreadsheet); }
  function lock(fn) {
    guard(); var l = LockService.getScriptLock();
    if (!l.tryLock(5000)) throw TemaTrial.fault('BUSY');
    try { return fn(); } finally { l.releaseLock(); }
  }
  function dirty(propertiesOnly) {
    guard(); var v = Utilities.getUuid(); props().setProperty('COPY_SOURCE_VERSION', v);
    if (!propertiesOnly) pendingNotice();
    return v;
  }
  function pendingNotice() {
    if (props().getProperty('COPY_NOTICE_PENDING') !== '1') {
      props().setProperty('COPY_NOTICE_PENDING', '1');
      var viewLock, noticeHeld = false;
      try {
        if (isOwner()) {
          viewLock = LockService.getUserLock();
          if (viewLock.tryLock(0)) {
            noticeHeld = true;
            var sheet = book().getSheetByName('Suivi des inscriptions');
            if (sheet && sheet.getRange('B2').getNote() === 'TEMA_REGISTRATION_VIEW_V1') sheet.getRange('B12').setValue('Mise à jour en attente : les groupes et compteurs affichés doivent être revérifiés. Actualisation automatique en cours.');
          }
        }
      } catch (_) { /* La source reste sale et le prochain rendu reprendra le diagnostic. */ }
      finally { if (noticeHeld) viewLock.releaseLock(); }
    }
  }
  function version() { return props().getProperty('COPY_SOURCE_VERSION') || 'initial'; }
  function text(v) { return String(v === null || v === undefined ? '' : v).trim(); }
  function dates(v) { return Object.prototype.toString.call(v) === '[object Date]'; }
  function temporal(value, key, format) {
    if (dates(value)) {
      if (!Number.isFinite(value.getTime())) throw TemaTrial.fault('CONFIG');
      return Utilities.formatDate(value, 'America/Toronto', key === 'date' ? 'yyyy-MM-dd' : 'HH:mm');
    }
    if (typeof value !== 'number') return value;
    // A bare number is never a date/time. Sheets API numberFormat metadata (or
    // the native range format) must explicitly attest its temporal type.
    var allowed = key === 'date' ? ['DATE', 'DATE_TIME'] : ['TIME', 'DATE_TIME'];
    if (!Number.isFinite(value) || allowed.indexOf(format) < 0) throw TemaTrial.fault('CONFIG');
    if (key === 'date') return new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000).toISOString().slice(0, 10);
    var minutes = Math.floor((value - Math.floor(value)) * 1440 + 1e-7) % 1440;
    return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
  }
  function nativeType(format) {
    var f = String(format || '').replace(/"[^"]*"|\\.|\[[^\]]*\]/g, '').toLowerCase();
    var tokens = (f.match(/[a-z]+/g) || []).filter(function (t) { return /^[ymdhs]+$/.test(t); });
    var day = tokens.some(function (t) { return /[yd]/.test(t); }), time = tokens.some(function (t) { return /[hs]/.test(t); });
    return day && time ? 'DATE_TIME' : day ? 'DATE' : time ? 'TIME' : null;
  }
  function sections(values, name) {
    var required = TemaTrial.HEADERS[name], title = name === 'Formations' ? 'titre' : 'formation', list = [];
    values.forEach(function (line, index) {
      var matches = [];
      line.forEach(function (v, c) { var m = text(v).match(/^(Divalto|Dimo|MoovApps) — Formation$/); if (m) matches.push({ label: m[1], code: SOFTWARES[m[1]], titleColumn: c }); });
      if (!matches.length) return;
      if (matches.length !== 1) throw TemaTrial.fault('CONFIG');
      var section = matches[0]; section.header = index + 1; section.columns = {};
      required.forEach(function (key, k) {
        var hits = [];
        line.forEach(function (v, c) { if (key === title ? c === section.titleColumn : LABELS[name][k].indexOf(text(v)) >= 0) hits.push(c); });
        if (hits.length !== 1) throw TemaTrial.fault('CONFIG');
        section.columns[key] = hits[0];
      });
      list.push(section);
    });
    if (list.length !== 3 || new Set(list.map(function (s) { return s.code; })).size !== 3) throw TemaTrial.fault('CONFIG');
    // Business rows above the first recognized header would otherwise disappear.
    if (values.slice(0, list[0].header - 1).some(function (r) { return r.some(function (v) { return text(v) !== ''; }); })) throw TemaTrial.fault('CONFIG');
    list.forEach(function (s, i) { s.end = list[i + 1] ? list[i + 1].header - 1 : values.length; });
    return list;
  }
  function table(values, name, formats, native) {
    if (!Array.isArray(values) || !values.length) throw TemaTrial.fault('CONFIG');
    if (name === 'Inscriptions') {
      var headers = values[0];
      if (headers.length !== TemaTrial.HEADERS.Inscriptions.length) throw TemaTrial.fault('CONFIG');
      TemaTrial.tableRows([headers], TemaTrial.HEADERS.Inscriptions);
      return values.slice(1).reduce(function (out, line, i) {
        if (!line.some(function (v) { return text(v) !== ''; })) return out;
        var row = TemaTrial.tableRows([headers, line], TemaTrial.HEADERS.Inscriptions)[0]; row._sheetRow = i + 2; out.push(row); return out;
      }, []);
    }
    var out = [], ids = Object.create(null);
    sections(values, name).forEach(function (section) {
      for (var r = section.header; r < section.end; r++) {
        var line = values[r] || [], row = {}, ignored = name === 'Formations' ? ['actif'] : ['inscriptions_ouvertes', 'places_restantes', 'etat_validation'];
        var useful = TemaTrial.HEADERS[name].some(function (k) { var v = line[section.columns[k]]; return ignored.indexOf(k) < 0 && v !== undefined && v !== '' && v !== null; });
        if (!useful && line[section.columns[name === 'Formations' ? 'actif' : 'inscriptions_ouvertes']] !== true) continue;
        TemaTrial.HEADERS[name].forEach(function (key) {
          var c = section.columns[key], v = line[c] === undefined ? '' : line[c];
          if (name === 'Disponibilités' && ['date', 'heure_debut', 'heure_fin'].indexOf(key) >= 0) {
            var cell = formats && formats[r] && (native ? formats[r][c] : formats[r].values && formats[r].values[c]);
            var type = native ? nativeType(cell) : cell && cell.effectiveFormat && cell.effectiveFormat.numberFormat && cell.effectiveFormat.numberFormat.type;
            v = temporal(v, key, type);
          }
          row[key] = v;
        });
        row._sheetRow = r + 1; row._columns = section.columns; row._software = section.code;
        var id = row[name === 'Formations' ? 'id' : 'id_cohorte'];
        if (id && ids[id]) throw TemaTrial.fault('CONFIG');
        if (id) ids[id] = true;
        if (name === 'Formations' && text(row.logiciel).split(' — ')[0] !== section.code) throw TemaTrial.fault('CONFIG');
        out.push(row);
      }
    });
    return out;
  }
  function checkRelations(data) {
    var formations = Object.create(null);
    data.formations.forEach(function (f) { formations[f.id] = f; });
    data.sessions.forEach(function (s) { var f = formations[text(s.formation).split(' — ')[0]]; if (f && f._software !== s._software) throw TemaTrial.fault('CONFIG'); });
    return data;
  }
  function assertAdministrativeLayout(b) {
    guard(b);
    var sources = {};
    ['Formations', 'Disponibilités'].forEach(function (name) {
      var sheet = b.getSheetByName(name); if (!sheet) throw TemaTrial.fault('CONFIG');
      var values = sheet.getDataRange().getValues();
      sections(values, name).forEach(function (s) { TemaTrial.HEADERS[name].forEach(function (k, i) { if (s.columns[k] !== i) throw new Error('Colonnes déplacées : rétablissez les en-têtes avant une action d’administration. Aucune source modifiée.'); }); });
      sources[name === 'Formations' ? 'formations' : 'sessions'] = values.map(function (r) { return Array.from({ length: name === 'Formations' ? 13 : 12 }, function (_, c) { return r[c] === undefined ? '' : r[c]; }); });
    });
    var registration = b.getSheetByName('Inscriptions'); if (!registration) throw TemaTrial.fault('CONFIG');
    sources.registrations = registration.getDataRange().getValues();
    table(sources.registrations, 'Inscriptions');
    return sources;
  }
  function numericTemporalBounds(values) {
    var bounds = { row: 0, column: 0 };
    sections(values, 'Disponibilités').forEach(function (section) {
      for (var r = section.header; r < section.end; r++) {
        ['date', 'heure_debut', 'heure_fin'].forEach(function (k) {
          var c = section.columns[k];
          if (typeof values[r][c] === 'number') { bounds.row = Math.max(bounds.row, r + 1); bounds.column = Math.max(bounds.column, c + 1); }
        });
      }
    });
    return bounds;
  }
  function nativeRead(b) {
    guard(b);
    function get(name) {
      var sheet = b.getSheetByName(name); if (!sheet) throw TemaTrial.fault('CONFIG');
      var values = sheet.getDataRange().getValues(), formats = null;
      if (name === 'Disponibilités') {
        var bounds = numericTemporalBounds(values);
        // Native Date objects already attest their type. Only bare numeric
        // temporal values need a format read, bounded just as in the API path.
        if (bounds.row) formats = sheet.getRange(1, 1, bounds.row, bounds.column).getNumberFormats();
      }
      return { values: values, formats: formats };
    }
    var f = get('Formations'), s = get('Disponibilités'), r = get('Inscriptions');
    return checkRelations({ formations: table(f.values, 'Formations'), sessions: table(s.values, 'Disponibilités', s.formats, true), registrations: table(r.values, 'Inscriptions'), params: TemaCopyConfig.read() });
  }
  function batchRead(diagnostic) {
    var timings = {}, at = Date.now();
    function mark(name) { var now = Date.now(); timings[name] = now - at; at = now; }
      guard();
      mark('guardMs');
      var result = Sheets.Spreadsheets.Values.batchGet(TARGET.spreadsheet, { ranges: ["'Formations'", "'Disponibilités'", "'Inscriptions'"], valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER' });
      mark('valuesMs');
      if (!result.valueRanges || result.valueRanges.length !== 3) throw TemaTrial.fault('CONFIG');
      var values = result.valueRanges.map(function (t) { return t.values; });
      var bounds = numericTemporalBounds(values[1]);
      var formats = null;
      if (bounds.row) {
        var lastColumn = '', column = bounds.column;
        while (column) { column--; lastColumn = String.fromCharCode(65 + column % 26) + lastColumn; column = Math.floor(column / 26); }
        // Preformatted checkbox rows can extend far below actual sessions.
        // Read format evidence only through the last numeric temporal cell;
        // every numeric date/time still requires its original attestation.
        var metadata = Sheets.Spreadsheets.get(TARGET.spreadsheet, { ranges: ["'Disponibilités'!A1:" + lastColumn + bounds.row], includeGridData: true, fields: 'sheets(properties(title),data(startRow,rowData(values(effectiveFormat(numberFormat(type))))))' });
        var found = (metadata.sheets || []).filter(function (s) { return s.properties && s.properties.title === 'Disponibilités'; });
        if (found.length !== 1) throw TemaTrial.fault('CONFIG');
        formats = [];
        (found[0].data || []).forEach(function (grid) { (grid.rowData || []).forEach(function (r, i) { formats[(grid.startRow || 0) + i] = r; }); });
      }
      mark('formatsMs');
      var data = checkRelations({ formations: table(values[0], 'Formations'), sessions: table(values[1], 'Disponibilités', formats), registrations: table(values[2], 'Inscriptions'), params: TemaCopyConfig.read() });
      mark('parseMs');
      if (diagnostic === true) console.log(JSON.stringify({ timings: timings, rows: values.map(function (v) { return v.length; }) }));
      return data;
  }
  function grouped(diagnostic) {
    try { return TemaTrial.publicCatalogue(batchRead(diagnostic), dependencies()); }
    catch (_) { return { schema_version: 1, code: 'UNAVAILABLE' }; }
  }
  function registrationSheet() { var b = book(), sheet = b.getSheetByName('Inscriptions'); if (!sheet) throw TemaTrial.fault('CONFIG'); return sheet; }
  function registrationLayout(sheet) {
    guard();
    var values = Sheets.Spreadsheets.Values.get(TARGET.spreadsheet, "'Inscriptions'", { valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER' }).values;
    table(values, 'Inscriptions'); return { values: values, headers: values[0] };
  }
  function counters(b) {
    guard(b);
    // The API must observe any preceding native insertion/status change.
    SpreadsheetApp.flush();
    var data = batchRead(), count = Object.create(null), sheet = b.getSheetByName('Disponibilités');
    data.registrations.forEach(function (r) { if (r.statut === 'confirmee') count[r.id_cohorte] = (count[r.id_cohorte] || 0) + 1; });
    data.sessions.forEach(function (s) { if (Number.isSafeInteger(s.places_max) && s.places_max > 0) sheet.getRange(s._sheetRow, s._columns.places_restantes + 1).setValue(Math.max(0, s.places_max - (count[s.id_cohorte] || 0))); });
  }
  // Caller owns ScriptLock. Native services also work from the bound simple onEdit.
  function nativeCounters(b, cohort) {
    guard(b); var sourceVersion = version(), alreadyPending = props().getProperty('COPY_NATIVE_COUNTERS_PENDING') === '1'; props().setProperty('COPY_NATIVE_COUNTERS_PENDING', '1');
    var sessionSheet = b.getSheetByName('Disponibilités'), registration = b.getSheetByName('Inscriptions');
    if (!sessionSheet || !registration) throw TemaTrial.fault('CONFIG');
    var sessions = sessionSheet.getDataRange().getValues(), registrations = table(registration.getDataRange().getValues(), 'Inscriptions'), count = Object.create(null);
    registrations.forEach(function (r) { if (r.statut === 'confirmee') count[r.id_cohorte] = (count[r.id_cohorte] || 0) + 1; });
    sections(sessions, 'Disponibilités').forEach(function (section) {
      var changes = [];
      for (var r = section.header; r < section.end; r++) {
        var row = sessions[r], id = text(row[section.columns.id_cohorte]), capacity = row[section.columns.places_max];
        if (id && (cohort === undefined || id === cohort) && Number.isSafeInteger(capacity) && capacity > 0) {
          var remaining = Math.max(0, capacity - (count[id] || 0));
          if (row[section.columns.places_restantes] !== remaining) changes.push({ row: r + 1, value: remaining });
        }
      }
      // Group adjacent changed counters only; never overwrite intervening source cells.
      for (var i = 0; i < changes.length;) {
        var start = changes[i].row, values = [[changes[i++].value]];
        while (i < changes.length && changes[i].row === start + values.length) values.push([changes[i++].value]);
        sessionSheet.getRange(start, section.columns.places_restantes + 1, values.length, 1).setValues(values);
      }
    });
    SpreadsheetApp.flush();
    // A cohort-only repair must not clear an older pending repair of another cohort.
    if (version() === sourceVersion && (cohort === undefined || !alreadyPending)) props().setProperty('COPY_NATIVE_COUNTERS_PENDING', '0');
  }
  function store(options) {
    options = options || {};
    return {
      read: function () { return batchRead(); },
      insert: function (row) {
        var sheet = registrationSheet(), layout = registrationLayout(sheet), next = layout.values.length + 1;
        for (var i = 1; i < layout.values.length; i++) if (layout.values[i].every(function (v) { return v === '' || v === null; })) { next = i + 1; break; }
        dirty(options.deferDerived);
        if (options.deferDerived) props().setProperty('COPY_NATIVE_COUNTERS_PENDING', '1');
        if (next > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), next - sheet.getMaxRows());
        var range = sheet.getRange(next, 1, 1, layout.headers.length); range.setNumberFormat('@');
        var values = layout.headers.map(function (k, c) { var v = Object.prototype.hasOwnProperty.call(row, k) ? row[k] : ''; if (typeof v === 'boolean' || typeof v === 'number') sheet.getRange(next, c + 1).setNumberFormat(typeof v === 'boolean' ? 'General' : '0'); return TemaTrial.inertCell(v); });
        range.setValues([values]);
        // Recording is the durable fact. A derived counter failure must never
        // turn an established admission into a refusal; reconciliation retries.
        try { if (!options.deferDerived) counters(book()); } catch (_) { /* Dirty version remains pending. */ }
      },
      patch: function (id, fields) {
        var sheet = registrationSheet(), layout = registrationLayout(sheet), idColumn = layout.headers.indexOf('id_inscription'), found = [];
        layout.values.slice(1).forEach(function (r, i) { if (r[idColumn] === id) found.push(i + 2); });
        if (found.length !== 1 || Object.keys(fields).some(function (k) { return layout.headers.indexOf(k) < 0; })) throw TemaTrial.fault('CONFIG');
        dirty(options.deferDerived); Object.keys(fields).forEach(function (k) { sheet.getRange(found[0], layout.headers.indexOf(k) + 1).setValue(TemaTrial.inertCell(fields[k])); });
      },
      flush: function () { SpreadsheetApp.flush(); }
    };
  }
  function allowed() {
    var values = JSON.parse(props().getProperty('ALLOWED_RECIPIENTS_JSON') || 'null');
    if (!Array.isArray(values) || values.some(function (v) { return typeof v !== 'string' || !/^[^\s@<>;,\r\n]+@[^\s@<>;,\r\n]+\.[^\s@<>;,\r\n]+$/.test(v); })) throw TemaTrial.fault('PRIVATE_CONFIG');
    return values.map(function (v) { return v.trim().toLowerCase(); });
  }
  function demoAdmissions() {
    var mode = TemaCopyConfig.read().admissions_mode;
    if (mode !== 'restricted' && mode !== 'demo') throw TemaTrial.fault('PRIVATE_CONFIG');
    return mode === 'demo';
  }
  function reserveMail(id, channel, to) {
    guard();
    try {
      var limits = JSON.parse(props().getProperty('COPY_MAIL_LIMITS_JSON') || '{"registrations":0,"recipients":0}');
      if (!limits || !Number.isSafeInteger(limits.registrations) || !Number.isSafeInteger(limits.recipients) || limits.registrations < 0 || limits.recipients < 0) return 'BUDGET_CONFIG';
      if (!limits.registrations || !limits.recipients) return 'COPY_LIMIT';
      if (['participant', 'tema'].indexOf(channel) < 0) return 'ALLOWLIST';
      var recipient = text(to).toLowerCase();
      if (channel === 'participant' && demoAdmissions()) {
        if (!/^[^\s@<>;,\r\n]+@[^\s@<>;,\r\n]+\.[^\s@<>;,\r\n]+$/.test(recipient)) return 'ALLOWLIST';
      } else if (allowed().indexOf(recipient) < 0) return 'ALLOWLIST';
      var budget = JSON.parse(props().getProperty('COPY_MAIL_BUDGET_JSON') || '{"version":1,"registrations":{},"recipients":0}');
      if (!budget || budget.version !== 1 || !budget.registrations || typeof budget.registrations !== 'object' || Array.isArray(budget.registrations) || !Number.isSafeInteger(budget.recipients) || budget.recipients < 0) return 'BUDGET_CONFIG';
      var ids = Object.keys(budget.registrations), count = 0;
      ids.forEach(function (key) { var channels = budget.registrations[key]; if (!channels || typeof channels !== 'object' || Array.isArray(channels) || !Object.keys(channels).length || Object.keys(channels).some(function (c) { return ['participant', 'tema'].indexOf(c) < 0 || channels[c] !== true; })) throw TemaTrial.fault('CONFIG'); count += Object.keys(channels).length; });
      if (count !== budget.recipients) return 'BUDGET_CONFIG';
      if (budget.registrations[id] && budget.registrations[id][channel]) return 'ATTEMPT_RESERVED';
      if (!budget.registrations[id] && ids.length >= limits.registrations || budget.recipients >= limits.recipients) return 'COPY_LIMIT';
      if (MailApp.getRemainingDailyQuota() < 1) return 'MAIL_QUOTA';
      if (!budget.registrations[id]) budget.registrations[id] = {};
      budget.registrations[id][channel] = true; budget.recipients++;
      props().setProperty('COPY_MAIL_BUDGET_JSON', JSON.stringify(budget)); return null;
    } catch (_) { return 'BUDGET_CONFIG'; }
  }
  function dependencies(options) {
    return {
      mailLogo: true, privateSheetUrl: 'https://docs.google.com/spreadsheets/d/' + TARGET.spreadsheet + '/edit', guard: guard, store: store(options), suppressCancelledMail: true, withLock: lock, reserveMail: reserveMail,
      allowNewRegistration: function (command) { return demoAdmissions() || allowed().indexOf(command.courriel) >= 0; },
      consumeNewCommand: function (hash, now) { var saved = props().getProperty('COPY_RATE_BUDGET_JSON'), decision = TemaTrial.nextRateBudget(saved === null ? null : JSON.parse(saved), hash, now); if (decision.allowed) props().setProperty('COPY_RATE_BUDGET_JSON', JSON.stringify(decision.state)); return decision.allowed; },
      now: function () { return Date.now(); }, uuid: function () { return Utilities.getUuid(); },
      hash: function (v) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, v, Utilities.Charset.UTF_8).map(function (n) { return (n < 0 ? n + 256 : n).toString(16).padStart(2, '0'); }).join(''); },
      formatLocal: function (ms) { return Utilities.formatDate(new Date(ms), 'America/Toronto', "yyyy-MM-dd'T'HH:mm"); },
      mail: { send: function (message) { guard(); var options = { to: message.to, subject: message.subject.replace(/^\[TEST\]\s*/, ''), body: message.body, name: message.name }; if (message.htmlBody) { options.htmlBody = message.htmlBody; if (message.htmlBody.indexOf('cid:temaLogo') >= 0) { if (typeof TEMA_MAIL_LOGO_PNG !== 'string' || !TEMA_MAIL_LOGO_PNG) throw TemaTrial.fault('CONFIG'); options.inlineImages = { temaLogo: Utilities.newBlob(Utilities.base64Decode(TEMA_MAIL_LOGO_PNG), 'image/png', 'logo-tema.png') }; } } if (message.ics) options.attachments = [Utilities.newBlob(message.ics, 'text/calendar; charset=UTF-8', 'formation.ics')]; MailApp.sendEmail(options); } }
    };
  }
  // Private Script Properties only; absence is the explicit version-10 fallback.
  // COPY_ASYNC_MAIL_JSON: {version:1, activated_at_ms:<epoch ms>, recovery_ids:[<approved inscription ID>]}
  // COPY_ASYNC_MAIL_CURSOR is a rotating position, never duplicated business data.
  function asyncConfig() {
    guard();
    var raw = props().getProperty('COPY_ASYNC_MAIL_JSON');
    if (raw === null) return null;
    try {
      var config = JSON.parse(raw), cursorRaw = props().getProperty('COPY_ASYNC_MAIL_CURSOR'), cursor = cursorRaw === null ? 0 : Number(cursorRaw);
      if (!config || config.version !== 1 || Object.keys(config).sort().join(',') !== 'activated_at_ms,recovery_ids,version' ||
          !Number.isSafeInteger(config.activated_at_ms) || config.activated_at_ms <= 0 || config.activated_at_ms > Date.now() ||
          !Array.isArray(config.recovery_ids) || config.recovery_ids.length > 1 || config.recovery_ids.some(function (id) { return typeof id !== 'string' || !/^I-[A-Za-z0-9-]{1,100}$/.test(id); }) ||
          !Number.isSafeInteger(cursor) || cursor < 0 || cursorRaw !== null && !/^(0|[1-9][0-9]*)$/.test(cursorRaw)) throw new Error('configuration');
      return { activated_at_ms: config.activated_at_ms, recovery_ids: config.recovery_ids, cursor: cursor };
    } catch (_) { throw TemaTrial.fault('PRIVATE_CONFIG'); }
  }
  function processPendingMail() {
    var started = Date.now();
    function canStartMail() { return Date.now() - started < 40000; }
    guard();
    if (!asyncConfig()) return 0;
    var selected = lock(function () {
      var config = asyncConfig();
      if (!config) return [];
      var rows = table(registrationLayout(registrationSheet()).values, 'Inscriptions').filter(function (row) {
        var at = Object.prototype.toString.call(row.horodatage) === '[object Date]' ? row.horodatage.getTime() : Date.parse(row.horodatage);
        return (Number.isFinite(at) && at >= config.activated_at_ms || config.recovery_ids.indexOf(row.id_inscription) >= 0) &&
          ['confirmee', 'annulee'].indexOf(row.statut) >= 0 && (row.mail_participant_etat === 'PENDING' || row.mail_tema_etat === 'PENDING');
      });
      if (!rows.length) return [];
      var start = config.cursor % rows.length, result = [];
      for (var i = 0; i < Math.min(3, rows.length); i++) result.push({ id: rows[(start + i) % rows.length].id_inscription, cursor: (start + i + 1) % rows.length });
      return result;
    });
    var workerDeps = dependencies({ deferDerived: true }); workerDeps.canStartMail = canStartMail;
    var service = TemaTrial.createService(workerDeps), attempted = 0;
    for (var i = 0; i < selected.length && canStartMail(); i++) {
      // Advance before processing, including errors/interrupted sends, for fairness.
      lock(function () { props().setProperty('COPY_ASYNC_MAIL_CURSOR', String(selected[i].cursor)); });
      try { service.notify(selected[i].id); } catch (_) { /* Other rows remain eligible. */ }
      attempted++;
    }
    return attempted;
  }
  function isOwner() { guard(); try { var owner = props().getProperty('COPY_OWNER_EMAIL'); return !!owner && Session.getEffectiveUser().getEmail().toLowerCase() === owner.trim().toLowerCase(); } catch (_) { return false; } }
  function sourceHash(sources) { return dependencies().hash(JSON.stringify(sources)); }
  // plan() depends on business fields, confirmed counts and elapsed session starts.
  // Mail states, stored counters and diagnostics are deliberately excluded.
  function adminFingerprint(b, sources, planning) {
    guard(b);
    function read(name, width) { var sheet = b.getSheetByName(name); if (!sheet) throw TemaTrial.fault('CONFIG'); return sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), width).getValues(); }
    var formations = sources ? sources.formations : read('Formations', 13), sessions = sources ? sources.sessions : read('Disponibilités', 12);
    // Validate the fixed administration layout before interpreting column positions.
    [['Formations', formations], ['Disponibilités', sessions]].forEach(function (entry) {
      sections(entry[1], entry[0]).forEach(function (section) { TemaTrial.HEADERS[entry[0]].forEach(function (key, i) { if (section.columns[key] !== i) throw TemaTrial.fault('CONFIG'); }); });
    });
    var registration = b.getSheetByName('Inscriptions'); if (!registration) throw TemaTrial.fault('CONFIG');
    var confirmed = planning ? planning.confirmed : Object.create(null), instant = planning ? planning.now : Date.now();
    if (!planning) table(registration.getDataRange().getValues(), 'Inscriptions').forEach(function (row) { if (row.statut === 'confirmee') confirmed[row.id_cohorte] = (confirmed[row.id_cohorte] || 0) + 1; });
    var bounds = numericTemporalBounds(sessions), formats = bounds.row ? b.getSheetByName('Disponibilités').getRange(1, 1, bounds.row, bounds.column).getNumberFormats() : null;
    var elapsed = [];
    sections(sessions, 'Disponibilités').forEach(function (section) {
      for (var r = section.header; r < section.end; r++) {
        var row = sessions[r];
        if (!text(row[0])) continue;
        var date = temporal(row[2], 'date', formats && formats[r] && nativeType(formats[r][2]));
        var time = temporal(row[3], 'heure_debut', formats && formats[r] && nativeType(formats[r][3]));
        var start = TemaSheetPrototype.localUtc(text(date), text(time), dependencies().formatLocal);
        elapsed.push([row[0], start !== null && start <= instant]);
      }
    });
    return sourceHash({ formations: formations.map(function (row) { return row.slice(0, 13); }), sessions: sessions.map(function (row) { return row.slice(0, 9); }), confirmed: Object.keys(confirmed).sort().map(function (id) { return [id, confirmed[id]]; }), elapsed: elapsed });
  }
  function acknowledgeAdmin(b, expected) {
    guard(b);
    if (!isOwner() || adminFingerprint(b) !== expected) return false;
    props().setProperty('COPY_ADMIN_SOURCE_HASH', expected);
    props().setProperty('COPY_ADMIN_MAINTENANCE_PENDING', '0');
    try { if (adminFingerprint(b) === expected) return true; } catch (_) { /* Keep incomplete maintenance retryable after an unreadable final source. */ }
    props().setProperty('COPY_ADMIN_MAINTENANCE_PENDING', '1'); return false;
  }
  function markCountersPending() { guard(); props().setProperty('COPY_NATIVE_COUNTERS_PENDING', '1'); }
  function auditHash(b) {
    function read(name, width) { var sheet = b.getSheetByName(name); if (!sheet) throw TemaTrial.fault('CONFIG'); return sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), width || sheet.getLastColumn()).getValues(); }
    return sourceHash({ formations: read('Formations', 13), sessions: read('Disponibilités', 12), registrations: read('Inscriptions') });
  }
  function acknowledge(v, validate, state) {
    // Google human edits ignore ScriptLock. Validate source/selection outside it,
    // then check the durable version under the short shared lock and read back.
    if (version() !== v || !validate()) return false;
    var accepted = lock(function () {
      if (version() !== v) return false;
      if (props().getProperty('COPY_NATIVE_COUNTERS_PENDING') === '1') return true;
      props().setProperty('COPY_VIEW_SOURCE_HASH', state && state.sourceHash || '');
      props().setProperty('COPY_VIEW_NEXT_CHANGE_AT', String(state && state.nextChangeAt || Number.MAX_SAFE_INTEGER));
      props().setProperty('COPY_AUDIT_AT', String(Date.now() + 300000));
      props().setProperty('COPY_NOTICE_PENDING', '0');
      props().setProperty('COPY_VIEW_VERSION', v); return true;
    });
    if (!accepted) return false;
    var current = false;
    try { current = version() === v && validate(); } catch (_) { /* Unreadable post-check must invalidate the acknowledgement. */ }
    if (current && version() === v) return true;
    lock(function () { if (version() === v) dirty(true); });
    return false;
  }
  function reconcile() {
    guard();
    var observedVersion = version(), clean = props().getProperty('COPY_ADMIN_MAINTENANCE_PENDING') !== '1' && props().getProperty('COPY_NATIVE_COUNTERS_PENDING') !== '1' && props().getProperty('COPY_VIEW_VERSION') === observedVersion, now = Date.now();
    var next = Number(props().getProperty('COPY_VIEW_NEXT_CHANGE_AT') || 0);
    if (clean && Number(props().getProperty('COPY_AUDIT_AT') || 0) > now && next > now) return true;
    var b = book();
    if (clean) {
      var unchanged = auditHash(b) === props().getProperty('COPY_VIEW_SOURCE_HASH');
      if (unchanged && next > now) { props().setProperty('COPY_AUDIT_AT', String(now + 300000)); return true; }
      // A missed native registration edit did not set the pending flag.
      if (!unchanged) markCountersPending();
    }
    // Retrying already pending work must not invalidate an in-flight owner render.
    // Only a clean checkpoint invalidated by source audit/time creates a version.
    if (clean) lock(function () { if (version() === observedVersion) dirty(true); });
    pendingNotice();
    if (typeof TemaSheetPrototype !== 'undefined' && (props().getProperty('COPY_ADMIN_MAINTENANCE_PENDING') === '1' || adminFingerprint(b) !== props().getProperty('COPY_ADMIN_SOURCE_HASH'))) {
      if (TemaSheetPrototype.sync(b, null) !== true) return false;
    }
    if (props().getProperty('COPY_NATIVE_COUNTERS_PENDING') === '1') lock(function () { nativeCounters(b); });
    if (typeof TemaRegistrationView !== 'undefined') return TemaRegistrationView.refresh(b, false, true);
    return false;
  }
  function installTrigger() {
    ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
    guard(); if (!isOwner()) throw TemaTrial.fault('PRIVATE_CONFIG');
    return lock(function () {
      var matches = ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'reconcilierCopieTema'; });
      if (!matches.length) ScriptApp.newTrigger('reconcilierCopieTema').timeBased().everyMinutes(1).create();
      matches.slice(1).forEach(function (t) { ScriptApp.deleteTrigger(t); });
      return { environment: 'COPY', trigger: 'reconcilierCopieTema', minutes: 1, count: 1 };
    });
  }
  return { target: TARGET, guard: guard, book: book, lock: lock, dirty: dirty, version: version, table: table, sections: sections, temporal: temporal, nativeRead: nativeRead, assertAdministrativeLayout: assertAdministrativeLayout, grouped: grouped, store: store, counters: counters, nativeCounters: nativeCounters, reserveMail: reserveMail, dependencies: dependencies, isOwner: isOwner, sourceHash: sourceHash, adminFingerprint: adminFingerprint, acknowledgeAdmin: acknowledgeAdmin, markCountersPending: markCountersPending, acknowledge: acknowledge, asyncConfig: asyncConfig, processPendingMail: processPendingMail, reconcile: reconcile, installTrigger: installTrigger };
})();
function copyJson_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return copyJson_(TemaCopy.grouped()); }
function copyPostDiagnostic_(phase, code) {
  var allowed = ['RECORDED', 'REPLAY', 'BUSY', 'UNAVAILABLE', 'INVALID', 'RETRY_CONFLICT', 'CONSENT_REQUIRED', 'POLICY_CHANGED', 'NOT_FOUND', 'CLOSED', 'SESSION_CHANGED', 'DUPLICATE', 'FULL'];
  console.log(JSON.stringify({ phase: phase, code: allowed.indexOf(code) >= 0 ? code : 'UNAVAILABLE' }));
}
function doPost(e) {
  var command;
  try {
    TemaCopy.guard();
    if (!e || !e.postData || !/^application\/x-www-form-urlencoded(?:;|$)/i.test(e.postData.type || '') || typeof e.postData.contents !== 'string' || e.postData.contents.length > 16384 || !e.parameter || Object.keys(e.parameters || {}).some(function (k) { return !Array.isArray(e.parameters[k]) || e.parameters[k].length !== 1; })) throw TemaTrial.fault('INVALID');
    command = TemaTrial.decodeForm(e.parameter);
  } catch (err) { var rejected = err.code === 'ENVIRONMENT' ? 'UNAVAILABLE' : 'INVALID'; copyPostDiagnostic_('copy_post_decode', rejected); return copyJson_(TemaTrial.envelope(rejected, null)); }
  try {
    var async = TemaCopy.asyncConfig(), service = TemaTrial.createService(TemaCopy.dependencies(async ? { deferDerived: true } : undefined));
    var receipt = async ? service.register(command) : service.submit(command);
    copyPostDiagnostic_('copy_post_admission', receipt.code); return copyJson_(receipt);
  } catch (_) { copyPostDiagnostic_('copy_post_config', 'UNAVAILABLE'); return copyJson_(TemaTrial.envelope('UNAVAILABLE', command)); }
}
function reconcilierCopieTema() {
  // Always precedes projection shortcuts/failures; mail uses its own atomic claims.
  try { TemaCopy.processPendingMail(); }
  catch (error) { console.log(JSON.stringify({ phase: 'copy_pending_mail', code: error && ['PRIVATE_CONFIG', 'BUSY', 'ENVIRONMENT', 'CONFIG'].indexOf(error.code) >= 0 ? error.code : 'UNAVAILABLE' })); }
  return TemaCopy.reconcile();
}
function installerActualisationCopieTema() { return TemaCopy.installTrigger(); }
function autoriserCopieTema() {
  ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
  TemaCopy.guard();
  var identity = Session.getEffectiveUser().getEmail();
  var result = { environment: 'COPY', identityAvailable: !!identity, ownerMatches: TemaCopy.isOwner(), authorization: String(ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationStatus()) };
  console.log(JSON.stringify(result)); return result;
}
function diagnostiquerLectureCopieTema() { return TemaCopy.grouped(true); }
if (typeof module !== 'undefined') module.exports = TemaCopy;
