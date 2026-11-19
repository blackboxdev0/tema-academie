'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const engine = require('../apps-script/engine.js');
const target = { spreadsheet: '10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8', script: '1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA' };
const productionTarget = { spreadsheet: 'production_fixture_spreadsheet_01', script: 'production_fixture_script_00001' };
const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const local = ms => formatter.format(new Date(ms)).replace(' ', 'T');
const row = (n, values) => Object.assign(Array(n).fill(''), values);
const columnA1 = value => { let label = ''; for (; value > 0; value = Math.floor((value - 1) / 26)) label = String.fromCharCode(65 + (value - 1) % 26) + label; return label; };
const formHeader = name => ['Identifiant', 'Logiciel', name + ' — Formation', 'Description', 'Prérequis', 'Programme', 'Résultats attendus', 'Durée', 'Tarif ($ CAD)', 'Qualificatif du tarif', 'Capacité par défaut', 'Formateurs', 'Publiée'];
const sessionHeader = name => ['Identifiant', name + ' — Formation', 'Date', 'Début', 'Fin', 'Capacité', 'Format', 'Lieu ou lien', 'Inscriptions ouvertes', 'Places restantes', 'Contrôle', 'Colonne 1'];
function fixture() {
  return {
    Formations: [formHeader('Divalto'), row(13, { 0: 'DIV-COPY-FIXTURE', 1: 'DIV — Divalto', 2: 'ESSAI COPY — formation', 7: '1 jour', 8: 450, 10: 8, 12: true }), row(13), formHeader('Dimo'), row(13, { 0: 'DIMO-COPY-FIXTURE', 1: 'DIMO — Dimo', 2: 'ESSAI COPY — été', 7: '1 jour', 8: 0, 12: true }), row(13), formHeader('MoovApps')],
    'Disponibilités': [sessionHeader('Divalto'), row(12, { 0: 'C-COPY-FIXTURE-1', 1: 'DIV-COPY-FIXTURE — ESSAI COPY — formation', 2: '2030-01-15', 3: '09:00', 4: '12:00', 5: 1, 6: 'en_ligne', 7: '', 8: true, 9: 1 }), row(12), sessionHeader('Dimo'), row(12, { 0: 'C-COPY-FIXTURE-2', 1: 'DIMO-COPY-FIXTURE — ESSAI COPY — été', 2: '2030-07-15', 3: '09:30', 4: '12:00', 5: 8, 6: 'presentiel', 7: 'Lieu fictif COPY', 8: true, 9: 8 }), row(12), sessionHeader('MoovApps')],
    Inscriptions: [engine.HEADERS.Inscriptions.slice()]
  };
}
function harness(options = {}) {
  const activeTarget = options.production ? productionTarget : target;
  const adapt = source => options.production ? require('./build-production-backend.cjs').adapt(source, { spreadsheetId: activeTarget.spreadsheet, scriptId: activeTarget.script }) : source;
  const tables = fixture(), formats = {}, events = [], messages = [], state = { source: false, user: false, now: Date.parse('2026-11-04T15:00:00Z'), script: activeTarget.script, owner: 'owner@example.invalid', opened: 0, calls: 0, quota: options.quota ?? 100 };
  const pendingNative = new Map(), notes = {}, validations = {};
  const viewName = 'Suivi des inscriptions';
  if (options.nativeForm) {
    tables['Nouvelle formation'] = Array.from({ length: 70 }, () => Array(12).fill(''));
    tables['Nouvelle formation'][0][10] = 'TEMA_NATIVE_FORM_V2'; tables['Nouvelle formation'][1][10] = 'native-request'; tables['Nouvelle formation'][2][10] = 'DRAFT';
  }
  if (options.view) {
    tables[viewName] = Array.from({ length: 250 }, () => Array(7).fill(''));
    tables[viewName][1][1] = 'Suivi des inscriptions';
    tables[viewName][9].splice(1, 5, 'Toutes les sessions', 'Tous les logiciels', 'Toutes les formations', 'Tous les statuts', '');
  }
  const properties = { ENVIRONMENT: options.production ? 'PRODUCTION' : 'COPY', SPREADSHEET_ID: activeTarget.spreadsheet, [options.production ? 'PRODUCTION_OWNER_EMAIL' : 'COPY_OWNER_EMAIL']: 'owner@example.invalid', ALLOWED_RECIPIENTS_JSON: JSON.stringify(['participant@example.invalid', 'second@example.invalid', 'internal@example.invalid']), ...options.properties };
  let uuid = 0;
  const nextUuid = () => 'a0000000-0000-4000-8000-' + String(++uuid).padStart(12, '0');
  const sheets = {}, metadata = [], protections = [];
  for (const [name, values] of Object.entries(tables)) {
    formats[name] = values.map(r => r.map(() => 'General'));
    function range(r, c, nr = 1, nc = 1) {
      let dimensionRange = null;
      if (typeof r === 'string') {
        const col = v => [...v].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
        const rowDimension = r.match(/^(\d+):(\d+)$/), columnDimension = r.match(/^([A-Z]+):([A-Z]+)$/);
        if (rowDimension) { r = Number(rowDimension[1]); c = 1; nr = Number(rowDimension[2]) - r + 1; nc = sheets[name].getMaxColumns(); dimensionRange = 'row'; }
        else if (columnDimension) { r = 1; c = col(columnDimension[1]); nr = sheets[name].getMaxRows(); nc = col(columnDimension[2]) - c + 1; dimensionRange = 'column'; }
        else {
          const parts = r.split(':'), start = parts[0].match(/^([A-Z]+)(\d+)$/), end = (parts[1] || parts[0]).match(/^([A-Z]+)(\d+)$/);
          r = Number(start[2]); c = col(start[1]); nr = Number(end[2]) - r + 1; nc = col(end[1]) - c + 1;
        }
      }
      const mutating = (cosmetic = false) => { assert.ok(name === viewName ? state.user : cosmetic || state.source || name === 'Nouvelle formation' && state.document, 'Writes require their source or view lock'); if (name !== viewName && !pendingNative.has(name)) pendingNative.set(name, structuredClone(values)); events.push(['write', name, r, c]); };
      const a = { getSheet: () => sheets[name], getRow: () => r, getLastRow: () => r + nr - 1, getColumn: () => c, getLastColumn: () => c + nc - 1, getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => values[r + i - 1]?.[c + j - 1] ?? '')), getValue: () => values[r - 1]?.[c - 1] ?? '', getNumberFormats: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => formats[name][r + i - 1]?.[c + j - 1] || 'General')),
        setNumberFormat(f) { mutating(); for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) { formats[name][r + i - 1] ||= []; formats[name][r + i - 1][c + j - 1] = f; } return a; },
        setValues(matrix) { mutating(); matrix.forEach((line, i) => { values[r + i - 1] ||= Array(values[0].length).fill(''); line.forEach((v, j) => { values[r + i - 1][c + j - 1] = typeof v === 'string' && v[0] === "'" ? v.slice(1) : v; }); }); return a; }, setValue(v) { return a.setValues([[v]]); }, setNote(value) { mutating(true); notes[name + ':' + r + ':' + c] = value; return a; }, setNotes(matrix) { mutating(true); matrix.forEach((line, i) => line.forEach((v, j) => notes[name + ':' + (r + i) + ':' + (c + j)] = v)); return a; }, getNotes() { return Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => notes[name + ':' + (r + i) + ':' + (c + j)] || '')); }, getDataValidations() { return Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => validations[name + ':' + (r + i) + ':' + (c + j)] || null)); }, setDataValidations(matrix) { mutating(true); matrix.forEach((line, i) => line.forEach((v, j) => validations[name + ':' + (r + i) + ':' + (c + j)] = v)); return a; } };
      a.getNote = () => name === viewName && r === 2 && c === 2 ? 'TEMA_REGISTRATION_VIEW_V1' : notes[name + ':' + r + ':' + c] || '';
      a.getNumRows = () => nr; a.getNumColumns = () => nc;
      a.getA1Notation = () => columnA1(c) + r + (nr > 1 || nc > 1 ? ':' + columnA1(c + nc - 1) + (r + nr - 1) : '');
      a.getBackground = () => '#ffffff';
      a.addDeveloperMetadata = (key, value) => {
        assert.ok(state.source);
        if (!(dimensionRange === 'row' && nr === 1 || dimensionRange === 'column' && nc === 1)) throw new Error('Adding developer metadata to arbitrary ranges is not currently supported. The range must be an entire row or column.');
        metadata.push({ id: metadata.length + 100, key, value, name, dimension: dimensionRange, position: dimensionRange === 'row' ? r : c }); return a;
      };
      a.protect = () => { assert.ok(state.source); const protection = { setDescription() { return protection; }, setWarningOnly(value) { events.push(['warning-protection', name, r, value]); return protection; } }; return protection; };
      a.clearContent = () => { mutating(); for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) { values[r + i - 1] ||= []; values[r + i - 1][c + j - 1] = ''; } return a; };
      a.clear = a.clearContent;
      for (const method of ['shiftRowGroupDepth', 'merge', 'breakApart', 'setFontFamily', 'setFontSize', 'setFontColor', 'setFontWeight', 'setBackground', 'setWrap', 'setVerticalAlignment', 'setBackgrounds', 'setFontColors', 'setFontWeights', 'setFontSizes', 'setDataValidation', 'clearDataValidations', 'insertCheckboxes']) a[method] = () => { mutating(); return a; };
      return a;
    }
    sheets[name] = { getName: () => name, getSheetId: () => Object.keys(tables).indexOf(name) + 1, getLastRow: () => values.length, getLastColumn: () => values[0].length, getMaxColumns: () => values[0].length, getProtections: () => [], getMaxRows: () => 1000, getDataRange: () => { state.calls++; return range(1, 1, values.length, values[0].length); }, getRange: range,
      hideColumns(c) { assert.ok(state.source); events.push(['hide-column', name, c]); },
      insertRowsAfter(r, n) { assert.ok(state.source); values.splice(r, 0, ...Array.from({ length: n }, () => Array(values[0].length).fill(''))); metadata.filter(m => m.name === name && m.dimension === 'row' && m.position > r).forEach(m => m.position += n); }, insertRowsBefore(r, n) { this.insertRowsAfter(r - 1, n); },
      deleteRows(r, n) { assert.ok(state.source); values.splice(r - 1, n); for (let i = metadata.length - 1; i >= 0; i--) { const m = metadata[i]; if (m.name === name && m.dimension === 'row') { if (m.position >= r && m.position < r + n) metadata.splice(i, 1); else if (m.position >= r + n) m.position -= n; } } } };
    if (name === viewName) for (const method of ['hideColumns', 'showRows', 'hideRows', 'setRowHeights', 'setRowHeight']) sheets[name][method] = () => { assert.ok(state.user); events.push([method]); return sheets[name]; };
    if (name === 'Nouvelle formation') {
      const images = [], protection = { getDescription: () => 'Prototype : présentation et état de la saisie', setUnprotectedRanges(ranges) { state.nativeUnprotected = ranges.map(r => r.getA1Notation()); return protection; }, setWarningOnly() { throw Error('Operational native state must remain protected'); }, addEditor() { state.nativeOwnerRetained = true; }, getEditors: () => [], removeEditors() {}, canDomainEdit: () => false };
      Object.assign(sheets[name], { getProtections: () => [protection], getImages: () => images, insertImage(blob) { const data = { title: '', script: '', blob }; const image = { getAltTextTitle: () => data.title, getScript: () => data.script, setAltTextTitle(v) { data.title = v; return image; }, assignScript(v) { data.script = v; return image; } }; for (const method of ['setAltTextDescription', 'setWidth', 'setHeight', 'setAnchorCell']) image[method] = () => image; images.push(image); return image; }, setRowHeights() {}, setRowHeight() {}, hideRows() {} });
    }
  }
  const book = { getId: () => activeTarget.spreadsheet, getSheetByName: name => sheets[name], getActiveSheet: () => sheets['Nouvelle formation'], toast: () => {}, createDeveloperMetadataFinder: () => ({ withKey(key) { this.key = key; return this; }, find() { return metadata.filter(m => m.key === this.key).map(m => ({ getValue: () => m.value, getLocation: () => ({ getRow: () => m.dimension === 'row' ? sheets[m.name].getRange(m.position + ':' + m.position) : null, getColumn: () => m.dimension === 'column' ? sheets[m.name].getRange(columnA1(m.position) + ':' + columnA1(m.position)) : null }) })); } }) };
  const props = { getProperties() { events.push(['properties-snapshot']); return { ...properties }; }, getProperty: k => Object.prototype.hasOwnProperty.call(properties, k) ? properties[k] : null, setProperty(k, v) { assert.ok(state.source || k.startsWith('COPY_') || k.startsWith('PRODUCTION_')); properties[k] = v; return props; }, deleteProperty(k) { delete properties[k]; return props; } };
  const context = { module: { exports: {} }, TemaTrial: engine, TEMA_MAIL_LOGO_PNG: fs.readFileSync(__dirname + '/../web/assets/logo-tema.png').toString('base64'), Date: new Proxy(Date, { get: (t, k) => k === 'now' ? () => state.now : t[k] }),
    PropertiesService: { getScriptProperties: () => props }, ScriptApp: { getScriptId: () => state.script, AuthMode: { FULL: 'FULL' }, requireAllScopes: () => {} }, Session: { getEffectiveUser: () => ({ getEmail: () => state.owner }) },
    LockService: { getDocumentLock: () => ({ tryLock() { if (state.document) return false; state.document = true; return true; }, releaseLock() { state.document = false; } }), getScriptLock: () => ({ tryLock() { if (options.busy || state.source) return false; state.source = true; events.push(['source-lock']); return true; }, releaseLock() { state.source = false; events.push(['source-unlock']); } }), getUserLock: () => ({ tryLock() { if (state.user) return false; state.user = true; return true; }, releaseLock() { state.user = false; } }) },
    SpreadsheetApp: { DeveloperMetadataVisibility: { DOCUMENT: 'DOCUMENT' }, ProtectionType: { SHEET: 'sheet' }, getActiveSpreadsheet: () => book, openById(id) { assert.equal(id, activeTarget.spreadsheet); state.opened++; return book; }, flush() { pendingNative.clear(); }, newDataValidation: () => ({ choices: [], display: true, allowInvalid: true, requireValueInList(choices, display) { this.choices = [...choices]; this.display = display; return this; }, setAllowInvalid(value) { this.allowInvalid = value; return this; }, build() { const { choices, display, allowInvalid } = this; return { getCriteriaType: () => 'VALUE_IN_LIST', getCriteriaValues: () => [choices, display], getAllowInvalid: () => allowInvalid }; } }) },
    Utilities: { getUuid: nextUuid, formatDate(date, zone, pattern) { const t = local(date); return pattern === 'yyyy-MM-dd' ? t.slice(0, 10) : pattern === 'HH:mm' ? t.slice(11, 16) : t; }, computeDigest: (algorithm, v) => [...crypto.createHash('sha256').update(v).digest()], DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' }, base64Decode: value => [...Buffer.from(value, 'base64')], newBlob: (value, contentType, name) => typeof value === 'string' ? value : { bytes: value, contentType, name } },
    MailApp: { getRemainingDailyQuota: () => state.quota, sendEmail(message) { assert.equal(state.source, false, 'No source lock during external mail call'); if (options.failMail) throw Error('fixture-mail-failure'); messages.push(message); if (options.production) state.quota--; } },
    ContentService: { MimeType: { JSON: 'JSON' }, createTextOutput(value) { return { value, setMimeType() { return this; } }; } }
  };
  vm.runInNewContext(fs.readFileSync(__dirname + (options.production ? '/production-config.gs' : '/copy-config.gs'), 'utf8'), context);
  // Private fixture recipients are injected only in this sandbox; no sheet fallback.
  const config = context.TemaCopyConfig.read;
  context.TemaCopyConfig = { read: () => Object.assign(config(), { admissions_mode: 'restricted', courriel_contact: 'contact@example.invalid', courriel_avis_tema: 'internal@example.invalid' }, options.config) };
  if (options.production) for (const name of ['production-mail.gs', 'production-headers.gs']) vm.runInNewContext(fs.readFileSync(__dirname + '/' + name, 'utf8'), context);
  vm.runInNewContext(adapt(fs.readFileSync(__dirname + '/copy-backend.gs', 'utf8')), context);
  const copy = context.TemaCopy;
  function apiValues(name, settings) {
    const unformatted = settings && settings.valueRenderOption === 'UNFORMATTED_VALUE';
    return structuredClone(pendingNative.get(name) || tables[name]).map(line => line.map(v => {
      if (!(v instanceof Date)) return typeof v === 'number' && !unformatted ? String(v) : v;
      const civil = local(v) + ':' + String(v.getUTCSeconds()).padStart(2, '0') + '.' + String(v.getUTCMilliseconds()).padStart(3, '0');
      return unformatted && settings.dateTimeRenderOption === 'SERIAL_NUMBER' ? (Date.parse(civil + 'Z') - Date.UTC(1899, 11, 30)) / 86400000 : civil;
    }));
  }
  context.Sheets = { Spreadsheets: {
    DeveloperMetadata: { search(body, id) {
      assert.equal(id, activeTarget.spreadsheet); events.push(['api-metadata']);
      const key = body.dataFilters[0].developerMetadataLookup.metadataKey;
      return { matchedDeveloperMetadata: metadata.filter(m => m.key === key).map(m => ({ developerMetadata: { metadataId: m.id, metadataKey: m.key, metadataValue: m.value, visibility: 'DOCUMENT', location: { dimensionRange: { sheetId: sheets[m.name].getSheetId(), dimension: m.dimension === 'row' ? 'ROWS' : 'COLUMNS', ...(m.position > 1 ? { startIndex: m.position - 1 } : {}), endIndex: m.position }, locationType: m.dimension === 'row' ? 'ROW' : 'COLUMN' } } })) };
    } },
    Values: {
      get(id, range, settings) { assert.equal(id, activeTarget.spreadsheet); assert.equal(range, "'Inscriptions'"); return { values: apiValues('Inscriptions', settings) }; },
      batchGet(id, settings) {
        assert.equal(id, activeTarget.spreadsheet); if (options.production) events.push(['api-values', Array.from(settings.ranges)]);
        return { valueRanges: settings.ranges.map(n => {
          const match = n.match(/^'([^']+)'(?:!A1:([A-Z]+)([0-9]+))?$/); assert.ok(match, 'Explicit source range required');
          if (match[2]) { assert.equal(match[2], ({ Formations: 'M', 'Disponibilités': 'L', Inscriptions: 'AC' })[match[1]]); assert.equal(Number(match[3]), sheets[match[1]].getMaxRows()); }
          return { values: apiValues(match[1], settings) };
        }) };
      }
    },
    get(id, settings = {}) {
      assert.equal(id, activeTarget.spreadsheet);
      if (settings.fields && settings.fields.startsWith('developerMetadata')) {
        events.push(['api-properties']);
        return { sheets: Object.keys(sheets).map(name => ({ properties: { sheetId: sheets[name].getSheetId(), title: name, gridProperties: { rowCount: sheets[name].getMaxRows(), columnCount: sheets[name].getMaxColumns() } }, developerMetadata: metadata.filter(m => m.name === name).map(m => ({ metadataId: m.id })), protectedRanges: protections.filter(p => p.range.sheetId === sheets[name].getSheetId()) })) };
      }
      return { sheets: [{ properties: { title: 'Disponibilités' }, data: [{ startRow: 0, rowData: formats['Disponibilités'].map(line => ({ values: line.map(f => ({ effectiveFormat: { numberFormat: { type: f.includes('y') ? 'DATE' : f.includes('h') ? 'TIME' : 'NUMBER' } } })) })) }] }] };
    },
    batchUpdate(body, id) {
      assert.equal(id, activeTarget.spreadsheet); assert.ok(state.source); events.push(['api-update', body.requests.length]);
      const replies = [];
      for (const request of body.requests) {
        if (request.createDeveloperMetadata) {
          const m = request.createDeveloperMetadata.developerMetadata, d = m.location.dimensionRange;
          const name = Object.keys(sheets).find(name => sheets[name].getSheetId() === d.sheetId);
          metadata.push({ id: m.metadataId, key: m.metadataKey, value: m.metadataValue, name, dimension: d.dimension === 'ROWS' ? 'row' : 'column', position: (d.startIndex || 0) + 1 }); replies.push({ createDeveloperMetadata: { developerMetadata: m } });
        } else if (request.addProtectedRange) {
          const p = request.addProtectedRange.protectedRange; protections.push(structuredClone(p)); const name = Object.keys(sheets).find(name => sheets[name].getSheetId() === p.range.sheetId); events.push(['warning-protection', name, p.range.startRowIndex + 1, p.warningOnly]); replies.push({ addProtectedRange: { protectedRange: p } });
        } else if (request.deleteDeveloperMetadata) {
          const id = request.deleteDeveloperMetadata.dataFilter.developerMetadataLookup.metadataId;
          for (let i = metadata.length - 1; i >= 0; i--) if (metadata[i].id === id) metadata.splice(i, 1);
        } else if (request.deleteProtectedRange) {
          const i = protections.findIndex(p => p.protectedRangeId === request.deleteProtectedRange.protectedRangeId); if (i >= 0) protections.splice(i, 1);
        } else if (request.updateCells) {
          const u = request.updateCells, name = Object.keys(sheets).find(name => sheets[name].getSheetId() === u.start.sheetId);
          assert.equal(u.fields, 'userEnteredValue');
          tables[name][u.start.rowIndex][u.start.columnIndex] = u.rows[0].values[0].userEnteredValue.stringValue; events.push(['write', name, u.start.rowIndex + 1, u.start.columnIndex + 1]);
        } else assert.fail('Unsupported provider mutation');
      }
      return { replies };
    }
  } };
  const deps = copy.dependencies(), service = engine.createService(deps);
  function command(extra = {}) { const s = service.catalogue().sessions.find(s => s.id_cohorte === 'C-COPY-FIXTURE-1'); return Object.assign({ schema_version: 1, request_id: nextUuid(), id_cohorte: s.id_cohorte, session_revision: s.session_revision, prenom: 'ESSAI COPY', nom: 'Fictif', entreprise: 'Fixture COPY', courriel: 'participant@example.invalid', telephone: null, consentement: true, politique_version: context.TemaCopyConfig.read().politique_version, anti_spam: { honeypot: '', form_started_at: new Date(state.now - 2000).toISOString() } }, extra); }
  function loadAdmin() { for (const f of ['admin-sheet-prototype.gs', 'admin-sheet-actions.gs', 'admin-sheet-registrations.gs', 'admin-registration-actions.gs', ...(options.production ? ['admin-native-form.gs'] : [])]) vm.runInNewContext(adapt(fs.readFileSync(__dirname + '/' + f, 'utf8')), context); }
  return { copy, tables, formats, properties, events, messages, state, context, service, deps, command, book, sheets, nextUuid, loadAdmin, metadata, protections };
}
module.exports = { harness, engine, target, local, formHeader, sessionHeader };
