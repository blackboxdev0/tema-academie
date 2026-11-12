---
title: "TEM-6 — Essai technique isolé du parcours d’inscription"
type: feature
created: 2026-10-26
status: done
route: dispatch
review_loop_iteration: 0
baseline_commit: 8217e5253055e6c669e0a154beee17ef3c4f814b
approval: owner-explicit-go-limited-trial
approved_on: 2026-10-26
linear_issue: TEM-6
context:
  - /Users/sofiane/Software/tema/AGENTS.md
  - /Users/sofiane/Software/tema/_bmad-output/specs/spec-tema-academie-v1/contrat-donnees.md
  - /Users/sofiane/Software/tema/_bmad-output/specs/spec-tema-academie-v1/plan-essai-technique.md
  - /Users/sofiane/Software/tema/_bmad-output/specs/spec-tema-academie-v1/strategie-tests.md
  - /Users/sofiane/Software/tema/_bmad-output/specs/spec-tema-academie-v1/ressources-services.md
---

<frozen-after-approval reason="périmètre et GO explicites de Sofiane le 26 octobre 2026">

## Intent

**Problème :** le dossier et les accès existent, mais le parcours navigateur/Google et l’intégrité d’une inscription ne sont pas éprouvés.

**Approche :** construire le prototype minimal sur TEST, exercer les douze ET approuvés et livrer un bilan factuel pour décider du transport. Sofiane demande explicitement ticket, fiche et lancement ; aucune nouvelle approbation du même périmètre n’est requise.

## Boundaries & Constraints

**Toujours :** une formation/deux sessions fictives, quatre onglets conformes au contrat V1, même moteur testé localement et dans Apps Script. Destination TEST fixe côté service ; propriétés et destinataires privés hors Git. Maximum dix inscriptions avec envois réels et vingt destinataires automatiques, contrôle persistant sous verrou et quota disponible. Confirmation après écriture ; email indépendant. Contrôles reproductibles, preuves réelles distinctes des simulations. Toronto/UTC, textes inertes, projection en liste blanche et aucun PII dans reçu.

**Jamais :** accès ou écriture métier, import des 24 formations, plateforme complète, achat, commit/push/fusion ou livraison publique. Aucun reset, mode d’injection ou sélection de destination accessible depuis HTTP. Repli B/C affectant UX présenté avant adoption. Aucun envoi à une adresse absente de la liste privée ; aucune permission Google sensible accordée sans confirmation requise.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Erreur |
|---|---|---|---|
| Lecture | Actives/inactives, ouvertes/fermées, confirmées/annulées | Liste blanche V1 et visibilité cohérente | Configuration ambiguë : indisponible |
| Réservation | Commande valide, dernière place concurrente | Une écriture sous verrou, instantanés, une place | FULL, BUSY ; inconnu jamais refus certain |
| Reprise | Même clé/contenu, clé/contenu différent, annulation | Reçu courant, aucun renvoi ou réactivation | RETRY_CONFLICT sans reçu |
| Conditions | Fermeture avant/après admission, révision/politique/début | Refus avant admission ; admise avant fermeture manuelle termine | Codes V1 ; autre session inchangée |
| Notifications | Lien présent/absent, erreur participant/globale, interruption | ICS et états honnêtes ; place maintenue, avis Tema si possible | Aucun renvoi ou troisième alerte |
| Sécurité/temps | Formule/HTML/CRLF, DST invalide/ambigu, faux environnement | Texte inerte ; heure unique ; échec fermé | INVALID/UNAVAILABLE sans données privées |

</frozen-after-approval>

## Code Map

- [Plan](../specs/spec-tema-academie-v1/plan-essai-technique.md), [contrat](../specs/spec-tema-academie-v1/contrat-donnees.md), [stratégie](../specs/spec-tema-academie-v1/strategie-tests.md) : sources approuvées, identifiants CAP/AC/ET conservés.
- [Registre](../specs/spec-tema-academie-v1/ressources-services.md) : ressources TEST distinctes du métier ; ne pas modifier le métier.
- `app/` absent au départ ; aucun code produit à reprendre. Artefacts du socle historique hors périmètre.
- Node 22.9.0/npm 11.7.0 présents ; Playwright 1.64.1 confirmé au registre, compatible Node>=20. Build statique Node minimal pour ce prototype (Vite8 requiert Node>=22.12).

