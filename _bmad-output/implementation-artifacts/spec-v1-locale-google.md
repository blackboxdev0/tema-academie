---
title: 'V1 locale connectée à Google TEST'
type: feature
created: '2026-10-30'
status: done
route: dispatch
baseline_commit: a57ced60b0186c2fe1070fe28ce305b23d3b0137
review_loop_iteration: 1
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

- [x] `app/apps-script/` : réaliser stories 1.1–1.3, extensions 3.1–3.4 et 4.1–4.3 ; import privé stable source→ID sans écrasement, champs publics dérivés, anti-abus, secours 5 min et diagnostics ; garder budgets TEST.
- [x] `app/web/` : réaliser 2.1–2.3 et parcours 3, finition 5.1 ; reproduire maquettes approuvées, programme avant dates, sélection initiale/routage/retours, clavier/mobile et confidentialité.
- [x] `app/scripts/`, `.github/workflows/` : démarrage/build portable configuré Google, CI dès premier push applicatif, contrôle sécurité et export tableur typé vérifiable.
- [x] `app/tests/` : compléter les 52 scénarios d’epics pertinents, matrice, concurrence/limites/cadence/charge, transport, erreurs, accessibilité et navigateurs disponibles ; aucune simulation exposée au public.
- [x] `app/README.md`, `docs/project/guide-google.md` : démarrage, tests, gestion/export/nettoyage, installation TEST, retour compatible sans restauration de données.

Critères : étant donné chaque story 1.1–5.4 et ses AC dans epics.md, lorsque réalisée dans la cible locale + Google TEST, alors son comportement et ses preuves sont traçables ; publication/remise publique exclues par GO courant. Les vérifications Google réelles sont exécutées par l’orchestrateur via Computer Use après candidat local ; elles ne sont pas remplacées par les tests simulés.

## Implementation Notes

Réalisation e3eab026 vérifiée :99tests Node et156parcours sur quatre projets, dont20contrôles accessibilité/32scans axe ; deux CI vertes. Google réel version6, import/rejeu24/24,216champs source et5inscriptions historiques préservés. Dernière place concurrente/reprise, reconfirmation09h30, trois réceptions participantes et trois internes, ICS Google Calendar hiver/été vérifiés. Dix éditions <27s ; correction supplémentaire de performance des déclencheurs en cours avant remise. Patch public de présentation Ergonomie aligné sur les24maquettes, sans modifier les données privées.

Préparation acceptée par GO et audit readiness PASS ; aucune question métier restante. Source intégrale privée, extraction publique sans formateurs. Implémentation déléguée peut répartir backend et frontend entre agents avec fichiers distincts, puis intégrer/tester. Ne pas commiter/pousser depuis les agents enfants : l’orchestrateur assure jalons, Google, Linear, revues et remise. Modifications préparatoires identifiées attendues. Priorité à conserver les garanties du prototype.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence and route |
|---|---|---|
| B1 Capacity initialized only with ID | medium | Choosing a formation after a row already received its cohort ID leaves the default blank. Patch: track first capacity initialization independently, preserve subsequent manual edits. |
| B2 Cleanup removes dedupe identity | medium | Future confirmed reservations can retain a place after email erasure, defeating duplicate checks. Patch: refuse erasure that preserves a future confirmed reservation; documented retention cleanup remains available after the event or cancellation. |
| B3 Explicit description loses audience | medium | The public splitter removes an audience paragraph even when a custom description wins. Patch: preserve all source text in that case. |
| B4 Overlapping reads restore stale data | medium | Focus/manual refresh may overlap a pending GET; later completion can overwrite newer state. Patch: serialize/coalesce catalogue reads with a browser regression. |
| B5 Original source date omitted from journal | medium | source_date is extracted but not retained by the Google mapping, although original workbook remains private. Patch: preserve original wording in private import metadata without inventing a session or changing existing IDs/fingerprints. |
| B6 Export symlink escapes private guard | high | Lexical path.resolve accepts an external symlink into the repository. Patch physical source/parent boundary validation. |
| B7 Trigger replacement removes recovery first | medium | Creation failure after deleting existing fallbacks removes the safety net. Patch: create replacement successfully before retiring old triggers. |
| B8 Guide has unusable JSON retrieval step | medium | Apps Script Run does not download returned export data. Patch guide around tested native Sheets XLSX download; remove unsupported retrieval claims. |
| B9 Privacy contact hardcoded | medium | Changing configured contact leaves policy instructions pointing elsewhere. Patch contact rendering from validated catalogue. |
| B10 Cleanup and claimed mail boundary | medium | Sender may already hold recipient data outside lock when cleanup returns. Atomic revocation was never guaranteed; patch guide and add interleaving test, preserving honest UNKNOWN status. |
| V1 New refusal receipts lack browser test | medium | Backend tests and pre-priced catalogue tests bypass validReceipt/handle. Patch browser submissions for rate_limited and price_unconfirmed, certainty/fields/new request. |
| V2 Extractor bypassed in tests | medium | Import fixtures do not execute workbook extraction; a swapped source column would remain green. Patch synthetic XLSX extraction and bad digest assertions. |
| E1 Privacy return after skip link | medium | privacyReturn records #main; returning focuses current privacy view instead of restoring registration. Patch restore view and route context together. |
| E2 Extreme month overflow | low | Manually supplied month9999-12 followed by Next reaches an invalid date. Patch direct bounded month navigation, no new feature. |
| E3 Export symlink escape | high | Same root cause and reproduction as B6. Group with B6 after independent verdict; one physical-boundary patch. |

| G1 Initialisation de capacité après flush interrompu | medium | Contre-revue E1 : une capacité explicitement saisie ne doit pas redevenir éligible au défaut après interruption puis effacement humain. Réservation complète avant mutations, cinq contrôles ciblés réussis. |
| G2 Budget natif de déclencheurs | medium | Mesures réelles : extrapolation prudente initiale54.37min >45min. Optimisation admin des écritures/listes/notes et nouvelles mesures requises avant clôture, sans cache d’admission ni changement de cadence. |

## Verification

`cd app && npm run verify` ; contrôles méthode/check ; suites navigateur/sécurité/accessibilité ajoutées. Google réel : identité TEST, budget avant/après, import/rejeu, édition→projection, inscription/reprise, courriels reçus et export réel. Aucune preuve acquise par la rédaction de cette spec.


## Clôture du parcours Build

Préparation a57ced60, réalisation e3eab026 et correction c5eca1e1 poussées sur la branche de travail. Revues natives et corrections achevées, y compris performance réelle et empreinte hors caches. Dernier candidat :103Node/156Playwright, build/sécurité/audit npm réussis ; CI push41129653830 et PR41129664647 réussies. Bundle Google TEST7/HEAD f8689f42a980ea8d1fecf0eaac47dbf47328dc88cb91ae2c7ba288ec1a9b85ee. Catalogue24/3, réceptions/ICS Google hiver/été, concurrence/reconfirmation/replay/annulation, intégrité historique, secours réel et budget41.2995min/j vérifiés. Retour compatible7→6→7 sans restauration de données ; onEdit conservé et TEST remis au repos12h.

La spec est done pour la réalisation de la cible autorisée,17stories BMAD review et22issues Linear Review relues après écriture ; epics BMAD in-progress jusqu’à acceptation globale. Projet Linear In Progress avant recette finale. Aucun Done humain, merge/main, publication Vercel/FTP ou PROD. Rapport final : docs/project/acceptance/V1-results.md ; limites de simulation/injection et contrôles humains explicités. Guide/adresse4173 remis. Le push documentaire de clôture suit son checkpoint Git/CI propre.
