# Couverture des pratiques réutilisables

Cette matrice vérifie la couverture de l'extraction. Les coordonnées privées du projet source, ses données, ses tickets et ses contraintes technologiques ne sont pas transférés.

| Pratique extraite | Destination commune |
|---|---|
| Discussion et validation des décisions avec l'utilisateur | `AGENTS.md`, `docs/workflow.md` |
| Investigation de l'existant et des antécédents d'un défaut | `docs/workflow.md` |
| Choix, exclusions, risques et critères avant réalisation | `docs/workflow.md`, skills BMAD natifs |
| Estimation en intervention humaine active | `AGENTS.md`, `docs/workflow.md` |
| Stories ancrées dans de vrais tickets, contexte exécutable | `docs/workflow.md`, Build et capacités d'epics/sprint installées |
| Préparation validée et GO de développement distincts | `AGENTS.md`, `docs/workflow.md` |
| Autonomie après GO et retour si le périmètre change | `AGENTS.md` |
| Revue critique, corrections et revalidation | revue native de Build, `bmad-code-review` ponctuel, `docs/workflow.md` |
| Tests proportionnés, preuves par niveau, limites explicites | `docs/workflow.md`, profil du projet |
| Lecture, modification ciblée et relecture Linear | `docs/workflow.md`, helper de configuration Linear |
| Clôture du livrable technique accepté, vérifié et intégré ; critères distincts du projet, de la recette et de la livraison | `docs/workflow.md` |
| Préservation du travail humain et des travaux indépendants | `AGENTS.md`, helpers sans écrasement |
| Réutilisation des composants, conventions et choix existants | `AGENTS.md`, contexte propre au projet |
| Commits de progression, push sur branches de travail et PR en brouillon dans le périmètre autorisé ; conventions anglaises et GO de fusion/livraison | `AGENTS.md`, `docs/workflow.md`, `scripts/project.py` |
| Dépôts multiples ou unique, PR selon les changements réels | profil du projet, `docs/workflow.md` |
| Candidat identifiable, compatibilité, ordre et récupération | `docs/workflow.md` |
| Contrôles de livraison avant clôture du livrable de livraison | `docs/workflow.md` |
| Contexte de feature en feature, décisions conservées et reliées | `docs/context.md`, `docs/project/` après initialisation |
| Reprise fondée sur les sources et les états actuels | `AGENTS.md`, `docs/context.md` |
| Rétrospectives utiles et correction de la documentation périmée | `docs/context.md`, `bmad-retrospective` |
| Isolation des diagnostics, secrets et livrables | `.gitignore`, `AGENTS.md` |
| Stable actuelle à l'initialisation et catalogue entier appris | `docs/bmad.md`, `scripts/bmad.py`, `docs/initialisation.md` |
| Capacités liées à la version, aux fichiers et aux preuves inspectées | `config/bmad-routing.json`, `config/bmad.lock.json`, `scripts/check.py` |
| Questions naturelles sur la méthode sans exécution fictive | `AGENTS.md`, `docs/bmad.md` |
| Informations pertinentes accessibles à un autre assistant | `docs/context.md`, handoff et index du projet |
| Contrôles et tests limités aux fichiers de la méthode, même après initialisation d'un produit | `config/method-files.json`, `scripts/method_files.py`, `scripts/test_method.py`, `tests/fixtures/` |
| Archives TOML/YAML confirmées avant écriture et reprise protégeant les modifications humaines | `scripts/project.py`, `docs/initialisation.md` |

Les règles relatives à une technologie, à un hébergeur, à des composants nommés, à un matériel de test, aux numéros de tickets ou à des dates de livraison deviennent des faits du **projet initialisé**. Les contradictions historiques et les limites anciennes ne deviennent pas des bonnes pratiques universelles.
