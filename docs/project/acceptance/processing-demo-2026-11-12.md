# Suivi immédiat et courriels de démonstration

GO Sofiane pendant la recette accompagnée du12novembre. Le classeur courant est celui de démonstration ; un futur classeur avec bonnes données sera copié après acceptation client. Vercel est explicitement différé à la toute fin. Couleurs conservées, aucune opération Git.

## Comportement

Le clic de confirmation et la reprise d’une demande ouvrent immédiatement une vue de suivi avec récapitulatif. La réservation n’est annoncée qu’après reçu durable. Refus explicite, conditions modifiées ou résultat inconnu restituent les contrôles appropriés du formulaire et gardent coordonnées/requête initiale. Historique et navigation ne permettent pas une seconde soumission en vol.

Textes éditoriaux web sans cadratins ni points médians de remplacement : lignes séparées dans les cartes et métadonnées, phrases pour les horaires et messages. Les références ID/libellé Sheets et les contenus saisis par l’humain restent conservés pour ne pas casser les relations ni réécrire ses données. Libellé d’envoi incertain et regroupement administratif nettoyés, fallback calendrier sans cadratin. Tous les cadratins stockés dans des données humaines ou des références ne sont donc pas migrés par cette opération.

## Activation Google

Version10 activée via la gestion native du déploiement existant, même URL et mêmes accès. HEAD relu exactement égal au candidat, empreinte canonique80f3a9f968a18f6240442beabbbb70c5e71deb8166b3602d4e60df1c090d1164. Manifeste sauvegardé et non modifié, fichier SaisieNative préservé, aucun déclencheur ajouté. Version9 et sauvegarde complète conservées pour retour.

Configuration admissions_mode=demo : une adresse participant valide peut être admise et recevoir sa confirmation ; le canal interne Tema reste limité à sa liste autorisée. Mode restricted rétablit le fonctionnement restreint ; valeur inconnue bloque les nouvelles admissions. Anti-abus, confirmation par reçu durable, absence de retry aveugle et budgets/quota persistants restent appliqués. Expéditeur Tema Académie, objets sans COPY/TEST. Ces changements sont effectifs pour les nouveaux envois, sans renvoyer les anciens mails.

Relecture des propriétés après activation : limites13inscriptions/26destinataires, consommation8/15, reste5inscriptions/11destinataires. Aucune remise à zéro, aucun changement de limite ou liste autorisée. Le quota Google journalier reste une condition distincte vérifiée lors de l’envoi. L’agent n’a créé aucune nouvelle inscription et n’a envoyé aucun courriel dans cette activation.

GET réel après activation : HTTP200,33formations/12sessions, contact Tema attendu. Aucun changement de branche principale, ancien script TEST, ancien classeur préparatoire ou Vercel. Les ressources anciennement nommées PROD ne sont pas une production client livrée.

## Vérification

- Écran d’attente :40contrôles ciblés sur Chromium/mobile Chromium/Firefox/WebKit réussis avant la dernière retouche des phrases.
- Standard132/132, COPY241/241 et artefacts9/9, audit21/21+2VM réussis au démarrage de la matrice finale.
- Matrice finale après phrases naturelles :316exécutés,308réussis et8échecs de contraste connus du rose initial explicitement restauré par Sofiane. Aucun autre échec ; règles axe conservées.
- Revue Build courte et relecture des compléments : constats de couverture corrigés, aucun défaut concret restant identifié. Les écritures des tests navigateur restent simulées ; réception réelle participant/Tema, invitation et annulation attendent le parcours effectué avec Sofiane.

Preuves et sauvegardes privées hors dépôt : processing-20261112. Le candidat et le relevé natif du profil local pointent sur la version10. Pour le futur classeur final, les identifiants de ressources, le script lié, les autorisations et le pointage du site devront être raccordés ; une simple copie des données ne modifie pas automatiquement ces liaisons. La politique de confidentialité proposée et les données/prix définitifs gardent leur validation client propre.

