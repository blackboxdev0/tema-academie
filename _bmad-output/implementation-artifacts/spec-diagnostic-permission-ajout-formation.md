---
title: 'Diagnostiquer le refus Google lors de la sauvegarde d’une formation'
type: 'bugfix'
created: '2026-11-08'
status: 'in-progress'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Sofiane signale PERMISSION_DENIED lors de la sauvegarde dans le formulaire de la copie">

## Intent

Identifier et résoudre le refus Google à la sauvegarde d’une nouvelle formation dans la copie administrable. Préserver les données saisies et vérifier la sauvegarde réelle, sans toucher au classeur d’origine ni élargir les droits ou les budgets d’envoi.

</frozen-after-approval>

## Implementation Notes

- Périmètre de diagnostic autorisé par le signalement utilisateur et le parcours de recette de la copie. Aucun commit/push, aucun mail. État Git attendu des travaux précédents conservé.
- Deux exécutions Google natives `enregistrerAjoutTema` du 8 novembre 11:14:18 et11:15:39 affichent Unknown/Failed/0s ; les ouvertures `ajouterUneFormation` et le déclencheur propriétaire réussissent. Pas de trace détaillée exposée pour ces deux échecs.
- Export natif préalable hors dépôt :29formations/15sessions/12inscriptions, soit aucun ajout par rapport à la fin de la campagne précédente. Sauvegarde privée dans `~/.config/tema-academie/permission-save-20261108/`.
- `admin-sheet-actions.html` appelle la fonction liée par `google.script.run` ; aucune lecture de localStorage/cookie dans ce formulaire. Google documente l’absence de support multi-compte pour Apps Script ; vérifier cette hypothèse avec l’utilisateur et une sauvegarde depuis le compte propriétaire avant toute modification de code.
- Essai prévu : une formation marquée diagnostic, non publiée, sans session ni inscription ; comparaison par ID des sources avant/après. Une intervention de session utilisateur ne pourra pas être annoncée corrigée sans sa confirmation.
- Contrôle natif réalisé : une formation diagnostic Dimo non publiée ajoutée avec succès ; exports comparés par ID et type, 29 formations initiales /15 sessions /12 inscriptions et paramètres préservés. Aucun code ni droit Google modifié.
- Sofiane confirme la sauvegarde en navigation privée, puis précise que l’isolation du compte n’est pas une solution client acceptable. Le problème de session est étayé ; le parcours habituel multi-compte reste à résoudre et n’est pas accepté comme corrigé.
- Discussion suivante : lenteur à l’ouverture, lectures inutiles constatées avant affichage et alternatives natives Google / administration privée. [Analyse du 8 novembre](../../docs/project/acceptance/admin-ux-options-2026-11-08.md). Options proposées seulement, aucune nouvelle implémentation engagée.
