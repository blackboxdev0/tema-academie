'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/admin-sheet-prototype.gs', 'utf8');
const context = { module: { exports: {} } };
vm.runInNewContext(source, context);
const p = context.module.exports;
const row = (n, values = {}) => Object.assign(Array(n).fill(''), values);
const heads = (n, c, label) => row(n, { [c]: label + ' — Formation' });
function input() {
  return {
    f: [heads(13, 2, 'Divalto'), row(13, { 0: 'DIV-OLD', 1: 'DIV — Divalto', 2: 'Ergonomie', 7: '1 jour', 8: 850, 10: 8, 12: true }), heads(13, 2, 'Dimo'), row(13, { 2: 'Prototype Dimo', 7: '1 jour', 8: 850, 10: 6, 12: false }), heads(13, 2, 'MoovApps')],
    s: [heads(12, 1, 'Divalto'), heads(12, 1, 'Dimo'), heads(12, 1, 'MoovApps')]
  };
}
const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
function deps(extra = {}) {
  let n = 0;
  return Object.assign({ uuid: () => 'uuid-' + ++n, now: () => Date.parse('2026-11-04T12:00:00Z'), confirmed: {}, cellText: v => String(v), formatLocal: ms => formatter.format(new Date(ms)).replace(' ', 'T') }, extra);
}
function publish() {
  const x = input();
  const first = p.plan(x.f, x.s, { sheet: 'Formations', first: 4, last: 4 }, deps());
  first.formations[3][12] = true;
  return p.plan(first.formations, first.sessions, { sheet: 'Formations', first: 4, last: 4 }, deps());
}
function session(label, extras = {}) { return row(12, Object.assign({ 1: label, 2: '2027-02-10', 3: '09:00', 4: '17:00', 6: 'en_ligne' }, extras)); }
test('nouvelle fiche : ID stable, brouillon, aucune session créée', () => {
  const x = input(), a = p.plan(x.f, x.s, { sheet: 'Formations', first: 4, last: 4 }, deps());
  assert.match(a.formations[3][0], /^DIMO-PR-/);
  assert.equal(a.formations[3][12], false);
  assert.equal(a.lists.DIMO.length, 0);
  assert.equal(a.sessions.length, x.s.length);
  const b = p.plan(a.formations, a.sessions, null, deps({ uuid: () => { throw Error('ID recréé'); } }));
  assert.equal(a.formations[3][0], b.formations[3][0]);
  assert.deepEqual(x.f[1], Array.from(a.formations[1]));
});
test('publication : nouvelle fiche dans les seuls choix du logiciel', () => {
  const a = publish();
  assert.equal(a.lists.DIMO.length, 1);
  assert.match(a.lists.DIMO[0], /Prototype Dimo$/);
  assert.equal(a.lists.MOOV.length, 0);
  assert.equal(a.lists.DIV.length, 1);
});
test('trois sessions : même fiche, IDs distincts, capacités explicites indépendantes et fermeture par défaut', () => {
  const a = publish(), label = a.lists.DIMO[0];
  const rows = [a.sessions[0], a.sessions[1], session(label, { 5: 6 }), session(label, { 2: '2027-03-10', 5: 12 }), session(label, { 2: '2027-04-14', 5: 4 }), a.sessions[2]];
  const b = p.plan(a.formations, rows, { sheet: 'Disponibilités', first: 3, last: 5 }, deps());
  const dates = b.sessions.slice(2, 5);
  assert.equal(new Set(dates.map(r => r[0])).size, 3);
  assert.equal(new Set(dates.map(r => r[1])).size, 1);
  assert.deepEqual(Array.from(dates.map(r => r[5])), [6, 12, 4]);
  assert.deepEqual(Array.from(dates.map(r => r[9])), [6, 12, 4]);
  assert.ok(dates.every(r => r[8] === false && r[10] === ''));
  dates[0][5] = 2;
  const c = p.plan(b.formations, b.sessions, { sheet: 'Disponibilités', first: 3, last: 3 }, deps());
  assert.equal(c.sessions[3][5], 12);
  assert.equal(c.sessions[4][5], 4);
});
test('capacité effacée après initialisation : pas de remplissage implicite', () => {
  const a = publish();
  const r = session(a.lists.DIMO[0], { 0: 'C-existing', 5: '', 8: true });
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], r, a.sessions[2]], { sheet: 'Disponibilités', first: 3, last: 3 }, deps());
  assert.equal(b.sessions[2][5], '');
  assert.equal(b.sessions[2][8], false);
  assert.match(b.sessions[2][10], /capacité/);
});
for (const [name, extras] of [
  ['date impossible', { 2: '2027-02-30' }], ['fin avant début', { 4: '08:00' }],
  ['capacité décimale', { 5: 2.5 }], ['capacité zéro', { 5: 0 }],
  ['date passée', { 2: '2026-01-01' }], ['lieu absent', { 6: 'presentiel' }],
  ['heure inexistante DST', { 2: '2027-03-14', 3: '02:30', 4: '04:00' }],
  ['heure ambiguë DST', { 2: '2027-11-07', 3: '01:30', 4: '04:00' }]
]) test(name + ' : ouverture refusée, diagnostic', () => {
  const a = publish(), r = session(a.lists.DIMO[0], Object.assign({ 5: 6, 8: true }, extras));
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], r, a.sessions[2]], { sheet: 'Disponibilités', first: 3, last: 3 }, deps());
  assert.equal(b.sessions[2][8], false);
  assert.ok(b.sessions[2][10]);
});
test('formation d’un autre logiciel : ouverture refusée', () => {
  const a = publish();
  const b = p.plan(a.formations, [a.sessions[0], session(a.lists.DIMO[0], { 8: true }), a.sessions[1], a.sessions[2]], { sheet: 'Disponibilités', first: 2, last: 2 }, deps());
  assert.equal(b.sessions[1][8], false);
  assert.match(b.sessions[1][10], /autre logiciel/);
});
test('renommage puis dépublication : référence stable, liste actualisée, sessions fermées', () => {
  const a = publish(), id = a.formations[3][0];
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], session(a.lists.DIMO[0], { 5: 6, 8: true }), a.sessions[2]], { sheet: 'Disponibilités', first: 3, last: 3 }, deps());
  b.formations[3][2] = 'Nouveau titre';
  let c = p.plan(b.formations, b.sessions, { sheet: 'Formations', first: 4, last: 4 }, deps());
  assert.equal(c.formations[3][0], id);
  assert.equal(c.sessions[2][1], id + ' — Nouveau titre');
  c.formations[3][12] = false;
  c = p.plan(c.formations, c.sessions, { sheet: 'Formations', first: 4, last: 4 }, deps());
  assert.equal(c.lists.DIMO.length, 0);
  assert.equal(c.sessions[2][8], false);
});
test('suppression du titre référencé : session bloquée', () => {
  const a = publish();
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], session(a.lists.DIMO[0], { 5: 6, 8: true }), a.sessions[2]], { sheet: 'Disponibilités', first: 3, last: 3 }, deps());
  b.formations[3][2] = '';
  const c = p.plan(b.formations, b.sessions, { sheet: 'Formations', first: 4, last: 4 }, deps());
  assert.equal(c.sessions[2][8], false);
  assert.ok(c.sessions[2][10]);
});
test('publication invalide et tarif nul : contrôles cohérents avec le moteur', () => {
  const x = input(); x.f[3][7] = ''; x.f[3][12] = true;
  assert.equal(p.plan(x.f, x.s, { sheet: 'Formations', first: 4, last: 4 }, deps()).formations[3][12], false);
  x.f[3][7] = '1 jour'; x.f[3][8] = 0;
  assert.equal(p.plan(x.f, x.s, { sheet: 'Formations', first: 4, last: 4 }, deps()).lists.DIMO.length, 1);
});
test('compteur des confirmées et refus d’une capacité inférieure', () => {
  const a = publish();
  const r = session(a.lists.DIMO[0], { 0: 'C-example', 5: 2, 8: true });
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], r, a.sessions[2]], { sheet: 'Disponibilités', first: 3, last: 3 }, deps({ confirmed: { 'C-example': 3 } }));
  assert.equal(b.sessions[2][9], 0); assert.equal(b.sessions[2][8], false);
});
test('hors copie : aucun appel de lecture ou écriture Google', () => {
  p.sync({ getId: () => 'original-forbidden' }, null);
  context.onEdit({ source: { getId: () => 'original-forbidden' }, range: { getSheet: () => { throw Error('ne doit pas lire'); } } });
});
test('trois sections exigées : dégradation explicite', () => {
  assert.throws(() => p.sections([heads(13, 2, 'Divalto')], 2), /trois sections/);
});
test('effacer une référence conserve la ligne mais ferme la session', () => {
  const a = publish(), r = session('', { 0: 'C-missing', 5: 6, 8: true });
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], r, a.sessions[2]], { sheet: 'Disponibilités', first: 3, last: 3 }, deps());
  assert.equal(b.sessions[2][0], 'C-missing'); assert.equal(b.sessions[2][8], false);
  assert.match(b.sessions[2][10], /Choisissez une formation/);
});
test('copier une session crée un nouvel ID fermé, sans modifier l’original', () => {
  const a = publish(), r = session(a.lists.DIMO[0], { 0: 'C-original', 5: 6, 8: true });
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], r, r.slice(), a.sessions[2]], { sheet: 'Disponibilités', first: 4, last: 4 }, deps());
  assert.equal(b.sessions[2][0], 'C-original'); assert.equal(b.sessions[2][8], true);
  assert.notEqual(b.sessions[3][0], 'C-original'); assert.equal(b.sessions[3][8], false);
});
test('copier une formation conserve la fiche originale et crée un nouveau brouillon', () => {
  const a = publish(), f = a.formations.slice(); f.splice(4, 0, f[3].slice());
  const b = p.plan(f, a.sessions, { sheet: 'Formations', first: 5, last: 5 }, deps({ uuid: () => 'new-copy' }));
  assert.equal(b.formations[3][0], a.formations[3][0]);
  assert.notEqual(b.formations[4][0], a.formations[3][0]); assert.equal(b.formations[4][12], false);
});
test('réouverture : compteur recalculé même pour une session fermée', () => {
  const a = publish(), r = session(a.lists.DIMO[0], { 0: 'C-closed', 5: 8, 8: false, 9: 8 });
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], r, a.sessions[2]], null, deps({ confirmed: { 'C-closed': 3 } }));
  assert.equal(b.sessions[2][9], 5); assert.equal(b.sessions[2][8], false);
});
test('réconciliation initiale : publication invalide corrigée et expliquée', () => {
  const a = publish(); a.formations[3][7] = '';
  const b = p.plan(a.formations, a.sessions, null, deps());
  assert.equal(b.formations[3][12], false); assert.ok(b.notes.some(n => n.message.includes('durée')));
});

