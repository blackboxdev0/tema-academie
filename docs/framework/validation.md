# Vérification du socle

État au 18 octobre 2026 : **socle publié et clone GitHub vérifié**. Le socle n'est initialisé pour aucun produit et ne contient aucun mapping vers une équipe Linear réelle. Les critères sont définis dans [le périmètre accepté](spec.md).

## Première publication GitHub — 18 octobre 2026

Sofiane a autorisé la publication avec « Publie ». Le candidat validé `7a888af` a été publié sur la branche `main` du [dépôt GitHub](https://github.com/blackboxdev0/bkbx-agentic), qui est privé. GitHub et les références Git distantes confirment cette révision et `main` comme branche par défaut.

Un clone neuf depuis GitHub contient les **490 fichiers versionnés**. `python3 scripts/check.py` et `python3 scripts/project.py doctor` y réussissent, avec les ressources BMAD intactes et l'état `template`. Aucun profil produit ni réglage personnel n'est nécessaire. Les **89 tests du candidat** restent ceux exécutés et décrits ci-dessous ; la publication ajoute une vérification du clone réel, sans modification du code.

La connexion et le cycle réels avec Linear restent à constater lors du premier projet, comme décrit dans les limites ci-dessous.

## Réutilisabilité après initialisation — 17 octobre 2026

- **89 tests réussis** avec `python3 scripts/test_method.py -v`, en 36,541 secondes après corrections de revue : les 65 protections précédentes et 24 régressions sur la propriété des fichiers, les configurations vierges, la reprise TOML/YAML et les correspondances Linear. Le runner charge uniquement les trois modules déclarés de la méthode ; les tests du produit ont leur commande propre. Un test de la vraie commande vérifie les origines des modules et imports frères, avec des paquets produit homonymes et des marqueurs d'import interdits.
- `python3 scripts/check.py` et `python3 scripts/project.py doctor` réussissent. Le socle reste en état `template`, sans `config/project.json` ni `docs/project/`. Il n'a pas été initialisé pour les essais.
- **45 fichiers de méthode explicitement déclarés**, complétés par les **440 ressources natives verrouillées**. Les octets des ressources natives sont inchangés par rapport au verrou ; la comparaison au relevé de départ ne montre aucune modification des ressources BMAD ou de sa configuration réelle.
- Les tests de coexistence ajoutent des routes Markdown, des fixtures JSON invalides, des scripts et tests produit, des dépendances et une configuration humaine étrangère. Le contrôle de méthode réussit sans les copier, les exécuter ni les modifier. Un fichier déclaré manquant, un lien de méthode cassé, une syntaxe JSON/Python/TOML invalide ou un fichier natif modifié échoue toujours.
- Les copies de tests prennent leurs six configurations mutables, y compris les overrides Build et Code Review, dans `tests/fixtures/`, même si la source est un produit initialisé avec ses propres configurations. L'identité, les connaissances, les autorisations et les fichiers du produit source restent préservés. Les modes exécutables des ressources sont conservés.
- Les huit combinaisons des trois configurations originales ou exactement réécrites reprennent. Les interruptions avant chaque réécriture et entre les archives reprennent également lorsque les sources sont inchangées. Les éditions d'une source non encore archivée, d'une configuration, d'une archive ou des paramètres de reprise sont rejetées sans nouvelle écriture. Les échecs et archives mal confirmées laissent les configurations originales intactes.
- Les clés YAML simples ou entre guillemets pris en charge sont conservées sans doublon sémantique. Les doublons, alias/fusions, clés explicites, tags et racines indentées non prises en charge sont rejetés avant écriture. Tout ensemble d'archives sans journal, même complet, reste conservé avec un diagnostic de revue ; son origine ne peut pas être certifiée automatiquement. Une modification LF/CRLF des sources ou archives est également détectée. Les tests reproduisent des éditions humaines pendant les archives et les écritures de contexte.
- Le serveur Linear isolé vérifie `Backlog` avec un état actif distinct `En définition`, leur conservation et une relance sans doublon. L'absence de Backlog crée seulement les états manquants ; les vraies ambiguïtés d'alias et conflits de catégorie interdisent toujours les mutations. Les cinq états, la lecture/écriture/relecture, les GO et les permissions de progression convenus sont conservés.

Le pilote indépendant final a copié les **490 fichiers distribuables par Git**, sans réglage personnel : **89 tests réussis à froid, puis 89 après initialisation**. Le contrôle de méthode réussit dans les deux états. Une décision, un index de fonctionnalité, des permissions personnalisées et les fichiers propres au produit sont inchangés après les contrôles et la relance d'initialisation. Les tests propres au produit ne sont pas exécutés. Après déplacement du dossier, le contrôle et le rendu du vrai Build par `uv` réussissent encore sans modifier ce contexte.

Le vrai Build a exécuté ses trois couches indépendantes de revue : critique, cas limites et lacunes de vérification. Les **14 constats bruts** et leur tri restent dans `spec-reusable-project-foundation.md`. Onze constats ont conduit aux corrections et tests décrits ci-dessus ; une suggestion sur de futurs tests imbriqués a été écartée selon la règle native pour les défauts mineurs hors usage courant.

Les deux constats restants décrivent une même limite préexistante : les valeurs YAML non gérées ne sont pas soumises à un parseur de syntaxe complète. Les contrôles actuels couvrent les clés gérées, les configurations TOML et les empreintes natives ; ils ne certifient pas tout YAML arbitraire ajouté à la main. Le choix d'un parseur et de sa dépendance portable est consigné dans le travail différé du socle. Cette limite ne bloque pas les configurations fournies et vérifiées dans le pilote.

Aucun accès ou objet Linear réel, aucune découverte automatique par une nouvelle interface, aucun test du futur produit ni publication ne sont établis par cette suite locale.

## Validation du candidat initial — BMAD 6.12.4

Les preuves suivantes précèdent le lot de réutilisabilité ci-dessus. La commande de découverte générale y décrit le contrôle historique ; utiliser désormais le runner borné pour la méthode, y compris après l'initialisation d'un produit.

- **65 tests réussis** avec `python3 -m unittest discover -s tests -v` : 37 protections existantes d'initialisation/Linear et 28 tests de catalogue, de capacité, de configuration et de stable. Aucun appel npm réel dans ces tests ; les réponses réseau et erreurs sont simulées, avec des serveurs HTTP locaux pour les échanges à vérifier.
- `python3 scripts/check.py` : provenance déclarée, intégrité des fichiers, inventaires des deux outils, analyse de capacités, configuration portable, syntaxe et liens locaux vérifiés.
- Tarball `bmad-method@6.12.4` obtenu depuis le registre npm officiel : **SHA-512 identique à `dist.integrity`**. **438 fichiers** inclus, licence comprise, comparés directement aux octets officiels. Les **deux catalogues générés** ont été confrontés aux descripteurs de skills et aux lignes d'aide du package ; **440 empreintes SHA-256** sont verrouillées.
- Contrôle indépendant contre une installation officielle vierge : **214 fichiers par outil et 5 scripts partagés** identiques, inventaire et empreintes compris. Les ressources natives n'ont pas été modifiées.
- `python3 scripts/bmad.py catalogue` : **29 skills natifs par outil**, avec descriptions, vrais chemins et toutes les métadonnées d'aide disponibles. Les skills humains complémentaires restent hors du verrou et sont exposés séparément.
- `python3 scripts/bmad.py status --online` : requête réelle au tag npm `latest` réussie le 17 octobre 2026 ; installé **6.12.4**, stable observée **6.12.4**, résultat `up_to_date`. Ce constat daté n'est pas une promesse de version future. Le helper reste en lecture seule et n'effectue aucune installation.
- Copie des **479 fichiers distribuables par Git**, sans configuration personnelle : les **65 tests** y passent également. Le rendu natif de Build par `uv` contient les faits persistants, les chemins de snapshot et le checkpoint de préparation attendus. Le rendu par script ne prouve pas la découverte automatique par une interface.
- Trois essais locaux à partir de ces fichiers : application web, service sans interface et projet existant à deux dépôts. L'initialisation réussit, sa relance est sans réécriture du contexte, et les décisions ainsi que l'index des fonctionnalités sont conservés après déplacement du dossier. Le contrôle de cohérence reste valide.

### Parcours et revue BMAD du candidat courant

Le vrai skill `bmad-build` a été activé pour cette évolution du socle : rendu officiel, lecture des étapes, préparation de la spec native `spec-bmad-stable-adaptive-workflow.md`, délégation de l'implémentation et exécution des trois couches de revue prévues. Cette spec historique reste dans les artefacts du chantier du socle ; les copies de tests n'importent pas les artefacts d'un checkout utilisé. Il s'agit de l'évolution autorisée du socle ; aucun produit fictif ni ticket externe n'a été créé.

Les 16 constats bruts sont conservés et triés dans la spec. Dix groupes de corrections ont été appliqués puis vérifiés : configuration centrale et faits persistants obligatoires, diagnostics TOML et variables de chemins, collisions d'identités de skills, exigences des parcours, réponse HTTP interrompue, refus des redirections avant tout second appel, métadonnées complètes et propagation des échecs en ligne jusqu'au code de sortie. Deux constats ont été écartés avec leur justification. Aucun correctif accepté n'est différé et aucun arbitrage de périmètre ne reste ouvert.

La revue porte sur l'intégration et les documents du socle ; les ressources officielles ont été comparées séparément à l'installation vierge et au tarball. Lors de cette validation initiale, Git ne contenait aucun commit : `NO_VCS` est un marqueur de workflow, pas une révision ; la comparaison s'appuyait sur la sauvegarde temporaire de l'ancien candidat, hors distribution. Le commit automatique générique de BMAD n'avait pas été exécuté pendant cette migration. L'interdiction héritée du checkout historique a depuis été corrigée selon la [décision courante](decisions.md).

### Couverture de la matrice de la spec

| Cas | Tests exécutés |
|---|---|
| Catalogue complet, fichiers manquants, divergents ou sortant du checkout | `CatalogueTests` : inventaire et métadonnées, deux outils, chemins source non déployés, fichiers absents, identités divergentes, symlink/manifest sortants, doublons, lignes incomplètes, noms BMAD inconnus et coexistence des skills humains. |
| Stable exacte et comparaison ; indisponibilité ou préversion explicite, sans écriture | `StableTests`, `test_status_is_offline_by_default_and_online_check_is_read_only` et `test_online_failure_reaches_status_and_main_with_nonzero_exit` : égalité, comparaison numérique, décalage, réseau/timeout, corps interrompu, préversion, réponse invalide, redirection refusée avant tout second appel, lecture seule et code de sortie d'échec. |
| Version ou inventaire verrouillé modifié : analyse périmée | `test_installed_version_drift_invalidates_previous_analysis`, `test_relocked_changed_resource_still_requires_new_capability_analysis`, preuves et routes invalides rejetées. |
| Configuration native absente ou invalide | Tests de configuration centrale, faits persistants, tables et chemins TOML mal typés, substitutions connues et variables non résolues ; diagnostics structurés au lieu d'une exception non traitée. |
| Reprise par un autre assistant depuis les connaissances du checkout | `test_project_state_can_travel_without_the_original_checkout`, `test_reinitialization_preserves_accumulated_context_and_permissions` et `test_cold_checkout_has_native_skills_and_needs_no_personal_config`. |

### Correction des permissions Git après clarification

La règle courante du projet source a été confrontée aux instructions de sa branche principale et à la conversation de validation. L'interdiction de commit de l'ancien checkout a été remplacée dans les instructions, références BMAD, suivi de contexte et profil généré. Le test d'initialisation vérifie les permissions de commits/push de branche/PR en brouillon dans le périmètre autorisé, avec GO distincts pour développement, fusion principale et livraison. Le test de réinitialisation conserve une restriction humaine personnalisée au lieu de la remplacer. Les **65 tests ont été rejoués avec succès**, dans le candidat et dans une copie sans réglages personnels ; syntaxe, références et intégrité sont valides. Cette correction n'a effectué aucun commit, push ou changement externe.

## Historique — candidat BMAD 6.10.0

Les résultats suivants concernent le candidat précédent. Ils sont conservés pour la continuité et n'établissent pas le fonctionnement des anciens skills dans la distribution actuelle.

- **37 tests réussis** : initialisation, portabilité, conservation des décisions et configurations, reprise après interruption, protection des éditions humaines, erreurs et synchronisation Linear.
- Contrôle d'intégrité des **46 skills BMAD officiels par outil**, de leurs ressources et scripts ; fichiers verrouillés sans modification des workflows officiels.
- Contrôle des configurations, de la syntaxe et des références locales de la documentation.
- Pilotes à partir des seuls fichiers distribuables, sans configuration personnelle : application web, service sans interface, projet existant à plusieurs dépôts. Initialisation, résolution de la configuration BMAD et relance conservant le contexte.
- Serveur HTTP local pour Linear : plan sans écriture, créations additives, relecture, aliases existants, conflits, pagination, réponse perdue, erreurs GraphQL même avec HTTP 200 et conservation des modifications locales concurrentes. Aucun appel vers un workspace réel dans ces tests.
- Contrat GraphQL confronté aux déclarations du SDK officiel `@linear/sdk` 98.0.0 : identité du workspace, équipe, statuts, mutation et identifiant compatible UUID v4. Cette vérification du contrat ne remplace pas un essai réel.

### Revue BMAD historique réellement exécutée

Le skill natif `bmad-code-review` a fourni le parcours de revue et les trois couches indépendantes prévues : revue critique, cas limites et critères d'acceptation. Le tri a conduit aux corrections suivantes, toutes revalidées :

| Constat | Correction |
|---|---|
| Valeurs TOML complexes ou en-têtes commentés mal traités | Fusion sémantique et conservation de la source originale. |
| Archive créée trop tard et reprise bloquée par sa propre archive | Archive confirmée avant réécriture ; reprise de la fusion exacte attendue ; protection des éditions humaines. |
| Champs YAML personnalisés écrasés | Conservation des champs non gérés et rejet préalable des formes gérées ambiguës. |
| Lecture Linear incomplète pouvant paraître complète | Preuve explicite de fin de pagination avant toute confirmation. |
| Statut Review personnalisé mal positionné à la création | Insertion relative à son identité vérifiée, sans déplacer les statuts existants. |
| Renommage concurrent pouvant provoquer un doublon | Conservation des identités observées pendant la configuration. |
| Besoin sans epic dirigé vers un workflow exigeant un epic | Routage vers le vrai parcours libre de `bmad-quick-dev`. |

Ces corrections relevaient du périmètre autorisé et ne demandaient aucun nouvel arbitrage produit. À la clôture de ce candidat historique, aucun constat de cette revue ne restait à corriger. Aucun statut de ticket externe n'est déduit de ce bilan.

Un pilote séparé a également activé le vrai `bmad-quick-dev` dans une copie isolée : lecture du skill et de ses faits persistants, exécution du resolver, parcours libre, investigation, rédaction d'une spec native en `draft` et auto-revue. Il s'est arrêté au checkpoint de préparation, sans simuler l'accord humain ni commencer l'implémentation. Les documents de ce besoin d'essai restent hors du modèle distribué.

## Ce qui reste à constater sur un vrai projet

- Découverte automatique des skills dans une nouvelle interface Codex ou Claude Code ; les fichiers, le rendu sans réglages personnels et l'activation courante de Build sont vérifiés, sans prouver cette découverte à froid dans une autre interface.
- Accès GitHub/Linear, configuration réelle des statuts, tickets et vue, puis synchronisation d'un cycle complet jusqu'à la livraison. Les droits et une équipe de test désignée sont nécessaires ; aucune équipe existante n'a été modifiée pour ce test.
- Intégration GitHub native de Linear et éventuels automatismes de fermeture ; ils ne sont pas installés par le profil local.
- Tests, recette et livraison du futur produit, selon ses technologies et environnements.

Les instructions et outils préparent et guident ces opérations ; ils n'accordent ni accès externe ni fonctionnement en arrière-plan. Le checkpoint initial du candidat a été enregistré sur une branche de travail locale, puis publié sur `main` après le GO du 18 octobre. La publication du socle ne constitue pas un déploiement de produit ni une vérification du futur workspace Linear.

## Rejouer les contrôles

```bash
python3 scripts/check.py
python3 scripts/bmad.py catalogue
python3 scripts/bmad.py status --online
python3 scripts/project.py doctor
python3 scripts/test_method.py -v
```

`doctor` indique les prérequis et éléments encore à configurer ; il ne vérifie aucun accès externe et n'exécute aucune commande du produit. Les tests de méthode utilisent uniquement les fichiers déclarés, des configurations vierges, des copies temporaires et un serveur local. Les tests et parcours du produit restent à définir puis exécuter séparément.

## 29 octobre 2026 — Candidat modèle 1.0.1

Correction de la version initiale 1.0.0, avec règle de cycle de vie des worktrees, changelog et passation enrichie. Aucun fichier BMAD natif ni script applicatif modifié. `VERSION` et `CHANGELOG.md` sont déclarés dans l’inventaire de méthode pour être contrôlés et conservés dans les copies de test.

- `python3 scripts/check.py` : réussi, ressources BMAD 6.12.4 et références documentaires cohérentes.
- `git diff --check` : réussi.
- `python3 scripts/project.py doctor` : Python/Git/BMAD vérifiés, état `template` attendu ; diagnostic global non réussi car `uv` absent du PATH de cette session. Aucun accès externe produit vérifié. Aucun outil installé pour masquer cette limite.
- `python3 scripts/test_method.py -v` : 89 tests réussis en 39,627 secondes. Les copies de méthode et la reprise après initialisation restent vérifiées avec les nouveaux fichiers VERSION/CHANGELOG et la passation enrichie.

Le numéro concerne un candidat de branche, pas une release publiée. Aucun tag, intégration dans main ou propagation vers un projet existant n’est annoncé.

Le numéro a été corrigé de 1.0.0 à 1.0.1 après précision de Sofiane, qui autorise aussi la fusion de la PR du maître dans main. Le contrôle de méthode et whitespace est relancé pour cette correction documentaire ; les 89 tests précédents couvrent les mêmes scripts et comportements, inchangés par le numéro. La fusion est vérifiée séparément sur GitHub avant le bilan.
