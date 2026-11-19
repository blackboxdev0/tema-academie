---
title: Rétablir automatiquement la place après annulation
type: bugfix
created: '2026-11-19'
status: done
route: oneshot
baseline_commit: 822a3629e3cb0f43ee6a55713af8c4d321918b9c
---

<frozen-after-approval reason="correctif et préparation avant publication approuvés par Sofiane">

## Intent

Après une annulation depuis « Suivi des inscriptions » et sa confirmation, la place doit revenir et rester disponible sans commande manuelle. Conserver le dossier et ses états de courriel. Vérifier le parcours propriétaire réel sur le nouveau classeur avec une session fermée et des données fictives, sans envoi. Préparer et vérifier localement la configuration Vercel pointant vers ce classeur. Conserver le site public et la version publique Google jusqu’au GO de publication.

</frozen-after-approval>

## Implementation Notes

Le test du 19 novembre a observé une transition du compteur de 1 à 0 après annulation. Le responsable exact de la dernière écriture n’a pas été identifié. Le site et le suivi calculent déjà leur capacité à partir des confirmations. Le risque pour la cellule technique vient des lectures distinctes dans le recalcul et dans la maintenance. La production dispose déjà de Sheets v4 dans le déclencheur installé. Le test vérifie les valeurs persistantes après une exécution séparée et après maintenance.

Le contrôleur de production garde un recalcul en attente avant d’écrire le statut, puis vérifie ce statut par identifiant via Sheets v4. Le recalcul et la maintenance utilisent les mêmes inscriptions confirmées. Les écritures de compteur passent par Sheets v4, avec relecture du compteur et des entrées du calcul. La voie native COPY garde son comportement. Le build Vercel de préparation utilise le profil du classeur attesté et n’extrait que les fichiers web.

Recette réelle du déclencheur propriétaire. Le choix « Annulée » puis « Yes » a donné une place sans utiliser le menu d’actualisation. Les lectures Google et les exports avant et après maintenance ont confirmé 1. Les valeurs brutes des trois onglets sources sont identiques avant et après nettoyage. Le traitement d’envoi reste en pause avec plafond zéro. Le code final a été relu dans l’éditeur Google et les fonctions de recette ont été retirées. La version publique Google et Vercel servent leurs versions précédentes. Les 132 tests standard, les 409 expériences et les contrôles de build et de sécurité ont réussi. [Preuves](../../docs/project/acceptance/production-connected-2026-11-19.md) · [Préparation Vercel](../../docs/project/acceptance/vercel-production-preparation-2026-11-19.md)

## Review Triage Log

| Constat | Verdict et suite |
| --- | --- |
| Une lecture native périmée après le statut pouvait éteindre la reprise. | Medium. Attente posée avant écriture, statut contrôlé via Sheets v4. |
| La maintenance écrivait encore le compteur par un chemin natif non vérifié. | Medium. La maintenance production appelle le même calcul et évite l’écriture du compteur depuis son plan de présentation. |
| Le plan et l’acquittement pouvaient compter des confirmations différentes. | Medium. Les deux utilisent la même lecture Sheets v4 en production. Le recalcul des places passe avant le rendu administratif dans le chemin de maintenance. |
| Une insertion manuelle de ligne pouvait déplacer la cellule cible entre lecture et écriture. | Medium. La relecture compare l’identifiant et laisse la reprise ouverte. La reprise repart de la disposition courante et répare le compteur orphelin de la ligne vide. Le verrou du script ne sérialise pas une saisie humaine. |
| Une modification de capacité ou de confirmations pendant la mise à jour n’était pas vérifiée. | Medium. Comparaison après écriture des entrées et du résultat. |
| Une session historique ou une capacité invalide pouvait recevoir un message de succès ambigu. | Medium. Messages séparés, annulation conservée. |
| La reprise de tests contournait le déclencheur planifié et les lectures n’émulaient pas la vue native périmée. | Medium. Simulation d’une relecture native périmée, reprise via le déclencheur et tests concurrents sur capacité et placement de ligne. |
