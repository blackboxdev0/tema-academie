# Continuité du contexte entre fonctionnalités

L'objectif est de pouvoir reprendre une fonctionnalité plusieurs semaines plus tard en retrouvant son état, les décisions et leurs raisons. Cette continuité repose sur le dépôt et les liens Linear, sans dépendre de souvenirs personnels d'un agent. **Aucun export de conversations ni journal de chaque action.**

## Où conserver quoi

| Document | Responsabilité |
|---|---|
| `docs/project/project-context.md` | Connaissances utiles au produit : domaine, comportements, conventions techniques, composants communs, contraintes, faits datés et sources. |
| `docs/project/features.md` | Index succinct des fonctionnalités, liens Linear, stories, décisions, état vérifié et points ouverts. |
| `docs/project/decisions/` | Décisions significatives : problème, options utiles, choix, raison, conséquence, auteur/source et remplacement éventuel. |
| `_bmad-output/` | Artefacts BMAD, stories exécutables, notes de réalisation et preuves de validation. |
| `docs/project/handoff.md` | Situation présente : travail en cours, candidat, autorisations, résultats et limites, attentes et prochaine action. |
| Linear | Besoin convenu, livrables, dépendances, questions, décisions utiles au ticket et liens de preuve. |
| `config/bmad-routing.json` et [référence BMAD](bmad.md) | Capacités et routes inspectées, liées à l'installation exacte ; état local revérifié à la reprise. |

Conserver une information détaillée à un endroit, puis créer des liens. L'index d'une feature peut tenir en une ligne. Une décision simple peut être consignée dans la story ; un choix durable ou partagé mérite un [document de décision](../templates/decision.md). Ne pas créer de document vide pour chaque échange.

Retenir toute information pertinente susceptible de changer une décision future : vocabulaire métier, intention fonctionnelle, raison d'un arbitrage, dépendance, règle d'accès, limite de validation, hypothèse d'estimé ou particularité d'une intégration. Distinguer décision humaine, constat vérifié, hypothèse et question ouverte. Une information incertaine garde sa limite et la preuve manquante ; elle ne devient pas vraie au changement d'assistant.

## Quand actualiser

- Après un arbitrage qui change le comportement, l'architecture, le périmètre ou une contrainte commune.
- Lors d'un jalon significatif : préparation validée, remise pour recette, correction importante, livraison.
- Avant une fin de session ou une passation, pour que les prochaines actions et limites soient retrouvables.

L'agent s'en charge dans le travail courant et versionne les connaissances aux checkpoints utiles, avec les autres artefacts du périmètre autorisé. Les commits de progression et push sur branche de travail ne nécessitent pas de nouvelle demande ; une restriction humaine plus récente reste prioritaire. Les connaissances sont portables avec le checkout et, après commit/push, avec le dépôt partagé. Une fusion vers la branche principale ou une publication conserve son GO propre.

## Ce qui fait une trace utile

Décrire le résultat et la raison : « parcours validé avec telle contrainte, option écartée pour telle raison », avec sa source. Noter qui a décidé, la date pertinente et le périmètre. Pour une autorisation, pointer vers la demande humaine ou une référence conservée, sans recopier la conversation ni inventer une approbation.

Garder les décisions remplacées et les relier à la nouvelle décision avec leur statut. Préserver les preuves de l'ancien candidat lorsqu'une correction impose de retester. Dater les faits techniques qui dérivent : versions, environnements, réglages externes et état de livraison. Une limite connue ne devient pas une convention à reproduire sur les nouveaux composants.

## Reprendre un sujet

1. Lire le handoff et le contexte commun.
2. Retrouver la feature dans l'index, puis lire ses décisions et les artefacts BMAD nécessaires.
3. Relire le code, Git et Linear pertinents. Comparer le constat actuel aux dernières preuves.
4. Expliquer brièvement ce qui est établi, ce qui a changé et l'action proposée. Reprendre le parcours BMAD utile.

Ces sources sont à lire lorsqu'elles sont pertinentes, y compris avec un autre fournisseur d'assistant. `CLAUDE.md` renvoie aux mêmes instructions ; les deux catalogues natifs et le contexte voyagent avec le checkout. Aucune mémoire personnelle ni conversation externe n'est un prérequis. La maintenance courante des connaissances suit ces règles ; l'éventuelle formalisation des instructions par `bmad-project-context` respecte aussi ses propres checkpoints de validation.

Un lien historique devenu indisponible reste identifié comme tel ; ne pas recréer silencieusement un ticket supprimé ou attribuer un ancien identifiant à un nouveau besoin. La source de la décision peut rester dans les artefacts malgré l'absence du ticket.

Une erreur dans le contexte se corrige à sa source, avec la raison si elle influence des décisions. La passation est un état courant concis, pas une copie complète des documents.

## Version du modèle et carte de travail

Le handoff identifie la version du modèle présente (`VERSION`) et la révision source adoptée lorsqu’elle est connue ; la version BMAD et les versions du produit sont distinctes. Conserver une carte concise des worktrees et la raison de ceux laissés ouverts, selon [leur cycle de vie](workflow.md#cycle-de-vie-des-worktrees). Ne pas recopier tous les fichiers ni une conversation.

Une mise à jour du dépôt maître n’actualise pas ses projets dérivés. Comparer le changelog, les fichiers de méthode et les adaptations locales, adopter à un checkpoint cohérent, exécuter les contrôles de méthode et ceux du projet concernés, puis consigner la version/révision réellement adoptée. Un simple changement du numéro `VERSION` ne prouve pas l’adoption des règles. Ne pas écraser le contexte produit ni mettre à jour une story en cours à son insu.
