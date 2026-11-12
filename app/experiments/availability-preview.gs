// Mesure de vitesse uniquement : aucune vérification Formations/Inscriptions/Paramètres.
// Les places sont la valeur calculée déjà présente dans Disponibilités.
function availabilityPreviewGet_() {
  var started = Date.now();
  try {
    var sheet = trialSheet_();
    var rows = trialReadTable_(sheet, 'Disponibilités');
    var formatLocal = function (ms) { return Utilities.formatDate(new Date(ms), 'America/Toronto', "yyyy-MM-dd'T'HH:mm"); };
    var sessions = [];
    rows.forEach(function (row) {
      if (row.inscriptions_ouvertes !== true || row.etat_validation || !row.id_cohorte || !row.formation) return;
      try {
        var start = TemaTrial.localToUtc(row.date, row.heure_debut, formatLocal);
        var end = TemaTrial.localToUtc(row.date, row.heure_fin, formatLocal);
        if (Date.parse(start) <= Date.now() || end <= start) return;
        sessions.push({ id_cohorte: row.id_cohorte, formation: String(row.formation).split(' — ')[0].trim(), start_at: start, end_at: end, mode: row.mode, adresse_presentiel: row.mode === 'presentiel' ? row.lieu_ou_lien : null, places_restantes: row.places_restantes });
      } catch (_) { /* Une date invalide ne devient jamais une disponibilité publique. */ }
    });
    sessions.sort(function (a, b) { return a.start_at.localeCompare(b.start_at); });
    return trialJson_({ schema_version: 1, timezone: 'America/Toronto', generated_at: new Date().toISOString(), sessions: sessions, benchmark: { cache: 'BYPASS', sheet_reads: 1, server_ms: Date.now() - started } });
  } catch (_) { return trialJson_({ schema_version: 1, code: 'UNAVAILABLE' }); }
}
