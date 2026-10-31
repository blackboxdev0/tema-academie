const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { TemaTrial, fixture, formatLocal, harness } = require('./helpers.cjs');

function googleContext(empty = false, options = {}) {
  const data = fixture(), sent = [], events = [], validations = [], logs = [], mutations = [];
  const values = Object.fromEntries(Object.entries(TemaTrial.HEADERS).map(([name, headers]) => [name, [headers.slice(), ...(empty ? [] : (name === 'Formations' ? data.formations : name === 'Disponibilités' ? data.sessions : data.registrations).map(row => headers.map(key => row[key] ?? '')))]]));
  values['Paramètres'] = [['cle', 'valeur', 'description', '', 'id', 'label', 'choix'],
    ['courriel_contact', data.params.courriel_contact, 'Public', '', 'DIV', 'Divalto', 'DIV — Divalto'],
    ['courriel_avis_tema', data.params.courriel_avis_tema, 'Interne', '', 'DIMO', 'Dimo', 'DIMO — Dimo'],
    ['nom_expediteur', 'Tema TEST', '', '', 'MOOV', 'MoovApps', 'MOOV — MoovApps'],
    ['politique_url', data.params.politique_url, 'Document', '', '', '', ''],
    ['politique_version', data.params.politique_version, 'Version', '', '', '', '']];
  class Range {
    constructor(tab, row, col, height = 1, width = 1) { if (row < 1 || height < 1 || row + height - 1 > tab.maxRows) throw Error('range exceeds grid'); Object.assign(this, { tab, row, col, height, width }); }
    getValues() { return Array.from({ length: this.height }, (_, i) => Array.from({ length: this.width }, (_, j) => this.tab.values[this.row + i - 1]?.[this.col + j - 1] ?? '')); }
    setValues(rows) { mutations.push({ kind: 'values', sheet: this.tab.name }); for (let i = 0; i < rows.length; i++) for (let j = 0; j < rows[i].length; j++) { const r = this.row + i - 1; this.tab.values[r] ||= []; const value = rows[i][j], format = this.tab.formats.get(`${this.row + i}:${this.col + j}`); this.tab.values[r][this.col + j - 1] = format === '@' && typeof value === 'boolean' ? String(value) : value; } return this; }
    setValue(v) { return this.setValues([[v]]); }
    setNumberFormat(format) { for (let i = 0; i < this.height; i++) for (let j = 0; j < this.width; j++) this.tab.formats.set(`${this.row + i}:${this.col + j}`, format); return this; }
    getNumberFormat() { return this.tab.formats.get(`${this.row}:${this.col}`) || 'General'; }
    setFontWeight() { return this; }
    getSheet() { return this.tab; } getRow() { return this.row; } getColumn() { return this.col; }
    getNotes() { return Array.from({ length: this.height }, (_, i) => Array.from({ length: this.width }, (_, j) => this.tab.notes.get(`${this.row + i}:${this.col + j}`) || '')); }
    setNotes(notes) { mutations.push({ kind: 'notes', sheet: this.tab.name }); for (let i = 0; i < notes.length; i++) for (let j = 0; j < notes[i].length; j++) this.tab.notes.set(`${this.row + i}:${this.col + j}`, notes[i][j]); return this; }
    setDataValidation(rule) { mutations.push({ kind: 'dropdown', sheet: this.tab.name }); validations.push({ name: this.tab.name, column: this.col, rule }); return this; }
    clearDataValidations() { mutations.push({ kind: 'dropdown', sheet: this.tab.name }); validations.push({ name: this.tab.name, column: this.col, rule: null }); return this; }
    insertCheckboxes() { events.push('checkboxes'); for (let i = 0; i < this.height; i++) this.tab.getRange(this.row + i, this.col).setValue(false); return this; }
    protect() { const protection = { range: this, description: '', warning: false, getRange() { return this.range; }, setRange(range) { this.range = range; return this; }, getDescription() { return this.description; }, setDescription(value) { this.description = value; return this; }, setWarningOnly(value) { this.warning = value; return this; } }; this.tab.protections.push(protection); return protection; }
  }
  class Tab {
    constructor(name, rows) { this.name = name; this.values = rows; this.formats = new Map(); this.notes = new Map(); this.protections = []; this.maxRows = Math.max(100, rows.length); }
    getRange(...args) { return new Range(this, ...args); }
    getLastColumn() { return this.values[0].length; }
    getLastRow() { return Math.max(1, this.values.findLastIndex(line => line.some(v => v !== '' && v !== null)) + 1); }
    getMaxRows() { return this.maxRows; }
    insertRowsAfter(after, count) { assert.equal(after, this.maxRows); this.maxRows += count; mutations.push({ kind: 'insertRows', sheet: this.name, count }); }
    getDataRange() { return this.getRange(1, 1, this.getLastRow(), this.getLastColumn()); }
    getProtections() { return this.protections; }
  }
  const tabs = Object.fromEntries(Object.entries(values).map(([name, rows]) => [name, new Tab(name, rows)]));
  const properties = new Map([['ENVIRONMENT', 'TEST'], ['SPREADSHEET_ID', '1Zq8s1Jwd4NgpbMIed35W0LJIsUpJ-JPt19BZK89yM3c'], ['ALLOWED_RECIPIENTS_JSON', JSON.stringify(['participant@example.invalid', 'internal@example.invalid'])], ['CONTACT_EMAIL', data.params.courriel_contact], ['TEMA_EMAIL', data.params.courriel_avis_tema]]);
  let quota = 100, acquire = true;
  const spreadsheet = { getSheetByName: name => tabs[name], getId: () => properties.get('SPREADSHEET_ID') };
  const context = vm.createContext({
    console: { log: value => logs.push(value) }, Date, JSON, Object, Array, String, Number, Boolean, Math, Error, RegExp, unescape, encodeURIComponent,
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => properties.get(k) ?? null, setProperty: (k, v) => properties.set(k, v) }) },
    ScriptApp: { getScriptId: () => '1cQXjhw60iKv9n3P4EcLcgsbWBgWmlj47EFUGM5wqJgXDAQqajC5M0k_x', getProjectTriggers: () => [] },
    SpreadsheetApp: { ProtectionType: { RANGE: 'RANGE' }, openById: id => { assert.equal(id, properties.get('SPREADSHEET_ID')); events.push('open'); return spreadsheet; }, flush: () => events.push('flush'), newDataValidation: () => ({ requireValueInList(choices) { this.choices = choices; return this; }, setAllowInvalid() { return this; }, build() { return this; } }) },
    LockService: { getScriptLock: () => ({ tryLock: () => { events.push('tryLock'); return acquire; }, releaseLock: () => events.push('releaseLock') }) },
    MailApp: { getRemainingDailyQuota: () => quota, sendEmail: options => sent.push(options) },
    Utilities: { getUuid: () => crypto.randomUUID(), formatDate: (date, zone, pattern) => { const t = formatLocal(date.getTime()); return pattern === 'yyyy-MM-dd' ? t.slice(0, 10) : pattern === 'HH:mm' ? t.slice(11) : t; }, computeDigest: (algorithm, str) => [...crypto.createHash('sha256').update(str).digest()].map(n => n > 127 ? n - 256 : n), DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' }, newBlob: (content, type, name) => ({ content, type, name }) },
    ContentService: { createTextOutput: str => ({ text: str, setMimeType() { return this; } }), MimeType: { JSON: 'application/json' } }
  });
  const scripts = options.bundlePath ? [options.bundlePath] : ['engine.js', 'google.js'].map(name => path.join(__dirname, '..', 'apps-script', name));
  for (const file of scripts) vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return { context, properties, tabs, sent, events, validations, logs, mutations, setQuota: n => { quota = n; }, setAcquire: v => { acquire = v; } };
}
module.exports = { googleContext };
