# Administration Google — options à discuter, 8 novembre 2026

## Suite à la recette des formulaires

**Décision suivante de Sofiane : conserver la modification directement dans l’onglet Formations.** La proposition de formulaire d’édition ci-dessous est abandonnée. Les colonnes D:G/J/L ont été affichées dans la copie ; les données étaient présentes mais masquées. Identifiants et capacité interne restent masqués. Exports avant/après : sources métier, Accueil et formulaire strictement identiques en valeurs et types. Six cellules de la vue Suivi diffèrent pendant une actualisation, sans modification des sources. Aucun nouveau parcours de modification à développer.

Sofiane valide le fonctionnement de la création de formation native et demande de conserver une première page Accueil. Le choix entre formulaire classique et saisie dans le classeur sera proposé selon l’environnement du client. Les deux méthodes doivent rester sur les mêmes données et les mêmes règles.

Nouveau besoin discuté : rouvrir une formation après création avec tous ses champs. La vue Formations a des colonnes de contenu masquées ; le formulaire natif actuel n’a qu’un parcours d’ajout. Proposition, sans GO d’implémentation à ce stade : action Modifier une formation, choix par logiciel et titre, chargement de la fiche complète depuis la source, mode Modification explicite et bouton Enregistrer les modifications en bas. Mise à jour par identifiant stable, aucune recréation ; sessions rattachées conservées et détection d’une modification concurrente avant écrasement. Titre/logiciel, présentation, prérequis, programme, résultats, formateurs, durée, tarif/précision et publication restent accessibles. Les dates, capacités et inscriptions restent gérées dans leur parcours propre.

Le choix de l’interaction précise pour ouvrir la fiche et l’extension aux deux méthodes restent à discuter avant réalisation. Aucune mutation Google ou modification de code engagée par cette analyse.

## Besoin et état vérifié

Sofiane confirme que la sauvegarde d’une formation fonctionne en navigation privée. Il refuse d’en faire une contrainte quotidienne : le client doit pouvoir garder ses autres comptes Google connectés. Il signale aussi la lenteur d’ouverture. Aucun choix d’architecture ni développement supplémentaire n’est approuvé dans cette discussion.

Le contrôle natif de diagnostic a enregistré une seule fiche Dimo explicitement non publiée. La comparaison des exports avant/après conserve les 29 formations initiales, 15 sessions, 12 inscriptions et les paramètres. Cette photographie ne remplace pas les ajouts ultérieurs du client. Aucune permission, publication, opération Git ou enveloppe de courriel modifiée.

## Ce que le code actuel explique

`app/experiments/admin-sheet-actions.gs`, `show` appelle `options` avant `showModalDialog`. `options` appelle `TemaCopy.assertAdministrativeLayout`, qui lit Formations, Disponibilités et Inscriptions, puis relit Formations et Disponibilités et prépare les listes. Ce chemin est commun à la création d’une formation, qui n’a pourtant besoin que des trois logiciels fixes pour afficher ses champs.

Cette lecture peut être retirée du chemin d’affichage sans retirer les contrôles serveur au moment de sauvegarder. Pour les sessions, seule la liste des formations publiées est nécessaire pour commencer la saisie ; elle peut être chargée séparément et revalidée à l’enregistrement. Cela ne corrige pas la limitation multi-compte du pont HTML Apps Script et ne garantit pas un délai d’ouverture : aucune nouvelle mesure de performance n’a été effectuée pour cette analyse.

## Options et compromis

| Option | Expérience visée | Effort relatif et limites |
| --- | --- | --- |
| Alléger le formulaire HTML actuel | Champs affichés avant les lectures inutiles ; réutiliser un panneau pendant une séance de travail | Faible à moyen. Améliore le chemin d’ouverture, conserve le problème potentiel de session Google. |
| Saisie guidée native dans le classeur | Onglets Nouvelle formation / Nouvelles sessions, champs visibles, listes et dates natives, validation par case de confirmation ; traitement serveur à l’édition | Moyen. Évite le pont HTML à la sauvegarde. Déclencheur installé par le propriétaire, retour Enregistrement / Enregistré / erreur, contrôles et reprise nécessaires. Brouillons distincts à prévoir si plusieurs éditeurs travaillent en parallèle. Sauvegarde asynchrone et multi-compte à tester réellement avant toute promesse. Même classeur comme source, pas de second catalogue à maintenir. |
| AppSheet | Application Google avec formulaires et navigation dédiés | Moyen à élevé dans ce classeur : les tables multiples par onglet doivent être restructurées et les automatismes après écriture adaptés. Gmail seul n’inclut pas une licence. La synchronisation n’est pas une garantie de rapidité. |
| Petite administration web privée | Formulaires persistants, sélection explicite du compte autorisé, accès serveur au même classeur | Plus élevé : authentification et autorisation serveur, écritures contrôlées et maintenance à ajouter. Plus pertinent si l’administration devient fréquente ou s’élargit. |

## Proposition, sans décision acquise

Tester d’abord une saisie guidée native pour une formation dans la copie, avec plusieurs comptes connectés dans le Safari habituel. Mesurer séparément l’accès aux champs et la confirmation serveur. Vérifier refus, reprise, doublon et intégrité. Garder l’interface actuelle pendant l’essai ; aucun nouveau compte ni nouvel outil client requis pour cette piste. Le nombre d’éditeurs simultanés et la fréquence d’usage conditionnent le choix final. Si le rendu natif ne convient pas, réexaminer l’administration web limitée aux deux formulaires.

## Références techniques vérifiées

- [Google : limitation multi-compte Apps Script](https://developers.google.com/apps-script/guides/support/troubleshooting#issues_with_multiple_google_accounts).
- [Google : réduire les lectures et regrouper les opérations](https://developers.google.com/apps-script/guides/support/best-practices).
- [Google : déclencheurs installables, identité du créateur et édition de cellules](https://developers.google.com/apps-script/guides/triggers/installable).
- [AppSheet : tarifs et licences Workspace](https://about.appsheet.com/pricing/).
- [AppSheet : plusieurs tables d’un onglet à déplacer sur des onglets distincts](https://support.google.com/appsheet/answer/13829970).
- [AppSheet : coûts de synchronisation](https://support.google.com/appsheet/answer/10104985).
