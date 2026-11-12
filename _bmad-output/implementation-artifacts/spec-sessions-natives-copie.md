---
title: 'Ajouter des sessions par saisie native et choisir leur format dans le listing'
type: 'feature'
created: '2026-11-08'
status: 'done'
route: 'dispatch'
baseline_commit: 'e95c5025409d4395956db366ddf960418785c26f'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="GO Sofiane : même approche que Nouvelle formation pour les disponibilités, et choix du format par dropdown dans la liste">

## Intent

Dans la seule copie Google, ajouter un onglet de saisie native Nouvelles sessions, au même niveau de finition que Nouvelle formation : formation publiée choisie, dates/heures/capacité/format/lieu saisis, ouverture explicite et vrai bouton Enregistrer en bas. Permettre plusieurs dates pour la même formation. Dans Disponibilités, rendre le choix entre en ligne et présentiel disponible par liste déroulante directement sur les lignes.

## Boundaries & Constraints

Conserver les sources, l’Accueil, les boutons existants, les IDs et le site raccordé ; aucun autre classeur, envoi, inscription, scope, commit/push ou publication web. Les données utilisent une seule source. Capacités/heures/ouverture restent propres aux sessions, aucune ouverture implicite. État incertain et réessai sans doublon, saisie conservée en cas de refus. Espace partagé pour une personne à la fois, comme le prototype de formation.

## I/O & Edge-Case Matrix

| État | Résultat |
|---|---|
| Formation publiée et dates valides | Même formation, une session par date ; confirmation explicite |
| Ligne entièrement vide | Ignorée ; pas de session vide |
| Date passée/impossible, heure inversée, capacité invalide, formation dépubliée | Refus sans mutation source, saisie conservée |
| Présentiel sans lieu | Refus ; lien HTTPS facultatif pour en ligne |
| Réessai même requête | Pas de doublon |
| Réponse incertaine | Reprise du contenu initial, pas de réinitialisation créant une autre requête |
| Installation réessayée | Pas de doublon d’onglet/bouton, données humaines préservées |

</frozen-after-approval>

## Code Map

- `app/experiments/admin-native-form.gs` : modèle visuel, bouton natif, garde, métadonnées protégées et snapshots de reprise. Ne pas modifier le parcours de formation fonctionnel.
- `admin-sheet-actions.gs` : options(book) et create(book,payload) kind sessions, lot1–12dates, writer typé et validation forte, IDs déterministes. Réutiliser sans remplacer le writer.
- `admin-sheet-prototype.gs` : sections/records/plan ; mode strict en_ligne/presentiel. La version COPY web existante et le moteur attendent ces codes ; ne pas écrire des libellés non reconnus dans la source.
- `copy-backend.gs` : garde et métadonnées des sections ; sources Formations13colonnes et Disponibilités12colonnes.
- `build-native-form.cjs` : exemple de bundle privé avec visuel PNG embarqué via sharp ; aucun asset externe.

## Tasks & Acceptance

- [x] Ajouter `app/experiments/admin-native-sessions.gs`, tests et constructeur privé dédié, sans modifier les autres fichiers de code.
- [x] Onglet Nouvelles sessions avec choix de formation publiée (logiciel+titre, ID protégé), grille de1–12dates, listes En ligne/Présentiel dans le formulaire traduites en codes du writer, date/heure natives, capacité explicite, lieu/lien, ouverture décochée. Bouton en bas, statut lisible, remise à vide clairement expliquée. Métadonnées et formulaires reconnus uniquement dans la copie.
- [x] Installer des listes de format dans Disponibilités, appliquées aux lignes de données de chaque section et à leurs extensions via le mécanisme existant si possible. Conserver les codes en_ligne/presentiel dans cette source pour compatibilité de la version web actuelle. Ne pas changer les valeurs initiales, ni les types de dates. Si les tables natives bloquent la validation, produire le diagnostic et une procédure UI sûre plutôt qu’écraser les tables.
- [x] Couvrir la matrice et les erreurs de reprise/installation ; exécuter les tests ciblés.
- [x] Parent : sauvegarde native Google préalable, installation du seul module, tests Safari du vrai bouton, lot de deux sessions fermées sur une formation de recette identifiée, export et intégrité, capture, revue et notes de remise.

Critères : quand une session est ajoutée par le formulaire, alors elle se retrouve dans Disponibilités sans doublon ; quand le format est modifié depuis le listing, alors le site reste compatible et les contrôles de lieu/lien s’appliquent ; les sources préexistantes et paramètres sont conservés. Aucune donnée nominative ou lien privé projeté publiquement.

## Implementation Notes

