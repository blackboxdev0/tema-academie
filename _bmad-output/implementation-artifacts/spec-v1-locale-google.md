---
title: 'V1 locale connectée à Google TEST'
type: feature
created: '2026-10-30'
status: in-review
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

### Reprise corrective autorisée du 30 octobre

Le GO actuel de Sofiane porte uniquement sur les neuf cases R1/R3/R4/R5/R6/R7/R8/R9/R11 ci-dessous, leurs tests et V1/V2. Les tâches initiales cochées sont conservées comme historique, sans recommencer import ni opérations Google. Les propositions UX/UI sont différées à un rapport visuel réalisé par l’orchestrateur. [Décision](../../docs/project/decisions/2026-10-30-correctifs-et-ux-differee.md).

Critères de cette reprise : étant donné chaque défaut et sa reproduction dans le rapport, lorsque sa transition est exécutée après correction, alors l’invariant attendu est assuré et un test de régression le vérifie. Cas à couvrir : note humaine avant/pendant/après diagnostic ; disparition de toutes les options ; capacité devenue invalide ; logiciel vide, doublon et libellé sans identifiant ; retour historique et politique après confirmation sans second POST ; focus ordinateur et mobile après rafraîchissement ; titre modifié puis accepté ; reconfirmation immédiate après une saisie assez longue ; libellé `constructor` valide sans collision.

Exécution locale uniquement pour cette reprise : conserver les garde-fous TEST, aucune consommation de budget mail, aucun déploiement. Convertir les preuves diagnostiques temporaires en assertions du comportement corrigé. R2 reste hors périmètre : isoler explicitement ce contrôle optionnel de la commande de validation du lot, sans le faire passer artificiellement. Garder la trace du défaut dans le rapport. Le GET15s et POST45s sont testés dans les navigateurs automatisés disponibles, sans assimiler WebKit à Safari installé.

Les modifications en cours avant ce GO sont les tests et documents du contre-audit, tous attendus. Le jalon de préparation est versionné par l’orchestrateur avant le dispatch. Ne pas commiter/pousser depuis l’agent de réalisation ; remettre les fichiers et résultats à l’orchestrateur. La revue native portera spécialement sur le delta depuis `0f3249feab56161a90f31984115683885f94e44d`, après la revue initiale déjà conservée ci-dessous.

### Review Findings — contre-audit du 30 octobre 2026

Les cases ci-dessous recensent les constats initiaux désormais corrigés localement ; les preuves historiques restent conservées. Audit transversal sans `story_key` unique : les stories affectées suivent leur statut réel, sans Done humain déduit. [Rapport et triage exhaustif](../../docs/project/acceptance/independent-audit-2026-10-30.md).

- [x] [Review][Patch] R1 Préserver les notes humaines pendant les diagnostics (`app/apps-script/google.js:275`).
- [x] [Review][Patch] R3 Retirer les options de formation devenues inexistantes (`app/apps-script/google.js:255`).
- [x] [Review][Patch] R4 Effacer le calcul de places lorsque la capacité est invalide (`app/apps-script/engine.js:350`).
- [x] [Review][Patch] R5 Fournir les diagnostics privés des logiciels invalides (`app/apps-script/google.js:301`).
- [x] [Review][Patch] R6 Restaurer le résultat connu après retour sur la route d’inscription (`app/web/app.js:148`).
- [x] [Review][Patch] R7 Restaurer le focus sur le contrôle visible (`app/web/app.js:157`).
- [x] [Review][Patch] R8 Réactualiser le titre après reconfirmation (`app/web/app.js:249`).
- [x] [Review][Patch] R9 Éviter le refus anti-spam inexpliqué après relecture (`app/web/app.js:249`).
- [x] [Review][Patch] R11 Éviter les collisions de libellés avec Object.prototype (`app/apps-script/engine.js:103`).
- [x] [Review][Patch] V1/V2 Expirations POST45s/GET15s exécutées sur Chromium ordinateur/mobile, Firefox et WebKit automatisés ; aucune preuve Safari installé déduite.
- [x] [Review][Patch] V3 Exécuter le bundle Code.gs construit et intégrer ce contrôle après build ; réussi en adaptateur simulé.

#### Rejected

