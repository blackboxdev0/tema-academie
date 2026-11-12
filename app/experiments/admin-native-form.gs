/** Essai de saisie native : copie privée uniquement, sans formulaire HTML. */
var TemaNativeForm = (function () {
  'use strict';
  var NAME = 'Nouvelle formation', MARK = 'TEMA_NATIVE_FORM_V2';
  var FIELDS = { software: 'B7', duration: 'F7', title: 'B11', price: 'B15', priceQualifier: 'F15', published: 'B55', description: 'B30', prerequisites: 'B35', content: 'B40', outcome: 'B47', trainers: 'B52' };
  var INPUTS = ['B7:D8', 'F7:H8', 'B11:H12', 'B15:D16', 'F15:H16', 'B55', 'B65', 'B30:H32', 'B35:H37', 'B40:H44', 'B47:H49', 'B52:H53'];
  var CODES = { Divalto: 'DIV', Dimo: 'DIMO', MoovApps: 'MOOV' };
  function guard(book) { TemaAdminActions.guard(book); }
  function recognized(sheet) { return sheet && sheet.getName() === NAME && ['TEMA_NATIVE_FORM_V1', MARK].indexOf(sheet.getRange('K1').getValue()) >= 0; }
  function value(rows, a1) {
    var m = /^([A-Z]+)(\d+)$/.exec(a1), col = m[1].charCodeAt(0) - 65;
    return rows[Number(m[2]) - 1][col];
  }
  function payload(rows, id) {
    var p = { kind: 'formation', requestId: id };
    Object.keys(FIELDS).forEach(function (k) { p[k] = value(rows, FIELDS[k]); });
    if (!Object.prototype.hasOwnProperty.call(CODES, p.software)) throw new Error('Choisissez Divalto, Dimo ou MoovApps.');
    p.software = CODES[p.software];
    ['duration', 'title', 'priceQualifier', 'description', 'prerequisites', 'content', 'outcome', 'trainers'].forEach(function (k) {
      p[k] = p[k] === '' ? '' : String(p[k]).trim();
    });
    if (!p.title || !/[a-z0-9]/i.test(p.title.normalize('NFKD'))) throw new Error('Renseignez le nom de la formation.');
    if (!p.duration) throw new Error('Renseignez la durée de la formation.');
    if (p.price !== '' && (typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price < 0 || Math.abs(p.price * 100 - Math.round(p.price * 100)) > 0.00001)) throw new Error('Renseignez un tarif positif avec deux décimales maximum, ou laissez le champ vide.');
    var limits = { title: 240, duration: 120, priceQualifier: 240, description: 5000, prerequisites: 5000, content: 20000, outcome: 5000, trainers: 500 };
    Object.keys(limits).forEach(function (k) { if (p[k].length > limits[k]) throw new Error('Le champ ' + k + ' est trop long.'); });
    p.published = p.published === true;
    return p;
  }
  function fingerprint(p) {
    return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(p), Utilities.Charset.UTF_8));
  }
  function status(sheet, message, error) {
    sheet.getRange('B61:H63').setValue(message).setBackground(error ? '#FFF0F2' : '#EEF5F3').setFontColor(error ? '#8E1830' : '#176C68');
  }
  function reset(sheet) {
    Object.keys(FIELDS).forEach(function (k) { sheet.getRange(FIELDS[k]).clearContent(); });
    sheet.getRange('B55').setValue(false); sheet.getRange('B65').setValue(false);
    sheet.getRange('K2:K9').setValues([[Utilities.getUuid()], ['DRAFT'], [''], [''], [''], [''], [''], ['']]);
    status(sheet, 'Complétez les champs, puis cliquez sur « Enregistrer la formation ».', false);
  }
  function edited(e) {
    if (!e || !e.source || !e.range || !e.triggerUid) return false;
    if (e.source.getId() !== TemaSheetPrototype.target) return false;
    var sheet = e.range.getSheet();
    if (sheet.getName() !== NAME) return false;
    if (e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1 || e.range.getA1Notation() !== 'B65' || String(e.value) !== 'TRUE') return false;
    return act(e.source, sheet, 'reset', e.range);
  }
  function submit(book) { return act(book, book.getActiveSheet(), 'save', null); }
  function act(book, sheet, action, range) {
    guard(book);
    if (!recognized(sheet) || sheet.getRange('K1').getValue() !== MARK) throw new Error('Actualisez le prototype de saisie avant d’utiliser cette commande.');
    var lock = LockService.getDocumentLock();
    if (!lock.tryLock(1000)) {
      status(sheet, 'Un enregistrement est déjà en cours. Attendez sa confirmation. ' + (range ? 'Décochez puis recochez « Vider le formulaire » pour réessayer.' : 'Cliquez à nouveau sur Enregistrer si nécessaire.'), true);
      return false;
    }
    var started = Date.now(), writing = false;
    try {
      if (range && range.getValue() !== true) return false;
      var meta = sheet.getRange('K2:K9').getValues().map(function (r) { return r[0]; });
      if (action === 'reset') {
        sheet.getRange('B65').setValue(false);
        if (meta[1] === 'UNCERTAIN' || meta[1] === 'SAVING') {
          status(sheet, 'Réessayez l’enregistrement de cette fiche avant de vider le formulaire.', true); return true;
        }
        reset(sheet); SpreadsheetApp.flush(); return true;
      }
      var rows = sheet.getRange('A1:H55').getValues(), p, hash;
      var retry = meta[1] === 'UNCERTAIN' || meta[1] === 'SAVING';
      if (retry) {
        p = JSON.parse(meta[7]); hash = fingerprint(p);
        if (hash !== meta[2] || p.requestId !== meta[0]) throw new Error('Le contenu de l’envoi précédent ne peut pas être vérifié. Conservez cette fiche et contactez l’administrateur.');
      } else {
        var formulas = sheet.getRange('A1:H55').getFormulas();
        Object.keys(FIELDS).forEach(function (k) { if (value(formulas, FIELDS[k])) throw new Error('Saisissez du texte ou une valeur, sans formule dans les champs.'); });
        p = payload(rows, meta[0]); hash = fingerprint(p);
      }
      if (meta[1] === 'SAVED') {
        if (meta[2] !== hash) throw new Error('La fiche précédente est enregistrée. Videz le formulaire avant de saisir une nouvelle formation.');
        status(sheet, 'Cette formation est déjà enregistrée. Aucun doublon créé.', false); return true;
      }
      sheet.getRange('K3:K4').setValues([['SAVING'], [hash]]);
      sheet.getRange('K9').setValue(JSON.stringify(p));
      status(sheet, 'Enregistrement… Gardez les champs inchangés jusqu’à confirmation.', false);
      SpreadsheetApp.flush();
      writing = true;
      var result = TemaAdminActions.create(book, p);
      sheet.getRange('K3:K8').setValues([['SAVED'], [hash], [result.formationId], [started], [Date.now()], [Date.now() - started]]);
      writing = false;
      var editedWhileSaving = true;
      try { editedWhileSaving = fingerprint(payload(sheet.getRange('A1:H55').getValues(), meta[0])) !== hash; } catch (ignored) {}
      status(sheet, 'Formation ajoutée dans ' + result.software + (result.published ? ' et publiée.' : ', en brouillon.') + (editedWhileSaving ? ' Des champs ont changé pendant l’envoi. La fiche ajoutée correspond à la saisie au début de l’enregistrement.' : '') + (result.notice ? ' ' + result.notice : ''), false);
      book.setActiveSheet(sheet);
      return true;
    } catch (err) {
      if (writing) sheet.getRange('K3').setValue('UNCERTAIN');
      status(sheet, String(err.message || err) + (writing ? ' L’envoi initial est conservé. Cliquez sur Enregistrer pour reprendre ce même envoi.' : ''), true);
      return true;
    } finally {
      try { if (range) sheet.getRange('B65').setValue(false); SpreadsheetApp.flush(); }
      finally { lock.releaseLock(); }
    }
  }
  function protect(sheet) {
    var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    var protection = protections.filter(function (p) { return p.getDescription() === 'Prototype : présentation et état de la saisie'; })[0] || sheet.protect().setDescription('Prototype : présentation et état de la saisie');
    protection.setUnprotectedRanges(INPUTS.map(function (r) { return sheet.getRange(r); }));
    protection.addEditor(Session.getEffectiveUser());
    protection.removeEditors(protection.getEditors());
    if (protection.canDomainEdit()) protection.setDomainEdit(false);
  }
  function compact(sheet) {
    sheet.setRowHeights(1, 70, 18); sheet.setRowHeight(2, 36); sheet.setRowHeight(3, 24);
    sheet.setRowHeight(55, 28); sheet.setRowHeight(57, 60); sheet.setRowHeights(61, 3, 22); sheet.setRowHeight(65, 28);
    sheet.setRowHeights(58, 3, 6);
  }
  function footer(sheet) {
    if (typeof TEMA_NATIVE_SAVE_BUTTON !== 'string' || !TEMA_NATIVE_SAVE_BUTTON) throw new Error('Le visuel du bouton est manquant. Aucune saisie modifiée.');
    var old = sheet.getRange('K1').getValue() === 'TEMA_NATIVE_FORM_V1';
    var published = sheet.getRange(old ? 'B18' : 'B55').getValue() === true;
    var message = sheet.getRange(old ? 'B22' : 'B61').getValue();
    var wasError = sheet.getRange(old ? 'B22' : 'B61').getBackground() === '#fff0f2';
    var images = sheet.getImages().filter(function (image) { return image.getAltTextTitle() === 'Enregistrer la formation'; });
    if (images.length > 1 || (images[0] && images[0].getScript() && images[0].getScript() !== 'enregistrerSaisieNativeTema')) throw new Error('Le bouton existant ne correspond pas au prototype. Aucune saisie modifiée.');
    var image = images[0] || sheet.insertImage(Utilities.newBlob(Utilities.base64Decode(TEMA_NATIVE_SAVE_BUTTON), 'image/png', 'enregistrer.png'), 2, 57);
    image.setAltTextTitle('Enregistrer la formation').setAltTextDescription('Enregistrer les champs et le contenu de cette formation').setWidth(565).setHeight(52).setAnchorCell(sheet.getRange('B57')).assignScript('enregistrerSaisieNativeTema');
    // Copier avant de retirer l’ancien emplacement permet une reprise sans perte.
    sheet.getRange('B55').setValue(published);
    sheet.getRange('B61').setValue(message || 'Complétez les champs, puis cliquez sur « Enregistrer la formation ».');
    sheet.getRange('K1').setValue(MARK);
    sheet.getRange('B18:H27').breakApart().clearContent().clearDataValidations().setBackground('#FAF9F7');
    sheet.hideRows(18, 10);
    sheet.getRange('B55').insertCheckboxes().setValue(published);
    sheet.getRange('C55:H55').merge().setValue('Publier cette formation sur le site').setFontSize(12);
    sheet.getRange('B61:H63').merge().setWrap(true).setFontSize(12);
    if (!message || message === 'Complétez les champs, puis cochez « Enregistrer la formation ».') message = 'Complétez les champs, puis cliquez sur « Enregistrer la formation ».';
    status(sheet, message, wasError || sheet.getRange('K3').getValue() === 'UNCERTAIN');
    sheet.getRange('B65').insertCheckboxes().setValue(false);
    sheet.getRange('C65:H65').merge().setValue('Vider le formulaire').setFontSize(12).setFontColor('#666A76');
    sheet.getRange('B67:H69').merge().setValue('Cette action efface uniquement les champs de saisie. Les formations déjà enregistrées restent dans le catalogue.').setWrap(true).setFontSize(11).setFontColor('#666A76');
  }
  function install(book) {
    guard(book);
    var existing = book.getSheetByName(NAME);
    if (existing) {
      if (!recognized(existing)) throw new Error('Un onglet du même nom existe déjà : aucune modification.');
      var lock = LockService.getDocumentLock();
      if (!lock.tryLock(1000)) throw new Error('Une sauvegarde est en cours. Réessayez la mise en page après sa confirmation.');
      try { footer(existing); compact(existing); protect(existing); SpreadsheetApp.flush(); return existing.getSheetId(); }
      finally { lock.releaseLock(); }
    }
    var sheet = book.insertSheet(NAME, 1);
    try {
    sheet.setHiddenGridlines(true).setTabColor('#FF008F').setFrozenRows(3);
    sheet.getRange('A1:L70').setBackground('#FAF9F7').setFontFamily('Arial').setFontColor('#20212B').setFontSize(12).setVerticalAlignment('middle');
    sheet.setColumnWidth(1, 30); sheet.setColumnWidths(2, 7, 90); sheet.setColumnWidth(5, 25); sheet.setColumnWidth(9, 30);
    compact(sheet);
    function label(a1, text, size, color) { sheet.getRange(a1).merge().setValue(text).setFontSize(size || 12).setFontWeight('bold').setFontColor(color || '#20212B'); }
    label('B2:H2', 'Une nouvelle formation', 25);
    sheet.getRange('B3:H3').merge().setValue('Une personne à la fois dans cet espace de saisie partagé.').setFontSize(11).setFontColor('#666A76');
    label('B5:H5', '01 / L’ESSENTIEL', 10, '#B90068');
    label('B6:D6', 'Logiciel'); label('F6:H6', 'Durée'); label('B10:H10', 'Nom de la formation');
    label('B14:D14', 'Tarif par participant ($ CAD)'); label('F14:H14', 'Précision sur le tarif');
    INPUTS.filter(function (r) { return r.indexOf(':') > 0; }).forEach(function (r) {
      sheet.getRange(r).merge().setBackground('#FFFFFF').setWrap(true).setFontSize(13).setBorder(true, true, true, true, false, false, '#DADBE0', SpreadsheetApp.BorderStyle.SOLID);
    });
    sheet.getRange('B7').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(Object.keys(CODES), true).setAllowInvalid(false).build());
    sheet.getRange('B15').setNumberFormat('#,##0.00');
    label('B28:H28', '02 / CONTENU DE LA FICHE (FACULTATIF)', 10, '#B90068');
    label('B29:H29', 'Présentation'); label('B34:H34', 'Prérequis'); label('B39:H39', 'Programme'); label('B46:H46', 'Résultats attendus'); label('B51:H51', 'Formateurs');
    sheet.getRange('K1').setValue(MARK);
    reset(sheet);
    footer(sheet);
    protect(sheet);
    sheet.hideColumns(10, 3);
    book.setActiveSheet(sheet); sheet.setActiveRange(sheet.getRange('B7'));
    SpreadsheetApp.flush();
    return sheet.getSheetId();
    } catch (err) { book.deleteSheet(sheet); throw err; }
  }
  return { name: NAME, fields: FIELDS, payload: payload, install: install, edited: edited, submit: submit };
})();

function installerSaisieNativeTema() { return TemaNativeForm.install(SpreadsheetApp.getActiveSpreadsheet()); }
function traiterSaisieFormationTema(e) { return TemaNativeForm.edited(e); }
function enregistrerSaisieNativeTema() { return TemaNativeForm.submit(SpreadsheetApp.getActiveSpreadsheet()); }
if (typeof module !== 'undefined') module.exports = TemaNativeForm;
