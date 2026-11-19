---
title: Candidat de production Tema isolé et vérifiable
created: '2026-11-18'
status: done
baseline_commit: bb178e722b1f3861561046a08ba4a57b93040494
route: dispatch
review_loop_iteration: 0
context: []
---
<frozen-after-approval>
## Intent
Sofiane autorise la préparation du Sheet et du site de production : textes destinés aux participants, limites d’envoi durables et restauration automatique des en-têtes. Tout doit être testé avant publication. Le livrable est un candidat isolé, pas une mise en service.

## Boundaries & Constraints
Conserver24formations sans dates, contenus/tarifs et rose #FF008F. Réutiliser l’admission durable, le worker autonome, les consentements versionnés et le refus des doublons. Ni migration ni écriture dans les ressources COPY/TEST actuelles ; créer une copie de préparation, distincte et privée. Ne publier aucun site/endpoint anonyme, ne modifier aucun accès, ne déployer ni fusionner sans leur autorisation propre. Aucun nouveau courriel réel sans budget de recette explicite. Les vérifications indisponibles restent ouvertes. Ne pas prétendre que la rédaction d’une politique vaut validation juridique/client. Pas de commit ou push pour cette tranche sans demande actuelle.

## I/O & Edge-Case Matrix
| Cas | Comportement attendu |
|---|---|
| Construction production explicite | Bundle privé lié aux nouveaux IDs et profil web distinct ; ancien COPY/TEST refusé, aucun basculement implicite |
| Catalogue sans session |24fiches et Dates à venir ; pas de date inventée ni inscription active |
| Textes production | Pas de TEST/COPY/inscription fictive dans les surfaces participant ; accord et politique cohérents/versionnés, contacts validés conservés |
| Envoi disponible | Réservation durable puis réclamation atomique et courriel hors verrou ; état et tentative empêchent le doublon |
| Plafond/quota épuisé avant tentative | PENDING différé, réservation conservée, reprise du worker quand le budget le permet |
| SENDING/UNKNOWN/FAILED/BLOCKED | Aucun réarmement automatique ni renvoi au rejeu, même après renouvellement du budget |
| Titre d’en-tête effacé/remplacé | Restaurer les cellules d’en-têtes connues, puis traiter les lignes métier du collage |
| Ligne/colonne déplacée ou supprimée | Ancres suivies ou diagnostic sûr ; jamais réétiqueter/écraser une ligne métier par hypothèse |
| Modification concurrente | Relecture/version/pending préservés, pas de garantie transactionnelle d’édition humaine |
</frozen-after-approval>

## Code Map
- `app/scripts/local-profile.cjs`, `build.cjs` : profils/exports web explicites.
- `app/experiments/build-copy-backend.cjs`, `copy-config.gs`, `copy-backend.gs` : bundle/gardes et budget privé.
- `app/experiments/admin-sheet-{prototype,registrations,actions}.gs`, `admin-native-form.gs` : cibles et insertion/édition ; inclure SaisieNative.
- `app/apps-script/engine.js` : `sendChannel` bloque actuellement toute erreur budget.
- `app/web/index.html`, `app.js` : libellés/politique TEST en dur.
- `app/experiments/copy-helpers.cjs`, suites profils/COPY/browser : harness à étendre.

## Tasks & Acceptance
- [x] Profil/builder PRODUCTION explicite, IDs distincts, sorties privées/hashes/retour ; démo intacte.
- [x] Textes et politique production versionnée ; contact Tema, conservation12mois retenue. Validation client avant publication, pas de conformité juridique déduite.
- [x] Budget indépendant borné sur24h :80destinataires maximum, réserve5sur quota Google réel, paramètres explicites. Pas de plafond de campagne ni registre illimité. Refus temporaire avant tentative : PENDING différé. Propriétés COPY préservées.
- [x] Restaurateur production : photographie validée de7en-têtes, métadonnées lignes/colonnes, réparation avant parsing et secours minute. Ancre/structure ambiguë : diagnostic sans écriture devinée. Avertissements sur tous les bandeaux ; Places restantes masquée.
- [x] Copie candidate privée24/0/0, sans déclencheur d’envoi activé par copie ; sauvegarde et permissions contrôlées. Recette fictive isolée, aucun endpoint public créé.
- [x] Tests des lignes de matrice : identité, quota/renouvellement, panne, annulation/doublon/fermeture ; collage/insertion/suppression/colonnes/concurrence ; textes/cache et régression COPY. Tables natives Google à vérifier séparément.

