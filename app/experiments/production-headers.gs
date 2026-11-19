/* Seven validated headers. All provider reads are batched; no metadata-object
 * RPC loop, old-row fallback, cache, or transaction claim for human edits. */
var TemaHeaders = (function () {
  'use strict';
  var KEY = 'TEMA_PRODUCTION_HEADER_V1', SNAPSHOT = 'PRODUCTION_HEADERS_V1', JOURNAL = 'PRODUCTION_HEADERS_CAPTURE_PENDING';
  var WORKER_AUDIT_INTERVAL = 300000, WORKER_AUDIT_AT = 'PRODUCTION_HEADERS_AUDIT_AT';
  var WIDTH = { Formations: 13, 'Disponibilités': 12, Inscriptions: 29 };
  function props() { return PropertiesService.getScriptProperties(); }
  function fail(code) {
    props().setProperty('PRODUCTION_HEADERS_DIAGNOSTIC', code);
    props().setProperty('PRODUCTION_ADMIN_MAINTENANCE_PENDING', '1');
    props().setProperty('PRODUCTION_NATIVE_COUNTERS_PENDING', '1');
    throw TemaTrial.fault(code);
  }
  function columnA1(value) { var label = ''; for (; value > 0; value = Math.floor((value - 1) / 26)) label = String.fromCharCode(65 + (value - 1) % 26) + label; return label; }
  function read(book, metadataOnly) {
    TemaCopy.guard(book);
    var id = book.getId(), info = Sheets.Spreadsheets.get(id, { fields: 'developerMetadata(metadataId),sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)),developerMetadata(metadataId),protectedRanges(protectedRangeId,description))' });
    if (!info || !Array.isArray(info.sheets)) fail('HEADERS_PROVIDER');
    var sheets = {}, allIds = [], protections = [];
    (info.developerMetadata || []).forEach(function (m) { allIds.push(m.metadataId); });
    info.sheets.forEach(function (s) {
      var p = s.properties;
      if (!p || !Number.isSafeInteger(p.sheetId) || !p.title || sheets[p.title]) fail('HEADERS_PROVIDER');
      sheets[p.title] = p;
      (s.developerMetadata || []).forEach(function (m) { allIds.push(m.metadataId); });
      (s.protectedRanges || []).forEach(function (p) { protections.push(p); allIds.push(p.protectedRangeId); });
    });
    var response = Sheets.Spreadsheets.DeveloperMetadata.search({ dataFilters: [{ developerMetadataLookup: { metadataKey: KEY } }] }, id);
    var matches = response && response.matchedDeveloperMetadata === undefined ? [] : response && response.matchedDeveloperMetadata;
    if (!Array.isArray(matches)) fail('HEADERS_PROVIDER');
    var anchors = matches.map(function (m) {
      var a = m && m.developerMetadata;
      if (!a || !Number.isSafeInteger(a.metadataId) || a.metadataKey !== KEY || typeof a.metadataValue !== 'string' || !a.location || !a.location.dimensionRange) fail('HEADERS_PROVIDER');
      var d = a.location.dimensionRange, start = d.startIndex === undefined ? 0 : d.startIndex, sheetId = d.sheetId;
      // Google omits the default numeric sheetId=0 in metadata JSON. Accept
      // only that omission, attested independently by the named sheet's
      // properties; never infer another sheet ID from an anchor token.
      if (sheetId === undefined) {
        var named = sheets[a.metadataValue.split(':')[1]];
        if (!named || named.sheetId !== 0) fail('HEADERS_PROVIDER');
        sheetId = 0;
      }
      if (!Number.isSafeInteger(sheetId) || !Number.isSafeInteger(start) || start < 0 || d.endIndex !== start + 1 || ['ROWS', 'COLUMNS'].indexOf(d.dimension) < 0 || a.location.locationType && a.location.locationType !== (d.dimension === 'ROWS' ? 'ROW' : 'COLUMN')) fail('HEADERS_PROVIDER');
      allIds.push(a.metadataId);
      return { id: a.metadataId, token: a.metadataValue, sheetId: sheetId, dimension: d.dimension, index: start };
    });
    anchors.sort(function (a, b) { return a.token.localeCompare(b.token); });
    if (metadataOnly) return { sheets: sheets, anchors: anchors, protections: protections, allIds: allIds };
    var names = Object.keys(WIDTH), ranges = names.map(function (name) {
      var p = sheets[name], grid = p && p.gridProperties;
      if (!grid || !Number.isSafeInteger(grid.rowCount) || grid.rowCount < 1 || !Number.isSafeInteger(grid.columnCount) || grid.columnCount < WIDTH[name]) fail('HEADERS_STRUCTURE');
      return "'" + name + "'!A1:" + columnA1(WIDTH[name]) + grid.rowCount;
    });
    var result = Sheets.Spreadsheets.Values.batchGet(id, { ranges: ranges, valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER' });
    if (!result || !Array.isArray(result.valueRanges) || result.valueRanges.length !== 3) fail('HEADERS_PROVIDER');
    var values = {};
    names.forEach(function (name, i) {
      var data = result.valueRanges[i].values || [];
      if (!Array.isArray(data) || data.some(function (line) { return !Array.isArray(line); })) fail('HEADERS_PROVIDER');
      values[name] = data.map(function (line) { return Array.from({ length: WIDTH[name] }, function (_, c) { return line[c] === undefined ? '' : line[c]; }); });
    });
    return { sheets: sheets, anchors: anchors, protections: protections, allIds: allIds, values: values };
  }
  function schema(state) {
    var entries = [];
    ['Formations', 'Disponibilités'].forEach(function (name) {
      TemaCopy.sections(state.values[name], name).forEach(function (section) {
        if (TemaTrial.HEADERS[name].some(function (key, i) { return section.columns[key] !== i; })) fail('HEADERS_STRUCTURE');
        entries.push({ name: name, sheetId: state.sheets[name].sheetId, token: name + ':' + section.code, row: section.header, cells: state.values[name][section.header - 1].slice() });
      });
    });
    var cells = state.values.Inscriptions[0];
    if (JSON.stringify(cells) !== JSON.stringify(TemaTrial.HEADERS.Inscriptions)) fail('HEADERS_STRUCTURE');
    entries.push({ name: 'Inscriptions', sheetId: state.sheets.Inscriptions.sheetId, token: 'Inscriptions', row: 1, cells: cells.slice() });
    return entries;
  }
  function validateSnapshot(snapshot) {
    if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.entries) || snapshot.entries.length !== 7) fail('HEADERS_SNAPSHOT');
    var tokens = {};
    snapshot.entries.forEach(function (e) {
      if (!e || !Object.prototype.hasOwnProperty.call(WIDTH, e.name) || tokens[e.token] || !Number.isSafeInteger(e.sheetId) || !Array.isArray(e.cells) || e.cells.length !== WIDTH[e.name] || e.cells.some(function (v, c) { return typeof v !== 'string' || !v.trim() && !(e.name === 'Disponibilités' && c === 11); })) fail('HEADERS_SNAPSHOT');
      tokens[e.token] = true;
    });
    ['Formations', 'Disponibilités'].forEach(function (name) {
      var entries = snapshot.entries.filter(function (e) { return e.name === name; }), sections;
      try { sections = TemaCopy.sections(entries.map(function (e) { return e.cells; }), name); } catch (_) { fail('HEADERS_SNAPSHOT'); }
      sections.forEach(function (s, i) { if (entries[i].token !== name + ':' + s.code || TemaTrial.HEADERS[name].some(function (key, c) { return s.columns[key] !== c; })) fail('HEADERS_SNAPSHOT'); });
    });
    var registrations = snapshot.entries.filter(function (e) { return e.name === 'Inscriptions'; });
    if (registrations.length !== 1 || registrations[0].token !== 'Inscriptions' || JSON.stringify(registrations[0].cells) !== JSON.stringify(TemaTrial.HEADERS.Inscriptions)) fail('HEADERS_SNAPSHOT');
  }
  function business(name, row) {
    if (/^(?:DIV|DIMO|MOOV|C|I)-[A-Za-z0-9-]+$/.test(String(row[0]))) return true;
    if (name === 'Formations') return /^(?:DIV|DIMO|MOOV)(?:\s*—|$)/.test(String(row[1])) || typeof row[12] === 'boolean' && row[2] !== '' && (typeof row[8] === 'number' || typeof row[10] === 'number');
    if (name === 'Disponibilités') return /^(?:DIV|DIMO|MOOV)-/.test(String(row[1])) || ['en_ligne', 'presentiel'].indexOf(row[6]) >= 0 || /^\d{4}-\d\d-\d\d$/.test(String(row[2])) && row[3] !== '';
    return ['confirmee', 'annulee'].indexOf(row[6]) >= 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row[10]));
  }
  function check(snapshot, state) {
    validateSnapshot(snapshot);
    var anchors = {}, ids = {}, rows = {}, changes = [], positions = [];
    if (state.anchors.length !== 61) fail('HEADERS_ANCHOR');
    state.anchors.forEach(function (a) { if (anchors[a.token] || ids[a.id]) fail('HEADERS_ANCHOR'); anchors[a.token] = a; ids[a.id] = true; });
    Object.keys(WIDTH).forEach(function (name) {
      var expected = snapshot.entries.filter(function (e) { return e.name === name; })[0];
      if (!expected || state.sheets[name].sheetId !== expected.sheetId) fail('HEADERS_STRUCTURE');
      for (var c = 1; c <= WIDTH[name]; c++) {
        var column = anchors['C:' + name + ':' + c];
        if (!column || column.sheetId !== expected.sheetId || column.dimension !== 'COLUMNS' || column.index !== c - 1) fail('HEADERS_COLUMNS');
      }
    });
    snapshot.entries.forEach(function (entry) {
      var row = anchors['R:' + entry.token];
      if (!row || row.sheetId !== entry.sheetId || row.dimension !== 'ROWS' || rows[entry.name + ':' + row.index]) fail('HEADERS_ANCHOR');
      if (entry.name === 'Inscriptions' && row.index !== 0) fail('HEADERS_REGISTRATION_POSITION');
      rows[entry.name + ':' + row.index] = true;
      var current = state.values[entry.name][row.index];
      if (!current) fail('HEADERS_ANCHOR');
      if (business(entry.name, current)) fail('HEADERS_BUSINESS_ROW');
      entry.cells.forEach(function (value, c) { if (current[c] !== value) changes.push({ name: entry.name, sheetId: entry.sheetId, row: row.index + 1, column: c + 1, before: current[c], after: value }); });
      positions.push({ name: entry.name, row: row.index + 1, width: entry.cells.length });
    });
    snapshot.entries.forEach(function (entry) { state.values[entry.name].forEach(function (line, i) { if (!rows[entry.name + ':' + i] && JSON.stringify(line) === JSON.stringify(entry.cells)) fail('HEADERS_ANCHOR'); }); });
    return { changes: changes, positions: positions, stamp: JSON.stringify([state.anchors, state.values]) };
  }
  function plan(book) {
    var snapshot;
    try { snapshot = JSON.parse(props().getProperty(SNAPSHOT)); } catch (_) { fail('HEADERS_SNAPSHOT'); }
    validateSnapshot(snapshot); return check(snapshot, read(book));
  }
  function cleanup(book, journal) {
    if (!journal || journal.version !== 1 || !Array.isArray(journal.metadata) || !Array.isArray(journal.protections)) fail('HEADERS_CAPTURE_JOURNAL');
    var state = read(book, true), requests = [];
    journal.metadata.forEach(function (own) { if (state.anchors.some(function (a) { return a.id === own.id && a.token === own.token; })) requests.push({ deleteDeveloperMetadata: { dataFilter: { developerMetadataLookup: { metadataId: own.id } } } }); });
    journal.protections.forEach(function (own) { if (state.protections.some(function (p) { return p.protectedRangeId === own.id && p.description === own.description; })) requests.push({ deleteProtectedRange: { protectedRangeId: own.id } }); });
    if (requests.length) Sheets.Spreadsheets.batchUpdate({ requests: requests }, book.getId());
    props().deleteProperty(JOURNAL);
  }
  function capture(book) {
    TemaCopy.guard(book); if (!TemaCopy.isOwner()) throw TemaTrial.fault('PRIVATE_CONFIG');
    return TemaCopy.lock(function () {
      if (props().getProperty(SNAPSHOT) !== null) throw new Error('La photographie existe déjà. Aucune réinitialisation automatique.');
      var pending = props().getProperty(JOURNAL); if (pending !== null) cleanup(book, JSON.parse(pending));
      var version = TemaCopy.version(), initial = read(book);
      if (initial.anchors.length) throw new Error('Des ancres non reconnues nécessitent un diagnostic.');
      var entries = schema(initial), snapshot = { version: 1, entries: entries }; validateSnapshot(snapshot);
      var finalState = read(book);
      if (TemaCopy.version() !== version || JSON.stringify(schema(finalState)) !== JSON.stringify(entries) || JSON.stringify(finalState.values) !== JSON.stringify(initial.values) || finalState.anchors.length) fail('HEADERS_CONCURRENT');
      var used = finalState.allIds.slice(), next = parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 7), 16) + 1;
      function id() { while (used.indexOf(next) >= 0) next++; used.push(next); return next++; }
      var journal = { version: 1, metadata: [], protections: [] }, requests = [], nonce = Utilities.getUuid();
      function anchor(token, sheetId, dimension, index) { var own = { id: id(), token: token }; journal.metadata.push(own); requests.push({ createDeveloperMetadata: { developerMetadata: { metadataId: own.id, metadataKey: KEY, metadataValue: token, visibility: 'DOCUMENT', location: { dimensionRange: { sheetId: sheetId, dimension: dimension, startIndex: index, endIndex: index + 1 } } } } }); }
      entries.forEach(function (e) { anchor('R:' + e.token, e.sheetId, 'ROWS', e.row - 1); var own = { id: id(), description: KEY + ':' + nonce + ':' + e.token }; journal.protections.push(own); requests.push({ addProtectedRange: { protectedRange: { protectedRangeId: own.id, description: own.description, warningOnly: true, range: { sheetId: e.sheetId, startRowIndex: e.row - 1, endRowIndex: e.row, startColumnIndex: 0, endColumnIndex: e.cells.length } } } }); });
      Object.keys(WIDTH).forEach(function (name) { for (var c = 0; c < WIDTH[name]; c++) anchor('C:' + name + ':' + (c + 1), finalState.sheets[name].sheetId, 'COLUMNS', c); });
      props().setProperty(JOURNAL, JSON.stringify(journal));
      try {
        Sheets.Spreadsheets.batchUpdate({ requests: requests }, book.getId());
        var verified = check(snapshot, read(book));
        if (TemaCopy.version() !== version || verified.changes.length || JSON.stringify(verified.positions) !== JSON.stringify(entries.map(function (e) { return { name: e.name, row: e.row, width: e.cells.length }; }))) fail('HEADERS_CONCURRENT');
        book.getSheetByName('Disponibilités').hideColumns(10);
        SpreadsheetApp.flush(); props().setProperty(SNAPSHOT, JSON.stringify(snapshot)); props().deleteProperty(JOURNAL); props().setProperty('PRODUCTION_HEADERS_DIAGNOSTIC', '');
        return { headers: 7, anchored: true };
      } catch (error) { if (props().getProperty(SNAPSHOT) === null) { try { cleanup(book, journal); } catch (_) { /* Persist own-ID journal for safe retry, never erase other metadata. */ } } throw error; }
    });
  }
  function repairLocked(book) {
    TemaCopy.guard(book); var checkedAt = Date.now(), version = TemaCopy.version(), result = plan(book);
    if (TemaCopy.version() !== version) fail('HEADERS_CONCURRENT');
    if (!result.changes.length) { props().setProperty('PRODUCTION_HEADERS_DIAGNOSTIC', ''); props().setProperty(WORKER_AUDIT_AT, String(checkedAt + WORKER_AUDIT_INTERVAL)); return 0; }
    var current = plan(book);
    if (TemaCopy.version() !== version || current.stamp !== result.stamp) fail('HEADERS_CONCURRENT');
    Sheets.Spreadsheets.batchUpdate({ requests: result.changes.map(function (change) { return { updateCells: { start: { sheetId: change.sheetId, rowIndex: change.row - 1, columnIndex: change.column - 1 }, rows: [{ values: [{ userEnteredValue: { stringValue: change.after } }] }], fields: 'userEnteredValue' } }; }) }, book.getId());
    TemaCopy.dirty(true); props().setProperty('PRODUCTION_HEADERS_DIAGNOSTIC', ''); props().setProperty(WORKER_AUDIT_AT, String(checkedAt + WORKER_AUDIT_INTERVAL)); return result.changes.length;
  }
  function repair(book) { return TemaCopy.lock(function () { return repairLocked(book); }); }
  function repairForWorker() {
    TemaCopy.guard();
    var p = props(), now = Date.now(), audit = Number(p.getProperty(WORKER_AUDIT_AT) || 0), next = Number(p.getProperty('PRODUCTION_VIEW_NEXT_CHANGE_AT') || 0);
    // Timestamp only. Every public request and installed edit still calls
    // repair() directly; pending/dirty work is checked before the mail poll.
    var quiet = p.getProperty('PRODUCTION_ADMIN_MAINTENANCE_PENDING') !== '1' && p.getProperty('PRODUCTION_NATIVE_COUNTERS_PENDING') !== '1' && p.getProperty('PRODUCTION_VIEW_VERSION') === TemaCopy.version() && !p.getProperty('PRODUCTION_HEADERS_DIAGNOSTIC') && Number.isFinite(next) && next > now;
    if (quiet && Number.isSafeInteger(audit) && audit > now && audit <= now + WORKER_AUDIT_INTERVAL) return false;
    repair(TemaCopy.book()); return true;
  }
  return { capture: capture, plan: plan, repair: repair, repairLocked: repairLocked, repairForWorker: repairForWorker };
})();
function photographierEntetesProductionTema() { return TemaHeaders.capture(TemaCopy.book()); }
function diagnostiquerEntetesProductionTema() { return TemaCopy.lock(function () { var result = TemaHeaders.plan(TemaCopy.book()); return { headers: 7, cellsToRepair: result.changes.length }; }); }
