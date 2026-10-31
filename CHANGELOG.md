# Historique du modèle agentique

Les versions ci-dessous concernent le modèle BKBX Agentic, indépendamment de la dépendance BMAD et des versions des produits qui l’utilisent. La présence d’une version sur une branche ne prouve pas son intégration ni sa publication.

## 1.0.1 — 29 octobre 2026

Correction compatible du socle initial 1.0.0 : gestion du cycle de vie des worktrees et suivi explicite des versions. Sofiane confirme que la V1 existante correspond à 1.0.0 ; cette évolution est donc 1.0.1. Aucun tag historique n’est créé rétroactivement.

### Ajouts

- Cycle de vie des worktrees : checkout principal sur la branche principale, réutilisation avant création, isolation selon le besoin, inventaire lisible et fermeture prise en charge par l’agent.
- Contrôle de chaque commit et sauvegarde des changements locaux, documents, fichiers ignorés utiles, preuves et binaires avant archivage. Respect des conversations actives et protections de l’app.
- Version du modèle et état des worktrees dans la passation, avec adoption volontaire et vérifiée par les projets existants.
- Fichier `VERSION`, présent historique et conventions d’évolution pour tracer les changements du socle.

### Préservé

Le workflow de préparation, les GO de développement/intégration/livraison, BMAD installé, le suivi Linear et la conservation du contexte restent en place. Aucun archivage automatique, outil de suppression, migration de projet existant ou mécanisme de mise à jour sans surveillance n’est ajouté.

## 1.0.0 — Socle initial, 18 octobre 2026

Version initiale identifiée comme 1.0.0 par Sofiane le 29 octobre. Le socle V1 a été publié initialement le 18 octobre 2026, puis documenté au commit `8217e52`. Les décisions et preuves sont conservées dans [les choix du socle](docs/framework/decisions.md) et [la validation](docs/framework/validation.md).

## Convention pour les prochaines versions

`VERSION` contient la version du modèle au format majeur.mineur.correctif. Augmenter le correctif pour une correction compatible, le mineur pour une capacité ou règle nouvelle compatible et le majeur pour un changement incompatible nécessitant une adaptation. Chaque évolution met à jour cet historique avec son périmètre, les contrôles et les éventuelles étapes d’adoption.

Une branche/PR porte un candidat. Après intégration et GO de publication, un tag `vX.Y.Z` peut identifier le commit exact publié ; ne pas déplacer un tag existant. Ne pas annoncer un tag, une release ou une adoption par un projet avant vérification. Les versions déjà publiées gardent leur entrée historique ; les corrections passent par une nouvelle version.
