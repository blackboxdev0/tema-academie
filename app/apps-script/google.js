/* Google-only adapters. No Node APIs, no destination or fault switch from HTTP. */
var TEMA_TRIAL_TARGET = Object.freeze({
  spreadsheet: '1Zq8s1Jwd4NgpbMIed35W0LJIsUpJ-JPt19BZK89yM3c',
  script: '1cQXjhw60iKv9n3P4EcLcgsbWBgWmlj47EFUGM5wqJgXDAQqajC5M0k_x'
});

function trialGuard_() {
  var p = PropertiesService.getScriptProperties();
  if (p.getProperty('ENVIRONMENT') !== 'TEST' || p.getProperty('SPREADSHEET_ID') !== TEMA_TRIAL_TARGET.spreadsheet || ScriptApp.getScriptId() !== TEMA_TRIAL_TARGET.script) throw TemaTrial.fault('ENVIRONMENT');
}
function trialSheet_() { trialGuard_(); return SpreadsheetApp.openById(TEMA_TRIAL_TARGET.spreadsheet); }
function trialLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw TemaTrial.fault('BUSY');
  try { return fn(); } finally { lock.releaseLock(); }
}
function trialUsefulRow_(line, headers, name) {
  var ignored = name === 'Formations' ? ['actif'] : name === 'Disponibilités' ? ['inscriptions_ouvertes', 'places_restantes', 'etat_validation'] : [];
  return line.some(function (value, index) { return ignored.indexOf(headers[index]) < 0 && value !== '' && value !== null; });
}
/** Native checkboxes can make getLastRow() the entire grid. Reuse a truly
 * empty row, preserving every row containing IDs or any useful business data. */