Le travail de code est délégué ; l’agent de réalisation ne fait aucune interaction Google ou navigateur. Le parent réalise les opérations et preuves natives. Les tests restent proportionnés, sans élargir à la recette mail. Le GO actuel couvre cette implémentation dans la copie et ses tests ; pas de nouvelle approbation de routine à demander.

## Verification

- `node --test app/experiments/admin-native-sessions.test.cjs` puis suite administration pertinente.
- Relire le bundle Google installé ; comparaison native des quatre sources avant/après en valeurs/types, seuls deux ajouts de session identifiés et fermés autorisés pour la recette.

## Résultat de la vérification — 8 novembre

233/233 tests administration et COPY réussis, dont43 sessions natives. Module Google relu via le presse-papiers de l’éditeur : identique au bundle testé. Installation terminée12:57:54 Montréal. Un seul nouveau déclencheur propriétaire traiterSaisieSessionsTema, trois déclencheurs au total ; aucun scope supplémentaire.

Safari réel : sélection d’une formation fictive publiée, deux dates saisies (en ligne et présentiel), ouverture décochée, vrai clic Enregistrer : confirmation2sessions fermées. Second clic reconnu sans doublon. Remise à vide par case installable réussie, sources conservées. Menu Format réellement ouvert sur une nouvelle ligne : deux options visibles. Exports natifs avant/après :34formations,15→17sessions,12inscriptions ; toutes les anciennes valeurs et tous les types identiques, Paramètres/Accueil/Nouvelle formation identiques. Après réessai et reset, mêmes sources et formulaire vide. La copie reste privée au propriétaire.

## Review Triage Log

| Revue | Constat | Décision et résolution |
|---|---|---|
| Blind1 | Un éditeur non propriétaire ne peut écrire les métadonnées protégées | Non applicable à la recette propriétaire seule, copie privée. Garde propriétaire et instruction explicites ; multiéditeur exclu. |
| Blind2 | Refus définitif après prévalidation bloque la reprise en UNCERTAIN | Corrigé : refus métier connu et absence de lignes de la requête contrôlés sous verrou avant retour DRAFT. Commit partiel/inconnu reste UNCERTAIN. |
| Blind3 | Validation permissive considérée compatible | Corrigé : choix exacts, rejet strict et dropdown exigés sur cellules ; condition propre au schéma des tables natives. |
| Blind4 | Unicité du déclencheur limitée au compte | Corrigé : installation réservée au propriétaire existant, trois déclencheurs constatés, un seul de sessions. |
| Blind5 | Bouton image non exécutable sur mobile | Instruction ordinateur explicite ; recette ordinateur uniquement, aucun support mobile annoncé. |
| Blind6 | Faux writer insuffisant pour prouver reprise après commit | Corrigé : tests du vrai create avec état, réponse perdue, réessai et lot partiel. |
| Edges1 | Protection des métadonnées et autre éditeur | Même périmètre privé propriétaire que Blind1 ; aucun partage élargi. |
| Edges2 | Dépublication entre prévalidation et écriture | Corrigé avec traitement des refus métier de Blind2 et test. |
| Edges3 | Plages de format périmées pendant insertion | Corrigé : lecture et application sous ScriptLock ; indisponibilité signalée. |
| Edges4 | Dropdown masqué ou valeur libre malgré choix compatibles | Corrigé avec les règles exactes de Blind3. |
| Verification1 | Faux builder ne vérifie pas réellement les choix demandés | Corrigé : état des règles relu, assertions choix/strict/affichage et métadonnées natives. |

Les deux premières installations natives ont révélé des restrictions des colonnes typées, y compris une erreur différée à flush. Le candidat final inspecte tables.columnProperties via Sheets API et n’écrit jamais de validation de cellule à l’intérieur d’une table typée. Les trois tables ont été réglées avec leur UI native ; les extensions et lignes ajoutées portent bien les dropdowns. Aucun remplacement des sources ni changement de leurs valeurs.

[Rapport de remise](../../docs/project/acceptance/native-sessions-2026-11-08.md). Aucun commit/push ni déploiement web, ancien TEST et PROD intacts. Acceptation du rendu par Sofiane et recette globale TEM-27 restent ouvertes.

## Décision ultérieure — prototype abandonné

Sofiane préfère l’ajout manuel des lignes dans Disponibilités. Onglet natif retiré, sources conservées et comparées en valeurs/types, code local archivé hors dépôt. Dropdowns natifs conservés ;32tests existants de saisie directe réussis. Une adaptation multi-compte ne sera envisagée que selon le setup client. La réalisation done ci-dessus reste l’historique technique du test, pas une fonctionnalité retenue.