function fakeGoogle(options = {}) {
  const x = input(), labels = publish();
  x.f = Array.from(labels.formations, r => Array.from(r));
  x.s = [heads(12, 1, 'Divalto'), heads(12, 1, 'Dimo'), session(labels.lists.DIMO[0], { 0: 'C-test', 2: new Date('2027-02-10T05:00:00Z'), 3: new Date('1899-12-30T14:00:00Z'), 4: '17:00', 5: 8, 8: false, 9: 8 }), heads(12, 1, 'MoovApps')];
  const log = [], state = { locked: false, released: false, flushed: false };
  function sheet(name, rows, max = 100) {
    const s = { name, rows, getName: () => name, getLastRow: () => rows.length, getLastColumn: () => rows[0].length, getMaxRows: () => max,
      insertRowsBefore(r, count) { rows.splice(r - 1, 0, ...Array.from({ length: count }, () => row(rows[0].length))); log.push(['insert', name, r]); },
      getRange(r, c, nr = 1, nc = 1) { return {
        getValue() { if (options.beforeCellRead) options.beforeCellRead(name, r, c, rows); return rows[r - 1]?.[c - 1] ?? ''; },
        getValues() { return Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => rows[r + i - 1]?.[c + j - 1] ?? '')); },
        setValue(v) { assert.ok(['Formations', 'Disponibilités'].includes(name)); rows[r - 1][c - 1] = v; log.push(['value', name, r, c]); },
        setNote(v) { log.push(['note', name, r, c, v]); },
        setDataValidations(v) { if (options.throwValidation) throw Error('validation refused'); log.push(['validation', name, r, c, v]); }
      }; }
    }; return s;
  }
  const registration = [row(8, { 4: 'id_cohorte', 6: 'statut' }), row(8, { 4: 'C-test', 6: 'confirmee' })];
  const sheets = { Formations: sheet('Formations', x.f), 'Disponibilités': sheet('Disponibilités', x.s), Inscriptions: sheet('Inscriptions', registration) };
  const book = { getId: () => p.target, getSheetByName: n => sheets[n], toast: (...a) => log.push(['toast', ...a]) };
  const globals = {
    Date: new Proxy(Date, { get(target, key) { return key === 'now' ? () => Date.parse('2026-11-04T12:00:00Z') : target[key]; } }),
    LockService: { getScriptLock: () => ({ tryLock: () => { state.locked = true; return true; }, releaseLock: () => { state.released = true; } }) },
    Utilities: { getUuid: () => 'adapter-uuid', formatDate(v, zone, pattern) {
      if (pattern === "yyyy-MM-dd'T'HH:mm") return formatter.format(v).replace(' ', 'T');
      if (pattern === 'yyyy-MM-dd') return formatter.format(v).slice(0, 10);
      // Date de base des heures Sheets : garder 09:00 pour le cas adapter.
      return '09:00';
    } },
    SpreadsheetApp: { flush: () => { state.flushed = true; }, newDataValidation: () => {
      const rule = { choices: null, reject: null, requireValueInList(v) { this.choices = v; return this; }, setAllowInvalid(v) { this.reject = !v; return this; }, setHelpText() { return this; }, build() { return { choices: this.choices, reject: this.reject }; } }; return rule;
    } }
  };
  return { book, sheets, globals, log, state };
}
test('adaptateur autorisé : listes par section, dates Sheets et compteurs sans écriture Inscriptions', () => {
  const g = fakeGoogle(); Object.assign(context, g.globals);
  context.onOpen({ source: g.book });
  const dates = p.records(g.sheets['Disponibilités'].rows, 1);
  assert.equal(dates[0].values[9], 7);
  assert.ok(g.log.some(x => x[0] === 'validation' && x[4].some(v => v[0]?.choices.some(s => s.includes('Prototype Dimo')))));
  assert.ok(g.state.locked && g.state.released && g.state.flushed);
  assert.ok(!g.log.some(x => x[0] === 'value' && x[1] === 'Inscriptions'));
  assert.ok(g.log.some(x => x[0] === 'insert'));
});
test('édition Inscriptions : compteur réconcilié en lecture seule', () => {
  const g = fakeGoogle(); Object.assign(context, g.globals);
  context.onEdit({ source: g.book, range: { getSheet: () => g.sheets.Inscriptions, getRow: () => 2, getLastRow: () => 2 } });
  assert.equal(p.records(g.sheets['Disponibilités'].rows, 1)[0].values[9], 7);
  assert.ok(!g.log.some(x => x[0] === 'value' && x[1] === 'Inscriptions'));
});
test('échec Google : verrou libéré et erreur visible', () => {
  const g = fakeGoogle({ throwValidation: true }); Object.assign(context, g.globals);
  assert.throws(() => context.onOpen({ source: g.book }), /validation refused/);
  assert.equal(g.state.released, true); assert.ok(g.log.some(x => x[0] === 'toast'));
});
test('case seule sur une ligne vide : publication et ouverture refusées', () => {
  const x = input(); x.f.splice(4, 0, row(13, { 12: true }));
  const f = p.plan(x.f, x.s, { sheet: 'Formations', first: 5, last: 5 }, deps());
  assert.equal(f.formations[4][12], false); assert.equal(f.formations[4][0], '');
  x.s.splice(2, 0, row(12, { 8: true }));
  const s = p.plan(x.f, x.s, { sheet: 'Disponibilités', first: 3, last: 3 }, deps());
  assert.equal(s.sessions[2][8], false); assert.equal(s.sessions[2][0], '');
  assert.ok(s.notes.some(n => n.message.includes('Choisissez')));
});
test('récupération de capacité : diagnostic et note précédents remplacés', () => {
  const a = publish(), r = session(a.lists.DIMO[0], { 0: 'C-recover', 5: 2, 8: false, 10: 'La capacité est inférieure aux inscriptions confirmées.' });
  const b = p.plan(a.formations, [a.sessions[0], a.sessions[1], r, a.sessions[2]], { sheet: 'Inscriptions', first: 2, last: 2 }, deps({ confirmed: { 'C-recover': 1 } }));
  assert.equal(b.sessions[2][9], 1); assert.equal(b.sessions[2][10], '');
  assert.ok(b.notes.some(n => n.sheet === 'Disponibilités' && n.row === 3 && n.message === ''));
});
test('adaptateur : ouverture valide avec date et heure typées Google', () => {
  const g = fakeGoogle(); g.sheets['Disponibilités'].rows[2][8] = true;
  Object.assign(context, g.globals); context.onOpen({ source: g.book });
  const r = p.records(g.sheets['Disponibilités'].rows, 1)[0].values;
  assert.equal(r[8], true); assert.equal(r[10], ''); assert.equal(r[9], 7);
});
test('création : capacité et format laissés à la saisie, jamais écrits par le script', () => {
  const g = fakeGoogle();
  const original = g.sheets['Disponibilités'].rows[2]; original[0] = ''; original[5] = ''; original[6] = '';
  Object.assign(context, g.globals); context.onOpen({ source: g.book });
  const r = p.records(g.sheets['Disponibilités'].rows, 1)[0].values;
  assert.equal(r[5], ''); assert.equal(r[6], ''); assert.equal(r[8], false);
  assert.ok(!g.log.some(x => x[0] === 'value' && x[1] === 'Disponibilités' && [6, 7].includes(x[3])));
});
test('saisie pendant calcul : capacité humaine conservée sans défaut concurrent', () => {
  let changed = false;
  const g = fakeGoogle({ beforeCellRead(name, r, c, rows) {
    if (!changed && name === 'Disponibilités' && c === 1) { rows[r - 1][5] = 12; changed = true; }
  } });
  g.sheets['Disponibilités'].rows[2][0] = '';
  g.sheets['Disponibilités'].rows[2][5] = '';
  Object.assign(context, g.globals); context.onOpen({ source: g.book });
  const r = p.records(g.sheets['Disponibilités'].rows, 1)[0].values;
  assert.equal(changed, true); assert.equal(r[5], 12);
  context.onOpen({ source: g.book });
  assert.equal(p.records(g.sheets['Disponibilités'].rows, 1)[0].values[9], 12);
  assert.ok(!g.log.some(x => x[0] === 'value' && x[1] === 'Disponibilités' && x[3] === 6));
});