function trialInsertionRow_(tab, name) {
  var values = tab.getDataRange().getValues(), headers = values[0];
  TemaTrial.tableRows([headers], TemaTrial.HEADERS[name]);
  var checkbox = name === 'Formations' ? 'actif' : name === 'Disponibilités' ? 'inscriptions_ouvertes' : null;
  for (var i = 1; i < values.length; i += 1) {
    if (values[i].every(function (value, column) { return value === '' || value === null || headers[column] === checkbox && value === false; })) return i + 1;
  }
  var next = Math.max(2, values.length + 1), capacity = tab.getMaxRows();
  if (next > capacity) tab.insertRowsAfter(capacity, next - capacity);
  return next;
}
function trialReadTable_(sheet, name, layout) {
  var tab = sheet.getSheetByName(name); if (!tab) throw TemaTrial.fault('CONFIG');
  var values = tab.getDataRange().getValues(), headers = TemaTrial.HEADERS[name];
  TemaTrial.tableRows([values[0]], headers);
  if (layout) layout[name] = { headers: values[0].slice(), max_rows: tab.getMaxRows() };
  var rows = [];
  values.slice(1).forEach(function (line, index) {
    // Native checkbox validation fills unused rows with false. Those default
    // cells must not become hundreds of empty sessions/automatic IDs.
    if (!trialUsefulRow_(line, values[0], name)) return;
    var row = TemaTrial.tableRows([values[0], line], headers)[0]; row._sheetRow = index + 2;
    if (name === 'Disponibilités') {
      if (row.date instanceof Date) row.date = Utilities.formatDate(row.date, 'America/Toronto', 'yyyy-MM-dd');
      ['heure_debut', 'heure_fin'].forEach(function (k) { if (row[k] instanceof Date) row[k] = Utilities.formatDate(row[k], 'America/Toronto', 'HH:mm'); });
    }
    rows.push(row);
  });
  return rows;
}
function trialReadParams_(sheet, layout) {
  var tab = sheet.getSheetByName('Paramètres'); if (!tab) throw TemaTrial.fault('CONFIG');
  var table = trialParamsTable_(tab), params = {}, softwares = [];
  if (layout) layout['Paramètres'] = { headers: table.headers.slice(), max_rows: tab.getMaxRows() };
  table.rows.forEach(function (r) {
    if (r.cle) { if (Object.prototype.hasOwnProperty.call(params, r.cle)) throw TemaTrial.fault('CONFIG'); params[r.cle] = r.valeur; }
    if (r.id || r.label) softwares.push({ id: String(r.id), label: String(r.label) });
  });
  params.softwares = softwares;
  return params;
}
function trialParamsTable_(tab) {
  var values = tab.getDataRange().getValues(), headers = values[0].map(String);
  if (['cle', 'valeur', 'description', 'id', 'label', 'choix'].some(function (k) { return headers.indexOf(k) < 0; }) || headers.some(function (k, i) { return k && headers.indexOf(k) !== i; })) throw TemaTrial.fault('CONFIG');
  return { headers: headers, rows: values.slice(1).map(function (line, index) { var row = { _sheetRow: index + 2 }; headers.forEach(function (key, i) { if (key) row[key] = line[i] === undefined ? '' : line[i]; }); return row; }) };
}
function trialAllowedRecipients_() {
  var allowed = JSON.parse(PropertiesService.getScriptProperties().getProperty('ALLOWED_RECIPIENTS_JSON') || 'null');
  if (!Array.isArray(allowed) || !allowed.length || allowed.some(function (v) { return typeof v !== 'string' || !/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(v); })) throw TemaTrial.fault('PRIVATE_CONFIG');
  return allowed.map(function (v) { return v.trim().toLowerCase(); });
}
function trialStore_() {
  function read(includeLayout) {
    var sheet = trialSheet_();
    var layout = includeLayout ? {} : null;
    var data = { formations: trialReadTable_(sheet, 'Formations', layout), sessions: trialReadTable_(sheet, 'Disponibilités', layout), registrations: trialReadTable_(sheet, 'Inscriptions', layout), params: trialReadParams_(sheet, layout) };
    if (layout) data._layout = layout;
    return data;
  }
  function patch(id, fields) {
    var sheet = trialSheet_(), tab = sheet.getSheetByName('Inscriptions'), values = tab.getDataRange().getValues(), headers = values[0];
    TemaTrial.tableRows([headers], TemaTrial.HEADERS.Inscriptions);
    var idColumn = headers.indexOf('id_inscription'), matches = [];
    values.slice(1).forEach(function (line, i) { if (line[idColumn] === id) matches.push(i + 2); });
    if (matches.length !== 1) throw TemaTrial.fault('CONFIG');
    Object.keys(fields).forEach(function (k) {
      var column = headers.indexOf(k); if (column < 0) throw TemaTrial.fault('CONFIG');
      tab.getRange(matches[0], column + 1).setValue(TemaTrial.inertCell(fields[k]));
    });
  }
  function insert(row) {
    var tab = trialSheet_().getSheetByName('Inscriptions'), headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
    TemaTrial.tableRows([headers], TemaTrial.HEADERS.Inscriptions);
    var line = headers.map(function (k) { return Object.prototype.hasOwnProperty.call(row, k) ? TemaTrial.inertCell(row[k]) : ''; });
    trialWriteTypedRow_(tab, headers, trialInsertionRow_(tab, 'Inscriptions'), line);
  }
  return { read: read, insert: insert, patch: patch, flush: function () { SpreadsheetApp.flush(); } };
}
/** Sheets plain-text format coerces booleans to strings. Set native formats BEFORE values. */
function trialWriteTypedRow_(tab, headers, row, line) {
  var range = tab.getRange(row, 1, 1, headers.length);
  range.setNumberFormat('@');
  line.forEach(function (value, index) {
    if (typeof value === 'boolean' || typeof value === 'number') tab.getRange(row, index + 1).setNumberFormat(typeof value === 'boolean' ? 'General' : headers[index] === 'prix' ? '0.00' : '0');
  });
  range.setValues([line]);
}
function trialReserveMail_(id, channel, to) {
  // Called only while the script lock is held. Reserve BEFORE MailApp so an
  // interruption can only consume budget; it cannot exceed the approved cap.
  var props = PropertiesService.getScriptProperties(), allowed, budget;
  try {
    allowed = trialAllowedRecipients_();
    if (allowed.indexOf(String(to).trim().toLowerCase()) < 0) return 'ALLOWLIST';
    var saved = props.getProperty('TRIAL_MAIL_BUDGET_JSON');
    budget = saved ? JSON.parse(saved) : { version: 1, registrations: {}, recipients: 0 };
    if (!budget || budget.version !== 1 || !budget.registrations || typeof budget.registrations !== 'object' || Array.isArray(budget.registrations) || !Number.isInteger(budget.recipients) || budget.recipients < 0 || budget.recipients > 20) return 'BUDGET_CONFIG';
    var ids = Object.keys(budget.registrations), count = 0;
    if (ids.length > 10) return 'BUDGET_CONFIG';
    ids.forEach(function (key) {
      var channels = budget.registrations[key];
      if (!channels || typeof channels !== 'object' || Object.keys(channels).some(function (k) { return !['participant', 'tema'].includes(k) || channels[k] !== true; })) throw TemaTrial.fault('CONFIG');
      count += Object.keys(channels).length;
    });
    if (count !== budget.recipients) return 'BUDGET_CONFIG';
    if (budget.registrations[id] && budget.registrations[id][channel]) return 'ATTEMPT_RESERVED';
    if (!budget.registrations[id] && ids.length >= 10 || budget.recipients >= 20) return 'TRIAL_LIMIT';
    if (MailApp.getRemainingDailyQuota() < 1) return 'MAIL_QUOTA';
    if (!budget.registrations[id]) budget.registrations[id] = {};
    budget.registrations[id][channel] = true; budget.recipients += 1;
    props.setProperty('TRIAL_MAIL_BUDGET_JSON', JSON.stringify(budget));
    return null;
  } catch (_) { return 'BUDGET_CONFIG'; }
}
function trialDependencies_() {
  return {
    privateSheetUrl: 'https://docs.google.com/spreadsheets/d/' + TEMA_TRIAL_TARGET.spreadsheet + '/edit',
    capacityInitialization: {
      get: function (id) { var value = PropertiesService.getScriptProperties().getProperty('CAPACITY_INIT_' + id); return value === null ? null : JSON.parse(value); },
      set: function (id, value) { PropertiesService.getScriptProperties().setProperty('CAPACITY_INIT_' + id, JSON.stringify(value)); }
    },
    guard: trialGuard_, consumeNewCommand: trialConsumeNewCommand_, store: trialStore_(), withLock: trialLock_, reserveMail: trialReserveMail_,
    allowNewRegistration: function (command) { return trialAllowedRecipients_().indexOf(command.courriel) >= 0; },
    now: function () { return Date.now(); }, uuid: function () { return Utilities.getUuid(); },
    hash: function (value) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8).map(function (n) { return (n < 0 ? n + 256 : n).toString(16).padStart(2, '0'); }).join(''); },
    formatLocal: function (ms) { return Utilities.formatDate(new Date(ms), 'America/Toronto', "yyyy-MM-dd'T'HH:mm"); },
    mail: { send: function (message) {
      // Failure exercises are private editor operations, never visitor flags.
      var injected = PropertiesService.getScriptProperties().getProperty('TRIAL_SIMULATE_MAIL_FAILURE');
      if (injected === 'ALL' || injected === 'PARTICIPANT' && message.ics) throw TemaTrial.fault('SIMULATED_MAIL_FAILURE');
      var options = { to: message.to, subject: message.subject, body: message.body, name: message.name };
      if (message.ics) options.attachments = [Utilities.newBlob(message.ics, 'text/calendar; charset=UTF-8', 'formation.ics')];
      MailApp.sendEmail(options);
    } }
  };
}
function trialJson_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) { return trialJson_(TemaTrial.createService(trialDependencies_()).catalogue()); }
function doPost(e) {
  var command;
  try {
    if (!e || !e.postData || !/^application\/x-www-form-urlencoded(?:;|$)/i.test(e.postData.type || '') || e.postData.contents.length > 16384 || !e.parameter || Object.keys(e.parameters || {}).some(function (k) { return e.parameters[k].length !== 1; })) throw TemaTrial.fault('INVALID');
    command = TemaTrial.decodeForm(e.parameter);
  } catch (_) { return trialJson_(TemaTrial.envelope('INVALID', null)); }
  return trialJson_(TemaTrial.createService(trialDependencies_()).submit(command));
}

