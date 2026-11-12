/** Private COPY controller. Confirmation never holds a lock; admissions share ScriptLock. */
var TemaRegistrationActions = (function () {
  'use strict';
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function metadata(range) { try { return JSON.parse(range.getSheet().getRange(range.getRow(), 7).getValue()); } catch (_) { return null; } }
  function fingerprint(record) { return JSON.stringify(TemaRegistrationView.identityKeys.map(function (key) { return record.get(key); })); }
  function stale() { throw new Error('Cette demande est périmée ou ne correspond plus à une inscription unique. Actualisez le suivi puis réessayez.'); }
  function source(book, id) {
    var sources = TemaRegistrationView.readSources(book), table = sources.registrations, headers = table[0];
    if (!id || !headers || headers.length !== TemaRegistrationView.headers.length || TemaRegistrationView.headers.some(function (h) { return headers.indexOf(h) < 0; })) stale();
    var column = headers.indexOf('id_inscription'), found = [];
    table.slice(1).forEach(function (row, i) { if (String(row[column]).trim() === id) found.push({ row: i + 2, values: row }); });
    if (found.length !== 1) stale();
    var result = found[0]; result.headers = headers; result.sources = sources;
    result.status = result.values[headers.indexOf('statut')];
    if (['confirmee', 'annulee'].indexOf(result.status) < 0) stale();
    result.get = function (key) { return result.values[headers.indexOf(key)]; };
    return result;
  }
  function current(sheet, range, meta) {
    if (!meta || !meta.id || meta.status !== 'Confirmée' || meta.generation !== sheet.getRange('G2').getValue() || !same(meta.selection, TemaRegistrationView.selection(sheet)) || !same(meta, metadata(range))) stale();
    var expected = meta.values.map(function (v) { return typeof v === 'string' && v.charAt(0) === "'" ? v.slice(1) : v; });
    expected[3] = 'Annulée';
    if (!same(expected, sheet.getRange(range.getRow(), 2, 1, 5).getValues()[0])) stale();
  }
  function edited(event) {
    var range = event.range, sheet = range.getSheet();
    if (range.getLastRow() < 15 || range.getLastColumn() < 2 || range.getColumn() > 6) return false;
    var book = event.source, committed = false, countersPending = false, message = '', failure = null;
    try {
      TemaCopy.guard(book);
      if (!TemaCopy.isOwner()) throw new Error('Seul le propriétaire du classeur peut annuler une inscription.');
      if (range.getRow() !== range.getLastRow() || range.getColumn() !== range.getLastColumn() || range.getColumn() !== 5 || event.value !== 'Annulée' || event.oldValue !== 'Confirmée') throw new Error('Choisissez Annulée dans une seule cellule Statut confirmée. Pour réserver de nouveau, utilisez le site.');
      var meta = metadata(range); current(sheet, range, meta);
      var before = source(book, meta.id);
      if (before.status === 'annulee') { message = 'Cette inscription est déjà annulée. Aucune place supplémentaire libérée.'; }
      else {
        if (fingerprint(before) !== meta.fingerprint) stale();
        var ui = SpreadsheetApp.getUi(), title;
        try { title = JSON.parse(before.get('formation_snapshot')).titre; } catch (_) { title = ''; }
        var prompt = 'Annuler l’inscription de ' + before.get('prenom') + ' ' + before.get('nom') + '\n' + before.get('courriel') + '\n' + (title || 'Formation à vérifier') + '\n' + TemaRegistrationView.dateLabel(before.get('debut_snapshot')) + '\n\nL’inscription sera annulée et les places disponibles seront recalculées. Confirmer ?';
        // ui.alert suspends the server execution and discards locks: acquire only after response.
        var answer = ui.alert('Annuler une inscription', prompt, ui.ButtonSet.YES_NO);
        if (answer === ui.Button.YES) {
          TemaCopy.lock(function () {
            current(sheet, range, meta);
            var latest = source(book, meta.id);
            if (latest.status === 'annulee') { message = 'Cette inscription est déjà annulée. Aucune place supplémentaire libérée.'; return; }
            if (fingerprint(latest) !== meta.fingerprint || fingerprint(before) !== fingerprint(latest)) stale();
            TemaCopy.dirty();
            var writeError = null;
            try {
              book.getSheetByName('Inscriptions').getRange(latest.row, latest.headers.indexOf('statut') + 1).setValue('annulee');
              SpreadsheetApp.flush();
            } catch (error) { writeError = error; }
            // A write/flush can fail after recording. Resolve the durable fact by stable ID.
            var recorded;
            try { recorded = source(book, meta.id).status === 'annulee'; } catch (_) { throw new Error('Résultat de l’écriture incertain. Vérifiez la source et actualisez le suivi avant toute reprise.'); }
            if (!recorded) throw writeError || new Error('L’annulation n’a pas été enregistrée. Réessayez après actualisation.');
            committed = true;
            try { TemaCopy.nativeCounters(book, latest.get('id_cohorte')); } catch (_) { countersPending = true; }
          });
        } else message = 'Annulation abandonnée : réservation conservée.';
      }
    } catch (error) { failure = error; }
    // Never hold ScriptLock while refresh acquires UserLock then ScriptLock in acknowledge.
    var refreshed = false;
    try { refreshed = TemaRegistrationView.refresh(book, false); } catch (_) { /* Report recording independently from projection. */ }
    if (committed) message = 'Annulation enregistrée.' + (countersPending || !refreshed ? ' Actualisation des places et du suivi à reprendre depuis le menu.' : ' Places disponibles recalculées et suivi actualisé.');
    else if (failure) message = failure.message;
    if (!refreshed && !committed) message += ' Le statut saisi dans la vue ne prouve aucune annulation ; utilisez Actualiser le suivi.';
    book.toast(message, 'Suivi des inscriptions', 10);
    return true;
  }
  return { edited: edited };
})();
if (typeof module !== 'undefined') module.exports = TemaRegistrationActions;
