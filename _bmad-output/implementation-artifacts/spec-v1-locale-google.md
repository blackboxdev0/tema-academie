---
title: 'V1 locale connectée à Google TEST'
type: feature
created: '2026-10-30'
status: ready-for-dev
route: dispatch
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
  - '{project-root}/docs/project/architecture/controle-technique-v1.md'
  - '{project-root}/_bmad-output/specs/spec-tema-academie-v1/contrat-donnees.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/EXPERIENCE.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/DESIGN.md'
---

<frozen-after-approval reason="GO explicite Sofiane /goal du 30 octobre 2026">

## Intent

Livrer les cinq blocs / 17 stories définis en application complète locale réellement connectée à Sheets et Apps Script TEST, prête pour recette finale Sofiane. Réutiliser le prototype, les textes client et les cinq maquettes approuvées ; terminer tests, corrections et revues.

## Boundaries & Constraints

Toujours : architecture statique portable sans réécriture serveur ; un moteur partagé Node/Google ; données privées et historique conservés ; ressources TEST fixes ; budgets/allowlist persistants sans reset ; aucune donnée personnelle dans URL/stockage durable navigateur. Sessions de recette explicitement fictives, dates client à venir. GO autonome comprend décisions techniques courantes, délégation utile, commits/push par jalon.

Jamais : fusion/main, production, Vercel/FTP, achats, destinataire supplémentaire, données privées dans dépôt public. Réception réelle distincte de MailApp/SENT ; Outlook/Apple et acceptation finale restent humains.

## I/O & Edge-Case Matrix

| État | Résultat attendu |
|---|---|
| Catalogue client | 24 formations fidèles, filtres/pagination/calendriers/fiches conformes |
| Prix absent/date indisponible | Visibilité définie, inscription désactivée, refus serveur certain |
| Nouvelle inscription | Une place et ligne, confirmation/ICS puis avis, même contrat |
| Réponse perdue/rejeu | Même demande, aucune seconde place/notification |
| Révision/politique changée | Relecture, nouvel accord, coordonnées préservées |
| Panne/quota/interruption | Place maintenue, trace privée, aucune relance automatique |
| Annulation/reprogrammation | Historique et instantanés conservés, suivi manuel |
| Import/export/rafales | Import durable reprenable ; texte Excel inerte ; limiteur atomique 3/30 |

</frozen-after-approval>

## Code Map

- `app/apps-script/engine.js` : admission, projection, administration et courriels partagés à étendre.
- `app/apps-script/google.js` : adaptateurs, garde TEST, budgets, triggers ; préserver propriétés/lignes existantes.
- `app/web/{index.html,app.js,styles.css}` : prototype transport/reprise à conserver dans parcours complet.
- `app/scripts/{build,serve}.cjs`, `app/tests/` : outillage statique et suite 61 Node/28 E2E de référence.
- Maquettes/JSON/assets : dossier UX `ux-tema-academie-2026-10-20/.working/` ; classeur complet privé référencé dans config/project.json.

## Tasks & Acceptance

- [ ] `app/apps-script/` : réaliser stories 1.1–1.3, extensions 3.1–3.4 et 4.1–4.3 ; import privé stable source→ID sans écrasement, champs publics dérivés, anti-abus, secours 5 min et diagnostics ; garder budgets TEST.
- [ ] `app/web/` : réaliser 2.1–2.3 et parcours 3, finition 5.1 ; reproduire maquettes approuvées, programme avant dates, sélection initiale/routage/retours, clavier/mobile et confidentialité.
- [ ] `app/scripts/`, `.github/workflows/` : démarrage/build portable configuré Google, CI dès premier push applicatif, contrôle sécurité et export tableur typé vérifiable.
- [ ] `app/tests/` : compléter les 52 scénarios d’epics pertinents, matrice, concurrence/limites/cadence/charge, transport, erreurs, accessibilité et navigateurs disponibles ; aucune simulation exposée au public.
- [ ] `app/README.md`, `docs/project/guide-google.md` : démarrage, tests, gestion/export/nettoyage, installation TEST, retour compatible sans restauration de données.

Critères : étant donné chaque story 1.1–5.4 et ses AC dans epics.md, lorsque réalisée dans la cible locale + Google TEST, alors son comportement et ses preuves sont traçables ; publication/remise publique exclues par GO courant. Les vérifications Google réelles sont exécutées par l’orchestrateur via Computer Use après candidat local ; elles ne sont pas remplacées par les tests simulés.

## Implementation Notes

Préparation acceptée par GO et audit readiness PASS ; aucune question métier restante. Source intégrale privée, extraction publique sans formateurs. Implémentation déléguée peut répartir backend et frontend entre agents avec fichiers distincts, puis intégrer/tester. Ne pas commiter/pousser depuis les agents enfants : l’orchestrateur assure jalons, Google, Linear, revues et remise. Modifications préparatoires identifiées attendues. Priorité à conserver les garanties du prototype.

## Spec Change Log

## Review Triage Log

## Verification

`cd app && npm run verify` ; contrôles méthode/check ; suites navigateur/sécurité/accessibilité ajoutées. Google réel : identité TEST, budget avant/après, import/rejeu, édition→projection, inscription/reprise, courriels reçus et export réel. Aucune preuve acquise par la rédaction de cette spec.
