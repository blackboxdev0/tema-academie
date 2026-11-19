/* Production participant content. Publication still requires client approval. */
var TemaCopyConfig = (function () {
  'use strict';
  function read() {
    return {
      admissions_mode: 'production',
      courriel_contact: 'temaacademie@gmail.com',
      courriel_avis_tema: 'temaacademie@gmail.com',
      nom_expediteur: 'Tema Académie',
      politique_url: '#politique',
      politique_version: 'TEMA-2026-11-18-1',
      softwares: [{ id: 'DIV', label: 'Divalto' }, { id: 'DIMO', label: 'Dimo' }, { id: 'MOOV', label: 'MoovApps' }]
    };
  }
  return { read: read };
})();
