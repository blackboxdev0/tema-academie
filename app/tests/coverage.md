# Traçabilité des scénarios V1

**Checkpoint correctif actuel :** 103 Node +21 régressions administratives +2 transitions VM +9 contrôles bundle/ICS privés +184 parcours navigateur réussis. Voir [le rapport final](../../docs/project/acceptance/corrections-2026-10-30.md) ; les nombres plus bas décrivent leurs campagnes historiques. Les contrôles R1/R3/R4/R5/R6/R7/R8/R9/R11 et délais sont intégrés à `verify`. R2 reste séparé et rouge.

Les identifiants sont ceux de `epics.md` ; cette matrice relie les52scénarios aux assertions locales et nomme les compléments réels/humains. Une assertion locale ne vaut ni recette Google, ni réception, ni acceptation Sofiane. Exécuter `npm run verify`, puis `npm run test:browsers` pour Firefox/WebKit. Les noms complets des tests portent leurs AC/ET.

| Scénarios story | Assertions locales principales | Complément séparé |
| --- | --- | --- |
| 1.1-1 | `v1-backend`: import24/18-4-2, inactive sans date, reprise avant/après écriture, conflits ; `catalogue-source.py` hash snapshot | Import réel privé et comparaison24champs, aucune donnée formateur publique |
| 1.1-2 | `engine`: générateur monotone ; `google`: logiciels/listes/renommage ; `v1-backend`: défaut capacité | Menus et protections Google natifs |
| 1.1-3 | `engine`: en-têtes déplacés/dupliqués ; diagnostics ; `google`: ambiguïtés | Diagnostic visible dans Sheet réel |
| 1.1-4 | CI application push/PR + `security.cjs` ; violation volontaire refusée localement | Exécution CI sur commit poussé à relire |
| 1.2-1 | `engine`: nouveau code fermé ; `v1-backend`: capacité préremplie une fois, indépendante | Saisie/collage réel |
| 1.2-2 | `engine`: projection open/full/closed/inactif/passé/annulées ; prix V1 | Lecture réelle anonyme |
| 1.2-3 | `engine`: début exact et surcapacité sans annulation | Derniers contrôles Google/admission |
| 1.3-1 | `google`: réconciliation commune/import explicite ; navigateur cadence30s | Mesures réelles édition→projection→site<120s |
| 1.3-2 | `google`: collage manqué réparé, IDs conservés, absence mail | Secours cinq minutes réel et état final des triggers |
| 1.3-3 | `google`: zéro écriture inchangée ; charge locale ; helper12passages | Mesures quota/durées et extrapolation288+100≤45min |
| 2.1-1 | `browser/v1`:24contenus, pagination, tri3groupes | Fidélité visuelle produit et données réelles |
| 2.1-2 | `browser/v1`: filtre commun, tarif absent, état vide ; `v1-backend`: prix | Prix définitifs Tema avant ouverture |
| 2.1-3 | `browser/v1`: chargement/refus de service/filtre vide ; navigation/contact/politique | Recette lecteur d’écran réel |
| 2.2-1 | `browser/v1`: mois pertinent, filtre partagé | Dates réelles autorisées, jamais dates client inventées |
| 2.2-2 | `browser/v1`: mois manuel neutre, mobile/grille et commandes | Téléphone physique, Safari réel |
| 2.2-3 | `browser/v1`: date exacte et hash direct sans réécriture | Prévisualisation distante uniquement après GO propre |
| 2.3-1 | `browser/v1`: présélection enabled/programme avant calendrier/complète ciblée | Revue UX Sally du produit |
| 2.3-2 | `browser/v1`: récapitulatif mobile juste après choix ; `engine`: whitelist | Contrôle visuel réel aux largeurs retenues |
| 2.3-3 | `browser/v1`: inconnue, sans date, prix absent ; action liée révision | Lecture Google réelle |
| 3.1-1 | `engine`: champs/accord/instantanés ; `browser/trial`: formulaire complet | Ligne Google + réception réelle, entreprise contrôlée manuellement |
| 3.1-2 | `engine`: dernière place/concurrents/verrou/début/fermeture | Verrou réel Apps Script, concurrence externe bornée |
| 3.1-3 | `engine`: invalides/doublon/consentement ; `v1-backend`:3/30, compteur privé et prix | Limites anti-abus et transport réel à confirmer |
| 3.2-1 | `engine`+`browser/trial`: perte réponse/replay même clé, zéro seconde notification | Perte/reprise navigateur réel |
| 3.2-2 | `engine`+`browser/trial`: révision/politique changée, nouveau consentement, champs conservés | Modification Sheet réel pendant formulaire |
| 3.2-3 | `engine`: annulé/conflit ; `browser/trial`: complet/changer date/privacy | Retour parcours en navigateur réel |
| 3.3-1 | `engine`: participant puis Tema, instantanés/ICS UID hiver/été | Réception réelle et agenda importé |
| 3.3-2 | `engine`: en ligne avec/sans lien, aucune URL publique ; textes courriels | Réception des trois modalités réelles bornées |
| 3.3-3 | Sémantique SENT distincte de réception dans moteur/UI | Boîtes et fichier réellement reçus, jamais PASS par mock |
| 3.4-1 | `engine`: échec participant/global/quota, deux tentatives max, place gardée | Traces Google réelles sans épuisement quota |
| 3.4-2 | `engine`: annulation/révision avant claim, incertitude après interruption | Frontières réelles fournisseur si contrôle autorisé |
| 3.4-3 | `browser/trial`: place prioritaire + états mail ; guide Gmail | Recette gestionnaire |
| 4.1-1 | `engine`: annulation/capacité/dernière fermée masquée | Édition statut Sheet et projection réelles |
| 4.1-2 | `engine`: ancien replay annulé, nouvelle ligne/ID | Rejeu réel borné |
| 4.1-3 | `engine`+`google`: capacité variable/sous confirmés diagnostic | Lecture diagnostic natif |
| 4.2-1 | `engine`: instantanés conservés et révision ; guide procédure | Contact Gmail manuel, aucune preuve automatique inventée |
| 4.2-2 | `engine`: fermeture avant/après admission, début sans tolérance | Concurrence Google/édition humaine limite explicite |
| 4.2-3 | `engine`: BLOCKED/SUPPRESSED ; `browser/trial`: reconfirmation | Suivi actuel gestionnaire dans Gmail |
| 4.3-1 | `tooling`: XLSX enregistré types/valeurs/formules ; `v1-backend`: export privé | Ouvrir export réel fictif dans Excel |
| 4.3-2 | `v1-backend`: retrait coordonnées, place décidée, replay intact, mail bloqué | Procédure12mois/copies/Gmail validée et appliquée fictivement |
| 4.3-3 | `browser/v1`: politique TEST/version/retour formulaire ; guide | Texte/accord/responsable validés Tema avant ouverture |
| 5.1-1 | `browser/v1`: contenu/ordre/fonts/logo partagés | Revue produit Sally et recette finale Sofiane |
| 5.1-2 | `browser/v1`: clavier/labels/zoom200% sans débordement | Lecteur d’écran réel et contrastes de tous états |
| 5.1-3 | `browser/v1`: liste/grille/récap proche ; CSS réduction mouvement | Téléphone réel |
| 5.2-1 | `verify`+matrice3moteurs, sécurité, fixtures hors Google | CI sur révision poussée, résultat à relire |
| 5.2-2 | Présente matrice52scénarios ; tests nommés AC/ET | Rapport réel21AC/12ET par candidat |
| 5.2-3 | Workflow permissions read-only, aucun secret/envoi/déploiement | Vérifier sortie CI et révision |
| 5.3-1 | Contrat simulé3moteurs, limites des profils nommées | Candidat publié après GO précis, anonymat et supports réels |
| 5.3-2 | `engine`: ICS RFC5545/UTC/hiver/été/UID/accents | Outlook/Apple par Sofiane, Google réel si candidat affecté |
| 5.3-3 | Tests ET01–12 pertinents, garanties locales conservées | Preuve ou NON VÉRIFIÉ explicite, aucune clôture automatique TEM6 |
| 5.4-1 | Build portable, garde TEST, fingerprint, retour compatible testé | GO de publication, promotion, droits, versions et contrôle cible |
| 5.4-2 | Guide gestion/export/nettoyage/Gmail prêt | Ronde d’ajustements et séance30min réellement acceptées |
| 5.4-3 | Routes statiques/hash, assets locaux, serveur sans rewrite | Démo Vercel et FTP selon GO distinct, bascule Sofiane |

