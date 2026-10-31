# Plan d'essai technique — Tema Académie V1

**Plan initial approuvé le26octobre2026 et essai TEM-6 exécuté ; bilan historique4PASS/8NON VÉRIFIÉ. Mise à jour documentaire du28octobre : cadence normale<2min/secours5min acceptée, tarif absent non réservable, contrôles complémentaires répartis par gate. Aucun nouveau test réel ou GO principal.** [Résultats historiques](../../../docs/project/technical-trial/TEM-6-results.md).

## But et séquence

Prouver le parcours navigateur → service Google → Sheet → courriels/agenda, avec une réponse exploitable et une réservation unique. La séquence proposée est : validation du dossier → accès et préparation structurelle autorisés → GO limité sur l'essai et exécution → choix de transport/architecture confirmés → préparation finale des stories et GO de développement principal → recette/livraison.

L'essai doit rester limité à une formation et deux sessions fictives, avec capacité contrôlée et boîtes de test autorisées. Les cas complémentaires d'acceptation restent dans [les règles et critères](regles-et-acceptation.md) ; le prototype ne devient pas implicitement la solution livrée.

## Ordre de passage confirmé le 25 octobre

1. **Connexion Google et catalogue** : constater accès, lecture publique et disponibilité du service (ET-01 et préparation ET-02).
2. **Inscription complète** : suivre une demande jusqu’au Sheet, aux courriels et à l’invitation (ET-02, ET-06, ET-07).
3. **Fermeture et administration** : agir dans le Sheet, contrôler visibilité et refus à l’envoi (ET-05, ET-09).
4. **Capacité** : vérifier dernière place concurrente, limites et annulation (ET-04, ET-09).
5. **Erreurs et reprises** : coupure, double clic, échec d’envoi et état inconnu (ET-03, ET-05, ET-08).

Confidentialité, navigateurs et récupération restent transversaux (ET-10 à ET-12) ; aucun scénario n’est supprimé par cet ordre. La [stratégie de non-régression](strategie-tests.md), exigée par Sofiane, rend les contrôles critiques rejouables avant push puis dans GitHub, avec recette Computer Use complémentaire. Le premier essai est limité ; la suite s’enrichit pendant le développement.

Compte Google et classeur métier restent pérennes. Les essais techniques de concurrence et panne ont leurs ressources fictives séparées ; la démo et la recette Tema sont hébergées sur Vercel. La bascule ultérieure du front sur le serveur Tema reste gérée par Sofiane et n’est pas un prérequis à la démonstration.

## Prérequis et état réel au 26 octobre

[Registre des ressources](ressources-services.md) : liens et associations métier/TEST constatés par Computer Use. La création des conteneurs est suivie de l’exécution privée Google et de la lecture publique réelle ; les autres preuves restent distinctes. [Bilan TEM-6](../../../docs/project/technical-trial/TEM-6-results.md).

| Élément | Vérification attendue | État constaté |
|---|---|---|
| Google `temaacademie@gmail.com` | Accès propriétaire, autorisation d’exécution et récupération | Compte authentifié, création privée et exécution TEST réussies après accord sur droits ; retour de code TEST éprouvé ; récupération du compte distincte, non vérifiée |
| Vercel | Espace, droits, offre et projet | Espace `blackboxsaas-projects` Hobby retenu provisoirement par Sofiane ; prototype TEST Vercel Drop publié dans `tema-academie`, dépôt visible pour import, Git non relié ; compatibilité commerciale avant déploiement client encore ouverte |
| Données | Métier pérenne et TEST isolé, boîtes contrôlées | Deux Sheets privés avec quatre onglets et en-têtes, paramètres initiaux ; aucun catalogue métier importé. Une formation/deux dates TEST, cinq inscriptions fictives (quatre confirmées/une annulée). Défaut numérique corrigé ; dates maintenant fermées. Trois boîtes privées reçues |
| Apps Script | Deux projets liés et associations fixes | Projets Métier/TEST séparés, `ENVIRONMENT` et `SPREADSHEET_ID` sauvegardés puis relus ; V8 actif ; candidat TEST, deux triggers de données, exécution réussie et web app TEST version 3, HEAD identique. Périodique testé minute puis ramené12 h au repos, onEdit conservé ; cadence V1 désormais choisie (normal<2min/secours5min) mais non implémentée/mesurée ; le réglage TEST12h est historique de repos. Métier reste au squelette sans exécution |
| Horloges | `America/Toronto`, UTC pour horodatages | Toronto observé sur les deux projets et le Sheet métier, locale Canada français ; réglages TEST confirmés directement. Conversion hiver/été/DST testée localement ; deux imports Google hiver/été réussis ; Outlook/Apple non vérifiés |
| Quota email | Quota disponible et plafond approuvé | Dix inscriptions avec envois réels et vingt destinataires automatiques maximum ; quota initial100 puis 92 au relevé final, partagé ; budget persistant consommé5/10 inscriptions et10/20 destinataires, injections comprises |
| Retour à l’état initial | Identification et désactivation/nettoyage de TEST | Retour du couple site/script et HEAD testé puis candidat courant rétabli, cinq lignes et compteurs conservés ; panne retirée, dates fermées, cadence TEST12 h au repos |

