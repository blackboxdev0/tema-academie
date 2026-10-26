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
function trialReadTable_(sheet, name) {
  var tab = sheet.getSheetByName(name); if (!tab) throw TemaTrial.fault('CONFIG');
  var values = tab.getDataRange().getValues(), headers = TemaTrial.HEADERS[name];
  TemaTrial.tableRows([values[0]], headers);
  var rows = [];
  values.slice(1).forEach(function (line, index) {
    // Native checkbox validation fills unused rows with false. Those default
    // cells must not become hundreds of empty sessions/automatic IDs.
    var ignored = name === 'Formations' ? ['actif'] : name === 'Disponibilités' ? ['inscriptions_ouvertes', 'places_restantes', 'etat_validation'] : [];
    if (!line.some(function (v, i) { return ignored.indexOf(values[0][i]) < 0 && v !== '' && v !== null; })) return;
    var row = TemaTrial.tableRows([values[0], line], headers)[0]; row._sheetRow = index + 2;
    if (name === 'Disponibilités') {
      if (row.date instanceof Date) row.date = Utilities.formatDate(row.date, 'America/Toronto', 'yyyy-MM-dd');
      ['heure_debut', 'heure_fin'].forEach(function (k) { if (row[k] instanceof Date) row[k] = Utilities.formatDate(row[k], 'America/Toronto', 'HH:mm'); });
    }
    rows.push(row);
  });
  return rows;
}
function trialReadParams_(sheet) {
  var tab = sheet.getSheetByName('Paramètres'); if (!tab) throw TemaTrial.fault('CONFIG');
  var table = trialParamsTable_(tab), params = {}, softwares = [];
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
  function read() {
    var sheet = trialSheet_();
    return { formations: trialReadTable_(sheet, 'Formations'), sessions: trialReadTable_(sheet, 'Disponibilités'), registrations: trialReadTable_(sheet, 'Inscriptions'), params: trialReadParams_(sheet) };
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
    // Force text before writing; an apostrophe additionally neutralizes formulas.
    tab.getRange(tab.getLastRow() + 1, 1, 1, headers.length).setNumberFormat('@').setValues([line]);
  }
  return { read: read, insert: insert, patch: patch, flush: function () { SpreadsheetApp.flush(); } };
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
    guard: trialGuard_, store: trialStore_(), withLock: trialLock_, reserveMail: trialReserveMail_,
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
    formTab.getRange(2, 1, 1, formHeaders.length).setValues([formHeaders.map(function (k) { return formation[k] === undefined ? '' : formation[k]; })]);
    var year = new Date().getUTCFullYear() + 1;
    var sessions = [
      { id_cohorte: 'C-' + Utilities.getUuid(), formation: '', date: year + '-01-15', heure_debut: '09:00', heure_fin: '12:00', places_max: 3, mode: 'en_ligne', lieu_ou_lien: '', inscriptions_ouvertes: false, places_restantes: 3, etat_validation: '' },
      { id_cohorte: 'C-' + Utilities.getUuid(), formation: '', date: year + '-07-15', heure_debut: '09:00', heure_fin: '12:00', places_max: 3, mode: 'presentiel', lieu_ou_lien: '123, rue Fictive, Montréal — TEST', inscriptions_ouvertes: false, places_restantes: 3, etat_validation: '' }
    ];
    var sessionTab = sheet.getSheetByName('Disponibilités'), sessionHeaders = sessionTab.getRange(1, 1, 1, sessionTab.getLastColumn()).getValues()[0];
    sessionTab.getRange(2, 1, 2, sessionHeaders.length).setNumberFormat('@').setValues(sessions.map(function (s) { return sessionHeaders.map(function (k) { return s[k] === undefined ? '' : s[k]; }); }));
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
function trialRefreshChoices_(sheet) {
  var params = trialReadParams_(sheet), formationTab = sheet.getSheetByName('Formations'), sessionTab = sheet.getSheetByName('Disponibilités');
  var formHeaders = formationTab.getRange(1, 1, 1, formationTab.getLastColumn()).getValues()[0], sessionHeaders = sessionTab.getRange(1, 1, 1, sessionTab.getLastColumn()).getValues()[0];
  var softwares = params.softwares.filter(function (s) { return s.id && String(s.label).trim() && params.softwares.filter(function (other) { return other.id === s.id; }).length === 1; });
  var choices = softwares.map(function (s) { return s.id + ' — ' + s.label; });
  formationTab.getRange(2, formHeaders.indexOf('logiciel') + 1, formationTab.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(choices, true).setAllowInvalid(false).build());
  var formations = trialReadTable_(sheet, 'Formations'), changes = [];
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
  if (formChoices.length) sessionTab.getRange(2, sessionHeaders.indexOf('formation') + 1, sessionTab.getMaxRows() - 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(formChoices, true).setAllowInvalid(false).build());
  trialReadTable_(sheet, 'Disponibilités').forEach(function (s) {
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
function trialFormationNotes_(sheet) {
  var formations = trialReadTable_(sheet, 'Formations'), tab = sheet.getSheetByName('Formations'), headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
  var issues = TemaTrial.formationIssues({ formations: formations, params: trialReadParams_(sheet) }), count = 0;
  ['id', 'titre', 'duree', 'logiciel', 'prix', 'actif'].forEach(function (key) {
    var range = tab.getRange(2, headers.indexOf(key) + 1, tab.getMaxRows() - 1), notes = range.getNotes();
    notes.forEach(function (line) { if (line[0].indexOf('TEM-6 — ') === 0) line[0] = ''; });
    formations.forEach(function (f, index) { if (issues[index][key]) { notes[f._sheetRow - 2][0] = 'TEM-6 — ' + issues[index][key]; count += 1; } });
    range.setNotes(notes);
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
  props.setProperty('SOFTWARE_RESERVED_IDS_JSON', JSON.stringify(reserved));
  return table.rows.filter(function (r) { return r.id || r.label; }).map(function (r) { return { id: String(r.id), label: String(r.label) }; });
}
function trialAdministrationDigest_(data, counter, hash) {
  // Version this private checkpoint when administration repair rules change.
  // Include displayed calculations so manual overwrites are repaired too.
  // Notes and notification states do not drive these repairs.
  function rows(records, keys) { return records.map(function (row) { return [row._sheetRow].concat(keys.map(function (key) { return row[key]; })); }); }
  return hash(JSON.stringify([
    'TEM-6-admin-v2', counter,
    rows(data.formations, TemaTrial.HEADERS.Formations), rows(data.sessions, TemaTrial.HEADERS['Disponibilités']),
    data.registrations.map(function (row) { return [row.id_inscription, row.id_cohorte, row.statut]; }),
    Object.keys(data.params).sort().map(function (key) { return [key, data.params[key]]; })
  ]));
}
function reconcileTrialUnlocked_() {
  var deps = trialDependencies_(), props = PropertiesService.getScriptProperties(), sheet = trialSheet_();
  var savedCounter = props.getProperty('FORMATION_COUNTER'), next = savedCounter === null ? 0 : Number(savedCounter);
  if (savedCounter !== null && !/^\d+$/.test(savedCounter) || !Number.isSafeInteger(next) || next < 0) throw TemaTrial.fault('COUNTER_RANGE');
  var data = deps.store.read();
  if (props.getProperty('TRIAL_ADMIN_DIGEST') === trialAdministrationDigest_(data, next, deps.hash)) return { patches: 0, counter: next };
  data.params.softwares = trialReconcileSoftwares_(sheet, props);
  var result = TemaTrial.prepareAdministration(data, deps, next);
  // Reserve the monotonic counter before IDs are written. Gaps are allowed.
  props.setProperty('FORMATION_COUNTER', String(result.counter));
  result.patches.forEach(function (p) {
    var tab = sheet.getSheetByName(p.sheet), headers = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
    var source = p.sheet === 'Formations' ? data.formations : data.sessions, row = source[p.index]._sheetRow;
    Object.keys(p.values).forEach(function (k) { tab.getRange(row, headers.indexOf(k) + 1).setValue(TemaTrial.inertCell(p.values[k])); source[p.index][k] = p.values[k]; });
  });
  trialRefreshChoices_(sheet).forEach(function (change) {
    var row = data[change.table].find(function (r) { return r._sheetRow === change.row; });
    if (row && row[change.field] === change.before) row[change.field] = change.value;
  });
  trialFormationNotes_(sheet);
  SpreadsheetApp.flush();
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
  if (handlers.indexOf('reconcileTrial_') < 0) ScriptApp.newTrigger('reconcileTrial_').timeBased().everyMinutes(1).create();
  return { trigger_count: ScriptApp.getProjectTriggers().length };
}
/** Read-only private evidence, without recipients or PII. Never resets a counter. */
function inspectTrial_() {
  trialGuard_(); var props = PropertiesService.getScriptProperties(), data = trialStore_().read();
  var budget = JSON.parse(props.getProperty('TRIAL_MAIL_BUDGET_JSON') || '{"version":1,"registrations":{},"recipients":0}');
  return { environment: 'TEST', formations: data.formations.length, sessions: data.sessions.length, registrations: data.registrations.length, real_mail_registrations: Object.keys(budget.registrations).length, reserved_recipients: budget.recipients, remaining_daily_quota: MailApp.getRemainingDailyQuota(), trigger_count: ScriptApp.getProjectTriggers().length };
}

// Apps Script hides trailing-underscore names in the editor's Run selector.
// These editor entry points log only aggregate, non-personal results. No HTTP
// handler dispatches their names and no HTML/RPC page is served by this trial.
function inspectTrial() { var result = inspectTrial_(); console.log(JSON.stringify(result)); return result; }
function installTrial() { var result = installTrial_(); console.log(JSON.stringify(result)); return result; }
function reconcileTrial() { var result = reconcileTrial_(); console.log(JSON.stringify(result)); return result; }
function repairTrial() { var result = repairTrial_(); console.log(JSON.stringify(result)); return result; }
function installTrialTriggers() { var result = installTrialTriggers_(); console.log(JSON.stringify(result)); return result; }
