// R2 is out of the authorized correction scope and remains an open failing contract.
const test = require('node:test');
const assert = require('node:assert/strict');
const { googleContext } = require('../google-helpers.cjs');

test('audit R2: reconciliation repairs a changed generated software choice', () => {
  const g = googleContext(); g.context.reconcileTrial();
  const tab = g.tabs['Paramètres'], col = tab.values[0].indexOf('choix'), expected = tab.values[1][col];
  tab.values[1][col] = 'WRONG'; g.context.reconcileTrial();
  assert.equal(tab.values[1][col], expected);
});

