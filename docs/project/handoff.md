# Reprise du projet

## Candidat prêt pour la recette de Sofiane — 30 octobre 2026

Les neuf correctifs R1/R3/R4/R5/R6/R7/R8/R9/R11 sont réalisés, revus, testés et **déployés dans Google TEST version 8**, sur le déploiement existant. Le GO complémentaire explicite de Sofiane est conservé dans la [décision](decisions/2026-10-30-correctifs-et-ux-differee.md) et le commit `51c3d42`. Aucune fusion/main, publication Vercel/FTP ou PROD. Les trois options UX restent seulement illustrées, sans implémentation.

Code produit `096772d03772012752dcc1b7948004318b3e3ad8` ; bundle/HEAD Google exact `b0737bb59743af0216eb62a83a1143ec10570872c0e8c636343a7334df61f447`. Déploiement version 8 observé à 20 h 17 Montréal ; dernière inspection à 20 h 18 min 40. URL/identité propriétaire/accès existants inchangés. Helpers privés retirés avant déploiement.

[Rapport courant détaillé](acceptance/corrections-2026-10-30.md) · [Rapport UX illustré](acceptance/ux-options-2026-10-30.html) · [Guide Google](guide-google.md). Les [résultats V1 initiaux](acceptance/V1-results.md) et le [contre-audit avant correctifs](acceptance/independent-audit-2026-10-30.md) conservent leurs preuves historiques ; leurs anciennes réserves Google/Safari/Apple ne décrivent plus le checkpoint courant.

## Vérifications et limites

- Nouvelle passe locale complète : 103 tests Node, 21 régressions administratives, 2 transitions VM, 9 bundle/ICS et 184 parcours navigateur (Chromium ordinateur/mobile, Firefox, WebKit), tous réussis. Build/sécurité/méthode réussis. CI du code096 : push41146931408 et PR41146938573 réussies. Pas de preuve Google ou Safari natif déduite de cette CI.
- Google réel : 13 assertions notes/listes/capacité/logiciels/intégrité réussies. Pour R3, entrée vide injectée dans le writer natif, aucune formation supprimée. Budgets, allowlist, compteurs et journal préservés ; toutes les valeurs des quatre onglets strictement identiques par exports XLSX avant/après. Rejeu HTTP historique **REPLAY / annulee**, aucun renvoi. Douze réconciliations sans changement, zéro patch, maximum2751ms ; maximum4188ms pendant les cas ciblés.
- Safari installé : vrai catalogue Google, filtre Dimo, calendrier/présélection, fiche/formulaire, validation obligatoire et politique/retour avec quatre saisies fictives conservées. Aucune nouvelle soumission valide ; succès/reconfirmation/expiration restent couverts par la matrice automatisée, pas tous rejoués nativement.
- Calendrier Apple : deux ICS reçus précédemment importés dans `Tema TEST — recette 2026-10-30` (iCloud), puis export natif comparé. Hiver09h–12h, été09h30–12h Montréal ; deux UID, instants, titres/accents et lieux identiques. Ce calendrier fictif est laissé disponible, sans invité ni modification des calendriers personnels.
- Outlook, Excel installé, téléphone physique, lecteur d’écran, zoom natif et acceptation Sofiane restent ouverts. R2 (`Paramètres.choix` calculé modifié manuellement) est hors des neuf correctifs, défaut optionnel connu rouge. Aucune garantie zéro surprise.

Les durées actuelles des fonctions ne sont pas des délais édition→navigateur. Les dix éditions normales max26,677s, le secours réel4min45 et le budget extrapolé41,2995min/j proviennent de la campagne initiale ; ils ne sont pas présentés comme remesurés sur24h. Le secours reste au repos12h et onEdit actif. Réactiver le nominal5min seulement pour un essai borné selon le guide.

## Démarrer la recette

Ouvrir [http://127.0.0.1:4173](http://127.0.0.1:4173) sur ce Mac, puis actualiser. Le serveur local a été laissé actif ; le lien n’est pas accessible depuis un téléphone distant. Si nécessaire, depuis `app` :

```sh
npm ci
npm run build
npm run serve
```

Le build utilise l’URL TEST enregistrée. Pour rejouer les suites sans écrire dans Google : `TEMA_TEST_PORT=4184 TEMA_BROWSER_MATRIX=all npm run verify`. `TEMA_AUDIT_RECEIVED_ICS_DIR` ajoute les deux fichiers privés aux sept contrôles ICS portables ; leur absence est explicitement ignorée, jamais convertie en preuve Apple.

Google : compte `temaacademie@gmail.com`, projet/classeur **Tema Académie — TEST** uniquement, IDs dans `config/project.json`. Métier conserve son squelette privé. 25 formations dont24publiques, cinq sessions dont trois dates2027fictives publiques. Neuf inscriptions, quatre confirmées/cinq annulées ; cinq historiques et quatre essais antérieurs annulés préservés.

**Budget intact :8/10 inscriptions avec tentative et16/20destinataires, quota quotidien94 observé. Deux inscriptions avec envoi restent réservées à Sofiane**, uniquement vers les boîtes autorisées. Relire `inspectTrial` avant usage. Ne pas réinstaller, réimporter ou réinitialiser pour recetter. Le quota quotidien ne réinitialise pas les budgets persistants.

Les preuves privées sont dans `~/.config/tema-academie/acceptance-correctifs-20261030/` ; preuves/réceptions précédentes dans `acceptance-v1/`. Aucune donnée nominative/capture/ICS/export dans Git ou Linear. Le code v7 et le classeur avant essais sont sauvegardés en privé. Retour compatible : version7 disponible, sans restaurer le classeur ni les compteurs ; le retour7→6→7 historique a sa preuve propre, aucun nouveau rollback8→7 revendiqué.

## BMAD, Linear et Git

Spec globale [Build](../../_bmad-output/implementation-artifacts/spec-v1-locale-google.md) `in-review` ; stories1.1–1.3 revenues en Review après Google réel. TEM-12/13/14/19/21/25/26/28 Review, TEM-27 In Progress pour recette finale. Aucun Done ni acceptation déduite. [Registre Linear](planning/linear-v1.json), sprint et descriptions doivent rester concordants avec ce checkpoint.

Branche `tem-6-technical-trial`, [PR1 en brouillon](https://github.com/blackboxdev0/tema-academie/pull/1) conservée. Commits de jalon/push autorisés, pas de merge/main. Vérifier le statut Git/PR/Linear à toute reprise. Les changements documentaires de cette campagne accompagnent le candidat produit inchangé096 ; leur CI a son état propre dans la PR.

Socle BKBX Agentic1.0.1, révision48d56f7bab5f5e18dcc0a455784dae77854bcbd5 ; BMAD6.12.4,29skills, verrou/routage contrôlés. Pas de mise à jour de méthode en cours de réalisation. Aucun nouveau worktree créé. L’enveloppe de trois jours-personnes humains actifs (2,5base+0,5réserve) reste distincte du travail autonome et du délai calendaire.

[Contexte](project-context.md) · [Fonctionnalités](features.md) · [Décisions](decisions/index.md) · [SPEC](../../_bmad-output/specs/spec-tema-academie-v1/SPEC.md) · [Architecture G0–G4](architecture/controle-technique-v1.md). Avant ouverture réelle, Tema valide créneaux/prix, identité et politique/accord/conservation ; cela ne découle pas de la recette technique TEST.
