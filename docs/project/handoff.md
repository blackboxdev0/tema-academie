# Reprise du projet

**État courant après correction (30 octobre) :** neuf correctifs réalisés, revue et vérification locale terminées : 103 tests Node, 21 régressions administratives, 2 transitions VM, 9 contrôles bundle/ICS et 184 parcours navigateur réussis. Google TEST non mis à jour ; Safari/Calendrier Apple non vérifiés. Les propositions UX sont uniquement illustrées. [Rapport courant](acceptance/corrections-2026-10-30.md) · [Rapport visuel](acceptance/ux-options-2026-10-30.html). Les résultats de réalisation/audit ci-dessous sont historiques lorsqu’ils diffèrent de ce checkpoint.

**Décision la plus récente :** Sofiane autorise les neuf correctifs R1/R3/R4/R5/R6/R7/R8/R9/R11 et leurs tests. Les améliorations UX/UI sont différées à un rapport visuel, sans implémentation. Reprise via BMAD Build sur la spec existante ; [décision](decisions/2026-10-30-correctifs-et-ux-differee.md). Les constats ci-dessous décrivent le checkpoint d’audit avant correction.

## Contre-audit demandé par Sofiane — réserves ouvertes

Le [contre-audit du 30 octobre](acceptance/independent-audit-2026-10-30.md) complète et nuance la remise ci-dessous : 103 tests Node rejoués, neuf contrôles bundle/ICS réussis, **sept nouvelles assertions rouges sur cinq comportements administratifs**. Des transitions UI défectueuses sont également établies par lecture et VM/DOM simulé. Ne pas annoncer « tout est double-vérifié ». Aucun changement produit : neuf correctifs proposés restent à traiter, un complément bundle est vérifié, deux tests de délais sont préparés mais non exécutés.

Safari/Calendrier Apple explicitement demandés et mentionnés par Sofiane restent refusés par Computer Use, même après réinitialisation ; le serveur et Chromium sont aussi bloqués par le sandbox. Matrice augmentée à 176 tests découverts, non exécutés dans cette passe. Les 156 PASS ci-dessous restent historiques. Les deux ICS reçus sont vérifiés en format/heure, pas importés dans Apple. Procédure de reprise native dans le rapport ; préserver les budgets Google restants.

Tests/rapport locaux non committés ; aucun push/déploiement ni écriture Google/Linear. GitHub distant inaccessible depuis le terminal. Workspace Linear et 22 issues Review relus ; spec Build rouverte `in-progress` pour constats non résolus, sprint 17 stories Review conservé tant que les corrections ne démarrent pas. Le rapport contient le triage complet, les preuves, commandes et suggestions UX distinctes des défauts.

## Candidat V1 préparé pour la recette humaine — 30 octobre 2026

