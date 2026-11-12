---
title: 'Ajouter une formation et plusieurs sessions dans la copie Google'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'oneshot'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="GO explicite Sofiane dans le chat du 4 novembre">

## Intent

Rendre utilisable dans la copie privée le parcours déjà discuté : ajout direct d’une ligne de formation dans son bloc logiciel, publication, puis ajout de plusieurs sessions par choix dans une liste à jour. Identifiants générés, fiche réutilisée, horaires/capacités/ouverture propres à chaque date.

Sofiane autorise la réalisation et l’essai réel avec une formation fictive et plusieurs sessions, exclusivement dans la copie `10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8`. Garder les couleurs et sections. Ne modifier ni le classeur actuel, ni le site, ni le moteur TEST déployé. Aucune inscription ni notification. Inscriptions et Paramètres de la copie restent inchangés.

</frozen-after-approval>

## Implementation Notes

- Investigation : la copie a un projet lié distinct `1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA`, contenant le bundle copié mais aucune propriété de script. Sauvegarde privée du code et export du classeur avant intervention effectués. Ce projet seulement sera remplacé par un petit script gardé par l’ID de la copie et limité au document courant.
- Route courte : détails techniques délégués, aucun choix fonctionnel manquant, édition réversible dans la copie sauvegardée ; trois fichiers isolés dans app/experiments plus rapport/spec. Les modifications Git antérieures appartiennent au travail déjà identifié, préservées ; aucun commit demandé.
- Implémentation prévue : `app/experiments/admin-sheet-prototype.gs`, manifeste minimal et tests Node ciblés. Déclencheurs simples onOpen/onEdit : aucun trigger installable, service externe, mail ou déploiement web. La source de vérité reste les lignes des deux onglets ; les listes sont des validations natives.
- Critères : étant donné une nouvelle formation complète, lorsque Publiée est cochée, alors elle figure dans les choix du bon logiciel ; étant donné cette formation, lorsque trois dates sont ajoutées, alors trois IDs uniques référencent la même fiche avec capacités indépendantes ; lorsque titre/publication changent, alors liens stables et liste actualisée ; lorsqu’une date/heure/capacité est invalide ou le logiciel incorrect, alors ouverture refusée et diagnostic visible. Mauvais ID de classeur : aucune lecture/écriture. IDs existants et valeurs hors nouvelles lignes préservés.
- Vérification : tests de logique puis vrai ajout par UI Sheets, choix déroulant et déclencheurs automatiques (pas une fonction de semis déguisée), rechargement et exports avant/après. Revue intégrée indépendante BMAD à exécuter après réalisation. Ajouts fictifs conservés et identifiés pour la recette, aucun envoi.

- Réalisation terminée dans la copie : script dédié et manifeste `spreadsheets.currentonly` enregistrés, vérification du code par lecture native identique ; aucun déploiement ni trigger installable. Rapport et limites : `docs/project/acceptance/admin-sheet-journey-2026-11-04.md`. `done` qualifie la réalisation du prototype dans cette cible, sans acceptation finale Sofiane ni intégration produit.
- Surprise Google résolue : la validation personnalisée refuse le type Text des tables ; les trois colonnes B de sessions sont passées à None dans la copie. Premier onOpen échoué, réouverture finale Completed 4,275 s. Pas de succès initial réécrit.
- Test réel : nouvelle fiche Dimo puis publication et choix déroulant, trois sessions 2027-02-10/03-10/04-14, capacités/compteurs 8/12/4, IDs uniques, ouverture ; capacité0 ferme la troisième, réparation puis réouverture réussies. Une quatrième ligne temporaire de saisie rapide a été retirée après essai.
- Décision technique finale : retrait des valeurs par défaut de capacité/format des sessions après écrasement reproduit dans Google, y compris avec une première tentative de comparaison avant écriture. Les deux champs sont saisis explicitement, jamais écrits par le script ; les contrôles restent identiques. Rejeu natif final capacité/compteur12 réussi. Comparaison avant écriture conservée comme protection secondaire, sans garantie atomique.
- 32 tests locaux réussis, revue indépendante intégrée terminée ; tests du moteur/site non rejoués car ces fichiers n’ont pas changé dans ce périmètre. Export final : 25 fiches et5 sessions existantes identiques, une fiche/trois sessions ajoutées, deux autres onglets valeurs/formules strictement identiques. Aucun commit/push selon consigne actuelle ; modifications antérieures préservées.

## Review Triage Log

- high → patch : référence effacée ignorée par le filtre de lignes, session laissée ouverte ; ID/contenu/case vraie rendent désormais la ligne traitable, fermeture et diagnostic testés.
- high → patch : duplication d’une session conservait son ID ; nouvel ID attribué à la copie touchée, fermeture par défaut, original préservé ; test ciblé.
- medium → patch : éditions d’Inscriptions sans actualisation des compteurs ; onEdit réconcilie en lecture seule, faux adaptateur vérifie zéro écriture Inscriptions.
- medium → patch : compteur de session fermée non recalculé à l’ouverture ; compteur mis à jour avant sortie anticipée, test fermé 8−3=5.
- medium → patch : publication initiale invalide conservée sans édition ; validation de toute publication à onOpen, diagnostic et test durée absente.
- medium → patch : adaptateur, verrou et dates natives insuffisamment exercés ; tests onOpen/onEdit, lecture seule, validations par section, erreur Google/libération et session ouverte avec cellules Date ajoutés.
- medium → patch : case vraie seule ignorée sur ligne sans contenu ; publication/ouverture refusées, sans ID artificiel, tests des deux onglets.
- low → patch : correction de capacité laissait une note B ancienne ; revalidation forcée et note nettoyée, test de récupération.
- high → patch, constat de recette réelle : défaut de capacité écrasant la saisie rapide ; première correction insuffisante dans Google, défauts F/G retirés entièrement. Tests d’absence d’écriture F/G, saisie concurrente et rejeu natif12 réussis.
- medium → defer, limite confirmée du prototype : seconde édition pendant réconciliation peut laisser compteur/note transitoires jusqu’au prochain événement ; lecture/écriture non atomique et garde bornée. Champs humains F/G préservés, copie non liée à l’admission ; intégration transactionnelle/multiutilisateur à traiter séparément, entrée dans deferred-work.md.
