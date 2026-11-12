---
title: 'Raccorder le site local à la copie administrable'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'dispatch'
baseline_commit: 'e95c5025409d4395956db366ddf960418785c26f'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="GO Sofiane du 4 novembre : relier la copie au site puis tester en profondeur">

## Intent

Le site local lit encore l’ancien TEST. Le raccorder à la copie présentée au client pour recetter réellement catalogue, ajout de sessions et inscriptions avec le même moteur validé.

## Boundaries & Constraints

**Toujours :** source unique : copie `10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8`, script `1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA`. Préserver sections, boutons, filtres et 28 formations/12 sessions/9 inscriptions. Tests sur ajouts identifiés, comparaison par ID. Garde IDs + environnement COPY. Quotas et destinataires privés ; budget mail initial zéro avant accord distinct. Cache isolé par URL, validation fraîche avant confirmation.

Accord distinct reçu le 4 novembre : Sofiane autorise l’activation Google/permissions dans la copie puis les tests ; maximum trois nouvelles inscriptions avec envoi et six courriels, exclusivement vers les boîtes déjà autorisées. Ancien TEST/PROD et leurs compteurs restent préservés.

**Jamais :** modifier ancien TEST/PROD, appliquer le réparateur plat historique, supprimer les données existantes, journaliser des personnes, commiter/pousser ou publier le site. L’agent réalise code/tests locaux ; le pilote réalise Google et recette après autorisations requises.

## I/O & Edge-Case Matrix

| Scénario | État | Résultat | Erreur |
|---|---|---|---|
| Lecture | Trois sections, dates natives ou numériques typées | Même contrat public, places recomptées | Schéma ambigu : indisponible |
| Admission | Session fraîche, champs et accord valides | Une ligne source ; compteur cohérent | Plein/fermé/modifié : refus existant |
| Reprise | Même UUID ou payload modifié | Reçu identique ou conflit, aucun doublon | Pas de second mail |
| Concurrence | Dernière place, deux requêtes | Une seule confirmation | BUSY réessayable |
| Courriels | Budget absent/zéro ou destinataire interdit | Inscription conservée, envoi bloqué | Aucun élargissement implicite |
| Vue | Écriture web, rendu lent ou échoué | Source immédiate, vue signalée puis recalculée | Admission conservée |
| Isolation | Autre script/classeur, configuration manquante | Échec fermé | Aucune écriture |

</frozen-after-approval>

## Code Map

- `app/apps-script/engine.js` : réutiliser moteur pur. `google.js`, `catalogue.js` : référence quotas/lecture, exclure garde TEST et réparation plate.
- `app/experiments/admin-sheet-{prototype,actions,registrations}.gs` : sections, lignes physiques, boutons, vue. DocumentLock incompatible webapp. Inscriptions : 29 colonnes. `build-admin-sheet-actions.cjs` : bundle privé HTML/images à conserver.
- `app/scripts/{build,serve,real-read}.cjs`, `app/tests/browser/*`, `app/web/app.js` : build revient à TEST sans variable ; tests interceptés non probants pour Google réel.

## Tasks & Acceptance

**Execution :**
- [x] `app/experiments/copy-backend.gs` et tests : GET batch/POST/store ; sections, en-têtes nommés, dates typées, lignes physiques ; garde IDs ; budget nul par défaut, compteurs privés persistants sans reset, sécurité/rate limits existants.
- [x] Modules administratifs : ScriptLock commun aux écritures source, sans imbrication ; schéma déplacé pris en charge ou refusé avant mutation ; cohérence logiciel/section et URL. Vue hors verrou d’admission sous UserLock propriétaire : version sale avant écriture, acquittement après rendu cohérent. Actualisation manuelle/onOpen et trigger minute idempotent, sans installation par l’agent. Collaboration hors recette.
- [x] Constructeur COPY : moteur+modules+backend, manifeste requis, fichiers privés ; profil local persistant avec URL explicite, aucun repli silencieux TEST. Préparer sauvegarde code/manifeste et récupération vers TEST.
- [x] Tests : matrice, DST/nombres non typés, formule injectée, annulation/compteur, rendu concurrent, régression boutons/vue. Recette navigateur sans interception, garde URL COPY, fixtures marquées et assertions par ID, sorties sans personnes.

