// Accepted corrective contracts from the independent audit.
// Optional R2 remains in optional-regressions.test.cjs, outside this gate.
// Run: node --test tests/audit/known-regressions.test.cjs
// All Sheets operations below use the local in-memory Google adapter.
const test = require('node:test');
const assert = require('node:assert/strict');
const { googleContext } = require('../google-helpers.cjs');

test('audit R1: a temporary invalid title must not erase the administrator’s existing cell note', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs.Formations, column = tab.values[0].indexOf('titre'), title = tab.values[1][column];
  tab.notes.set(`2:${column + 1}`, 'Note métier fictive à conserver');
  tab.values[1][column] = ''; g.context.reconcileTrial();
  tab.values[1][column] = title; g.context.reconcileTrial();
  assert.ok(tab.notes.get(`2:${column + 1}`).includes('Note métier fictive à conserver'));
});

test('audit R3: deleting the final formation removes its obsolete dropdown choice', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const column = g.tabs['Disponibilités'].values[0].indexOf('formation') + 1;
  g.tabs.Formations.values.splice(1); g.context.reconcileTrial();
  const lastValidation = g.validations.filter(v => v.name === 'Disponibilités' && v.column === column).at(-1);
  assert.ok(!lastValidation || !lastValidation.rule || lastValidation.rule.choices.length === 0, 'deleted formation must no longer be offered');
});

test('audit R4: invalid capacity clears the formerly valid derived remaining-place count', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs['Disponibilités'], capacity = tab.values[0].indexOf('places_max'), remaining = tab.values[0].indexOf('places_restantes');
  assert.equal(tab.values[1][remaining], 3);
  tab.values[1][capacity] = ''; g.context.reconcileTrial();
  assert.equal(tab.values[1][remaining], '', 'an invalid capacity cannot have an authoritative count');
});

for (const variant of ['duplicate-label', 'empty-label', 'ungeneratable-label']) {
  test('audit R5: invalid software has a private actionable diagnostic: ' + variant, () => {
    const g = googleContext(); g.context.reconcileTrial();
    const tab = g.tabs['Paramètres'], label = tab.values[0].indexOf('label');
    let affectedRow = 3;
    if (variant === 'duplicate-label') tab.values[2][label] = tab.values[1][label];
    else if (variant === 'empty-label') tab.values[2][label] = '';
    else { const line = Array(tab.values[0].length).fill(''); line[label] = '!!!'; tab.values.push(line); affectedRow = tab.values.length; }
    try { g.context.reconcileTrial(); } catch (error) { assert.equal(error.message, 'CONFIG'); }
    assert.equal(JSON.parse(g.context.doGet({}).text).code, 'UNAVAILABLE');
    const diagnostic = tab.notes.get(`${affectedRow}:${label + 1}`) || '';
    assert.match(diagnostic, /logiciel|libellé|label/i, 'the affected label cell must identify its software error');
  });
}

test('audit R1: notes edited during and after a diagnostic survive; only the owned block is removed', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs.Formations, column = tab.values[0].indexOf('titre'), key = `2:${column + 1}`, title = tab.values[1][column];
  tab.notes.set(key, 'Note initiale'); tab.values[1][column] = ''; g.context.reconcileTrial();
  assert.match(tab.notes.get(key), /Titre requis/); assert.match(tab.notes.get(key), /Note initiale/);
  tab.notes.set(key, 'Note corrigée pendant le diagnostic\n' + tab.notes.get(key).slice(tab.notes.get(key).indexOf('[TEM-6 diagnostic]')) + '\nAjout humain');
  tab.values[1][column] = title; g.context.reconcileTrial();
  assert.equal(tab.notes.get(key), 'Note corrigée pendant le diagnostic\nAjout humain');
  tab.notes.set(key, 'Note après correction'); tab.values[1][column] = ''; g.context.reconcileTrial();
  tab.values[1][column] = title; g.context.reconcileTrial();
  assert.equal(tab.notes.get(key), 'Note après correction'); assert.equal(g.sent.length, 0);
});