/** Editor only: create one formation / two future sessions, only into empty TEST tables. */
function installTrial_() {
  trialGuard_();
  return trialLock_(function () {
    var sheet = trialSheet_(), props = PropertiesService.getScriptProperties();
    var contact = props.getProperty('CONTACT_EMAIL'), internal = props.getProperty('TEMA_EMAIL'), allowed;
    try { allowed = JSON.parse(props.getProperty('ALLOWED_RECIPIENTS_JSON') || 'null'); } catch (_) { throw TemaTrial.fault('PRIVATE_CONFIG'); }
    if (!contact || !internal || !Array.isArray(allowed) || allowed.map(function (s) { return String(s).toLowerCase(); }).indexOf(internal.toLowerCase()) < 0) throw TemaTrial.fault('PRIVATE_CONFIG');
    Object.keys(TemaTrial.HEADERS).forEach(function (name) {
      var tab = sheet.getSheetByName(name); if (!tab) throw TemaTrial.fault('CONFIG');
      var values = tab.getDataRange().getValues();
      TemaTrial.tableRows([values[0]], TemaTrial.HEADERS[name]);
      if (values.slice(1).some(function (r) { return r.some(function (v) { return v !== ''; }); })) throw TemaTrial.fault('TRIAL_NOT_EMPTY');
    });
    var paramsTab = sheet.getSheetByName('Paramètres'); if (!paramsTab) throw TemaTrial.fault('CONFIG');
    // Preserve the native editable software registry and its parallel columns.
    var parameterTable = trialParamsTable_(paramsTab);
    [['courriel_contact', contact], ['courriel_avis_tema', internal], ['nom_expediteur', 'Tema Académie — TEST'], ['politique_url', 'https://example.invalid/politique-essai'], ['politique_version', 'TEST-1']].forEach(function (pair) {
      var matches = parameterTable.rows.filter(function (r) { return r.cle === pair[0]; }); if (matches.length > 1) throw TemaTrial.fault('CONFIG');
      var row = matches[0] || parameterTable.rows.find(function (r) { return !r.cle; });
      if (!row) { row = { _sheetRow: Math.max(2, paramsTab.getLastRow() + 1) }; parameterTable.rows.push(row); }
      row.cle = pair[0]; row.valeur = pair[1];
      paramsTab.getRange(row._sheetRow, parameterTable.headers.indexOf('cle') + 1).setValue(pair[0]);
      paramsTab.getRange(row._sheetRow, parameterTable.headers.indexOf('valeur') + 1).setNumberFormat('@').setValue(TemaTrial.inertCell(pair[1]));
    });
    if (!parameterTable.rows.some(function (r) { return r.id || r.label; })) {
      [['DIV', 'Divalto'], ['DIMO', 'Dimo'], ['MOOV', 'MoovApps']].forEach(function (pair, index) {
        ['id', 'label', 'choix'].forEach(function (key, i) { paramsTab.getRange(index + 2, parameterTable.headers.indexOf(key) + 1).setValue(i === 0 ? pair[0] : i === 1 ? pair[1] : pair[0] + ' — ' + pair[1]); });
      });
    }
    var formation = { id: '', logiciel: 'DIV — Divalto', titre: 'Essai technique — ergonomie', description: 'Formation fictive pour TEM-6.', prerequis: 'Aucun — essai fictif', contenu: 'Parcours technique uniquement.', resultat: 'Aucune formation commerciale proposée.', duree: 'Demi-journée', prix: 450, prix_qualificatif: 'À partir de', places_par_defaut: 3, formateurs: 'TEST', actif: false };
    var formTab = sheet.getSheetByName('Formations'), formHeaders = formTab.getRange(1, 1, 1, formTab.getLastColumn()).getValues()[0];
    trialWriteTypedRow_(formTab, formHeaders, 2, formHeaders.map(function (k) { return formation[k] === undefined ? '' : formation[k]; }));
    var year = new Date().getUTCFullYear() + 1;
    var sessions = [
      { id_cohorte: 'C-' + Utilities.getUuid(), formation: '', date: year + '-01-15', heure_debut: '09:00', heure_fin: '12:00', places_max: 3, mode: 'en_ligne', lieu_ou_lien: '', inscriptions_ouvertes: false, places_restantes: 3, etat_validation: '' },
      { id_cohorte: 'C-' + Utilities.getUuid(), formation: '', date: year + '-07-15', heure_debut: '09:00', heure_fin: '12:00', places_max: 3, mode: 'presentiel', lieu_ou_lien: '123, rue Fictive, Montréal — TEST', inscriptions_ouvertes: false, places_restantes: 3, etat_validation: '' }
    ];
    var sessionTab = sheet.getSheetByName('Disponibilités'), sessionHeaders = sessionTab.getRange(1, 1, 1, sessionTab.getLastColumn()).getValues()[0];
    sessions.forEach(function (s, index) { trialWriteTypedRow_(sessionTab, sessionHeaders, index + 2, sessionHeaders.map(function (k) { return s[k] === undefined ? '' : s[k]; })); });
    SpreadsheetApp.flush();
    reconcileTrialUnlocked_();
    var current = trialStore_().read().formations[0], choice = current.id + ' — ' + current.titre;
    sessionTab.getRange(2, sessionHeaders.indexOf('formation') + 1, 2, 1).setValues([[choice], [choice]]);
    trialApplyControls_(sheet);
    SpreadsheetApp.flush();
    return { environment: 'TEST', formations: 1, sessions: 2, active: false, open: false, remaining_daily_quota: MailApp.getRemainingDailyQuota() };
  });
}
function trialApplyControls_(sheet) {
  var formationTab = sheet.getSheetByName('Formations'), sessionTab = sheet.getSheetByName('Disponibilités');
  var formHeaders = formationTab.getRange(1, 1, 1, formationTab.getLastColumn()).getValues()[0], sessionHeaders = sessionTab.getRange(1, 1, 1, sessionTab.getLastColumn()).getValues()[0];
  formationTab.getRange(2, formHeaders.indexOf('actif') + 1, Math.max(1, formationTab.getMaxRows() - 1)).insertCheckboxes();
  sessionTab.getRange(2, sessionHeaders.indexOf('inscriptions_ouvertes') + 1, Math.max(1, sessionTab.getMaxRows() - 1)).insertCheckboxes();
  trialRefreshChoices_(sheet);
  sessionTab.getRange(2, sessionHeaders.indexOf('mode') + 1, sessionTab.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['presentiel', 'en_ligne'], true).setAllowInvalid(false).build());
  var registrations = sheet.getSheetByName('Inscriptions'), registrationHeaders = registrations.getRange(1, 1, 1, registrations.getLastColumn()).getValues()[0];
  registrations.getRange(2, registrationHeaders.indexOf('statut') + 1, registrations.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['confirmee', 'annulee'], true).setAllowInvalid(false).build());
  trialRepairPresentation_(sheet);
}
function trialRefreshChoices_(sheet, data, metadata) {
  var params = data ? data.params : trialReadParams_(sheet), formationTab = sheet.getSheetByName('Formations'), sessionTab = sheet.getSheetByName('Disponibilités');
  var formHeaders = data && data._layout ? data._layout.Formations.headers : formationTab.getRange(1, 1, 1, formationTab.getLastColumn()).getValues()[0], sessionHeaders = data && data._layout ? data._layout['Disponibilités'].headers : sessionTab.getRange(1, 1, 1, sessionTab.getLastColumn()).getValues()[0];
  var softwares = params.softwares.filter(function (s) { return s.id && String(s.label).trim() && params.softwares.filter(function (other) { return other.id === s.id; }).length === 1; });
  var choices = softwares.map(function (s) { return s.id + ' — ' + s.label; });
  function refreshList(tab, headers, field, values, key) {
    var column = headers.indexOf(field) + 1, height = tab.getMaxRows() - 1;
    var digest = trialDependencies_().hash(JSON.stringify([column, height, values]));
    // Explicit installation keeps its forced repair behavior. Reconciliation
    // checkpoints these small metadata digests only after a successful flush.
    if (!metadata || PropertiesService.getScriptProperties().getProperty(key) !== digest) {
      tab.getRange(2, column, height).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build());
      if (metadata) { metadata.choiceDigests = metadata.choiceDigests || {}; metadata.choiceDigests[key] = digest; }
    }
  }
  refreshList(formationTab, formHeaders, 'logiciel', choices, 'TRIAL_SOFTWARE_CHOICES_DIGEST');
  var formations = data ? data.formations : trialReadTable_(sheet, 'Formations'), changes = [];
  formations.forEach(function (f) {
    var id = String(f.logiciel).split(' — ')[0].trim(), s = softwares.find(function (entry) { return entry.id === id; });
    if (s && f.logiciel !== s.id + ' — ' + s.label) {
      var choice = s.id + ' — ' + s.label;
      formationTab.getRange(f._sheetRow, formHeaders.indexOf('logiciel') + 1).setValue(TemaTrial.inertCell(choice));
      changes.push({ table: 'formations', row: f._sheetRow, field: 'logiciel', before: f.logiciel, value: choice });
    }
  });
  var uniqueFormations = formations.filter(function (f) { return f.id && typeof f.titre === 'string' && f.titre.trim() && formations.filter(function (other) { return other.id === f.id; }).length === 1; });
  var formChoices = uniqueFormations.map(function (f) { return f.id + ' — ' + f.titre; });
  if (formChoices.length) refreshList(sessionTab, sessionHeaders, 'formation', formChoices, 'TRIAL_FORMATION_CHOICES_DIGEST');
  (data ? data.sessions : trialReadTable_(sheet, 'Disponibilités')).forEach(function (s) {
    var id = String(s.formation).split(' — ')[0].trim(), f = uniqueFormations.find(function (entry) { return entry.id === id; });
    if (f && s.formation !== f.id + ' — ' + f.titre) {
      var choice = f.id + ' — ' + f.titre;
      sessionTab.getRange(s._sheetRow, sessionHeaders.indexOf('formation') + 1).setValue(TemaTrial.inertCell(choice));
      changes.push({ table: 'sessions', row: s._sheetRow, field: 'formation', before: s.formation, value: choice });
    }
  });
  return changes;
}
function trialWarnProtection_(range, description) {
  var existing = range.getSheet().getProtections(SpreadsheetApp.ProtectionType.RANGE).find(function (p) {
    var prior = p.getRange(); return p.getDescription() === description && prior.getRow() === range.getRow() && prior.getColumn() === range.getColumn();
  });
  (existing ? existing.setRange(range) : range.protect()).setDescription(description).setWarningOnly(true);
}
function trialFormationNotes_(sheet, data) {
  var formations = data ? data.formations : trialReadTable_(sheet, 'Formations'), tab = sheet.getSheetByName('Formations'), headers = data && data._layout ? data._layout.Formations.headers : tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
  var issues = TemaTrial.formationIssues({ formations: formations, params: data ? data.params : trialReadParams_(sheet) }), count = 0;
  var currentNotes = tab.getRange(2, 1, tab.getMaxRows() - 1, headers.length).getNotes();
  ['id', 'titre', 'duree', 'logiciel', 'prix', 'actif'].forEach(function (key) {
    var column = headers.indexOf(key), notes = currentNotes.map(function (line) { return [line[column]]; });
    notes.forEach(function (line) { if (line[0].indexOf('TEM-6 — ') === 0) line[0] = ''; });
    formations.forEach(function (f, index) { if (issues[index][key]) { notes[f._sheetRow - 2][0] = 'TEM-6 — ' + issues[index][key]; count += 1; } });
    if (notes.some(function (line, index) { return line[0] !== currentNotes[index][column]; })) tab.getRange(2, column + 1, tab.getMaxRows() - 1).setNotes(notes);
  });
  return count;
}
function trialRepairPresentation_(sheet) {
  var formatCount = 0, protectionCount = 0;
  [
    ['Formations', { id: '@', prix: '0.00', places_par_defaut: '0' }, ['id']],
    ['Disponibilités', { id_cohorte: '@', formation: '@', date: '@', heure_debut: '@', heure_fin: '@', places_max: '0', places_restantes: '0' }, ['id_cohorte', 'places_restantes', 'etat_validation']],
    ['Paramètres', { id: '@', choix: '@' }, ['id', 'choix']],
    ['Inscriptions', {}, TemaTrial.HEADERS.Inscriptions.filter(function (key) { return key !== 'statut'; })]
  ].forEach(function (definition) {
    var tab = sheet.getSheetByName(definition[0]), headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
    trialWarnProtection_(tab.getRange(1, 1, 1, headers.length).setFontWeight('bold'), 'TEM-6 — en-têtes'); protectionCount += 1;
    Object.keys(definition[1]).forEach(function (key) { var index = headers.indexOf(key); if (index < 0) throw TemaTrial.fault('CONFIG'); tab.getRange(2, index + 1, tab.getMaxRows() - 1).setNumberFormat(definition[1][key]); formatCount += 1; });
    definition[2].forEach(function (key) { var index = headers.indexOf(key); if (index < 0) throw TemaTrial.fault('CONFIG'); trialWarnProtection_(tab.getRange(2, index + 1, tab.getMaxRows() - 1), definition[0] === 'Inscriptions' ? 'TEM-6 — inscription protégée' : 'TEM-6 — calcul/identifiant'); protectionCount += 1; });
  });
  return { environment: 'TEST', formatted_columns: formatCount, warning_protections: protectionCount, formation_diagnostics: trialFormationNotes_(sheet) };
}
function trialReconcileSoftwares_(sheet, props) {
  var tab = sheet.getSheetByName('Paramètres'), table = trialParamsTable_(tab), reserved;
  try { reserved = JSON.parse(props.getProperty('SOFTWARE_RESERVED_IDS_JSON') || '[]'); if (!Array.isArray(reserved)) throw TemaTrial.fault('CONFIG'); } catch (_) { throw TemaTrial.fault('CONFIG'); }
  table.rows.forEach(function (r) { if (r.id && reserved.indexOf(String(r.id)) < 0) reserved.push(String(r.id)); });
  table.rows.forEach(function (r) {
    if (!r.label) return;
    if (!r.id) {
      var base = String(r.label).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!base || table.rows.filter(function (s) { return s.label === r.label; }).length !== 1) return;
      var id = base, count = 1; while (reserved.indexOf(id) >= 0) { if (count === Number.MAX_SAFE_INTEGER) throw TemaTrial.fault('COUNTER_RANGE'); count += 1; id = base + count; }
      r.id = id; reserved.push(id); props.setProperty('SOFTWARE_RESERVED_IDS_JSON', JSON.stringify(reserved));
      tab.getRange(r._sheetRow, table.headers.indexOf('id') + 1).setValue(id);
    }
    var choice = r.id + ' — ' + r.label;
    if (r.choix !== choice) tab.getRange(r._sheetRow, table.headers.indexOf('choix') + 1).setValue(TemaTrial.inertCell(choice));
  });
  var savedReserved = JSON.stringify(reserved);
  if (props.getProperty('SOFTWARE_RESERVED_IDS_JSON') !== savedReserved) props.setProperty('SOFTWARE_RESERVED_IDS_JSON', savedReserved);
  return table.rows.filter(function (r) { return r.id || r.label; }).map(function (r) { return { id: String(r.id), label: String(r.label) }; });
}
function trialAdministrationDigest_(data, counter, hash) {
  // Version this private checkpoint when administration repair rules change.
  // Include displayed calculations so manual overwrites are repaired too.
  // Notes and notification states do not drive these repairs.
  function rows(records, keys) { return records.map(function (row) { return [row._sheetRow].concat(keys.map(function (key) { return row[key]; })); }); }
  return hash(JSON.stringify([
    'V1-admin-v4-changed-metadata', counter, data._layout || null,
    rows(data.formations, TemaTrial.HEADERS.Formations), rows(data.sessions, TemaTrial.HEADERS['Disponibilités']),
    data.registrations.map(function (row) { return [row.id_inscription, row.id_cohorte, row.statut]; }),
    Object.keys(data.params).sort().map(function (key) { return [key, data.params[key]]; })
  ]));
}
function reconcileTrialUnlocked_() {
  var deps = trialDependencies_(), props = PropertiesService.getScriptProperties(), sheet = trialSheet_();
  var savedCounter = props.getProperty('FORMATION_COUNTER'), next = savedCounter === null ? 0 : Number(savedCounter);
  if (savedCounter !== null && !/^\d+$/.test(savedCounter) || !Number.isSafeInteger(next) || next < 0) throw TemaTrial.fault('COUNTER_RANGE');
  var data = deps.store.read(true);
  if (props.getProperty('TRIAL_ADMIN_DIGEST') === trialAdministrationDigest_(data, next, deps.hash)) return { patches: 0, counter: next };
  data.params.softwares = trialReconcileSoftwares_(sheet, props);
  var result = TemaTrial.prepareAdministration(data, deps, next);
  // Reserve the monotonic counter before IDs are written. Gaps are allowed.
  if (savedCounter !== String(result.counter)) props.setProperty('FORMATION_COUNTER', String(result.counter));
  result.capacity_initializations.forEach(function (state) {
    if (deps.capacityInitialization.get(state.id_cohorte) === null || state.explicit_capacity) {
      // Historical adoption and an already explicit capacity need no default
      // write. Reserve complete before Sheet mutations: an interrupted flush
      // followed by a human clear must never make either eligible to refill.
      deps.capacityInitialization.set(state.id_cohorte, { version: 1, status: state.adopted_historical || state.explicit_capacity ? 'complete' : 'waiting' });
    }
  });
  var tableHeaders = {}, metadata = {};
  result.patches.forEach(function (p) {
    var source = p.sheet === 'Formations' ? data.formations : data.sessions, row = source[p.index]._sheetRow;
    var keys = Object.keys(p.values).filter(function (key) { return source[p.index][key] !== p.values[key]; });
    if (!keys.length) return;
    var tab = sheet.getSheetByName(p.sheet), headers = tableHeaders[p.sheet] || (tableHeaders[p.sheet] = data._layout[p.sheet].headers);
    keys.forEach(function (k) { var value = p.values[k], cell = tab.getRange(row, headers.indexOf(k) + 1); cell.setNumberFormat(typeof value === 'boolean' ? 'General' : typeof value === 'number' ? '0' : '@').setValue(TemaTrial.inertCell(value)); source[p.index][k] = value; });
  });
  trialRefreshChoices_(sheet, data, metadata).forEach(function (change) {
    var row = data[change.table].find(function (r) { return r._sheetRow === change.row; });
    if (row && row[change.field] === change.before) row[change.field] = change.value;
  });
  trialFormationNotes_(sheet, data);
  SpreadsheetApp.flush();
  Object.keys(metadata.choiceDigests || {}).forEach(function (key) { props.setProperty(key, metadata.choiceDigests[key]); });
  result.capacity_initializations.forEach(function (state) { deps.capacityInitialization.set(state.id_cohorte, { version: 1, status: state.status }); });
  // Checkpoint only the inputs actually processed, plus our own generated
  // defaults/references. A concurrent human edit remains different next run.
  props.setProperty('TRIAL_ADMIN_DIGEST', trialAdministrationDigest_(data, result.counter, deps.hash));
  return { patches: result.patches.length, counter: result.counter };
}
/** Editor / installed triggers only: same generator for edits, paste and missed events. No mail. */
function reconcileTrial_() { trialGuard_(); return trialLock_(reconcileTrialUnlocked_); }
/** Existing TEST only: repair presentation, without values, IDs, counters or checkbox resets. */
function repairTrial_() { trialGuard_(); return trialLock_(function () { var result = trialRepairPresentation_(trialSheet_()); SpreadsheetApp.flush(); return result; }); }
function trialOnEdit_(event) { if (event && event.source && event.source.getId() === TEMA_TRIAL_TARGET.spreadsheet) reconcileTrial_(); }
/** Optional private installation; never called from HTTP or installation of fixtures. */
function installTrialTriggers_() {
  trialGuard_();
  var existing = ScriptApp.getProjectTriggers(), handlers = existing.map(function (t) { return t.getHandlerFunction(); });
  if (handlers.indexOf('trialOnEdit_') < 0) ScriptApp.newTrigger('trialOnEdit_').forSpreadsheet(TEMA_TRIAL_TARGET.spreadsheet).onEdit().create();
  if (handlers.indexOf('reconcileTrial_') < 0) ScriptApp.newTrigger('reconcileTrial_').timeBased().everyMinutes(5).create();
  return { trigger_count: ScriptApp.getProjectTriggers().length };
}
/** Read-only private evidence, without recipients or PII. Never resets a counter. */
function inspectTrial_() {
  trialGuard_(); var props = PropertiesService.getScriptProperties(), data = trialStore_().read();
  var budget = JSON.parse(props.getProperty('TRIAL_MAIL_BUDGET_JSON') || '{"version":1,"registrations":{},"recipients":0}');
  var cat = TemaTrial.publicCatalogue(data, trialDependencies_()), issues = TemaTrial.formationIssues(data);
  var rateSaved = props.getProperty('V1_RATE_BUDGET_JSON'), rate = rateSaved === null ? null : JSON.parse(rateSaved);
  return { environment: 'TEST', formations: data.formations.length, public_formations: cat.formations.length, sessions: data.sessions.length, public_sessions: cat.sessions.length, registrations: data.registrations.length, confirmed_registrations: data.registrations.filter(function (r) { return r.statut === 'confirmee'; }).length, cancelled_registrations: data.registrations.filter(function (r) { return r.statut === 'annulee'; }).length, invalid_formations: issues.filter(function (i) { return Object.keys(i).length > 0; }).length, session_diagnostics: data.sessions.filter(function (s) { return Boolean(s.etat_validation); }).length, real_mail_registrations: Object.keys(budget.registrations).length, reserved_recipients: budget.recipients, remaining_daily_quota: MailApp.getRemainingDailyQuota(), trigger_count: ScriptApp.getProjectTriggers().length, rate_window: rate ? rate.window : null, rate_new_commands: rate ? rate.total : 0 };
}