**Acceptance Criteria :**
- Étant donné le profil COPY actif, quand le site est reconstruit, alors il conserve cette cible et le cache ne reprend pas les données TEST.
- Étant donné une formation et trois sessions ajoutées dans la copie, quand Google répond fraîchement, alors le site les montre sans republication.
- Étant donné les données initiales, quand les tests finissent, alors elles sont préservées hors compteurs dérivés ; seuls les ajouts sont fermés/annulés/dépubliés.
- Étant donné Google autorisé et installé, quand la recette s’exécute, alors rapport distingue simulation, navigateur réel, source, mails envoyés/reçus, temps et limites.

## Implementation Notes

Export privé : 28/12/9 lignes compatibles moteur. Le pilote conserve Google, recette réelle, documentation et Linear.

Préparation locale réalisée : backend COPY, normalisation et gardes ; ScriptLock source / UserLock propriétaire ; version sale et trigger minute sans rendu propre ; profil persistant, constructeur privé et sauvegarde ; runner navigateur réel préparé sans interception. Le pilote a complété tests profil/bundle et rendu concurrent. À ce checkpoint antérieur, installation Google et critères réels restaient en attente ; la remise Google ci-dessous donne le résultat courant.

Historique avant activation — checkpoint local : 114 tests standard +158 expérimentaux verts ; build/sécurité, 7 contrôles bundle/ICS, 21 régressions et 2 preuves VM verts (2 ICS privés absents ignorés). Matrice 276/284, huit contrastes préexistants seuls échecs. Revue intégrée et contre-vérifications closes après patches ; un défaut historique préexistant différé. Accès Google rétabli, code/manifeste/export sources sauvegardés et vérifiés ; activation Sheets API v4/permissions/déploiement en attente de confirmation imposée par l’outil. Statut maintenu in-progress : critères Google réels non exécutés. Aucun commit/push.

## Spec Change Log

## Review Triage Log

| Couche / constat | Verdict et preuve | Route |
|---|---|---|
| Blind 1 — format monétaire reconnu date | medium : nativeType voit le D de CAD ; lecture native/batch divergente. | patch : retirer littéraux/crochets et reconnaître des jetons temporels |
| Blind 2 — événement humain et verrou occupé | medium : le changement humain précède le verrou ; BUSY empêche le signal dirty. | patch : invalidation avant acquisition, sans écrire la source |
| Blind 3 — période après début de session | medium : versions égales ne voient pas le passage du temps. | patch : prochaine échéance au début futur, bornée par audit 5 min |
| Blind 4 — suppression structurelle sans événement valeur | medium : le seul signal dirty ne détecte pas ces changements. | patch : audit périodique des sources, même si versions égales |
| Blind 5 — attente du rendu invisible | medium : propriété dirty privée, ancien tableau sans avertissement avant timer. | patch : avertissement local sous verrou de vue sans attendre le rendu |
| Blind 6 — titre historique selon ordre des participants | medium : confirmé dans project, code préexistant au raccordement ; aucun cas dans les 9 lignes actuelles. | defer : règle de choix du titre historique à cadrer |
| Blind 7 — sharp absolu | medium : constructeur indisponible hors cache personnel et tests non portables. | patch : dépendance de développement locale verrouillée |
| Blind 8 — URL COPY auto-attestée | medium : le runner compare deux valeurs locales issues du même choix. | patch : exiger avant POST un relevé indépendant du déploiement Google et du hash natif |
| Blind 9 — artefact TEST annoncé avec profil COPY | medium : build produit google.js dans le chemin standard. | patch : nommer explicitement la référence TEST sous COPY |
| Blind 10 — cache partiellement validé | low : valeurs corrompues peuvent apparaître, mais try/catch au démarrage permet toujours la lecture fraîche et la confirmation attend Google. Préexistant, corruption locale peu probable ; validation complète disproportionnée ici. | rejet selon règle low/complexité |
| Vérification 1 — suites hors contrôle standard | medium : tests COPY/admin exécutés manuellement mais absents de verify/CI. | patch : commande déterministe portable intégrée |
| Vérification 2 — chemin minute sale non exécuté | medium : mutation supprimant refresh reste verte ; mock TemaCopy séparé ne prouve pas l’intégration. | patch : vrais modules dans un même harnais, admission puis minute et acquittement |
| Edge — autre éditeur et filtres | false dans la cible : copie privée propriétaire unique ; aucun autre éditeur n’accède à ce parcours. Limite à conserver avant partage futur. | rejet, limite documentée |
| Edge final — session débutant pendant le rendu | medium : l’échéance recalculée après rendu oubliait le début désormais passé, puis le hash inchangé empêchait la reprise. | patch : modèle et échéance au même instant ; conserver une échéance expirée pour la minute suivante, test du franchissement pendant flush |