La CI n’exécute aucune de ces cases réelles/humaines. Les stories restent ouvertes lorsque leur critère exige un niveau de preuve encore absent ou une intégration/acceptation distincte.

## Contre-audit du 30 octobre 2026

[Rapport indépendant](../../docs/project/acceptance/independent-audit-2026-10-30.md) : `npm run test:artifact` exécute désormais le bundle Google construit et les contrôles ICS après build. Sept contrôles portables réussis ; deux contrôles additionnels des fichiers privés réellement reçus réussis avec `TEMA_AUDIT_RECEIVED_ICS_DIR`, ignorés explicitement sans ces fichiers. Aucun import Apple/Outlook déduit.

`npm run test:audit-regressions` expose sept assertions rouges sur notes humaines, listes de formation, calcul de capacité, choix logiciel dérivé et diagnostics logiciels. Tests purement simulés ; correctifs ouverts. `node tests/audit/ui-state-proof.cjs` reproduit des transitions défectueuses du vrai script dans une VM avec DOM simulé, sans preuve navigateur.

Cinq nouveaux scénarios navigateur : délais GET15s/POST45s, retour après confirmation, titre après reconfirmation, focus du bouton ordinateur après actualisation. Matrice176 découverts, non exécutés dans cette session ; la limite d’exécution ne vaut pas PASS. Les nouvelles assertions peuvent échouer jusqu’à correction des défauts de parcours. Les156PASS précédents restent historiques.
