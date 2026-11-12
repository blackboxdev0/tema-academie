---
title: 'Clarifier la remise à vide et placer un bouton d’enregistrement en fin de fiche'
type: 'feature'
created: '2026-11-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="Sofiane demande de clarifier Préparer une autre fiche, placer Enregistrer après le contenu facultatif et lui donner la forme d’un bouton">

## Intent

Dans l’onglet Nouvelle formation de la copie privée, remplacer l’action Enregistrer par un bouton natif cliquable situé après tous les champs facultatifs. Clarifier la remise à vide : le formulaire seul est effacé, les formations enregistrées restent dans le catalogue. Préserver les saisies en cours, les identifiants, le brouillon par défaut et la reprise sans doublon.

Tester le bouton dans Safari avec les comptes déjà connectés avant de le présenter comme fonctionnel. Conserver le classeur actuel, les sources antérieures, l’ancien TEST/PROD et la version web. Aucun envoi, partage, nouveau scope, commit ou push. Une fiche de contrôle supplémentaire non publiée dans la copie est la limite de la recette réelle.

</frozen-after-approval>

## Implementation Notes

- Route courte : itération réversible du prototype autorisé, sans nouveau choix fonctionnel bloquant. État Git antérieur identifié et préservé. Garde COPY et writer métier inchangés ; nouveau point d’entrée natif du bouton, même traitement de formulaire, sans inventer un événement de déclencheur.
- Modifier `app/experiments/admin-native-form.gs` et ses tests. Coordonnées des contenus facultatifs stables. Déplacer publication et commandes après Formateurs, masquer les anciennes lignes d’action, migrer publication et statut sans réinitialiser la saisie ni la requête. Bouton image natif assigné à la fonction liée, asset déterministe embarqué sans dépendance réseau. Le déclencheur d’édition existant garde la remise à vide native.
- Libellé secondaire Vider le formulaire, explication explicite que les fiches enregistrées sont conservées. Verrous, états incertains et réessais conservés. L’ancien bouton/case ne reste pas actif au milieu.
- Critères : étant donné un formulaire renseigné, quand la mise en page est actualisée, alors champs, publication et requête sont conservés ; quand l’utilisateur termine le contenu facultatif, alors l’enregistrement est après le dernier champ ; quand le bouton est réellement cliqué dans Safari multi-compte, alors refus valide ou sauvegarde unique avec contenu facultatif sont visibles ; quand le formulaire est vidé après succès, alors la fiche enregistrée reste en source.
- Vérification : tests ciblés et suite administration, export natif avant/après et intégrité typée, recette Safari du vrai clic et capture de remise. Revue indépendante courte. Performance du writer, sessions natives et multiéditeur hors de cette itération.
- Installé dans l’onglet existant de la copie, sans nouvel onglet ni déclencheur : bouton image assigné à enregistrerSaisieNativeTema après Formateurs, publication B55, statut B61:H63, remise à vide B65 avec explication B67:H69. Anciennes actions retirées et lignes18–27 masquées ; coordonnées des contenus facultatifs inchangées. Saisie humaine, publication cochée, état SAVED et UUID préservés.
- Safari multi-compte : vrai clic Running/Finished script et réponse de fiche déjà enregistrée sans doublon. Aucune nouvelle fiche créée dans cette passe afin de préserver la saisie présente. Exports :33 formations/15sessions/12inscriptions, Paramètres et Accueil identiques. Module natif relu identique au candidat local. Rapport docs/project/acceptance/native-form-2026-11-08.md, preuves privées native-button-20261108.
- 143 tests administration réussis, dont28 ciblés, revue courte et diff check terminés. Aucun commit/push ; réalisation dans la copie terminée, acceptation du rendu Sofiane ouverte, TEM-27 reste In Progress.

## Review Triage Log

- medium → patch : image partielle portant le titre sans script bloquait la réparation ; absence de script désormais réparable, fonction étrangère refusée. Interruption puis reprise testées avec un objet image mémorisant réellement son assignation.
- medium → patch : remise à vide en attente de verrou sans explication du réarmement ; message contextualisé indiquant décocher puis recocher pour cette commande. Bouton Enregistrer invite à cliquer à nouveau. Les deux cas sont testés.
- medium → patch : migration DRAFT effaçait un message de validation et sa couleur ; message et état visuel conservés, seule l’ancienne consigne initiale est actualisée. Test d’un refus visible conservé.
- medium → patch : faux objet image renvoyait une fonction fixe, masquant une assignation absente ; titre/script mémorisés, assertion de la fonction globale assignée et invocation réelle de celle-ci vers le faux writer.
- medium → patch : couverture V1→V2 incomplète ; fixtures V1 avec contenus facultatifs et état SAVED/SAVING/UNCERTAIN, empreinte et snapshot. Conservation des valeurs/publication/UUID vérifiée, aucun second writer pour SAVED, reprise de l’envoi initial pour les deux autres états.