## Incident réel et correction suivante
Une inscription humaine sur la session guidée de juillet est durable et confirmée. Exécution Google observée66,963s contre échéance45s du navigateur ; participant PENDING sans envoi marqué, avis Tema SENT. Le replay humain a retrouvé la réservation. Le traitement minute actuel n’envoie pas les mails PENDING, ce qui laisse ce canal sans reprise autonome. La recette réelle n’est donc pas validée, malgré les tests simulés de l’écran. GO explicite Sofiane pour enregistrement/réponse séparés des mails et calculs dérivés ; suivi dans spec-inscription-arriere-plan-demo.md, réalisation en cours. Aucun nouvel envoi par l’agent.

## Retour du candidat asynchrone : file PENDING à préserver

La suppression de `COPY_ASYNC_MAIL_JSON` rétablit la voie synchrone pour les nouvelles admissions. Elle suspend le worker et **ne termine pas les courriels PENDING déjà admis**. Le replay retrouve leur réservation sans envoi et sans duplication. Un retour à la version10 ne draine pas non plus cette file.

Avant toute bascule, sauvegarder hors dépôt la version Google, `COPY_ASYNC_MAIL_JSON` (date d’activation et unique ID de récupération autorisé), `COPY_ASYNC_MAIL_CURSOR` et les propriétés de limites/budgets consommés. Pour un retour planifié, terminer et contrôler les canaux éligibles avec le candidat asynchrone avant de rétablir la voie synchrone/version10. En cas de retour immédiat, relever les PENDING dans Inscriptions, conserver le cutoff et la configuration de récupération sauvegardés, puis reprendre explicitement le drainage avec le candidat corrigé et cette configuration d’origine, ou organiser une récupération manuelle contrôlée après vérification de chaque canal et tentative. Ne pas remplacer le cutoff par une nouvelle date : cela abandonnerait les admissions antérieures encore en attente. Ne pas élargir la récupération au stock historique.

Aucun budget n’est remis à zéro. Aucun état SENDING, UNKNOWN, FAILED ou BLOCKED n’est automatiquement réarmé. Un canal SENT reste intact ; une tentative ambiguë exige une vérification indépendante avant tout éventuel envoi manuel. La suppression d’une propriété ne constitue donc ni une preuve de drainage ni une fin de récupération. Ces procédures sont préparées ; leur exécution et les contrôles Google réels restent distincts des tests simulés.


## Activation asynchrone réelle et nouvel incident

Version11 activée dans le même déploiement COPY, candidat canonique330d605aed5ca7fefa1d2734776c7039748021a769f44c451c7425757f0f2f81. HEAD relu identique, manifeste et fichier natif conservés ; configuration privée datée côté serveur avec récupération limitée au seul participant autorisé. Le déclencheur minute existant a marqué ce canal SENT et Sofiane confirme sa réception. Le canal Tema garde son horodatage initial : aucun second envoi. Aucun nouveau participant créé par l’agent et aucun budget réinitialisé. Sauvegardes et export de contrôle dans le répertoire privé outbox-20261112.

La preuve de récupération autonome est acquise ; la preuve d’une nouvelle admission rapide reste ouverte. Un nouvel essai humain Dimo affiche le résultat inconnu après environ six secondes. L’exécution POST est terminée en6,143s ; l’export ne contient aucune réservation pour la cohorte ciblée. Une actualisation administrative concomitante dure55,7s et échoue. Le code conserve le ScriptLock pendant la synchronisation complète des tableaux, y compris validations et notes ; toute modification mail ou inscription relance cette synchronisation. Un conflit d’accès est donc probable, sans réponse HTTP capturée permettant d’affirmer BUSY. Le correctif suivant sépare entretien administratif et projection des inscriptions, raccourcit les sections critiques et ajoute un diagnostic phase/code sans donnée personnelle. Ne pas considérer la recette globale ni la fermeture réelle de page après nouvelle admission comme validées.


## État final après recette Google

Version14 active, même endpoint et mêmes accès, HEAD relu exactement égal au candidat canonique38e93d5ea8cf97edf6844b01daa91fc6c3a69c361d029184d1faf3903fe39ea9. Manifeste, fichier natif, scopes et déclencheurs conservés ; versions10–13 et sauvegardes privées disponibles pour retour. Le cutoff d’activation initial est conservé avec son unique récupération autorisée ; aucun stock historique supplémentaire n’est éligible.

