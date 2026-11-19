# Candidat de production, 18 novembre 2026

Préparation autorisée par Sofiane, avant publication. Branche `feat/production-candidate-20261118`, base `bb178e722b1f3861561046a08ba4a57b93040494`. Aucun commit, push, fusion ou déploiement de site dans cette tranche. Les modifications documentaires du nettoyage précédent sont conservées.

## Cibles et état

Nouvelle copie privée [Tema Académie - Production (préparation)](https://docs.google.com/spreadsheets/d/1q60CllHxExSKH8ApOlRZXi_iwdhEIbunXfnKLhG4aME/edit), propriétaire Tema. Nouveau [projet Apps Script lié](https://script.google.com/home/projects/16dlQ45tpdQ9l6UPJhTHto5dE3JCkdU8cnWK3yzrHY-RAc0OK6DBVZxQ4/edit). Aucun endpoint anonyme ni site de production créé. Le site Vercel existant et les ressources COPY/TEST restent inchangés.

Le profil PRODUCTION et le builder exigent les deux nouvelles identités et refusent les ressources historiques. Les trois fichiers Google, leur sauvegarde et leurs empreintes sont privés. Le site construit est également privé, avec URL API vide tant que la publication n’est pas autorisée. Aperçu explicite : `cd app && npm run preview:production -- /Users/sofiane/.config/tema-academie/production-candidate-20261118/bundle`. La prévisualisation normale COPY reste séparée.

Textes participant définitifs sans mentions TEST/COPY, identité et logo Tema, politique `TEMA-2026-11-18-1`, contact Tema et conservation manuelle de douze mois. La validation client du texte et de sa procédure reste requise ; aucune conformité juridique n’est déduite.

## Limites d’envoi

Plafond configurable maximum de 80 destinataires par fenêtre glissante de 24 heures, avec réserve de 5 sur le quota Google effectivement disponible. Une inscription normale consomme deux destinataires. Le quota Google et le temps total des déclencheurs restent des limites distinctes du plafond applicatif. La [référence officielle Google](https://developers.google.com/apps-script/guides/services/quotas), vérifiée le 18 novembre, fixe90 min/jour pour les déclencheurs d’un compte grand public,6 h/jour pour Workspace ; ces limites sont par utilisateur et peuvent évoluer.

Un refus temporaire avant tentative laisse le courriel en attente et permet sa reprise. Les états d’envoi ambigus ou échoués ne sont jamais réarmés automatiquement. Le rejeu d’une inscription ne provoque pas de renvoi. Les anciennes réservations de la démo ne sont pas importées.

Sofiane a autorisé les accès Google de cette seule copie et deux courriels uniquement vers la boîte Tema. Les deux tentatives sont conservées après nettoyage. La limite effective est remise à zéro destinataire pour suspendre les nouveaux envois de préparation, sans réinitialiser le budget consommé.

## Preuves Google réelles

| Vérification | Résultat observé |
|---|---|
| Copie initiale | Six onglets conformes à la source nettoyée, 24 formations, aucune session ni inscription |
| En-têtes | Photographie de sept bandeaux, 61 ancres de dimensions, avertissements natifs, colonne Places restantes masquée |
| Déplacement structurel | Ancres suivies après insertion ; suppression et structure ambiguë refusées sans écriture devinée |
| Ligne métier sur bandeau | Refus et conservation des valeurs collées ; Google Table interdit lui-même un intitulé totalement vide |
| Réparation de sept cellules | 4,211 s après optimisation, contre 26,463 s initialement |
| Contrôle sans changement | 1,765 s, contre 16,264 s initialement |
| Lecture du catalogue via doGet | 2,600 s, contre 14,883 s initialement ; 24 formations |
| Création native de formation | Une fiche non publiée, rejeu sans doublon, remise à vide ; seule la fiche de recette retirée. Enregistrement mesuré 33,060 s |
| Admission réelle via doPost | 4,393 s pour RECORDED, même identifiant au rejeu, nouvelle demande avec même courriel refusée DUPLICATE |
| Traitement autonome | Deux courriels envoyés après la fin de l’admission, réception des deux dans Gmail Tema à 15 h 36 |
| Rendu reçu | Logo, identité, date et horaires français de Montréal, aucun marqueur COPY/TEST ; pièce formation.ics présente et interprétée par Gmail |
| Annulation | Statut annulé conservé au rejeu, restitution de la place de la session de capacité 1, aucun nouveau courriel |
| Nettoyage | Données fictives et propriétés de recette retirées, sources revenues à 24/0/0, deux tentatives d’envoi préservées |

L’admission ci-dessus utilise la vraie fonction serveur Google et ses données réelles depuis une exécution propriétaire. Elle n’est pas une preuve de parcours HTTP anonyme sur un nouvel endpoint, qui n’existe pas encore. Les quatre navigateurs automatisés utilisent un transport simulé. La présence et l’interprétation du calendrier reçu sont vérifiées dans Gmail ; ses octets bruts n’ont pas été téléchargés dans cette tranche.

## Vérifications locales et revue

Trois relectures indépendantes ont produit vingt constats individuels, triés puis corrigés sans élargir le périmètre : asset natif, déclencheur, capture/concurrence, protection opérationnelle, budgets, chemins privés, historique, aperçu et preuves GET/récupération. Des essais natifs ont ensuite identifié les particularités des métadonnées Google et la frontière d’autorisation des déclencheurs ; ces points ont leurs correctifs et tests dédiés.

Dernière matrice globale : 340 parcours, 331 réussis. Huit échecs concernent le contraste connu du rose original, expressément conservé. Un délai de clic Chromium sur le cas de tarif absent a échoué ; le rejeu isolé trois fois a réussi. Aucun résultat global tout vert n’est revendiqué. Les 20 parcours production sur Chromium ordinateur/mobile, Firefox et WebKit ont réussi. Après les derniers changements : 132 tests standard et 405 expériences, dont 117 tests production, réussissent. Build/sécurité standard et production réussis. Les empreintes installées sont indiquées au checkpoint ci-dessous. Calendrier : sept contrôles portables réussis, deux fixtures privées historiques indisponibles. Administration : 21 contrôles et deux scénarios VM réussis.

## Déclencheurs et récupération

Le déclencheur minute `reconcilierProductionTema` traite les courriels indépendamment du navigateur. Le déclencheur d’édition propriétaire `traiterSaisieFormationTema` gère les sources, les en-têtes et la remise à vide B65. Le simple onEdit production marque les sources comme modifiées sans appeler l’API Sheets protégée. Aucun nouvel accès supplémentaire n’est nécessaire.

GET, POST et édition installée contrôlent les en-têtes à neuf. Au repos propre, seul l’audit d’en-têtes du worker peut attendre l’échéance de cinq minutes ; états pending, écart source/vue et transition temporelle imposent un contrôle. Le poll mail reste chaque minute. L’horodatage d’audit ne contient aucune donnée métier. Les délais d’ordonnancement Google et les quotas ne sont pas garantis par ces mesures ponctuelles ; aucune validation sur 24 heures n’est revendiquée.

Sauvegardes, exports, captures, résultats bruts et compteurs privés : `~/.config/tema-academie/production-candidate-20261118/`, hors dépôt. Retour : restaurer Code.gs, SaisieNative.gs et appsscript.json ensemble depuis les sauvegardes vérifiées ; gérer uniquement les deux déclencheurs du candidat et conserver les admissions, tentatives, budgets et propriétés. Le retour ne consiste jamais à restaurer un ancien classeur sur des inscriptions réelles.

## Avant publication

Recette de Sofiane et validation client des textes et de la conservation ; réserves d’accessibilité conservées ; choix du plan d’hébergement adapté. Ensuite seulement, GO de publication avec endpoint Google identifié, URL de production explicite, activation du plafond choisi, build et contrôle du parcours public. L’activation des envois aux vraies adresses ne doit pas être déduite de la recette limitée à Tema. TEM-28 reste ouvert pour la remise et TEM-27 pour la recette.

## Checkpoint final

Installation canonique finale relue depuis l’éditeur Google et comparée aux fichiers construits :

- Code.gs, SHA-256 canonique `bdc1948c0e4d5928e25518ad165ae4a3eb66e598b716a417d0c6c0bfa335e621`.
- SaisieNative.gs, SHA-256 canonique `9aea95766cecd6203a81dda1d9b9b32be63fa0b8a779ee78000fa4eb0fc5f021`.
- Manifeste inchangé, SHA-256 `8a3acdb32da80590b8549b67b24e9585aa9fd0d8d4085f5bd762e928575c1702`.
- Bundle construit `0ab8be72da8c65a7da544816ed78e63fb2fe131cab9f848da3ce40484a4977b5`.

Essai UI réel à 16 h 08 : remplacement volontaire de Disponibilités!C1, avertissement Google confirmé, restitution automatique de « Date ». Simple onEdit terminé en 1,404 s sans appel protégé ; déclencheur propriétaire terminé en 36,796 s, avec actualisation administrative. Le worker concomitant a terminé en 10,121 s. Ce temps d’entretien n’est pas le temps d’admission publique ni un délai garanti de réparation. L’échec du simple onEdit observé sur le candidat précédent ne se reproduit plus sur ce test final.

Export après ce dernier essai : les 13 colonnes métier des 24 formations sont égales en valeurs et types à la copie initiale. Aucune ligne de disponibilité, y compris sans ID, ni inscription restante ; C1 vaut Date. Aucun helper de recette dans les sources installées. Les deux tentatives sont conservées et les envois restent suspendus.

Dernière revue ciblée de l’audit : aucun défaut concret relevé, 18 tests ciblés et reproduction supplémentaire d’un dirty apparu pendant le poll réussis. L’intégration main, la publication et la recette humaine restent ouvertes. Passages minute suivants : 7,708 s puis 3,339 s, terminés sans erreur. Ce faible échantillon ne valide pas une journée : 3,339 s chaque minute représenteraient déjà environ80 min/jour, hors audits et actions humaines. Le quota total des déclencheurs du compte, partagé avec la démo encore active, doit être vérifié et le plan de bascule doit arrêter les traitements devenus inutiles avant ouverture. Aucun budget quotidien suffisant ni test sur24 h n’est revendiqué.

### Dernier contrôle de la file vide

Le poll reste chaque minute. Après un scan réel sans PENDING éligible, un marqueur ne conserve que version de source, empreinte de la configuration d’activation et échéance maximale de cinq minutes. La nouvelle admission, les états pending, une édition ou un changement d’activation invalident ce marqueur. Le scan est acquitté sous verrou après relecture de version. Un PENDING différé pour plafond, pause ou quota n’est jamais considéré comme une file vide. COPY reste inchangé.

Revue bornée : aucun défaut concret trouvé ; 211 contrôles production/COPY/outbox et scénarios supplémentaires indépendants réussis. Suite expérimentale finale 405/405. La garde de file vide seule mesurait encore 2,279s au repos. Une lecture groupée unique des propriétés de contrôle remplace désormais les lectures individuelles répétées sur le chemin propre ; les échéances et tout changement font reprendre le chemin complet. Le contrôle est relu chaque minute, sans copie de données métier ni acquittement créé à partir du seul instantané. Revue finale bornée : 231contrôles production/COPY/outbox et scénarios indépendants réussis, aucun défaut concret trouvé. Le temps final et la pause sont constatés ci-dessous. Les temps3,339s/2,279s et80min/jour précédents décrivent les candidats intermédiaires.

### Contrôle groupé et fin de recette

Le chemin propre lit un instantané de propriétés de contrôle par invocation et vérifie identité, activation, version source/vue, trois échéances et flags. Une admission après cet instantané conserve sa réservation et est reprise au tick suivant, sans nouvel acquittement de file vide. La pause privée `PRODUCTION_WORKER_PAUSED=1`, réservée à la préparation, conserve les lignes, tentatives et budgets. Elle ne modifie ni GET/POST ni le déclencheur d’édition propriétaire. Avant publication, reprendre ce traitement et vérifier les courriels en attente ; aucune suppression de déclencheur nécessaire.

Chemin propre final réellement exécuté à16h26 : 1,518s, contre3,339s avant les optimisations de repos ; audit complet précédent8,013s. Il s’agit de mesures ponctuelles, pas d’une journée validée. La cadence du seul déclencheur de préparation est remise à douze heures après les essais pour éviter le cumul avec la démo : sélection Hour timer / Every 12 hours relue après sauvegarde. Avant publication, restaurer Every minute ; le traitement des courriels n’est pas actif dans cet état de préparation. L’édition installée et les contrôles GET/POST restent disponibles.

### État laissé après recette

Deux déclencheurs conservés et relus : édition propriétaire inchangée, worker du candidat espacé à12heures. `PRODUCTION_WORKER_PAUSED=1` confirmé dans les propriétés privées, plafond effectif0, deux tentatives consommées conservées. Source/vue égales et pending administration/compteurs0. `HEADERS_CHECK_PENDING` impose un contrôle frais à la reprise ; Google refusait la sauvegarde de propriétés avec son ancien diagnostic vide. Ce marqueur n’est pas une erreur de données et la réparation normale l’efface.

Avant une ouverture autorisée : restaurer Every minute dans le seul déclencheur reconcilierProductionTema, enlever la pause, vérifier le contrôle d’en-têtes, fixer le plafond choisi sans reset et recetter l’endpoint public explicitement connecté. Aucun changement de ces réglages n’est déduit d’une copie du Sheet ou d’un push. La cadence au repos évite de cumuler deux traitements minute sur le même compte avant cette bascule.

Préparation achevée et documentée, recette humaine et publication ouvertes. TEM-28 In Progress et TEM-27 In Progress relus ;17Done/5Review/2InProgress sur TEM-5à28, sept tickets encore ouverts. Changements produit/tests/docs non commitées selon consigne actuelle, y compris les documents du nettoyage antérieur.

## Versionnement autorisé le 19 novembre

Sofiane demande explicitement le commit et le push du candidat sur sa branche de travail pour préparer sa release Vercel. Ce GO ne comprend ni fusion dans main, ni activation Google, ni raccordement ou mise en service de la production. Nouvelle vérification :132tests standard et405expériences réussis, build/sécurité et21audit+2VM réussis,7calendriers portables réussis et2fixtures privées historiques indisponibles. Le code applicatif reste celui recetté le18novembre ; les résultats navigateur précédents sont réutilisés, sans annoncer une nouvelle matrice verte.

Le build Vercel actuel reste celui de la démo COPY. La nouvelle cible ne peut pas être ouverte par une simple fusion : URL de déploiement Google encore absente, worker de préparation en pause et plafond0. Ces prérequis restent explicites dans la PR. Sauvegardes, exports et captures privés restent hors Git.
