# Méthode de travail

## Responsabilités

L'utilisateur décide du besoin, des arbitrages produit, des validations et des GO. L'agent prépare les choix techniques, exécute les skills BMAD, réalise et vérifie les changements et maintient le suivi. Un relais de gestion peut suivre les questions ; son rôle ne lui accorde pas les autorisations de livraison de l'utilisateur.

Linear porte le besoin convenu et les livrables à suivre. BMAD porte la préparation et l'exécution techniques. Le code et sa configuration renseignent le comportement constaté ; une spécification renseigne le comportement attendu. Les décisions documentent les arbitrages. Les preuves renseignent ce qui a effectivement été validé. En cas de contradiction, la résoudre explicitement ; ne pas décréter qu'un document ancien ou le dernier statut écrit a automatiquement raison.

## Parcours proportionné

1. **Comprendre** : examiner le besoin, l'existant et les antécédents pertinents. Pour un défaut, rechercher sa reproduction exacte avant de l'assimiler à un incident connu.
2. **Cadrer** : options, recommandation, périmètre, exclusions, risques, critères et estimation. Poser ensemble les questions importantes avec leur impact et poursuivre le travail indépendant autorisé.
3. **Préparer avec BMAD** : vérifier le [routage actuel](bmad.md), puis exécuter le skill natif pertinent. Dans l'inventaire analysé, `bmad-build` prépare sa spec depuis une intention libre ou une story identifiée ; il réutilise les entrées réelles d'epic/sprint et leur contexte. Conception et découpage supplémentaires seulement si le chantier les exige. La story ou spec contient les comportements testables, dépendances, conventions existantes, contrats, droits, cas limites et preuves demandées. Le [complément de feature](../templates/feature.md) peut servir de registre de liens et de décisions ; il ne remplace pas le vrai template BMAD.
4. **Valider la préparation**, la versionner et la pousser sur la branche de travail, puis obtenir le **GO de développement**. Référencer sa source humaine et son périmètre. Une estimation, une sélection de story ou un champ `authorized: true` écrit par l'agent ne valent pas autorisation.
5. **Réaliser** avec le parcours courant de `bmad-build`, proportionné au besoin. Respecter les étapes du skill, actualiser les tâches et préserver le travail indépendant. Sa voie `oneshot` ne remplace pas un GO de développement manquant. Une découverte qui modifie l'intention validée revient en discussion.
6. **Revoir et vérifier** : exécuter la revue native du parcours Build, trier les constats, corriger et revalider. Utiliser `bmad-code-review` pour une revue ponctuelle ou un contrôle supplémentaire justifié. Exécuter les tests pertinents du projet et comparer le résultat aux critères, pas seulement à l'implémentation. Documenter un risque accepté et qui l'accepte. Une revue interrompue, un reviewer indisponible ou un test obligatoire non exécuté ne sont pas verts.
7. **Remettre pour validation ou recette**, selon le livrable convenu : candidat identifiable, changements, résultats, limites, mode d'essai et points restant à valider. Définir des checkpoints cohérents pour un grand chantier plutôt qu'une approbation humaine à chaque sous-tâche.
8. **Livrer après le GO applicable** : vérifier l'état des dépôts et PR, fixer le candidat, préparer l'ordre des composants et les contrôles, puis vérifier le résultat disponible. Clôturer les seuls livrables réellement terminés.

La voie courte réduit les documents et les passages sans valeur pour le besoin. Les décisions, le contexte, les tests, la recette et les autorisations restent applicables. Un parcours plus complet s'emploie lorsque les incertitudes ou les dépendances le justifient. Une fois un skill choisi, suivre son vrai workflow, y compris ses checkpoints.

Le processus est exprimé en résultats plutôt qu'en anciens noms de skills. À l'initialisation et après mise à jour, l'agent apprend le catalogue entier et les entrées pertinentes, puis conserve son analyse liée à la version et à l'inventaire. Une version enregistrée rend le candidat reproductible ; elle ne fige pas la politique des nouveaux projets. Si l'utilisateur demande comment nous développons, expliquer ce parcours et les skills effectivement constatés, sans lancer un exemple produit.

## Organisation Linear

Un projet Linear regroupe une initiative fonctionnelle cohérente. Les issues sont des résultats concrets et vérifiables ; les sous-issues servent un découpage utile, les relations `bloque` / `bloqué par` décrivent les dépendances réelles. Les étapes du processus ne deviennent pas mécaniquement autant de tickets. Un ticket peut couvrir plusieurs stories ou dépôts : l'avancement d'une partie ne ferme pas le périmètre entier.

Les descriptions conservent l'état utile actuel : besoin, critères, questions numérotées, décision et liens. Les commentaires servent aux échanges et aux preuves datées. Reporter les décisions durables dans la description ou l'artefact concerné pour qu'elles ne soient pas accessibles uniquement en parcourant les commentaires.

| État logique | Condition |
|---|---|
| Backlog | Besoin en cadrage, questions ou préparation incomplète. |
| Todo | Ticket et préparation finalisés et validés ; GO de développement éventuellement attendu. |
| In Progress | Travail effectif après GO ; revue, tests et corrections encore en cours. |
| Review | Réalisation, revue et tests requis terminés ; validation, recette ou intégration convenue encore attendue. |
| Done | Livrable entier accepté, vérifié et intégré à la cible convenue ; critères de clôture propres au ticket satisfaits. |

