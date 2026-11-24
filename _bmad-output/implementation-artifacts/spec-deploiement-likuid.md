---
title: 'Publication de Tema Académie chez Likuid'
type: chore
created: '2026-11-24'
status: in-review
route: dispatch
review_loop_iteration: 0
baseline_commit: 54a7a4a10799d1a0f653e7f9bfc1c92b2fc1bdfc
context:
  - 'docs/project/acceptance/vercel-production-preparation-2026-11-19.md'
---

<frozen-after-approval reason="périmètre demandé par Sofiane">

## Intent

**Problème.** Le sous-domaine Tema est créé chez Likuid et possède un certificat valide. Le site statique est encore servi par le candidat Vercel.

**Approche.** GitHub Actions vérifie chaque révision de `main`, génère le site avec le profil de production attesté et le publie sur `academie.temasolutions.ca`. La mise en ligne initiale utilise cette chaîne.

## Boundaries & Constraints

**Toujours.** Compte FTPS dédié au dossier Académie, TLS vérifié, secrets dans l’environnement GitHub de production, transferts sérialisés, vérification HTTPS avant et après bascule. Les écarts de contraste déjà acceptés restent visibles et la chaîne bloque les régressions supplémentaires. La fusion initiale garde son accord distinct.

**Périmètre.** Publier le build web. Le site emploie le même déploiement Google et le même classeur que le candidat. Les données, envois, réglages d’hébergement des autres sites et PR documentaire indépendante sont hors périmètre.

## I/O & Edge-Case Matrix

| Situation | Entrée ou état | Résultat attendu | Reprise |
| --- | --- | --- | --- |
| Première publication | `main` vérifié, dossier dédié | Accueil et ressources du même build servis en HTTPS | Retirer uniquement l’accueil installé si la vérification échoue |
| Mise à jour | Une version contrôlée est déjà active | Les anciennes ressources restent accessibles pendant la bascule | Restaurer l’ancien accueil en cas d’échec après activation |
| Transfert incomplet | Échec avant la bascule | L’accueil actif reste servi | Relancer la publication avec une nouvelle tentative |
| Ancienne exécution | Une autre révision est devenue `main` | L’ancienne exécution ne bascule pas l’accueil | La dernière révision suit sa propre exécution |

</frozen-after-approval>

## Code Map

- `app/scripts/build.cjs` et `production-target.cjs` produisent et valident le dossier web statique de production. Reprendre le contrôle des identifiants et le contrôle de sécurité documentés pour Vercel.
- `app/web/index.html` charge CSS, configuration, JavaScript et logo via des chemins relatifs. `app/web/app.js` navigue par fragments. Versionner les liens des ressources dans l’accueil généré.
- `.github/workflows/application.yml` lance la matrice et conserve le résultat de contraste strict. Le parcours Likuid utilise une exception limitée aux nœuds, états et couleurs déjà acceptés.

## Tasks & Acceptance

- [x] `.github/workflows/likuid.yml` — vérifier les candidats, limiter la publication à `main`, compiler en répertoire temporaire et utiliser les secrets de l’environnement production.
- [x] `app/tests/browser/accessibility.spec.cjs` — borner l’exception activée en CI Likuid et conserver l’audit complet en pièce jointe.
- [x] `app/scripts/publish-likuid.py` — transférer et vérifier les ressources versionnées, remplacer l’accueil atomiquement, vérifier et restaurer l’accueil en cas d’échec.
- [x] `app/tests/deploy/` — vérifier les quatre cas de la matrice sur des doubles de transfert, y compris la récupération lorsque l’accueil a été remplacé avant un échec.
- [x] `docs/project/acceptance/likuid-deployment.md` — documenter les réglages, la reprise, les preuves et les limites observées.
- Étant donné une vérification en échec, quand une révision atteint la chaîne, alors aucun accueil n’est activé.
- Étant donné une révision vérifiée de `main`, quand le transfert réussit, alors l’accueil public et ses ressources correspondent au build et le catalogue s’ouvre sur la source de production.
- Étant donné un incident pendant ou après la bascule, quand l’accueil actuel peut être identifié, alors conserver ou restaurer la dernière version valide.

## Implementation Notes

- Onze cas de transfert passent sur doubles. Un essai local FTPS et HTTPS avec curl a vérifié la première publication, la mise à jour et leurs reprises. Le build attesté contient neuf fichiers publics et sa configuration correspond au candidat déjà en ligne sur Vercel.
- Le compte Likuid, les secrets GitHub et la première exécution de production sont vérifiés au jalon de mise en service.
- Première mise en ligne réalisée avec le script FTPS pendant l’attente de fusion. Le commit de `main`, le contrôle HTTPS et la recette anonyme sont consignés dans le [rapport Likuid](../../docs/project/acceptance/likuid-deployment.md). L’exécution de production dans GitHub reste à vérifier.

## Spec Change Log

## Review Triage Log