test('audit R1: a human replacement of a diagnostic and unrelated TEM-6 prose remain intact', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs.Formations, column = tab.values[0].indexOf('titre'), key = `2:${column + 1}`, title = tab.values[1][column];
  tab.values[1][column] = ''; g.context.reconcileTrial(); tab.notes.set(key, 'TEM-6 — note humaine libre');
  tab.values[1][column] = title; g.context.reconcileTrial(); assert.equal(tab.notes.get(key), 'TEM-6 — note humaine libre');
});

test('audit R3: ambiguous final formation clears the list and a repaired row restores it', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs.Formations, column = g.tabs['Disponibilités'].values[0].indexOf('formation') + 1;
  tab.values.push(tab.values[1].slice()); g.context.reconcileTrial();
  assert.equal(g.validations.filter(v => v.name === 'Disponibilités' && v.column === column).at(-1).rule, null);
  tab.values.pop(); g.context.reconcileTrial();
  assert.equal(g.validations.filter(v => v.name === 'Disponibilités' && v.column === column).at(-1).rule.choices.length, 1);
});

for (const invalid of [0, -1, 1.5, 'invalide']) test('audit R4: invalid capacity clears remaining places: ' + invalid, () => {
  const g = googleContext(); g.context.reconcileTrial(); const tab = g.tabs['Disponibilités'];
  tab.values[1][tab.values[0].indexOf('places_max')] = invalid; g.context.reconcileTrial();
  assert.equal(tab.values[1][tab.values[0].indexOf('places_restantes')], '');
  assert.match(tab.values[1][tab.values[0].indexOf('etat_validation')], /Capacité/);
  assert.equal(JSON.parse(g.context.doGet({}).text).sessions.some(s => s.id_cohorte === tab.values[1][0]), false);
});

test('audit R5: fixing the software clears only its diagnostic and preserves human notes', () => {
  const g = googleContext(); g.context.reconcileTrial(); const tab = g.tabs['Paramètres'], label = tab.values[0].indexOf('label'), key = `3:${label + 1}`;
  tab.notes.set(key, 'Note logiciel humaine'); tab.values[2][label] = '';
  assert.throws(() => g.context.reconcileTrial(), /CONFIG/); assert.match(tab.notes.get(key), /Libellé logiciel requis/);
  tab.notes.set(key, tab.notes.get(key) + '\nAjout pendant diagnostic'); tab.values[2][label] = 'Dimo'; g.context.reconcileTrial();
  assert.equal(tab.notes.get(key), 'Note logiciel humaine\nAjout pendant diagnostic');
  assert.equal(JSON.parse(g.context.doGet({}).text).schema_version, 1); assert.equal(g.sent.length, 0);
});

for (const label of ['constructor', '__proto__', 'toString']) test('audit R11: a valid software label may match Object.prototype: ' + label, () => {
  const g = googleContext(); g.context.reconcileTrial(); const tab = g.tabs['Paramètres'];
  tab.values[1][tab.values[0].indexOf('label')] = label; g.context.reconcileTrial();
  const catalogue = JSON.parse(g.context.doGet({}).text);
  assert.equal(catalogue.softwares.find(s => s.id === 'DIV').label, label);
  assert.equal(catalogue.formations.length, 1);
});

