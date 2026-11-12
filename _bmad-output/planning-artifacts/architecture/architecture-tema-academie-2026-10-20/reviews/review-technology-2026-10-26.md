# Revue technique — 26 octobre 2026

Spine examinée : `../ARCHITECTURE-SPINE.md`, version portant `updated: 2026-10-26`, lignes 1–200.

**Verdict : favorable comme dossier avant essai.** Aucun choix de technologie inexistant ou incompatible avec le périmètre déclaré n’a été identifié. Deux précisions mineures sont utiles : citer la bonne preuve du code HEAD exécuté par les triggers et rendre explicite le verrouillage du starter. Le transport, la cadence, les quotas et les interactions avec les éditions humaines restent des conditions d’essai réelles, correctement annoncées comme non démontrées ; cette revue ne les valide pas.

Lecture indépendante des sources publiques officielles et des métadonnées de publication le 26 octobre. Aucun paquet installé ou exécuté, aucune connexion au compte Google/Vercel, aucune ressource métier ou TEST utilisée, aucune écriture Linear, aucun commit. L’archive du starter a été lue en mémoire sans extraction ni exécution.

## Versions et adéquation

| Technologie | Constat actuel | Adéquation au seed |
|---|---|---|
| Node.js | `24.22.1`, LTS `Krypton`, publication du 20 octobre ; confirmé dans l’[index officiel](https://nodejs.org/dist/index.json). | Compatible avec les engines des quatre paquets ci-dessous ; outillage/tests seulement. Le [test runner natif de Node 24](https://nodejs.org/download/release/v24.20.0/docs/api/test.html) existe. Les tests Node ne prouvent pas l’exécution Apps Script. |
| Vite | `8.3.5`, tag `latest` au contrôle ; engines `^20.19.0 || >=22.12.0`, d’après les [métadonnées publiées](https://registry.npmjs.org/vite/8.3.5). | Le [build fournit des actifs statiques](https://vite.dev/guide/) et la [documentation de déploiement](https://vite.dev/guide/static-deploy.html) couvre leur publication, dont Vercel. Cela convient au front portable ; base URL et chemins sur le serveur Tema restent à constater. |
| create-vite | `9.3.1`, tag `latest`, mêmes engines, [publication officielle](https://registry.npmjs.org/create-vite/9.3.1). | Le preset `vanilla` est toujours [documenté](https://vite.dev/guide/) et présent dans l’[archive exacte publiée](https://registry.npmjs.org/create-vite/-/create-vite-9.3.1.tgz). Il est adapté à l’absence de framework UI imposé. |
| `@google/clasp` | `3.4.1`, tag `latest`, engines Node `>=20.0.0`, [publication du paquet Google](https://registry.npmjs.org/@google%2fclasp/3.4.1). | L’outil [synchronise les sources locales et gère versions/déploiements](https://developers.google.com/apps-script/guides/clasp). Le registre du paquet prime sur l’ancien minimum Node encore affiché dans ce guide. Aucune autorisation Google ni configuration effective vérifiée. |
| `@playwright/test` | `1.64.1`, tag `latest`, engines Node `>=20`, [publication Microsoft](https://registry.npmjs.org/@playwright%2ftest/1.64.1). | Node 24 est dans les [prérequis actuels](https://playwright.dev/docs/intro#system-requirements). Le [parcours GitHub Actions](https://playwright.dev/docs/ci-intro) existe. Les navigateurs/binaires et runners devront être fixés avec le candidat ; WebKit n’établit pas une recette Safari réel. |
| Apps Script V8 | Service géré, sans version précise du moteur épinglable par ce projet ; [limitations officielles](https://developers.google.com/apps-script/guides/v8-runtime). | AD-2 distingue correctement V8 de Node/DOM et impose la transformation des modules. L’assemblage serveur doit également éviter `fetch`, `URL`, `TextEncoder`, timers et autres globals absents. La logique commune doit s’en tenir à un sous-ensemble portable, les besoins Google restant dans les adaptateurs. |
| Sheets / SpreadsheetApp | [Service officiel actuel](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app), géré. | Lecture, écriture et `flush()` disponibles. Pas de transaction de base de données ou de verrouillage des éditions humaines déduit de cette API. |
| MailApp / ICS | [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app) envoie des messages et pièces jointes ; iCalendar est défini par la [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545). | Adapté à l’envoi prévu avec états séparés. UID stable et UTC constituent un choix cohérent ; réception, rendu et import agenda restent à observer dans les boîtes/agendas retenus. |
| Vercel / GitHub Actions | Services gérés ; [Vercel Hobby](https://vercel.com/docs/plans/hobby) reste limité à un usage personnel non commercial ; [Actions](https://docs.github.com/en/actions/get-started/understand-github-actions) prend en charge les workflows sur push/PR. | Le principe démo/recette statique et CI est réalisable comme capacité fournisseur. Forfait réel, droits, coûts et futur workflow ne sont pas constatés. La spine conserve correctement cette condition. |

## Constats et traitement

### TECH-1 — Faible : la référence HEAD des triggers doit pointer sur `updateContent`

**Cible :** AD-9, ligne 110 ; preuves, ligne 152.

Le comportement décrit est exact : les triggers utilisent le code sauvegardé HEAD alors que le déploiement public peut rester lié à une version. Toutefois, la page `getContent` citée explique seulement comment lire HEAD ou une version ; c’est [`projects.updateContent`](https://developers.google.com/apps-script/api/reference/rest/v1/projects/updateContent) qui dit explicitement que ce contenu HEAD est exécuté par les triggers. Les [déploiements versionnés](https://developers.google.com/apps-script/concepts/deployments) restent attachés à leur version.

**Traitement : autofix documentaire.** Ajouter/remplacer la citation HEAD par `updateContent`. Conserver l’interdiction de développement expérimental dans le projet métier et la compatibilité schéma/candidat entre HEAD et version publique. Une restauration de la seule web app ne restaure pas le code de ses triggers.

### TECH-2 — Faible : le starter exact ne verrouille pas à lui seul Vite

**Cible :** Stack, lignes 138–146 ; Structural Seed, ligne 163.

Lecture indépendante de `package/template-vanilla/package.json` dans l’[archive create-vite 9.3.1](https://registry.npmjs.org/create-vite/-/create-vite-9.3.1.tgz) : `type: module`, scripts `dev`, `build`, `preview`, dépendance de développement Vite `^8.3.4`. Le starter actuel existe et convient ; exécuter ce starter exact avec sa plage par défaut n’assure pas une installation reproductible de `8.3.5`.

**Traitement : précision à porter au seed ou aux consignes d’installation.** Au GO, revérifier les versions, choisir explicitement `create-vite@9.3.1` et le preset vanilla, imposer Vite `8.3.5`, puis conserver le lockfile. Aucun lancement ici. La sortie ES modules du starter concerne le navigateur ; elle ne doit pas être envoyée telle quelle dans Apps Script.

### TECH-3 — Condition d’essai élevée, déjà assumée : le contrat navigateur reste non prouvé

**Cible :** AD-6, lignes 88–92 ; Deferred, ligne 195.

Les [web apps](https://developers.google.com/apps-script/guides/web) exposent `doGet`/`doPost` et retournent du HTML ou du texte ; le [Content Service](https://developers.google.com/apps-script/guides/content#redirects) redirige sa réponse vers une URL temporaire `script.googleusercontent.com`. Ces capacités ne démontrent pas à elles seules une réponse métier lisible par le navigateur depuis le front externe. [`google.script.run`](https://developers.google.com/apps-script/guides/html/communication) est propre aux pages HTML Service.

**Traitement : conserver le gate existant.** Essais ET-01 à ET-05/ET-11 depuis l’origine réelle retenue, avec redirections, accès anonyme, réponse perdue, reprise de la même demande et confidentialité. Aucun constat documentaire n’autorise à remplacer `unknown` par un succès ou un refus. Le repli reste une décision explicite s’il change le parcours ou le coût. Aucun défaut nouveau de cadrage : AD-6 exprime déjà cette réserve.

### TECH-4 — Condition d’essai moyenne, déjà assumée : la cadence ne constitue pas un engagement fournisseur

**Cible :** AD-8, ligne 104 ; AD-10, ligne 116 ; Deferred, ligne 196.

Un [trigger périodique](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers) peut être configuré chaque minute ; les horaires peuvent varier. Les [quotas](https://developers.google.com/apps-script/guides/services/quotas) du compte grand public indiquent 90 minutes/jour de runtime de triggers, 6 minutes/exécution, 30 exécutions simultanées/utilisateur et 100 destinataires mail/jour, avec d’autres limites partagées et modifiables.

**Inférence de budget :** 1 440 réparations/jour consommeraient les 90 minutes avec une moyenne de 3,75 secondes chacune, avant les autres triggers du compte. Deux envois à un destinataire par inscription consommeraient deux unités du quota mail, donc environ 50 inscriptions complètes/jour au maximum théorique, avant autres usages et essais. Ce calcul n’est ni une mesure de capacité ni une promesse de débit.

**Traitement : conserver ET-09 bloquant pour la cible de fraîcheur.** Mesurer volume réaliste, durée/charge, quota résiduel, événements manqués et reprise. La combinaison minute/30 secondes est un candidat ; elle ne garantit pas `<2 minutes`. La formulation actuelle et son retour à Sofiane si la cible est impossible sont appropriés.

### TECH-5 — Condition d’essai moyenne, déjà assumée : LockService ne sérialise pas les personnes

**Cible :** AD-4, ligne 80 ; AD-5, ligne 86 ; AD-8, ligne 104.

[`getScriptLock()`](https://developers.google.com/apps-script/reference/lock/lock-service) protège les sections de code du même script, après acquisition effective. La [référence Lock](https://developers.google.com/apps-script/reference/lock/lock#releaseLock()) recommande `SpreadsheetApp.flush()` avant libération. Cela n’établit pas une transaction commune avec une personne modifiant le Sheet ; la restriction de portée est correctement écrite dans AD-4.

Le [simple `onEdit`](https://developers.google.com/apps-script/guides/triggers#onedite) ne met en attente que deux événements et n’est pas déclenché par les écritures script/API. Les imports doivent donc appeler le service de validation directement ; la réparation périodique ne doit pas être assimilée à une capture exhaustive des éditions.

**Traitement : conserver le protocole et le gate existants.** Éprouver fermeture/édition avant et après admission, annulation pendant claim/envoi, éditions en masse et réparation. La preuve Node des invariants ne suffit pas pour cette frontière Google/humain. Aucun mécanisme supplémentaire imposé par cette revue ; toute garantie plus forte demanderait un changement explicite du mode d’administration.

## Résultat du gate

Zéro finding critique ou élevé nouveau pour la remise de ce dossier préparatoire. TECH-1 et TECH-2 sont des précisions documentaires sans nouvel arbitrage métier. TECH-3 à TECH-5 conservent les preuves attendues et les conditions de réexamen déjà fixées par AD-4/6/8/10/11. Aucun essai réel, GO de développement, capacité de production, délivrabilité ou disponibilité n’est annoncé acquis.