// Apps Script hides trailing-underscore names in the editor's Run selector.
// These editor entry points log only aggregate, non-personal results. No HTTP
// handler dispatches their names and no HTML/RPC page is served by this trial.
function inspectTrial() { var result = inspectTrial_(); console.log(JSON.stringify(result)); return result; }
function installTrial() { var result = installTrial_(); console.log(JSON.stringify(result)); return result; }
function reconcileTrial() { var result = reconcileTrial_(); console.log(JSON.stringify(result)); return result; }
function repairTrial() { var result = repairTrial_(); console.log(JSON.stringify(result)); return result; }
function installTrialTriggers() { var result = installTrialTriggers_(); console.log(JSON.stringify(result)); return result; }

/** Called only inside trialLock_ by the shared admission engine. */
function trialConsumeNewCommand_(addressHash, now) {
  var props = PropertiesService.getScriptProperties(), saved = props.getProperty('V1_RATE_BUDGET_JSON');
  var decision = TemaTrial.nextRateBudget(saved === null ? null : JSON.parse(saved), addressHash, now);
  if (decision.allowed) props.setProperty('V1_RATE_BUDGET_JSON', JSON.stringify(decision.state));
  return decision.allowed;
}
function trialImportManifest_() {
  // A transient editor-only variable is convenient for a private paste. It is
  // never supplied in the deployed/public bundle or accepted through HTTP.
  if (typeof TEMA_PRIVATE_CATALOGUE_IMPORT !== 'undefined') return TEMA_PRIVATE_CATALOGUE_IMPORT;
  var props = PropertiesService.getScriptProperties(), count = Number(props.getProperty('CATALOGUE_IMPORT_CHUNKS'));
  if (!Number.isInteger(count) || count < 1 || count > 100) throw TemaTrial.fault('IMPORT_PRIVATE_SOURCE_REQUIRED');
  var source = '';
  for (var i = 0; i < count; i += 1) { var chunk = props.getProperty('CATALOGUE_IMPORT_' + i); if (chunk === null || chunk.length > 8192) throw TemaTrial.fault('IMPORT_PRIVATE_SOURCE_REQUIRED'); source += chunk; }
  return JSON.parse(source);
}
function importCatalogueTrial_(manifest) {
  trialGuard_();
  return trialLock_(function () {
    manifest = manifest || trialImportManifest_();
    if (manifest.source_id !== 'tema-catalogue-pre-lancement-v1' || !Array.isArray(manifest.records) || manifest.records.length !== 24) throw TemaTrial.fault('IMPORT_MANIFEST');
    var counts = { DIV: 0, DIMO: 0, MOOV: 0 };
    manifest.records.forEach(function (r) { if (!Object.prototype.hasOwnProperty.call(counts, r.logiciel)) throw TemaTrial.fault('IMPORT_MANIFEST'); counts[r.logiciel] += 1; });
    if (counts.DIV !== 18 || counts.DIMO !== 4 || counts.MOOV !== 2) throw TemaTrial.fault('IMPORT_MANIFEST');
    var deps = trialDependencies_(), props = PropertiesService.getScriptProperties();
    var hasMapping = manifest.records.some(function (r) { return props.getProperty('CATALOGUE_MAP_' + deps.hash(JSON.stringify([manifest.source_id, r.source_key]))) !== null; });
    if (!hasMapping) {
      // The isolated historical TEM-6 fixture may coexist with a first V1
      // import. Anything else requires an explicit private mapping: never
      // guess identity from matching titles or overwrite a populated catalogue.
      var baseline = deps.store.read().formations;
      if (baseline.length && !(baseline.length === 1 && /^Essai(?: technique| —)/.test(baseline[0].titre))) throw TemaTrial.fault('IMPORT_DESTINATION_NOT_PRISTINE');
    }
    deps.importState = {
      get: function (key) { var value = props.getProperty('CATALOGUE_MAP_' + key); return value === null ? null : JSON.parse(value); },
      set: function (key, value) { props.setProperty('CATALOGUE_MAP_' + key, JSON.stringify(value)); },
      counter: function () { var value = props.getProperty('FORMATION_COUNTER'); if (value !== null && !/^\d+$/.test(value)) throw TemaTrial.fault('COUNTER_RANGE'); return value === null ? 0 : Number(value); },
      setCounter: function (value) { props.setProperty('FORMATION_COUNTER', String(value)); }
    };
    deps.importStore = { insertFormation: function (row) {
      var tab = trialSheet_().getSheetByName('Formations'), headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
      TemaTrial.tableRows([headers], TemaTrial.HEADERS.Formations);
      var line = headers.map(function (key) { return Object.prototype.hasOwnProperty.call(row, key) ? TemaTrial.inertCell(row[key]) : ''; });
      trialWriteTypedRow_(tab, headers, trialInsertionRow_(tab, 'Formations'), line);
    } };
    var result = TemaTrial.importCatalogue(manifest, deps);
    var index = manifest.records.map(function (r) {
      var key = deps.hash(JSON.stringify([manifest.source_id, r.source_key])), state = deps.importState.get(key);
      return state && state.status === 'complete' ? state.id : null;
    });
    props.setProperty('V1_CATALOGUE_IDS_JSON', JSON.stringify(index));
    // Imports, human edits and fallback invoke the same validator explicitly.
    reconcileTrialUnlocked_();
    return Object.assign({ environment: 'TEST', source_count: 24, complete: index.filter(Boolean).length }, result);
  });
}
function importCatalogueTrial() { var result = importCatalogueTrial_(); console.log(JSON.stringify(result)); return result; }