### Critères d’acceptation
- Étant donné candidat et démo, quand construction/tests s’exécutent, alors seule la cible explicite est utilisable et les ressources actuelles restent intactes.
- Étant donné erreur d’en-tête ou plafond renouvelable, quand les traitements reprennent, alors données/réservation restent conservées sans doublon ni réarmement ambigu.
- Étant donné la remise, quand Sofiane l’examine, alors candidat, commande d’essai, preuves locales/réelles, réserves et publication séparée sont identifiés.

## Implementation Notes
GO utilisateur déjà donné pour la préparation et les tests ; pas de nouvelle approbation de routine pour ces choix techniques. L’implémenteur livre code/tests locaux ; l’orchestrateur traite ensuite la copie Google et les autorisations natives. Les documents locaux du nettoyage précédent sont identifiés et préservés. Branche de travail feat/production-candidate-20261118. Identités finales, autorisations Google, essais avec envoi et publication seront constatés à leurs étapes propres, jamais supposés par le builder.

Optimisation du secours autorisée après mesures natives du 18 novembre : le déclencheur et le poll mail restent chaque minute. À l’état propre, seul l’audit des en-têtes est espacé jusqu’à l’échéance de cinq minutes, avec un horodatage sans cache de données ; un événement manqué est donc repris au passage minute de cette échéance, sous réserve de l’ordonnancement Google. Pending administration/compteurs, écart source/vue ou transition temporelle due imposent un contrôle avant le poll mail. GET, POST et éditions installées contrôlent toujours les en-têtes à neuf. Les nouveaux temps d’exécution et le budget quotidien des déclencheurs restent à remesurer dans Google.

## Verification

Préparation isolée terminée :132tests standard,405expériences dont117production,20parcours production sur quatre profils réussis ; build/sécurité et21audit+2VM réussis. Matrice globale331/340 :8contrastes du rose conservé et1timeout clic Chromium, trois rejeux isolés réussis. Calendrier7PASS/2fixtures privées historiques indisponibles. Revues globales et ciblées exécutées, constats corrigés sans modifier la matrice figée.

Google réel : sept bandeaux et61ancres, déplacement/refus structurel, formulaire natif33,060s, admission4,393s, rejeu/doublon/annulation, deux courriels réellement reçus, doGet2,600s, édition UI et réparation Date réussies. Exports avant/après :24fiches identiques en13colonnes/types,0session/0inscription. Aucun helper restant, sources installées relues conformes.

Dernière correction idle : version/config/échéances uniquement, lecture groupée unique par invocation, source réelle dès que travail ou audit dû.405expériences et231contrôles ciblés/reproductions de concurrence réussis, pas de perte après snapshot. Chemin propre natif final1,518s, contre3,339s initialement ; aucune preuve24h ni quota quotidien suffisant déduite. Après recette : worker privé en pause et cadence12h, deux tentatives préservées, plafond0. Édition propriétaire et GET/POST inchangés.

[Rapport et reprise explicite](../../docs/project/acceptance/production-preparation-2026-11-18.md). Le done de cette spec porte sur la préparation, pas sur intégration main, validation client ou publication. Aucun commit/push demandé.

## Spec Change Log

## Review Triage Log

Revue initiale sur le diff privé7_cc7au8, tous les retours reçus avant triage. Chaque constat est vérifié sur ses appels/tests ; les doublons restent consignés individuellement. Toutes les corrections ci-dessous conservent les comportements de la matrice et les interfaces existantes ; aucune intention nouvelle ni modification du bloc figé. Regroupement après verdict : visuel natif, déclencheur natif, capture concurrente, capture interrompue, ligne métier ambiguë, position Inscriptions, quota engagé, chemins privés, protection native, historique sans catalogue, aperçu production, preuve GET, preuve récupération, performances natives.

