(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var config = window.TEMA_CONFIG || {}, catalogue = null, selected = null, pending = null, startedAt = null, sending = false, changeRequired = false, candidateChange = null, lastReadFailed = false;
  var codes = ['RECORDED', 'REPLAY', 'FULL', 'CLOSED', 'NOT_FOUND', 'SESSION_CHANGED', 'DUPLICATE', 'INVALID', 'CONSENT_REQUIRED', 'POLICY_CHANGED', 'RETRY_CONFLICT', 'BUSY', 'UNAVAILABLE'];
  var fields = ['prenom', 'nom', 'entreprise', 'courriel', 'telephone'];
  function node(tag, value, className) { var el = document.createElement(tag); if (value !== undefined) el.textContent = value; if (className) el.className = className; return el; }
  function show(id) { view = id; document.body.dataset.view = id; document.querySelectorAll('[data-home]').forEach(function (a) { var active = id === 'catalogue' && a.dataset.home === (location.hash === '#calendrier' ? 'calendrier' : 'catalogue'); if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); ['catalogue', 'detail', 'registration', 'result', 'privacy'].forEach(function (name) { $(name).hidden = name !== id; }); }
  function localDate(value) { return new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Toronto', dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)); }
  function price(f) { return f.prix === null ? 'Tarif à confirmer' : f.prix_qualificatif + ' ' + f.prix + ' $ CAD par participant, taxes en sus'; }
  function summary(target, selection) {
    target.replaceChildren();
    if (!selection) return;
    var s = selection.session, f = selection.formation;
    target.append(node('h2', f.titre), node('p', (catalogue ? software(f).label + ' · ' : '') + f.duree, 'recap-intro'));
    var details = node('div', undefined, 'recap-fields'), date = node('div', undefined, 'recap-date'), tile = node('strong', dateParts(s.start_at).day, 'date-tile'), words = node('div'); words.append(node('h3', 'Date et horaires'), node('p', localDate(s.start_at) + ' — ' + formatTime(s.end_at) + ' · Heure de Montréal (America/Toronto)')); date.append(tile, words);
    var tariff = node('div'); tariff.append(node('h3', 'Tarif'), node('p', price(f))); var location = node('div'); location.append(node('h3', 'Format et lieu'), node('p', s.mode === 'presentiel' ? 'En présentiel · ' + s.adresse_presentiel : 'En ligne — le lien de connexion sera transmis par courriel ou dans les jours précédant la formation.')); details.append(date, tariff, location); target.append(details);
  }
  var readingCatalogue = null, queuedCatalogueRead = null;
  function startCatalogueRead() {
    var task = fetchCatalogue(); readingCatalogue = task;
    function clear() { if (readingCatalogue === task) readingCatalogue = null; }
    task.then(clear, clear); return task;
  }
  function readCatalogue() {
    // One request at a time. A burst during an active read shares one fresh
    // trailing read, including reconfirmation after a mutable server refusal.
    if (queuedCatalogueRead) return queuedCatalogueRead;
    if (!readingCatalogue) return startCatalogueRead();
    queuedCatalogueRead = readingCatalogue.catch(function () {}).then(function () { queuedCatalogueRead = null; return startCatalogueRead(); });
    return queuedCatalogueRead;
  }
  async function fetchCatalogue() {
    if (!config.apiUrl) throw new Error('NO_SERVICE');
    var controller = new AbortController(), timer = setTimeout(function () { controller.abort(); }, 15000);
    try {
      var response = await fetch(config.apiUrl, { credentials: 'omit', redirect: 'follow', signal: controller.signal });
      var data = await response.json();
      if (!response.ok || !data || data.schema_version !== 1 || data.timezone !== 'America/Toronto' || !Array.isArray(data.formations) || !Array.isArray(data.sessions) || !data.policy || !/^https:\/\//.test(data.policy.url) || !data.contact || !/^[^\s@]+@[^\s@]+$/.test(data.contact.courriel)) throw new Error('UNAVAILABLE');
      catalogue = data; lastReadFailed = false;
      var localDraft = /(^|\.)example\.invalid$/i.test(new URL(data.policy.url).hostname);
      ['policy', 'footer-policy'].forEach(function (id) { var a = $(id); a.href = localDraft ? '#politique' : data.policy.url; if (localDraft) { a.removeAttribute('target'); a.removeAttribute('rel'); } else { a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
      $('privacy-version').textContent = 'Version proposée TEST : ' + data.policy.version + ' — à valider par Tema avant ouverture.'; $('policy-version').textContent = 'Version ' + data.policy.version; $('footer-policy').hidden = false; document.querySelectorAll('.contact-link, .contact-address').forEach(function (a) { a.href = 'mailto:' + data.contact.courriel; if (a.classList.contains('contact-address')) a.textContent = data.contact.courriel; a.hidden = false; }); $('contact').href = 'mailto:' + data.contact.courriel; $('contact').hidden = false;
      return data;
    } finally { clearTimeout(timer); }
  }
  var view = 'catalogue', filter = '', pageNumber = 1, homeMonth = null, detailMonth = null, detailId = null, detailSession = null, homeScroll = 0, firstLoad = true, privacyReturn = { view: 'catalogue', route: '#', scroll: 0, focus: 'catalogue-title' };
  function eligible(s) { var f = s && catalogue && catalogue.formations.find(function (x) { return x.id === s.formation; }); return !!(s && f && typeof f.prix === 'number' && Number.isFinite(f.prix) && f.prix >= 0 && s.registration_enabled === true && s.status === 'open' && s.registration_block_reason === null); }
  function dateParts(value) { return Object.fromEntries(new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value)).map(function (p) { return [p.type, p.value]; })); }
  function monthOf(value) { var p = dateParts(value); return p.year + '-' + p.month; }
  function sessionsFor(id) { return catalogue.sessions.filter(function (s) { return !id || s.formation === id; }).sort(function (a, b) { return a.start_at.localeCompare(b.start_at); }); }
  function software(f) { return catalogue.softwares.find(function (s) { return s.id === f.logiciel; }) || { label: f.logiciel, color: null }; }
  function status(s) { return !s ? 'Dates à venir' : s.status === 'closed' ? 'Inscriptions terminées' : s.status === 'full' ? 'Complet' : s.registration_block_reason === 'price_unconfirmed' ? 'Tarif à confirmer' : s.places_restantes + (s.places_restantes === 1 ? ' place restante' : ' places restantes'); }
  function badge(s) { return node('span', (lastReadFailed && s ? 'Dernière lecture : ' : '') + status(s), eligible(s) ? 'availability' : 'status'); }
  function button(label, action, cls) { var b = node('button', label, cls); b.dataset.focusKey = 'button:' + (cls || '') + ':' + label; b.type = 'button'; b.addEventListener('click', action); return b; }
  function link(label, hash, cls) { var a = node('a', undefined, cls); if (label.endsWith(' →')) { var icon = node('span', ' →', 'action-icon'); icon.setAttribute('aria-hidden', 'true'); a.append(node('span', label.slice(0, -2), 'action-label'), icon); } else a.textContent = label; a.href = hash; a.dataset.focusKey = 'link:' + hash; return a; }
  function validMonth(month) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(month || '') && month >= '0001-01' && month <= '9999-12'; }
  function routeHash(formation, cohort, form, month) { var p = new URLSearchParams(); if (formation) p.set('formation', formation); if (cohort) p.set('date', cohort); if (form) p.set('vue', 'inscription'); if (validMonth(month)) p.set('mois', month); return '#' + p.toString(); }
  function filteredFormations() { return catalogue.formations.filter(function (f) { return !filter || f.logiciel === filter; }); }
  function filteredSessions() { var ids = filteredFormations().map(function (f) { return f.id; }); return sessionsFor().filter(function (s) { return ids.includes(s.formation); }); }
  function initialMonth(dates) { var current = monthOf(Date.now()); return dates.some(function (s) { return monthOf(s.start_at) === current; }) ? current : dates.length ? monthOf(dates[0].start_at) : current; }
  function switchMonth(month, delta) { var parts = month.split('-'), value = (Number(parts[0]) - 1) * 12 + Number(parts[1]) - 1; value = Math.max(0, Math.min(9999 * 12 - 1, value + delta)); return String(Math.floor(value / 12) + 1).padStart(4, '0') + '-' + String(value % 12 + 1).padStart(2, '0'); }
  function formatTime(value) { return new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Toronto', timeStyle: 'short' }).format(new Date(value)); }
  function goHome(anchor, restore) { if (pending || sending) return; history.pushState(null, '', anchor ? '#calendrier' : '#'); show('catalogue'); renderCatalogue(); requestAnimationFrame(function () { if (anchor) $('calendrier').scrollIntoView(); else if (restore) window.scrollTo(0, homeScroll); else window.scrollTo(0, 0); }); }
  function renderCatalogue() {
    $('catalogue-notice').hidden = !lastReadFailed;
    var list = filteredFormations(), group = function (f) { var dates = sessionsFor(f.id); return dates.some(eligible) ? 0 : dates.length ? 1 : 2; };
    list = list.map(function (f, i) { return { f: f, i: i }; }).sort(function (a, b) { return group(a.f) - group(b.f) || a.i - b.i; }).map(function (v) { return v.f; });
    pageNumber = Math.min(pageNumber, Math.max(1, Math.ceil(list.length / 6)));
    $('filters').replaceChildren();
    [{ id: '', label: 'Tous' }].concat(catalogue.softwares).forEach(function (s) { var b = button(s.label, function () { filter = s.id; pageNumber = 1; homeMonth = initialMonth(filteredSessions()); renderCatalogue(); Array.from($('filters').children).find(function (x) { return x.textContent === s.label; }).focus(); }, 'filter'); b.setAttribute('aria-pressed', String(filter === s.id)); $('filters').append(b); });
    $('formations').replaceChildren();
    list.slice((pageNumber - 1) * 6, pageNumber * 6).forEach(function (f) {
      var dates = sessionsFor(f.id), next = dates.find(eligible) || dates[0], card = node('article', undefined, 'card'), main = node('div', undefined, 'card-main'), top = node('div', undefined, 'card-date' + (!next ? ' card-date-neutral' : '')), body = node('div', undefined, 'card-body');
      top.append(node('span', next ? eligible(next) ? 'Prochaine session' : 'Session' : 'Calendrier', 'eyebrow'));
      if (next) { var dp = dateParts(next.start_at); top.append(node('strong', dp.day, 'date-number'), node('span', new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Toronto', month: 'long' }).format(new Date(next.start_at)), 'card-month'), node('small', dp.year, 'card-year')); } else top.append(node('strong', 'Dates à venir', 'card-future'));
      body.append(node('p', software(f).label, 'software'), node('h3', f.titre), badge(next));
      main.append(top, body); var facts = node('div', undefined, 'card-facts'), logistics = node('div', undefined, 'card-logistics'), tariff = node('div', undefined, 'card-price');
      logistics.append(node('span', f.duree + (next ? ' · ' + formatTime(next.start_at) + ' – ' + formatTime(next.end_at) : ''))); if (next) logistics.append(node('span', next.mode === 'presentiel' ? 'En présentiel' : 'En ligne'));
      if (f.prix === null) tariff.append(node('strong', 'Tarif à confirmer')); else tariff.append(node('span', f.prix_qualificatif), node('strong', f.prix + ' $ CAD'), node('small', 'par participant, taxes en sus'));
      facts.append(logistics, tariff); card.append(main, facts, link('Voir la formation et les dates →', routeHash(f.id), 'card-link')); $('formations').append(card);
    });
    $('catalogue-status').replaceChildren(node('span', !catalogue.formations.length ? 'Aucune formation disponible pour le moment.' : !list.length ? 'Aucune formation pour ce logiciel.' : ((pageNumber - 1) * 6 + 1) + '–' + Math.min(pageNumber * 6, list.length) + ' sur ' + list.length + ' formations'));
    if (!list.length && filter) $('catalogue-status').append(button('Voir toutes les formations', function () { filter = ''; pageNumber = 1; homeMonth = null; renderCatalogue(); }, 'secondary'));
    $('pagination').replaceChildren();
    if (list.length > 6) for (var i = 1; i <= Math.ceil(list.length / 6); i++) (function (number) { var b = button(String(number), function () { pageNumber = number; renderCatalogue(); $('catalogue-status').tabIndex = -1; $('catalogue-status').focus(); $('catalogue-status').scrollIntoView({ block: 'start' }); }, 'secondary'); b.setAttribute('aria-label', 'Page ' + number); if (number === pageNumber) b.setAttribute('aria-current', 'page'); $('pagination').append(b); }(i));
    if (!homeMonth) homeMonth = initialMonth(filteredSessions()); renderCalendar($('general-calendar'), filteredSessions(), homeMonth, false);
  }
  function calendarSummary(s, f) {
    var box = node('aside', undefined, 'selection-summary'); box.setAttribute('aria-label', 'Récapitulatif de la date sélectionnée');
    var header = node('div', undefined, 'selection-datebar'), words = node('div', undefined, 'selection-datewords'), parts = dateParts(s.start_at);
    words.append(node('p', 'Date sélectionnée'), node('h3', new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Toronto', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(s.start_at))), node('p', parts.year));
    header.append(node('strong', parts.day, 'date-tile'), words); var content = node('div', undefined, 'selection-body');
    content.append(node('strong', formatTime(s.start_at) + ' à ' + formatTime(s.end_at)), node('p', 'Heure de Montréal · America/Toronto'), node('p', s.mode === 'presentiel' ? 'En présentiel · ' + s.adresse_presentiel : 'En ligne — le lien sera transmis par courriel ou dans les jours précédant la formation.'), node('p', price(f)), badge(s));
    var b = button('S’inscrire à cette date', function () { choose(s, f); history.pushState(null, '', routeHash(f.id, s.id_cohorte, true)); }, 'primary'); b.disabled = !eligible(s); content.append(b);
    if (!eligible(s)) content.append(node('p', s.registration_block_reason === 'price_unconfirmed' ? 'Le tarif doit être confirmé avant toute inscription.' : 'Cette date n’est pas réservable.'));
    box.append(header, content); return box;
  }
  function renderCalendar(target, dates, month, detail) {
    target.replaceChildren(); var head = node('div', undefined, 'calendar-head'), caption = node('h3', new Intl.DateTimeFormat('fr-CA', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(month + '-15T12:00Z')));
    function move(delta) { if (switchMonth(month, delta) === month) return; if (detail) { detailMonth = switchMonth(month, delta); detailSession = null; history.replaceState(null, '', routeHash(detailId, null, false, detailMonth)); renderDetail(); } else { homeMonth = switchMonth(month, delta); renderCatalogue(); } var controls = detail ? $('detail-content') : $('general-calendar'); var focus = controls.querySelector('button[aria-label="' + (detail ? delta < 0 ? 'Mois précédent de la formation' : 'Mois suivant de la formation' : delta < 0 ? 'Mois précédent' : 'Mois suivant') + '"]'); if (focus) focus.focus(); }
    var prev = button('←', function () { move(-1); }, 'secondary'), next = button('→', function () { move(1); }, 'secondary'); prev.setAttribute('aria-label', detail ? 'Mois précédent de la formation' : 'Mois précédent'); next.setAttribute('aria-label', detail ? 'Mois suivant de la formation' : 'Mois suivant'); prev.disabled = month === '0001-01'; next.disabled = month === '9999-12'; var captionGroup = node('div'), navigation = node('div', undefined, 'calendar-navigation'); captionGroup.append(caption, node('p', 'Heure de Montréal')); navigation.append(prev, next); head.append(captionGroup, navigation); target.append(head);
    var monthDates = dates.filter(function (s) { return monthOf(s.start_at) === month; });
    if (!monthDates.length) { target.append(node('p', !dates.length ? 'Aucune formation planifiée pour le moment.' : 'Aucune session pour ce mois.', 'calendar-empty')); if (detail) target.append(node('p', dates.length ? 'Consultez les autres mois pour voir les dates.' : 'Dates à venir. Aucune date réservable pour le moment.', 'calendar-empty')); return; }
    var grid = node('div', undefined, 'calendar-grid'); ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].forEach(function (d) { grid.append(node('div', d, 'weekday')); });
    var start = new Date(month + '-01T12:00:00Z'), offset = (start.getUTCDay() + 6) % 7, days = new Date(start.getUTCFullYear(), start.getUTCMonth() + 1, 0).getUTCDate();
    for (var j = 0; j < offset; j++) grid.append(node('div', '', 'day empty'));
    for (var n = 1; n <= days; n++) {
      var dayDates = monthDates.filter(function (s) { return Number(dateParts(s.start_at).day) === n; }), day = node('div', undefined, 'day' + (!dayDates.length ? ' no-events' : ''));
      day.append(node('strong', new Intl.DateTimeFormat('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(month + '-' + String(n).padStart(2, '0') + 'T12:00Z')), 'mobile-day'), node('span', String(n), 'day-number'));
      dayDates.forEach(function (s) {
        var f = catalogue.formations.find(function (x) { return x.id === s.formation; }); if (!f) return;
        var event = detail ? button('', function () { detailSession = s.id_cohorte; history.replaceState(null, '', routeHash(f.id, s.id_cohorte)); renderDetail(); var event = $('detail-content').querySelector('.calendar-event[aria-pressed=true]'); if (event) event.focus(); }, 'calendar-event') : link('', routeHash(f.id, s.id_cohorte), 'calendar-event');
        event.dataset.focusKey = 'session:' + s.id_cohorte;
        if (detail) event.setAttribute('aria-pressed', String(s.id_cohorte === detailSession));
        var color = software(f).color || ({ DIV: '#FF008F', DIMO: '#365AA7', MOOV: '#176C68' })[f.logiciel]; if (/^#[0-9a-f]{6}$/i.test(color || '')) event.style.borderLeftColor = color;
        event.append(node('span', software(f).label, 'software'), node('strong', detail ? formatTime(s.start_at) + ' – ' + formatTime(s.end_at) : f.titre), node('span', detail ? localDate(s.start_at) : formatTime(s.start_at) + ' – ' + formatTime(s.end_at)), node('span', s.mode === 'presentiel' ? 'En présentiel' : 'En ligne'), badge(s));
        day.append(event);
        if (detail && s.id_cohorte === detailSession) { var mobileSummary = calendarSummary(s, f); mobileSummary.classList.add('mobile-summary'); day.append(mobileSummary); }
      }); grid.append(day);
    }
    target.append(grid);
  }
  function openDetail(id, cohort, manualMonth) {
    detailId = id; var dates = sessionsFor(id), chosen = cohort && dates.find(function (s) { return s.id_cohorte === cohort; }) || (!manualMonth && dates.find(eligible)); detailSession = chosen ? chosen.id_cohorte : null; detailMonth = chosen ? monthOf(chosen.start_at) : manualMonth || initialMonth(dates); renderDetail(); show('detail'); $('detail-title').focus();
  }
  function renderDetail() {
    $('detail-notice').hidden = !lastReadFailed;
    var f = catalogue.formations.find(function (x) { return x.id === detailId; }), target = $('detail-content'); target.replaceChildren();
    if (!f) { target.append(node('h1', 'Formation indisponible', ''), node('p', 'Cette formation est inactive ou introuvable. Retournez au catalogue pour consulter les formations disponibles.')); target.firstChild.id = 'detail-title'; target.firstChild.tabIndex = -1; return; }
    var intro = node('div', undefined, 'detail-hero'), text = node('div'), title = node('h1', f.titre); title.id = 'detail-title'; title.tabIndex = -1;
    text.append(node('p', software(f).label, 'software'), title, node('p', f.description)); var meta = node('aside', undefined, 'detail-meta'); meta.append(node('p', 'Durée · ' + f.duree)); if (f.prix === null) meta.append(node('strong', 'Tarif à confirmer')); else meta.append(node('p', f.prix_qualificatif), node('strong', f.prix + ' $ CAD'), node('p', 'par participant, taxes en sus')); meta.append(link('Voir les dates →', routeHash(f.id, detailSession, false, detailMonth) + '&section=dates', 'primary')); intro.append(text, meta); target.append(intro);
    var surface = node('div', undefined, 'program-surface'), program = node('div', undefined, 'program'), editorial = node('div', undefined, 'program-intro'), content = node('div', undefined, 'program-content'); editorial.append(node('p', '01 / Le programme', 'eyebrow'), node('h2', 'Ce que vous allez apprendre.')); [['Au programme', f.contenu], ['À l’issue de la formation', f.resultat], ['Prérequis', f.prerequis || 'Aucun prérequis indiqué.']].forEach(function (v) { var section = node('section'); section.append(node('h3', v[0]), node('p', v[1], 'multiline')); content.append(section); }); program.append(editorial, content); surface.append(program); target.append(surface);
    var dates = node('section', undefined, 'detail-dates'); dates.id = 'dates-formation'; dates.tabIndex = -1; dates.append(node('p', '02 / Les dates', 'eyebrow'), node('h2', 'Choisissez votre date.'), node('p', 'Heure de Montréal — America/Toronto. La sélection ne réserve aucune place.'));
    var layout = node('div', undefined, 'calendar-layout'), calendar = node('div', undefined, 'calendar'); renderCalendar(calendar, sessionsFor(f.id), detailMonth, true); layout.append(calendar);
    var chosen = sessionsFor(f.id).find(function (s) { return s.id_cohorte === detailSession; }); if (chosen) { var aside = calendarSummary(chosen, f); aside.classList.add('desktop-summary'); layout.append(aside); } else layout.append(node('p', sessionsFor(f.id).some(eligible) ? 'Sélectionnez une date pour consulter son récapitulatif.' : 'Aucune date réservable pour le moment.', 'selection-hint'));
    dates.append(layout); surface.append(dates);
  }
  function applyRoute() {
    if (!catalogue) return;
    // The skip link targets the current view without rebuilding it or moving
    // away from an unresolved registration. Keyboard focus must follow it.
    if (location.hash === '#main') { $('main').focus(); $('main').scrollIntoView(); return; }
    if (pending || sending) { history.replaceState(null, '', routeHash(selected.formation.id, selected.session.id_cohorte, true)); show('registration'); return; }
    var raw = location.hash.slice(1); if (raw === 'politique') { show('privacy'); $('privacy-title').focus(); return; } if (raw === 'dates-formation') { if (detailId && $('dates-formation')) { show('detail'); $('dates-formation').focus(); $('dates-formation').scrollIntoView(); } else { show('catalogue'); renderCatalogue(); } return; }
    var p = new URLSearchParams(raw), id = p.get('formation'), cohort = p.get('date');
    if (p.get('section') === 'dates' && view === 'detail' && detailId === id && $('dates-formation')) { $('dates-formation').focus(); $('dates-formation').scrollIntoView(); return; }
    if (id && p.get('vue') === 'inscription' && selected && selected.formation.id === id && selected.session.id_cohorte === cohort) { show('registration'); $('form-title').focus(); return; }
    if (id) { if (view === 'catalogue') homeScroll = window.scrollY; openDetail(id, cohort, validMonth(p.get('mois')) ? p.get('mois') : null); if (p.get('vue') === 'inscription') { var s = sessionsFor(id).find(function (x) { return x.id_cohorte === cohort; }), f = catalogue.formations.find(function (x) { return x.id === id; }); if (eligible(s) && f) choose(s, f); } else if (p.get('section') === 'dates' && $('dates-formation')) { $('dates-formation').focus(); $('dates-formation').scrollIntoView(); } }
    else { show('catalogue'); renderCatalogue(); requestAnimationFrame(function () { if (raw === 'calendrier') $('calendrier').scrollIntoView(); else window.scrollTo(0, homeScroll); }); }
  }
  function publicContent(data) { return data ? JSON.stringify([data.softwares, data.formations, data.sessions, data.policy, data.contact]) : null; }
  function preserveFocus(render) {
    var active = document.activeElement, key = active && active.dataset && active.dataset.focusKey, id = active && active.id, x = window.scrollX, y = window.scrollY;
    render();
    if (active && (!active.isConnected || active.closest('[hidden]'))) {
      var scope = $(view), next = id && $(id) || key && scope && Array.from(scope.querySelectorAll('[data-focus-key]')).find(function (el) { return el.dataset.focusKey === key; });
      if (next && next.closest('[hidden]')) next = null;
      if (!next && view === 'detail') next = $('detail-title');
      if (next) { next.focus({ preventScroll: true }); window.scrollTo(x, y); }
    }
  }
  async function refresh() {
    var before = publicContent(catalogue), wasFailed = lastReadFailed;
    try {
      await readCatalogue();
      if (firstLoad) { renderCatalogue(); firstLoad = false; applyRoute(); }
      // A preceding read may fail while this caller is queued. Inspect the
      // rendered notices after success as well as the state captured earlier.
      else if (before !== publicContent(catalogue) || wasFailed || (view === 'detail' ? !$('detail-notice').hidden : !$('catalogue-notice').hidden)) preserveFocus(function () { renderCatalogue(); if (view === 'detail') renderDetail(); });
    } catch (_) {
      lastReadFailed = true;
      if (catalogue) preserveFocus(function () { renderCatalogue(); if (view === 'detail') renderDetail(); });
      $('catalogue-status').textContent = config.apiUrl ? 'Les dates sont indisponibles. Réessayez dans un instant.' : 'Le service TEST n’est pas encore configuré.';
    }
  }
  function formAvailability(s, label) { $('form-availability').hidden = false; $('form-availability').replaceChildren(node('p', label), badge(s), node('p', 'La saisie du formulaire ne réserve pas de place.')); }
  function clearErrors() { fields.concat(['consentement']).forEach(function (key) { $(key).removeAttribute('aria-invalid'); if ($(key + '-help')) $(key).setAttribute('aria-describedby', key + '-help'); else $(key).removeAttribute('aria-describedby'); $(key + '-error').textContent = ''; }); }
  function choose(s, f) {
    if (pending || !eligible(s)) return;
    selected = { session: structuredClone(s), formation: structuredClone(f), policyVersion: catalogue.policy.version };
    startedAt = new Date().toISOString(); changeRequired = false; candidateChange = null;
    $('changed').hidden = true; $('form-status').textContent = ''; $('retry').hidden = true; $('consentement').checked = false;
    $('personal-fields').disabled = false; $('submit').disabled = false; $('change-date').disabled = false; clearErrors(); summary($('summary'), selected); formAvailability(s, 'Disponibilité au choix de la date'); show('registration'); $('form-title').textContent = 'Inscription à ' + f.titre; $('form-title').focus();
  }
  function makeCommand() {
    var command = { schema_version: 1, request_id: crypto.randomUUID(), id_cohorte: selected.session.id_cohorte, session_revision: selected.session.session_revision, consentement: $('consentement').checked, politique_version: selected.policyVersion, anti_spam: { honeypot: $('website').value, form_started_at: startedAt } };
    fields.forEach(function (key) { command[key] = $(key).value; }); command.telephone = command.telephone || null; return command;
  }
  function validReceipt(result, command) {
    if (!result || result.schema_version !== 1 || !codes.includes(result.code) || result.request_id !== command.request_id || !Array.isArray(result.errors) || typeof result.replayed !== 'boolean') return false;
    var errorFields = fields.concat(['id_cohorte', 'session_revision', 'politique_version', 'prix', 'schema_version', 'anti_spam', 'consentement']);
    if (result.errors.some(function (err) { return !err || typeof err !== 'object' || Array.isArray(err) || !errorFields.includes(err.field) || !['INVALID', 'REQUIRED', 'TEST_RECIPIENT_NOT_ALLOWED', 'RATE_LIMITED', 'PRICE_UNCONFIRMED'].includes(err.code); })) return false;
    var special = result.code === 'INVALID' && result.message_key === 'rate_limited' && result.errors.length === 1 && result.errors[0].field === 'anti_spam' && result.errors[0].code === 'RATE_LIMITED' || result.code === 'CLOSED' && result.message_key === 'price_unconfirmed' && result.errors.length === 1 && result.errors[0].field === 'prix' && result.errors[0].code === 'PRICE_UNCONFIRMED';
    if (!special && (result.message_key !== 'registration.' + result.code.toLowerCase() || !['INVALID', 'CONSENT_REQUIRED'].includes(result.code) && result.errors.length)) return false;
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
    $('reservation-message').textContent = cancelled ? 'La reprise conserve son statut annulé. Aucune nouvelle place n’a été réservée.' : 'Votre inscription est confirmée. Votre place est réservée pour ' + selected.formation.titre + ', le ' + localDate(selected.session.start_at) + ', jusqu’à ' + formatTime(selected.session.end_at) + ' (Heure de Montréal).' ;
    var messages = { SENT: 'La confirmation et l’invitation ont été acceptées par le service d’envoi. Vérifiez votre boîte et vos indésirables ; la réception reste à constater.', FAILED: 'Votre place est conservée. Le courriel n’a pas pu être envoyé. Tema dispose du suivi pour vous contacter manuellement.', BLOCKED: 'Votre place est conservée. Le courriel n’a pas été envoyé. Contactez Tema pour le suivi.', SUPPRESSED: 'Le courriel non envoyé a été supprimé du traitement après annulation.', PENDING: 'L’envoi est en préparation. Son résultat final n’est pas encore établi.', SENDING: 'L’envoi est en cours. Son résultat final n’est pas encore établi.', UNKNOWN: 'Le résultat de l’envoi est incertain. Tema vérifiera le suivi avant un contact manuel.' };
    var cancelledMessages = { SENT: 'La confirmation initiale avait été acceptée par le service d’envoi ; sa réception n’est pas garantie.', FAILED: 'Le courriel initial n’a pas pu être envoyé.', BLOCKED: 'Le courriel initial n’a pas été envoyé.', SUPPRESSED: 'Le courriel non envoyé a été supprimé du traitement après annulation.', PENDING: 'L’envoi initial n’est pas confirmé.', SENDING: 'Le résultat de l’envoi initial reste incertain.', UNKNOWN: 'Le résultat de l’envoi initial reste incertain.' };
    $('mail-message').textContent = cancelled ? 'Cette inscription est annulée. ' + cancelledMessages[result.mail_status] + ' Cette reprise ne déclenche aucun nouvel envoi.' : messages[result.mail_status]; summary($('result-summary'), selected); show('result'); $('result-title').focus();
  }
  async function handle(result) {
    clearErrors();
    if (result.recording_status === 'recorded') { finish(result); return; }
    if (result.recording_status === 'unknown') { unknown(); return; }
    $('personal-fields').disabled = false; $('submit').disabled = false; $('change-date').disabled = false; $('retry').hidden = true;
    var messages = { FULL: 'Cette date est désormais complète. Votre inscription n’a pas été enregistrée. Choisissez une autre date ; vos coordonnées sont conservées.', CLOSED: 'Les inscriptions à cette date sont terminées. Votre inscription n’a pas été enregistrée. Choisissez une autre date.', NOT_FOUND: 'Cette date n’est plus proposée. Choisissez une autre date.', DUPLICATE: 'Une inscription active existe déjà pour ce courriel et cette date. Contactez Tema si nécessaire.', INVALID: 'Vérifiez les champs signalés puis confirmez à nouveau.', CONSENT_REQUIRED: 'Votre accord explicite est nécessaire.', POLICY_CHANGED: 'La politique a changé. Relisez-la et renouvelez votre accord.', SESSION_CHANGED: 'Les conditions de cette date ont changé. Relisez le récapitulatif actualisé.' };
    $('form-status').textContent = result.message_key === 'rate_limited' ? 'Trop de demandes rapprochées. Votre inscription n’a pas été enregistrée. Attendez une minute puis réessayez explicitement. Vos coordonnées sont conservées.' : result.message_key === 'price_unconfirmed' ? 'Tarif à confirmer. Votre inscription n’a pas été enregistrée.' : (messages[result.code] || 'La demande n’a pas été enregistrée.');
    result.errors.forEach(function (err) { if (fields.concat(['consentement']).includes(err.field)) { $(err.field).setAttribute('aria-invalid', 'true'); $(err.field).setAttribute('aria-describedby', ($(err.field + '-help') ? err.field + '-help ' : '') + err.field + '-error'); $(err.field + '-error').textContent = 'Vérifiez ce champ.'; var label = document.querySelector('label[for="' + err.field + '"]'); $('form-status').append(node('br'), button(label ? 'Corriger : ' + label.textContent : 'Corriger ce champ', function () { $(err.field).focus(); }, 'text-button')); } });
    if (['FULL', 'CLOSED', 'NOT_FOUND'].includes(result.code)) { $('submit').disabled = true; $('form-availability').hidden = true; }
    if (['SESSION_CHANGED', 'POLICY_CHANGED'].includes(result.code)) {
      changeRequired = true; $('submit').disabled = true;
      try {
        await readCatalogue(); var s = catalogue.sessions.find(function (session) { return session.id_cohorte === selected.session.id_cohorte; });
        var f = s && catalogue.formations.find(function (formation) { return formation.id === s.formation; });
        if (s && f && eligible(s)) { candidateChange = { session: structuredClone(s), formation: structuredClone(f), policyVersion: catalogue.policy.version }; summary($('summary'), candidateChange); formAvailability(s, 'Disponibilité actuelle'); $('changed').hidden = false; }
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
  $('change-date').addEventListener('click', function () { if (!pending) { openDetail(selected.formation.id, selected.session.id_cohorte); history.pushState(null, '', routeHash(selected.formation.id, selected.session.id_cohorte)); refresh(); } });
  $('back').addEventListener('click', function () { $('form').reset(); selected = null; goHome(null, true); refresh(); });
  $('reload').addEventListener('click', refresh);
  $('retry-detail').addEventListener('click', refresh);
  $('retry-catalogue').addEventListener('click', refresh);
  function refreshVisibleCatalogue() { if (!document.hidden && (view === 'catalogue' || view === 'detail')) refresh(); }
  setInterval(refreshVisibleCatalogue, 30000);
  window.addEventListener('focus', refreshVisibleCatalogue);
  document.addEventListener('visibilitychange', refreshVisibleCatalogue);
  function currentPublicRoute() {
    if (view === 'registration' && selected) return routeHash(selected.formation.id, selected.session.id_cohorte, true);
    if (view === 'detail' && detailId) return routeHash(detailId, detailSession, false, detailMonth);
    return location.hash === '#main' ? '#' : location.hash || '#';
  }
  ['policy', 'footer-policy'].forEach(function (id) { $(id).addEventListener('click', function (e) {
    if (pending || sending) { e.preventDefault(); return; }
    if ($(id).getAttribute('href') !== '#politique' || view === 'privacy') return;
    privacyReturn = { view: view, route: currentPublicRoute(), scroll: window.scrollY, focus: id };
    // A skip link is an in-view anchor, not the identity of the originating view.
    // Keep a resumable public route in browser history before opening privacy.
    history.replaceState(null, '', privacyReturn.route);
  }); });
  $('privacy-back').addEventListener('click', function () {
    history.replaceState(null, '', privacyReturn.route); show(privacyReturn.view);
    if (privacyReturn.view === 'catalogue') renderCatalogue();
    var focus = $(privacyReturn.focus); if (focus) focus.focus({ preventScroll: true });
    window.scrollTo(0, privacyReturn.scroll);
  });
  $('catalogue-back').addEventListener('click', function () { goHome(null, true); });
  document.querySelectorAll('[data-home]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); goHome(a.dataset.home === 'calendrier', false); }); });
  window.addEventListener('hashchange', applyRoute);
  refresh();
}());
