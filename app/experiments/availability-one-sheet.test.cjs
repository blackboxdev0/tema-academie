const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const TemaTrial = require('../apps-script/engine.js');

test('lit exclusivement Disponibilités et projette seulement les champs de mesure', () => {
  const calls = [];
  const row = { id_cohorte: 'C-test', formation: 'F1 — Formation', date: '2030-01-15', heure_debut: '09:00', heure_fin: '12:00', mode: 'en_ligne', places_restantes: 3, inscriptions_ouvertes: true, etat_validation: '', lieu_ou_lien: 'https://secret.invalid' };
  const context = { Date, TemaTrial, trialSheet_: () => 'sheet', trialReadTable_: (sheet, name) => { calls.push(name); return [row, { ...row, id_cohorte: 'closed', inscriptions_ouvertes: false }, { ...row, id_cohorte: 'invalid', etat_validation: 'private error' }]; }, trialJson_: value => value,
    Utilities: { formatDate: date => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Toronto', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23' }).format(date).replace(' ', 'T') } };
  vm.runInNewContext(fs.readFileSync(__dirname + '/availability-one-sheet.gs', 'utf8'), context);
  const result = context.availabilityOneSheetGet_();
  assert.deepEqual(calls, ['Disponibilités']); assert.equal(result.sessions.length, 1);
  assert.equal(result.sessions[0].places_restantes, 3); assert.equal(result.sessions[0].start_at, '2030-01-15T14:00:00.000Z');
  assert.ok(!JSON.stringify(result).includes('secret.invalid')); assert.ok(!JSON.stringify(result).includes('private error'));
});