## Choix de transport à comparer

| Option | Ce qui est proposé | Preuve et décision |
|---|---|---|
| **A — Formulaire sur Vercel** | POST simple `application/x-www-form-urlencoded` vers Apps Script, résultat métier lisible après redirection. Pas d'en-tête secret, pas de prérequête JSON imposée. | Candidat initial conservant le parcours. Accepter seulement si les navigateurs ciblés lisent le résultat et si reprises/erreurs sont fiables. |
| **B — Formulaire Google HTML Service** | Catalogue Vercel puis page d'inscription servie par Apps Script ; `google.script.run` appelle le même service métier. | Interface Google documentée. Le changement de page/origine et l'habillage sont à faire accepter avant adoption. |
| **C — POST HTML natif** | Soumission par navigation vers `doPost`, puis réponse HTML avec résultat métier et retour au catalogue. | Tester succès/refus/retour et double soumission ; changement de parcours à valider. |

**Base constatée :** A fonctionne sur le navigateur intégré de TEM-6 et sert de base au travail, sans preuve universelle des autres supports. Confirmer ces derniers avant acceptation/exposition du parcours. Si une réponse n’est pas lisible de façon fiable, présenter B/C avec effet UX/coût avant adoption. Il n'est pas prévu de bâtir trois formulaires : tous réutilisent le contrat et l'unique service d'inscription, et seul le transport retenu sera réalisé pour la V1. Ne pas remplacer un échec par `no-cors` (réponse opaque), JSONP pour écrire, ou un succès basé uniquement sur le clic.

## Matrice de l'essai limité

Chaque ligne produira un résultat `PASS`, `FAIL` ou `NON VÉRIFIÉ`, l’adaptateur testé A/B/C, un candidat/version, des observations et une preuve synthétique. Les résultats courants figurent dans le bilan TEM-6 ; aucun contrôle partiel ou simulé ne remplit à lui seul la preuve réelle d’un ET. En cas de repli B/C, rejouer ET-02 à ET-05 et ET-11 sur ce transport ; conserver la preuve d’échec d’A sans la substituer à la preuve du choix retenu.

