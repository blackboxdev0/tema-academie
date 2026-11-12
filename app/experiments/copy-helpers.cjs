'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const engine = require('../apps-script/engine.js');
const target = { spreadsheet: '10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8', script: '1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA' };
const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const local = ms => formatter.format(new Date(ms)).replace(' ', 'T');
const row = (n, values) => Object.assign(Array(n).fill(''), values);
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
  const tables = fixture(), formats = {}, events = [], messages = [], state = { source: false, user: false, now: Date.parse('2026-11-04T15:00:00Z'), script: target.script, owner: 'owner@example.invalid', opened: 0, calls: 0 };
  const pendingNative = new Map(), notes = {}, validations = {};
  const viewName = 'Suivi des inscriptions';
  if (options.view) {
    tables[viewName] = Array.from({ length: 250 }, () => Array(7).fill(''));
    tables[viewName][1][1] = 'Suivi des inscriptions';
    tables[viewName][9].splice(1, 5, 'Toutes les sessions', 'Tous les logiciels', 'Toutes les formations', 'Tous les statuts', '');
  }
  const properties = { ENVIRONMENT: 'COPY', SPREADSHEET_ID: target.spreadsheet, COPY_OWNER_EMAIL: 'owner@example.invalid', ALLOWED_RECIPIENTS_JSON: JSON.stringify(['participant@example.invalid', 'second@example.invalid', 'internal@example.invalid']), ...options.properties };
  let uuid = 0;
  const nextUuid = () => 'a0000000-0000-4000-8000-' + String(++uuid).padStart(12, '0');
  const sheets = {};
  for (const [name, values] of Object.entries(tables)) {
    formats[name] = values.map(r => r.map(() => 'General'));
    function range(r, c, nr = 1, nc = 1) {
      if (typeof r === 'string') {
        const parts = r.split(':'), start = parts[0].match(/^([A-Z]+)(\d+)$/), end = (parts[1] || parts[0]).match(/^([A-Z]+)(\d+)$/);
        const col = v => [...v].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
        r = Number(start[2]); c = col(start[1]); nr = Number(end[2]) - r + 1; nc = col(end[1]) - c + 1;
      }
      const mutating = (cosmetic = false) => { assert.ok(name === viewName ? state.user : cosmetic || state.source, 'Writes require their source or view lock'); if (name !== viewName && !pendingNative.has(name)) pendingNative.set(name, structuredClone(values)); events.push(['write', name, r, c]); };
      const a = { getSheet: () => sheets[name], getRow: () => r, getLastRow: () => r + nr - 1, getColumn: () => c, getLastColumn: () => c + nc - 1, getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => values[r + i - 1]?.[c + j - 1] ?? '')), getValue: () => values[r - 1]?.[c - 1] ?? '', getNumberFormats: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => formats[name][r + i - 1]?.[c + j - 1] || 'General')),
        setNumberFormat(f) { mutating(); for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) { formats[name][r + i - 1] ||= []; formats[name][r + i - 1][c + j - 1] = f; } return a; },
        setValues(matrix) { mutating(); matrix.forEach((line, i) => { values[r + i - 1] ||= Array(values[0].length).fill(''); line.forEach((v, j) => { values[r + i - 1][c + j - 1] = typeof v === 'string' && v[0] === "'" ? v.slice(1) : v; }); }); return a; }, setValue(v) { return a.setValues([[v]]); }, setNote(value) { mutating(true); notes[name + ':' + r + ':' + c] = value; return a; }, setNotes(matrix) { mutating(true); matrix.forEach((line, i) => line.forEach((v, j) => notes[name + ':' + (r + i) + ':' + (c + j)] = v)); return a; }, getNotes() { return Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => notes[name + ':' + (r + i) + ':' + (c + j)] || '')); }, getDataValidations() { return Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => validations[name + ':' + (r + i) + ':' + (c + j)] || null)); }, setDataValidations(matrix) { mutating(true); matrix.forEach((line, i) => line.forEach((v, j) => validations[name + ':' + (r + i) + ':' + (c + j)] = v)); return a; } };
      a.getNote = () => name === viewName && r === 2 && c === 2 ? 'TEMA_REGISTRATION_VIEW_V1' : notes[name + ':' + r + ':' + c] || '';
      a.clearContent = () => { mutating(); for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) { values[r + i - 1] ||= []; values[r + i - 1][c + j - 1] = ''; } return a; };
      a.clear = a.clearContent;
      for (const method of ['shiftRowGroupDepth', 'merge', 'breakApart', 'setFontFamily', 'setFontSize', 'setFontColor', 'setFontWeight', 'setBackground', 'setWrap', 'setVerticalAlignment', 'setBackgrounds', 'setFontColors', 'setFontWeights', 'setFontSizes', 'setDataValidation', 'clearDataValidations']) a[method] = () => { mutating(); return a; };
      return a;
    }
    sheets[name] = { getName: () => name, getLastRow: () => values.length, getLastColumn: () => values[0].length, getProtections: () => [], getMaxRows: () => 1000, getDataRange: () => { state.calls++; return range(1, 1, values.length, values[0].length); }, getRange: range,
      insertRowsAfter(r, n) { assert.ok(state.source); values.splice(r, 0, ...Array.from({ length: n }, () => Array(values[0].length).fill(''))); }, insertRowsBefore(r, n) { this.insertRowsAfter(r - 1, n); } };
    if (name === viewName) for (const method of ['hideColumns', 'showRows', 'hideRows', 'setRowHeights', 'setRowHeight']) sheets[name][method] = () => { assert.ok(state.user); events.push([method]); return sheets[name]; };
  }
  const book = { getId: () => target.spreadsheet, getSheetByName: name => sheets[name], toast: () => {} };
  const props = { getProperty: k => Object.prototype.hasOwnProperty.call(properties, k) ? properties[k] : null, setProperty(k, v) { assert.ok(state.source || k.startsWith('COPY_')); properties[k] = v; return props; } };
  const context = { module: { exports: {} }, TemaTrial: engine, TEMA_MAIL_LOGO_PNG: fs.readFileSync(__dirname + '/../web/assets/logo-tema.png').toString('base64'), Date: new Proxy(Date, { get: (t, k) => k === 'now' ? () => state.now : t[k] }),
    PropertiesService: { getScriptProperties: () => props }, ScriptApp: { getScriptId: () => state.script, AuthMode: { FULL: 'FULL' }, requireAllScopes: () => {} }, Session: { getEffectiveUser: () => ({ getEmail: () => state.owner }) },
    LockService: { getScriptLock: () => ({ tryLock() { if (options.busy || state.source) return false; state.source = true; events.push(['source-lock']); return true; }, releaseLock() { state.source = false; events.push(['source-unlock']); } }), getUserLock: () => ({ tryLock() { if (state.user) return false; state.user = true; return true; }, releaseLock() { state.user = false; } }) },
    SpreadsheetApp: { ProtectionType: { SHEET: 'sheet' }, getActiveSpreadsheet: () => book, openById(id) { assert.equal(id, target.spreadsheet); state.opened++; return book; }, flush() { pendingNative.clear(); }, newDataValidation: () => ({ choices: [], display: true, allowInvalid: true, requireValueInList(choices, display) { this.choices = [...choices]; this.display = display; return this; }, setAllowInvalid(value) { this.allowInvalid = value; return this; }, build() { const { choices, display, allowInvalid } = this; return { getCriteriaType: () => 'VALUE_IN_LIST', getCriteriaValues: () => [choices, display], getAllowInvalid: () => allowInvalid }; } }) },
    Utilities: { getUuid: nextUuid, formatDate(date, zone, pattern) { const t = local(date); return pattern === 'yyyy-MM-dd' ? t.slice(0, 10) : pattern === 'HH:mm' ? t.slice(11, 16) : t; }, computeDigest: (algorithm, v) => [...crypto.createHash('sha256').update(v).digest()], DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' }, base64Decode: value => [...Buffer.from(value, 'base64')], newBlob: (value, contentType, name) => typeof value === 'string' ? value : { bytes: value, contentType, name } },
    MailApp: { getRemainingDailyQuota: () => options.quota ?? 100, sendEmail(message) { assert.equal(state.source, false, 'No source lock during external mail call'); if (options.failMail) throw Error('fixture-mail-failure'); messages.push(message); } },
    ContentService: { MimeType: { JSON: 'JSON' }, createTextOutput(value) { return { value, setMimeType() { return this; } }; } }
  };
  vm.runInNewContext(fs.readFileSync(__dirname + '/copy-config.gs', 'utf8'), context);
  // Private fixture recipients are injected only in this sandbox; no sheet fallback.
  const config = context.TemaCopyConfig.read;
  context.TemaCopyConfig = { read: () => Object.assign(config(), { admissions_mode: 'restricted', courriel_contact: 'contact@example.invalid', courriel_avis_tema: 'internal@example.invalid' }, options.config) };
  vm.runInNewContext(fs.readFileSync(__dirname + '/copy-backend.gs', 'utf8'), context);
  const copy = context.TemaCopy;
  function apiValues(name, settings) {
    const unformatted = settings && settings.valueRenderOption === 'UNFORMATTED_VALUE';
    return structuredClone(pendingNative.get(name) || tables[name]).map(line => line.map(v => {
      if (!(v instanceof Date)) return typeof v === 'number' && !unformatted ? String(v) : v;
      const civil = local(v) + ':' + String(v.getUTCSeconds()).padStart(2, '0') + '.' + String(v.getUTCMilliseconds()).padStart(3, '0');
      return unformatted && settings.dateTimeRenderOption === 'SERIAL_NUMBER' ? (Date.parse(civil + 'Z') - Date.UTC(1899, 11, 30)) / 86400000 : civil;
    }));
  }
  context.Sheets = { Spreadsheets: { Values: {
    get(id, range, settings) { assert.equal(id, target.spreadsheet); assert.equal(range, "'Inscriptions'"); return { values: apiValues('Inscriptions', settings) }; },
    batchGet(id, settings) { assert.equal(id, target.spreadsheet); assert.deepEqual(Array.from(settings.ranges), ["'Formations'", "'Disponibilités'", "'Inscriptions'"]); return { valueRanges: settings.ranges.map(n => ({ values: apiValues(n.slice(1, -1), settings) })) }; }
  }, get(id) { assert.equal(id, target.spreadsheet); return { sheets: [{ properties: { title: 'Disponibilités' }, data: [{ startRow: 0, rowData: formats['Disponibilités'].map(line => ({ values: line.map(f => ({ effectiveFormat: { numberFormat: { type: f.includes('y') ? 'DATE' : f.includes('h') ? 'TIME' : 'NUMBER' } } })) })) }] }] }; } } };
  const deps = copy.dependencies(), service = engine.createService(deps);
  function command(extra = {}) { const s = service.catalogue().sessions.find(s => s.id_cohorte === 'C-COPY-FIXTURE-1'); return Object.assign({ schema_version: 1, request_id: nextUuid(), id_cohorte: s.id_cohorte, session_revision: s.session_revision, prenom: 'ESSAI COPY', nom: 'Fictif', entreprise: 'Fixture COPY', courriel: 'participant@example.invalid', telephone: null, consentement: true, politique_version: context.TemaCopyConfig.read().politique_version, anti_spam: { honeypot: '', form_started_at: new Date(state.now - 2000).toISOString() } }, extra); }
  function loadAdmin() { for (const f of ['admin-sheet-prototype.gs', 'admin-sheet-actions.gs', 'admin-sheet-registrations.gs', 'admin-registration-actions.gs']) vm.runInNewContext(fs.readFileSync(__dirname + '/' + f, 'utf8'), context); }
  return { copy, tables, formats, properties, events, messages, state, context, service, deps, command, book, sheets, nextUuid, loadAdmin };
}
module.exports = { harness, engine, target, local, formHeader, sessionHeader };
