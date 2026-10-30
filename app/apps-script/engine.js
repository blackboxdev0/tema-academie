/* Shared V1 engine: Node and Google use these exact contracts and rules. */
var TemaTrial = (function () {
  'use strict';
  var ZONE = 'America/Toronto';
  var HEADERS = {
    Formations: ['id', 'logiciel', 'titre', 'description', 'prerequis', 'contenu', 'resultat', 'duree', 'prix', 'prix_qualificatif', 'places_par_defaut', 'formateurs', 'actif'],
    'Disponibilités': ['id_cohorte', 'formation', 'date', 'heure_debut', 'heure_fin', 'places_max', 'mode', 'lieu_ou_lien', 'inscriptions_ouvertes', 'places_restantes', 'etat_validation'],
    Inscriptions: ['id_inscription', 'request_id', 'payload_fingerprint', 'horodatage', 'id_cohorte', 'session_revision', 'statut', 'prenom', 'nom', 'entreprise', 'courriel', 'telephone', 'consentement_loi25', 'consentement_horodatage', 'politique_version', 'formation_snapshot', 'debut_snapshot', 'fin_snapshot', 'lieu_snapshot', 'mail_participant_etat', 'mail_tema_etat', 'mail_participant_attempt_id', 'mail_participant_attempt_at', 'mail_participant_sent_at', 'mail_participant_error_code', 'mail_tema_attempt_id', 'mail_tema_attempt_at', 'mail_tema_sent_at', 'mail_tema_error_code']
  };
  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  var MAIL_STATES = ['PENDING', 'SENDING', 'SENT', 'FAILED', 'UNKNOWN', 'BLOCKED', 'SUPPRESSED'];
  function fault(code) { var e = new Error(code); e.code = code; return e; }
  function text(v) { return typeof v === 'string' ? v.normalize('NFC').trim() : v; }
  function plain(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function nonempty(v) { return typeof v === 'string' && text(v).length > 0; }
  function iso(ms) { return new Date(ms).toISOString(); }
  function validIso(v) { return typeof v === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(v) && Number.isFinite(Date.parse(v)); }
  function email(v) { return typeof v === 'string' && v.length <= 254 && /^[^\s@<>;,\r\n]+@[^\s@<>;,\r\n]+\.[^\s@<>;,\r\n]+$/.test(v); }
  function url(v) {
    if (typeof v !== 'string' || /[\s<>"'\\\u0000-\u001f\u007f]/.test(v)) return false;
    var match = v.match(/^https:\/\/([^/?#]+)(?:[/?#].*)?$/i); if (!match) return false;
    var authority = match[1].match(/^(\[[0-9a-f:.]+\]|[^:@]+)(?::(\d{1,5}))?$/i); if (!authority || authority[2] && Number(authority[2]) > 65535) return false;
    var host = authority[1];
    if (host[0] === '[') {
      var address = host.slice(1, -1), halves = address.split('::'); if (halves.length > 2 || address.includes(':::')) return false;
      var groups = address.split(':').filter(Boolean), ipv4 = groups.length && groups[groups.length - 1].includes('.');
      if (ipv4) { var octets = groups.pop().split('.'); if (octets.length !== 4 || octets.some(function (n) { return !/^\d{1,3}$/.test(n) || Number(n) > 255; })) return false; }
      var count = groups.length + (ipv4 ? 2 : 0);
      return groups.every(function (g) { return /^[0-9a-f]{1,4}$/i.test(g); }) && (halves.length === 2 ? count < 8 : count === 8) && !/(^:[^:]|[^:]:$)/.test(address);
    }
    if (/^[\d.]+$/.test(host)) { var parts = host.split('.'); return parts.length === 4 && parts.every(function (n) { return /^\d{1,3}$/.test(n) && Number(n) <= 255; }); }
    host = host.replace(/\.$/, '');
    return host.length <= 253 && host.split('.').every(function (label) { return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label); });
  }
  function checked(v) { return v === true; }
  function ref(v) { return typeof v === 'string' ? v.split(' — ')[0].trim() : ''; }
  function inertCell(v) { return typeof v === 'string' && /^[\s]*[=+@\-]/.test(v) ? "'" + v : v; }
  function ascii(v) { return String(v).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function tableRows(values, required) {
    if (!Array.isArray(values) || !values.length) throw fault('CONFIG');
    var headers = values[0].map(String);
    if (headers.some(function (h, i) { return !h || headers.indexOf(h) !== i; }) || required.some(function (h) { return headers.indexOf(h) < 0; })) throw fault('CONFIG');
    return values.slice(1).filter(function (r) { return r.some(function (v) { return v !== '' && v !== null; }); }).map(function (r) {
      var o = {}; headers.forEach(function (h, i) { o[h] = r[i] === undefined ? '' : r[i]; }); return o;
    });
  }
  function canonical(command) {
    if (!plain(command) || !UUID.test(command.request_id || '')) throw fault('INVALID');
    var keys = ['id_cohorte', 'session_revision', 'prenom', 'nom', 'entreprise', 'courriel', 'politique_version'];
    if (keys.some(function (k) { return typeof command[k] !== 'string'; }) || (command.telephone !== null && command.telephone !== undefined && typeof command.telephone !== 'string') || typeof command.schema_version !== 'number' || typeof command.consentement !== 'boolean') throw fault('INVALID');
    var c = { schema_version: command.schema_version, request_id: command.request_id.toLowerCase() };
    keys.forEach(function (k) { c[k] = text(command[k]); });
    c.courriel = c.courriel.toLowerCase(); c.telephone = text(command.telephone || '') || null; c.consentement = command.consentement; c.anti_spam = command.anti_spam;
    return c;
  }
  function fingerprintInput(c) { return JSON.stringify([c.schema_version, c.id_cohorte, c.session_revision, c.prenom, c.nom, c.entreprise, c.courriel, c.telephone, c.consentement, c.politique_version]); }
  function decodeForm(fields) {
    return { schema_version: fields.schema_version === '1' ? 1 : NaN, request_id: fields.request_id, id_cohorte: fields.id_cohorte, session_revision: fields.session_revision, prenom: fields.prenom, nom: fields.nom, entreprise: fields.entreprise, courriel: fields.courriel, telephone: fields.telephone || null, consentement: fields.consentement === 'true', politique_version: fields.politique_version, anti_spam: { honeypot: fields.honeypot, form_started_at: fields.form_started_at } };
  }
  function envelope(code, c, row, errors) {
    var known = ['RECORDED', 'REPLAY'].indexOf(code) >= 0;
    return { schema_version: 1, code: code, request_id: c ? c.request_id : null, recording_status: known ? 'recorded' : ['BUSY', 'UNAVAILABLE', 'RETRY_CONFLICT'].indexOf(code) >= 0 || !c ? 'unknown' : 'not_recorded', reservation_status: known ? row.statut : null, replayed: code === 'REPLAY', mail_status: known ? row.mail_participant_etat : null, message_key: 'registration.' + code.toLowerCase(), errors: errors || [] };
  }
  function localToUtc(date, time, formatLocal) {
    if (!/^\d{4}-\d\d-\d\d$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw fault('INVALID_TIME');
    var n = Date.parse(date + 'T' + time + ':00Z');
    if (!Number.isFinite(n) || iso(n).slice(0, 10) !== date) throw fault('INVALID_TIME');
    // Toronto uses UTC-4/UTC-5 for the dates of this trial. Verify both
    // candidates against the timezone database; zero/two matches are invalid.
    var target = date + 'T' + time;
    var hits = [4, 5].map(function (h) { return n + h * 3600000; }).filter(function (ms) { return formatLocal(ms) === target; });
    if (hits.length !== 1) throw fault('INVALID_TIME');
    return iso(hits[0]);
  }
  function uniqueMap(rows, key) {
    var map = {}, ambiguous = {};
    rows.forEach(function (r) { if (nonempty(r[key])) { if (map[r[key]]) ambiguous[r[key]] = true; else map[r[key]] = r; } });
    Object.keys(ambiguous).forEach(function (k) { delete map[k]; });
    return map;
  }
  function revisionInput(s, f, times) {
    return JSON.stringify(['session.v1', s.id_cohorte, f.id, f.titre, f.duree, f.prix === '' || f.prix === null ? null : f.prix, f.prix_qualificatif || '', s.date, s.heure_debut, s.heure_fin, s.mode, s.mode === 'presentiel' ? s.lieu_ou_lien : null]);
  }
  function formationIssues(data) {
    var ids = {}, softwareIds = {};
    data.formations.forEach(function (f) { if (nonempty(f.id)) ids[f.id] = (ids[f.id] || 0) + 1; });
    data.params.softwares.forEach(function (s) { if (nonempty(s.id) && nonempty(s.label)) softwareIds[s.id] = (softwareIds[s.id] || 0) + 1; });
    return data.formations.map(function (f) {
      var issues = {};
      if (!nonempty(f.id)) issues.id = 'Identifiant de formation manquant'; else if (ids[f.id] !== 1) issues.id = 'Identifiant de formation dupliqué';
      if (!nonempty(f.titre) || !ascii(f.titre)) issues.titre = 'Titre requis avec un caractère alphanumérique';
      if (!nonempty(f.duree)) issues.duree = 'Durée requise';
      if (softwareIds[ref(f.logiciel)] !== 1) issues.logiciel = 'Référence logiciel absente ou ambiguë';
      if (!(f.prix === '' || f.prix === null || typeof f.prix === 'number' && Number.isFinite(f.prix) && f.prix >= 0)) issues.prix = 'Prix numérique positif ou vide requis';
      if (![true, false, ''].includes(f.actif)) issues.actif = 'Case Active invalide';
      return issues;
    });
  }
  function dataView(data, deps) {
    if (!data || !Array.isArray(data.formations) || !Array.isArray(data.sessions) || !Array.isArray(data.registrations) || !plain(data.params)) throw fault('CONFIG');
    var p = data.params;
    if (!email(p.courriel_contact) || !email(p.courriel_avis_tema) || !url(p.politique_url) || !nonempty(p.politique_version) || !Array.isArray(p.softwares) || !p.softwares.length) throw fault('CONFIG');
    var softwareIds = Object.create(null), labels = Object.create(null);
    p.softwares.forEach(function (s) {
      if (!plain(s) || !/^[A-Z0-9]+$/.test(s.id || '') || !nonempty(s.label) || softwareIds[s.id] || labels[s.label]) throw fault('CONFIG');
      softwareIds[s.id] = true; labels[s.label] = true;
    });
    var recordIds = {}, requestIds = {};
    data.registrations.forEach(function (r) {
      if (!nonempty(r.id_inscription) || !UUID.test(r.request_id || '') || recordIds[r.id_inscription] || requestIds[r.request_id] || ['confirmee', 'annulee'].indexOf(r.statut) < 0 || MAIL_STATES.indexOf(r.mail_participant_etat) < 0 || MAIL_STATES.indexOf(r.mail_tema_etat) < 0) throw fault('CONFIG');
      recordIds[r.id_inscription] = true; requestIds[r.request_id] = true;
    });
    var formations = uniqueMap(data.formations, 'id'), formationErrors = formationIssues(data);
    Object.keys(formations).forEach(function (id) {
      var f = formations[id];
      if (Object.keys(formationErrors[data.formations.indexOf(f)]).length) delete formations[id];
    });
    var sessions = uniqueMap(data.sessions, 'id_cohorte'), validSessions = {};
    Object.keys(sessions).forEach(function (id) {
      var s = sessions[id], f = formations[ref(s.formation)];
      if (!f || !Number.isSafeInteger(s.places_max) || s.places_max < 1 || ![true, false, ''].includes(s.inscriptions_ouvertes) || ['presentiel', 'en_ligne'].indexOf(s.mode) < 0 || typeof s.lieu_ou_lien !== 'string' || s.mode === 'presentiel' && !text(s.lieu_ou_lien) || s.mode === 'en_ligne' && s.lieu_ou_lien && !url(s.lieu_ou_lien)) return;
      try {
        var start = localToUtc(s.date, s.heure_debut, deps.formatLocal), end = localToUtc(s.date, s.heure_fin, deps.formatLocal);
        if (end <= start) return;
        var count = data.registrations.filter(function (r) { return r.id_cohorte === id && r.statut === 'confirmee'; }).length;
        validSessions[id] = { row: s, formation: f, start: start, end: end, count: count, remaining: Math.max(0, s.places_max - count), revision: deps.hash(revisionInput(s, f)) };
      } catch (_) { /* Invalid isolated session is absent, without a private diagnostic in HTTP. */ }
    });
    return { formations: formations, sessions: validSessions, params: p };
  }
  function publicCatalogue(data, deps) {
    var view = dataView(data, deps), now = iso(deps.now()), formations = [];
    Object.keys(view.formations).forEach(function (id) {
      var f = view.formations[id]; if (!checked(f.actif)) return;
      var o = { id: f.id, logiciel: ref(f.logiciel) };
      ['titre', 'description', 'prerequis', 'contenu', 'resultat', 'duree', 'prix_qualificatif'].forEach(function (k) { o[k] = typeof f[k] === 'string' ? f[k] : ''; });
      // The approved source separates Ergonomie's audience presentation from
      // its actual prerequisites with a blank line. Keep that existing copy
      // in the introduction; leave other prerequisites intact.
      var presentation = o.prerequis.match(/^(Formation destinée [^\r\n]+)(?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n)([\s\S]+)$/);
      if (!nonempty(o.description) && presentation && nonempty(presentation[2])) {
        o.prerequis = presentation[2];
        if (!nonempty(o.description)) o.description = presentation[1];
      }
      if (!nonempty(o.description)) {
        // The nine-column source has no description. Select an existing
        // sentence/line verbatim; never invent copy or modify the programme.
        var line = o.contenu.split(/\r\n|\r|\n/).find(function (value) { return nonempty(value); });
        var sentence = line && line.match(/^.*?[.!?](?=\s|$)/);
        o.description = sentence ? sentence[0] : line || '';
      }
      o.prix = f.prix === '' || f.prix === null ? null : f.prix; formations.push(o);
    });
    var sessions = [];
    Object.keys(view.sessions).forEach(function (id) {
      var v = view.sessions[id], s = v.row;
      if (!checked(v.formation.actif) || v.start <= now || !checked(s.inscriptions_ouvertes) && v.count === 0) return;
      var status = !checked(s.inscriptions_ouvertes) ? 'closed' : v.remaining ? 'open' : 'full';
      var hasPrice = typeof v.formation.prix === 'number' && Number.isFinite(v.formation.prix) && v.formation.prix >= 0;
      sessions.push({ registration_enabled: status === 'open' && hasPrice, registration_block_reason: status === 'open' && !hasPrice ? 'price_unconfirmed' : null, id_cohorte: id, formation: v.formation.id, start_at: v.start, end_at: v.end, mode: s.mode, adresse_presentiel: s.mode === 'presentiel' ? s.lieu_ou_lien : null, places_max: s.places_max, places_restantes: v.remaining, status: !checked(s.inscriptions_ouvertes) ? 'closed' : v.remaining ? 'open' : 'full', session_revision: v.revision });
    });
    sessions.sort(function (a, b) { return a.start_at.localeCompare(b.start_at); });
    return { schema_version: 1, generated_at: now, timezone: ZONE, contact: { courriel: view.params.courriel_contact }, policy: { url: view.params.politique_url, version: view.params.politique_version }, softwares: view.params.softwares.map(function (s) { return { id: s.id, label: s.label, color: ({DIV: '#FF008F', DIMO: '#365AA7', MOOV: '#176C68'})[s.id] || null }; }), formations: formations, sessions: sessions };
  }
  function errorsFor(c, now) {
    var errors = [];
    [['prenom', 100], ['nom', 100], ['entreprise', 200], ['courriel', 254], ['id_cohorte', 100], ['session_revision', 128], ['politique_version', 100]].forEach(function (rule) {
      if (!nonempty(c[rule[0]]) || c[rule[0]].length > rule[1] || /[\r\n\u0000-\u001f\u007f]/.test(c[rule[0]])) errors.push({ field: rule[0], code: 'INVALID' });
    });
    if (!email(c.courriel)) errors.push({ field: 'courriel', code: 'INVALID' });
    if (c.telephone !== null && (c.telephone.length > 30 || /[\r\n\u0000-\u001f\u007f]/.test(c.telephone))) errors.push({ field: 'telephone', code: 'INVALID' });
    if (c.schema_version !== 1) errors.push({ field: 'schema_version', code: 'INVALID' });
    var a = c.anti_spam;
    if (!plain(a) || a.honeypot !== '' || !validIso(a.form_started_at) || now - Date.parse(a.form_started_at) < 1000 || now - Date.parse(a.form_started_at) > 86400000) errors.push({ field: 'anti_spam', code: 'INVALID' });
    return errors;
  }
  function newRow(c, v, deps) {
    var f = v.formation, now = iso(deps.now()), row = {};
    HEADERS.Inscriptions.forEach(function (k) { row[k] = ''; });
    Object.assign(row, { id_inscription: 'I-' + deps.uuid(), request_id: c.request_id, payload_fingerprint: deps.hash(fingerprintInput(c)), horodatage: now, id_cohorte: c.id_cohorte, session_revision: c.session_revision, statut: 'confirmee', prenom: c.prenom, nom: c.nom, entreprise: c.entreprise, courriel: c.courriel, telephone: c.telephone || '', consentement_loi25: true, consentement_horodatage: now, politique_version: c.politique_version, formation_snapshot: JSON.stringify({ id: f.id, logiciel_id: ref(f.logiciel), titre: f.titre, duree: f.duree, prix: f.prix === '' ? null : f.prix, prix_qualificatif: f.prix_qualificatif || '' }), debut_snapshot: v.start, fin_snapshot: v.end, lieu_snapshot: JSON.stringify({ mode: v.row.mode, adresse_presentiel: v.row.mode === 'presentiel' ? v.row.lieu_ou_lien : null, lien_visio: v.row.mode === 'en_ligne' ? v.row.lieu_ou_lien || null : null }), mail_participant_etat: 'PENDING', mail_tema_etat: 'PENDING' });
    return row;
  }
  function createService(deps) {
    function catalogue() {
      try { deps.guard(); return publicCatalogue(deps.store.read(), deps); }
      catch (_) { return { schema_version: 1, code: 'UNAVAILABLE' }; }
    }
    function register(command) {
      var c;
      try { c = canonical(command); } catch (_) { return envelope('INVALID', null, null); }
      try {
        deps.guard();
        return deps.withLock(function () {
          var initial = deps.store.read();
          // Existing requests precede every mutable rule, including policy,
          // honeypot, opening/start time and cancellation.
          var matches = initial.registrations.filter(function (r) { return r.request_id === c.request_id; });
          if (matches.length > 1) throw fault('CONFIG');
          if (matches.length) {
            var existing = matches[0];
            if (existing.payload_fingerprint !== deps.hash(fingerprintInput(c))) return envelope('RETRY_CONFLICT', c);
            if (!['confirmee', 'annulee'].includes(existing.statut) || !MAIL_STATES.includes(existing.mail_participant_etat)) throw fault('CONFIG');
            return envelope('REPLAY', c, existing);
          }
          // New identifiable commands consume the private atomic budget, including
          // business refusals. Replays/conflicts above never consume it.
          if (!deps.consumeNewCommand) throw fault('RATE_CONFIG');
          if (!deps.consumeNewCommand(deps.hash(c.courriel), deps.now())) {
            var limited = envelope('INVALID', c, null, [{ field: 'anti_spam', code: 'RATE_LIMITED' }]);
            limited.message_key = 'rate_limited'; return limited;
          }
          var errors = errorsFor(c, deps.now());
          if (errors.length) return envelope('INVALID', c, null, errors);
          if (deps.allowNewRegistration && !deps.allowNewRegistration(c)) return envelope('INVALID', c, null, [{ field: 'courriel', code: 'TEST_RECIPIENT_NOT_ALLOWED' }]);
          if (!c.consentement) return envelope('CONSENT_REQUIRED', c, null, [{ field: 'consentement', code: 'REQUIRED' }]);
          // This fresh read is the admission snapshot. A manual close after
          // these checks may not revoke this one admission.
          var data = deps.store.read(), view = dataView(data, deps), v = view.sessions[c.id_cohorte];
          if (c.politique_version !== view.params.politique_version) return envelope('POLICY_CHANGED', c);
          if (!v || !checked(v.formation.actif)) return envelope('NOT_FOUND', c);
          if (!checked(v.row.inscriptions_ouvertes) || Date.parse(v.start) <= deps.now()) return envelope('CLOSED', c);
          if (!(typeof v.formation.prix === 'number' && Number.isFinite(v.formation.prix) && v.formation.prix >= 0)) {
            var unpriced = envelope('CLOSED', c, null, [{ field: 'prix', code: 'PRICE_UNCONFIRMED' }]); unpriced.message_key = 'price_unconfirmed'; return unpriced;
          }
          if (v.revision !== c.session_revision) return envelope('SESSION_CHANGED', c);
          if (data.registrations.some(function (r) { return r.statut === 'confirmee' && r.id_cohorte === c.id_cohorte && String(r.courriel).toLowerCase() === c.courriel; })) return envelope('DUPLICATE', c);
          if (!v.remaining) return envelope('FULL', c);
          var row = newRow(c, v, deps);
          deps.store.insert(row); deps.store.flush();
          return envelope('RECORDED', c, row);
        });
      } catch (e) { return envelope(e.code === 'BUSY' ? 'BUSY' : 'UNAVAILABLE', c); }
    }
    function setMail(id, channel, state, extra) {
      deps.withLock(function () {
        var data = deps.store.read(), row = data.registrations.find(function (r) { return r.id_inscription === id; });
        if (!row || row['mail_' + channel + '_etat'] !== 'SENDING') return;
        var patch = {}; patch['mail_' + channel + '_etat'] = state;
        Object.keys(extra || {}).forEach(function (k) { patch['mail_' + channel + '_' + k] = extra[k]; });
        deps.store.patch(id, patch); deps.store.flush();
      });
    }
    function sendChannel(id, channel) {
      var attempt;
      try {
        deps.guard();
        attempt = deps.withLock(function () {
          var data = deps.store.read(), row = data.registrations.find(function (r) { return r.id_inscription === id; });
          if (!row || row['mail_' + channel + '_etat'] !== 'PENDING') return null;
          var view = dataView(data, deps), v = view.sessions[row.id_cohorte], patch = {}, prefix = 'mail_' + channel + '_';
          if (channel === 'participant' && (row.statut === 'annulee' || !v || !checked(v.formation.actif) || v.revision !== row.session_revision)) {
            patch[prefix + 'etat'] = row.statut === 'annulee' ? 'SUPPRESSED' : 'BLOCKED'; patch[prefix + 'error_code'] = row.statut === 'annulee' ? 'CANCELLED' : 'SESSION_CHANGED';
            deps.store.patch(id, patch); deps.store.flush(); return null;
          }
          var to = channel === 'participant' ? row.courriel : view.params.courriel_avis_tema;
          var budgetError = deps.reserveMail(id, channel, to);
          if (budgetError) { patch[prefix + 'etat'] = 'BLOCKED'; patch[prefix + 'error_code'] = budgetError; deps.store.patch(id, patch); deps.store.flush(); return null; }
          patch[prefix + 'etat'] = 'SENDING'; patch[prefix + 'attempt_id'] = deps.uuid(); patch[prefix + 'attempt_at'] = iso(deps.now());
          deps.store.patch(id, patch); deps.store.flush();
          return { row: Object.assign({}, row, patch), params: view.params, to: to };
        });
      } catch (_) { return; } // PENDING or SENDING is honest when this phase cannot complete.
      if (!attempt) return;
      try {
        deps.mail.send(makeMail(attempt.row, attempt.params, channel, attempt.to, deps));
      } catch (e) {
        try { setMail(id, channel, e && e.uncertain ? 'UNKNOWN' : 'FAILED', { error_code: e && e.uncertain ? 'SEND_UNKNOWN' : 'SEND_FAILED' }); } catch (_) { /* Leave SENDING. */ }
        return;
      }
      try { setMail(id, channel, 'SENT', { sent_at: iso(deps.now()), error_code: '' }); } catch (_) { /* No second attempt after accepted but unrecorded send. */ }
    }
    function notify(id) { sendChannel(id, 'participant'); sendChannel(id, 'tema'); }
    function submit(command) {
      var receipt = register(command);
      if (receipt.code === 'RECORDED') {
        try {
          var row = deps.store.read().registrations.find(function (r) { return r.request_id === receipt.request_id; });
          if (row) notify(row.id_inscription);
          var current = register(command); // Re-read current status, never resend.
          if (current.code === 'REPLAY') { current.code = 'RECORDED'; current.replayed = false; current.message_key = 'registration.recorded'; return current; }
        } catch (_) { /* Established recording survives an email/status failure. */ }
      }
      return receipt;
    }
    return { catalogue: catalogue, register: register, notify: notify, submit: submit };
  }
  function icsEscape(v) { return String(v).replace(/\\/g, '\\\\').replace(/\r\n|\n|\r/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,'); }
  function foldLine(line) {
    var chunks = [], segment = '', length = 0;
    Array.from(line).forEach(function (c) {
      var bytes = unescape(encodeURIComponent(c)).length;
      if (length + bytes > 75) { chunks.push(segment); segment = ' '; length = 1; }
      segment += c; length += bytes;
    }); chunks.push(segment); return chunks.join('\r\n');
  }
  function makeIcs(row) {
    var f = JSON.parse(row.formation_snapshot), place = JSON.parse(row.lieu_snapshot);
    if (place.mode === 'en_ligne' && place.lien_visio && !url(place.lien_visio)) throw fault('CONFIG');
    var location = place.mode === 'presentiel' ? place.adresse_presentiel : place.lien_visio || 'En ligne — lien à venir';
    var description = place.mode === 'en_ligne' && !place.lien_visio ? 'Le lien de connexion vous sera envoyé dans les jours précédant la formation.' : 'Formation Tema Académie.';
    function stamp(v) { if (!validIso(v)) throw fault('CONFIG'); return v.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); }
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tema Academie//TEM-6 Trial//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', 'UID:' + icsEscape(row.id_inscription + '@tema-academie.test'), 'DTSTAMP:' + stamp(row.horodatage), 'DTSTART:' + stamp(row.debut_snapshot), 'DTEND:' + stamp(row.fin_snapshot), 'SUMMARY:' + icsEscape(f.titre), 'DESCRIPTION:' + icsEscape(description), 'LOCATION:' + icsEscape(location)].concat(place.mode === 'en_ligne' && place.lien_visio ? ['URL:' + place.lien_visio] : []).concat(['END:VEVENT', 'END:VCALENDAR', '']).map(foldLine).join('\r\n');
  }
  function makeMail(row, params, channel, to, deps) {
    var f = JSON.parse(row.formation_snapshot), place = JSON.parse(row.lieu_snapshot);
    var location = place.mode === 'presentiel' ? place.adresse_presentiel : place.lien_visio || 'En ligne — lien à venir';
    var pricing = typeof f.prix === 'number' ? (f.prix_qualificatif ? f.prix_qualificatif + ' ' : '') + f.prix + ' $ CAD par participant, taxes en sus' : 'Tarif à confirmer';
    var logistics = f.titre + '\n' + f.duree + '\n' + pricing + '\n' + deps.formatLocal(Date.parse(row.debut_snapshot)) + ' à ' + deps.formatLocal(Date.parse(row.fin_snapshot)).slice(11) + ' (' + ZONE + ')\n' + location;
    var missingLink = place.mode === 'en_ligne' && !place.lien_visio;
    var participantState = row.mail_participant_etat;
    var body = channel === 'participant' ? 'Votre place est réservée.\n\n' + logistics + '\n\n' + (missingLink ? 'Le lien de connexion vous sera envoyé dans les jours précédant la formation.\n\n' : '') + 'Pour toute question, annulation ou modification : ' + params.courriel_contact : 'Inscription ' + row.id_inscription + ' — statut ' + row.statut + '\n' + row.prenom + ' ' + row.nom + '\n' + row.entreprise + '\n' + row.courriel + '\n' + row.telephone + '\n\n' + logistics + '\n\nConfirmation participant : ' + participantState + (participantState === 'SENT' ? ' (acceptée par le service ; réception non garantie)' : ' — vérifier le suivi et contacter manuellement dans Gmail si nécessaire.') + (missingLink ? '\nLien de connexion à communiquer manuellement aux inscrits.' : '') + (deps.privateSheetUrl ? '\nSuivi privé dans Google Sheets : ' + deps.privateSheetUrl : '');
    return { to: to, subject: (channel === 'participant' ? '[TEST] Confirmation — ' : '[TEST] Inscription — ') + f.titre.replace(/[\r\n]/g, ' '), body: body, name: String(params.nom_expediteur || 'Tema Académie').replace(/[\r\n]/g, ' '), ics: channel === 'participant' ? makeIcs(row) : null };
  }
  function prepareAdministration(data, deps, nextCounter) {
    var patches = [], capacityInitializations = [], counter = nextCounter === undefined ? 0 : nextCounter;
    if (!Number.isSafeInteger(counter) || counter < 0) throw fault('COUNTER_RANGE');
    data.formations.forEach(function (f) { var match = String(f.id).match(/-(\d+)$/); if (match) { var imported = Number(match[1]); if (!Number.isSafeInteger(imported)) throw fault('COUNTER_RANGE'); counter = Math.max(counter, imported); } });
    data.formations.forEach(function (f, index) {
      var patch = {};
      if (f.actif === '' || f.actif === undefined || f.actif === null) patch.actif = false;
      if (!f.id && nonempty(f.titre) && data.params.softwares.some(function (s) { return s.id === ref(f.logiciel); })) {
        var suffix = ascii(f.titre).slice(0, 3), software = ref(f.logiciel);
        if (suffix) { if (counter === Number.MAX_SAFE_INTEGER) throw fault('COUNTER_RANGE'); counter += 1; patch.id = (['DIV', 'DIMO', 'MOOV'].includes(software) ? software : software.slice(0, 4)) + '-' + suffix + '-' + String(counter).padStart(3, '0'); }
      }
      if (Object.keys(patch).length) patches.push({ sheet: 'Formations', index: index, values: patch });
    });
    data.sessions.forEach(function (s, index) {
      var patch = {};
      if (!s.id_cohorte) patch.id_cohorte = 'C-' + deps.uuid();
      var cohortId = patch.id_cohorte || s.id_cohorte;
      // Capacity initialization has its own durable lifecycle: a date can get
      // an ID before its formation/default exists. Once initialized (including
      // an explicit human value), later edits/clears never refill it.
      if (data.sessions.filter(function (other) { return other.id_cohorte === cohortId; }).length < 2) {
        var state = deps.capacityInitialization.get(cohortId), blank = s.places_max === '' || s.places_max === null || s.places_max === undefined;
        if (state && (state.version !== 1 || !['waiting', 'complete'].includes(state.status))) throw fault('CAPACITY_INITIALIZATION');
        if (!state || state.status === 'waiting') {
          // Pre-existing IDs without metadata are historical: even a blank
          // capacity may be a deliberate human clear. Adopt it as complete.
          var historical = !state && Boolean(s.id_cohorte), status = historical || !blank ? 'complete' : 'waiting';
          if (blank && !historical) {
            var choices = data.formations.filter(function (f) { return f.id === ref(s.formation); });
            if (choices.length === 1 && Number.isSafeInteger(choices[0].places_par_defaut) && choices[0].places_par_defaut > 0) { patch.places_max = choices[0].places_par_defaut; status = 'complete'; }
          }
          if (!state || state.status !== status) capacityInitializations.push({ id_cohorte: cohortId, version: 1, status: status, adopted_historical: historical, explicit_capacity: !blank });
        }
      }
      if (s.inscriptions_ouvertes === '' || s.inscriptions_ouvertes === undefined || s.inscriptions_ouvertes === null) patch.inscriptions_ouvertes = false;
      var capacity = patch.places_max === undefined ? s.places_max : patch.places_max;
      var count = data.registrations.filter(function (r) { return r.id_cohorte === s.id_cohorte && r.statut === 'confirmee'; }).length;
      if (Number.isSafeInteger(capacity) && capacity > 0) { patch.places_restantes = Math.max(0, capacity - count); patch.etat_validation = count > capacity ? 'Capacité inférieure aux inscriptions confirmées' : ''; }
      else { patch.places_restantes = ''; patch.etat_validation = 'Capacité entière positive requise'; }
      patches.push({ sheet: 'Disponibilités', index: index, values: patch });
    });
    // Reuse the public/admission validator after applying generated defaults.
    // Diagnostics are private; no second interpretation of valid sessions.
    var prepared = Object.assign({}, data, {
      formations: data.formations.map(function (f, index) { var p = patches.find(function (x) { return x.sheet === 'Formations' && x.index === index; }); return Object.assign({}, f, p ? p.values : {}); }),
      sessions: data.sessions.map(function (s, index) { var p = patches.find(function (x) { return x.sheet === 'Disponibilités' && x.index === index; }); return Object.assign({}, s, p ? p.values : {}); })
    });
    var view = dataView(prepared, deps);
    patches.filter(function (p) { return p.sheet === 'Disponibilités'; }).forEach(function (p) {
      if (!p.values.etat_validation && !view.sessions[prepared.sessions[p.index].id_cohorte]) p.values.etat_validation = 'Session invalide : vérifier identifiant, formation, date, heures, mode et lieu';
    });
    return { patches: patches, counter: counter, capacity_initializations: capacityInitializations };
  }
  /** Pure next-state calculation; caller persists while holding the project lock. */
  function nextRateBudget(saved, addressHash, now) {
    if (!/^[a-f0-9]{64}$/.test(addressHash) || !Number.isFinite(now)) throw fault('RATE_CONFIG');
    var window = Math.floor(now / 60000), state = saved;
    if (state !== null && state !== undefined) {
      if (!plain(state) || state.version !== 1 || !Number.isSafeInteger(state.window) || !Number.isInteger(state.total) || state.total < 0 || state.total > 30 || !plain(state.addresses)) throw fault('RATE_CONFIG');
      var keys = Object.keys(state.addresses), total = 0;
      if (keys.length > 30) throw fault('RATE_CONFIG');
      keys.forEach(function (key) { var count = state.addresses[key]; if (!/^[a-f0-9]{64}$/.test(key) || !Number.isInteger(count) || count < 1 || count > 3) throw fault('RATE_CONFIG'); total += count; });
      if (total !== state.total) throw fault('RATE_CONFIG');
    }
    if (!state || state.window !== window) state = { version: 1, window: window, total: 0, addresses: {} };
    if (state.total >= 30 || (state.addresses[addressHash] || 0) >= 3) return { allowed: false, state: state };
    var next = { version: 1, window: window, total: state.total + 1, addresses: Object.assign({}, state.addresses) };
    next.addresses[addressHash] = (next.addresses[addressHash] || 0) + 1;
    return { allowed: true, state: next };
  }
  var IMPORT_FIELDS = ['logiciel', 'titre', 'description', 'prerequis', 'contenu', 'resultat', 'duree', 'prix', 'prix_qualificatif', 'places_par_defaut', 'formateurs'];
  function importFingerprint(row, hash) { return hash(JSON.stringify(IMPORT_FIELDS.map(function (key) { var v = row[key]; return key === 'logiciel' ? ref(v) : (v === undefined || v === null ? '' : v); }))); }
  /** Editor-only adapter owns journal/counter durability; no destructive update path. */
  function importCatalogue(manifest, deps) {
    if (!plain(manifest) || !nonempty(manifest.source_id) || !Array.isArray(manifest.records) || !manifest.records.length || manifest.records.length > 1000) throw fault('IMPORT_MANIFEST');
    var seen = {};
    manifest.records.forEach(function (source) { if (!plain(source) || !nonempty(source.source_key) || seen[source.source_key]) throw fault('IMPORT_SOURCE_AMBIGUOUS'); seen[source.source_key] = true; });
    var result = { imported: 0, resumed: 0, unchanged: 0, conflicts: [] };
    manifest.records.forEach(function (source) {
      var data = deps.store.read(), software = data.params.softwares.filter(function (s) { return s.id === ref(source.logiciel) || s.label === source.logiciel; });
      if (software.length !== 1) { result.conflicts.push({ source_key: source.source_key, code: 'SOFTWARE_AMBIGUOUS' }); return; }
      var row = {};
      IMPORT_FIELDS.forEach(function (key) { row[key] = source[key] === undefined || source[key] === null ? '' : text(source[key]); });
      row.logiciel = software[0].id + ' — ' + software[0].label; row.actif = false;
      var key = deps.hash(JSON.stringify([manifest.source_id, source.source_key])), journal = deps.importState.get(key), sourceHash = importFingerprint(row, deps.hash);
      if (journal) {
        if (journal.version !== 1 || !nonempty(journal.id) || !/^[a-f0-9]{64}$/.test(journal.fingerprint || '') || !['prepared', 'complete'].includes(journal.status)) throw fault('IMPORT_JOURNAL');
        if (journal.fingerprint !== sourceHash) { result.conflicts.push({ source_key: source.source_key, code: 'SOURCE_CHANGED' }); return; }
        if (journal.source_metadata !== undefined) {
          if (!plain(journal.source_metadata) || typeof journal.source_metadata.source_date !== 'string') throw fault('IMPORT_JOURNAL');
          if (typeof source.source_date === 'string' && journal.source_metadata.source_date !== source.source_date) { result.conflicts.push({ source_key: source.source_key, code: 'SOURCE_METADATA_CHANGED' }); return; }
        }
        row.id = journal.id;
      } else {
        var prepared = prepareAdministration({ formations: data.formations.concat([Object.assign({ id: '' }, row)]), sessions: [], registrations: data.registrations, params: data.params }, deps, deps.importState.counter());
        var allocation = prepared.patches.find(function (p) { return p.sheet === 'Formations' && p.index === data.formations.length; });
        if (!allocation || !allocation.values.id) { result.conflicts.push({ source_key: source.source_key, code: 'SOURCE_INVALID' }); return; }
        row.id = allocation.values.id;
        if (Object.keys(formationIssues({ formations: [row], params: data.params })[0]).length || !(row.places_par_defaut === '' || Number.isSafeInteger(row.places_par_defaut) && row.places_par_defaut > 0)) { result.conflicts.push({ source_key: source.source_key, code: 'SOURCE_INVALID' }); return; }
        deps.importState.setCounter(prepared.counter); // Never reuse a reserved number.
        journal = { version: 1, id: row.id, fingerprint: sourceHash, status: 'prepared' };
        if (typeof source.source_date === 'string') journal.source_metadata = { source_date: source.source_date };
        deps.importState.set(key, journal); // Reserve correspondence before insertion.
      }
      var matches = data.formations.filter(function (f) { return f.id === row.id; });
      if (matches.length > 1) { result.conflicts.push({ source_key: source.source_key, code: 'DESTINATION_AMBIGUOUS' }); return; }
      if (matches.length) {
        if (importFingerprint(matches[0], deps.hash) !== sourceHash) { result.conflicts.push({ source_key: source.source_key, code: 'DESTINATION_CHANGED' }); return; }
        if (journal.status === 'prepared') result.resumed += 1; else result.unchanged += 1;
      } else {
        if (journal.status === 'complete') { result.conflicts.push({ source_key: source.source_key, code: 'DESTINATION_MISSING' }); return; }
        deps.importStore.insertFormation(row); deps.store.flush(); result.imported += 1;
      }
      // An explicit compatible replay may enrich old mappings. Provenance is
      // not a booking condition/fingerprint, and conflicting source or Tema
      // rows above never receive a metadata rewrite.
      var saveJournal = journal.status !== 'complete';
      if (journal.source_metadata !== undefined && (!plain(journal.source_metadata) || typeof journal.source_metadata.source_date !== 'string')) throw fault('IMPORT_JOURNAL');
      if (journal.source_metadata === undefined && typeof source.source_date === 'string') { journal.source_metadata = { source_date: source.source_date }; saveJournal = true; }
      if (journal.status !== 'complete') journal.status = 'complete';
      if (saveJournal) deps.importState.set(key, journal);
    });
    return result;
  }
  return { nextRateBudget: nextRateBudget, importCatalogue: importCatalogue, HEADERS: HEADERS, canonical: canonical, fingerprintInput: fingerprintInput, decodeForm: decodeForm, tableRows: tableRows, envelope: envelope, publicCatalogue: publicCatalogue, localToUtc: localToUtc, revisionInput: revisionInput, createService: createService, makeIcs: makeIcs, makeMail: makeMail, prepareAdministration: prepareAdministration, formationIssues: formationIssues, inertCell: inertCell, fault: fault };
}());
if (typeof module !== 'undefined' && module.exports) module.exports = TemaTrial;