| ID | Exécution prévue | Résultat attendu | Preuve à conserver |
|---|---|---|---|
| ET-01 | Ouvrir le catalogue Vercel en navigation privée sans session Google | Lecture publique des seules données autorisées ; pas de page de connexion Google | URL/version et réponse publique inspectée |
| ET-02 | Envoyer par A puis par le transport retenu si différent ; inspecter redirections et résultat | Réponse métier lisible conforme au schéma, une seule ligne ; aucun faux succès opaque | Adaptateur, origines, code/états et lecture du Sheet fictif |
| ET-03 | Couper après écriture, double-cliquer/rejouer ; annuler puis rejouer ; changer fermeture/politique et signaux anti-spam | Une inscription ; `unknown` puis reçu courant, annulation visible sans réactivation ; zéro renvoi ; canonisation identique, changement métier sous même clé refusé | Identifiant, schémas/empreintes de test, lignes et états |
| ET-04 | Deux demandes sur la dernière place ; empêcher acquisition du verrou | Une réservation ; autre `FULL` ; acquisition effective, flush avant libération, `BUSY` sans mutation si verrou inaccessible | Résultats corrélés, séquence verrou/écriture et nombre d’inscrits |
| ET-05 | Essayer tarif absent, doublon, champ invalide, consentement absent/périmé, fermeture au démarrage, fermeture manuelle d’une seule des deux dates avant puis après les derniers contrôles d’admission, avec formulaire déjà ouvert, et formation rendue inactive | Refus clair avant admission sans nouvelle ligne ni fuite, dont CLOSED/price_unconfirmed pour tarif absent ; demande admise avant fermeture manuelle enregistrée une seule fois avec ses instantanés, suivantes refusées ; saisie seule sans place, aucune tolérance horaire supplémentaire ; réouverture avant début avec place possible, sans contourner début/capacité ; autre date inchangée, formation inactive non proposée/non réservable sans perte d’historique | Codes et absence de mutation |
| ET-06 | Envoyer confirmation et avis sur deux boîtes contrôlées, avec lien en ligne présent puis absent | Contenu et expéditeur attendus, `.ics` joint, adresse présentielle cohérente avec le site ; lien visio privé si présent ; sinon réservation maintenue, message lien à venir et invitation sans URL invalide, avis Tema de suivi | Réception observée et fichier ICS conservé hors dépôt |
| ET-07 | Invitations hiver/été dans trois agendas ; conversion d’heures inexistantes/répétées lors des transitions | Heure Toronto correcte ; durée/accents/lieu/UID conservés ; UTC avec `Z` sans `TZID` ; dates locales invalides/ambiguës refusées | Résultat conversion et observations par agenda, contrôle RFC 5545 |
| ET-08 | Simuler échec participant avec avis Tema encore possible, puis blocage global/quota et interruption ; annuler/replanifier avant envoi initial, sans épuisement réel | Place maintenue ; avis Tema signalant l’échec si possible ; alerte elle-même bloquée documentée avec trace Sheet ; états certains/incertains honnêtes, message participant annulé/périmé non envoyé ; suivi manuel Gmail, aucun renvoi applicatif | Injection, réception contrôlée de l’avis quand possible, états et suivi manuel ; aucun secret |
| ET-09 | Ajouter une formation, vérifier code automatique/stable et défaut inactif ; ajouter une date fermée par défaut puis ouvrir ; écrire par script ; annuler ; fermer une date sans inscrit puis avec un inscrit confirmé, annuler ce dernier ; laisser un formulaire ouvert puis fermer/modifier la même ligne/prévenir fictivement/réouvrir | Publication normale<2min, traitement manqué rattrapé par secours nominal5min sans mail ; place libérée ; date fermée sans confirmé absente des deux calendriers, avec confirmé visible Inscriptions terminées ; formation active conservée ; ancien formulaire `SESSION_CHANGED` sans réservation ; inscrits, identifiant et historique conservés sans réinscription ; générateur commun vérifié sur collage/import repris sans doublon/écrasement/événement manqué ; prix absent bloque l’admission sans fausser visibilité/statut des dates ; capacité source conservée sans modifier les dates existantes ; lecture visible30s et secours5min, durées/charge et marge de quota mesurés, sans confondre extrapolation et observation ; protection des opérations en cours vérifiée selon mécanisme retenu | Temps, projection publique, révisions, états et procédure humaine ; limites des éditions directes sans atomicité présumée |
| ET-10 | Inspecter le catalogue et tester textes de formule/HTML et exportExcel à préfixes =,+,-,@, script de test protégé et séparation de configuration TEST/Métier | Adresse du présentiel et seul courriel de contact validé publics ; aucun inscrit, autre destinataire interne ou lien visio privé exposé ; texte inerte y compris après ouverture de l’export ; ressources test distinctes et garde TEST conservée | Champs des réponses, contrôle du Sheet et du bundle |
| ET-11 | Refaire lecture/envoi/erreur sur Chrome/Firefox/Safari et mobile prévu | Résultat fiable ; distinguer vrai Safari d'une simulation WebKit | Matrice navigateur/version/support avec limites explicites |
| ET-12 | Revenir uniquement en TEST à un code site/Google compatible connu, incluant le code sauvegardé des triggers si présent | Versions identifiées et courte note suffisante ; inscriptions fictives enregistrées entre-temps et compteurs conservés, sans restauration du Sheet ; aucune ressource réelle affectée | Versions/IDs non secrets et constat avant/après ; nettoyage fictif éventuel distinct |

Aucune panne n'est injectée dans des inscriptions réelles. Les opérations d'envoi utilisent une liste de destinataires autorisés ; aucune adresse tirée du catalogue ou du PDF n'est une adresse de test autorisée.

