# Reviewer Gate — Technologie et réalité

28 octobre 2026. Lecture indépendante configurée par `bmad-architecture`. Périmètre : spine consolidée et compagnon de contrôles techniques ; corroboration dans le code/manifestes/lockfile et sources primaires. Aucun autre rapport de revue du28octobre consulté.

**Verdict : PASS pour G0, aucun constat bloquant ou contradiction de plateforme identifié.** Le document décrit correctement un seed brownfield et des obligations futures ; il ne prétend pas que les extensions de contrat, la cadence ou le limiteur sont déjà exécutés.

## Contrôles de réalité

| Élément lié | Preuve examinée | Résultat |
|---|---|---|
| Node22.9.0 / npm11.7.0 | `node --version`, `npm --version`, `app/package.json` | Valeurs observées localement, décrites comme telles, sans promesse de version la plus récente ou mise à jour automatique |
| Playwright1.64.1 | `app/package.json` et `app/package-lock.json` | Version exacte verrouillée ; dépendance existante, pas choix de nouvelle bibliothèque |
| Build statique et bundle Google | `app/scripts/build.cjs` | Copie statique des ressources web et concaténation moteur/adaptateur ; pas de serveur Vercel ajouté |
| Apps Script V8 / Toronto | `app/apps-script/appsscript.json` et documentation V8 | Manifestes conformes au runtime géré décrit ; code Google distinct de Node malgré le langage partagé |
| Verrou et environnement TEST | `app/apps-script/google.js`, garde de destination/projet et `LockService.getScriptLock().tryLock(5000)` | Prototype bien fixé sur TEST ; une configuration Métier différente n’est pas prétendue prête |
| Permissions email | Manifeste et appels MailApp du prototype | Sheets, envoi et gestion des triggers ; aucune portée Gmail de lecture. La confirmation envoyée reste distincte d’une réception |
| CI et outillage proposé auparavant | Source/plan et package existant | CI produit explicitement à câbler ; Vite/clasp non liés comme outils installés. Pas de succès GitHub inventé |

Aucune commande de build/test produit, nouvelle installation ou interaction avec les ressources Google n’a été exécutée par cette revue. Les commandes de version ci-dessus et la lecture des fichiers sont les seules vérifications locales nouvelles.

## Corroboration documentaire primaire

- [Quotas Apps Script](https://developers.google.com/apps-script/guides/services/quotas), relus28octobre :100destinataires/jour et90min/jour de déclencheurs pour le compte grand public ; réserves partagées par utilisateur et modifiables. Le document sépare ces limites du quota restant réellement observé et des paramètres d’ingénierie3/30et45min. Le calcul d’environ50demandes à deux notifications est correctement présenté comme maximum théorique, pas garantie ni plafond métier.
- [Déclencheurs installables](https://developers.google.com/apps-script/guides/triggers/installable), relus28octobre : les écritures script/API ne déclenchent pas automatiquement onEdit ; le service commun explicitement appelé par les imports répond à cette restriction. Le compte créateur porte les permissions du trigger. Le secours est nominal, sans garantie pendant une panne.
- [Déploiements Apps Script](https://developers.google.com/apps-script/concepts/deployments), relus28octobre : code HEAD reflétant les sauvegardes distinct d’une version immuable destinée à l’usage public. Le couplage HEAD/version/build et la récupération sans restauration du Sheet sont explicitement conservés ; aucun déploiement réalisé ici.
- [Runtime V8](https://developers.google.com/apps-script/guides/v8-runtime), relu28octobre : runtime Google géré, cohérent avec le manifeste et la séparation d’adaptateurs.
- [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app), relu28octobre : service d’envoi et quota en destinataires, aucune lecture de boîte ; pas de garantie de réception dérivée de l’acceptation d’un appel.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby), relu28octobre : offre personnelle non commerciale. L’adéquation de l’offre au déploiement client reste une condition future explicitement nommée, sans achat tacite ; elle n’est pas présentée comme résolue à G0.

## Limites correctement maintenues

Les nouveaux champs `registration_enabled`/`registration_block_reason`, l’éligibilité tarifaire, le compteur privé et la cadence5min sont des contrats futurs. Les tests du prototype ne sont pas utilisés comme preuve de leur implémentation. Les mesures de charge et la compatibilité des supports gardent leurs étapes d’exécution ; les preuves historiques4PASS/8NON VÉRIFIÉ restent distinctes.

L’outillage exact existant n’est pas certifié ici comme dernier correctif disponible ou exempt de tout avis de sécurité ; il est ratifié comme seed observé pour cette clôture documentaire. Le checkpoint d’implémentation doit vérifier l’outillage nécessaire conformément au contrat avant de l’étendre, sans mise à jour globale automatique.

**Constats : aucun.** Aucun arbitrage humain supplémentaire requis pour cette lens au G0. La conclusion n’autorise ni code, fusion, déploiement ou ouverture publique.