Les cinq blocs et 17 stories sont réalisés dans le candidat de code [`e3eab026ed2b9cedc123ecf10d10a1d3535eb0c6`](https://github.com/blackboxdev0/tema-academie/commit/e3eab026ed2b9cedc123ecf10d10a1d3535eb0c6), après préparation BMAD versionnée dans [`a57ced60b0186c2fe1070fe28ce305b23d3b0137`](https://github.com/blackboxdev0/tema-academie/commit/a57ced60b0186c2fe1070fe28ce305b23d3b0137). Les corrections finales, l’intégration réelle Google, les mesures d’actualisation/secours et l’annulation sont vérifiées selon les résultats ci-dessous. Le [rapport V1](acceptance/V1-results.md) centralise le candidat exact et ses preuves. Retour compatible7→6→7, repos TEST12h, passe Computer Use à4173 et checkpoint CI/Linear vérifiés. Le code final est [c5eca1e1](https://github.com/blackboxdev0/tema-academie/commit/c5eca1e1c673f012ca48d716e49eef0c6df0f4f5). **La cible locale est prête pour recette Sofiane ; aucun ticket Done, acceptation humaine ou intégration main déclaré.**

Le `/goal` de Sofiane du 30 octobre autorise la V1 complète locale réellement connectée à Google Sheets et Apps Script TEST, les tests/corrections/revues dont Sally, la délégation utile et les opérations TEST nécessaires dans les permissions/budgets existants. Commits par jalon et push sur `tem-6-technical-trial` autorisés ; [PR nº1](https://github.com/blackboxdev0/tema-academie/pull/1) conservée en brouillon. Aucune fusion dans main, release publique, publication Vercel/FTP ou mise en production. Cette instruction remplace la préparation différée antérieure ; ne pas redemander le GO de réalisation.

## Démarrer et vérifier

Adresse locale retenue : [http://127.0.0.1:4173](http://127.0.0.1:4173). Depuis `/Users/sofiane/Software/tema/app` :

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build
npm run serve
```

Dans un autre terminal du même dossier, `npm run verify` rejoue tests Node, build, sécurité et Chromium ordinateur/mobile ; `npm run test:browsers` ajoute Firefox/WebKit. Ces suites utilisent des adaptateurs/réseaux simulés et n’écrivent pas sur Google. Le build prend l’URL TEST publique de `config/project.json`, désactivable explicitement avec `TEMA_TEST_API_URL='' npm run build`. [Commandes et limites](../../app/README.md) · [Guide Google](guide-google.md).

Résultats du dernier code : **103 tests Node et 156 parcours Playwright de la matrice réussis**, build et contrôles de sécurité réussis ; revue de performance indépendante PASS avec 22 tests ciblés réussis. CI du jalon précédent réussie sur [run 41125367120](https://github.com/blackboxdev0/tema-academie/actions/runs/41125367120) et [run 41125366823](https://github.com/blackboxdev0/tema-academie/actions/runs/41125366823), sans écriture Google ni déploiement automatique ; CI du code final c5eca1e1 également réussie sur les runs41129653830 et41129664647. WebKit automatisé n’est pas Safari installé ; format mobile n’est pas téléphone physique.

[Sally](acceptance/sally-v1-review.md) : cinq constats corrigés, avis favorable sur les surfaces examinées, contre-vérification Google réelle de la fiche ; aucun P1/P2 restant identifié dans cette passe. [Accessibilité](acceptance/accessibility-v1.md) : 20 tests, 32 scans axe sans violation dans les règles exécutées et quatre scans réels en lecture seule, contrastes/clavier/largeurs réduites contrôlés. Ce n’est pas une attestation complète WCAG ni une preuve de lecteur d’écran.

## Google réel : candidat et données à préserver

Projet et classeur **Tema Académie — TEST** uniquement, compte `temaacademie@gmail.com`. Candidat web app **version 7**, SHA-256 du bundle/HEAD `f8689f42a980ea8d1fecf0eaac47dbf47328dc88cb91ae2c7ba288ec1a9b85ee`. IDs et URL dans `config/project.json` et le [registre](../../_bmad-output/specs/spec-tema-academie-v1/ressources-services.md). Métier garde son squelette privé, sans import ni déploiement V1.

- 24 formations source importées ; **216/216 champs source concordants**, cinq inscriptions historiques préservées. Import/rejeu sans doublon ; aucune vraie date créée depuis « à venir ». La fixture historique a été restaurée et masquée après les mesures ; les 24 IDs, champs et types natifs sont valides.
- Trois inscriptions réelles nouvelles sur données fictives ont produit **trois confirmations et trois avis reçus**, vérifiés dans les boîtes autorisées. Quatre nouvelles réservations de la campagne ont ensuite été annulées de façon réversible, lignes gardées ; replay annulé observé avec états SENT/BLOCKED, sans réactivation ni renvoi. Les cinq lignes historiques demeurent strictement identiques. ICS importés dans l’agenda TEST : hiver 9 h–12 h et été 9 h 30–12 h. Réception et import réels sont distincts des assertions simulées et de SENT.
- Défauts réels corrigés pendant intégration : formats natifs des cases à cocher et séparation des textes programme/prérequis/résultat. Contrôler les types et diagnostics, sans conversion générale des données historiques.
- Export XLSX fictif ouvert dans Numbers, préfixes `=,+,-,@` inertes ; Excel installé non vérifié. Procédure d’export natif et nettoyage documentés dans le guide.

Dernier budget observé : **8/10 inscriptions avec tentative et 16/20 destinataires réservés, quota quotidien 94** ; deux inscriptions avec tentative restent disponibles pour la recette humaine, sans reset. Le quota quotidien est partagé et ne réinitialise pas les budgets persistants. Relire l’état effectif dans le rapport avant toute nouvelle séquence. Préserver allowlist, inscriptions, IDs, compteurs et journal privé d’import ; aucun reset ni restauration de Sheet. Coordonnées autorisées dans `/Users/sofiane/.config/tema-academie/test-recipients.json`, permissions 0600, jamais Git/Linear. Sources privées, captures, exports et ICS restent hors dépôt.

Mesures finales Google : dix éditions normales apparaissent en **26,677 s au maximum**, sous la cible 120 s ; durées natives d’édition jusqu’à 7,54 s. Douze passages inchangés : maximum 3 480 ms, zéro mutation et budget de 16 destinataires inchangé. Secours natif final 4,67 s ; borne prudente historique 5,986 s retenue pour extrapoler `288 × 5,986 + 100 × 7,54 = 41,2995 min/jour`, sous le budget d’ingénierie 45 min. C’est une extrapolation, pas une observation 24 h.

Secours réellement observé sans onEdit ni réconciliation manuelle : J4 fixé à 999 à 16 h 57 min 34 s, déclencheur périodique à 17 h 01 min 54 s, retour attendu à 0 observé à 17 h 02 min 19 s, soit 4 min 45 s. Les aides de mesure ne font pas partie du bundle final. Retour compatible7→6→7 réellement vérifié, données/replay conservés. TEST remis au repos12h avec onEdit conservé, deux déclencheurs constatés ; le [guide](guide-google.md) indique comment réactiver le nominal5min.

## Reprise et clôture du jalon

Le [rapport V1](acceptance/V1-results.md) et le guide sont remis. Spec Build done pour la réalisation,17stories BMAD review et cinq epics in-progress jusqu’à acceptation globale. Les22issues Linear TEM-7 àTEM-28 sont relues en Review, projet In Progress ; [registre](planning/linear-v1.json) synchronisé. Les commits code c5eca1e1 et préparation a57ced60 sont poussés, PR en brouillon ; le bilan documentaire suit son checkpoint de branche. À la reprise, relire Git/Linear et le Goal natif avant une nouvelle action. Recette humaine et intégration main ne sont pas acquises.

Restent à la recette finale Sofiane : Outlook/Calendrier Apple, Excel installé, Safari installé/téléphone physique, lecteur d’écran et zoom natif non vérifiés dans la campagne automatisée. Tema doit valider avant ouverture les vrais créneaux, formations actives/prix, identité et politique/accord/conservation. Ces contrôles gardent leurs preuves propres ; aucune simulation ne les remplace.

## Références durables

[SPEC et compagnons](../../_bmad-output/specs/spec-tema-academie-v1/SPEC.md) : 8 CAP, 21 AC et 12 ET ; [epics](../../_bmad-output/planning-artifacts/epics.md) : cinq blocs, 17 stories et 52 scénarios ; [architecture](../../_bmad-output/planning-artifacts/architecture/architecture-tema-academie-2026-10-20/ARCHITECTURE-SPINE.md) : 11 AD ; [contrôle G0–G4](architecture/controle-technique-v1.md) ; [décisions](decisions/index.md) ; [source catalogue](catalogue/source-catalogue-2026-10-30.md) ; [fonctions](features.md) ; [contexte métier/UX](project-context.md). Le [bilan TEM-6](technical-trial/TEM-6-results.md), 4 ET PASS / 8 incomplets historiques, reste conservé sans réécriture rétroactive.

Socle BKBX Agentic **1.0.1**, révision source `48d56f7bab5f5e18dcc0a455784dae77854bcbd5` ; BMAD **6.12.4**, 29 skills, verrou/routage vérifiés. Pas de mise à jour de méthode pendant cette réalisation. Checkout `/Users/sofiane/Software/tema`, branche `tem-6-technical-trial` ; ne pas déplacer les travaux actifs. L’enveloppe validée est de trois jours-personnes humains actifs cumulés (2,5 base +0,5 réserve), distincte du travail autonome et du délai calendaire. Les conditions commerciales courantes relèvent du contrat séparé.