Définir la cible et les critères de clôture de chaque livrable dès le cadrage. Une tâche technique peut être terminée lorsque tout son périmètre est accepté, vérifié et intégré à cette cible. Elle n'attend pas automatiquement la livraison globale du projet. Le projet, les tickets de recette et les tickets de livraison gardent leurs propres résultats à atteindre : la clôture technique ne les clôture pas. Des tests verts, BMAD `done`, un commit ou une fusion ne prouvent pas à eux seuls que ces conditions sont satisfaites.

Utiliser la correspondance de l'équipe, pas un identifiant codé en dur. Après un retour de recette nécessitant du code, repasser en `In Progress`, puis en `Review` après revalidation. Une discussion seule n'impose pas de changement. Un blocage temporaire reste décrit dans l'état fidèle à l'avancement ; `Canceled` et `Duplicate` sont des décisions de périmètre, pas des substituts de blocage.

### Synchronisation

À la reprise, après préparation validée, au démarrage, avant remise, à la reprise de corrections et après livraison :

1. Lire le ticket, ses relations, les statuts disponibles et la story. Identifier les changements humains.
2. Déterminer le statut selon les preuves du ticket entier et sa cible convenue. BMAD `review` peut encore correspondre à `In Progress` ; BMAD `done` peut correspondre à `Review` tant qu'une validation ou intégration requise reste attendue. Clore une tâche technique acceptée, vérifiée et intégrée ne change pas le statut du projet ou des tâches de recette/livraison par déduction.
3. Modifier seulement les champs nécessaires du ticket concerné. Ne pas écraser description, responsable, estimé ou relations pour une simple transition. Si l'état est déjà correct, ne pas le réécrire.
4. Relire le résultat et conserver le lien avec la preuve au jalon concerné. Le bilan distingue le travail réalisé de la synchronisation réellement vérifiée.

Après une réponse incertaine ou une indisponibilité, garder l'intention et la raison dans le handoff, puis relire avant de réessayer. Une réponse HTTP positive n'est pas une preuve suffisante si l'API signale une erreur ou un résultat partiel. La synchronisation est exécutée pendant le travail ; aucun service de surveillance en arrière-plan n'est installé par ces instructions.

### Checkpoints Git, BMAD et Linear

Les commits de progression, push sur branches de travail et PR en brouillon font partie du travail autorisé, sans nouvelle demande à chaque opération. Versionner la préparation acceptée et chaque avancement cohérent ; ne pas attendre la fin de tous les tests pour conserver une étape utile. Indiquer les tests réalisés, échoués ou restants. Créer la PR en brouillon au premier avancement poussé lorsqu'une branche de base existe. Préserver les fichiers des autres chantiers et ne pas pousser directement vers la branche principale sans GO.

Au même checkpoint, vérifier le suivi BMAD, les champs de statut du projet et des issues concernées, leurs descriptions et les liens vers les branches, commits et PR. Le projet peut être en cours dès le cadrage, sans autoriser le développement. Une description « en cours » ne met pas son champ de statut à jour. Avant une remise, relire Git et les états externes concernés ; signaler chaque fichier restant non commité, sa raison et toute synchronisation incomplète. Les restrictions humaines explicites plus récentes restent prioritaires.

Pour un checkout historique, lire les règles courantes depuis la branche principale distante vérifiée avant de réutiliser une ancienne interdiction. Ne pas modifier un checkout actif ni fusionner une branche entière pour obtenir ces instructions. Une fusion vers la branche principale, un déploiement ou une publication garde son GO propre.

## Estimer le travail

Présenter les jours de travail humain actif, généralement par demi-journées : cadrage, décisions, arbitrages, recette, livraison et réserve. Séparer les tâches autonomes de l'agent, les installations et tests sans intervention, les attentes externes et le délai calendaire. Préciser hypothèses et incertitude. Un estimé n'est ni un plafond d'exécution ni une autorisation de couper le périmètre accepté.

## Vérifier et livrer

Définir les contrôles du projet dans `config/project.json` (`verification.checks` et `verification.acceptance`). Décrire environnement, prérequis, résultat attendu et niveau de preuve ; les commandes ne sont pas exécutées automatiquement depuis ce fichier. Distinguer les tests isolés, les intégrations réelles et les parcours d'acceptation. Pour les effets externes, vérifier l'effet attendu, pas seulement la réussite technique d'un appel. Respecter la confidentialité des données de test et isoler les dispositifs simulés.

Préserver la compatibilité des composants déjà distribués. L'ordre de livraison suit les dépendances réelles du projet, sans imposer une infrastructure, une base ou un client particulier. Si des données changent, versionner leur évolution, vérifier les reprises, répéter sur des données représentatives autorisées et prévoir sauvegarde ou récupération adaptée.

Le candidat doit être identifiable par ses révisions et artefacts ; lorsqu'un commit reste empêché par une restriction applicable, consigner l'empreinte des changements et la raison. Les tests valent pour ce candidat : une modification ultérieure implique les contrôles pertinents. Distinguer livré, activé et disponible pour les utilisateurs.

Le plan de livraison indique périmètre, dépôts, versions, prérequis, ordre, GO, contrôles après livraison et stratégie de récupération. Une restauration destructive ne se déclenche pas comme une simple case de checklist. Résoudre les PR de livraison précédentes selon leur décision de conservation avant la livraison suivante, sans toucher aux travaux indépendants. Un seul dépôt peut avoir un changement ; aucune PR ni commit vide.

Après livraison vérifiée, synchroniser les tickets concernés et actualiser le contexte. Une rétrospective utile modifie les règles ou le contexte concernés avec la raison, au lieu d'accumuler une consigne générale pour chaque incident.