## Tasks & Acceptance

**Exécution :**
- [x] `app/package.json`, lock et scripts — commande verify, build statique et serveur local de test ; aucun runtime serveur produit.
- [x] `app/apps-script/` — logique pure, adaptateurs Sheets/Lock/MailApp, JSON doGet/doPost, UTC/ICS ; garde TEST et plafond persistant ; fonctions d’installation privées à l’éditeur.
- [x] `app/web/` — catalogue minimal/deux dates, formulaire accessible, résultat/reprise V1 ; fetch POST simple A, aucune PII dans URL ou stockage durable.
- [x] `app/tests/` — cas de la matrice, adaptateurs simulés, contrats et parcours navigateur, même moteur et assertions métier ; intégration réelle séparée/explicite sans destinataires versionnés.
- [x] `app/README.md` — relance, configuration privée, upload Google par UI et retour de code compatible sans restauration Sheet.
- [x] `docs/project/technical-trial/TEM-6-results.md` — empreintes et douze ET PASS/FAIL/NON VÉRIFIÉ, observations services et limites ; captures/ICS hors dépôt.

**Critères :**
- Étant donné le candidat, quand verify est exécuté, alors logique/contrats/build/parcours passent avec version et nombre de cas réels.
- Étant donné les services TEST, quand l’essai est joué, alors chaque ET indique preuve réelle, simulation ou indisponibilité ; aucun contrôle requis absent n’est déclaré réussi.
- Étant donné le bilan, quand Sofiane décide, alors transport et limites sont explicites ; aucune réalisation principale n’est engagée automatiquement.

## Implementation Notes

Prototype et bilan remis : **61 tests Node et 28 E2E Chromium** verts, build réussi ; moteur Google partagé sans transformation. Trois couches de revue natives, correctifs bornés et vérification complète après patch. Google version 3/HEAD SHA-256 `34e7ab30766995dd62e7bb593042f2b514364a79ea673721c4e33049c0c4364c`, Vercel `5zNTif7SBSon5aEMm3RMoeEPb8Gf`, bundle servi identique. [Bilan des douze ET](../../docs/project/technical-trial/TEM-6-results.md) : quatre PASS et huit NON VÉRIFIÉ ; limites et preuves partielles explicites, aucun plan entièrement réussi annoncé.

Cinq inscriptions fictives conservées, budget5/10 et10/20, quota92 final ; réception présentielle attestée/capture, avis Tema reçus, deux imports Google hiver/été. Pannes injectées puis retirées, dates TEST fermées. Retour site/script/HEAD précédent puis rétablissement courant sans perte des cinq métadonnées de lignes/compteurs. Recalcul minute mesuré puis ramené12 h au repos ; cadence V1 à arbitrer, cible<2 min préservée. Métier exclu.

Le statut done décrit l’exécution Build du prototype et la remise du bilan, y compris les indisponibilités ; **TEM-6 reste In Progress** pour les vérifications requises et la décision de suite. Aucun GO principal. Préparation initiale indépendante conservée ; index Git réel non modifié, aucun commit/push autorisé ou effectué malgré l’action générique du workflow natif. L’agent d’implémentation a produit code/tests ; l’orchestrateur a vérifié les services et rédigé les preuves.

## Spec Change Log

## Review Triage Log

Trois couches natives exécutées (blind, edge, verification-gap), même capacité de modèle. Chaque constat classé avant regroupement ; aucune modification du contrat humain gelé.