## Verification

- `app` : `npm test` ; `node --test experiments/*.test.cjs` ; build COPY, sécurité/artifact et matrice navigateur. Signaler les échecs préexistants.
- Google réel : URL COPY vérifiée, exports privés avant/après, permissions/récupération ; mails uniquement sous enveloppe autorisée.

## Correctifs révélés par la recette Google

Lecture des formats bornée aux cellules temporelles numériques, lecture native paresseuse des formats, lecteur groupé typé réutilisé pour les lectures fraîches d’admission (aucun cache serveur), flush natif avant lecture API des compteurs, source validée réutilisée par le suivi. La recette réelle a exposé un dépassement GET de 15 s et un POST initial interrompu ; ne pas les compter comme réussites. Candidat COPY v4 installé et relu ; la recette finale et la préservation restent en cours. Cinq tests de régression additionnels passent. Le runner conserve le payload/UUID avant réponse pour permettre une reprise sûre après interruption et recharge explicitement le document pour le scénario cache/formulaire.

## Remise technique après Google réel

Raccordement réalisé et recette bornée exécutée, voir le rapport courant. 117 tests standard/170 expérimentaux, quatre profils GET/cache Google réels, trois admissions, une concurrence RECORDED/FULL, refus et rejeu annulé vérifiés. Code natif COPY v5 relu ; sources initiales28/12/9 et paramètres intacts. Ajouts de recette seuls dépubliés/fermés/annulés. Budget3/6 épuisé, cinq messages reçus vérifiés. Réception du sixième externe, contenu/import ICS et acceptation humaine ouverts ; deux états d’envoi antérieurs SENDING conservés sans renvoi malgré réception. TEM-27 reste In Progress. Aucun commit/push conformément à la restriction humaine de ce chantier.

### Revue complémentaire des correctifs de recette

| Couche / constat | Verdict et preuve | Route |
|---|---|---|
| Blind — instantanés 11/12 colonnes | medium : largeur native non complétée différente de l’audit fixe ; audit inchangé sali à tort. | patch : remplir13/12, audit sans écriture vérifié |
| Edge — colonne12 optionnelle absente | medium : même cause reproduite sur la cadence5min. | patch commun, contre-test1/1 vert |
| Blind — sauvegarde POST écrasée au relancement | medium : ancien UUID pouvait être perdu après interruption. | patch : refus avant lancement si sauvegarde existante, capture protégée ; test du vrai runner |
| Blind — chemin natif devenu non exercé | medium : service.catalogue réutilisait désormais l’API. | patch : appeler nativeRead indépendamment, formats bornés et nombres non typés vérifiés |
| Blind — API simulée partageant les tableaux natifs | medium : instantanés et visibilité après flush non prouvés. | patch : clones, séries numériques, écritures natives invisibles avant flush |
| Blind — erreurs hors lecture fraîche/post-insertion | medium : seul le premier appel échouait dans le test. | patch : défauts au second snapshot, aux métadonnées et après insertion, admission/reprise préservées |
| Vérification — options de rendu supprimables sans échec | medium : mutation en mémoire entièrement verte. | patch : fixture typée et dates numériques, mutation désormais28échecs/47ciblés |
| Vérification — capture pré-réponse non exercée via runner | medium : helper seul ne détectait pas son retrait du runner. | patch : vrai runner en VM jusqu’au POST puis interruption ; mutation échoue,3/3contrôles verts |
