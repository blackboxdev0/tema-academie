---
title: 'Retirer Paramètres de la copie et conserver la configuration dans le code'
type: 'refactor'
created: '2026-11-10'
status: 'done'
route: 'dispatch'
baseline_commit: 'e95c5025409d4395956db366ddf960418785c26f'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="GO explicite Sofiane : retirer Paramètres dans la copie et déplacer sa configuration dans le code, puis tester sans toucher au classeur actuel">

## Intent

Simplifier le classeur client : conserver les données métier administrables et retirer la configuration technique. Le catalogue, les formulaires, les disponibilités, le suivi et les inscriptions doivent fonctionner sans onglet Paramètres. La politique reste un contenu du site, avec une version conservée dans les nouvelles inscriptions.

## Boundaries & Constraints

Toujours : COPY uniquement, adaptateur/code local et même déploiement privé autorisés. Conserver contacts, expéditeur, politique/version et les trois logiciels existants à valeurs équivalentes. Les anciennes inscriptions gardent leur politique_version. Configuration unique explicite, aucun fallback silencieux à une feuille. Sauvegarde code/manifeste/classeur et intégrité avant/après. Liste des destinataires, budgets, propriétés privées, secrets, déclencheurs et permissions préservés.

Jamais : modifier ancien TEST/PROD/site public, envoyer un courriel, réinitialiser un compteur, commiter/pousser, inventer une nouvelle politique ou nouvelle catégorie, réécrire les sources métier. L’onglet est supprimé uniquement après adaptation/validation du code. Tests locaux simulés et tests Google réels doivent être distingués.

## I/O & Edge-Case Matrix

| Scénario | État | Attendu | Erreur |
|---|---|---|---|
| Lecture native/API | Paramètres absent | Contrat public inchangé, trois seules tables lues | Autres tables absentes toujours CONFIG |
| Configuration | Ancienne feuille présente et contradictoire | Valeurs du code seules utilisées | Aucune dépendance ou lecture feuille |
| Inscription | Politique courante et place disponible | Admission, version enregistrée, compteur décrémenté | Aucune notification dans recette réelle |
| Version obsolète | Commande avec ancienne version différente | POLICY_CHANGED, sans admission | Source et budget conservés |
| Administration | Ajout/édition formation ou session | Formulaires/listes/compteurs et suivi opérationnels | Gardes COPY inchangés |
| Gestion | Annulation/reprise | Statut durable et recalcul, pas double restitution | Réparation existante préservée |
| Historique | Inscriptions déjà présentes | Toutes valeurs/types inchangés | Aucune migration de consentement |

</frozen-after-approval>

## Code Map

- app/experiments/copy-backend.gs : nativeRead lit quatre feuilles, batchRead requiert quatre valueRanges ; parameters est le parseur actuel. Remplacer seulement la source de params par configuration embarquée. Conserver validation, batch temporel, store/locks/mail/guard, trois sources métier, tracking.
- Nouveau app/experiments/copy-config.gs : source explicite COPY courriel_contact et courriel_avis_tema = temaacademie@gmail.com ; nom_expediteur = Tema Académie — TEST ; politique_url = https://example.invalid/politique-essai ; politique_version = TEST-1 ; logiciels DIV/Divalto, DIMO/Dimo, MOOV/MoovApps. Fournir une copie indépendante à chaque lecture pour éviter mutations partagées. Ces valeurs restent TEST, pas une validation juridique.
- app/experiments/build-copy-backend.cjs : inclure config dans Code.gs ; pas de secrets ni opérations Google. Conserver logo/formulaire natif. app/experiments/copy-helpers.cjs : charger config dans harness, données de test privées cohérentes via injection explicite sandbox si nécessaire ; pas de lecture Paramètres pour COPY.
- app/experiments/copy-backend.test.cjs, copy-build.test.cjs : couverture absence/contradiction feuille, trois ranges, mutation indépendante config, contrats/inscription/reprise/annulation, rendu mails simulé. Ne pas modifier le prototype historique sheets-batchget.gs ni ses tests pour ancien TEST.
- app/web/app.js et index.html : politique inline déjà disponible pour example.invalid ; conserver contenu/code et consentement/version fournis par contrat, pas de nouvelle page légale. Profil local COPY persistant.
- app/experiments/admin-sheet-prototype.gs, admin-sheet-actions.gs, admin-sheet-registrations.gs, admin-registration-actions.gs : trois logiciels déjà fixes, pas de lecture Paramètres constatée. Vérifier ces fonctions après retrait. SaisieNative.gs sur Google doit être relu par parent pour dépendances éventuelles.

## Tasks & Acceptance

