// Lecture publique fraîche. Les inscriptions restent privées et les places sont recomptées.
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
function batchTableRows_(values, name, formats) {
  if (!Array.isArray(values) || !values.length) throw TemaTrial.fault('CONFIG');
  var headers = values[0];
  TemaTrial.tableRows([headers], TemaTrial.HEADERS[name]);
  var rows = [];
  values.slice(1).forEach(function (line, index) {
    if (!trialUsefulRow_(line, headers, name)) return;
    var row = TemaTrial.tableRows([headers, line], TemaTrial.HEADERS[name])[0];
    if (name === 'Disponibilités') {
      ['date', 'heure_debut', 'heure_fin'].forEach(function (key) {
        if (typeof row[key] !== 'number') return;
        var cell = formats && formats[index + 1] && formats[index + 1].values && formats[index + 1].values[headers.indexOf(key)];
        var type = cell && cell.effectiveFormat && cell.effectiveFormat.numberFormat && cell.effectiveFormat.numberFormat.type;
        var allowed = key === 'date' ? ['DATE', 'DATE_TIME'] : ['TIME', 'DATE_TIME'];
        if (allowed.indexOf(type) >= 0) row[key] = key === 'date' ? batchSheetDate_(row[key]) : batchSheetTime_(row[key]);
      });
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
function trialGroupedCatalogue_() {
  try {
    trialGuard_();
    var response = Sheets.Spreadsheets.Values.batchGet(TEMA_TRIAL_TARGET.spreadsheet, {
      ranges: ["'Formations'!A:N", "'Disponibilités'!A:L", "'Inscriptions'!A:AC", "'Paramètres'!A:Z"],
      valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER'
    });
    var tables = response.valueRanges;
    if (!Array.isArray(tables) || tables.length !== 4) throw TemaTrial.fault('CONFIG');
    var sessionValues = tables[1].values;
    var sessionHeaders = sessionValues && sessionValues[0] || [];
    var numericTimes = (sessionValues || []).slice(1).some(function (row) {
      return ['date', 'heure_debut', 'heure_fin'].some(function (key) { return typeof row[sessionHeaders.indexOf(key)] === 'number'; });
    });
    var formats = null;
    if (numericTimes) {
      var metadata = Sheets.Spreadsheets.get(TEMA_TRIAL_TARGET.spreadsheet, {
        ranges: ["'Disponibilités'!A:L"], includeGridData: true,
        fields: 'sheets(properties(title),data(startRow,rowData(values(effectiveFormat(numberFormat(type))))))'
      });
      var temporalSheet = metadata.sheets.find(function (sheet) { return sheet.properties && sheet.properties.title === 'Disponibilités'; });
      formats = temporalSheet.data[0].rowData;
    }
    var data = {
      formations: batchTableRows_(tables[0].values, 'Formations'),
      sessions: batchTableRows_(tables[1].values, 'Disponibilités', formats),
      registrations: batchTableRows_(tables[2].values, 'Inscriptions'),
      params: batchParams_(tables[3].values)
    };
    var result = TemaTrial.publicCatalogue(data, trialDependencies_());
    return result;
  } catch (_) { return { schema_version: 1, code: 'UNAVAILABLE' }; }
}