Nouvelle inscription fictive de recette sur Divalto test1 : POST Google3,135s, confirmation observée3,739s. Page IAB fermée à17:44:01UTC alors que participant et Tema sont encore PENDING, export intermédiaire à l’appui. Sans navigateur, le déclencheur minute revendique le participant à17:44:22 puis le marque SENT à17:44:24 ; Tema revendiqué à17:44:31 et SENT à17:44:33. Ces horodatages prouvent le traitement après fermeture, pas la réception dans la boîte externe. La réception du précédent courriel récupéré avait été confirmée séparément par Sofiane. Aucun autre envoi pendant les tests de reprise/annulation.

Replay HTTP réel : REPLAY confirmé/SENT en4,078s, même réservation. Annulation par la cellule de statut du suivi et confirmation native : seule la fixture devient annulée, capacité3 et places restantes3 restaurées dans Sheet puis API publique. Nouveau replay REPLAY annulé/SENT en3,391s ; aucune nouvelle réservation ni tentative mail. Les19inscriptions préexistantes sont strictement identiques avant/après en valeurs/types. Les deux tentatives mail de la fixture sont inchangées après replay et annulation. Fixture conservée annulée, aucune suppression.

Le test réel a révélé un blocage préexistant du rendu : une validation Confirmée/Annulée survivait à clear et refusait les lignes déplacées. Nettoyage explicite du seul corps géré B15:F(maxRows), puis règles reconstruites aux bons participants. Un faux Google reproduisant réellement le refus assure la régression. Un second mécanisme d’interruption a été reproduit dans le harness : les retries minute invalidaient leur propre version pendant un rendu encore actif. Les retries pending conservent maintenant la version ; les vraies modifications l’invalident toujours. La responsabilité précise de chaque ancien échec Google reste une inférence. Le suivi final réel est publié, la fixture s’affiche Annulée avec les deux canaux Envoyé ; versions source/vue égales et drapeaux entretien/compteurs à0. Filtres identiques à l’état initial.

132tests standard,288COPY,9artefacts sans skip,21audit+2VM,24parcours ciblés sur Chromium/mobile/Firefox/WebKit, build/sécurité et diff-check passent. Le premier lancement browser a été empêché par le port4173 déjà utilisé par la démo ; relance isolée4174 passée24/24, serveur utilisateur préservé. La matrice UI complète précédente308/316 conserve uniquement8contrastes connus du rose initial explicitement demandé, sans modification UI/couleur dans cette tranche. Revue indépendante et vérification des cas de concurrence réalisées ; limites préexistantes de coordonnées de lignes déplacées par un humain, audit des décorations supprimées et notes de lignes vides consignées dans deferred-work, sans garantie transactionnelle des éditions natives Sheets.

Lecture finale des propriétés :10réservations/19destinataires consommés sur13/26, reste3inscriptions avec envoi/7destinataires. Liste autorisée interne et limites identiques au relevé initial, aucun reset. Quota Google quotidien distinct. La nouvelle fixture représente une inscription et deux courriels autorisés, uniquement vers les boîtes déjà autorisées. La réception externe et l’acceptation utilisateur globale restent à constater pendant la recette finale de Sofiane. Vercel et Git inchangés ; site local maintenu sur4173. Preuves brutes et sauvegardes restent privées dans outbox-20261112.


## Validation humaine et autorisation Git
Sofiane confirme le12novembre que son nouvel essai est rapide et sans blocage, qu’une seconde inscription active sur la même adresse est refusée et que les courriels sont reçus après environ une minute, délai qu’il accepte. Le parcours modifié et la réception côté participant sont donc validés humainement. Cette acceptation ne vaut ni recette client ni livraison Vercel. Sofiane demande explicitement de commiter tous les changements accumulés ; commit local sur la branche de travail, sans push ni fusion. Le relevé de budget10/19 ci-dessus précède cet essai humain et ne représente pas un compteur relu après celui-ci.
