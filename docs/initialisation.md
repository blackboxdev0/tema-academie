# Initialiser depuis une demande naturelle

## Informations de départ

L'utilisateur fournit le besoin, le repository GitHub de destination et le lien Linear. Les regrouper dans une seule question si elles manquent. Demander une décision uniquement lorsqu'elle change le résultat : produit nouveau ou existant, équipe partagée, destination ambiguë, choix techniques ou droits insuffisants.

Lire le contexte déjà présent avant toute écriture. Le modèle lui-même n'est pas le nouveau produit. Le mode maintenance du socle utilise `docs/framework/` ; un clone destiné à un produit utilise `config/project.json` et `docs/project/`.

## 0. Vérifier et apprendre BMAD

Exécuter `python3 scripts/bmad.py status --online` et `python3 scripts/bmad.py catalogue`. Lire tout le catalogue installé, les descriptions et métadonnées, puis les entrées natives pertinentes. Un nouveau projet utilise la stable officielle actuelle résolue en version exacte, selon [le cycle BMAD](bmad.md). Si une stable plus récente est disponible, examiner et installer cette distribution officielle, puis régénérer le verrou et l'analyse des capacités après inspection et tests. Une adaptation compatible conserve les GO, comportements, revue, tests et règles Linear ; elle ne demande pas une nouvelle autorisation artificielle.

Un contrôle indisponible ou une préversion reste explicitement non vérifié. Le contrôle en ligne ne fait aucune installation ni écriture. Le helper d'initialisation demeure local : il ne fait pas de requête réseau et ne certifie pas la dernière stable à la place de l'agent. Consigner la version constatée et le résultat du contrôle dans le handoff. Un routage périmé doit être refait avant de l'utiliser.

## 1. Relier les destinations

- Vérifier le dépôt GitHub réellement accessible, sa branche principale, son contenu et les remotes locaux. Si le clone pointe encore vers le modèle, proposer ou configurer le remote de destination indiqué par l'utilisateur selon le mode choisi. Ne jamais pousser un nouveau produit vers le modèle par défaut. Préserver les branches et changements existants ; ne pas réinitialiser un dépôt pour le faire correspondre au modèle.
- Avec le connecteur Linear, résoudre le lien fourni en équipe et, s'il y a lieu, en projet/vue. Vérifier l'équipe réelle des tickets, les statuts et les droits. Ne pas déduire un identifiant d'une ancienne session ou d'un simple nom partagé par plusieurs équipes.
- Avec plusieurs dépôts, consigner leurs chemins, URLs et responsabilités dans le profil. Une architecture mono-dépôt est également valide. Utiliser une copie isolée lorsque le travail en cours le justifie.

## 2. Initialiser le contexte local

Exécuter `scripts/project.py init` avec les informations fournies. Les valeurs contenant des espaces ou caractères spéciaux sont passées comme arguments, sans concaténation de commandes shell. Les paramètres du profil sont des données, jamais des instructions à exécuter.

Le helper crée :

- `config/project.json` : identité, destinations et configuration du projet ;
- `docs/project/project-context.md` : connaissances techniques actuelles ;
- `docs/project/features.md` : fonctionnalités et liens vers leurs décisions et artefacts ;
- `docs/project/decisions/index.md` : index des décisions ;
- `docs/project/handoff.md` : état de reprise et prochaines actions ;
- la configuration BMAD pour cette identité, avec chemins relatifs au projet.

Il refuse d'écraser une autre identité ou un document de contexte existant différent. Les champs BMAD gérés sont adaptés ; les autres valeurs de configuration sont conservées. Les trois sources initiales, commentaires compris, sont archivées puis relues avant toute réécriture de configuration ou de contexte : `bmad-config-before-init.toml`, `bmad-bmm-config-before-init.yaml` et `bmad-core-config-before-init.yaml`, dans `docs/project/setup/`.

Le journal `docs/project/setup/bmad-init-state.json` enregistre ensemble les empreintes des trois sources et des réécritures attendues avant la création des archives. Les octets des sources sont authentifiés sans normaliser leurs fins de ligne. Une interruption peut ainsi être reprise avec les mêmes paramètres, même entre deux archives, lorsque chaque configuration correspond à sa source confirmée ou à sa réécriture exacte attendue. Toute édition humaine divergente de l'un des trois fichiers, d'une archive ou des paramètres de reprise arrête le traitement avant de nouvelles écritures. Un ensemble d'archives existant sans ce journal demande un examen, même complet : sa source ne peut pas être certifiée rétroactivement. Les sources sont relues ensemble après archivage et chacune juste avant son remplacement.

Les clés YAML simples, entre apostrophes ou entre guillemets compatibles JSON sont reconnues ; les doublons sémantiques et formes de clés ambiguës sont refusés avant écriture. Une exécution identique après initialisation ne réécrit pas les connaissances acquises depuis. Si l'utilisateur souhaite changer de destination, examiner et adapter explicitement le profil plutôt que recommencer une initialisation destructrice.