/** Explicit editor action: imported records only, not historical TEM-6 rows. */
function activateV1TrialCatalogue() {
  trialGuard_();
  return trialLock_(function () {
    var props = PropertiesService.getScriptProperties(), ids = JSON.parse(props.getProperty('V1_CATALOGUE_IDS_JSON') || 'null');
    if (!Array.isArray(ids) || ids.length !== 24 || ids.some(function (id) { return typeof id !== 'string'; }) || new Set(ids).size !== 24) throw TemaTrial.fault('IMPORT_INCOMPLETE');
    var repaired = trialRepairV1CellTypesUnlocked_();
    if (repaired.invalid_known_cells.length) throw TemaTrial.fault('V1_BOOLEAN_INVALID');
    var data = trialStore_().read(), tab = trialSheet_().getSheetByName('Formations'), headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
    ids.forEach(function (id) { var matches = data.formations.filter(function (f) { return f.id === id; }); if (matches.length !== 1) throw TemaTrial.fault('CONFIG'); });
    ids.forEach(function (id) { var row = data.formations.find(function (f) { return f.id === id; }); if (row.actif !== true) tab.getRange(row._sheetRow, headers.indexOf('actif') + 1).setNumberFormat('General').setValue(true); });
    SpreadsheetApp.flush(); var result = reconcileTrialUnlocked_();
    return { environment: 'TEST', activated_imported_formations: ids.length, administration: result };
  });
}
/** Three explicitly fictitious future sessions; durable reservations prevent replay duplicates. */
function seedV1TrialSessions() {
  trialGuard_();
  return trialLock_(function () {
    var props = PropertiesService.getScriptProperties(), ids = JSON.parse(props.getProperty('V1_CATALOGUE_IDS_JSON') || 'null');
    if (!Array.isArray(ids) || ids.filter(Boolean).length !== 24) throw TemaTrial.fault('IMPORT_INCOMPLETE');
    var repaired = trialRepairV1CellTypesUnlocked_();
    if (repaired.invalid_known_cells.length) throw TemaTrial.fault('V1_BOOLEAN_INVALID');
    var plans = [
      { index: 0, month: '01', day: '15', capacity: 1, mode: 'en_ligne', place: '' },
      { index: 18, month: '07', day: '15', capacity: 3, mode: 'presentiel', place: '123, rue Fictive, Montréal — RECETTE TEST' },
      { index: 22, month: '09', day: '15', capacity: 12, mode: 'en_ligne', place: 'https://example.invalid/recette-test' }
    ], added = 0;
    var year = new Date().getUTCFullYear() + 1, sheet = trialSheet_(), tab = sheet.getSheetByName('Disponibilités'), headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
    TemaTrial.tableRows([headers], TemaTrial.HEADERS['Disponibilités']);
    plans.forEach(function (plan, i) {
      var key = 'V1_FICTITIOUS_SESSION_' + i, saved = props.getProperty(key), state = saved ? JSON.parse(saved) : null;
      if (!state) { state = { id: 'C-' + Utilities.getUuid(), year: year, version: 1 }; props.setProperty(key, JSON.stringify(state)); }
      if (state.version !== 1 || !/^C-[a-f0-9-]{36}$/i.test(state.id) || !Number.isInteger(state.year)) throw TemaTrial.fault('SEED_CONFIG');
      var data = trialStore_().read(), matches = data.sessions.filter(function (s) { return s.id_cohorte === state.id; });
      if (matches.length > 1) throw TemaTrial.fault('CONFIG');
      if (matches.length) return;
      var formation = data.formations.find(function (f) { return f.id === ids[plan.index]; }); if (!formation) throw TemaTrial.fault('CONFIG');
      var row = { id_cohorte: state.id, formation: formation.id + ' — ' + formation.titre, date: state.year + '-' + plan.month + '-' + plan.day, heure_debut: '09:00', heure_fin: '12:00', places_max: plan.capacity, mode: plan.mode, lieu_ou_lien: plan.place, inscriptions_ouvertes: false, places_restantes: plan.capacity, etat_validation: '' };
      var number = trialInsertionRow_(tab, 'Disponibilités');
      trialWriteTypedRow_(tab, headers, number, headers.map(function (key) { return TemaTrial.inertCell(row[key] === undefined ? '' : row[key]); }));
      SpreadsheetApp.flush(); added += 1;
    });
    return { environment: 'TEST', added_fictitious_sessions: added, default_open: false, administration: reconcileTrialUnlocked_() };
  });
}
/** Repair only the known V1 import/fixture cells affected by the old text writer. */
function trialRepairV1CellTypesUnlocked_() {
  var props = PropertiesService.getScriptProperties(), data = trialStore_().read(), sheet = trialSheet_();
  var ids = JSON.parse(props.getProperty('V1_CATALOGUE_IDS_JSON') || '[]');
  if (!Array.isArray(ids) || ids.length && (ids.length !== 24 || ids.some(function (id) { return typeof id !== 'string'; }) || new Set(ids).size !== 24)) throw TemaTrial.fault('IMPORT_INCOMPLETE');
  var result = { formation_boolean_repairs: 0, session_boolean_repairs: 0, invalid_known_cells: [] };
  function repair(name, rows, idField, id, field, counter) {
    var matches = rows.filter(function (r) { return r[idField] === id; });
    if (matches.length > 1) throw TemaTrial.fault('CONFIG');
    if (!matches.length) return;
    var row = matches[0], tab = sheet.getSheetByName(name), headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0], cell = tab.getRange(row._sheetRow, headers.indexOf(field) + 1), value = row[field];
    if (typeof value === 'boolean') { if (cell.getNumberFormat() === '@') cell.setNumberFormat('General'); return; }
    if (cell.getNumberFormat() === '@' && (value === 'true' || value === 'false')) { cell.setNumberFormat('General').setValue(value === 'true'); result[counter] += 1; return; }
    result.invalid_known_cells.push({ id: id, field: field });
  }
  ids.forEach(function (id) { repair('Formations', data.formations, 'id', id, 'actif', 'formation_boolean_repairs'); });
  for (var i = 0; i < 3; i += 1) { var saved = props.getProperty('V1_FICTITIOUS_SESSION_' + i); if (!saved) continue; var state = JSON.parse(saved); if (state.version !== 1 || typeof state.id !== 'string') throw TemaTrial.fault('SEED_CONFIG'); repair('Disponibilités', data.sessions, 'id_cohorte', state.id, 'inscriptions_ouvertes', 'session_boolean_repairs'); }
  SpreadsheetApp.flush();
  return result;
}
function repairV1TrialCellTypes() { trialGuard_(); return trialLock_(function () { var result = trialRepairV1CellTypesUnlocked_(); result.administration = reconcileTrialUnlocked_(); console.log(JSON.stringify(result)); return result; }); }
/** Replace this project's own fallback only; unrelated triggers are retained. */
function installV1TrialTriggers() {
  trialGuard_();
  var triggers = ScriptApp.getProjectTriggers(), previousFallbacks = triggers.filter(function (t) { return t.getHandlerFunction() === 'reconcileTrial_'; });
  // Preserve the previous recovery path until Google confirms replacement
  // creation. A quota/permission failure must not remove working fallbacks.
  if (!triggers.some(function (t) { return t.getHandlerFunction() === 'trialOnEdit_'; })) ScriptApp.newTrigger('trialOnEdit_').forSpreadsheet(TEMA_TRIAL_TARGET.spreadsheet).onEdit().create();
  ScriptApp.newTrigger('reconcileTrial_').timeBased().everyMinutes(5).create();
  previousFallbacks.forEach(function (t) { ScriptApp.deleteTrigger(t); });
  return { environment: 'TEST', fallback_minutes: 5, trigger_count: ScriptApp.getProjectTriggers().length };
}
/** Values remain private; callers must never log/stringify this export to public evidence. */
function exportTrialData_() {
  trialGuard_();
  return trialLock_(function () {
    var sheet = trialSheet_(), tables = {};
    Object.keys(TemaTrial.HEADERS).concat(['Paramètres']).forEach(function (name) {
      var tab = sheet.getSheetByName(name); if (!tab) throw TemaTrial.fault('CONFIG');
      // Typed JSON -> supplied XLSX tool. Do not use CSV or formulas.
      tables[name] = tab.getDataRange().getValues().map(function (line) { return line.map(function (value) { return value instanceof Date ? value.toISOString() : value; }); });
    });
    return { schema_version: 1, environment: 'TEST', tables: tables };
  });
}
function exportTrialData() { return exportTrialData_(); }
/** Manual, explicit privacy operation. Retains IDs, replay fingerprint and snapshots. */
function removeTrialCoordinates_(id, cancelReservation) {
  trialGuard_(); if (typeof cancelReservation !== 'boolean') throw TemaTrial.fault('CLEANUP_DECISION_REQUIRED');
  return trialLock_(function () {
    var store = trialStore_(), data = store.read(), matches = data.registrations.filter(function (r) { return r.id_inscription === id; });
    if (matches.length !== 1) throw TemaTrial.fault('CONFIG');
    var row = matches[0];
    if (row.statut === 'confirmee' && !cancelReservation) {
      // Removing the deduplication identity of a future reservation while
      // retaining its place would admit another booking for the same person.
      // An unreadable instant cannot establish that cleanup is safely past.
      var start = typeof row.debut_snapshot === 'string' ? Date.parse(row.debut_snapshot) : NaN;
      var cohorts = data.sessions.filter(function (session) { return session.id_cohorte === row.id_cohorte; }), currentStart = NaN;
      if (cohorts.length === 1) { try { currentStart = Date.parse(TemaTrial.localToUtc(cohorts[0].date, cohorts[0].heure_debut, trialDependencies_().formatLocal)); } catch (_) { /* Remain unknown and fail closed. */ } }
      if (!Number.isFinite(start) || !Number.isFinite(currentStart) || start > Date.now() || currentStart > Date.now()) throw TemaTrial.fault('CLEANUP_FUTURE_RESERVATION_REQUIRES_CANCELLATION');
    }
    var patch = { prenom: '', nom: '', entreprise: '', courriel: '', telephone: '' };
    if (cancelReservation) patch.statut = 'annulee';
    ['participant', 'tema'].forEach(function (channel) {
      var state = row['mail_' + channel + '_etat'];
      if (state === 'PENDING') { patch['mail_' + channel + '_etat'] = 'SUPPRESSED'; patch['mail_' + channel + '_error_code'] = 'COORDINATES_REMOVED'; }
      if (state === 'SENDING') { patch['mail_' + channel + '_etat'] = 'UNKNOWN'; patch['mail_' + channel + '_error_code'] = 'COORDINATES_REMOVED_AFTER_CLAIM'; }
    });
    store.patch(id, patch); store.flush();
    PropertiesService.getScriptProperties().setProperty('CLEANUP_' + id, JSON.stringify({ version: 1, at: new Date().toISOString(), reservation_cancelled: cancelReservation }));
    reconcileTrialUnlocked_();
    return { environment: 'TEST', coordinates_removed: true, reservation_cancelled: cancelReservation, copies_and_Gmail_require_manual_cleanup: true, already_claimed_mail_may_still_be_transmitted: ['participant', 'tema'].some(function (channel) { return row['mail_' + channel + '_etat'] === 'SENDING'; }) };
  });
}
/** Deterministic no-change timing only; edit-to-browser latency is measured separately. */
function measureV1TrialUnchanged() {
  trialGuard_(); var measurements = [], mailsBefore = inspectTrial_().reserved_recipients;
  reconcileTrial_();
  for (var i = 0; i < 12; i += 1) { var start = Date.now(), result = reconcileTrial_(); measurements.push({ ms: Date.now() - start, patches: result.patches }); }
  var result = { environment: 'TEST', unchanged_runs: measurements, max_ms: Math.max.apply(null, measurements.map(function (m) { return m.ms; })), reserved_recipients_before: mailsBefore, reserved_recipients_after: inspectTrial_().reserved_recipients, extrapolated_fallback_ms_per_day: 288 * Math.max.apply(null, measurements.map(function (m) { return m.ms; })), edit_measurements_required: true };
  console.log(JSON.stringify(result));
  return result;
}
