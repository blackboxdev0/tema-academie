# Essai technique TEM-6

Prototype limité à TEST : une formation et deux sessions fictives, site statique et moteur Google. Le même fichier `apps-script/engine.js` est chargé sans transformation par Node et concaténé dans `dist/apps-script/Code.gs`. Aucun serveur applicatif à déployer. Ce prototype ne vaut ni réalisation V1 ni choix de transport accepté.

## Rejouer localement

Prérequis constatés : Node 22.9.0, npm 11.7.0. Playwright est épinglé à 1.64.1 ; le lockfile fixe les dépendances.

```sh
cd /Users/sofiane/Software/tema/app
npm ci
npx playwright install chromium
npm run verify
```

`verify` exécute logique/adaptateurs/contrats, build statique et quatorze scénarios dans Chromium ordinateur puis Chromium au format Pixel 7 (28 E2E), ainsi que 61 tests Node. Les adaptateurs Sheets/Lock/MailApp sont simulés. Le navigateur intercepte le réseau dans le runner et utilise le même moteur ; le serveur statique et le bundle livré ne contiennent aucune route de reset/injection. Aucune requête réelle Google ni aucun envoi par cette commande. Un profil mobile Chromium ne prouve ni téléphone physique ni Safari/Firefox. Les preuves réelles restent dans le bilan TEM-6.

```sh
npm run build
npm run serve
```

La prévisualisation est sur `http://127.0.0.1:4173`. Sans configuration, elle affiche que le service TEST n’est pas configuré, sans substituer des données de simulation. Les coordonnées et la demande de reprise restent seulement dans la mémoire de la page. Recharger/fermer cette page les perd ; ne pas en déduire l’absence d’une inscription incertaine. Aucun champ personnel en URL, localStorage ou sessionStorage.

## Préparer Google par son interface

Ne charger que le projet **Tema Académie — TEST**, ID fixé dans `google.js`. Le classeur métier est inaccessible au candidat : les trois contrôles environnement/ID classeur/ID script doivent correspondre. Toute sélection de destination et toute fonction d’administration sont absentes de l’interface HTTP. Les fonctions terminées par `_` sont privées à l’éditeur et ne sont pas proposées via RPC.

1. Générer le build. Dans l’éditeur Apps Script TEST, remplacer le squelette par `dist/apps-script/Code.gs`. Afficher le manifeste dans les paramètres et utiliser `dist/apps-script/appsscript.json`. Ne pas dupliquer le moteur dans un autre fichier du projet.
2. Configurer les propriétés du script en privé. `ENVIRONMENT=TEST` et `SPREADSHEET_ID` existent déjà ; leur ID est vérifié contre le registre. Ajouter `CONTACT_EMAIL`, `TEMA_EMAIL` et `ALLOWED_RECIPIENTS_JSON` (tableau JSON de toutes les boîtes participantes autorisées **et** du destinataire de l’avis interne). Ne copier aucune adresse privée dans Git, Linear, une capture livrée ou ce document. Une nouvelle demande hors liste est refusée avant toute écriture/avis ; le rejeu d’une demande déjà enregistrée garde sa priorité.
3. Examiner les autorisations affichées avec Sofiane : accès Sheets, envoi par MailApp et gestion des déclencheurs. Le manifeste ne demande pas la lecture de Gmail ni de Drive. Cette notice ne remplace pas la confirmation requise pour une nouvelle permission Google sensible.
4. Exécuter `installTrial` une seule fois depuis la liste Run de l’éditeur : uniquement si les trois tables de données sont vides. Elle conserve `Paramètres` et ses colonnes natives `cle/valeur/description` et `id/label/choix`, remplace les valeurs de contact/avis depuis la configuration privée, pose une politique fictive TEST-1, ajoute une formation inactive et deux dates fermées (hiver/été de l’année suivante). Les quatre onglets restent conformes au contrat. Aucun effacement d’inscription, aucun reset de compteur.
5. Inspecter le Sheet. Activer la formation et ouvrir volontairement les dates nécessaires à chaque essai ; capacité autoritaire dans `Disponibilités`. Les coches n’ouvrent pas une date passée/complète. Ajouter si nécessaire un lien visio fictif privé. La politique d’essai n’est pas une politique client approuvée et ne permet aucune ouverture commerciale.
6. `reconcileTrial` génère les IDs manquants et les calculs sans courriel ; le même chemin couvre collage/import. `installTrialTriggers`, si retenue pour ET-09, installe un déclencheur d’édition et une réparation minute sur TEST seulement. Les listes `ID — Libellé` sont actualisées séparément sans effacer les coches. IDs logiciels réservés, compteur formation monotone, aucune réattribution après renommage. Les protections natives avertissent le propriétaire ; elles ne bloquent pas ses éditions et ne prouvent aucune atomicité avec elles.
7. Créer une version web app TEST exécutée par le propriétaire, accès anonyme nécessaire pour ET-01. Vérifier la portée autorisée avant déploiement. Le HEAD des déclencheurs doit contenir le même candidat que la version déployée. Aucun upload ou déploiement n’est réalisé par les scripts locaux.