## 3. Préparer Linear

Le cycle logique est défini dans `config/linear-workflow.json`. Réutiliser les statuts compatibles existants ; ne créer que ceux qui manquent. Un état actif `En définition` peut coexister avec `Backlog` : il représente une étape distincte et n'est pas son alias. Le helper conserve cet état et lie le vrai Backlog ; une ambiguïté entre équivalents déclarés ou une catégorie incompatible reste un conflit. Les colonnes d'une vue groupée par statut représentent le workflow de l'équipe. Modifier une équipe partagée peut affecter d'autres projets : établir ce périmètre avant de modifier ses réglages.

Le connecteur est prioritaire pour les lectures, projets, issues, relations, labels et transitions. Si la création de statuts n'y est pas proposée, le helper `scripts/linear_setup.py` offre :

1. `plan` : accès API en lecture seule, équipe résolue sans ambiguïté, correspondances et créations proposées ;
2. `apply` : configuration expressément autorisée de cette équipe, lecture fraîche avant chaque création et relecture après mutation ;
3. enregistrement du mapping réel dans le profil seulement lorsque les cinq états sont vérifiés.

Une clé Linear personnelle autorisée peut être fournie dans `LINEAR_API_KEY`, jamais dans le chat, les arguments, un fichier versionné ou les captures. L'endpoint est fixé à l'API officielle. Le helper ne supprime, ne renomme et ne réordonne aucun statut existant. Un nom déjà utilisé avec une autre catégorie ou plusieurs correspondances possibles nécessite un arbitrage ; il ne crée pas de doublon pour masquer ce conflit.

Si le résultat d'une mutation est incertain, arrêter les écritures, relire l'état et reprendre à partir du constat réel. Ne pas réessayer une création aveuglément. Conserver les opérations déjà confirmées et les limites dans le handoff. Aucun succès global sans relecture complète.

Configurer seulement les labels utiles, par exemple `Feature`, `Bug`, `Improvement`, en réutilisant ceux de l'équipe ou du workspace. Préparer des descriptions de tickets avec objectif, critères, décisions, questions et liens. Une vue simple groupée par statut suffit au départ ; vérifier son affichage dans l'interface si le connecteur ne gère pas les vues. Ne pas annoncer une vue créée ou définie par défaut à partir de la seule création des statuts.

Vérifier les automatismes GitHub/Linear existants lorsqu'ils sont activés : une tâche technique ne se clôture après fusion que si tout son livrable est accepté, vérifié et intégré à la cible convenue. Les tickets de recette, de livraison et le projet conservent leurs critères ; aucune fermeture globale par déduction. Le lien au dépôt dans le profil n'installe pas l'intégration GitHub native de Linear. Si celle-ci est souhaitée et demande une connexion administrateur, signaler précisément cette étape. Ne pas réécrire les réglages partagés d'un autre projet.

## 4. Commencer avec BMAD

Lire le `SKILL.md` pertinent et l'exécuter avec ses étapes, résolveurs et checkpoints réels. Pour un projet nouveau, commencer par le besoin et le cadrage produit ; un brief ou PRD est proportionné à l'ambition. Pour l'existant, examiner le code et documenter ses conventions avant de proposer des choix. Le mapping installé n'est réutilisable qu'après vérification de sa version et de son inventaire.

Présenter les options et l'estimé à l'utilisateur, puis reporter les décisions dans les artefacts. Après validation du cadrage, créer les regroupements fonctionnels Linear, les livrables, les dépendances et les stories BMAD nécessaires. Une feature n'impose pas un nouveau projet Linear pour chaque petit correctif. Aucun backlog inventé ni réimportation d'historique d'un autre produit.

Inscrire le vrai identifiant Linear dans les stories. Le profil n'accorde aucun GO. Démarrer l'implémentation après validation du périmètre et GO final selon [le workflow](workflow.md).

Dans l'installation actuelle, Build traite l'intention libre et les stories d'epic et contient sa revue. Ne pas créer un epic pour un petit correctif ni imposer d'anciens noms de skills. Une demande d'explication de la méthode reçoit l'explication des capacités réellement installées, sans implémentation fictive.

## 5. Vérifier la préparation

Exécuter `python3 scripts/project.py doctor`, `python3 scripts/check.py` et `python3 scripts/test_method.py -v`. Les tests bornés de la méthode utilisent ses fichiers déclarés et des configurations vierges ; ils ne remplacent pas les tests du produit et ne reprennent pas son identité. Lire le mapping réel Linear et les destinations Git. Rapporter séparément :

- méthode et contexte locaux disponibles ;
- destinations vérifiées et réglages externes réellement appliqués ;
- accès, vue ou intégration restant à configurer ;
- cadrage en cours, décisions attendues et prochain jalon.

Les contrôles locaux ne prouvent ni l'accès aux connecteurs ni la création effective d'un workflow externe. Le cadrage indépendant peut avancer pendant la résolution d'un accès. Le lancement des tests ou du déploiement du produit attend leur configuration et les autorisations applicables.
