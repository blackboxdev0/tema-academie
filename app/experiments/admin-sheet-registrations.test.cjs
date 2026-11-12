'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { module: { exports: {} } };
for (const name of ['admin-sheet-prototype.gs', 'admin-sheet-actions.gs', 'admin-sheet-registrations.gs']) vm.runInNewContext(fs.readFileSync(__dirname + '/' + name, 'utf8'), context);
const view = context.module.exports;
const row = (width, values = {}) => Object.assign(Array(width).fill(''), values);
const head = (width, column, name) => row(width, { [column]: name + ' — Formation' });
const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const deps = { now: () => Date.parse('2026-11-04T12:00:00Z'), formatLocal: ms => formatter.format(new Date(ms)).replace(' ', 'T'), cellText: (value, kind) => value instanceof Date ? formatter.format(value).slice(kind === 'date' ? 0 : 11, kind === 'date' ? 10 : 16) : String(value ?? '').trim() };
const all = ['Toutes les sessions', 'Tous les logiciels', 'Toutes les formations', 'Tous les statuts', ''];
function registration(id, cohort, extra = {}) {
  const p = { id_inscription: id, id_cohorte: cohort, statut: 'confirmee', prenom: 'Personne', nom: id, entreprise: 'Entreprise fictive', courriel: id.toLowerCase() + '@example.invalid', formation_snapshot: JSON.stringify({ id: 'DIV-1', logiciel_id: 'DIV', titre: 'Formation Alpha', duree: '1 jour', prix: 850, prix_qualificatif: '' }), debut_snapshot: '2027-01-15T14:00:00.000Z', fin_snapshot: '2027-01-15T17:00:00.000Z', lieu_snapshot: JSON.stringify({ mode: 'en_ligne', adresse_presentiel: null, lien_visio: null }), mail_participant_etat: 'SENT', mail_tema_etat: 'FAILED', ...extra };
  return Array.from(view.headers, key => p[key] ?? '');
}
function input() {
  return {
    formations: [head(13, 2, 'Divalto'), row(13, { 0: 'DIV-1', 1: 'DIV — Divalto', 2: 'Formation Alpha', 7: '1 jour', 8: 850, 12: true }), head(13, 2, 'Dimo'), row(13, { 0: 'DIMO-1', 1: 'DIMO — Dimo', 2: 'Formation Beta', 7: '2 jours', 8: 1200, 12: true }), head(13, 2, 'MoovApps')],
    sessions: [head(12, 1, 'Divalto'), row(12, { 0: 'C-1', 1: 'DIV-1 — Ancien libellé de liste', 2: '2027-01-15', 3: '09:00', 4: '12:00', 5: 3, 6: 'en_ligne' }), row(12, { 0: 'C-past', 1: 'DIV-1 — Formation Alpha', 2: '2026-01-15', 3: '09:00', 4: '12:00', 5: 8, 6: 'en_ligne' }), head(12, 1, 'Dimo'), row(12, { 0: 'C-empty', 1: 'DIMO-1 — Formation Beta', 2: '2027-06-10', 3: '08:15', 4: '12:00', 5: 40, 6: 'presentiel', 7: 'Lieu fictif' }), head(12, 1, 'MoovApps')],
    registrations: [Array.from(view.headers), registration('I-1', 'C-1'), registration('I-2', 'C-1', { prenom: 'Émilie', statut: 'annulee', mail_participant_etat: 'BLOCKED' }), registration('I-3', 'C-1', { prenom: 'Autre' })]
  };
}
const set = (record, key, value) => record[view.headers.indexOf(key)] = value;
test('jointures par ID et compteurs : annulée conservée, seules les confirmées occupent une place', () => {
  const x = input(), before = JSON.stringify(x), m = view.project(x, all, deps), g = m.groups.find(g => g.cohort === 'C-1');
  assert.equal(g.title, 'Formation Alpha'); assert.equal(g.people.length, 3); assert.equal(g.confirmed, 2); assert.equal(g.cancelled, 1); assert.equal(g.remaining, 1);
  assert.equal(m.totals.sessions, 3); assert.equal(m.totals.confirmed, 2); assert.equal(m.totals.remaining, 49); assert.equal(JSON.stringify(x), before);
  assert.match(g.people[0].confirmation, /Participant : Envoyé\n/); assert.match(g.people[0].confirmation, /Tema : Échec/);
});
test('colonnes Inscriptions réordonnées : mêmes jointures et même projection par noms d’en-tête', () => {
  const x = input(), expected = view.project(x, all, deps), order = Array.from(view.headers, (_, i) => i).reverse();
  x.registrations = x.registrations.map(r => order.map(i => r[i]));
  assert.equal(JSON.stringify(view.project(x, all, deps)), JSON.stringify(expected));
});
test('vue à venir par défaut : session vide visible et session passée exclue', () => {
  const m = view.project(input(), [], deps); assert.equal(m.selection[0], 'À venir'); assert.equal(m.groups.length, 2); assert.ok(m.groups.some(g => g.cohort === 'C-empty' && g.people.length === 0));
  const past = view.project(input(), ['Passées', ...all.slice(1)], deps); assert.deepEqual(Array.from(past.groups, g => g.cohort), ['C-past']);
});
test('logiciel puis formation : choix conservés ; choix disparu réinitialisé avec avis explicite', () => {
  const x = input(), picked = [...all]; picked[1] = 'Dimo'; let m = view.project(x, picked, deps);
  picked[2] = m.options[2][1]; m = view.project(x, picked, deps); assert.equal(m.groups.length, 1); assert.equal(m.selection[2], picked[2]);
  picked[1] = 'Divalto'; m = view.project(x, picked, deps); assert.equal(m.selection[2], 'Toutes les formations'); assert.match(m.notices.join(' '), /Formation réinitialisé/);
  picked[1] = 'Inexistant'; m = view.project(x, picked, deps); assert.equal(m.selection[1], 'Tous les logiciels'); assert.match(m.notices.join(' '), /Logiciel réinitialisé/);
});
test('recherche sans accents et statut ne réduisent ni la capacité ni les compteurs de session', () => {
  const m = view.project(input(), [...all.slice(0, 3), 'Annulées', 'emilie'], deps), g = m.groups.find(g => g.cohort === 'C-1');
  assert.equal(g.visiblePeople.length, 1); assert.equal(g.visiblePeople[0].status, 'Annulée'); assert.equal(g.confirmed, 2); assert.equal(g.remaining, 1); assert.equal(m.totals.confirmed, 2); assert.equal(m.totals.participants, 1); assert.equal(m.totals.sessions, 3);
});
test('capacité absente et dépassement sont explicites, aucune annulation simulée', () => {
  const x = input(); x.sessions[1][5] = 1; x.sessions[4][5] = '';
  const m = view.project(x, all, deps), g = m.groups.find(g => g.cohort === 'C-1'); assert.equal(g.over, true); assert.equal(g.confirmed, 2); assert.equal(g.remaining, 0); assert.equal(m.totals.unknownCapacity, 1); assert.equal(m.groups.find(g => g.cohort === 'C-empty').remaining, null);
  const body = view.rows(m).values.flat().join(' '); assert.match(body, /DÉPASSEMENT/); assert.match(body, /capacité non renseignée/); assert.equal(x.registrations[1][6], 'confirmee');
});
test('état métier et états mail inconnus restent À vérifier sans être comptés comme confirmés', () => {
  const x = input(); set(x.registrations[1], 'statut', 'INCONNU'); set(x.registrations[1], 'mail_participant_etat', 'constructor'); set(x.registrations[1], 'mail_tema_etat', 'NOUVEAU');
  const m = view.project(x, [...all.slice(0, 3), 'À vérifier', ''], deps), p = m.groups.find(g => g.cohort === 'C-1').visiblePeople[0]; assert.equal(p.status, 'À vérifier'); assert.match(p.confirmation, /Participant : À vérifier\nTema : À vérifier/); assert.equal(m.totals.confirmed, 1); assert.equal(m.totals.unknown, 1);
});
test('session supprimée : formation/date/coordonnées historiques visibles et capacité inconnue', () => {
  const x = input(); x.sessions.splice(1, 1); const m = view.project(x, all, deps), g = m.groups.find(g => g.cohort === 'C-1');
  assert.equal(m.totals.participants, 3); assert.equal(g.historical, true); assert.equal(g.title, 'Formation Alpha'); assert.equal(g.start, Date.parse('2027-01-15T14:00:00Z')); assert.equal(g.capacity, null); assert.match(view.rows(m).values.flat().join(' '), /Inscription historique : Formation Alpha · 15 janvier 2027 à 09:00/);
});
test('formation supprimée : instantané conservé dans un groupe historique', () => {
  const x = input(); x.formations.splice(1, 1); const g = view.project(x, all, deps).groups.find(g => g.cohort === 'C-1'); assert.equal(g.historical, true); assert.equal(g.title, 'Formation Alpha'); assert.equal(g.people.length, 3); assert.match(g.warning, /Formation absente/);
});
test('conditions modifiées : ancien titre/date/lieu affichés sous la personne', () => {
  const x = input(); x.formations[1][2] = 'Nouveau titre'; x.formations[1][8] = 900; x.sessions[1][2] = '2027-01-16';
  const m = view.project(x, all, deps), p = m.groups.find(g => g.cohort === 'C-1').people[0]; assert.match(p.note, /Conditions modifiées/); assert.match(p.note, /Formation Alpha · 15 janvier 2027 à 09:00/); assert.match(view.rows(m).values.flat().join(' '), /Nouveau titre/);
});
test('instantané corrompu, ID absent et date absente : aucune inscription perdue dans Toutes', () => {
  const x = input(); x.registrations.push(registration('I-orphan', '', { formation_snapshot: 'cassé', debut_snapshot: '', fin_snapshot: '', lieu_snapshot: '' }), registration('I-orphan-2', '', { statut: 'annulee', debut_snapshot: '' }));
  const m = view.project(x, all, deps); assert.equal(m.totals.participants, 5); assert.equal(m.sourceRegistrations, 5); assert.equal(m.totals.confirmed, 3); assert.equal(m.totals.cancelled, 2);
  assert.match(view.rows(m).values.flat().join(' '), /Instantané incomplet/); assert.match(view.project(x, [], deps).notices.join(' '), /sans date vérifiable/);
});
for (const [label, fields] of [
  ['24 heures refusées', { debut_snapshot: '2027-01-15T24:00:00Z', fin_snapshot: '2027-01-15T23:00:00Z' }],
  ['fin avant début', { debut_snapshot: '2027-01-15T15:00:00Z', fin_snapshot: '2027-01-15T14:00:00Z' }],
  ['intervalle nul', { debut_snapshot: '2027-01-15T14:00:00Z', fin_snapshot: '2027-01-15T14:00:00Z' }],
  ['formation vide', { formation_snapshot: '{}' }],
  ['lieu vide', { lieu_snapshot: '{}' }],
  ['champ historique de mauvais type', { formation_snapshot: JSON.stringify({ id: 42, logiciel_id: 'DIV', titre: 'Titre', duree: '1 jour', prix: 850, prix_qualificatif: '' }) }]
]) test('instantané strict : ' + label + ', diagnostic visible sans changer statut ni comptage', () => {
  const x = input(); for (const [key, value] of Object.entries(fields)) set(x.registrations[1], key, value); const before = JSON.stringify(x);
  const m = view.project(x, all, deps), p = m.groups.find(g => g.cohort === 'C-1').people.find(p => p.id === 'I-1');
  assert.equal(m.totals.participants, 3); assert.equal(m.totals.confirmed, 2); assert.equal(p.status, 'Confirmée'); assert.match(p.note, /Instantané incomplet ou invalide/); assert.match(view.rows(m).values.flat().join(' '), /Instantané incomplet ou invalide/); assert.equal(JSON.stringify(x), before);
});
test('identifiant d’inscription absent : diagnostic visible et statut métier inchangé', () => {
  const x = input(); set(x.registrations[1], 'id_inscription', ''); const before = JSON.stringify(x), m = view.project(x, all, deps), p = m.groups.find(g => g.cohort === 'C-1').people.find(p => !p.id);
  assert.equal(p.status, 'Confirmée'); assert.equal(m.totals.confirmed, 2); assert.equal(m.totals.participants, 3); assert.match(p.note, /Identifiant d’inscription absent/); assert.match(view.rows(m).values.flat().join(' '), /Identifiant d’inscription absent/); assert.equal(JSON.stringify(x), before);
});
test('dates et heures Sheets typées sont équivalentes aux textes en hiver et été', () => {
  const x = input(), expected = view.project(x, all, deps); x.sessions[1][2] = new Date('2027-01-15T05:00:00Z'); x.sessions[1][3] = new Date('1899-12-30T14:00:00Z'); x.sessions[1][4] = new Date('1899-12-30T17:00:00Z'); x.sessions[4][2] = new Date('2027-06-10T04:00:00Z');
  assert.deepEqual(Array.from(view.project(x, all, deps).groups, g => [g.start, g.end]), Array.from(expected.groups, g => [g.start, g.end]));
});
for (const [label, date, time] of [['date impossible', '2027-02-30', '09:00'], ['heure inexistante', '2027-03-14', '02:30'], ['heure ambiguë', '2027-11-07', '01:30']]) test(label + ' : groupe consultable dans Toutes avec diagnostic, absent de À venir', () => {
  const x = input(); x.sessions[1][2] = date; x.sessions[1][3] = time; const m = view.project(x, all, deps); assert.equal(m.groups.find(g => g.cohort === 'C-1').start, null); assert.match(m.groups.find(g => g.cohort === 'C-1').warning, /à vérifier/); assert.ok(!view.project(x, [], deps).groups.some(g => g.cohort === 'C-1'));
});
for (const [label, mutate, expected] of [
  ['29 colonnes', x => x.registrations[0].pop(), /29 colonnes/],
  ['en-tête inattendu', x => x.registrations[0][0] = 'personne', /29 colonnes/],
  ['inscription dupliquée', x => x.registrations.push(x.registrations[1].slice()), /inscription dupliqué/],
  ['session dupliquée', x => x.sessions.splice(2, 0, x.sessions[1].slice()), /session dupliqué/],
  ['formation dupliquée', x => x.formations.splice(2, 0, x.formations[1].slice()), /formation dupliqué/]
]) test(label + ' : refus des compteurs trompeurs et sources intactes', () => { const x = input(); mutate(x); const before = JSON.stringify(x); assert.throws(() => view.project(x, all, deps), expected); assert.equal(JSON.stringify(x), before); });
test('titres de formation homonymes : sélection distincte par ID, aucun groupe perdu', () => {
  const x = input(); x.formations.splice(2, 0, row(13, { 0: 'DIV-2', 2: 'Formation Alpha', 7: '1 jour', 8: 850 })); x.sessions.splice(2, 0, row(12, { ...x.sessions[1], 0: 'C-other', 1: 'DIV-2 — Formation Alpha' }));
  const m = view.project(x, all, deps); assert.equal(new Set(m.options[2]).size, m.options[2].length); assert.equal(m.options[2].filter(v => v.includes('Formation Alpha')).length, 2);
  const picked = [...all]; picked[2] = m.options[2].find(v => v.includes('[DIV-2]')); assert.equal(view.project(x, picked, deps).groups.length, 1);
  const ids = Array.from(m.groups.filter(g => g.software === 'DIV'), g => g.formationId); assert.deepEqual(ids, ['DIV-1', 'DIV-1', 'DIV-2']);
});
test('texte malveillant dans les participants et champs : projection sans formule', () => {
  const x = input(); set(x.registrations[1], 'prenom', '=IMPORTXML("https://example.invalid")'); set(x.registrations[1], 'nom', ''); set(x.registrations[1], 'entreprise', '+1+2'); set(x.registrations[1], 'courriel', '@FORMULE'); set(x.registrations[2], 'prenom', '-CMD');
  const body = view.rows(view.project(x, all, deps)); assert.ok(body.values.flat().some(v => String(v).startsWith("'=IMPORTXML"))); assert.ok(body.values.flat().some(v => v === "'+1+2")); assert.ok(body.values.flat().some(v => v === "'@FORMULE")); assert.ok(body.values.flat().every(v => !/^\s*[=+@-]/.test(String(v)))); assert.equal(view.inert(42), 42);
});
function google(extra = {}) {
  const data = input(), log = [], released = { count: 0, held: false, sourceHeld: false }, cells = Array.from({ length: 250 }, () => Array(7).fill('')), notes = {}, validations = {}, hidden = new Set();
  cells[1][1] = 'Suivi des inscriptions'; notes['2:2'] = 'TEMA_REGISTRATION_VIEW_V1'; cells[9].splice(1, 5, ...all);
  function coords(r, c, nr = 1, nc = 1) {
    if (typeof r === 'string') { const parts = r.split(':'); const start = parts[0].match(/^([A-Z]+)(\d+)$/); const end = (parts[1] || parts[0]).match(/^([A-Z]+)(\d+)$/); const col = v => [...v].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0); return [Number(start[2]), col(start[1]), Number(end[2]) - Number(start[2]) + 1, col(end[1]) - col(start[1]) + 1]; } return [r, c, nr, nc];
  }
  function range(sheetName, values, ...args) {
    const [r, c, nr, nc] = coords(...args), mutation = (kind, cb = () => {}) => { assert.ok(sheetName === view.name ? released.held : released.sourceHeld, 'Toute mutation doit posséder son verrou dédié'); assert.ok(sheetName === view.name || extra.allowBusinessWrites, 'Aucune écriture de la vue dans les sources'); log.push([kind, sheetName, r, c, nr, nc]); cb(); return api; };
    const api = { getSheet: () => sheets[sheetName], getRow: () => r, getLastRow: () => r + nr - 1, getColumn: () => c, getLastColumn: () => c + nc - 1, getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => values[r + i - 1]?.[c + j - 1] ?? '')), getValue: () => values[r - 1]?.[c - 1] ?? '', getNote: () => notes[(sheetName === view.name ? '' : sheetName + ':') + r + ':' + c] || '',
      setValues: matrix => mutation('values', () => { if (extra.failWrite && sheetName === view.name && r === 15) throw Error('writer refused'); matrix.forEach((line, i) => line.forEach((v, j) => { const value = typeof v === 'string' && v.startsWith("'") ? v.slice(1) : v; const rule = validations[(sheetName === view.name ? '' : sheetName + ':') + (r + i) + ':' + (c + j)]; if (value !== '' && rule && !rule.includes(value)) throw Error('data validation refused ' + (r + i) + ':' + (c + j)); values[r + i - 1][c + j - 1] = value; })); }),
      setValue: value => api.setValues([[value]]), setNote: value => mutation('note', () => notes[(sheetName === view.name ? '' : sheetName + ':') + r + ':' + c] = value), setNotes: matrix => mutation('notes', () => matrix.forEach((line, i) => line.forEach((v, j) => notes[(sheetName === view.name ? '' : sheetName + ':') + (r + i) + ':' + (c + j)] = v))),
      clearContent: () => mutation('clearContent', () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) values[r + i - 1][c + j - 1] = ''; }),
      clear: () => { if (r === 15 && extra.failCleanup && (typeof extra.failCleanup !== 'function' || extra.failCleanup())) throw Error('cleanup refused'); return api.clearContent(); }, setDataValidation: rule => mutation('validation', () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) { const key = (sheetName === view.name ? '' : sheetName + ':') + (r + i) + ':' + (c + j); if (rule) validations[key] = rule; else delete validations[key]; } }), setDataValidations: rules => mutation('validations', () => rules.forEach((line, i) => line.forEach((rule, j) => { const key = (sheetName === view.name ? '' : sheetName + ':') + (r + i) + ':' + (c + j); if (rule) validations[key] = rule; else delete validations[key]; }))), clearDataValidations: () => mutation('clearValidation', () => { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) delete validations[(sheetName === view.name ? '' : sheetName + ':') + (r + i) + ':' + (c + j)]; }), shiftRowGroupDepth: depth => mutation('group:' + depth), copyTo() {}
    };
    for (const method of ['merge', 'breakApart', 'setFontFamily', 'setFontSize', 'setFontColor', 'setFontWeight', 'setBackground', 'setWrap', 'setNumberFormat', 'setVerticalAlignment', 'setBackgrounds', 'setFontColors', 'setFontWeights', 'setFontSizes']) api[method] = () => mutation(method);
    return api;
  }
  const sheets = {};
  for (const [name, values] of [['Formations', data.formations], ['Disponibilités', data.sessions], ['Inscriptions', data.registrations], [view.name, cells]]) {
    sheets[name] = { getName: () => name, getLastRow: () => name === view.name ? 100 : values.length, getLastColumn: () => values[0].length, getMaxRows: () => values.length, getMaxColumns: () => values[0].length, getRange: (...args) => range(name, values, ...args), getProtections: () => [], protect: () => ({ setDescription() { return this; }, setWarningOnly() { return this; }, setUnprotectedRanges() { return this; } }), setActiveRange() {} };
    for (const method of ['hideColumns', 'showRows', 'hideRows', 'setRowHeight', 'setRowHeights', 'setColumnWidth', 'setHiddenGridlines', 'setTabColor', 'setFrozenRows']) sheets[name][method] = (...args) => { assert.equal(name, view.name); assert.ok(released.held); log.push([method, name, ...args]); if (method === 'hideRows' || method === 'showRows') for (let r = args[0]; r < args[0] + args[1]; r++) method === 'hideRows' ? hidden.add(r) : hidden.delete(r); return sheets[name]; };
    sheets[name].insertRowsBefore = (r, count) => { assert.ok(extra.allowBusinessWrites && released.sourceHeld); values.splice(r - 1, 0, ...Array.from({ length: count }, () => Array(values[0].length).fill(''))); };
    sheets[name].insertRowsAfter = (r, count) => { assert.ok(extra.allowBusinessWrites && released.sourceHeld); values.splice(r, 0, ...Array.from({ length: count }, () => Array(values[0].length).fill(''))); };
    sheets[name].autoResizeRows = () => {};
  }
  const newView = sheets[view.name];
  if (extra.noView) { delete sheets[view.name]; cells.forEach(r => r.fill('')); delete notes['2:2']; }
  const book = { getId: () => view.target, getSheetByName: name => sheets[name], toast: (...args) => log.push(['toast', ...args]), setActiveSheet() {}, insertSheet(name) { assert.equal(name, view.name); sheets[name] = newView; return sheets[name]; } };
  const menu = { addItem() { return this; }, addSeparator() { return this; }, addToUi() {} };
  const globals = { Date: new Proxy(Date, { get(target, key) { return key === 'now' ? extra.now || deps.now : target[key]; } }), Utilities: { getUuid: () => 'synthetic-id', parseDate(value) { return new Date(value.replace(' ', 'T') + ':00-05:00'); }, formatDate(value, zone, pattern) { const s = formatter.format(value); return pattern === 'yyyy-MM-dd' ? s.slice(0, 10) : pattern === 'HH:mm' ? s.slice(11, 16) : s.replace(' ', 'T'); } }, LockService: { getScriptLock: () => ({ tryLock() { assert.equal(released.sourceHeld, false, 'Aucun verrou source imbriqué'); released.sourceHeld = true; return true; }, releaseLock() { released.sourceHeld = false; } }), getUserLock: () => ({ tryLock() { if (extra.busy || released.held) return false; released.held = true; return true; }, releaseLock() { released.count++; released.held = false; } }) }, SpreadsheetApp: { CopyPasteType: { PASTE_FORMAT: 1, PASTE_DATA_VALIDATION: 2 }, ProtectionType: { SHEET: 'sheet' }, getActiveSpreadsheet: () => book, getUi: () => ({ createMenu: () => menu }), flush() { extra.onFlush?.(cells, data, hidden); }, newDataValidation() { return { requireValueInList(choices) { this.choices = choices; return this; }, setAllowInvalid() { return this; }, build() { return this.choices; } }; } } };
  return { data, log, released, hidden, cells, notes, validations, sheets, book, globals };
}
test('writer Google simulé : lectures sources seulement, filtres conservés, répétition sans cumul', () => {
  const g = google(), before = JSON.stringify(g.data); Object.assign(context, g.globals);
  assert.equal(view.refresh(g.book, false), true); const first = JSON.stringify(g.cells); assert.equal(view.refresh(g.book, false), true); assert.equal(JSON.stringify(g.cells), first); assert.equal(JSON.stringify(g.data), before); assert.deepEqual(g.cells[9].slice(1, 6), all); assert.equal(g.cells[5][1], 3); assert.equal(g.cells[5][2], 2); assert.equal(g.released.count, 2); assert.ok(g.log.some(r => r[0] === 'group:1')); assert.match(g.cells[11][1], /Compteurs : toutes les inscriptions des sessions affichées/);
});
test('installation simulée : un seul onglet dérivé, protection avec filtres accessibles, sources intactes', () => {
  const g = google({ noView: true }), before = JSON.stringify(g.data); Object.assign(context, g.globals);
  assert.equal(view.refresh(g.book, true), true); assert.equal(g.sheets[view.name].getName(), view.name); assert.equal(g.notes['2:2'], 'TEMA_REGISTRATION_VIEW_V1'); assert.equal(g.cells[9][1], 'À venir'); assert.equal(g.cells[5][1], 2); assert.equal(JSON.stringify(g.data), before); assert.ok(g.log.some(r => r[0] === 'setFrozenRows')); assert.match(g.cells[2][1], /heures de Montréal/);
});
test('reprise d’installation : en-tête compact réappliqué sans remplacer les filtres ni les sources', () => {
  const g = google(), before = JSON.stringify(g.data), picked = ['Toutes les sessions', 'Dimo', 'Formation Beta · Dimo', 'Annulées', 'Recherche conservée'];
  g.cells[9].splice(1, 5, ...picked); Object.assign(context, g.globals);
  assert.equal(view.refresh(g.book, true), true); assert.deepEqual(g.cells[9].slice(1, 6), [...picked.slice(0, 4), '']); assert.equal(g.cells[8][5], ''); assert.equal(JSON.stringify(g.data), before);
  const heights = Array(14).fill(999);
  for (const [method, , first, countOrHeight, height] of g.log) {
    if (method === 'setRowHeights' && first === 1) heights.fill(height, first - 1, first + countOrHeight - 1);
    if (method === 'setRowHeight' && first <= 14) heights[first - 1] = countOrHeight;
  }
  assert.equal(heights.reduce((n, height) => n + height, 0), 280); assert.equal(heights.slice(0, 12).reduce((n, height) => n + height, 0), 264);
  assert.equal(heights[1], 42); assert.equal(heights[9], 40); assert.ok(g.log.some(r => r[0] === 'setFrozenRows' && r[2] === 12));
  assert.ok(!g.log.some(r => r[0] === 'values' && r[2] === 10), 'Une installation existante ne réécrit pas les filtres');
});
test('filtres édités : aucune synchronisation métier, sélection actuelle relue plutôt que e.value', () => {
  const g = google(); Object.assign(context, g.globals); const oldSync = context.TemaSheetPrototype.sync; context.TemaSheetPrototype.sync = () => { throw Error('sync métier interdite'); };
  g.cells[9][2] = 'Dimo';
  try { context.onEdit({ source: g.book, value: 'Divalto', range: { getSheet: () => g.sheets[view.name], getRow: () => 10, getLastRow: () => 10, getColumn: () => 3, getLastColumn: () => 3 } }); assert.equal(g.cells[9][2], 'Dimo'); assert.equal(g.cells[5][1], 1); }
  finally { context.TemaSheetPrototype.sync = oldSync; }
});
test('édition rapide pendant rendu : seconde projection correspond à la dernière sélection', () => {
  let count = 0; const g = google({ onFlush(cells) { if (++count === 1) cells[9][2] = 'Dimo'; } }); Object.assign(context, g.globals);
  assert.equal(view.refresh(g.book, false), true); assert.equal(g.cells[9][2], 'Dimo'); assert.equal(g.cells[5][1], 1); assert.equal(g.cells[5][2], 0); assert.ok(g.cells.flat().some(v => String(v).includes('Formation Beta'))); assert.ok(!g.cells.slice(14).flat().some(v => String(v).includes('Formation Alpha'))); assert.equal(g.released.count, 1);
});
test('actualisation normale depuis un ancien corps : état visible, compteurs invalidés et groupes masqués jusqu’à validation', () => {
  const options = {}, g = google(options); Object.assign(context, g.globals); assert.equal(view.refresh(g.book, false), true); g.cells[9][2] = 'Dimo';
  let pending = 0, published = 0;
  options.onFlush = (cells, data, hidden) => {
    if (String(cells[11][1]).startsWith('Actualisation en cours')) {
      pending++; assert.ok(cells[5].slice(1, 6).every(v => v === '')); assert.equal(hidden.size, cells.length - 14);
      if (pending === 1) assert.ok(cells.slice(14).flat().every(v => v === ''));
    } else { published++; assert.match(cells[11][1], /Contexte vérifié.*Dimo/); assert.equal(hidden.size, 0); }
  };
  assert.equal(view.refresh(g.book, false), true); assert.equal(pending, 2); assert.equal(published, 1); assert.equal(g.cells[5][1], 1); assert.equal(g.cells[5][2], 0);
});
test('détenteur du verrou : le filtre reçu par un appel concurrent occupé est repris avant succès', () => {
  const options = {}, g = google(options); Object.assign(context, g.globals); let nested = false;
  options.onFlush = cells => { if (!nested) { nested = true; cells[9][2] = 'Dimo'; assert.equal(view.refresh(g.book, false), false); } };
  assert.equal(view.refresh(g.book, false), true); assert.equal(g.cells[9][2], 'Dimo'); assert.equal(g.cells[5][1], 1); assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('Formation Beta'))); assert.equal(g.released.count, 1);
});
for (const phase of ['rendu', 'publication']) test('confirmation ajoutée pendant flush de ' + phase + ' : sources relues et compteur final corrigé', () => {
  const options = {}, g = google(options); Object.assign(context, g.globals); let flushes = 0, added = false;
  options.onFlush = (cells, data) => {
    flushes++;
    if (!added && (phase === 'rendu' ? flushes === 2 : String(cells[11][1]).includes('Contexte vérifié'))) { added = true; data.registrations.push(registration('I-new', 'C-1')); }
  };
  assert.equal(view.refresh(g.book, false), true); assert.equal(added, true); assert.equal(g.cells[5][2], 3); assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('3 confirmée(s)'))); assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('Personne I-new'))); assert.equal(g.hidden.size, 0);
});
test('sources continuellement modifiées : au plus deux rendus, puis résultats indisponibles', () => {
  let n = 0; const g = google({ onFlush(cells, data) { data.registrations.push(registration('I-continu-' + ++n, 'C-1')); } }); Object.assign(context, g.globals);
  assert.throws(() => view.refresh(g.book, false), /sources ou la sélection ont changé/); assert.equal(g.log.filter(r => r[0] === 'values' && r[2] === 15 && r[3] === 2).length, 2); assert.equal(g.cells[5][2], ''); assert.match(g.cells[11][1], /Actualisation interrompue/); assert.equal(g.hidden.size, g.cells.length - 14);
});
test('budget de reprise : aucun second rendu après dix secondes écoulées', () => {
  let now = deps.now(), flushes = 0; const g = google({ now: () => now, onFlush(cells, data) { if (++flushes === 2) { now += 11000; data.registrations.push(registration('I-later', 'C-1')); } } }); Object.assign(context, g.globals);
  assert.throws(() => view.refresh(g.book, false), /budget de reprise/); assert.equal(g.log.filter(r => r[0] === 'values' && r[2] === 15 && r[3] === 2).length, 1); assert.equal(g.cells[5][2], ''); assert.equal(g.released.count, 1);
});
test('sélection continuellement modifiée : erreur visible, corps et compteurs retirés', () => {
  const g = google({ onFlush(cells) { cells[9][2] = cells[9][2] === 'Dimo' ? 'Divalto' : 'Dimo'; } }); Object.assign(context, g.globals);
  assert.throws(() => view.refresh(g.book, false), /sources ou la sélection ont changé/); assert.equal(g.cells[5][1], ''); assert.ok(g.cells.slice(14).flat().every(v => v === '')); assert.match(g.cells[11][1], /Actualisation interrompue/); assert.equal(g.released.count, 1);
});
test('verrou occupé sur un corps déjà rendu : aucune mutation hors verrou, contexte précédent explicite', () => {
  const options = {}, g = google(options); Object.assign(context, g.globals); assert.equal(view.refresh(g.book, false), true);
  assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('2 confirmée(s)'))); assert.equal(g.hidden.size, 0);
  options.busy = true; g.cells[9][2] = 'Dimo'; const before = JSON.stringify(g.cells), sources = JSON.stringify(g.data), from = g.log.length;
  assert.equal(view.refresh(g.book, false), false); assert.equal(JSON.stringify(g.cells), before); assert.equal(JSON.stringify(g.data), sources); assert.ok(g.log.slice(from).every(r => r[0] === 'toast')); assert.match(g.log.at(-1)[1], /contexte précédent.*filtres courants ne sont pas encore appliqués/); assert.match(g.cells[11][1], /Tous les logiciels/); assert.equal(g.released.count, 1);
});
test('échec source ou writer : erreur visible et verrou toujours libéré', () => {
  for (const extra of [{}, { failWrite: true }]) { const g = google(extra); if (!extra.failWrite) g.data.registrations[0][0] = 'inattendu'; Object.assign(context, g.globals); assert.throws(() => view.refresh(g.book, false), extra.failWrite ? /writer refused/ : /29 colonnes/); assert.match(g.cells[11][1], /Actualisation interrompue/); assert.equal(g.cells[5][1], ''); assert.equal(g.released.count, 1); }
});
test('échec du nettoyage après erreur d’écriture : diagnostic et compteurs indépendants, erreur initiale conservée', () => {
  const options = {}, g = google(options); Object.assign(context, g.globals); assert.equal(view.refresh(g.book, false), true);
  let cleanups = 0; options.failWrite = true; options.failCleanup = () => ++cleanups >= 3;
  assert.throws(() => view.refresh(g.book, false), /writer refused/); assert.match(g.cells[11][1], /Actualisation interrompue : writer refused/); assert.equal(g.cells[5][2], ''); assert.ok(g.log.some(r => r[0] === 'toast' && r[1].includes('writer refused'))); assert.equal(g.hidden.size, g.cells.length - 14); assert.equal(g.released.count, 2);
});
test('hors copie : refus avant tout service ; vue homonyme inconnue préservée ; vue absente non créée par hook', () => {
  assert.throws(() => view.refresh({ getId: () => 'autre' }, true), /copie/);
  const g = google(); g.notes['2:2'] = 'humaine'; Object.assign(context, g.globals); assert.throws(() => view.refresh(g.book, true), /n’est pas reconnu/); assert.equal(g.log.length, 0);
  const missing = google({ noView: true }); Object.assign(context, missing.globals); assert.equal(view.refresh(missing.book, false), false); assert.equal(missing.log.length, 0);
});
test('hook onOpen avec les trois modules : nouveaux inscrits et titre relus après réouverture', () => {
  const g = google({ allowBusinessWrites: true }); Object.assign(context, g.globals); assert.equal(view.refresh(g.book, false), true); assert.equal(g.cells[5][2], 2);
  g.data.registrations.push(registration('I-reopened', 'C-1')); g.data.formations[1][2] = 'Titre après réouverture';
  context.onOpen({ source: g.book });
  assert.equal(g.cells[5][2], 3); assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('Titre après réouverture'))); assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('Personne I-reopened'))); assert.equal(g.hidden.size, 0);
});
test('hook onEdit source avec les trois modules : confirmation ajoutée, personne et compteurs rafraîchis', () => {
  const g = google({ allowBusinessWrites: true }); Object.assign(context, g.globals); assert.equal(view.refresh(g.book, false), true); assert.equal(g.cells[5][2], 2);
  g.data.registrations.push(registration('I-edited', 'C-1')); const r = g.data.registrations.length;
  context.onEdit({ source: g.book, range: { getSheet: () => g.sheets.Inscriptions, getRow: () => r, getLastRow: () => r } });
  assert.equal(g.cells[5][2], 3); assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('Personne I-edited'))); assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('3 confirmée(s)'))); assert.equal(g.hidden.size, 0);
});
function newSession() { return { kind: 'sessions', requestId: 'b530396f-0000-4000-8000-000000000001', formationId: 'DIMO-1', open: true, dates: [{ date: '2027-02-10', start: '09:00', end: '11:00', capacity: '6', mode: 'en_ligne', venue: '' }] }; }
test('hook create avec les trois modules : session enregistrée visible avec nouveaux compteurs', () => {
  const g = google({ allowBusinessWrites: true }); Object.assign(context, g.globals); assert.equal(view.refresh(g.book, false), true); assert.equal(g.cells[5][1], 3);
  const result = context.TemaAdminActions.create(g.book, newSession());
  assert.equal(result.count, 1); assert.equal(result.notice, ''); assert.ok(g.data.sessions.some(r => r[0] === 'C-' + newSession().requestId + '-1')); assert.equal(g.cells[5][1], 4); assert.equal(g.cells[5][2], 2); assert.equal(g.cells[5][4], 55); assert.ok(g.cells.slice(14).flat().some(v => String(v).includes('10 février 2027 à 09:00–11:00')));
});
test('hook create : échec du suivi après ajout conservé, avertissement retourné sans supprimer la session', () => {
  const options = { allowBusinessWrites: true }, g = google(options); Object.assign(context, g.globals); assert.equal(view.refresh(g.book, false), true); options.failWrite = true;
  const result = context.TemaAdminActions.create(g.book, newSession());
  assert.equal(result.count, 1); assert.match(result.notice, /Ajout conservé.*actualisez le suivi/); assert.ok(g.data.sessions.some(r => r[0] === 'C-' + newSession().requestId + '-1')); assert.equal(g.cells[5][1], ''); assert.match(g.cells[11][1], /Actualisation interrompue/); assert.equal(g.hidden.size, g.cells.length - 14);
});
test('bundle privé : vue incluse, dialogues et images conservés, aucune capacité interdite ajoutée', () => {
  const builder = fs.readFileSync(__dirname + '/build-admin-sheet-actions.cjs', 'utf8'); assert.ok(builder.includes("'admin-sheet-registrations.gs'")); assert.ok(builder.includes('TEMA_ADMIN_DIALOG')); assert.ok(builder.includes('TEMA_ADMIN_BUTTONS'));
  const source = fs.readFileSync(__dirname + '/admin-sheet-registrations.gs', 'utf8'); assert.ok(!/MailApp|GmailApp|UrlFetchApp|openById|ScriptApp|hideSheet|deleteSheet|appendRow/.test(source)); assert.ok(!source.includes('setFormula')); assert.ok(source.includes('setWarningOnly(true).setUnprotectedRanges'));
});
test('COPY : une admission pendant le rendu n’attend pas le verrou de vue et invalide son acquittement', () => {
  const g = google(); Object.assign(context, g.globals);
  let version = 'v1', acknowledged = '', calls = 0;
  context.TemaCopy = {
    guard() {}, assertAdministrativeLayout() { return structuredClone(g.data); }, isOwner: () => true, version: () => version, sourceHash: sources => JSON.stringify(sources),
    acknowledge(expected, validate) {
      assert.equal(g.released.held, true, 'Le rendu conserve son UserLock');
      assert.equal(g.released.sourceHeld, false, 'Le verrou source est libre pendant le rendu');
      const lock = g.globals.LockService.getScriptLock(); assert.equal(lock.tryLock(), true);
      try {
        if (++calls === 1) { version = 'v2'; g.data.registrations.push(registration('I-copy-concurrent', 'C-1')); }
        if (expected !== version || !validate()) return false;
        acknowledged = expected; return true;
      } finally { lock.releaseLock(); }
    }
  };
  try {
    assert.equal(view.refresh(g.book, false), true);
    assert.equal(calls, 2); assert.equal(acknowledged, 'v2'); assert.equal(g.cells[5][2], 3);
    assert.equal(g.released.sourceHeld, false); assert.equal(g.released.held, false);
  } finally { delete context.TemaCopy; }
});
test('COPY : identité propriétaire indisponible, aucun rendu ni acquittement', () => {
  const g = google(); Object.assign(context, g.globals);
  context.TemaCopy = { guard() {}, isOwner: () => false, acknowledge() { throw Error('Acquittement interdit'); } };
  const before = JSON.stringify(g.cells);
  try { assert.equal(view.refresh(g.book, false), false); assert.equal(JSON.stringify(g.cells), before); assert.equal(g.released.count, 0); }
  finally { delete context.TemaCopy; }
});