- R2 — low : réparation du seul affichage calculé `Paramètres.choix` après écriture manuelle ; anomalie reproduite, sans conséquence démontrée sur les références ou le catalogue. Durcissement optionnel.
- Installation vide avec cases décochées — low : défaut du helper historique reproduit, mais non utilisé pour cette recette sur TEST peuplé ; reprise initiale à revoir seulement si requise.
- Catalogue sans `softwares` — low : fragilité prouvée sur réponse injectée, producteur actuel ne générant pas cette forme ; durcissement de schéma non imposé pour cette seule injection.

### Réalisation initiale

- [x] `app/apps-script/` : réaliser stories 1.1–1.3, extensions 3.1–3.4 et 4.1–4.3 ; import privé stable source→ID sans écrasement, champs publics dérivés, anti-abus, secours 5 min et diagnostics ; garder budgets TEST.
- [x] `app/web/` : réaliser 2.1–2.3 et parcours 3, finition 5.1 ; reproduire maquettes approuvées, programme avant dates, sélection initiale/routage/retours, clavier/mobile et confidentialité.
- [x] `app/scripts/`, `.github/workflows/` : démarrage/build portable configuré Google, CI dès premier push applicatif, contrôle sécurité et export tableur typé vérifiable.
- [x] `app/tests/` : compléter les 52 scénarios d’epics pertinents, matrice, concurrence/limites/cadence/charge, transport, erreurs, accessibilité et navigateurs disponibles ; aucune simulation exposée au public.
- [x] `app/README.md`, `docs/project/guide-google.md` : démarrage, tests, gestion/export/nettoyage, installation TEST, retour compatible sans restauration de données.

Critères : étant donné chaque story 1.1–5.4 et ses AC dans epics.md, lorsque réalisée dans la cible locale + Google TEST, alors son comportement et ses preuves sont traçables ; publication/remise publique exclues par GO courant. Les vérifications Google réelles sont exécutées par l’orchestrateur via Computer Use après candidat local ; elles ne sont pas remplacées par les tests simulés.

## Implementation Notes

Historique — première passe corrective avant contre-revue, après préparation224c598 : R1/R3/R4/R5/R6/R7/R8/R9/R11 réalisés ; 103tests Node historiques,18assertions administratives, deux assertions UI VM,176Playwright sur quatre profils réussis. Build/sécurité et sept contrôles bundle portables réussis ; deux ICS privés ignorés explicitement. Dernier ajustement backend de reprise après flush diagnostique interrompu couvert par la relance Node/audit/build/bundle ; frontend inchangé depuis la matrice. R2 conservé rouge dans `test:audit-optional`, hors `verify`, aucune correction revendiquée. Aucun appel Google, mail, déploiement, commit ou push par l’agent de réalisation. Rapport de contre-audit complété ; revue native et checkpoint de l’orchestrateur restent à terminer, statut alors conservé in-progress. Le checkpoint courant figure en fin de document.

Réalisation e3eab026 puis correctif final c5eca1e1 vérifiés :103tests Node et156parcours sur quatre projets, dont20contrôles accessibilité/32scans axe ; CI push/PR vertes. Google réel version7, import/rejeu24/24,216champs importés et24mentions de date source préservés, cinq inscriptions historiques strictement identiques. Concurrence/reprise, reconfirmation09h30, trois confirmations+trois avis reçus, deux ICS importés dans Google Calendar hiver/été. Dix éditions finales maximum26.677s, secours réel4min45 et budget prudent41.2995min/j≤45 après correction. Retour compatible7→6→7 vérifié ; TEST au repos12h/onEdit conservé. Catalogue public final24/3, quatre nouvelles réservations annulées sans suppression ; budget8/16 et quota94. Le rapport final distingue chaque preuve réelle, locale, injectée et humaine réservée. Patch public de présentation Ergonomie aligné sur les maquettes sans modification de la source privée.

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

### Contre-revue du lot correctif

Les trois couches natives Build ont lu le diff de la baseline historique conservée, avec priorité au delta depuis `0f3249fe`. La spec figure aussi dans ce diff documentaire : la séparation stricte des claims de la couche cas limites est donc imparfaite et n’est pas revendiquée. Chaque constat ci-dessous a été vérifié avant regroupement ; les scénarios sont locaux/simulés, sauf parcours navigateur exécutés avec réseau simulé.

