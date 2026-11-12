/** Formulaires et commandes liés exclusivement à la copie d’essai. */
var TemaAdminActions = (function () {
  'use strict';
  var SOFTWARE = { DIV: 'Divalto', DIMO: 'Dimo', MOOV: 'MoovApps' };
  function guard(book) {
    if (!book || book.getId() !== TemaSheetPrototype.target) throw new Error('Cette commande est réservée à la copie d’essai.');
    if (typeof TemaCopy !== 'undefined') TemaCopy.guard(book);
  }
  function str(v, max) {
    if (v === undefined || v === null) return '';
    if (typeof v !== 'string' || v.length > max) throw new Error('Un champ est trop long ou invalide.');
    return v.trim();
  }
  function num(v, integer, allowBlank) {
    if (allowBlank && v === '') return '';
    if (!(typeof v === 'number' || typeof v === 'string') || !/^(\d+)(\.\d{1,2})?$/.test(String(v))) throw new Error(integer ? 'Renseignez une capacité entière positive.' : 'Renseignez un tarif positif ou laissez le champ vide.');
    var n = Number(v);
    if (!Number.isFinite(n) || n < 0 || (integer && (!Number.isSafeInteger(n) || n < 1))) throw new Error('Renseignez une capacité entière positive.');
    return n;
  }
  function read(book, name, width) {
    var sheet = book.getSheetByName(name);
    if (!sheet) throw new Error('L’onglet ' + name + ' est introuvable.');
    return sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), width).getValues();
  }
  function deps() {
    return {
      uuid: function () { return Utilities.getUuid(); }, now: function () { return Date.now(); }, confirmed: {},
      formatLocal: function (ms) { return Utilities.formatDate(new Date(ms), 'America/Toronto', "yyyy-MM-dd'T'HH:mm"); },
      cellText: function (v, kind) { return v instanceof Date ? Utilities.formatDate(v, 'America/Toronto', kind === 'date' ? 'yyyy-MM-dd' : 'HH:mm') : String(v === undefined || v === null ? '' : v).trim(); }
    };
  }
  function options(book) {
    guard(book);
    if (typeof TemaCopy !== 'undefined') TemaCopy.assertAdministrativeLayout(book);
    var f = read(book, 'Formations', 13), s = read(book, 'Disponibilités', 12), d = deps();
    var result = TemaSheetPrototype.plan(f, s, null, d);
    return Object.keys(SOFTWARE).map(function (code) {
      return { code: code, label: SOFTWARE[code], formations: result.lists[code].map(function (label) {
        var cut = label.indexOf(' — ');
        return { id: label.slice(0, cut), title: label.slice(cut + 3) };
      }) };
    });
  }
  function prepare(f, s, payload, d) {
    if (!payload || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.requestId || '')) throw new Error('Rouvrez le formulaire pour recommencer.');
    var code, rows, sheet, width, titleColumn, id = payload.requestId.toLowerCase();
    if (payload.kind === 'formation') {
      code = payload.software;
      if (!Object.prototype.hasOwnProperty.call(SOFTWARE, code)) throw new Error('Choisissez un logiciel.');
      var v = [code + '-PR-' + id, code + ' — ' + SOFTWARE[code], str(payload.title, 240), str(payload.description, 5000), str(payload.prerequisites, 5000), str(payload.content, 20000), str(payload.outcome, 5000), str(payload.duration, 120), num(payload.price, false, true), str(payload.priceQualifier, 240), 8, str(payload.trainers, 500), payload.published === true];
      if (!v[2] || !/[a-z0-9]/i.test(v[2].normalize('NFKD'))) throw new Error('Renseignez le titre de la formation.');
      if (!v[7]) throw new Error('Renseignez la durée de la formation.');
      rows = [v]; sheet = 'Formations'; width = 13; titleColumn = 2;
    } else if (payload.kind === 'sessions') {
      var formationId = str(payload.formationId, 120);
      var matches = TemaSheetPrototype.records(f, 2).filter(function (x) { return x.values[0] === formationId; });
      if (matches.length !== 1 || matches[0].values[12] !== true) throw new Error('Choisissez une formation publiée.');
      var formation = matches[0]; code = formation.section.code;
      if (!Array.isArray(payload.dates) || !payload.dates.length || payload.dates.length > 12) throw new Error('Ajoutez entre une et douze dates.');
      var seen = Object.create(null);
      rows = payload.dates.map(function (date, i) {
        if (!date || typeof date !== 'object') throw new Error('Renseignez chaque date.');
        var v = ['C-' + id + '-' + (i + 1), formationId + ' — ' + formation.values[2], str(date.date, 10), str(date.start, 5), str(date.end, 5), num(date.capacity, true, false), str(date.mode, 20), str(date.venue, 1000), payload.open === true, '', '', ''];
        var key = v[2] + ' ' + v[3];
        if (seen[key]) throw new Error('La même date et le même début figurent plusieurs fois.');
        seen[key] = true;
        return v;
      });
      sheet = 'Disponibilités'; width = 12; titleColumn = 1;
    } else throw new Error('Choisissez le type d’ajout.');
    var target = sheet === 'Formations' ? f : s;
    var section = TemaSheetPrototype.sections(target, titleColumn).filter(function (x) { return x.code === code; })[0];
    var planned = target.slice(); planned.splice.apply(planned, [section.header, 0].concat(rows));
    var check = TemaSheetPrototype.plan(sheet === 'Formations' ? planned : f, sheet === 'Disponibilités' ? planned : s, { sheet: sheet, first: section.header + 1, last: section.header + rows.length }, d);
    if (sheet === 'Disponibilités') {
      rows.forEach(function (v, i) {
        var valid = check.sessions[section.header + i];
        if (valid[10]) throw new Error('Session ' + (i + 1) + ' : ' + valid[10]);
        v[9] = valid[9];
      });
    }
    var existing = TemaSheetPrototype.records(target, titleColumn);
    var found = rows.map(function (v) { return existing.filter(function (x) { return x.values[0] === v[0]; }); });
    var requestFormations = TemaSheetPrototype.records(f, 2).filter(function (x) { return String(x.values[0]).endsWith('-PR-' + id); });
    var requestSessions = TemaSheetPrototype.records(s, 1).filter(function (x) { return String(x.values[0]).startsWith('C-' + id + '-'); });
    var requestRecords = requestFormations.length + requestSessions.length;
    if (requestRecords) {
      if (requestRecords !== rows.length || (sheet === 'Formations' ? requestSessions.length : requestFormations.length)) throw new Error('Cet ajout est déjà enregistré avec d’autres paramètres. Vérifiez les lignes.');
      if (!found.every(function (x) { return x.length === 1; })) throw new Error('Un ajout est déjà enregistré en partie. Vérifiez les lignes avant de recommencer.');
      rows.forEach(function (v, i) {
        for (var c = 0; c < (sheet === 'Formations' ? 13 : 9); c++) {
          var actual = found[i][0].values[c];
          if (sheet === 'Disponibilités' && c >= 2 && c <= 4) actual = d.cellText(actual, c === 2 ? 'date' : 'time');
          if (actual !== v[c]) throw new Error('Cet ajout est déjà enregistré. Fermez le formulaire et vérifiez la ligne.');
        }
      });
    }
    return { sheet: sheet, code: code, width: width, after: section.header, rows: rows, exists: found.every(function (x) { return x.length === 1; }), existingRow: found[0][0] && found[0][0].row };
  }
  function literal(v) { return typeof v === 'string' && /^\s*[=+@-]/.test(v) ? "'" + v : v; }
  function create(book, payload) {
    guard(book);
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error('Une mise à jour est en cours. Réessayez avec ce formulaire dans quelques secondes.');
    var result, targetRow, sheet, inserted = false;
    try {
      if (typeof TemaCopy !== 'undefined') TemaCopy.assertAdministrativeLayout(book);
      var f = read(book, 'Formations', 13), s = read(book, 'Disponibilités', 12);
      result = prepare(f, s, payload, deps());
      sheet = book.getSheetByName(result.sheet);
      targetRow = result.existingRow || result.after + 1;
      if (!result.exists) {
        var values = result.rows.map(function (r) {
          var v = r.map(literal);
          if (result.sheet === 'Disponibilités') {
            v[2] = Utilities.parseDate(r[2] + ' 00:00', 'America/Toronto', 'yyyy-MM-dd HH:mm');
            v[3] = Utilities.parseDate('1899-12-30 ' + r[3], 'America/Toronto', 'yyyy-MM-dd HH:mm');
            v[4] = Utilities.parseDate('1899-12-30 ' + r[4], 'America/Toronto', 'yyyy-MM-dd HH:mm');
          }
          return v;
        });
        if (typeof TemaCopy !== 'undefined') TemaCopy.dirty();
        sheet.insertRowsAfter(result.after, result.rows.length); inserted = true;
        var target = sheet.getRange(targetRow, 1, result.rows.length, result.width);
        sheet.getRange(targetRow + result.rows.length, 1, 1, result.width).copyTo(target, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
        sheet.getRange(targetRow + result.rows.length, 1, 1, result.width).copyTo(target, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
        if (result.sheet === 'Disponibilités') sheet.getRange(targetRow, 2, result.rows.length, 1).clearDataValidations();
        if (result.sheet === 'Disponibilités') {
          sheet.getRange(targetRow, 3, values.length, 1).setNumberFormat('yyyy-mm-dd');
          sheet.getRange(targetRow, 4, values.length, 1).setNumberFormat('hh:mm');
          sheet.getRange(targetRow, 5, values.length, 1).setNumberFormat('hh:mm');
        }
        target.setValues(values);
        sheet.autoResizeRows(targetRow, values.length);
        SpreadsheetApp.flush();
      }
    } catch (err) {
      if (inserted) {
        var current = sheet.getRange(targetRow, 1, result.rows.length, result.width).getValues();
        if (current.every(function (r) { return r.every(function (v) { return v === '' || v === false; }); })) sheet.deleteRows(targetRow, result.rows.length);
        else throw new Error('L’ajout a pu être enregistré. Vérifiez les lignes ou réessayez avec ce formulaire ; les données saisies ont été conservées.');
      }
      throw err;
    } finally { lock.releaseLock(); }
    var notice = '';
    try { if (TemaSheetPrototype.sync(book, null) !== true) notice = 'Ajout enregistré. Rouvrez le classeur pour actualiser les listes et les compteurs.'; }
    catch (err) { notice = 'Ajout enregistré. Rouvrez le classeur pour actualiser les listes et les compteurs.'; }
    if (typeof TemaRegistrationView !== 'undefined') {
      try { if (TemaRegistrationView.refresh(book, false) !== true && book.getSheetByName(TemaRegistrationView.name)) notice += ' Le suivi doit être actualisé depuis le menu.'; }
      catch (err) { notice += ' Ajout conservé ; actualisez le suivi depuis le menu.'; }
    }
    book.setActiveSheet(sheet); sheet.setActiveRange(sheet.getRange(targetRow, result.sheet === 'Formations' ? 3 : 2));
    return { count: result.rows.length, software: SOFTWARE[result.code], kind: payload.kind, formationId: payload.kind === 'formation' ? result.rows[0][0] : payload.formationId, published: payload.published === true, notice: notice, repeated: result.exists };
  }
  function menu(book) {
    guard(book);
    var menu = SpreadsheetApp.getUi().createMenu('Tema Académie').addItem('Ajouter une formation', 'ajouterUneFormation').addItem('Ajouter une session', 'ajouterUneSession');
    if (typeof TemaRegistrationView !== 'undefined') menu.addSeparator().addItem('Consulter les inscriptions', 'consulterLesInscriptions').addItem('Actualiser le suivi', 'actualiserLeSuiviInscriptions');
    menu.addToUi();
  }
  function show(kind, selected) {
    var book = SpreadsheetApp.getActiveSpreadsheet(); guard(book);
    var boot = { kind: kind, selected: typeof selected === 'string' ? selected : '', softwares: options(book) };
    var json = JSON.stringify(boot).replace(/</g, '\\u003c');
    var html = HtmlService.createHtmlOutput(TEMA_ADMIN_DIALOG.replace('/*__TEMA_BOOT__*/null', json)).setWidth(740).setHeight(660);
    SpreadsheetApp.getUi().showModalDialog(html, kind === 'formation' ? 'Ajouter une formation' : 'Ajouter une session');
  }
  function install(book) {
    guard(book);
    if (typeof TemaCopy !== 'undefined') TemaCopy.assertAdministrativeLayout(book);
    var previous = book.getSheetByName('Accueil');
    if (previous) {
      if (previous.getRange('B2').getValue() !== 'Tema Académie' || previous.getImages().length !== 2 || !previous.getImages().every(function (image) { return ['Ajouter une formation', 'Ajouter une session'].indexOf(image.getAltTextTitle()) >= 0; })) throw new Error('L’onglet Accueil existe déjà : aucune modification effectuée.');
      homeLinks(book, previous); SpreadsheetApp.flush(); return;
    }
    var destinations = ['Formations', 'Disponibilités'].map(function (name) {
      var sheet = book.getSheetByName(name);
      if (!sheet) throw new Error('L’onglet ' + name + ' est introuvable.');
      return { name: name, id: sheet.getSheetId() };
    });
    var buttons = [{ key: 'formation', column: 2, fn: 'ajouterUneFormation', label: 'Ajouter une formation' }, { key: 'session', column: 4, fn: 'ajouterUneSession', label: 'Ajouter une session' }];
    buttons.forEach(function (button) { button.blob = Utilities.newBlob(Utilities.base64Decode(TEMA_ADMIN_BUTTONS[button.key]), 'image/png', button.key + '.png'); });
    var sheet = book.insertSheet('Accueil', 0);
    try {
    sheet.setHiddenGridlines(true).setTabColor('#FF008F');
    sheet.getRange('A1:F16').setBackground('#FAF9F7').setFontFamily('Arial').setFontColor('#20212B');
    sheet.setColumnWidth(1, 32); sheet.setColumnWidth(2, 380); sheet.setColumnWidth(3, 28); sheet.setColumnWidth(4, 380); sheet.setColumnWidth(5, 32);
    sheet.setRowHeights(1, 16, 30); sheet.setRowHeight(1, 20); sheet.setRowHeight(2, 56); sheet.setRowHeight(4, 82);
    sheet.getRange('B2:D2').merge().setValue('Tema Académie').setFontSize(28).setFontWeight('bold');
    sheet.getRange('B3:D3').merge().setValue('Gérez vos formations et programmez leurs prochaines dates.').setFontSize(13).setFontColor('#666A76');
    buttons.forEach(function (button) {
      sheet.insertImage(button.blob, button.column, 4).setWidth(360).setHeight(70).setAltTextTitle(button.label).setAltTextDescription(button.label).assignScript(button.fn);
    });
    sheet.getRange('B7').setValue('Votre catalogue').setFontSize(16).setFontWeight('bold');
    sheet.getRange('B8').setValue('Une fiche par formation, autant de sessions que nécessaire.').setFontSize(12);
    homeLinks(book, sheet);
    sheet.getRange('B12:D13').merge().setValue('Vous pouvez aussi modifier les lignes dans les onglets Formations et Disponibilités.').setWrap(true).setFontSize(12).setFontColor('#666A76');
    book.setActiveSheet(sheet); sheet.setActiveRange(sheet.getRange('B2'));
    SpreadsheetApp.flush();
    } catch (err) { book.deleteSheet(sheet); throw err; }
  }
  function homeLinks(book, sheet) {
    ['Formations', 'Disponibilités'].forEach(function (name, i) {
      var destination = book.getSheetByName(name);
      if (!destination) throw new Error('L’onglet ' + name + ' est introuvable.');
      var link = SpreadsheetApp.newRichTextValue().setText(name).setLinkUrl('https://docs.google.com/spreadsheets/d/' + book.getId() + '/edit#gid=' + destination.getSheetId()).build();
      sheet.getRange(10, i === 0 ? 2 : 4).setRichTextValue(link).setFontSize(13).setFontWeight('bold');
    });
  }
  return { guard: guard, options: options, prepare: prepare, create: create, literal: literal, menu: menu, show: show, install: install };
})();

function ajouterUneFormation() { TemaAdminActions.show('formation'); }
function ajouterUneSession(formationId) { TemaAdminActions.show('sessions', formationId); }
function enregistrerAjoutTema(payload) { return TemaAdminActions.create(SpreadsheetApp.getActiveSpreadsheet(), payload); }
function installerBoutonsCopie() { TemaAdminActions.install(SpreadsheetApp.getActiveSpreadsheet()); }
if (typeof module !== 'undefined') module.exports = TemaAdminActions;
