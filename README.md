# BKBX Agentic

Une méthode de travail réutilisable : **décrire le projet, cadrer ensemble, réaliser avec BMAD, suivre dans Linear et conserver les décisions d'une fonctionnalité à l'autre**. Aucun langage, architecture, type d'application ou hébergeur n'est imposé.

## Commencer

Créer un nouveau dépôt depuis ce modèle, ou cloner ce dépôt dans le dossier de travail du nouveau projet. Ouvrir ce dossier avec un agent qui lit `AGENTS.md` et découvre les skills locaux, puis expliquer naturellement :

> Je veux construire [description du produit]. Voici mon repository GitHub : [lien]. Voici mon équipe ou mon board Linear : [lien]. Initialise le projet avec cette méthode et commençons le cadrage.

L'agent vérifie les accès, initialise le contexte et prépare le suivi. Vous validez les choix et les GO convenus. Ensuite, vous pouvez simplement demander une fonctionnalité, signaler un problème ou reprendre un sujet ancien.

Le clone contient les vrais skills BMAD et leurs ressources, pour Codex et Claude Code. **Aucun skill BKBX supplémentaire n'est nécessaire.** Les instructions communes coordonnent BMAD, Linear et la continuité du contexte.

## Ce qui est préparé

- Le parcours habituel : story contextualisée → développement autorisé → revue et tests → recette → livraison vérifiée.
- Un parcours BMAD court pour une petite intervention et les outils de conception pour les grands chantiers.
- Le cycle Linear : `Backlog → Todo → In Progress → Review → Done`, avec correspondances adaptées à l'équipe.
- Des décisions documentées et un index des fonctionnalités pour retrouver le contexte lors des prochaines sessions.
- Des commits de progression, push sur branches de travail et PR en brouillon aux étapes utiles du périmètre autorisé, avec l'état réel des tests ; fusion principale et livraison gardent leurs GO.
- Une initialisation locale répétable, un contrôle de cohérence et un outil pour préparer les statuts Linear manquants.
- La stable BMAD actuelle à l'initialisation, son catalogue complet et une analyse de capacités liée à la version et aux fichiers installés.

Dans Linear, `Done` dépend du livrable entier convenu : une tâche technique se clôture après acceptation, vérification et intégration à sa cible. Le projet et ses tâches de recette ou de livraison conservent leurs critères propres ; la fin technique ne les clôture pas automatiquement.

## Prérequis

Un agent compatible avec les instructions et skills locaux, Git et Python **3.11+**. BMAD utilise aussi `uv` pour certains scripts. Node.js **20.12+** et npm ne sont nécessaires que pour réinstaller ou mettre à jour BMAD, déjà inclus ici. Ce sont des outils de la méthode, pas des contraintes sur le produit développé.

Connecter GitHub et Linear avec les droits nécessaires. Les liens identifient la destination ; ils ne remplacent pas l'authentification. L'agent utilise les connecteurs disponibles. Si la configuration des statuts n'est pas exposée par le connecteur Linear, le helper utilise l'API GraphQL officielle avec une clé conservée dans l'environnement ; aucune clé n'entre dans le dépôt.

## Commandes pour l'agent

L'utilisateur n'a pas à les apprendre. Depuis le dépôt :

```bash
python3 scripts/project.py doctor
python3 scripts/bmad.py status --online
python3 scripts/bmad.py catalogue
python3 scripts/project.py init --name "Mon projet" --brief "Le besoin à résoudre" \
  --github-url https://github.com/organisation/nouveau-projet \
  --linear-url https://linear.app/organisation/team/EQUIPE/all
python3 scripts/check.py
python3 scripts/test_method.py -v
```

`init` crée le profil et le contexte, adapte la configuration BMAD et conserve les fichiers existants. Il n'exécute pas les commandes du produit, ne crée pas de ticket et ne modifie pas les remotes Git. L'agent réalise et vérifie ensuite les étapes externes décrites dans [l'initialisation](docs/initialisation.md).

`bmad.py` est en lecture seule. Le contrôle stable interroge le tag npm officiel `latest` et distingue version identique, mise à jour disponible et contrôle indisponible ; il n'installe rien. L'agent lit l'inventaire entier et les entrées pertinentes avant de choisir sa route. Une analyse devenue périmée doit être refaite.

`check.py` contrôle les fichiers énumérés dans [l'inventaire de la méthode](config/method-files.json) et les ressources natives du verrou BMAD. `test_method.py` exécute seulement les modules de tests de cet inventaire, sur des copies temporaires avec configurations vierges. Ces commandes restent utilisables après l'initialisation d'un produit ; elles ne parcourent ni ses routes, ni ses fixtures, ni ses dépendances et ne lancent pas ses tests. Définir et exécuter séparément les contrôles du produit dans son profil. Lorsqu'un fichier de méthode est ajouté ou retiré, actualiser cet inventaire ; une ressource déclarée manquante reste une erreur.

Les statuts Linear peuvent être préparés en lecture seule, puis appliqués au périmètre autorisé :

```bash
python3 scripts/linear_setup.py --team EQUIPE plan
python3 scripts/linear_setup.py --team EQUIPE apply
```

Le helper utilise `LINEAR_API_KEY`, demande la création des seuls statuts manquants et relit le résultat. Les tickets, projets, labels et liens sont gérés par le connecteur pendant le cadrage validé. Une seconde exécution réutilise l'existant. Les réglages visuels et l'intégration GitHub native restent à vérifier dans Linear lorsqu'ils ne sont pas accessibles au connecteur.

## Lire au besoin

- [Initialiser un projet](docs/initialisation.md)
- [Dérouler le travail et synchroniser Linear](docs/workflow.md)
- [Conserver et retrouver le contexte](docs/context.md)
- [Comprendre les skills actuels et le cycle stable BMAD](docs/bmad.md)
- [Choix du socle et mise à jour de BMAD](docs/framework/decisions.md)
- [Couverture des pratiques](docs/framework/practices.md)
- [Vérifications et limites de cette version](docs/framework/validation.md)

BMAD **6.12.4** est actuellement installé et verrouillé pour reproduire ce candidat. La politique est d'utiliser la **dernière stable officielle**, puis d'apprendre son fonctionnement : ce numéro n'est pas une politique de version permanente. Build couvre les petites modifications et les stories, avec sa revue intégrée. La distribution MIT conserve ses fichiers natifs et sa [notice](THIRD_PARTY_NOTICES.md).