test('audit R5: interrupted diagnostic flush followed by exact repair cannot retain a stale warning', () => {
  const g = googleContext(); g.context.reconcileTrial(); const tab = g.tabs['Paramètres'], label = tab.values[0].indexOf('label'), key = `3:${label + 1}`;
  tab.notes.set(key, 'Note humaine'); tab.values[2][label] = '';
  const flush = g.context.SpreadsheetApp.flush; g.context.SpreadsheetApp.flush = () => { throw Error('FLUSH_INTERRUPTED'); };
  assert.throws(() => g.context.reconcileTrial(), /FLUSH_INTERRUPTED/);
  assert.match(tab.notes.get(key), /Libellé logiciel requis/);
  tab.values[2][label] = 'Dimo'; g.context.SpreadsheetApp.flush = flush; g.context.reconcileTrial();
  assert.equal(tab.notes.get(key), 'Note humaine'); assert.equal(g.sent.length, 0);
});

test('audit R3: interrupted list removal followed by exact formation restoration repairs validation', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs.Formations, row = tab.values[1].slice(), column = g.tabs['Disponibilités'].values[0].indexOf('formation') + 1;
  const choice = g.validations.filter(v => v.name === 'Disponibilités' && v.column === column).at(-1).rule.choices[0];
  tab.values.splice(1);
  const flush = g.context.SpreadsheetApp.flush; g.context.SpreadsheetApp.flush = () => { throw Error('FLUSH_INTERRUPTED'); };
  assert.throws(() => g.context.reconcileTrial(), /FLUSH_INTERRUPTED/);
  assert.equal(g.validations.filter(v => v.name === 'Disponibilités' && v.column === column).at(-1).rule, null);
  tab.values.push(row); g.context.SpreadsheetApp.flush = flush; g.context.reconcileTrial();
  assert.deepEqual([...g.validations.filter(v => v.name === 'Disponibilités' && v.column === column).at(-1).rule.choices], [choice]);
  const mutations = g.mutations.length, properties = [...g.properties];
  assert.equal(g.context.reconcileTrial().patches, 0); assert.equal(g.mutations.length, mutations); assert.deepEqual([...g.properties], properties);
});

test('audit R5: diagnostic write taking effect then throwing cannot leave a stale administration checkpoint', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs['Paramètres'], label = tab.values[0].indexOf('label'), key = `3:${label + 1}`, getRange = tab.getRange.bind(tab);
  tab.notes.set(key, 'Note humaine'); tab.values[2][label] = '';
  tab.getRange = (...args) => {
    const range = getRange(...args), setNotes = range.setNotes.bind(range);
    range.setNotes = notes => { setNotes(notes); throw Error('NOTES_INTERRUPTED'); }; return range;
  };
  assert.throws(() => g.context.reconcileTrial(), /NOTES_INTERRUPTED/); assert.match(tab.notes.get(key), /Libellé logiciel requis/);
  tab.values[2][label] = 'Dimo'; tab.getRange = getRange; g.context.reconcileTrial();
  assert.equal(tab.notes.get(key), 'Note humaine'); assert.equal(g.sent.length, 0);
});

test('audit R5: fully clearing the last invalid software row clears its owned diagnostic outside the values range', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs['Paramètres'], label = tab.values[0].indexOf('label'), id = tab.values[0].indexOf('id');
  const line = Array(tab.values[0].length).fill(''); line[label] = '!!!'; tab.values.push(line);
  const row = tab.values.length, labelKey = `${row}:${label + 1}`, idKey = `${row}:${id + 1}`;
  tab.notes.set(labelKey, 'Note du libellé'); tab.notes.set(idKey, 'Note de l’identifiant');
  assert.throws(() => g.context.reconcileTrial(), /CONFIG/); assert.match(tab.notes.get(labelKey), /Libellé logiciel sans/);
  tab.notes.set(labelKey, tab.notes.get(labelKey) + '\nAjout humain'); tab.values[row - 1].fill('');
  assert.ok(tab.getLastRow() < row); g.context.reconcileTrial();
  assert.equal(tab.notes.get(labelKey), 'Note du libellé\nAjout humain'); assert.equal(tab.notes.get(idKey), 'Note de l’identifiant');
  assert.equal(JSON.parse(g.context.doGet({}).text).schema_version, 1); assert.equal(g.sent.length, 0);
});