| Couche et constat | Verdict | Suite ou preuve |
| --- | --- | --- |
| Aveugle — file d’attente unique | Moyen | Une relance périmée peut évincer l’exécution courante. Utiliser la file GitHub étendue. |
| Aveugle — catalogue et CORS | Moyen | La tâche GitHub vérifie les fichiers. La recette de la première mise en ligne comprend un essai navigateur anonyme sur le domaine final. |
| Aveugle — accès HTTP | Moyen | Redirection activée pour ce seul domaine dans cPanel et réponse 301 vérifiée. |
| Aveugle — nouvelle référence locale non versionnée | Moyen | Faire échouer la préparation avant transfert dans ce cas. |
| Aveugle — lecture FTP éloignée de la bascule | Moyen | Rapprocher la lecture FTP de l’activation. Suspendre les exécutions avant une intervention manuelle. |
| Aveugle — écrasement FTPS non testé chez Likuid | Moyen | Transfert isolé, renommage d’un sous-dossier vers un fichier temporaire existant et lecture HTTPS vérifiés sur le serveur. Sonde retirée. |
| Aveugle — accumulation des versions | Faible | Conserver les versions de retour. Le build actuel pèse environ 196 Kio. Éviter une purge automatique du dossier public et retirer le temporaire lors d’un abandon connu. |
| Cas limites — modification manuelle après lecture | Moyen | Rapprocher la comparaison de la bascule et documenter l’exclusion des changements manuels pendant une exécution. |
| Cas limites — modification manuelle pendant restauration | Moyen | Préparer la copie de restauration puis relire l’accueil actif avant de la renommer. |
| Cas limites — progression de main pendant activation | Moyen | Revérifier la révision après renommage et restaurer si elle a changé. |
| Cas limites — succès GitHub pour run périmé | Moyen | Quitter avec une conclusion non réussie et un message explicite si la publication est ignorée. |
| Cas limites — récupération consomme le fichier de référence | Moyen | Garder le fichier de référence et renommer une copie vérifiée. |
| Cas limites — temporaire après abandon | Faible | Retirer uniquement le fichier de staging confirmé de cette exécution. |
| Cas limites — nouvelle référence locale ignorée | Moyen | Le test de build rejette cette situation avant transfert. |
| Cas limites — des révisions de main sont évincées | Moyen | File étendue officielle et gardes de fraîcheur. |
| Cas limites — le catalogue peut être indisponible | Moyen | La recette navigateur initiale vérifie le catalogue de production en lecture seule. |
| Vérification — profil valide sans URL | Moyen | Couvrir le cas de l’URL absente et le build attesté. |
| Vérification — exception de contraste trop large | Moyen | Tester une variante de couleur ou de ratio du même nœud. |
| Vérification — obligation de TLS | Moyen | Couvrir le garde de transport et vérifier FTPS authentifié chez Likuid. |
| Vérification — type MIME incorrect mais octets corrects | Moyen | Couvrir le refus de bascule. |
| Vérification — lecture de la tête distante | Moyen | Couvrir une tête distante différente de la copie locale. |

## Design Notes

- Employer curl et un fichier netrc temporaire de mode 0600 pour FTPS explicite sur `cpamg12.likuid.com:21`. Valider les noms publics et vérifier les octets servis depuis le sous-domaine. Compte cloisonné à cette racine. Ne supprimer aucun fichier étranger.
- Publier l’ensemble vérifié sous `/_releases/<commit>-<run>-<attempt>/`. Réécrire seulement les quatre références locales de l’accueil dans le build. Conserver les fragments et les chemins CSS relatifs. Basculer l’accueil par renommage d’un temporaire dans le même dossier, avec copie antérieure disponible pour reprise. Même branche, exécutions sérialisées, HEAD relu juste avant la bascule. Préserver la configuration Apache existante.
- `TEMA_PRODUCTION_PROFILE_JSON`, `LIKUID_FTP_USERNAME` et `LIKUID_FTP_PASSWORD` sont les secrets de `likuid-production`. Nom d’hôte et URL publics connus. `pull_request` peut lancer la vérification hors secrets, `push` sur `main` lance la vérification et la publication, et `workflow_dispatch` permet la reprise sur `main`.
- Dérogation réservée au workflow Likuid. Limiter à `color-contrast` sur les états `catalogue` et `catalogue-pagine`, cibles `.card-month`, `.card-year`, `.card-date > .eyebrow` et sa version `article:nth-child(1) > .card-main` si présente, texte blanc sur `#ff008f` au ratio 3.71 et attendu 4.5. Toute autre défaillance reste bloquante. Conserver les résultats Axe complets.

## Verification

- Exécuter les tests existants et vérifier la reconnaissance précise des écarts de contraste.
- Vérifier le workflow, le build attesté, les rapports GitHub et la vérification TLS du transfert.
- Contrôler le catalogue et une fiche en accès anonyme sur l’adresse finale, sans soumettre d’inscription de test.
