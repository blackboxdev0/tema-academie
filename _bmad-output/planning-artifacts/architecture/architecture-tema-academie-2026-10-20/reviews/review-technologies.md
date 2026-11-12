# Revue des technologies — Tema Académie V1

Date : 20 octobre 2026. Lentille : vérification des technologies du Reviewer Gate BMAD Architecture, avec lecture critique du plan d'essai. Périmètre relu : `ARCHITECTURE-SPINE.md` et `plan-essai-technique.md` dans leur état courant. Aucun code produit, compte, envoi ou déploiement n'a été créé ou exécuté par cette revue.

## Verdict

**Cohérent comme proposition documentaire, avec quatre précisions ciblées à intégrer avant l'essai.** Aucun choix de version incompatible ni garantie CORS indûment acquise n'a été trouvé. Aucun constat critique ou élevé. Trois constats moyens et un constat faible figurent ci-dessous. Ce verdict ne valide aucun service déployé et ne constitue aucun GO de développement ou d'essai.

Le contrôle déterministe natif `lint_spine.py --workspace ...` termine avec `ok: true`, zéro constat. Il ne constitue pas un test produit.

## Réconciliation avec les sources officielles

| Choix ou fait | Vérification documentaire | Conclusion pour le dossier |
|---|---|---|
| Node.js 24.22.0 | Le site officiel indique cette version comme dernier LTS ; Node 26 demeure Current. [Node](https://nodejs.org/en/about/previous-releases) | Choix de l'outillage local cohérent ; il ne décrit pas le runtime Apps Script. |
| Vite 8.3.4 | `npm view vite@8.3.4 version engines --json` confirme la version et Node `^20.19.0 || >=22.12.0`. [Métadonnées npm](https://registry.npmjs.org/vite/8.3.4) | Node 24.22.0 est compatible. Le starter vanilla JavaScript est adapté à un site statique sans framework ; la version de Vite ne désigne pas automatiquement la version du générateur create-vite. [Guide Vite](https://vite.dev/guide/) |
| clasp 3.4.1 et Playwright Test 1.64.1 | Les lectures npm des versions épinglées confirment Node `>=20` pour chacun. [clasp](https://registry.npmjs.org/@google%2fclasp/3.4.1), [Playwright](https://registry.npmjs.org/@playwright%2ftest/1.64.1) | Compatibles avec Node 24.22.0. clasp couvre la gestion locale et les versions Google ; Playwright couvre les navigateurs de test, sans équivaloir à une preuve sur Safari réel. Aucun paquet produit installé. |
| Apps Script V8 | Runtime géré, distinct de Node et du navigateur ; modules ES et plusieurs API usuelles absents. [V8](https://developers.google.com/apps-script/guides/v8-runtime) | Le découpage des répertoires est correct ; renforcer la frontière de compatibilité selon TECH-02. |
| Transports A/B/C | Google documente `doPost` retournant HTML ou texte, la redirection ContentService et le RPC depuis HTML Service. [Web Apps](https://developers.google.com/apps-script/guides/web), [ContentService](https://developers.google.com/apps-script/guides/content), [HTML Service](https://developers.google.com/apps-script/guides/html/communication) | A reste un candidat à prouver depuis Vercel. B est un mécanisme officiel ; C est compatible avec l'interface documentée. Ni la source documentaire ni une réponse opaque ne prouvent notre parcours. La règle d'un seul service métier est cohérente. |
| MailApp et verrou | Quota grand public de 100 destinataires/jour et par utilisateur ; `getScriptLock()` doit être effectivement acquis avant le travail protégé. [Quotas](https://developers.google.com/apps-script/guides/services/quotas), [Lock](https://developers.google.com/apps-script/reference/lock/lock) | Le plafond théorique de 50 inscriptions à deux destinataires, les quotas partagés et la séparation réservation/courriels sont correctement annoncés. Préciser acquisition et écritures persistées selon TECH-01. |
| Éditions manuelles et cache | Les déclencheurs simples et installables ne sont pas provoqués par les écritures script/API. CacheService expose expiration et suppression explicites ; l'expiration par défaut est de dix minutes. [Déclencheurs simples](https://developers.google.com/apps-script/guides/triggers), [Cache](https://developers.google.com/apps-script/reference/cache/cache) | AD-8 et ET-09 évitent correctement cette dépendance. La lecture fraîche proposée est proportionnée. Si un cache est ajouté, son TTL doit être explicite et son budget se combiner au rafraîchissement navigateur pour conserver moins de deux minutes ; un TTL isolé de 60 secondes n'est pas, à lui seul, une preuve de ce délai global. |
| Toronto, UTC et invitations | Utilities permet un fuseau explicite ; RFC 5545 distingue les instants UTC des heures locales flottantes et impose les règles de sérialisation iCalendar. [Utilities](https://developers.google.com/apps-script/reference/utilities/utilities), [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) | Aucun décalage UTC fixe n'est promis. Les dates UTC dans l'invitation sont compatibles avec le contrat ; la réception et l'import restent à observer. Compléter ET-07 selon TECH-04. |
| Vercel | Root Directory permet de cibler une sous-arborescence ; Hobby est personnel non commercial ; Pro affiche 20 USD/mois avec un siège de déploiement et crédit d'usage inclus. [Monorepos](https://vercel.com/docs/monorepos), [Hobby](https://vercel.com/docs/plans/hobby), [Pro](https://vercel.com/docs/plans/pro-plan) | `app/web` et sortie `dist` sont cohérents. Le dossier réserve correctement le choix du compte, les droits et les coûts. Aucun abonnement disponible ou achat accepté n'est déduit de ces tarifs. |

## Constats

### TECH-01 — Moyen — Rendre acquisition et persistance du verrou explicites

**Emplacement :** AD-4 et ET-04.

« Acquérir `getScriptLock()` » décrit l'intention mais peut être traduit par le seul appel qui retourne l'objet verrou. Google exige ensuite `tryLock` ou `waitLock` ; pour Sheet, la documentation demande de vider les écritures en attente avec `SpreadsheetApp.flush()` avant la libération. Une implémentation qui omet ces étapes peut laisser passer la concurrence que l'invariant promet d'empêcher.

**Disposition : autofix documentaire.** Indiquer acquisition effective avec délai borné, résultat `BUSY` sans mutation en cas d'échec, lecture/contrôle/écriture puis `flush()` sous verrou et libération en `finally`. Ajouter l'échec d'acquisition à ET-04 ou aux contrôles d'erreur. Cela précise l'invariant existant sans ajouter de fonctionnalité.

### TECH-02 — Moyen — Fixer la compatibilité du code déployé vers Apps Script

**Emplacement :** AD-2, Stack et Structural Seed.

Le dossier sépare les répertoires mais ne dit pas explicitement si le service Google accepte les modules ES ou les API Node du site et des tests. Apps Script V8 n'est pas un runtime Node et n'accepte pas directement `import`/`export`. Deux réalisations pourraient donc produire des sources JavaScript incompatibles tout en respectant les chemins annoncés.

**Disposition : autofix documentaire.** Préciser que le service et ses adaptateurs déployés sont du JavaScript compatible Apps Script V8, sans dépendance implicite aux API Node/DOM ni aux modules ES non transformés. La manière d'exposer la logique aux tests reste un détail de réalisation ; toute chaîne de transformation supplémentaire devra rester explicite et proportionnée.

### TECH-03 — Moyen — Réexécuter les cas critiques sur le transport finalement retenu

**Emplacement :** choix de transport, ET-02 à ET-05/ET-11 et critères de décision.

La recommandation prévoit un repli vers B ou C, mais ET-02 nomme uniquement A et le critère de passage renvoie globalement aux mêmes lignes. La preuve négative sur A et la preuve documentaire de B ne suffisent pas à établir la gestion des réponses, reprises et erreurs de l'adaptateur finalement adopté, même avec un service métier commun.

**Disposition : autofix du plan.** Ajouter une règle commune : chaque résultat de cas nomme l'adaptateur testé ; en cas de changement vers B/C, rejouer ET-02 à ET-05 et ET-11 sur cette option avant son acceptation. Conserver le résultat d'A comme preuve de la décision, sans le substituer au résultat du transport retenu. Aucun besoin de construire trois solutions complètes.

### TECH-04 — Faible — Compléter les cas d'heure d'été sans étendre le produit

**Emplacement :** AD-3 et ET-07.

ET-07 couvre hiver et été mais pas une heure locale inexistante ou répétée lors d'une transition. Ces deux cas sont distincts dans RFC 5545 et permettent de détecter une normalisation silencieuse de la saisie avant la conversion en UTC.

**Disposition : préciser le plan avant exécution.** Ajouter ces données limites aux tests de conversion et consigner le résultat attendu ; contrôler aussi que les champs UTC de l'ICS portent `Z` et ne combinent pas UTC avec un paramètre `TZID`. Les importations réelles restent limitées aux invitations représentatives prévues, sans création d'un moteur de calendrier supplémentaire.

## Lecture critique du plan et limites de la revue

Les prérequis identifient les accès non vérifiés, le propriétaire, le compte/forfait commercial, les destinataires autorisés et les ressources dédiées. Le plafond proposé de dix inscriptions et vingt destinataires est un budget à autoriser et mesurer, pas une consommation déjà constatée. La simulation de quota évite d'épuiser le quota réel.

Les preuves proposées distinguent réponse du navigateur, inscription persistée, acceptation MailApp, réception réelle et import agenda. Le rejeu, la dernière place, le consentement, les données privées, les écritures manuelles et scriptées, les navigateurs, les retours de version et les limites du rollback sont couverts à un niveau proportionné.

Le dossier autorise seulement sa propre préparation documentaire. Il réserve explicitement les comptes, envois, essais, déploiements, dépenses et réalisation principale à leurs décisions ultérieures. Aucun scénario ET n'a été exécuté ; les vérifications ci-dessus sont des lectures documentaires et du registre, pas des preuves de fonctionnement sur les services Tema. Les corrections proposées ne créent aucune autorisation nouvelle.

## Addendum — Vérification ciblée des dispositions

Relecture du 20 octobre 2026, limitée aux corrections TECH-01 à TECH-04 dans l'architecture, les règles et le plan d'essai. Aucune nouvelle recherche ni exécution produit.

| Constat | Disposition actuelle |
|---|---|
| TECH-01 | Traité : AD-4, règle 4 et ET-04 exigent acquisition effective `tryLock/waitLock`, attente bornée, `BUSY` sans mutation, `flush()` sous verrou et libération en `finally`. |
| TECH-02 | Compatibilité du service traitée dans AD-2 et rappelée dans les sources du plan. Précision rédactionnelle faible restante ci-dessous. |
| TECH-03 | Traité : AD-6, introduction de la matrice, ET-02 et critère de décision imposent ET-02 à ET-05/ET-11 sur B/C si le transport change, avec identification de l'adaptateur. |
| TECH-04 | Traité : ET-07 et AC-11/AC-16 couvrent les transitions, le refus des saisies locales invalides/ambiguës et l'ICS UTC avec `Z`, sans `TZID` concurrent. Cette validation de saisie est cohérente avec une sérialisation finale en UTC. |

**Résiduel faible, TECH-02 :** AD-2 parle du « code déployé » et la source V8 du plan étend l'absence de DOM au « déploiement Google ». Restreindre explicitement ces formulations au **code serveur Apps Script**. Le JavaScript d'une page HTML Service s'exécute dans le navigateur et peut utiliser le DOM ; cette distinction préserve la compatibilité de l'option B déjà documentée. La règle de séparation est correcte sur le fond et ne demande aucun nouvel outil.

Les quatre corrections sont présentes ; cette précision de portée est le seul résiduel identifié dans la relecture ciblée. Le fonctionnement réel demeure non vérifié et soumis au GO d'essai.
