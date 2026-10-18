# BMAD : capacités actuelles et évolution

La méthode reste : comprendre l'existant, cadrer les choix avec l'utilisateur, préparer un résultat testable, obtenir le GO applicable, réaliser, revoir, tester, faire la recette puis livrer après autorisation. Linear reflète les preuves du livrable entier. Les décisions et informations pertinentes restent dans les fichiers du projet. Les noms des skills et la forme des artefacts peuvent évoluer ; ces obligations restent applicables.

## Découvrir l'installation

À l'initialisation et après une mise à jour :

```bash
python3 scripts/bmad.py status --online
python3 scripts/bmad.py catalogue
```

Le premier contrôle compare la version installée au tag `latest` de l'API npm officielle, en lecture seule. Une erreur réseau, un résultat mal formé ou une préversion donnent `unavailable` et un code de sortie non nul, jamais « à jour ». `installed_ahead` signale une différence à examiner. Ces commandes n'installent rien et ne régénèrent aucun fichier.

Lire **tout** le résultat du catalogue : les deux répertoires de déploiement, les descriptions du manifeste et toutes les lignes d'aide, y compris phases, actions, arguments, dépendances recommandées et sorties lorsqu'ils sont déclarés. Les agents sans ligne d'aide restent inventoriés. Les champs manquants ne sont pas inventés. `source_path` garde le chemin source officiel ; `paths` donne les vraies entrées Codex et Claude Code. Les skills humains complémentaires apparaissent séparément dans `additional_skills`, hors verrou officiel ; leur présence n'invalide pas les capacités BMAD. Les fichiers natifs manquants, chemins sortant du checkout, identités divergentes et noms `bmad-*` inconnus font échouer le contrôle, sans supprimer de fichier.

Lire ensuite les `SKILL.md` pertinents et leurs ressources au moment prévu par chaque workflow. Pour Build, exécuter le renderer demandé par son entrée, puis suivre le snapshot indiqué ; ne pas démarrer directement un fichier source. Le renderer et ses snapshots ne constituent pas des skills personnalisés. La configuration personnelle n'est pas nécessaire : les valeurs portables et les faits de Build/Code Review existent dans `_bmad/custom/`.

## Analyse du candidat installé

Inventaire analysé le 17 octobre 2026 : **BMAD 6.12.4, 29 skills natifs par outil**, sans alias dépréciés. Le [verrou](../config/bmad.lock.json) conserve la provenance officielle et les empreintes ; le [routage](../config/bmad-routing.json) lie les capacités inspectées à cette version et à l'inventaire exact. `scripts/bmad.py status` et `scripts/check.py` rejettent une analyse périmée, un lien de preuve absent ou un résultat invariant non couvert. Ils ne peuvent pas prouver qu'un agent a lu un fichier : l'inspection fait partie du travail de l'agent.

| Besoin | Capacités natives de cette installation |
|---|---|
| Feature, correctif autonome ou story identifiée | `bmad-build` : clarification, investigation, spec, implémentation, revue intégrée, présentation. |
| PRD, brief, UX, architecture | `bmad-prd`, `bmad-product-brief` ou `bmad-prfaq`, `bmad-ux`, `bmad-architecture`, selon les incertitudes réelles. |
| Epics et suivi de sprint | `bmad-create-epics-and-stories`, puis `bmad-sprint-planning`, qui couvre aussi readiness, status, validate et fix. |
| Condenser des sources en contrat fonctionnel | `bmad-spec` : `SPEC.md`, compagnons utiles et mémoire locale de décisions ; ses dérivations restent sous son contrôle. |
| Revue supplémentaire ou ponctuelle | `bmad-code-review` ; les lenses de `bmad-review` sont utilisées selon leurs déclencheurs natifs. |
| Automatiser des tests de code existant | `bmad-qa-generate-e2e-tests` lorsque pertinent ; les tests du projet restent requis sans ce skill. |
| Instructions du dépôt, aide, retour sur un epic | `bmad-project-context`, `bmad-help`, `bmad-retrospective`, selon leur intention native. |

Cette table explique les capacités ; le catalogue complet reste la référence pour les autres skills, leurs déclencheurs et leurs modalités. Expliquer ce tableau et le processus suffit à répondre « comment développes-tu et quels skills utilises-tu ? ». Cette question n'autorise aucune création de produit, ticket ou artefact de démonstration.

## Choisir une route proportionnée

