// Independent audit contracts. These deliberately expose unresolved defects in
// the reviewed candidate; do not weaken assertions to turn the audit green.
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

test('audit R2: reconciliation repairs a changed generated software choice', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs['Paramètres'], col = tab.values[0].indexOf('choix'), expected = tab.values[1][col];
  tab.values[1][col] = 'WRONG'; g.context.reconcileTrial();
  assert.equal(tab.values[1][col], expected);
});

test('audit R3: deleting the final formation removes its obsolete dropdown choice', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const column = g.tabs['Disponibilités'].values[0].indexOf('formation') + 1;
  g.tabs.Formations.values.splice(1); g.context.reconcileTrial();
  const lastValidation = g.validations.filter(v => v.name === 'Disponibilités' && v.column === column).at(-1);
  assert.ok(!lastValidation || lastValidation.rule.choices.length === 0, 'deleted formation must no longer be offered');
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