// Cancellation tests exercise the real projection and dedicated controller against Google fakes.
function cancellation(options = {}) {
  const g = google({ allowBusinessWrites: true }); Object.assign(context, g.globals);
  let version = 0, counterCalls = 0, writes = 0;
  context.TemaCopy = {
    guard(book) { assert.equal(book.getId(), view.target); }, isOwner: () => options.owner !== false,
    assertAdministrativeLayout: () => g.data, sourceHash: x => JSON.stringify(x), version: () => String(version),
    acknowledge: (v, check) => v === String(version) && check(),
    lock(fn) { const lock = g.globals.LockService.getScriptLock(); if (options.busy) throw Error('BUSY'); assert.equal(lock.tryLock(), true); try { return fn(); } finally { lock.releaseLock(); } },
    dirty() { version++; },
    nativeCounters() { counterCalls++; assert.ok(g.released.sourceHeld); if (options.counterFailure) throw Error('counter refused'); const h = g.data.registrations[0]; const n = g.data.registrations.slice(1).filter(r => r[h.indexOf('statut')] === 'confirmee' && r[h.indexOf('id_cohorte')] === 'C-1').length; g.data.sessions[1][9] = 3 - n; }
  };
  // Supply monotonic generation tokens even when two refreshes happen in one millisecond.
  let generation = 0; g.globals.Utilities.getUuid = () => 'generation-' + (++generation);
  assert.equal(view.refresh(g.book, false), options.owner === false ? false : true);
  vm.runInNewContext(fs.readFileSync(__dirname + '/admin-registration-actions.gs', 'utf8'), context);
  const actions = context.module.exports, rowNumber = g.cells.findIndex(r => r[2] === 'Entreprise fictive' && r[3] === 'i-1@example.invalid') + 1;
  const row = rowNumber || 19;
  let dialogs = 0;
  const ui = { ButtonSet: { YES_NO: 'YES_NO' }, Button: { YES: 'YES' }, alert(title, prompt) { dialogs++; assert.equal(g.released.held, false); assert.equal(g.released.sourceHeld, false); assert.match(prompt, /Personne I-1/); assert.match(prompt, /i-1@example.invalid/); assert.match(prompt, /Formation Alpha/); assert.match(prompt, /15 janvier 2027 à 09:00 \(Montréal\)/); options.dialog?.(g); return options.answer || 'YES'; } };
  g.globals.SpreadsheetApp.getUi = () => ui;
  const sourceRange = g.sheets.Inscriptions.getRange;
  g.sheets.Inscriptions.getRange = (...args) => { const range = sourceRange(...args), original = range.setValue; range.setValue = v => { writes++; if (options.beforeFailure) throw Error('before write'); const result = original(v); if (options.afterFailure) throw Error('after write'); return result; }; return range; };
  function edit(extra = {}) { g.cells[row - 1][4] = 'Annulée'; const event = { source: g.book, range: g.sheets[view.name].getRange(row, 5), oldValue: 'Confirmée', value: 'Annulée', ...extra }; context.onEdit(event); return true; }
  return { ...g, edit, row, status: () => g.data.registrations[1][6], dialogs: () => dialogs, counterCalls: () => counterCalls, writes: () => writes, cleanup: () => { delete context.TemaCopy; delete context.TemaRegistrationActions; } };
}
test('annulation via vrai contrôleur : confirmation sans verrou, source conservée, une place et aucun état mail modifié', () => {
  const g = cancellation(); const before = JSON.parse(JSON.stringify(g.data.registrations));
  try { assert.equal(g.edit(), true); assert.equal(g.status(), 'annulee'); assert.equal(g.data.sessions[1][9], 2); assert.equal(g.dialogs(), 1); assert.equal(g.counterCalls(), 1); before[1][6] = 'annulee'; assert.deepEqual(g.data.registrations, before); assert.match(g.log.at(-1)[1], /Annulation enregistrée/); assert.equal(g.released.sourceHeld, false); assert.equal(g.released.held, false); g.edit(); assert.equal(g.writes(), 1); assert.equal(g.data.sessions[1][9], 2); } finally { g.cleanup(); }
});
for (const answer of ['NO', 'CLOSE']) test('confirmation ' + answer + ' : source conservée, statut restauré', () => {
  const g = cancellation({ answer }); try { assert.equal(g.edit(), true); assert.equal(g.status(), 'confirmee'); assert.equal(g.cells[g.row - 1][4], 'Confirmée'); assert.equal(g.writes(), 0); assert.match(g.log.at(-1)[1], /réservation conservée/); } finally { g.cleanup(); }
});
for (const [label, change] of [
  ['filtre', g => g.cells[9][1] = 'Passées'],
  ['génération', g => g.cells[1][6] = 'new-generation'],
  ['ligne déplacée', g => g.cells[g.cells.findIndex(r => r[3] === 'i-1@example.invalid')][3] = 'another@example.invalid'],
  ['source modifiée', g => g.data.registrations[1][9] = 'new company'],
  ['courriel de la cible modifié', g => g.data.registrations[1][10] = 'changed@example.invalid'],
  ['ID dupliqué', g => g.data.registrations.push(g.data.registrations[1].slice())],
  ['statut inconnu', g => g.data.registrations[1][6] = 'unknown']
]) test('dialogue périmé : ' + label + ', aucune écriture métier', () => {
  const g = cancellation({ dialog: change }); try { g.edit(); assert.equal(g.writes(), 0); assert.equal(g.counterCalls(), 0); assert.doesNotMatch(g.log.at(-1)[1], /Annulation enregistrée/); } finally { g.cleanup(); }
});
for (const option of ['busy', 'beforeFailure']) test(option + ' : aucune annulation annoncée ni enregistrée', () => {
  const g = cancellation({ [option]: true }); try { g.edit(); assert.equal(g.status(), 'confirmee'); assert.doesNotMatch(g.log.at(-1)[1], /Annulation enregistrée/); } finally { g.cleanup(); }
});
test('erreur après écriture : relire le statut durable, annoncer annulation enregistrée', () => {
  const g = cancellation({ afterFailure: true }); try { g.edit(); assert.equal(g.status(), 'annulee'); assert.match(g.log.at(-1)[1], /Annulation enregistrée/); } finally { g.cleanup(); }
});
test('échec compteur et rafraîchissement après commit : annoncer enregistré, actualisation à reprendre', () => {
  const g = cancellation({ counterFailure: true }); const original = view.refresh;
  try { view.refresh = () => { throw Error('refresh failure'); }; g.edit(); assert.equal(g.status(), 'annulee'); assert.match(g.log.at(-1)[1], /Annulation enregistrée.*Actualisation/); } finally { view.refresh = original; g.cleanup(); }
});
test('collage multiple et ID absent : aucun dialogue ni écriture source', () => {
  for (const multiple of [true, false]) { const g = cancellation(); try { if (!multiple) { const meta = JSON.parse(g.cells[g.row - 1][6]); meta.id = ''; g.cells[g.row - 1][6] = JSON.stringify(meta); } g.edit(multiple ? { range: g.sheets[view.name].getRange(g.row, 5, 2, 1) } : {}); assert.equal(g.dialogs(), 0); assert.equal(g.writes(), 0); } finally { g.cleanup(); } }
});
test('ancienne recherche est ignorée et effacée : quatre filtres natifs, aucune mention réception', () => {
  const g = google(); g.cells[9][5] = 'introuvable'; Object.assign(context, g.globals); view.refresh(g.book, true); assert.equal(g.cells[9][5], ''); assert.equal(g.cells[8][5], ''); assert.equal(g.cells[5][2], 2); assert.doesNotMatch(g.cells[11][1], /réception/); assert.equal(Object.keys(g.validations).filter(k => k.startsWith('10:')).length, 4);
});
test('annulation concurrente pendant dialogue : aucun double effet ni compteur soustrait', () => {
  const g = cancellation({ dialog: g => { g.data.registrations[1][6] = 'annulee'; g.data.sessions[1][9] = 2; } });
  try { g.edit(); assert.equal(g.status(), 'annulee'); assert.equal(g.writes(), 0); assert.equal(g.counterCalls(), 0); assert.equal(g.data.sessions[1][9], 2); assert.match(g.log.at(-1)[1], /déjà annulée/); } finally { g.cleanup(); }
});
test('métadonnées périmées avant dialogue : refus sans boîte de confirmation', () => {
  const g = cancellation(); try { g.cells[1][6] = 'replaced'; g.edit(); assert.equal(g.dialogs(), 0); assert.equal(g.writes(), 0); assert.equal(g.status(), 'confirmee'); } finally { g.cleanup(); }
});
test('colonnes sources réordonnées : annulation résolue par en-têtes et ID', () => {
  const g = cancellation(); try { g.data.registrations.forEach(r => r.reverse()); assert.equal(view.refresh(g.book, false), true); g.edit(); const h = g.data.registrations[0]; assert.equal(g.data.registrations[1][h.indexOf('statut')], 'annulee'); assert.equal(g.writes(), 1); } finally { g.cleanup(); }
});

