/** Consultation dérivée, réservée à la copie privée ; actions déléguées au contrôleur privé. */
var TemaRegistrationView = (function () {
  'use strict';
  var TARGET = '10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8';
  var NAME = 'Suivi des inscriptions', MARKER = 'TEMA_REGISTRATION_VIEW_V1';
  var SOFTWARE = { DIV: { label: 'Divalto', color: '#FF008F' }, DIMO: { label: 'Dimo', color: '#365AA7' }, MOOV: { label: 'MoovApps', color: '#176C68' } };
  var PERIODS = ['À venir', 'Toutes les sessions', 'Passées'];
  var STATUSES = ['Tous les statuts', 'Confirmées', 'Annulées', 'À vérifier'];
  var ALL_SOFTWARE = 'Tous les logiciels', ALL_FORMATIONS = 'Toutes les formations';
  var HEADERS = ['id_inscription', 'request_id', 'payload_fingerprint', 'horodatage', 'id_cohorte', 'session_revision', 'statut', 'prenom', 'nom', 'entreprise', 'courriel', 'telephone', 'consentement_loi25', 'consentement_horodatage', 'politique_version', 'formation_snapshot', 'debut_snapshot', 'fin_snapshot', 'lieu_snapshot', 'mail_participant_etat', 'mail_tema_etat', 'mail_participant_attempt_id', 'mail_participant_attempt_at', 'mail_participant_sent_at', 'mail_participant_error_code', 'mail_tema_attempt_id', 'mail_tema_attempt_at', 'mail_tema_sent_at', 'mail_tema_error_code'];
  var IDENTITY_KEYS = ['id_inscription', 'request_id', 'payload_fingerprint', 'id_cohorte', 'prenom', 'nom', 'entreprise', 'courriel', 'formation_snapshot', 'debut_snapshot', 'fin_snapshot', 'lieu_snapshot'];
  var MAIL = { PENDING: 'En attente', SENDING: 'En cours d’envoi', SENT: 'Envoyé', FAILED: 'Échec d’envoi', UNKNOWN: 'Envoi incertain, à vérifier', BLOCKED: 'Envoi bloqué', SUPPRESSED: 'Envoi désactivé' };
  function text(v) { return String(v === undefined || v === null ? '' : v).trim(); }
  function ref(v) { return text(v).split(' — ')[0]; }
  function inert(v) { return typeof v === 'string' && /^\s*[=+@-]/.test(v) ? "'" + v : v; }
  function folded(v) { return text(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function own(map, key) { return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null; }
  function object(v) { try { var x = JSON.parse(v); return x && typeof x === 'object' && !Array.isArray(x) ? x : null; } catch (_) { return null; } }
  function instant(v) {
    if (Object.prototype.toString.call(v) === '[object Date]') return Number.isFinite(v.getTime()) ? v.getTime() : null;
    if (typeof v !== 'string' || !/^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(v)) return null;
    var day = Date.parse(v.slice(0, 10) + 'T00:00:00Z');
    if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== v.slice(0, 10)) return null;
    var ms = Date.parse(v); return Number.isFinite(ms) ? ms : null;
  }
  function currentTime(row, deps) {
    var date = deps.cellText(row[2], 'date'), start = deps.cellText(row[3], 'time'), end = deps.cellText(row[4], 'time');
    var a = TemaSheetPrototype.localUtc(date, start, deps.formatLocal), b = TemaSheetPrototype.localUtc(date, end, deps.formatLocal);
    return { start: a, end: b, valid: a !== null && b !== null && b > a };
  }
  function registrations(rows) {
    if (!Array.isArray(rows) || !rows.length || rows[0].length !== HEADERS.length || HEADERS.some(function (key) { return rows[0].indexOf(key) < 0; })) throw new Error('Structure Inscriptions inconnue : les 29 colonnes attendues doivent être conservées.');
    var columns = HEADERS.map(function (key) { return rows[0].indexOf(key); });
    var seen = Object.create(null);
    return rows.slice(1).filter(function (r) { return r.some(function (v) { return text(v) !== ''; }); }).map(function (r) {
      var item = {}; HEADERS.forEach(function (key, i) { item[key] = r[columns[i]]; });
      var id = text(item.id_inscription);
      if (id && seen[id]) throw new Error('Identifiant d’inscription dupliqué : compteurs indisponibles, vérifiez la table source.');
      if (id) seen[id] = true;
      return item;
    });
  }
  function stamp(ms, deps) {
    if (ms === null) return 'Date à vérifier';
    var local = deps.formatLocal(ms), months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return Number(local.slice(8, 10)) + ' ' + months[Number(local.slice(5, 7)) - 1] + ' ' + local.slice(0, 4) + ' à ' + local.slice(11);
  }
  function formatSession(group, deps) {
    var when = stamp(group.start, deps);
    if (group.end !== null) when += '–' + deps.formatLocal(group.end).slice(11);
    return when + ' · ' + (own({ en_ligne: 'En ligne', presentiel: 'Présentiel' }, group.mode) || 'Format à vérifier') + (group.venue ? ' · ' + group.venue : '');
  }
  function project(sources, selection, deps) {
    var f = Object.create(null), groups = [], byId = Object.create(null), notes = [], counts = Object.create(null);
    var people = registrations(sources.registrations);
    TemaSheetPrototype.records(sources.formations, 2).forEach(function (item) {
      var id = text(item.values[0]); if (!id) return;
      if (f[id]) throw new Error('Identifiant de formation dupliqué : vue indisponible, vérifiez les sources.');
      f[id] = { id: id, title: text(item.values[2]), software: item.section.code, values: item.values };
    });
    people.forEach(function (p, index) {
      var id = text(p.id_cohorte) || '@row:' + index;
      if (!counts[id]) counts[id] = { confirmed: 0, cancelled: 0, unknown: 0 };
      counts[id][p.statut === 'confirmee' ? 'confirmed' : p.statut === 'annulee' ? 'cancelled' : 'unknown']++;
    });
    TemaSheetPrototype.records(sources.sessions, 1).forEach(function (item) {
      var row = item.values, id = text(row[0]), fid = ref(row[1]), formation = f[fid], time = currentTime(row, deps);
      if (id && byId[id]) throw new Error('Identifiant de session dupliqué : compteurs indisponibles, vérifiez les sources.');
      var group = { key: id || 'draft:' + item.row, cohort: id, formationId: fid, title: formation && formation.title || text(row[1]).split(' — ').slice(1).join(' — ') || 'Formation historique à vérifier', software: formation && formation.software || item.section.code, start: time.valid ? time.start : null, end: time.valid ? time.end : null, capacity: typeof row[5] === 'number' && Number.isSafeInteger(row[5]) && row[5] > 0 ? row[5] : null, mode: text(row[6]), venue: text(row[7]), current: row, formation: formation, people: [], historical: !formation, warning: !formation ? 'Formation absente : les instantanés des inscriptions sont conservés.' : !time.valid ? 'Date ou horaires actuels à vérifier.' : '' };
      groups.push(group); if (id) byId[id] = group;
    });
    people.forEach(function (p, index) {
      var id = text(p.id_cohorte), snapshot = object(p.formation_snapshot), place = object(p.lieu_snapshot), start = instant(p.debut_snapshot), end = instant(p.fin_snapshot), group = byId[id];
      if (!group) {
        var fid = snapshot && text(snapshot.id), software = snapshot && text(snapshot.logiciel_id);
        group = { key: id || 'orphan:' + index, cohort: id, countKey: id || '@row:' + index, formationId: fid || 'historical:' + (id || index), title: snapshot && text(snapshot.titre) || 'Formation historique à vérifier', software: own(SOFTWARE, software) ? software : 'HISTORY', start: start, end: end, capacity: null, mode: place && text(place.mode), venue: place && text(place.adresse_presentiel || place.lien_visio), people: [], historical: true, warning: 'Session absente : identité et date issues de l’inscription historique.' };
        groups.push(group); if (id) byId[id] = group;
      }
      if (!group.formation && snapshot) {
        group.title = text(snapshot.titre) || group.title;
        group.formationId = text(snapshot.id) || group.formationId;
        if (own(SOFTWARE, text(snapshot.logiciel_id))) group.software = text(snapshot.logiciel_id);
      }
      var differences = [];
      var validFormation = snapshot && typeof snapshot.id === 'string' && text(snapshot.id) && typeof snapshot.logiciel_id === 'string' && own(SOFTWARE, snapshot.logiciel_id) && typeof snapshot.titre === 'string' && text(snapshot.titre) && typeof snapshot.duree === 'string' && text(snapshot.duree) && (snapshot.prix === null || typeof snapshot.prix === 'number' && Number.isFinite(snapshot.prix) && snapshot.prix >= 0) && typeof snapshot.prix_qualificatif === 'string';
      var validPlace = place && ['en_ligne', 'presentiel'].indexOf(place.mode) >= 0 && (place.mode === 'presentiel' ? typeof place.adresse_presentiel === 'string' && text(place.adresse_presentiel) : place.lien_visio === null || typeof place.lien_visio === 'string');
      if (!validFormation || start === null || end === null || end <= start || !validPlace) differences.push('Instantané incomplet ou invalide : données historiques à vérifier.');
      if (!text(p.id_inscription)) differences.push('Identifiant d’inscription absent : vérifier la ligne source.');
      if (group.historical) differences.push('Inscription historique : ' + (snapshot && text(snapshot.titre) || 'Titre à vérifier') + ' · ' + stamp(start, deps) + (end === null ? '' : '–' + deps.formatLocal(end).slice(11)) + ' · ' + (place && text(place.adresse_presentiel || place.lien_visio || place.mode) || 'Lieu à vérifier') + '.');
      if (group.current) {
        var sf = group.formation && group.formation.values;
        var changed = snapshot && (text(snapshot.id) !== group.formationId || text(snapshot.titre) !== group.title || sf && (text(snapshot.duree) !== text(sf[7]) || snapshot.prix !== (sf[8] === '' ? null : sf[8]) || text(snapshot.prix_qualificatif) !== text(sf[9]))) || start !== group.start || end !== group.end || place && (text(place.mode) !== group.mode || text(place.adresse_presentiel || place.lien_visio) !== group.venue);
        if (changed) differences.push('Conditions modifiées depuis l’inscription. Historique : ' + (snapshot && text(snapshot.titre) || 'Titre à vérifier') + ' · ' + stamp(start, deps) + (end === null ? '' : '–' + deps.formatLocal(end).slice(11)) + ' · ' + (place && text(place.adresse_presentiel || place.lien_visio || place.mode) || 'Lieu à vérifier') + '.');
      }
      var status = p.statut === 'confirmee' ? 'Confirmée' : p.statut === 'annulee' ? 'Annulée' : 'À vérifier';
      group.people.push({ id: text(p.id_inscription), fingerprint: JSON.stringify(IDENTITY_KEYS.map(function (key) { return p[key]; })), name: (text(p.prenom) + ' ' + text(p.nom)).trim() || 'Nom à vérifier', company: text(p.entreprise), email: text(p.courriel), status: status, statusFilter: p.statut === 'confirmee' ? 'Confirmées' : p.statut === 'annulee' ? 'Annulées' : 'À vérifier', confirmation: 'Participant : ' + (own(MAIL, text(p.mail_participant_etat)) || 'À vérifier') + '\nTema : ' + (own(MAIL, text(p.mail_tema_etat)) || 'À vérifier'), note: differences.join('\n') });
    });
    groups.forEach(function (g) {
      var c = counts[g.countKey || g.cohort] || { confirmed: 0, cancelled: 0, unknown: 0 };
      g.confirmed = c.confirmed; g.cancelled = c.cancelled; g.unknown = c.unknown;
      g.remaining = g.capacity === null ? null : Math.max(0, g.capacity - c.confirmed);
      g.over = g.capacity !== null && c.confirmed > g.capacity;
      g.description = formatSession(g, deps);
    });
    var selected = Array.isArray(selection) ? selection.map(text) : [], reset = [];
    function valid(i, values, fallback, label) { if (values.indexOf(selected[i]) < 0) { if (selected[i]) reset.push(label + ' réinitialisé : choix absent.'); selected[i] = fallback; } }
    valid(0, PERIODS, PERIODS[0], 'Période');
    var softwareOptions = [ALL_SOFTWARE].concat(['DIV', 'DIMO', 'MOOV', 'HISTORY'].filter(function (code) { return groups.some(function (g) { return g.software === code; }); }).map(function (code) { return SOFTWARE[code] ? SOFTWARE[code].label : 'Historique à vérifier'; }));
    valid(1, softwareOptions, ALL_SOFTWARE, 'Logiciel');
    var candidates = groups.filter(function (g) { return selected[1] === ALL_SOFTWARE || (SOFTWARE[g.software] ? SOFTWARE[g.software].label : 'Historique à vérifier') === selected[1]; });
    var formations = Object.create(null);
    candidates.forEach(function (g) {
      var key = g.formationId || g.key;
      if (!formations[key]) formations[key] = { key: key, label: g.title + ' · ' + (SOFTWARE[g.software] ? SOFTWARE[g.software].label : 'Historique') };
    });
    var choices = Object.keys(formations).map(function (key) { return formations[key]; });
    var labels = Object.create(null); choices.forEach(function (choice) { labels[choice.label] = (labels[choice.label] || 0) + 1; });
    choices.forEach(function (choice) { if (labels[choice.label] > 1) choice.label += ' [' + choice.key + ']'; });
    var formationOptions = [ALL_FORMATIONS].concat(choices.map(function (x) { return x.label; }).sort());
    valid(2, formationOptions, ALL_FORMATIONS, 'Formation'); valid(3, STATUSES, STATUSES[0], 'Statut'); selected[4] = text(selected[4]);
    var fid = choices.filter(function (x) { return x.label === selected[2]; })[0], now = deps.now(), search = folded(selected[4]);
    var visible = candidates.filter(function (g) {
      return (!fid || (g.formationId || g.key) === fid.key) && (selected[0] === PERIODS[1] || g.start !== null && (selected[0] === PERIODS[0] ? g.start > now : g.start <= now));
    });
    var totals = { sessions: visible.length, confirmed: 0, cancelled: 0, unknown: 0, remaining: 0, unknownCapacity: 0, participants: 0 };
    visible.forEach(function (g) {
      totals.confirmed += g.confirmed; totals.cancelled += g.cancelled; totals.unknown += g.unknown;
      if (g.remaining === null) totals.unknownCapacity++; else totals.remaining += g.remaining;
      g.visiblePeople = g.people.filter(function (p) { return (selected[3] === STATUSES[0] || p.statusFilter === selected[3]) && (!search || folded([p.name, p.company, p.email, g.title, g.description].join(' ')).indexOf(search) >= 0); });
      totals.participants += g.visiblePeople.length;
      g.visiblePeople.sort(function (a, b) { return a.name.localeCompare(b.name, 'fr'); });
    });
    var order = { DIV: 0, DIMO: 1, MOOV: 2, HISTORY: 3 };
    visible.sort(function (a, b) { return order[a.software] - order[b.software] || a.title.localeCompare(b.title, 'fr') || a.formationId.localeCompare(b.formationId) || (a.start === null ? Infinity : a.start) - (b.start === null ? Infinity : b.start) || a.key.localeCompare(b.key); });
    var undated = groups.reduce(function (n, g) { return n + (g.start === null ? g.people.length : 0); }, 0);
    if (undated && selected[0] !== PERIODS[1]) notes.push(undated + ' inscription(s) sans date vérifiable : choisir Toutes les sessions.');
    return { groups: visible, selection: selected, options: [PERIODS, softwareOptions, formationOptions, STATUSES], totals: totals, notices: reset.concat(notes), sourceRegistrations: people.length };
  }
  function rows(model) {
    var output = [], styles = [], groups = [], identities = [], previous = '';
    function push(kind, values, color) { styles.push({ kind: kind, row: output.length + 15, color: color }); output.push(values.concat(['', '', '', '', '']).slice(0, 5)); }
    model.groups.forEach(function (g) {
      var key = g.software + ':' + g.formationId + ':' + g.title;
      if (key !== previous) { push('formation', [(SOFTWARE[g.software] ? SOFTWARE[g.software].label : 'Historique') + ' · ' + g.title + (g.historical ? ' · Historique' : '')], SOFTWARE[g.software] ? SOFTWARE[g.software].color : '#555B67'); previous = key; }
      var capacity = g.capacity === null ? 'capacité non renseignée' : g.remaining + ' place(s) restante(s) / ' + g.capacity;
      push(g.over ? 'alert' : 'session', [g.description + '\n' + g.confirmed + ' confirmée(s) · ' + g.cancelled + ' annulée(s) · ' + capacity + (g.unknown ? ' · ' + g.unknown + ' statut(s) à vérifier' : '') + (g.over ? ' · DÉPASSEMENT DE CAPACITÉ' : '')]);
      if (g.warning) push('note', [g.warning]);
      push('header', ['Participant', 'Entreprise', 'Courriel', 'Statut', 'Confirmation par courriel']);
      var first = output.length + 15;
      if (!g.visiblePeople.length) push('empty', [g.people.length ? 'Aucun participant ne correspond aux filtres (' + g.people.length + ' inscription(s) dans cette session).' : 'Aucune inscription pour cette session.']);
      g.visiblePeople.forEach(function (p) { identities.push({ row: output.length + 15, id: p.id, status: p.status, fingerprint: p.fingerprint }); push('person', [p.name, p.company, p.email, p.status, p.confirmation]); if (p.note) push('note', [p.note]); });
      groups.push({ first: first, count: output.length + 15 - first });
      push('space', ['']);
    });
    if (!output.length) push('empty', ['Aucune session pour cette sélection.']);
    return { values: output.map(function (r) { return r.map(inert); }), styles: styles, groups: groups, identities: identities };
  }
  function guard(book) { if (!book || book.getId() !== TARGET) throw new Error('Cette vue est réservée à la copie d’essai.'); if (typeof TemaCopy !== 'undefined') TemaCopy.guard(book); }
  function recognized(sheet) { return sheet && sheet.getRange('B2').getNote() === MARKER; }
  function read(book, name, width) {
    var sheet = book.getSheetByName(name); if (!sheet) throw new Error('L’onglet ' + name + ' est introuvable.');
    return sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), width || sheet.getLastColumn()).getValues();
  }
  function dependencies() {
    return { now: function () { return Date.now(); }, formatLocal: function (ms) { return Utilities.formatDate(new Date(ms), 'America/Toronto', "yyyy-MM-dd'T'HH:mm"); }, cellText: function (v, kind) { return Object.prototype.toString.call(v) === '[object Date]' ? Utilities.formatDate(v, 'America/Toronto', kind === 'date' ? 'yyyy-MM-dd' : 'HH:mm') : text(v); } };
  }
  function selection(sheet) { var picked = sheet.getRange('B10:F10').getValues()[0].map(text); picked[4] = ''; return picked; }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function refreshState(sources, d) {
    var now = d.now(), next = Number.MAX_SAFE_INTEGER;
    TemaSheetPrototype.records(sources.sessions, 1).forEach(function (r) { var t = currentTime(r.values, d); if (t.valid && t.start > now) next = Math.min(next, t.start); });
    return { sourceHash: TemaCopy.sourceHash(sources), nextChangeAt: next };
  }
  function ensureRows(sheet, needed) { if (needed > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), needed - sheet.getMaxRows()); }
  function clearBody(sheet) {
    // Old participant rules can survive clear() and failed renders past the last value.
    sheet.getRange(15, 2, sheet.getMaxRows() - 14, 5).clearDataValidations();
    var count = Math.max(sheet.getLastRow(), 15) - 14;
    var area = sheet.getRange(15, 2, count, 5);
    area.shiftRowGroupDepth(-8); area.breakApart(); area.clear();
    sheet.getRange(15, 7, count, 1).clearContent();
  }
  function readSources(book) { if (typeof TemaCopy !== 'undefined') return TemaCopy.assertAdministrativeLayout(book); return { formations: read(book, 'Formations', 13), sessions: read(book, 'Disponibilités', 12), registrations: read(book, 'Inscriptions') }; }
  function pending(sheet) {
    sheet.getRange('G2').clearContent();
    sheet.getRange('B6:F6').clearContent();
    sheet.getRange('B12').setValue('Actualisation en cours : groupes et compteurs indisponibles jusqu’à vérification des sources et des filtres courants.').setBackground('#FFF8E8').setFontColor('#654A19');
    sheet.hideRows(15, sheet.getMaxRows() - 14);
    clearBody(sheet);
  }
  function setup(sheet) {
    ensureRows(sheet, 20);
    if (sheet.getMaxColumns() < 7) sheet.insertColumnsAfter(sheet.getMaxColumns(), 7 - sheet.getMaxColumns());
    sheet.setHiddenGridlines(true).setTabColor('#FF008F').setFrozenRows(12);
    sheet.getRange('A1:G14').setBackground('#FAF9F7').setFontFamily('Arial').setFontColor('#20212B').setFontSize(11).setVerticalAlignment('middle');
    [30, 245, 190, 285, 135, 245, 30].forEach(function (width, i) { sheet.setColumnWidth(i + 1, width); });
    // En-tête de 280 px, dont 264 px gelés : les lignes sans contenu restent de simples marges.
    sheet.setRowHeights(1, 14, 8);
    [[2, 42], [3, 24], [5, 22], [6, 34], [9, 22], [10, 40], [12, 40]].forEach(function (entry) { sheet.setRowHeight(entry[0], entry[1]); });
    sheet.getRange('B2:F2').merge().setValue('Suivi des inscriptions').setNote(MARKER).setFontSize(26).setFontWeight('bold').setWrap(true);
    sheet.getRange('B3:F3').merge().setValue('Consultation par formation et session · données privées · heures de Montréal').setFontSize(12).setWrap(true);
    sheet.getRange('B5:F5').setValues([['Sessions affichées', 'Confirmées', 'Annulées', 'Places restantes', 'Statuts à vérifier']]).setFontWeight('bold').setWrap(true);
    sheet.getRange('B6:F6').setFontSize(22).setFontWeight('bold').setBackground('#EDECF1').setWrap(true);
    sheet.getRange('B9:F9').setValues([['Période', 'Logiciel', 'Formation', 'Statut', '']]).setFontWeight('bold');
    sheet.getRange('B10:F10').setBackground('#FFFFFF').setFontSize(12).setWrap(true).setNumberFormat('@');
    sheet.getRange('B12:F12').merge().setWrap(true).setFontSize(11);
    var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).filter(function (p) { return p.getDescription() === MARKER; });
    var protection = protections[0] || sheet.protect();
    protection.setDescription(MARKER).setWarningOnly(true).setUnprotectedRanges([sheet.getRange('B10:E10')]);
  }
  function render(sheet, model) {
    var body = rows(model); ensureRows(sheet, body.values.length + 15); clearBody(sheet);
    sheet.hideRows(15, sheet.getMaxRows() - 14);
    var generation = Utilities.getUuid();
    sheet.getRange('G2').setValue(generation);
    sheet.hideColumns(7);
    var range = sheet.getRange(15, 2, body.values.length, 5);
    range.setNumberFormat('@').setValues(body.values).setFontFamily('Arial').setWrap(true).setVerticalAlignment('middle');
    var backgrounds = [], colors = [], weights = [], sizes = [];
    sheet.setRowHeights(15, body.values.length, 64);
    body.styles.forEach(function (style) {
      var values = body.values[style.row - 15];
      var row = sheet.getRange(style.row, 2, 1, 5);
      if (['formation', 'session', 'alert', 'note', 'empty'].indexOf(style.kind) >= 0) row.merge();
      var bg = style.kind === 'formation' ? style.color : ({ session: '#EEF0F5', alert: '#FFF0DD', header: '#E7E8EC', note: '#FFF8E8' }[style.kind] || '#FFFFFF');
      var color = style.kind === 'formation' ? '#FFFFFF' : style.kind === 'note' ? '#654A19' : style.kind === 'empty' ? '#666A76' : '#20212B';
      var bold = ['formation', 'session', 'alert', 'header'].indexOf(style.kind) >= 0;
      backgrounds.push(Array(5).fill(bg)); colors.push(Array(5).fill(color)); weights.push(Array(5).fill(bold ? 'bold' : 'normal')); sizes.push(Array(5).fill(style.kind === 'formation' ? 14 : style.kind === 'session' || style.kind === 'alert' ? 12 : 11));
      var widths = style.kind === 'person' || style.kind === 'header' ? [31, 24, 37, 17, 31] : [style.kind === 'formation' ? 100 : 135];
      var lines = values.reduce(function (max, value, i) { return Math.max(max, String(value).split('\n').reduce(function (n, line) { return n + Math.max(1, Math.ceil(line.length / (widths[i] || 135))); }, 0)); }, 1);
      var height = style.kind === 'space' ? 16 : Math.max(style.kind === 'header' ? 34 : 48, lines * (style.kind === 'formation' ? 23 : 18) + 18);
      if (height !== 64) sheet.setRowHeight(style.row, height);
    });
    range.setBackgrounds(backgrounds).setFontColors(colors).setFontWeights(weights).setFontSizes(sizes);
    body.groups.forEach(function (g) { if (g.count) sheet.getRange(g.first, 2, g.count, 5).shiftRowGroupDepth(1); });
    model.options.forEach(function (choices, i) { sheet.getRange(10, i + 2).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(choices, true).setAllowInvalid(false).build()); });
    sheet.getRange('F9:F10').clearContent().clearDataValidations();
    var metadata = body.values.map(function () { return ['']; }), rules = body.values.map(function () { return [null]; }), notes = body.values.map(function () { return ['']; });
    var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['Confirmée', 'Annulée'], true).setAllowInvalid(false).build();
    body.identities.forEach(function (identity) {
      var index = identity.row - 15;
      metadata[index][0] = JSON.stringify({ generation: generation, id: identity.id, status: identity.status, selection: model.selection, fingerprint: identity.fingerprint, values: body.values[index] });
      if (identity.id && identity.status === 'Confirmée') { rules[index][0] = statusRule; notes[index][0] = 'Choisissez Annulée pour demander l’annulation. Une confirmation sera présentée.'; }
      else if (identity.status === 'Annulée') notes[index][0] = 'Pour réserver de nouveau, utilisez le site.';
    });
    sheet.getRange(15, 7, metadata.length, 1).setValues(metadata);
    sheet.getRange(15, 5, rules.length, 1).setDataValidations(rules).setNotes(notes);
    sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).filter(function (p) { return p.getDescription() === MARKER; }).forEach(function (p) { p.setUnprotectedRanges([sheet.getRange('B10:E10'), sheet.getRange(15, 5, sheet.getMaxRows() - 14, 1)]); });
  }
  function publish(sheet, model) {
    var t = model.totals;
    sheet.getRange('B6:F6').setValues([[t.sessions, t.confirmed, t.cancelled, t.unknownCapacity ? 'À vérifier (' + t.unknownCapacity + ')' : t.remaining, t.unknown]]);
    sheet.getRange('B12').setValue(inert('Compteurs : toutes les inscriptions des sessions affichées. Contexte vérifié : ' + model.selection.filter(function (v) { return v; }).join(' · ') + '. ' + t.participants + ' participant(s) visible(s). ' + model.notices.join(' '))).setFontColor('#666A76').setBackground('#FAF9F7');
    sheet.showRows(15, sheet.getMaxRows() - 14);
  }
  function failure(book, sheet, error) {
    // Chaque diagnostic reste indépendant d’un service de nettoyage éventuellement en échec.
    if (sheet) {
      try { sheet.getRange('B6:F6').clearContent(); } catch (_) { /* Essayer quand même les autres diagnostics. */ }
      try { sheet.getRange('B12').setValue('Actualisation interrompue : ' + text(error.message) + ' Utilisez le menu Actualiser le suivi.').setBackground('#FFF0DD').setFontColor('#654A19'); } catch (_) { /* Le toast reste disponible. */ }
      try { sheet.hideRows(15, sheet.getMaxRows() - 14); } catch (_) { /* Le diagnostic indique que les résultats sont invalides. */ }
      try { clearBody(sheet); } catch (_) { /* Préserver l’erreur initiale, les compteurs et le diagnostic. */ }
    }
    try { book.toast('Le suivi n’a pas pu être actualisé : ' + text(error.message) + ' Consultez le message dans la vue.', 'Suivi des inscriptions', 8); } catch (_) { /* L’appelant reçoit toujours l’erreur initiale. */ }
  }
  function refresh(book, install, extended) {
    guard(book);
    var sheet = book.getSheetByName(NAME);
    if (!sheet && !install) return false;
    if (sheet && !recognized(sheet)) throw new Error('Un onglet Suivi des inscriptions existe déjà et n’est pas reconnu : aucune modification effectuée.');
    if (typeof TemaCopy !== 'undefined' && !TemaCopy.isOwner()) { book.toast('Le propriétaire du classeur doit actualiser le suivi.', 'Suivi des inscriptions', 8); return false; }
    var started = Date.now(), budget = install || extended ? 240000 : 26000, lock = LockService.getUserLock();
    if (!lock.tryLock(5000)) {
      book.toast('Une actualisation est en cours. Le tableau conserve son contexte précédent ; les filtres courants ne sont pas encore appliqués. Le détenteur relira la dernière sélection. Si nécessaire, utilisez Actualiser le suivi.', 'Suivi des inscriptions', 10);
      return false;
    }
    try {
      var fresh = !sheet;
      if (fresh) sheet = book.insertSheet(NAME);
      if (fresh || install) setup(sheet);
      if (fresh) sheet.getRange('B10:F10').setValues([[PERIODS[0], ALL_SOFTWARE, ALL_FORMATIONS, STATUSES[0], '']]);
      pending(sheet); SpreadsheetApp.flush();
      // Au plus deux rendus ; ne pas démarrer une reprise après dix secondes
      // (verrou compris), pour réserver le reste du budget du simple onEdit.
      for (var n = 0; n < 2 && (n === 0 || Date.now() - started < 10000); n++) {
        var sourceVersion = typeof TemaCopy !== 'undefined' ? TemaCopy.version() : null;
        var sources = readSources(book);
        var picked = selection(sheet), d = dependencies(), projectionAt = d.now();
        d.now = function () { return projectionAt; };
        var model = project(sources, picked, d);
        sheet.getRange('F9:F10').clearContent().clearDataValidations();
        // Le modèle et son échéance partagent l’instant précédent le rendu.
        var nextState = typeof TemaCopy !== 'undefined' ? refreshState(sources, d) : null;
        if (!same(picked, selection(sheet))) continue;
        // Ne réécrire que les choix devenus absents, jamais la saisie d’un événement antérieur.
        for (var i = 0; i < 5; i++) if (picked[i] !== model.selection[i] && text(sheet.getRange(10, i + 2).getValue()) === picked[i]) sheet.getRange(10, i + 2).setValue(inert(model.selection[i]));
        if (!same(model.selection, selection(sheet))) continue;
        render(sheet, model); SpreadsheetApp.flush();
        if (same(model.selection, selection(sheet)) && same(sources, readSources(book))) {
          publish(sheet, model); SpreadsheetApp.flush();
          if (Date.now() - started < budget && same(model.selection, selection(sheet)) && same(sources, readSources(book))) {
            if (typeof TemaCopy === 'undefined' || TemaCopy.acknowledge(sourceVersion, function () { return same(model.selection, selection(sheet)) && same(sources, readSources(book)); }, nextState)) return true;
          }
        }
        pending(sheet); SpreadsheetApp.flush();
      }
      throw new Error('Les sources ou la sélection ont changé pendant le calcul, ou le budget de reprise est atteint. Les compteurs ont été retirés pour éviter un résultat périmé.');
    } catch (error) { failure(book, sheet, error); throw error; }
    finally { lock.releaseLock(); }
  }
  function edited(event) {
    if (!event || !event.source || event.source.getId() !== TARGET || !event.range || event.range.getSheet().getName() !== NAME) return false;
    if (typeof TemaRegistrationActions !== 'undefined' && TemaRegistrationActions.edited(event)) return true;
    if (event.range.getRow() <= 10 && event.range.getLastRow() >= 10 && event.range.getColumn() <= 6 && event.range.getLastColumn() >= 2) { if (typeof TemaCopy !== 'undefined') TemaCopy.dirty(); refresh(event.source, false); }
    return true;
  }
  function repairAndRefresh(book) {
    guard(book);
    if (!TemaCopy.isOwner()) throw new Error('Seul le propriétaire peut actualiser le suivi.');
    TemaCopy.lock(function () { TemaCopy.nativeCounters(book); });
    return refresh(book, false, true);
  }
  function show(book) { guard(book); refresh(book, true); var sheet = book.getSheetByName(NAME); book.setActiveSheet(sheet); sheet.setActiveRange(sheet.getRange('B2')); }
  return { name: NAME, target: TARGET, headers: HEADERS, identityKeys: IDENTITY_KEYS, dateLabel: function (value) { return stamp(instant(value), dependencies()) + ' (Montréal)'; }, repairAndRefresh: repairAndRefresh, project: project, rows: rows, inert: inert, readSources: readSources, selection: selection, refresh: refresh, edited: edited, show: show };
})();
function consulterLesInscriptions() { TemaRegistrationView.show(SpreadsheetApp.getActiveSpreadsheet()); }
function actualiserLeSuiviInscriptions() { TemaRegistrationView.repairAndRefresh(SpreadsheetApp.getActiveSpreadsheet()); }
function installerSuiviInscriptionsCopie() { TemaRegistrationView.show(SpreadsheetApp.getActiveSpreadsheet()); }
if (typeof module !== 'undefined') module.exports = TemaRegistrationView;