`inspectTrial` retourne seulement comptages, quota disponible et nombre de déclencheurs. Ces quatre entrées d’éditeur appellent les helpers privés et inscrivent uniquement leur résultat JSON non nominatif dans le journal ; aucune n’est dispatchée depuis HTTP. Ne pas effacer les propriétés internes `TRIAL_MAIL_BUDGET_JSON`, `FORMATION_COUNTER`, `SOFTWARE_RESERVED_IDS_JSON` et `TRIAL_ADMIN_DIGEST`. Ce dernier évite les mutations de listes/calculs/notes lorsque les données pertinentes sont inchangées ; aucune admission ne se base sur ce checkpoint. Le budget est réservé sous verrou **avant** chaque engagement d’envoi : au plus dix inscriptions ayant une tentative automatique et vingt destinataires. Une interruption peut consommer un emplacement sans message parti, volontairement. Le quota MailApp disponible est vérifié à chaque tentative ; il reste partagé avec les autres projets du compte. Les essais d’échec comptent aussi dans ce plafond conservateur. La demande suivante garde sa place si l’envoi est bloqué, avec suivi privé et sans renvoi applicatif.

`TRIAL_SIMULATE_MAIL_FAILURE`, propriété privée facultative, accepte `PARTICIPANT` ou `ALL` pour ET-08 ; elle provoque une erreur avant MailApp, sans épuiser le quota. La retirer après la séquence et consigner l’injection dans le bilan. Aucun paramètre visiteur ne peut l’activer. Ce contrôle ne prouve pas la réception, un rejet ultérieur, une interruption réelle ni une saturation de quota. Aucune troisième alerte, relance ou restauration n’est prévue.

## Configurer le transport A

```sh
TEMA_TEST_API_URL='URL_EXEC_TEST_OBSERVEE_DANS_GOOGLE' npm run build
npm run serve
```

Le build accepte uniquement une URL `/macros/s/.../exec` Google HTTPS. Cette URL est publique ; aucune clé, adresse privée ou destination Sheet dans le bundle navigateur. Charger le contenu de `dist/web` sur la cible TEST autorisée. Le POST utilise `URLSearchParams`, contenu simple `application/x-www-form-urlencoded`, redirection suivie et résultat JSON contrôlé. Aucune réponse opaque ou simple réussite HTTP ne vaut une réservation. Une réponse illisible devient inconnue avec reprise de la même demande. Si A échoue dans un vrai navigateur, conserver cette preuve et présenter B/C avant toute adoption ; aucun repli automatique.

```sh
TEMA_TEST_API_URL='URL_EXEC_TEST_OBSERVEE_DANS_GOOGLE' npm run test:real
```

Ce contrôle explicite lit seulement le vrai catalogue et vérifie sa liste blanche sans imprimer le contenu. Il ne réserve rien, n’envoie rien et ne prouve pas le CORS navigateur. Les inscriptions réelles bornées et les trois agendas s’observent séparément via le parcours autorisé, le Sheet et les boîtes contrôlées. Les textes et fichiers ICS restent hors du dépôt. Le rapport distingue simulation, transport HTTP serveur, navigateur réel, acceptation MailApp, réception et import d’agenda.

## Revenir au code compatible

Conserver hors dépôt l’empreinte/source générée précédente, la version web app TEST et le build statique correspondant. Avant changement, relever `inspectTrial` et les IDs non nominatifs nécessaires. Pour revenir : remettre le couple site/script compatible, enregistrer aussi ce code en HEAD si des déclencheurs existent, puis vérifier catalogue et rejeu d’une demande fictive déjà connue. Comparer les comptages avant/après. Ne jamais restaurer le Sheet ni effacer ses compteurs/inscriptions à cette occasion. L’éventuel nettoyage fictif est une opération distincte, sans reset HTTP.

`npm run fingerprint` donne une empreinte SHA-256 du code/outillage/tests (hors dépendances installées et build). Le bilan réel ajoute les empreintes du build livré et du bundle Google, les IDs versions, les douze ET et leurs limites. Aucun commit, push, fusion ou livraison publique n’est impliqué.

## État après TEM-6

Google version 3/HEAD et site corrigé rétablis après retour compatible. Cinq inscriptions fictives conservées ; deux dates fermées, injection de panne retirée. Deux triggers de données : onEdit et périodique réglé12 h au repos, sans email. `installTrialTriggers` ajoute un handler absent mais ne change pas la fréquence d’un handler existant : pour rejouer les mesures minute, régler explicitement le trigger dans Google sur une séquence bornée, puis remettre au repos. Ce réglage TEST n’adopte aucune cadence V1 ; voir le [bilan](../docs/project/technical-trial/TEM-6-results.md) et sa limite de quota. Aucun reset de compteurs/données pour relancer la suite.