- **Petit changement autonome** : Build part de l'intention naturelle et de l'existant. Son parcours `oneshot` réduit la spec et la revue selon ses conditions natives. Avant toute implémentation, vérifier que le GO humain couvre déjà ce besoin ; sinon s'arrêter au GO local. Aucun epic ni numéro de story fictif.
- **Story d'un chantier structuré** : charger les epics, le sprint et les décisions pertinents déjà disponibles. Build compile ou réutilise le contexte d'epic, conserve la continuité avec les stories précédentes et prépare sa spec exécutable. Ne générer de nouveaux epics ou un sprint que si ce découpage est nécessaire et validé.
- **Chantier encore incertain** : employer les capacités produit, UX, architecture et découpage pertinentes avant la réalisation. Un fichier produit par un skill ne prouve pas sa validation ; suivre ses checkpoints et les décisions humaines.

Build contient sa revue native. La voie dispatch lance ses couches indépendantes, trie leurs constats et traite leurs suites ; la voie courte garde sa propre revue native. Un Code Review supplémentaire n'est pas une obligation mécanique après chaque Build. Toute revue et tout test requis doivent effectivement être terminés avant `Review` dans Linear. Une capacité de sous-agent indisponible reste une limite explicite, pas une revue indépendante simulée.

Les règles de l'utilisateur, de l'environnement et d'[AGENTS.md](../AGENTS.md) prévalent sur une action générique du skill : commits de progression, push sur branches de travail et PR en brouillon dans le périmètre autorisé ; GO séparés pour fusion principale, déploiement et publication. Une tâche technique se clôture seulement lorsque tout son livrable est accepté, vérifié et intégré à la cible convenue ; le projet, la recette et la livraison conservent leurs critères propres. Un statut BMAD, une fusion ou des tests verts seuls ne ferment aucun de ces périmètres. Ne demander aucun nouvel accord pour une décision déjà autorisée ; revenir vers l'utilisateur si son comportement convenu ou son périmètre change.

## Installer une stable puis maintenir la méthode

Pour un nouveau projet, résoudre d'abord la stable actuelle, puis utiliser l'installateur **officiel de cette version exacte**. Examiner son aide et sélectionner les modules/outils utiles ; pour le candidat actuel, `bmm`, Codex et Claude Code, avec `--no-shims`. Un tag flottant n'est pas une preuve reproductible. Si le contrôle stable est indisponible, consigner cette limite et poursuivre seulement le travail indépendant autorisé ; ne pas prétendre avoir vérifié la dernière version.

Pour un projet déjà utilisé, examiner les mises à jour à un checkpoint cohérent : ne pas changer le workflow au milieu d'une story en cours. Préserver la configuration originale, les overrides, fichiers humains inconnus, artefacts, décisions et contexte produit. Tester l'installation dans une copie isolée avant adoption. Aucun service de mise à jour autonome n'est installé.

Après une installation ou un changement d'inventaire :

1. Vérifier la provenance npm et l'intégrité du tarball officiel. Comparer les ressources natives et les catalogues générés à cette distribution ; conserver les ressources natives intactes.
2. Relire le catalogue entier et les entrées modifiées pertinentes. Identifier les capacités réelles, leurs étapes, sorties, checkpoints et revue. Un nom similaire n'est pas une preuve d'équivalence.
3. Adapter de façon autonome les équivalents vérifiés qui préservent le comportement, les validations humaines, tests et règles Linear. Un changement de ces obligations retourne en discussion. Ne pas inventer de nouvelle approbation pour une adaptation compatible déjà autorisée.
4. Migrer nos seuls faits et réglages d'équipe dans les surfaces officielles `_bmad/custom/`. Ne supprimer aucun fichier inconnu et ne créer aucun nouveau skill pour figer un ancien parcours.
5. Régénérer `config/bmad.lock.json`, puis `config/bmad-routing.json` après inspection. Le champ `inventory_sha256` est l'empreinte SHA-256 du JSON canonique des `skills` triés et de `files` du verrou ; la version est liée séparément. Une empreinte réécrite seule n'est pas une analyse.
6. Actualiser les seuls fichiers de méthode dans `config/method-files.json` et les configurations vierges correspondantes dans `tests/fixtures/`. Rejouer `python3 scripts/test_method.py -v`, `python3 scripts/check.py` et les essais de copie à froid/reprise. Les fixtures de tests ne reprennent pas l'identité ni les connaissances du produit courant. Actualiser cette référence, les décisions et les preuves. Conserver les décisions et preuves remplacées comme historiques. Les commits de progression suivent le périmètre autorisé ; fusion principale, déploiement et publication gardent leurs GO.

Les [connaissances du projet](context.md) sont indépendantes du fournisseur de l'assistant : un autre agent lit le handoff, l'index et les décisions pertinentes dans le checkout. Aucune mémoire personnelle partagée, aucun export de conversation n'est nécessaire.