for (const [label, mutate] of [
  ['mail de la cible', g => { g.data.registrations[1][19] = 'UNKNOWN'; g.data.registrations[1][24] = 'ERROR'; }],
  ['autre inscription', g => g.data.registrations.push(registration('I-unrelated', 'C-past'))]
]) test(label + ' pendant confirmation : annulation autorisée', () => {
  const g = cancellation({ dialog: mutate }); try { g.edit(); assert.equal(g.status(), 'annulee'); assert.equal(g.writes(), 1); } finally { g.cleanup(); }
});
test('rendu : metadata uniquement en colonne masquée, notes lisibles et opérations en lot', () => {
  const g = cancellation(); try {
    assert.ok(g.log.some(r => r[0] === 'hideColumns' && r[2] === 7));
    assert.match(g.notes[g.row + ':5'], /^Choisissez Annulée/); assert.doesNotMatch(g.notes[g.row + ':5'], /generation|fingerprint|id_inscription/);
    assert.equal(JSON.parse(g.cells[g.row - 1][6]).id, 'I-1');
    assert.equal(g.log.filter(r => r[0] === 'notes' && r[2] === 15 && r[3] === 5).length, 1);
    assert.equal(g.log.filter(r => r[0] === 'validations' && r[2] === 15 && r[3] === 5).length, 1);
    let inputs; g.sheets[view.name].getProtections = () => [{ getDescription: () => 'TEMA_REGISTRATION_VIEW_V1', setUnprotectedRanges: ranges => { inputs = ranges; } }];
    view.refresh(g.book, false); assert.equal(inputs.length, 2); assert.equal(inputs[1].getColumn(), 5); assert.equal(inputs[1].getRow(), 15);
    g.edit({ range: g.sheets[view.name].getRange(g.row, 2), value: 'edited', oldValue: 'Personne I-1' }); assert.equal(g.writes(), 0);
  } finally { g.cleanup(); }
});
test('rendus successifs : validations de statut retirées avant écriture, y compris E45 orpheline hors valeurs', () => {
  const g = google(); Object.assign(context, g.globals);
  const sheet = g.sheets[view.name];
  sheet.getLastRow = () => g.cells.reduce((last, values, index) => values.some(value => value !== '') ? index + 1 : last, 0);
  assert.equal(view.refresh(g.book, false), true);
  const filters = g.cells[9].slice(1, 5), filterRules = JSON.stringify(Object.fromEntries(Object.entries(g.validations).filter(([key]) => key.startsWith('10:'))));
  const oldStatusRows = Object.keys(g.validations).filter(key => Number(key.split(':')[0]) >= 15);
  assert.ok(oldStatusRows.length > 0);
  const lock = g.globals.LockService.getUserLock(); assert.equal(lock.tryLock(), true);
  try {
    const orphan = sheet.getRange('E45');
    orphan.setDataValidation(['Confirmée', 'Annulée']); orphan.clear();
    assert.deepEqual(g.validations['45:5'], ['Confirmée', 'Annulée'], 'clear() retains the old validation like Google');
    assert.throws(() => orphan.setValue('Shifted group title'), /data validation refused 45:5/);
  } finally { lock.releaseLock(); }
  assert.ok(sheet.getLastRow() < 45);
  for (let i = 0; i < 3; i++) g.data.registrations.push(registration('I-shift-' + i, 'C-past'));
  set(g.data.registrations[1], 'statut', 'annulee');
  const source = JSON.stringify(g.data);
  assert.equal(view.refresh(g.book, false), true);
  assert.equal(JSON.stringify(g.data), source);
  assert.deepEqual(g.cells[9].slice(1, 5), filters);
  assert.equal(JSON.stringify(Object.fromEntries(Object.entries(g.validations).filter(([key]) => key.startsWith('10:')))), filterRules);
  assert.equal(g.validations['45:5'], undefined);
  const expected = [];
  g.cells.forEach((values, index) => {
    if (index < 14 || !values[6]) return;
    const identity = JSON.parse(values[6]);
    if (identity.id && identity.status === 'Confirmée') expected.push((index + 1) + ':5');
  });
  const actual = Object.keys(g.validations).filter(key => Number(key.split(':')[0]) >= 15);
  assert.deepEqual(actual.sort(), expected.sort());
  assert.notDeepEqual(actual.sort(), oldStatusRows.sort(), 'The participant rules move with the new group layout');
  for (const key of actual) assert.deepEqual(Array.from(g.validations[key]), ['Confirmée', 'Annulée']);
  assert.match(g.cells[11][1], /Contexte vérifié/);
});
