// Prototype TEST en lecture seule. Aucun cache ni export des tables privées.
function batchSheetDate_(value) {
  if (typeof value !== 'number') return value;
  if (!Number.isFinite(value)) throw TemaTrial.fault('CONFIG');
  return new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000).toISOString().slice(0, 10);
}
function batchSheetTime_(value) {
  if (typeof value !== 'number') return value;
  if (!Number.isFinite(value)) throw TemaTrial.fault('CONFIG');
  var milliseconds = Math.round((value - Math.floor(value)) * 86400000);
  var minutes = Math.floor(milliseconds / 60000) % 1440;
  return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
}
function batchTableRows_(values, name) {
  if (!Array.isArray(values) || !values.length) throw TemaTrial.fault('CONFIG');
  var headers = values[0];
  TemaTrial.tableRows([headers], TemaTrial.HEADERS[name]);
  var rows = [];
  values.slice(1).forEach(function (line) {
    if (!trialUsefulRow_(line, headers, name)) return;
    var row = TemaTrial.tableRows([headers, line], TemaTrial.HEADERS[name])[0];
    if (name === 'Disponibilités') {
      row.date = batchSheetDate_(row.date);
      row.heure_debut = batchSheetTime_(row.heure_debut);
      row.heure_fin = batchSheetTime_(row.heure_fin);
    }
    rows.push(row);
  });
  return rows;
}
function batchParams_(values) {
  if (!Array.isArray(values) || !values.length) throw TemaTrial.fault('CONFIG');
  var headers = values[0].map(String), required = ['cle', 'valeur', 'description', 'id', 'label', 'choix'];
  if (required.some(function (key) { return headers.indexOf(key) < 0; }) || headers.some(function (key, i) { return key && headers.indexOf(key) !== i; })) throw TemaTrial.fault('CONFIG');
  var params = {}, softwares = [];
  values.slice(1).forEach(function (line) {
    var row = {};
    headers.forEach(function (key, i) { if (key) row[key] = line[i] === undefined ? '' : line[i]; });
    if (row.cle) {
      if (Object.prototype.hasOwnProperty.call(params, row.cle)) throw TemaTrial.fault('CONFIG');
      params[row.cle] = row.valeur;
    }
    if (row.id || row.label) softwares.push({ id: String(row.id), label: String(row.label) });
  });
  params.softwares = softwares;
  return params;
}
function batchCatalogueGet_() {
  var started = Date.now();
  try {
    trialGuard_();
    var response = Sheets.Spreadsheets.Values.batchGet(TEMA_TRIAL_TARGET.spreadsheet, {
      ranges: ["'Formations'!A:N", "'Disponibilités'!A:L", "'Inscriptions'!A:AC", "'Paramètres'!A:Z"],
      valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER'
    });
    var readMs = Date.now() - started, tables = response.valueRanges;
    if (!Array.isArray(tables) || tables.length !== 4) throw TemaTrial.fault('CONFIG');
    var data = {
      formations: batchTableRows_(tables[0].values, 'Formations'),
      sessions: batchTableRows_(tables[1].values, 'Disponibilités'),
      registrations: batchTableRows_(tables[2].values, 'Inscriptions'),
      params: batchParams_(tables[3].values)
    };
    var result = TemaTrial.publicCatalogue(data, trialDependencies_());
    result.benchmark = { reader: 'sheets-batchget-v1', api_calls: 1, read_ms: readMs, server_ms: Date.now() - started };
    return trialJson_(result);
  } catch (_) { return trialJson_({ schema_version: 1, code: 'UNAVAILABLE' }); }
}
function batchNativeCatalogueGet_() {
  var started = Date.now();
  try {
    var result = TemaTrial.createService(trialDependencies_()).catalogue();
    if (!Array.isArray(result.sessions) || result.code) throw TemaTrial.fault('CONFIG');
    result.benchmark = { reader: 'spreadsheetapp-v1', server_ms: Date.now() - started };
    return trialJson_(result);
  } catch (_) { return trialJson_({ schema_version: 1, code: 'UNAVAILABLE' }); }
}
