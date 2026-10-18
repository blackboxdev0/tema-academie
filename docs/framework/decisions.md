# Choix du socle

## 2026-10-17 — Une méthode portable et simple

L'utilisateur a validé la réalisation dans ce nouveau dépôt, avec une méthode indépendante du produit, de sa technologie et de sa cible de livraison. Le fonctionnement attendu reste : conversation naturelle, vrai BMAD, suivi Linear, décisions humaines aux jalons utiles et contexte conservé entre fonctionnalités.

La continuité signifie conserver les artefacts, décisions et connaissances utiles au produit. Elle n'inclut pas l'export des conversations. Le cadrage a explicitement écarté une couche de nombreux skills BKBX : `AGENTS.md` coordonne les skills BMAD existants, avec des références communes et deux helpers ciblés.

Le candidat initial conservait une interdiction de commit issue du checkout source historique. Cette règle est remplacée par « Commits de progression et consignes courantes » ci-dessous. Aucune publication ni modification d'un workspace Linear existant non désigné n'est implicite. Aucun produit, board ou ticket fictif n'est préconfiguré. Le dépôt d'origine sert exclusivement à l'extraction en lecture.

## 2026-10-17 — BMAD 6.10.0 conservé comme dépendance officielle — remplacé

**Décision historique remplacée par « Stable actuelle et capacités inspectées » ci-dessous.** Sa raison initiale et ses preuves sont conservées pour comprendre l'évolution ; elle ne s'applique plus aux nouveaux projets.

La distribution npm officielle `bmad-method@6.10.0` fournit nativement `bmad-create-story`, `bmad-dev-story`, `bmad-code-review` et `bmad-quick-dev`. L'inspection des distributions 6.11.0 et 6.12.4 montre que plusieurs deviennent des alias dépréciés au profit d'un autre parcours.

Pour préserver le fonctionnement accepté, le socle embarque la 6.10.0 plutôt que migrer la méthode pendant son extraction. Les fichiers des skills restent officiels, sans réécriture de leur workflow. Les personnalisations de projet passent par la configuration et `_bmad/custom/`. La langue des échanges est le français ; celle des artefacts BMAD est configurable, anglais par défaut.

Les deux répertoires de skills sont distribués pour que chaque outil découvre ses skills après clone. Leurs empreintes et les scripts BMAD sont verrouillés dans `config/bmad.lock.json`. Les réponses personnelles de l'installateur sont exclues ; les valeurs portables nécessaires existent dans la configuration d'équipe.

## 2026-10-17 — Stable actuelle et capacités inspectées — en vigueur

La clarification de l'utilisateur impose la dernière stable officielle à l'initialisation, l'apprentissage des skills installés et la conservation des connaissances pertinentes du projet. Cette décision remplace la rétention de 6.10.0 : préserver les noms anciens n'était pas le résultat attendu. Elle précise le GO de réalisation du socle déjà donné ; aucun second GO de développement n'est inventé.

Le candidat actuel utilise **6.12.4**, résolue depuis npm et installée officiellement sans shims. Build couvre l'intention libre et les stories avec revue intégrée ; le découpage et le sprint utilisent leurs capacités natives actuelles. Les équivalents vérifiés sont adaptés de façon autonome tant que comportements convenus, checkpoints, tests et suivi Linear restent préservés. Une modification de ces invariants exige la décision humaine correspondante.

La version exacte et la provenance sont enregistrées pour reproduire le candidat. Le catalogue complet et les ressources pertinentes sont lus à l'initialisation et après mise à jour ; `config/bmad-routing.json` lie l'analyse à cette version et aux empreintes du verrou. Une dérive invalide l'analyse. Le [cycle stable](../bmad.md) décrit l'installation, l'inspection et les tests à un checkpoint cohérent, sans injecter une mise à jour dans une story active.

Les ressources natives restent inchangées. Les faits persistants de l'intégration sont portés par les surfaces officielles de Build et Code Review ; nos seuls overrides obsolètes create/dev/quick ont été retirés. Les configurations originales, fichiers humains inconnus et artefacts sont conservés. Aucun nouveau skill ni updater permanent n'est créé.

Le contexte conserve les décisions, leurs raisons, les faits utiles et les questions dans le projet, avec liens et statut des décisions remplacées. La continuité ne dépend pas d'une mémoire personnelle ni du fournisseur de l'assistant. Les limites de preuve externe restent décrites dans [la validation](validation.md).

## 2026-10-17 — Commits de progression et consignes courantes — en vigueur

