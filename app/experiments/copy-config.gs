/* Explicit COPY configuration. TEST content only; no sheet or property fallback. */
var TemaCopyConfig = (function () {
  'use strict';
  function read() {
    // Return a new object and new software entries for every consumer.
    return {
      admissions_mode: 'demo',
      courriel_contact: 'temaacademie@gmail.com',
      courriel_avis_tema: 'temaacademie@gmail.com',
      nom_expediteur: 'Tema Académie',
      politique_url: 'https://example.invalid/politique-essai',
      politique_version: 'TEST-1',
      softwares: [{ id: 'DIV', label: 'Divalto' }, { id: 'DIMO', label: 'Dimo' }, { id: 'MOOV', label: 'MoovApps' }]
    };
  }
  return { read: read };
})();
