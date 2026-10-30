# Tema Académie — V1 locale et Google TEST

Site français statique et moteur partagé Node/Google, sans serveur applicatif ni réécriture de routes. Le même fichier `apps-script/engine.js` est chargé sans transformation par Node et concaténé dans `dist/apps-script/Code.gs`. Cible courante : V1 locale reliée au Google TEST isolé, avant recette finale Sofiane. Les preuves Google réelles restent distinctes des simulations. Voir le [guide Google](../docs/project/guide-google.md).

## Rejouer localement

Prérequis constatés : Node 22.9.0, npm 11.7.0. Playwright est épinglé à 1.64.1 ; le lockfile fixe les dépendances.

```sh
cd /Users/sofiane/Software/tema/app
npm ci
npx playwright install chromium firefox webkit
npm run verify
npm run test:browsers
```

`verify` exécute logique/adaptateurs/contrats, export XLSX, build, contrôles de sécurité et parcours Chromium ordinateur/mobile. `test:browsers` ajoute Firefox et WebKit automatisés. La CI push/PR exécute ces trois moteurs, sans URL distante ni déploiement. Les adaptateurs Sheets/Lock/MailApp sont simulés et le navigateur intercepte le réseau dans le runner. Aucun appel Google ni envoi réel par ces commandes. Les moteurs automatisés ne prouvent ni téléphone physique ni Safari réel ; lecteur d’écran et réception/agendas gardent leurs preuves propres.

```sh
npm run build
npm run serve
```

La prévisualisation est sur `http://127.0.0.1:4173`. Le build configure par défaut l’URL TEST publique de `config/project.json` ; `TEMA_TEST_API_URL='' npm run build` la désactive explicitement, sans données simulées dans le site. Les vues utilisent des fragments sur `index.html`, compatibles avec un dossier FTP sans réécriture. Logo/fonts sont embarqués. Les coordonnées et la demande de reprise restent seulement dans la mémoire de la page. Recharger/fermer cette page les perd ; ne pas en déduire l’absence d’une inscription incertaine. Aucun champ personnel en URL, localStorage ou sessionStorage.

## Préparer Google par son interface

Ne charger que le projet **Tema Académie — TEST**, ID fixé dans `google.js`. Le classeur métier est inaccessible au candidat : les trois contrôles environnement/ID classeur/ID script doivent correspondre. Toute sélection de destination et toute fonction d’administration sont absentes de l’interface HTTP. Les fonctions terminées par `_` sont privées à l’éditeur et ne sont pas proposées via RPC.

1. Générer le build. Dans l’éditeur Apps Script TEST, remplacer le squelette par `dist/apps-script/Code.gs`. Afficher le manifeste dans les paramètres et utiliser `dist/apps-script/appsscript.json`. Ne pas dupliquer le moteur dans un autre fichier du projet.
2. Configurer les propriétés du script en privé. `ENVIRONMENT=TEST` et `SPREADSHEET_ID` existent déjà ; leur ID est vérifié contre le registre. Ajouter `CONTACT_EMAIL`, `TEMA_EMAIL` et `ALLOWED_RECIPIENTS_JSON` (tableau JSON de toutes les boîtes participantes autorisées **et** du destinataire de l’avis interne). Ne copier aucune adresse privée dans Git, Linear, une capture livrée ou ce document. Une nouvelle demande hors liste est refusée avant toute écriture/avis ; le rejeu d’une demande déjà enregistrée garde sa priorité.
3. Examiner les autorisations affichées avec Sofiane : accès Sheets, envoi par MailApp et gestion des déclencheurs. Le manifeste ne demande pas la lecture de Gmail ni de Drive. Cette notice ne remplace pas la confirmation requise pour une nouvelle permission Google sensible.
4. Exécuter `installTrial` une seule fois depuis la liste Run de l’éditeur : uniquement si les trois tables de données sont vides. Elle conserve `Paramètres` et ses colonnes natives `cle/valeur/description` et `id/label/choix`, remplace les valeurs de contact/avis depuis la configuration privée, pose une politique fictive TEST-1, ajoute une formation inactive et deux dates fermées (hiver/été de l’année suivante). Les quatre onglets restent conformes au contrat. Aucun effacement d’inscription, aucun reset de compteur.
5. Inspecter le Sheet. Activer la formation et ouvrir volontairement les dates nécessaires à chaque essai ; capacité autoritaire dans `Disponibilités`. Les coches n’ouvrent pas une date passée/complète. Ajouter si nécessaire un lien visio fictif privé. La politique d’essai n’est pas une politique client approuvée et ne permet aucune ouverture commerciale.
6. `reconcileTrial` génère IDs/calculs/diagnostics sans courriel ; le même chemin couvre collage/import. `installV1TrialTriggers` configure le déclencheur d’édition et le secours nominal cinq minutes sur TEST. Relever les réglages avant/après et remettre TEST au repos après les mesures bornées. Les listes `ID — Libellé` sont actualisées sans effacer les coches. IDs logiciels réservés, compteur monotone, aucune réattribution après renommage. Les protections avertissent le propriétaire sans rendre ses éditions atomiques.
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

## Import privé, export et contrôles V1

```sh
python3 scripts/catalogue-source.py --output /CHEMIN_PRIVE/catalogue-import.json
node scripts/export-xlsx.cjs /CHEMIN_PRIVE/tables.json /CHEMIN_PRIVE/inscriptions.xlsx
```

L’extraction vérifie le hash du snapshot approuvé et les24sources18/4/2, sans créer de date depuis « à venir ». Le JSON contient les codes formateurs : jamais dans Git, site ou Linear. L’import éditeur garde un journal privé source→code durable ; une reprise retrouve les mêmes IDs et signale une modification Tema divergente sans l’écraser. Les nouvelles formations restent inactives. Le guide décrit activation TEST, sessions fictives bornées et leurs contrôles.

L’export accepte `{tables:{nom:[[en-têtes],…lignes]}}` privé et refuse une sortie dans le dépôt. Il produit des cellules textuelles typées pour les chaînes commençant `=`, `+`, `-`, `@`, sans formule ni relation externe ; nombres et booléens restent typés. Le test ouvre le paquet XLSX enregistré et vérifie valeurs/types. L’ouverture dans Excel réel est distincte et reste à constater. Nettoyage manuel12mois et copies contrôlées suivent le guide ; aucune purge automatique.

Le tarif vide reste consultable et refuse une nouvelle admission, distinct du zéro. Pour les seules nouvelles commandes identifiables, un compteur privé sous verrou applique trois commandes par hash de courriel et trente par projet dans une fenêtre fixe UTC de60secondes ; les refus métier comptent, le replay reste prioritaire. Ce mécanisme best effort ne prouve ni propriété d’adresse ni protection DDoS ; `DUPLICATE` révèle l’existence de la paire courriel/session sans reçu tiers.

## État historique après TEM-6

Google version 3/HEAD et site corrigé rétablis après retour compatible. Cinq inscriptions fictives conservées ; deux dates fermées, injection de panne retirée. Deux triggers de données : onEdit et périodique réglé12 h au repos, sans email. `installTrialTriggers` ajoute un handler absent mais ne change pas la fréquence d’un handler existant : pour rejouer les mesures minute, régler explicitement le trigger dans Google sur une séquence bornée, puis remettre au repos. Ce réglage TEST n’adopte aucune cadence V1 ; voir le [bilan](../docs/project/technical-trial/TEM-6-results.md) et sa limite de quota. Aucun reset de compteurs/données pour relancer la suite.
