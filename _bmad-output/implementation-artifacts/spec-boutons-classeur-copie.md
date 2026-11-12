---
title: 'Ajouter une formation ou une session par bouton dans la copie'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'oneshot'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="GO explicite Sofiane : ajouter les deux boutons dans la copie">

## Intent

Le client doit pouvoir cliquer sur « Ajouter une formation » ou « Ajouter une session » et renseigner un formulaire guidé, sans insérer lui-même une ligne ou chercher les colonnes masquées. Les nouvelles données sont ajoutées dans le bon bloc logiciel des tables existantes de la copie privée `10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8`.

Conserver les couleurs, références stables, publication et ouverture explicites, capacités propres à chaque date et contrôles du prototype. Garder utilisable l’édition directe. Ne toucher ni au classeur actuel, ni au moteur TEST/site, ni aux inscriptions ou paramètres. Aucun envoi, déploiement web, commit ou push.

</frozen-after-approval>

## Implementation Notes

- Route courte : prolongement cohérent du prototype déjà autorisé, détails techniques délégués, aucun choix fonctionnel bloquant. Changements réversibles dans la copie sauvegardée, état Git antérieur connu et préservé. Branche tem-6-technical-trial, HEAD e95c5025409d4395956db366ddf960418785c26f.
- Présentation annoncée : onglet Accueil avec deux images-boutons natives assignées aux fonctions liées ; menu Tema Académie en complément ; formulaires HTML modaux. Aucun stockage parallèle des fiches. Accueil ne contient que les actions et la navigation.
- Réutiliser app/experiments/admin-sheet-prototype.gs : garde de copie, détection des sections et validation plan/localUtc. Ajouter admin-sheet-actions.gs, HTML, constructeur du bundle privé et tests ciblés. Le manifeste conserve currentonly et ajoute seulement script.container.ui pour les fenêtres du classeur.
- Critères : étant donné la copie, quand un bouton est cliqué, alors le bon formulaire s’ouvre ; quand les champs sont valides et envoyés, alors une fiche/session est créée une seule fois dans son bloc, avec identifiant stable ; étant donné une formation publiée, quand plusieurs dates sont ajoutées, alors elles partagent sa référence avec capacités distinctes ; quand le formulaire est annulé ou invalide, aucune ligne n’est créée et les saisies sont conservées ; quand le même envoi est réessayé, aucun doublon ; hors copie, aucune action. Les lignes préexistantes et les deux autres onglets sont inchangés.
- Vérification prévue : tests locaux du writer/contrôles/reprise, vrai clic sur les deux boutons dans Google, saisie de formation et de sessions, annulation/erreur, comparaison d’exports natifs avant/après et revue intégrée indépendante. Acceptation finale Sofiane et intégration produit restent distinctes.

- Réalisation dans la cible copie terminée : Accueil gid1006726952, deux boutons natifs et menu, formulaires HTML, création dans les tables sans double stockage. Dates/heures numériques des nouvelles sessions ; neuf colonnes C/D/E passées à None, anciennes valeurs strictement préservées. Formations et sessions restent éditables directement.
- Google réel : annulation sans ligne, fiche complète Divalto publiée, date passée refusée et saisies conservées, ajout/suppression de dates et focus vérifiés, lot de trois sessions 2027-06-09/07-07/08-11, 09:00–17:00, capacités/compteurs6/10/4, toutes ouvertes, une en présentiel. Exports :26fiches/8sessions antérieures et deux autres onglets identiques, ajout net1fiche/3sessions. Rapport docs/project/acceptance/admin-sheet-buttons-2026-11-04.md.
- 63tests locaux réussis, revue indépendante terminée et intégrité Google confirmée. `done` concerne la réalisation du prototype dans la copie, sans acceptation Sofiane ni intégration au produit. Aucun commit/push ; TEM-27 In Progress conservé. Limite multiutilisateur du prototype précédent toujours applicable.

## Review Triage Log

- medium → patch : erreur après insertion laissait des lignes vides ; valeurs préparées avant mutation, rollback des seules lignes encore vides, test failWrite conserve l’état initial.
- high → patch : changer le logiciel après réponse incertaine créait un second ID pour la même requête ; recherche du requestId dans les deux onglets indépendamment du logiciel, changement refusé et testé.
- medium → patch : réessai d’un lot raccourci accepté ; taille et appartenance du lot complet contrôlées, tests lot partiel/raccourci.
- medium → patch : sync pouvait abandonner sur verrou sans avertissement au formulaire ; retour vrai/faux explicite, notice de succès avec actualisation reportée testée.
- medium → patch : installation interrompue laissait Accueil incomplet ; prérequis avant création, rollback du seul nouvel onglet, test image failed. Réparation idempotente limitée à un accueil reconnu.
- medium → patch : ajout/suppression de date perdait le focus ; focus date ajoutée puis session survivante. Rejeu natif Google observé.
- high → patch : rollback reconnaissant seulement l’ID pouvait supprimer une nouvelle saisie humaine ; suppression désormais limitée aux lignes entièrement vides. Toute ligne avec donnée est conservée, erreur d’état incertain et test resize failed avec saisie conservée.
- medium → patch, recette Google : getUi depuis l’éditeur interrompait l’installation ; menu créé depuis onOpen, lanceur d’installation sans UI. Menu et boutons natifs observés.
- low → patch, recette Google : HYPERLINK produisait ERROR selon locale ; liens RichText natifs, export Accueil sans erreur.
- medium → patch, recette Google : second modal facultatif depuis le succès restait bloqué ; raccourci retiré, succès ferme puis commandes Accueil. Les deux boutons réels ouvrent les formulaires.
- high → patch, recette Google : bouton Ajouter une autre date non relié ; handler ajouté, ajout2/suppression2/réajout2/ajout3 puis enregistrement3 réellement vérifiés.
- medium → patch, recette Google : formats refusés sur colonnes Text ou plage multicolonne ; C/D/E des trois tables à None dans la copie, formatage D puis E séparé, contrainte simulée dans le faux adaptateur. Trois dates/heures numériques relues correctement dans l’export.
