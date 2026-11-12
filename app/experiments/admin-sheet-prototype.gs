/** @OnlyCurrentDoc */
/* Sections administrables ; le bundle COPY partage son verrou avec l’admission web. */
var TemaSheetPrototype = (function () {
  'use strict';
  var TARGET = '10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8';
  var SOFTWARES = { Divalto: 'DIV', Dimo: 'DIMO', MoovApps: 'MOOV' };
  function text(v) { return String(v === null || v === undefined ? '' : v).trim(); }
  function empty(v) { return v === '' || v === null || v === undefined; }
  function ref(v) { return text(v).split(' — ')[0]; }
  function positive(v) { return typeof v === 'number' && Number.isSafeInteger(v) && v > 0; }
  function sections(rows, titleColumn) {
    var list = [];
    rows.forEach(function (r, i) {
      var m = text(r[titleColumn]).match(/^(Divalto|Dimo|MoovApps) — Formation$/);
      if (m) list.push({ label: m[1], code: SOFTWARES[m[1]], header: i + 1 });
    });
    if (list.length !== 3 || new Set(list.map(function (s) { return s.code; })).size !== 3) throw new Error('Les trois sections logiciels doivent être conservées.');
    list.forEach(function (s, i) { s.end = list[i + 1] ? list[i + 1].header - 1 : rows.length; });
    return list;
  }
  function records(rows, titleColumn) {
    var result = [];
    sections(rows, titleColumn).forEach(function (s) {
      for (var r = s.header + 1; r <= s.end; r++) {
        var v = rows[r - 1];
        var meaningful = titleColumn === 2 ? [0, 2, 3, 4, 5, 6, 7, 8] : [0, 1, 2, 3, 4, 5, 6, 7];
        if (meaningful.some(function (c) { return !empty(v[c]); }) || v[titleColumn === 2 ? 12 : 8] === true) result.push({ row: r, section: s, values: v });
      }
    });
    return result;
  }
  function touched(event, sheet, row) { return event && event.sheet === sheet && event.first <= row && event.last >= row; }
  function localUtc(date, time, formatLocal) {
    if (!/^\d{4}-\d\d-\d\d$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
    var n = Date.parse(date + 'T' + time + ':00Z');
    if (!Number.isFinite(n) || new Date(n).toISOString().slice(0, 10) !== date) return null;
    var target = date + 'T' + time;
    var hits = [4, 5].map(function (h) { return n + h * 3600000; }).filter(function (ms) { return formatLocal(ms) === target; });
    return hits.length === 1 ? hits[0] : null;
  }
  function formationError(v) {
    if (!text(v[2]) || !/[a-z0-9]/i.test(text(v[2]).normalize('NFKD'))) return 'Titre requis.';
    if (!text(v[7])) return 'Renseignez la durée avant de publier.';
    if (!empty(v[8]) && !(typeof v[8] === 'number' && Number.isFinite(v[8]) && v[8] >= 0)) return 'Le tarif doit être un nombre positif ou vide.';
    return '';
  }
  function remintCopies(items, event, sheet, uuid, publicationColumn) {
    var groups = Object.create(null);
    items.forEach(function (x) { if (x.values[0]) (groups[x.values[0]] || (groups[x.values[0]] = [])).push(x); });
    Object.keys(groups).forEach(function (id) {
      var group = groups[id]; if (group.length < 2) return;
      var untouched = group.filter(function (x) { return !touched(event, sheet, x.row); });
      var keep = untouched.length === 1 ? untouched[0] : group[0];
      group.forEach(function (x) {
        if (x !== keep && touched(event, sheet, x.row)) {
          x.values[0] = (sheet === 'Formations' ? x.section.code + '-PR-' : 'C-') + uuid();
          x.values[publicationColumn] = false;
        }
      });
    });
  }
  function plan(formations, sessions, event, deps) {
    var f = formations.map(function (r) { return r.slice(); }), s = sessions.map(function (r) { return r.slice(); });
    var notes = [], lists = { DIV: [], DIMO: [], MOOV: [] }, map = Object.create(null), duplicates = Object.create(null), changedFormIds = Object.create(null);
    if (event && event.sheet === 'Formations') f.forEach(function (v, i) { if (v[0] && touched(event, 'Formations', i + 1)) changedFormIds[v[0]] = true; });
    var fItems = records(f, 2), sItems = records(s, 1);
    remintCopies(fItems, event, 'Formations', deps.uuid, 12);
    remintCopies(sItems, event, 'Disponibilités', deps.uuid, 8);
    fItems.forEach(function (item) {
      var v = item.values, fresh = empty(v[0]);
      if (fresh && text(v[2])) {
        v[0] = item.section.code + '-PR-' + deps.uuid();
        v[1] = item.section.code + ' — ' + item.section.label;
        if (empty(v[10])) v[10] = 8;
        if (empty(v[12])) v[12] = false;
      }
      var err = text(v[1]).split(' — ')[0] !== item.section.code ? 'Cette formation appartient à un autre logiciel.' : formationError(v);
      if (v[12] === true && err) v[12] = false;
      notes.push({ sheet: 'Formations', row: item.row, column: 3, message: err });
      if (v[0]) {
        if (map[v[0]]) duplicates[v[0]] = true;
        map[v[0]] = { values: v, software: item.section.code, label: v[0] + ' — ' + text(v[2]), valid: !err };
      }
    });
    Object.keys(duplicates).forEach(function (id) {
      delete map[id];
      fItems.filter(function (x) { return x.values[0] === id; }).forEach(function (x) {
        x.values[12] = false;
        notes.push({ sheet: 'Formations', row: x.row, column: 3, message: 'Identifiant de formation dupliqué : recréez la fiche.' });
      });
    });
    Object.keys(map).forEach(function (id) {
      var entry = map[id];
      if (entry.valid && entry.values[12] === true) lists[entry.software].push(entry.label);
    });
    var sessionIds = Object.create(null);
    sItems.forEach(function (x) { if (x.values[0]) sessionIds[x.values[0]] = (sessionIds[x.values[0]] || 0) + 1; });
    sItems.forEach(function (item) {
      var v = item.values, entry = map[ref(v[1])], fresh = empty(v[0]);
      if (entry) v[1] = entry.label;
      if (fresh && !empty(v[1])) {
        v[0] = 'C-' + deps.uuid();
        if (empty(v[8])) v[8] = false;
      }
      var count = deps.confirmed[v[0]] || 0;
      v[9] = positive(v[5]) ? Math.max(0, v[5] - count) : '';
      var recovered = positive(v[5]) && count <= v[5] && v[10] === 'La capacité est inférieure aux inscriptions confirmées.';
      if (recovered) v[10] = '';
      if (!fresh && !recovered && v[8] !== true && !touched(event, 'Disponibilités', item.row) && !changedFormIds[ref(v[1])] && !(positive(v[5]) && count > v[5]) && sessionIds[v[0]] < 2) { notes.push({ sheet: 'Disponibilités', row: item.row, column: 2, message: v[10] || '' }); return; }
      var err = '';
      if (sessionIds[v[0]] > 1) err = 'Identifiant de session dupliqué : recréez la ligne dans sa section.';
      else if (!entry || !entry.valid) err = 'Choisissez une formation valide dans la liste.';
      else if (entry.software !== item.section.code) err = 'Cette formation appartient à un autre logiciel.';
      else if (entry.values[12] !== true) err = 'Cette formation n’est pas publiée.';
      var date = deps.cellText(v[2], 'date'), start = deps.cellText(v[3], 'time'), end = deps.cellText(v[4], 'time');
      var a = localUtc(date, start, deps.formatLocal), b = localUtc(date, end, deps.formatLocal);
      if (!err && (a === null || b === null || b <= a)) err = 'Renseignez une date et des horaires valides (fin après début).';
      if (!err && a <= deps.now()) err = 'La session doit être dans le futur.';
      if (!err && !positive(v[5])) err = 'La capacité doit être un nombre entier positif.';
      if (!err && ['en_ligne', 'presentiel'].indexOf(v[6]) < 0) err = 'Choisissez en_ligne ou presentiel.';
      if (!err && v[6] === 'presentiel' && !text(v[7])) err = 'Renseignez le lieu de la session en présentiel.';
      if (!err && v[6] === 'en_ligne' && text(v[7]) && !(typeof TemaTrial !== 'undefined' ? TemaTrial.validUrl(text(v[7])) : /^https:\/\/[^\s<>"'\\]+$/.test(text(v[7])))) err = 'Renseignez un lien HTTPS valide ou laissez le lien vide.';
      if (!err && positive(v[5]) && count > v[5]) err = 'La capacité est inférieure aux inscriptions confirmées.';
      v[10] = err;
      if (err) v[8] = false;
      notes.push({ sheet: 'Disponibilités', row: item.row, column: 2, message: err });
    });
    return { formations: f, sessions: s, lists: lists, notes: notes };
  }
  function applyDiff(sheet, before, after) {
    var conflict = false;
    after.forEach(function (row, i) {
      row.forEach(function (v, j) {
        if (v !== before[i][j]) {
          var cell = sheet.getRange(i + 1, j + 1);
          // Ne pas écraser une saisie intervenue pendant le calcul Google.
          if (cell.getValue() === before[i][j]) { if (typeof TemaCopy !== 'undefined') TemaCopy.dirty(true); cell.setValue(v); }
          else conflict = true;
        }
      });
    });
    return conflict;
  }
  function read(sheet, width) { return sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), width).getValues(); }
  function restoreSpacing(sheet, width, titleColumn, event) {
    var values = read(sheet, width), list = sections(values, titleColumn);
    // Le + natif peut consommer la ligne vide avant la section suivante.
    for (var i = list.length - 1; i > 0; i--) {
      var previous = values[list[i].header - 2];
      if (previous && !empty(previous[titleColumn])) {
        var position = list[i].header;
        if (typeof TemaCopy !== 'undefined') TemaCopy.dirty(true);
        sheet.insertRowsBefore(position, 1);
        if (event && event.sheet === sheet.getName()) {
          if (event.first >= position) event.first++;
          if (event.last >= position) event.last++;
        }
      }
    }
  }
  function confirmedCounts(book) {
    var sheet = book.getSheetByName('Inscriptions'), result = Object.create(null);
    if (!sheet || sheet.getLastRow() < 2) return result;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var id = headers.indexOf('id_cohorte') + 1, status = headers.indexOf('statut') + 1;
    if (!id || !status) throw new Error('Structure Inscriptions inconnue : aucun compteur modifié.');
    var ids = sheet.getRange(2, id, sheet.getLastRow() - 1, 1).getValues();
    var states = sheet.getRange(2, status, ids.length, 1).getValues();
    ids.forEach(function (r, i) { if (states[i][0] === 'confirmee') result[r[0]] = (result[r[0]] || 0) + 1; });
    return result;
  }
  function refreshLists(sheet, rows, lists) {
    sections(rows, 1).forEach(function (section, i, all) {
      var lastData = section.header;
      for (var n = section.header + 1; n <= section.end; n++) if (!empty(rows[n - 1][1])) lastData = n;
      var end = all[i + 1] ? section.end : Math.min(sheet.getMaxRows(), lastData + 12);
      var values = lists[section.code];
      var validations = [];
      for (var r = section.header + 1; r <= end; r++) {
        var current = text(rows[r - 1] && rows[r - 1][1]);
        var choices = values.slice();
        // Conserver le choix historique d’une session dont la fiche a été retirée.
        if (current && choices.indexOf(current) < 0) choices.push(current);
        validations.push([choices.length ? SpreadsheetApp.newDataValidation().requireValueInList(choices, true).setAllowInvalid(false).build() : null]);
      }
      if (validations.length) {
        var range = sheet.getRange(section.header + 1, 2, validations.length, 1);
        function signature(rule) { return rule ? JSON.stringify([String(rule.getCriteriaType()), rule.getCriteriaValues(), rule.getAllowInvalid()]) : 'null'; }
        var currentRules = typeof range.getDataValidations === 'function' ? range.getDataValidations() : null;
        if (!currentRules || currentRules.some(function (line, i) { return signature(line[0]) !== signature(validations[i][0]); })) range.setDataValidations(validations);
      }
    });
  }
  function refreshNotes(book, notes) {
    // Only the managed note cells, grouped by sheet/column and adjacent rows.
    var groups = {};
    notes.forEach(function (note) { var key = note.sheet + ':' + note.column; if (!groups[key]) groups[key] = { sheet: note.sheet, column: note.column, rows: {} }; groups[key].rows[note.row] = note.message || ''; });
    Object.keys(groups).forEach(function (key) {
      var group = groups[key], rows = Object.keys(group.rows).map(Number).sort(function (a, b) { return a - b; });
      for (var i = 0; i < rows.length;) {
        var start = rows[i], values = [[group.rows[rows[i++]]]];
        while (i < rows.length && rows[i] === start + values.length) values.push([group.rows[rows[i++]]]);
        var range = book.getSheetByName(group.sheet).getRange(start, group.column, values.length, 1);
        if (typeof range.getNotes === 'function' && JSON.stringify(range.getNotes()) === JSON.stringify(values)) continue;
        if (typeof range.setNotes === 'function') range.setNotes(values);
        else values.forEach(function (value, offset) { book.getSheetByName(group.sheet).getRange(start + offset, group.column).setNote(value[0]); });
      }
    });
  }
  function sync(book, event) {
    if (!book || book.getId() !== TARGET) return false;
    if (typeof TemaCopy !== 'undefined') {
      TemaCopy.guard(book);
      // Any failed/partial maintenance must be retried even for an unchanged source.
      PropertiesService.getScriptProperties().setProperty('COPY_ADMIN_MAINTENANCE_PENDING', '1');
    }
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) { book.toast('Une autre mise à jour est en cours. Réessayez votre modification.', 'Tema', 7); return false; }
    try {
      var fs = book.getSheetByName('Formations'), ss = book.getSheetByName('Disponibilités');
      if (!fs || !ss) throw new Error('Conservez les onglets Formations et Disponibilités.');
      if (typeof TemaCopy !== 'undefined') TemaCopy.assertAdministrativeLayout(book);
      restoreSpacing(fs, 13, 2, event); restoreSpacing(ss, 12, 1, event);
      var f = read(fs, 13), s = read(ss, 12);
      var plannedAt = Date.now();
      var deps = {
        uuid: function () { return Utilities.getUuid(); }, now: function () { return plannedAt; }, confirmed: confirmedCounts(book),
        formatLocal: function (ms) { return Utilities.formatDate(new Date(ms), 'America/Toronto', "yyyy-MM-dd'T'HH:mm"); },
        cellText: function (v, kind) { return v instanceof Date ? Utilities.formatDate(v, 'America/Toronto', kind === 'date' ? 'yyyy-MM-dd' : 'HH:mm') : text(v); }
      };
      var result = plan(f, s, event, deps);
      var conflict = applyDiff(fs, f, result.formations);
      conflict = applyDiff(ss, s, result.sessions) || conflict;
      if (conflict) {
        f = read(fs, 13); s = read(ss, 12);
        result = plan(f, s, event, deps);
        applyDiff(fs, f, result.formations); applyDiff(ss, s, result.sessions);
      }
      SpreadsheetApp.flush();
      var expected = typeof TemaCopy !== 'undefined' ? TemaCopy.adminFingerprint(book, result, { confirmed: deps.confirmed, now: plannedAt }) : null;
      if (typeof TemaCopy === 'undefined') {
        refreshLists(ss, result.sessions, result.lists); refreshNotes(book, result.notes);
        var standaloneErrors = result.notes.filter(function (n) { return n.message; });
        if (event && standaloneErrors.length) book.toast(standaloneErrors[0].message, 'À compléter', 8);
        SpreadsheetApp.flush(); return true;
      }
    } finally { lock.releaseLock(); }
    var errors = result.notes.filter(function (n) { return n.message; });
    if (event && errors.length) book.toast(errors[0].message, 'À compléter', 8);
    // Cosmetic writes never hold the capacity/admission lock. A changed source
    // prevents acknowledgement and is recomputed on the next maintenance pass.
    var renderLock, held = false;
    try {
      if (typeof TemaCopy !== 'undefined') {
        if (!TemaCopy.isOwner()) return false;
        renderLock = LockService.getUserLock();
        if (!renderLock.tryLock(0)) return false;
        held = true;
        if (TemaCopy.adminFingerprint(book) !== expected) return false;
      }
      refreshLists(ss, result.sessions, result.lists);
      refreshNotes(book, result.notes);
      SpreadsheetApp.flush();
      return typeof TemaCopy === 'undefined' || TemaCopy.acknowledgeAdmin(book, expected);
    } finally { if (held) renderLock.releaseLock(); }
  }
  return { target: TARGET, sections: sections, records: records, plan: plan, localUtc: localUtc, sync: sync };
})();

function onOpen(e) {
  var book = e && e.source;
  if (!book || book.getId() !== TemaSheetPrototype.target) return;
  if (typeof TemaCopy !== 'undefined') TemaCopy.guard(book);
  if (typeof TemaAdminActions !== 'undefined') TemaAdminActions.menu(book);
  try {
    if (typeof TemaCopy === 'undefined') TemaSheetPrototype.sync(book, null);
    else PropertiesService.getScriptProperties().setProperty('COPY_ADMIN_MAINTENANCE_PENDING', '1');
  }
  catch (err) { book.toast(String(err.message), 'Prototype : actualisation interrompue', 10); throw err; }
  if (typeof TemaRegistrationView !== 'undefined') TemaRegistrationView.refresh(book, false);
}

function onEdit(e) {
  if (!e || !e.source || e.source.getId() !== TemaSheetPrototype.target || !e.range) return;
  if (typeof TemaCopy !== 'undefined') TemaCopy.guard(e.source);
  if (typeof TemaRegistrationView !== 'undefined' && TemaRegistrationView.edited(e)) return;
  var name = e.range.getSheet().getName();
  if (['Formations', 'Disponibilités', 'Inscriptions'].indexOf(name) < 0) return;
  // La saisie humaine existe déjà, même si un écrivain tient le ScriptLock.
  if (typeof TemaCopy !== 'undefined') TemaCopy.dirty(true);
  try {
    if (typeof TemaCopy !== 'undefined' && name === 'Inscriptions') {
      TemaCopy.markCountersPending();
    } else if (TemaSheetPrototype.sync(e.source, { sheet: name, first: e.range.getRow(), last: e.range.getLastRow() }) !== true) return;
  }
  catch (err) { e.source.toast(String(err.message), 'Prototype : actualisation interrompue', 10); throw err; }
  if (typeof TemaRegistrationView !== 'undefined') TemaRegistrationView.refresh(e.source, false);
}

if (typeof module !== 'undefined') module.exports = TemaSheetPrototype;
