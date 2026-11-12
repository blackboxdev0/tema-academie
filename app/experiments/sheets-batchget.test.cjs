const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { TemaTrial, harness } = require('../tests/helpers.cjs');
const google = fs.readFileSync(require.resolve('../apps-script/google.js'), 'utf8');
const prototype = fs.readFileSync(__dirname + '/sheets-batchget.gs', 'utf8');
const serialDate = date => (Date.parse(date + 'T00:00:00Z') - Date.UTC(1899, 11, 30)) / 86400000;
const serialTime = time => { const [h, m] = time.split(':').map(Number); return (h * 60 + m) / 1440; };
const plain = value => JSON.parse(JSON.stringify(value));

function values(data, numericDates = true) {
  const tables = ['Formations', 'Disponibilités', 'Inscriptions'].map((name, index) => {
    const rows = [data.formations, data.sessions, data.registrations][index];
    const headers = TemaTrial.HEADERS[name];
    const table = [headers, ...rows.map(row => headers.map(key => {
      const value = row[key] === undefined ? '' : row[key];
      if (name === 'Disponibilités' && numericDates) {
        if (key === 'date') return serialDate(value);
        if (key === 'heure_debut' || key === 'heure_fin') return serialTime(value);
      }
      return value;
    }))];
    const defaults = headers.map(key => key === 'actif' || key === 'inscriptions_ouvertes' ? false : '');
    if (name !== 'Inscriptions') table.push(defaults);
    table.push([]);
    return { values: table.map(row => { const copy = row.slice(); while (copy.at(-1) === '') copy.pop(); return copy; }) };
  });
  const headers = ['cle', 'valeur', 'description', 'id', 'label', 'choix'];
  const rows = Object.entries(data.params).filter(([key]) => key !== 'softwares').map(([key, value]) => [key, value]);
  data.params.softwares.forEach(software => rows.push(['', '', '', software.id, software.label]));
  return { valueRanges: [...tables, { values: [headers, ...rows, []] }] };
}
function setup(h, response = values(h.data)) {
  const calls = [];
  const context = { Date, TemaTrial, SpreadsheetApp: { openById() { throw Error('Native read forbidden in batch path'); } } };
  vm.createContext(context); vm.runInContext(google, context);
  context.trialGuard_ = () => calls.push('guard');
  context.trialDependencies_ = () => h.deps;
  context.trialJson_ = value => value;
  context.Sheets = { Spreadsheets: { Values: { batchGet(id, options) { calls.push({ id, options }); return response; } } } };
  vm.runInContext(prototype, context);
  return { context, calls, response };
}
function comparable(result) { const copy = plain(result); delete copy.benchmark; return copy; }

test('une requête batch, catalogue public identique hiver/été, places recomptées et données privées exclues', () => {
  const h = harness();
  h.service.register(h.command());
  h.data.sessions[0].places_restantes = 99;
  const { context, calls } = setup(h);
  const expected = h.service.catalogue();
  const result = context.batchCatalogueGet_();
  assert.deepEqual(comparable(result), plain(expected));
  assert.equal(calls.filter(call => typeof call === 'object').length, 1);
  const request = calls.find(call => typeof call === 'object');
  assert.deepEqual(plain(request.options.ranges), ["'Formations'!A:N", "'Disponibilités'!A:L", "'Inscriptions'!A:AC", "'Paramètres'!A:Z"]);
  assert.equal(request.options.valueRenderOption, 'UNFORMATTED_VALUE');
  assert.equal(request.options.dateTimeRenderOption, 'SERIAL_NUMBER');
  assert.equal(result.sessions[0].start_at, '2030-01-15T14:00:00.000Z');
  assert.equal(result.sessions[1].start_at, '2030-07-15T13:00:00.000Z');
  assert.equal(result.sessions[0].places_restantes, 2);
  assert.equal(result.formations.length, 1); assert.equal(result.sessions.length, 2);
  const output = JSON.stringify(result);
  for (const privateValue of ['participant@example.invalid', 'PRIVATE_VIDEO', 'PRIVATE_TRAINER', 'Anne', 'payload_fingerprint']) assert.ok(!output.includes(privateValue));
  assert.equal(result.benchmark.reader, 'sheets-batchget-v1');
});

test('chaînes canoniques et types booléens restent compatibles, témoin natif produit le même contrat', () => {
  const h = harness(); const { context } = setup(h, values(h.data, false));
  assert.deepEqual(comparable(context.batchCatalogueGet_()), plain(h.service.catalogue()));
  const native = context.batchNativeCatalogueGet_();
  assert.equal(native.benchmark.reader, 'spreadsheetapp-v1');
  assert.deepEqual(comparable(native), plain(h.service.catalogue()));
});

test('fractions horaires conservent la minute et dates numériques conservent le jour', () => {
  const { context } = setup(harness());
  assert.equal(context.batchSheetTime_(9.5 / 24), '09:30');
  assert.equal(context.batchSheetTime_((9 * 3600 + 59) / 86400), '09:00');
  assert.equal(context.batchSheetTime_((23 * 3600 + 59 * 60 + 59) / 86400), '23:59');
  assert.equal(context.batchSheetDate_(serialDate('2030-07-15') + 0.75), '2030-07-15');
  assert.equal(context.batchSheetDate_('2030-07-15'), '2030-07-15');
});

test('erreurs API, en-têtes invalides et clé paramètre dupliquée retournent uniquement UNAVAILABLE', () => {
  for (const mutate of [
    setup => { setup.context.Sheets.Spreadsheets.Values.batchGet = () => { throw Error('private token'); }; },
    setup => { setup.response.valueRanges[0].values[0] = ['bad']; },
    setup => { setup.response.valueRanges[3].values.push(['courriel_contact', 'duplicate@example.invalid']); }
  ]) {
    const state = setup(harness()); mutate(state);
    assert.deepEqual(plain(state.context.batchCatalogueGet_()), { schema_version: 1, code: 'UNAVAILABLE' });
  }
});

test('Paramètres accepte la colonne séparatrice et choix après F comme dans TEST réel', () => {
  const h = harness(); const response = values(h.data);
  const table = response.valueRanges[3].values;
  table.forEach(row => row.splice(3, 0, ''));
  const { context } = setup(h, response);
  assert.deepEqual(comparable(context.batchCatalogueGet_()), plain(h.service.catalogue()));
});