| Constat | Verdict | Preuve et route |
|---|---|---|
| B1 visuel natif absent | medium | Le builder lit la source brute ; footer rejette l’absence du PNG défini uniquement par l’ancien builder dédié. patch, embarquer l’asset existant et tester son installation. |
| B2 reset sans déclencheur | medium | edited exige triggerUid ; la nouvelle copie n’a aucun déclencheur et la procédure ne crée que le minute. patch, installer explicitement le handler natif existant, sans doublon. |
| B3 capture concurrente | medium | schema valide le premier tableau puis relit les cellules sans vérifier leur cohérence ; un titre modifié peut devenir canonique. patch, validation et relecture avant acceptation. |
| B4 capture partielle | medium | Les ancres sont créées avant la propriété snapshot, et leur simple présence interdit la reprise. patch, retirer uniquement les artefacts créés par la tentative interrompue. |
| B5 ligne métier sans ID | high | La garde ne reconnaît que le motif ID ; les lignes nouvelles sans ID existent dans le parcours de collage et leurs cellules sont remplacées. patch, diagnostic sur les données métier ambiguës avant écriture. |
| B6 en-tête Inscriptions déplacé | medium | Le plan accepte sa ligne déplacée alors que table/registrationLayout exigent la ligne1. patch, diagnostic structurel explicite avant lecture/écriture. |
| B7 SENDING historiques | medium | Le compteur inflight n’a aucun horizon temporel, même après disparition de toute exécution. patch, borner les engagements actifs sans réarmer les lignes ambiguës. |
| B8 chemins symboliques | medium | path.resolve ne résout pas les liens réels et writeFile suit les liens existants. patch, vérifier les destinations réelles et refuser les redirections de fichiers. |
| B9 protection formulaire | medium | La branche production ajoutée rend toute la feuille warning-only, y compris K2:K9 ; la demande porte sur les en-têtes sources. patch, conserver la protection opérationnelle existante. Le propriétaire garde ses droits Google. |
| B10 historique sans catalogue | medium | applyRoute quitte pour toutes les routes sans catalogue sauf politique ; le retour navigateur garde donc la mauvaise vue. patch, retour catalogue explicite et test historique. |
| B11 aperçu mauvaise cible | medium | serve.cjs sert uniquement dist/web alors que le nouveau builder émet hors dépôt. patch, commande explicite d’aperçu du candidat construit, sans modifier la démo locale. |
| E1 ligne sans ID | high | Même ligne métier atteignable et effacée que B5 ; patch, groupe ligne ambiguë. |
| E2 asset natif | medium | Même footer inconditionnel que B1 ; patch, groupe visuel natif. |
| E3 reset natif | medium | Même condition triggerUid que B2 ; patch, groupe déclencheur natif. |
| E4 engagements anciens | medium | Même accumulation inflight que B7 ; patch, groupe quota engagé. |
| E5 symlink sortie | medium | Même comparaison lexicale que B8 ; patch, groupe chemins privés. |
| V1 GET non couvert | medium | Gap pré-vérifié : fixture navigateur appelle grouped directement, aucune assertion de réparation via doGet. Le test natif courant confirme le code, pas la protection contre une régression future. patch, intégrer la vraie frontière doGet. |
| V2 récupération non relue | medium | Gap pré-vérifié : seule présence du chemin contrôlée, aucun contenu/hash relu dans la suite production. patch, comparaison indépendante des trois fichiers. |
| V3 asset du bundle | medium | Reviewer a exécuté les deux fichiers générés : constant undefined, erreur de footer reproduite. patch, groupe visuel natif. |
| N1 latence native | high | Google réel : restauration7cellules26,463s, contrôle sans changement16,264s, doGet14,883s,24/0/0 intact et ancres insertion/suppression valides. Ces lectures répétées pénalisent chaque admission/catalogue. patch, lecture groupée des métadonnées et cellules sans affaiblir les gardes ; nouvelle mesure obligatoire. |


### Constats natifs supplémentaires

N2 : simple onEdit non autorisé à Sheets v4. Correction par le handler propriétaire installé ; vrai événement LIMITED et handler FULL terminés, Date réparé.

N3 : coût au repos mesuré3,339s. Corrections bornées : audit d’en-têtes propre cinq minutes, marqueur de file réellement vide, puis instantané groupé des indicateurs au début du worker. Aucune donnée métier dupliquée ni acquittement créé par le chemin court ; activité/config/pending/échéance reprennent le chemin complet. Tests de courses après scan/unlock/snapshot et revue ciblée sans constat. Natif final1,518s ; pause de préparation et cadence12h vérifiées après recette, reprise minute explicitement requise avant publication.

### Versionnement du 19 novembre

GO explicite de Sofiane pour commit/push du candidat sur la branche de travail, sans fusion/main ni activation Google. Nouvelle passe132standard/405expériences, build/sécurité,21audit+2VM et7calendrier portables réussis (2fixtures privées indisponibles). Aucun code applicatif ajouté depuis la recette ; la réserve de contraste et la bascule production restent ouvertes.