- [x] Agent de code : module configuration COPY et lectures native/groupée sans Paramètres, builder/fakes adaptés, tests pertinents. Aucun Google/Git par agent. Les opérations externes ci-dessous sont réalisées par parent.
- [x] Parent : relire le diff propre à cette tâche, exécuter suites standard/expérimentales/build/sécurité et revue intégrée ; préserver tous les changements antérieurs du checkout sale attendu.
- [x] Parent Google : sauvegarde privée courante ; code HEAD installé/relu conforme, même manifeste. Test lecture avant suppression, suppression réversible Paramètres dans copie seulement, actualisation native/formulaires/GET réel puis activation versionnée même URL. Recette sans mails : réutiliser uniquement une commande réelle déjà annulée pour REPLAY, plus validation de nouvelle admission avec vrais modules sur données simulées. Aucun nouveau vrai participant nécessaire puisque l’écriture ne change pas. Contrat public, historique et propriétés budgets comparés ; code temporaire retiré.
- [x] Parent navigateur : relancer site local COPY, cache/relecture, filtres/fiches/date/formulaire/politique, sans envoi ; laisser copie prête et captures. Mettre à jour rapport, contexte et TEM-27 sans clôturer recette humaine.

Critères : étant la copie sans Paramètres, quand site et administration relisent les données, alors catalogue/dates/contacts/politique et suivi restent cohérents. Étant une inscription existante, quand migration terminée, alors ses champs restent strictement identiques. Étant une commande de politique obsolète, quand soumise au moteur, alors aucune place ni mail consommé. Étant le classeur actuel non COPY, quand cette tâche s’exécute, alors aucune interaction d’écriture ne le cible.

## Implementation Notes

GO et choix fonctionnels déjà explicites dans le chat ; aucun nouvel arbitrage requis. Arbre sale connu de la recette en cours, aucun nettoyage/Git demandé. État COPY précédent version8, budget7/13 consommé sur13/26 à revérifier. Réserve native : le formulaire historique HTML multi-compte a sa limite connue ; ne pas réintroduire saisie sessions abandonnée.

## Verification

node --test app/tests/*.test.cjs ; node --test app/experiments/*.test.cjs ; node app/scripts/security.cjs ; build local avec profil COPY ; git diff --check. Parent : UI Google, exports privés, contrat GET et parcours navigateur, sans notification réelle.

## Review Context

Diff limité à la tâche : code Google v8 sauvegardé contre candidat, plus fichiers auxiliaires untracked complets (leurs tests antérieurs sont du contexte, pas tous nouveaux). 132 tests standard et 238 expérimentaux réussis avant recette Google. Aucun changement engine/web/manifeste.

## Review Triage Log

| Origine | Verdict et preuve | Suite |
|---|---|---|
| Blind1 | medium : exclusion de dépôt lexicale du builder contournable par symlink ; code préexistant, seul ajout de module dans builder | defer ; sortie actuelle privée réelle sans symlink |
| Blind2 | medium : mode 0600 de writeFile ne corrige pas un fichier existant permissif ; préexistant | defer ; vérifier permissions des fichiers utilisés |
| Blind3 | medium : fichiers de sortie symlink non rejetés ; préexistant | defer ; vérifier absence de symlinks de la sortie actuelle |
| Blind4 | medium : plusieurs writeFile successifs ne sont pas atomiques ; préexistant | defer ; installation uniquement après hashes et lecture native conformes |
| Blind5 | medium : collisions timestamp possibles pour backup concurrent ; préexistant | defer ; aucun builder concurrent dans cette tâche, sauvegarde native indépendante |
| Blind6 | medium : parse JSON seul ne valide pas backup récupérable ; préexistant | defer ; backup courant relu conforme v8 et manifeste valide |
| Blind7 | medium : test bundle ne couvre pas submit et destinataire configuré | patch : test réel des modules avec mail simulé demandé à agent |
| Blind8 | medium : preuve locale historique ne démarre pas avec ancienne ligne/version | patch : fixture historique préexistante et égalité types/valeurs demandées ; export Google vérifié indépendamment |
| Blind9 | medium : tests d’échec du builder ne couvrent pas ses risques préexistants | defer ; relié aux points builder, aucun changement de leur mécanisme |
| Edges1 | medium : symlink de sortie dans dépôt, même constat vérifié Blind1 | defer commun sans doubler le correctif futur |
| Verification | Aucun écart de couverture retenu par cette lecture | revue terminée |

## Résultat final

COPY version9 intégrée et vérifiée : retrait Paramètres après activation pour éviter une fenêtre d’indisponibilité de v8. Contrats/données/propriétés identiques, REPLAY réel sans mail, aucun nouvel inscrit. Native et site local réels vérifiés, code temporaire retiré et manifeste conservé.132tests standard/238expérimentaux et revue terminés ; deux renforcements de tests intégrés, durcissement préexistant du builder différé. Aucun commit/push. Rapport : docs/project/acceptance/code-config-copy-2026-11-10.md.
