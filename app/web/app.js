(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var config = window.TEMA_CONFIG || {}, catalogue = null, selected = null, pending = null, startedAt = null, sending = false, changeRequired = false, candidateChange = null;
  var codes = ['RECORDED', 'REPLAY', 'FULL', 'CLOSED', 'NOT_FOUND', 'SESSION_CHANGED', 'DUPLICATE', 'INVALID', 'CONSENT_REQUIRED', 'POLICY_CHANGED', 'RETRY_CONFLICT', 'BUSY', 'UNAVAILABLE'];
  var fields = ['prenom', 'nom', 'entreprise', 'courriel', 'telephone'];
  function node(tag, value, className) { var el = document.createElement(tag); if (value !== undefined) el.textContent = value; if (className) el.className = className; return el; }
  function show(id) { ['catalogue', 'registration', 'result'].forEach(function (name) { $(name).hidden = name !== id; }); }
  function localDate(value) { return new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Toronto', dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)); }
  function price(f) { return f.prix === null ? 'Tarif à confirmer' : f.prix_qualificatif + ' ' + f.prix + ' $ CAD par participant, taxes en sus'; }
  function summary(target, selection) {
    target.replaceChildren();
    if (!selection) return;
    var s = selection.session, f = selection.formation;
    target.append(node('h2', f.titre), node('p', localDate(s.start_at) + ' — ' + new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Toronto', timeStyle: 'short' }).format(new Date(s.end_at)) + ' (Toronto)'), node('p', s.mode === 'presentiel' ? s.adresse_presentiel : 'En ligne — lien transmis par courriel ou à venir'), node('p', price(f)));
  }
  async function readCatalogue() {
    if (!config.apiUrl) throw new Error('NO_SERVICE');
    var controller = new AbortController(), timer = setTimeout(function () { controller.abort(); }, 15000);
    try {
      var response = await fetch(config.apiUrl, { credentials: 'omit', redirect: 'follow', signal: controller.signal });
      var data = await response.json();
      if (!response.ok || !data || data.schema_version !== 1 || data.timezone !== 'America/Toronto' || !Array.isArray(data.formations) || !Array.isArray(data.sessions) || !data.policy || !/^https:\/\//.test(data.policy.url) || !data.contact || !/^[^\s@]+@[^\s@]+$/.test(data.contact.courriel)) throw new Error('UNAVAILABLE');
      catalogue = data; $('policy').href = data.policy.url; $('contact').href = 'mailto:' + data.contact.courriel; $('contact').hidden = false;
      return data;
    } finally { clearTimeout(timer); }
  }
  function renderCatalogue() {
    $('formations').replaceChildren();
    catalogue.formations.forEach(function (f) {
      var card = node('article', undefined, 'card'); card.append(node('h2', f.titre), node('p', f.description), node('p', price(f)));
      var dates = catalogue.sessions.filter(function (s) { return s.formation === f.id; });
      if (!dates.length) card.append(node('p', 'Dates à venir'));
      dates.forEach(function (s) {
        var row = node('div', undefined, 'session'), details = node('div');
        details.append(node('p', localDate(s.start_at) + ' (Toronto)'), node('p', s.mode === 'presentiel' ? s.adresse_presentiel : 'En ligne'), node('p', s.status === 'closed' ? 'Inscriptions terminées' : s.status === 'full' ? 'Complet' : s.places_restantes + ' place(s) disponible(s)', 'places'));
        var button = node('button', 'S’inscrire à cette date'); button.type = 'button'; button.disabled = s.status !== 'open'; button.addEventListener('click', function () { choose(s, f); });
        row.append(details, button); card.append(row);
      }); $('formations').append(card);
    });
    $('catalogue-status').textContent = catalogue.formations.length ? '' : 'Aucune formation disponible pour le moment.';
  }
  async function refresh() {
    try { await readCatalogue(); renderCatalogue(); }
    catch (_) { $('catalogue-status').textContent = config.apiUrl ? 'Les dates sont indisponibles. Réessayez dans un instant.' : 'Le service TEST n’est pas encore configuré.'; }
  }
  function clearErrors() { fields.concat(['consentement']).forEach(function (key) { $(key).removeAttribute('aria-invalid'); $(key).removeAttribute('aria-describedby'); $(key + '-error').textContent = ''; }); }
  function choose(s, f) {
    if (pending) return;
    selected = { session: structuredClone(s), formation: structuredClone(f), policyVersion: catalogue.policy.version };
    startedAt = new Date().toISOString(); changeRequired = false; candidateChange = null;
    $('changed').hidden = true; $('form-status').textContent = ''; $('retry').hidden = true; $('consentement').checked = false;
    $('personal-fields').disabled = false; $('submit').disabled = false; $('change-date').disabled = false; clearErrors(); summary($('summary'), selected); show('registration'); $('form-title').focus();
  }
  function makeCommand() {
    var command = { schema_version: 1, request_id: crypto.randomUUID(), id_cohorte: selected.session.id_cohorte, session_revision: selected.session.session_revision, consentement: $('consentement').checked, politique_version: selected.policyVersion, anti_spam: { honeypot: $('website').value, form_started_at: startedAt } };
    fields.forEach(function (key) { command[key] = $(key).value; }); command.telephone = command.telephone || null; return command;
  }
  function validReceipt(result, command) {
    if (!result || result.schema_version !== 1 || !codes.includes(result.code) || result.request_id !== command.request_id || !Array.isArray(result.errors) || typeof result.replayed !== 'boolean') return false;
    var errorFields = fields.concat(['id_cohorte', 'session_revision', 'politique_version', 'schema_version', 'anti_spam', 'consentement']);
    if (result.errors.some(function (err) { return !err || typeof err !== 'object' || Array.isArray(err) || !errorFields.includes(err.field) || !['INVALID', 'REQUIRED', 'TEST_RECIPIENT_NOT_ALLOWED'].includes(err.code); })) return false;
    if (result.message_key !== 'registration.' + result.code.toLowerCase() || !['INVALID', 'CONSENT_REQUIRED'].includes(result.code) && result.errors.length) return false;
    if (['RECORDED', 'REPLAY'].includes(result.code)) return result.recording_status === 'recorded' && ['confirmee', 'annulee'].includes(result.reservation_status) && ['PENDING', 'SENDING', 'SENT', 'FAILED', 'UNKNOWN', 'BLOCKED', 'SUPPRESSED'].includes(result.mail_status) && result.replayed === (result.code === 'REPLAY');
    if (['BUSY', 'UNAVAILABLE', 'RETRY_CONFLICT'].includes(result.code)) return result.recording_status === 'unknown' && result.reservation_status === null && result.mail_status === null && !result.replayed;
    return result.recording_status === 'not_recorded' && result.reservation_status === null && result.mail_status === null && !result.replayed;
  }
  function unknown() {
    show('registration');
    $('form-status').textContent = 'Le résultat de votre inscription est inconnu. Reprenez la même demande pour vérifier son enregistrement.';
    $('personal-fields').disabled = true; $('submit').disabled = true; $('change-date').disabled = true; $('retry').hidden = false; $('retry').disabled = false; $('form-status').focus();
  }
  function finish(result) {
    var cancelled = result.reservation_status === 'annulee';
    $('result-title').textContent = cancelled ? 'Cette inscription a été annulée' : 'Votre place est réservée';
    $('reservation-message').textContent = cancelled ? 'La reprise conserve son statut annulé. Aucune nouvelle place n’a été réservée.' : 'Votre inscription est enregistrée.';
    var messages = { SENT: 'La confirmation et l’invitation ont été acceptées par le service d’envoi. Vérifiez votre boîte et vos indésirables ; la réception reste à constater.', FAILED: 'Votre place est conservée. Le courriel n’a pas pu être envoyé. Tema dispose du suivi pour vous contacter manuellement.', BLOCKED: 'Votre place est conservée. Le courriel n’a pas été envoyé. Contactez Tema pour le suivi.', SUPPRESSED: 'Le courriel non envoyé a été supprimé du traitement après annulation.', PENDING: 'L’envoi n’est pas confirmé. Tema vérifiera le suivi avant un contact manuel.', SENDING: 'Le résultat de l’envoi est incertain. Tema vérifiera le suivi avant un contact manuel.', UNKNOWN: 'Le résultat de l’envoi est incertain. Tema vérifiera le suivi avant un contact manuel.' };
    var cancelledMessages = { SENT: 'La confirmation initiale avait été acceptée par le service d’envoi ; sa réception n’est pas garantie.', FAILED: 'Le courriel initial n’a pas pu être envoyé.', BLOCKED: 'Le courriel initial n’a pas été envoyé.', SUPPRESSED: 'Le courriel non envoyé a été supprimé du traitement après annulation.', PENDING: 'L’envoi initial n’est pas confirmé.', SENDING: 'Le résultat de l’envoi initial reste incertain.', UNKNOWN: 'Le résultat de l’envoi initial reste incertain.' };
    $('mail-message').textContent = cancelled ? 'Cette inscription est annulée. ' + cancelledMessages[result.mail_status] + ' Cette reprise ne déclenche aucun nouvel envoi.' : messages[result.mail_status]; summary($('result-summary'), selected); show('result'); $('result-title').focus();
  }
  async function handle(result) {
    clearErrors();
    if (result.recording_status === 'recorded') { finish(result); return; }
    if (result.recording_status === 'unknown') { unknown(); return; }
    $('personal-fields').disabled = false; $('submit').disabled = false; $('change-date').disabled = false; $('retry').hidden = true;
    var messages = { FULL: 'Cette date est désormais complète. Choisissez une autre date ; vos coordonnées sont conservées.', CLOSED: 'Les inscriptions à cette date sont terminées. Choisissez une autre date.', NOT_FOUND: 'Cette date n’est plus proposée. Choisissez une autre date.', DUPLICATE: 'Une inscription active existe déjà pour ce courriel et cette date. Contactez Tema si nécessaire.', INVALID: 'Vérifiez les champs signalés puis confirmez à nouveau.', CONSENT_REQUIRED: 'Votre accord explicite est nécessaire.', POLICY_CHANGED: 'La politique a changé. Relisez-la et renouvelez votre accord.', SESSION_CHANGED: 'Les conditions de cette date ont changé. Relisez le récapitulatif actualisé.' };
    $('form-status').textContent = messages[result.code] || 'La demande n’a pas été enregistrée.';
    result.errors.forEach(function (err) { if (fields.concat(['consentement']).includes(err.field)) { $(err.field).setAttribute('aria-invalid', 'true'); $(err.field).setAttribute('aria-describedby', err.field + '-error'); $(err.field + '-error').textContent = 'Vérifiez ce champ.'; } });
    if (['FULL', 'CLOSED', 'NOT_FOUND'].includes(result.code)) $('submit').disabled = true;
    if (['SESSION_CHANGED', 'POLICY_CHANGED'].includes(result.code)) {
      changeRequired = true; $('submit').disabled = true;
      try {
        await readCatalogue(); var s = catalogue.sessions.find(function (session) { return session.id_cohorte === selected.session.id_cohorte; });
        var f = s && catalogue.formations.find(function (formation) { return formation.id === s.formation; });
        if (s && f && s.status === 'open') { candidateChange = { session: structuredClone(s), formation: structuredClone(f), policyVersion: catalogue.policy.version }; summary($('summary'), candidateChange); $('changed').hidden = false; }
        else $('form-status').textContent += ' Cette date n’est plus disponible ; choisissez une autre date.';
      } catch (_) { $('form-status').textContent += ' Les nouvelles conditions sont indisponibles ; actualisez les dates avant de reprendre.'; }
    }
    $('form-status').focus();
  }
  async function send(command) {
    if (sending) return; sending = true; $('submit').disabled = true; $('retry').disabled = true; $('change-date').disabled = true; $('personal-fields').disabled = true; $('form-status').textContent = 'Enregistrement en cours…';
    var controller = new AbortController(), timer = setTimeout(function () { controller.abort(); }, 45000);
    try {
      var params = new URLSearchParams();
      Object.keys(command).forEach(function (key) { if (key !== 'anti_spam') params.set(key, command[key] === null ? '' : String(command[key])); });
      params.set('honeypot', command.anti_spam.honeypot); params.set('form_started_at', command.anti_spam.form_started_at);
      var response = await fetch(config.apiUrl, { method: 'POST', body: params, credentials: 'omit', redirect: 'follow', mode: 'cors', signal: controller.signal });
      var result = await response.json(); if (!response.ok || !validReceipt(result, command)) throw new Error('UNREADABLE');
      await handle(result);
      if (result.recording_status !== 'unknown') pending = null;
    } catch (_) { unknown(); }
    finally { clearTimeout(timer); sending = false; }
  }
  $('form').addEventListener('submit', function (event) { event.preventDefault(); if (sending || changeRequired || pending || !selected) return; pending = makeCommand(); send(pending); });
  $('retry').addEventListener('click', function () { if (pending) send(pending); });
  $('accept-change').addEventListener('click', function () { if (candidateChange) { selected = candidateChange; candidateChange = null; changeRequired = false; startedAt = new Date().toISOString(); $('consentement').checked = false; $('changed').hidden = true; $('submit').disabled = false; $('form-status').textContent = 'Conditions actualisées. Renouvelez votre accord puis confirmez votre inscription.'; } });
  $('change-date').addEventListener('click', function () { if (!pending) { show('catalogue'); refresh(); } });
  $('back').addEventListener('click', function () { $('form').reset(); selected = null; show('catalogue'); refresh(); });
  $('reload').addEventListener('click', refresh);
  function refreshVisibleCatalogue() { if (!document.hidden && !$('catalogue').hidden) refresh(); }
  setInterval(refreshVisibleCatalogue, 30000);
  window.addEventListener('focus', refreshVisibleCatalogue);
  document.addEventListener('visibilitychange', refreshVisibleCatalogue);
  refresh();
}());
