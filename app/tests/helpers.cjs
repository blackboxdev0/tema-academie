const crypto = require('node:crypto');
const TemaTrial = require('../apps-script/engine.js');
function formatLocal(ms) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ms));
  const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
function fixture() {
  return {
    params: { courriel_contact: 'contact@example.invalid', courriel_avis_tema: 'internal@example.invalid', politique_url: 'https://example.invalid/politique-test', politique_version: 'TEST-1', nom_expediteur: 'Tema — TEST', softwares: [{ id: 'DIV', label: 'Divalto' }, { id: 'DIMO', label: 'Dimo' }, { id: 'MOOV', label: 'MoovApps' }] },
    formations: [{ id: 'DIV-ESS-001', logiciel: 'DIV — Divalto', titre: 'Essai — été, accents ; \nprogramme', description: 'Formation fictive', prerequis: '', contenu: 'Contenu test', resultat: '', duree: 'Demi-journée', prix: 450, prix_qualificatif: 'À partir de', places_par_defaut: 3, formateurs: 'PRIVATE_TRAINER', actif: true }],
    sessions: [
      { id_cohorte: 'C-11111111-1111-4111-8111-111111111111', formation: 'DIV-ESS-001 — Essai', date: '2030-01-15', heure_debut: '09:00', heure_fin: '12:00', places_max: 3, mode: 'en_ligne', lieu_ou_lien: 'https://example.invalid/PRIVATE_VIDEO', inscriptions_ouvertes: true, places_restantes: 3, etat_validation: '' },
      { id_cohorte: 'C-22222222-2222-4222-8222-222222222222', formation: 'DIV-ESS-001 — Essai', date: '2030-07-15', heure_debut: '09:00', heure_fin: '12:00', places_max: 3, mode: 'presentiel', lieu_ou_lien: '123, rue Fictive, Montréal', inscriptions_ouvertes: true, places_restantes: 3, etat_validation: '' }
    ], registrations: []
  };
}
function harness(options = {}) {
  const data = options.data || fixture();
  let now = options.now || Date.parse('2029-12-01T12:00:00.000Z'), locked = false, reads = 0;
  const events = [], messages = [], reservations = new Set();
  let rateBudget = null;
  const capacityInitializations = new Map();
  const deps = {
    capacityInitialization: { get: id => capacityInitializations.get(id) ?? null, set: (id, value) => capacityInitializations.set(id, structuredClone(value)) },
    consumeNewCommand: (hash, at) => {
      if (!locked || options.failRateBudget) throw Error('private rate budget unavailable');
      const next = TemaTrial.nextRateBudget(rateBudget, hash, at); rateBudget = next.state; return next.allowed;
    },
    now: () => now, uuid: () => crypto.randomUUID(), hash: input => crypto.createHash('sha256').update(input, 'utf8').digest('hex'), formatLocal,
    guard: () => { if (options.badEnvironment) throw TemaTrial.fault('ENVIRONMENT'); },
    withLock: fn => {
      if (locked || options.busy) throw TemaTrial.fault('BUSY'); locked = true; events.push('lock');
      try { return fn(); } finally { events.push('unlock'); locked = false; }
    },
    store: {
      read: () => { reads++; if (options.beforeRead) options.beforeRead(reads, data); return structuredClone(data); },
      insert: row => { events.push('insert'); data.registrations.push(structuredClone(row)); if (options.afterInsert) options.afterInsert(data); },
      patch: (id, patch) => { if (options.failStatusWrite && patch.mail_participant_etat === 'SENT') throw Error('write interrupted'); Object.assign(data.registrations.find(row => row.id_inscription === id), patch); },
      flush: () => { events.push('flush'); if (options.failFlush) throw Error('unknown write'); }
    },
    reserveMail: (id, channel, to) => {
      if (options.blockMail) return options.blockMail;
      if (!['participant@example.invalid', 'internal@example.invalid'].includes(to)) return 'ALLOWLIST';
      const key = `${id}:${channel}`; if (reservations.has(key)) return 'ATTEMPT_RESERVED'; reservations.add(key); return null;
    },
    mail: { send: message => {
      messages.push(structuredClone(message));
      if (options.failAllMail || options.failParticipant && message.ics) { const error = Error('send failed'); error.uncertain = options.uncertain; throw error; }
    } }
  };
  const service = TemaTrial.createService(deps);
  function command(overrides = {}) {
    const cat = service.catalogue();
    const s = cat.sessions && cat.sessions[0] || { ...data.sessions[0], session_revision: deps.hash(TemaTrial.revisionInput(data.sessions[0], data.formations[0])) };
    return Object.assign({ schema_version: 1, request_id: crypto.randomUUID(), id_cohorte: s.id_cohorte, session_revision: s.session_revision, prenom: 'Anne', nom: 'Fictive', entreprise: 'Entreprise essai', courriel: 'participant@example.invalid', telephone: null, consentement: true, politique_version: 'TEST-1', anti_spam: { honeypot: '', form_started_at: new Date(now - 2000).toISOString() } }, overrides);
  }
  return { data, deps, service, command, events, messages, options, advance: ms => { now += ms; } };
}
module.exports = { TemaTrial, formatLocal, fixture, harness };