## Gates de validation et d’autorisation

| Moment | Conditions et contrôles | Effet |
|---|---|---|
| G0 — Clôture documentaire puis UX/UI | Contrats et décisions cohérents, IDs/états/limites/gates fixés, revue documentaire terminée | Permet de revoir les maquettes ; ne suppose aucun ET incomplet devenu PASS et n’autorise pas le code |
| G1 — Avant code dépendant | UX du lot suffisamment définie, GO identifiant le lot, contrat cohérent disponible, moteur/transport de base et preuves/limites connus, fixtures et commande locale disponibles | Réalisation isolée seulement dans le périmètre autorisé ; si une modification change parcours/coût, arbitrage avant adoption |
| G2 — Pendant réalisation, avant acceptation/ouverture réelle concernée | Logique/contrats/erreurs/anti-abus/tarif/import/export à leur story ; tests réels pertinents ET-01–05/08–11 et mesure ET-09 sur candidate, supports non simulés explicités | Aucune ouverture à des utilisateurs réels hors périmètre de test contrôlé reposant sur un requis indisponible ; la seule réalisation locale n’établit pas une garantie Google |
| G3 — Candidat autorisé puis recette complète | Autoriser/publier candidat Vercel identifié avant la recette distante ; réception réelle ET-06, agendas ET-07 dont Outlook/Apple par Sofiane, autres scénarios complets sur supports disponibles | Recette de la solution entière, distincte de la promotion finale et des mails acceptés par le service |
| G4 — Avant ouverture/remise concernée | Tous requis PASS ou dérogation humaine identifiée, politique/accord/prix/identité/actifs et accès/cible validés, configuration Métier contrôlée, GO de publication précis | Promotion/contrôles postpublication et remise, aucun Done ou mise en service déduit d’une simple limite inscrite |

L’ouverture réelle visée par G2 est distincte d’un déploiement TEST ou d’une preview autorisée nécessaire pour exécuter les contrôles. Un candidat contrôlé peut être publié avec son GO avant sa recette ; G3 ne crée pas une boucle imposant la recette terminée avant sa propre preview. Les données, destinataires et effets de cette preview restent dans le périmètre autorisé.

Cette répartition précise le moment des preuves sans supprimer les prérequis du plan initial ou accepter globalement les8ET incomplets. La clôture documentaire ne requiert pas une campagne réelle supplémentaire ; elle n’autorise pas à l’esquiver avant le composant concerné. Outlook/Apple seulement ont un report humain explicite à la recette complète. Les contrôles et scénarios opérationnels sont définis dans [le contrôle technique commun](../../../docs/project/architecture/controle-technique-v1.md).

## Environnements, version et preuve

Un Sheet et un projet Apps Script dédiés à l'essai, avec marqueur `TEST`, distincts de ceux du métier pérenne. Un seul projet écrivain par Sheet. Les déclencheurs utilisent le code sauvegardé HEAD, distinct d’une version web app : aucun brouillon dans le projet métier, code sauvegardé et version déployée compatibles avec le même candidat. La destination est fixée côté serveur ; jamais sélectionnée par un paramètre navigateur. Compte Google dédié au projet retenu pour préparer l’essai ; Sofiane en prévoit l’accès complet et indique que le client n’y a pas encore accès. Connexion et exécution TEST vérifiées, trois adresses de participants reçues en configuration privée hors dépôt ; quotas partagés entre ressources du compte à rappeler. Le site test utilise uniquement les URLs Google test.

Après autorisation, relever révision de candidat et empreinte du build, build Vercel, version/déploiement Apps Script et référence du Sheet. Le rapport contiendra pour ET-01 à ET-12 : résultat, attendu/observé, heure, environnement et limite. Captures, fichiers ICS et données d'essai restent hors du code livré ; seul un bilan non nominatif et les liens de preuve utiles entrent dans le contexte.