| Origine / constat | Verdict | Preuve et route |
|---|---|---|
| Blind C1 — R3 liste vide interrompue puis restaurée | medium | Retrait natif simulé suivi de flush interrompu laisse les anciens checkpoints ; restaurer exactement la formation peut sauter la réparation. Patch : invalider les checkpoints avant mutation et tester reprise. |
| Blind C2 — R5 ligne invalide effacée | medium | Notes limitées à la plage des valeurs encore présentes ; le modèle de ligne vidée conserve le diagnostic hors plage. Patch : traiter aussi les lignes vides de la zone de notes, en préservant les notes humaines. Comportement Google natif distinct, non prouvé ici. |
| Blind C3 — R7 contrôle devenu désactivé | medium | Bouton visible mais disabled sélectionné ; focus échoue et BODY devient actif. Patch : exclure le contrôle non focalisable et utiliser le titre de repli. |
| Blind C4 — états documentaires contradictoires | low | Anciennes sections de rapport et clôture Build paraissent encore actuelles. Correction de checkpoint documentaire par l’orchestrateur : marquer explicitement l’historique et présenter un état courant unique ; aucune réécriture du contrat figé. |
| Edge C1 — R5 setNotes interrompu | medium | L’écriture des notes précède le try/catch invalidant le digest admin ; setNotes écrit puis échoue, restauration exacte et patches:0 laissent la note. Patch : invalider avant toute mutation de réconciliation et contre-test d’interruption plus précoce. |
| Edge C2 — R7 dernière place disparue | medium | Reproduction Chromium avec API simulée : nouveau bouton disabled, activeElement BODY. Regroupé avec Blind C3 après vérification individuelle. |
| Verification C1 — R6 nouvelle sélection après succès non couverte | medium | Mutation supprimant knownResult=null produit une fausse confirmation de B alors que seule A est inscrite ; la suite existante ne changeait pas de sélection après succès. Patch de test : A réussie → B → politique → retour, formulaire B et une seule inscription A. |
| Verification C2 — R5 setNotes interrompu | medium | Reproduction indépendante même frontière avant le catch ; ancien test ne coupait qu’au flush. Regroupé avec Edge C1 après vérification individuelle. |

Toutes les corrections retenues restent dans les neuf comportements approuvés. Aucun changement métier ni amélioration UX facultative n’est introduit.

## Verification

`cd app && npm run verify` ; contrôles méthode/check ; suites navigateur/sécurité/accessibilité ajoutées. Google réel : identité TEST, budget avant/après, import/rejeu, édition→projection, inscription/reprise, courriels reçus et export réel. Aucune preuve acquise par la rédaction de cette spec.


## Clôture initiale du parcours Build — historique

Préparation a57ced60, réalisation e3eab026 et correction c5eca1e1 poussées sur la branche de travail. Revues natives et corrections achevées, y compris performance réelle et empreinte hors caches. Dernier candidat :103Node/156Playwright, build/sécurité/audit npm réussis ; CI push41129653830 et PR41129664647 réussies. Bundle Google TEST7/HEAD f8689f42a980ea8d1fecf0eaac47dbf47328dc88cb91ae2c7ba288ec1a9b85ee. Catalogue24/3, réceptions/ICS Google hiver/été, concurrence/reconfirmation/replay/annulation, intégrité historique, secours réel et budget41.2995min/j vérifiés. Retour compatible7→6→7 sans restauration de données ; onEdit conservé et TEST remis au repos12h.

Au checkpoint initial, la spec était done pour la réalisation de la cible autorisée,17stories BMAD review et22issues Linear Review relues après écriture ; epics BMAD in-progress jusqu’à acceptation globale. Projet Linear In Progress avant recette finale. Aucun Done humain, merge/main, publication Vercel/FTP ou PROD. Rapport final : docs/project/acceptance/V1-results.md ; limites de simulation/injection et contrôles humains explicités. Guide/adresse4173 remis. Le push documentaire de clôture suit son checkpoint Git/CI propre.

## Checkpoint correctif courant

Neuf correctifs et V1/V2 réalisés ; contre-revue native traitée et vérification complète finale réussie : 103 Node, 21 régressions administratives, 2 transitions VM, 9 contrôles bundle/ICS, 184 parcours navigateur. R2 reste volontairement hors lot et rouge. Les propositions UX sont seulement illustrées. La spec globale reste `in-review` : application à Google TEST et contrôles natifs/recette encore ouverts, donc pas de clôture globale déduite du parcours local. [Rapport courant](../../docs/project/acceptance/corrections-2026-10-30.md).