| ID | Verdict | Preuve | Route |
|---|---|---|---|
| B1 | medium | Reçu errors:[null] accepté puis pending effacé avant exception ; lecture validReceipt/handle confirme la perte de reprise. | patch — reçu/reprise |
| B2 | medium | DUPLICATE désactive submit ; aucun écouteur de correction courriel ne le réactive dans le code. | patch — correction courriel |
| B3 | medium | finish applique les messages FAILED/BLOCKED de place conservée même quand reservation_status=annulee. | patch — message annulé |
| B4 | medium | Le regex HTTPS accepte une autorité vide ; le même lien est utilisé par makeMail/makeIcs sans autre garde. | patch — URL |
| B5 | medium | trialRefreshChoices ne modifie que les options ; les cellules existantes gardent les anciens libellés sous validation stricte. | patch — références affichées |
| B6 | medium | trialApplyControls protège autres IDs mais omet Paramètres.id/choix ; avertissements convenus absents. | patch — protections |
| B7 | medium | prepareAdministration ne diagnostique les formations sans code ASCII/IDs doublons ; seuls les diagnostics de sessions sont écrits. | patch — diagnostics privés de cellule |
| B8 | medium | nonempty utilise length brut ; dataView accepte des titres/durées/libellés composés d’espaces. | patch — texte obligatoire |
| B9 | medium | Le polling vérifie la section visible mais jamais document.hidden ; les onglets en arrière-plan consomment encore des lectures. | patch — visibilité document |
| B10 | medium | État de reprise en cours de mise à jour : features/ressources/config portent encore des faits initiaux ; à aligner au checkpoint avant remise. | patch — métadonnées par orchestrateur |
| E1 | medium | Même cause que B1 ; errors non typés déclenchent l’exception après perte de pending. | patch — reçu/reprise |
| E2 | medium | Même cause que B4 : hostname absent accepté en ligne et ICS. | patch — URL |
| E3 | low | La borne Number.isInteger admet des compteurs non sûrs ; incrémentation peut répéter un code. Correction directe de la garde existante suffisante. | patch — compteur sûr |
| V1 | medium | Gap pré-vérifié : remplacer la branche doPost valide par UNAVAILABLE laisse49 tests verts ; E2E contournent doPost. | patch — test handler HTTP réel simulé |
| V2 | medium | Gap pré-vérifié : retirer les conversions Date/heures natives laisse49 tests verts ; fixtures actuelles sont textuelles. | patch — tests cellules natives |
| V3 | medium | Gap pré-vérifié : retirer la corrélation request_id laisse10 E2E verts ; aucun reçu divergent testé. | patch — tests reçus divergents |
| P1 | medium | Essai Google reproduit : saisie4 dans F2,147 s après, J2 reste3 et K2 indique Capacité entière positive requise. installTrial force @ sur toute la ligne, y compris places_max. | patch — format numérique de capacité |
| P2 | medium | Premier POST Google : une inscription confirmée, deux SENT ; fin des envois16,746 s après le clic contre délai navigateur15 s. Reprise inchangée confirmée sans nouvelle place/envoi ; avis reçu dans Gmail Tema. | patch — délai POST45 s et régression à horloge contrôlée |
| P3 | medium | Concurrence réelle : deux BUSY pendant reconcile minute18,151 s ; chaque passage inchangé réécrit calculs/listes/notes sous le verrou d’admission. Durées11–19 s habituelles et pointe76,694 s constatées. | patch — empreinte privée des données administratives traitées, aucune mutation si identiques |
| P4 | low | Première optimisation excluait les cellules calculées de l’empreinte ; un écrasement manuel de J/K par le propriétaire pouvait empêcher leur réparation. Inclusion directe de leurs valeurs et régression ciblée. | patch — réparation des calculs puis passage inchangé sans écriture |

Regroupements : B1/E1 ; B4/E2. Autres racines distinctes conservées. Correctifs directs dans les validations/présentation/contrôles existants ; aucun nouveau contrat public ou état métier. B10 traité dans les métadonnées de l’essai par l’orchestrateur. Aucun constat différé ou rejeté.

## Verification

- `cd app && npm run verify` : logique/contrats/build et E2E locaux verts.
- Computer Use : enregistrer le candidat dans le projet TEST, examiner les autorisations, déployer la version TEST autorisée puis essayer le transport A et inspecter le Sheet/boîtes/agendas disponibles.
- Empreinte SHA-256 des sources si aucun commit ; bilan des ET et remontée des dépendances externes sans faux succès.