Vercel accueille la démo puis la recette par Tema, droits/coûts à constater ; ce jalon ne prouve pas une ouverture publique. Le moteur Google et le classeur métier ne sont pas recréés lors du changement d’hébergeur. Sofiane conserve la bascule finale du front vers le serveur Tema et ses détails d’accès ; elle ne bloque pas la démonstration ou la recette Vercel. L’intégration au site David reste différée. La future livraison conserve cet ordre : préparer données/projet Google et version, contrôler interface/configuration, autoriser et publier le candidat vers les bonnes URLs, exécuter sa recette, puis autoriser sa promotion après acceptation. La promotion conserve destination serveur fixe, un projet écrivain et garde TEST dans TEST ; aucune injection de panne/reset ou liste d’essai ne devient une configuration métier publique. Maintenance limitée à garder les versions, tester avant publication et une courte note pour remettre un couple site/script compatible sans toucher aux inscriptions. Aucun outil ou processus détaillé supplémentaire à gérer côté Tema ; restaurer du code n'efface jamais les inscriptions enregistrées entre-temps. Sauvegardes et restauration de données sont distinctes et demandent leur décision propre.

## Estimation et dépendances

L’enveloppe historique proposée pour le mandat entier était3jours humains actifs, essai compris ; elle n’est pas un temps passé mesuré. Le [plan de reste](../../../docs/project/planning/plan-developpement-v1.md) propose maintenant2,5jours actifs +0,5réserve, à clarifier en jours-personnes par acteur et à valider. Le travail autonome et les attentes externes restent séparés ; aucune date de livraison, supplément de prix ou acceptation commerciale n’est déduite de la clôture d’architecture.

Les validations Tema de contenu/prix/politique/identité, les accès et les supports de recette sont des dépendances de leur jalon, pas un blocage automatique de tout travail indépendant sur données fictives. Le GO principal et les déploiements restent des autorisations distinctes.

## Sources techniques — vérifications du 20 au 26 octobre 2026

Recherche documentaire uniquement ; les sources ne prouvent pas notre déploiement.

- [Google Web Apps](https://developers.google.com/apps-script/guides/web) : exécution propriétaire et interfaces `doGet`/`doPost`.
- [ContentService](https://developers.google.com/apps-script/guides/content) : redirection ; aucune validation d'un CORS particulier par cette lecture.
- [HTML Service / google.script.run](https://developers.google.com/apps-script/guides/html/communication) : RPC dans les pages servies par Google.
- [Quotas](https://developers.google.com/apps-script/guides/services/quotas) et [LockService](https://developers.google.com/apps-script/reference/lock/lock-service) : 100 destinataires/jour grand public, soit au plus 50 inscriptions à deux destinataires avant autres envois ; verrou script et limites de durée. Valeurs à revérifier avant essai/livraison.
- [Déclencheurs installables](https://developers.google.com/apps-script/guides/triggers/installable) : éditions manuelles et changements de structure ; les écritures par script/API doivent gérer elles-mêmes l'actualisation.
- [Utilities](https://developers.google.com/apps-script/reference/utilities/utilities) et [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) : conversion de dates et format d'invitation ; compatibilité effective à tester.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby) / [Pro](https://vercel.com/docs/plans/pro-plan) : Hobby personnel non commercial ; Pro affiche 20 USD/mois avec usage/sièges à vérifier. Un compte bkbx existant n'est pas présumé.
- [Apps Script V8](https://developers.google.com/apps-script/guides/v8-runtime) : code serveur JavaScript compatible Google, sans API Node/DOM ou modules ES non transformés ; le client HTML Service s’exécute dans le navigateur et peut utiliser le DOM.
- [Node LTS](https://nodejs.org/en/about/previous-releases), registres [Vite 8.3.5](https://registry.npmjs.org/vite/8.3.5), [clasp 3.4.1](https://registry.npmjs.org/@google%2fclasp/3.4.1), [Playwright 1.64.1](https://registry.npmjs.org/@playwright%2ftest/1.64.1) : versions proposées vérifiées ; Playwright 1.64.1 est installé pour TEM-6, Vite/clasp non installés.

Compléments du 26 octobre : [Node index LTS](https://nodejs.org/dist/index.json), [create-vite 9.3.1](https://registry.npmjs.org/create-vite/9.3.1), [versions/déploiements Google](https://developers.google.com/apps-script/concepts/deployments), [HEAD et triggers](https://developers.google.com/apps-script/api/reference/rest/v1/projects/updateContent). Ces références du26octobre sont historiques, pas un ordre d’installer un nouveau starter. Le prototype utilise Node22.9.0/npm11.7.0 observés et Playwright1.64.1 verrouillé ; Vite/clasp non installés. La spine redérivée ratifie le code existant et distingue ce qui reste à décider au jalon autorisé.