L'utilisateur a signalé ici que la règle des commits avait changé sur le projet source. La règle actuelle a été retrouvée dans sa conversation de validation, puis confrontée à `origin/main:AGENTS.md` et au correctif de checkpoints fusionné dans la branche principale source. Le checkout sur l'ancienne branche de release conservait l'interdiction ; l'utiliser comme règle courante était incorrect. Cette provenance explique la correction du socle, sans créer de dépendance vers ce produit.

Le socle reprend les commits de progression, push sur branches de travail et PR en brouillon dans le périmètre accepté, sans nouvelle demande à chaque opération, même avant la fin des tests avec leur état réel explicite. La préparation acceptée et les avancées cohérentes sont versionnées ; les checkpoints vérifient ensemble Git, BMAD, le projet et les issues Linear. Fusion ou push direct vers la branche principale, déploiement et publication gardent leur GO. Une restriction humaine explicite plus récente reste prioritaire. Le profil d'un nouveau projet consigne cette séparation ; la réinitialisation ne modifie pas les permissions d'un projet existant.

Les décisions et preuves antérieures restent historiques. Cette correction porte sur les règles du socle et son profil initial ; elle ne modifie aucun checkout source, ticket Linear réel ou réglage externe.

## 2026-10-17 — Réutilisabilité du socle et clôture du livrable convenu — en vigueur

Le GO courant couvre les quatre corrections préalables à l'utilisation réelle du socle, consignées dans `spec-reusable-project-foundation.md` : isoler les contrôles de méthode, rendre ses tests indépendants de l'identité produit, protéger la reprise de toutes les configurations et préciser la clôture Linear. Aucun produit ni workspace de test réel n'est désigné.

`config/method-files.json` énumère les fichiers de méthode ; le verrou BMAD continue de définir les ressources natives. Le contrôle et les copies partagent cette limite. Les tests chargent seulement les modules déclarés et utilisent les configurations vierges de `tests/fixtures/`, sans reprendre profil, contexte, artefacts ou dépendances du produit courant. Une ressource déclarée manquante ou corrompue reste un échec. L'inventaire et les fixtures se maintiennent lors d'une évolution volontaire de la méthode, sans updater.

Avant toute archive, le journal d'initialisation confirme ensemble les empreintes des octets des trois sources TOML/YAML, des réécritures attendues et des paramètres du profil. Chaque source est ensuite archivée et relue avant la réécriture. Ce préalable ferme la fenêtre d'interruption entre deux archives : une édition humaine d'un YAML non encore archivé ne peut pas être absorbée à la reprise. Les configurations originales ou exactement réécrites reprennent ; les sources, archives ou paramètres divergents demandent un examen avant de nouvelles écritures. Les clés YAML simples et les formes citées prises en charge sont reconnues ; une forme ambiguë est refusée plutôt que doublonnée. Tout ensemble d'archives sans journal commun, même complet, demande un examen. Les copies vierges utilisent aussi des références pour les overrides Build et Code Review, et préservent les modes des ressources. Le runner résout les imports des modules déclarés vers leurs fichiers pour empêcher un paquet produit homonyme de les masquer.

Dans Linear, une tâche technique se clôture seulement lorsque son livrable entier est accepté, vérifié et intégré à la cible convenue. Le projet, les tickets de recette et les tickets de livraison gardent leurs critères propres. La clôture technique ne dépend donc pas mécaniquement d'une livraison globale et ne la prouve pas. Les cinq états, la lecture/écriture/relecture, les GO et les permissions de progression restent applicables. `En définition` est une étape distincte de Backlog ; son retrait des aliases ne supprime ni ne requalifie aucun état existant. Les conflits réels restent bloquants.

Les preuves et limites sont consignées dans [la validation](validation.md). Cette maintenance n'initialise pas le socle, ne modifie pas les fichiers BMAD natifs, ne crée aucun objet externe et ne publie aucun dépôt.

## Initialisation externe

Les connecteurs assurent le travail courant. Le helper Linear couvre uniquement la création des statuts non exposée par le connecteur disponible ; il utilise l'API GraphQL officielle, avec plan en lecture seule, configuration additive et relecture. Il n'installe pas une synchronisation permanente ni une intégration GitHub globale.

La configuration visuelle d'un board, les droits et l'intégration native doivent être constatés réellement avant de les annoncer disponibles. Le modèle local et les tests isolés prouvent leur propre fonctionnement ; une validation externe reste distincte.
