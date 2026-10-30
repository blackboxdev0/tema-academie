# Résultats V1 — locale et Google TEST

30 octobre 2026. Cible du GO Sofiane : cinq blocs et 17 stories réalisés en application locale réellement connectée au Google TEST isolé, prête pour sa recette finale. L’acceptation humaine et l’intégration dans main ne sont pas acquises. Aucune publication Vercel/FTP, release publique ou opération Métier/PROD.

## Candidat et démarrage

- Branche `tem-6-technical-trial`, [PR 1 en brouillon](https://github.com/blackboxdev0/tema-academie/pull/1).
- Préparation versionnée avant code : [a57ced60](https://github.com/blackboxdev0/tema-academie/commit/a57ced60b0186c2fe1070fe28ce305b23d3b0137). Réalisation : [e3eab026](https://github.com/blackboxdev0/tema-academie/commit/e3eab026ed2b9cedc123ecf10d10a1d3535eb0c6). Correction de performance : [c5eca1e1](https://github.com/blackboxdev0/tema-academie/commit/c5eca1e1c673f012ca48d716e49eef0c6df0f4f5).
- Adresse : **http://127.0.0.1:4173**. Node22.9.0/npm11.7.0 constatés. Installation, démarrage et tests dans [app/README](../../../app/README.md).
- Google TEST : même projet/classeur et URL du [registre](../../../config/project.json), version web app **7**, exécution propriétaire et accès anonyme autorisés conservés, aucune nouvelle portée. HEAD relu identique au bundle SHA-256 `f8689f42a980ea8d1fecf0eaac47dbf47328dc88cb91ae2c7ba288ec1a9b85ee`, sans global privé ou fonction temporaire de contrôle.
- Empreinte source/outillage/tests : `f508eb96d0fd03579b711e9dfa73265bc0559af2dfbb8b278268b9bd12200073`. Les caches Python sont exclus de cette empreinte reproductible ; aucun changement du moteur Google n’en résulte.

```sh
cd /Users/sofiane/Software/tema/app
npm ci
npx playwright install chromium firefox webkit
npm run build
npm run serve
```

```sh
# Commande complète utilisée après correction
TEMA_BROWSER_MATRIX=all npm run verify
# Audit des dépendances
npm audit --audit-level=moderate
```

Le build utilise par défaut l’URL Google TEST observée. `TEMA_TEST_API_URL='' npm run build` la désactive explicitement ; ce mode ne fournit aucune donnée fictive au visiteur. `npm run test:real` exige une URL TEST explicite et ne fait qu’une lecture réelle sans inscription/envoi. Le [guide Google](../guide-google.md) explique administration, import privé, budget, export, reprise et remise au repos.

## Résultats locaux, revues et limites de preuve

**103 tests Node et156 parcours Playwright réussis**, quatre projets : Chromium ordinateur et largeur mobile, Firefox, WebKit. Build et contrôles de sécurité réussis ; audit npm zéro vulnérabilité. Les adaptateurs Google, l’horloge et le transport du runner sont simulés. Les52identifiants de scénarios d’epics sont tous référencés dans la [matrice](../../../app/tests/coverage.md), qui précise les compléments réels/humains. Charge synthétique, limites3/30, courses, interruption/flush, conditions au démarrage et transitions DST impossibles/ambiguës sont testés localement ; aucune charge réelle1000inscriptions ou saturation Google n’est revendiquée.

CI du candidat de réalisation réussie : [push](https://github.com/blackboxdev0/tema-academie/actions/runs/41125366823) et [PR](https://github.com/blackboxdev0/tema-academie/actions/runs/41125367120). CI du correctif final : [push](https://github.com/blackboxdev0/tema-academie/actions/runs/41129653830) et [PR](https://github.com/blackboxdev0/tema-academie/actions/runs/41129664647), réussies sur le même commit c5eca1e1. API TEST désactivée en CI, aucun déploiement ou courriel réel.

Revue native BMAD Build : trois regards indépendants,15constats initiaux triés/corrigés, contre-revue de reprise de capacité après flush corrigée, puis revue indépendante du patch de performance PASS et22contrôles ciblés réussis. Sont notamment couverts : déduplication/reprise après effacement, import durable/métadonnée source, export via lien symbolique, remplacement sûr des déclencheurs, lectures navigateur ordonnées et focus de retour de politique. Les corrections et décisions figurent dans la [spec Build](../../../_bmad-output/implementation-artifacts/spec-v1-locale-google.md).

[Revue Sally](sally-v1-review.md) favorable sur les surfaces examinées après correction de cinq écarts, sans P1/P2 restant identifié ; contre-vérification avec Google réel en lecture seule. [Audit accessibilité](accessibility-v1.md) :20tests/32scans axe sans violation dans les règles exécutées, quatre scans réels supplémentaires, contrastes/focus/clavier/largeurs réduites contrôlés. Aucune conformité WCAG exhaustive ni validation avec technologie d’assistance n’en est déduite.

## Google réel, données et parcours

Compte Tema dans le navigateur ChatGPT ; réceptions participantes vérifiées dans les boîtes Dia expressément autorisées. Sources, allowlist, captures, exports, messages et ICS restent hors Git/Linear dans les dossiers privés locaux. Aucun destinataire ajouté, aucun budget réinitialisé. Le classeur Métier et les données existantes n’ont pas été modifiés.

**Import et intégrité.** 24 formations source18Divalto/4Dimo/2MoovApps importées ;216champs source comparés à l’export réel. Rejeux sans création,24inchangées, zéro conflit ;24dates source « à venir » conservées dans le journal privé, IDs inchangés, aucune date client inventée. Les cinq inscriptions historiques sont strictement identiques avant/après toute la campagne, y compris après le retour compatible. Un défaut réel de format texte sur les cases a été corrigé puis retesté : types natifs rétablis pour les seules cases connues, writers corrigés et régression ajoutée. Trois sessions2027 fictives ouvertes, ancienne fixture masquée et description restaurée.

**Admission et reprise.** Concurrence réelle sur Ergonomie capacité1 : un seul admis ; autre navigateur BUSY puis FULL au rejeu de la même demande, coordonnées conservées. Dimo : formulaire rempli à09:00, fermeture→modification09:30→réouverture dans Sheets ; SESSION_CHANGED, récapitulatif09:30, consentement remis à zéro puis confirmation après nouvel accord. MoovApps : premier reçu HTTP volontairement abandonné, POST identique suivant REPLAY/confirmee/SENT, sans nouvelle ligne/envoi. Cette réponse ignorée est une épreuve contrôlée de transport HTTP réel, pas une panne réelle du navigateur. L’incertitude BUSY a aussi été parcourue par Computer Use.

**Réception et agendas.** Trois confirmations participantes et trois avis internes effectivement reçus, pour les variantes en ligne sans lien, présentiel/adresse fictive et en ligne avec lien fictif privé. Fichiers ICS extraits des messages réellement reçus : hiver15janvier2027 14:00–17:00UTC, été15juillet2027 13:30–16:00UTC, UID stables égaux aux inscriptions, sans invités/organisateur/URL. Import réel dans le seul agenda privé **Tema Académie — RECETTE V1 TEST** :1/1événement à chaque import, affichage Montréal09:00–12:00 hiver et09:30–12:00 été. Ancien agenda principal conservé, aucun participant/avis d’événement ajouté.

**Incident contrôlé sur Google.** Un helper d’éditeur privé a injecté `MAIL_QUOTA` à la frontière de réservation d’envoi, après admission via les vrais Sheet/Lock/Properties, avec transport neutralisé. Nouvelle ligne CONFIRMÉE, deux canaux BLOCKED, zéro appel MailApp, budget8/16 et quota94 inchangés ; POST anonyme identique REPLAY/confirmee/BLOCKED. Le fournisseur n’a pas réellement manqué de quota. FAILED/UNKNOWN, interruption et annulation avant engagement ont leur preuve locale distincte ; aucune panne externe n’est déduite de l’injection. Les helpers et données de contrôle ont ensuite été retirés du HEAD et n’ont jamais été déployés.

**Gestion et export.** Les quatre nouvelles réservations de campagne ont été annulées réversiblement dans Sheets, sans supprimer leurs lignes/IDs/instantanés ni modifier les cinq anciennes. Rejeux réels : REPLAY/annulee, états SENT et BLOCKED conservés, aucun renvoi. Export réel après retour compatible : neuf lignes conservées, cinq annulées au total,216champs et24IDs source égaux, ancienne fixture masquée. Export XLSX fictif ouvert dans Numbers par Computer Use : chaînes commençant`=`, `+`, `-`, `@` restent textuelles ; contrôle ZIP/XML sans formule également réussi. Excel lui-même et l’effacement irréversible de coordonnées ne sont pas présentés comme exécutés ; nettoyage manuel/reprises sont testés localement et documentés.

## Cadence, correction de performance et retour compatible

Première série réelle : dix éditions toutes<27s, mais durées natives édition jusqu’à18.616s et secours4.863s, extrapolation54.37min/j>45min. Ce résultat défavorable a entraîné la correction avant remise : lectures fraîches maintenues, écritures de calculs/listes/notes inchangées évitées, disposition physique prise en compte et checkpoints seulement après flush réussi.

Candidat final7 : dix éditions réelles depuis Sheets vers une fiche locale, sans rechargement manuel : **5.059,24.050,22.454,6.565,15.257,9.623,7.680,17.862,15.833,26.677s**. Maximum26.677s<120s. Actualisation par cycle30s ou focus ; aucune garantie de place pendant la saisie. Douze réconciliations inchangées :1930,2220,1813,1803,1839,3480,1952,1986,2153,2087,3061,2729ms, zéro patch et budget16destinataires conservé.

Durées natives finales dans Google Executions : éditions jusqu’à7.540s, secours inchangé4.670s. En retenant même la borne native supérieure antérieure5.986s pour le secours : **288×5.986+100×7.540=2477.968s=41.2995min/j≤45min**. Extrapolation prudente, sans observation24h ni inventaire de tous les autres projets privés du compte. Les deux déclencheurs connus du projet sont onEdit et secours. Import initial long, exécutions d’éditeur et polling visiteur sont distingués des éditions normales ; contention/panne Google/usage réel peuvent imposer une nouvelle mesure.

Secours réel : cellule calculée J4 mise à999 par script16:57:34.627Toronto, sans onEdit ni réconciliation explicite. Encore999 à16:59:27 ; passage Time-Driven natif17:01:54, puis0 attendu observé17:02:19.572, délai observé284.945s (4min45). Aucune réservation ou émission de mail. Les cas de génération/collage/import suivent le même moteur et leurs preuves propres dans la matrice.

Retour compatible réel7→6→7, même site statique (aucun changement frontend entre ces deux candidats), HEAD accordé à chaque version, même URL et permissions. Version6 : catalogue24/3 et REPLAY/annulee/SENT constatés ; version7 rétablie et HEAD exact relu ; lecture24/3 et REPLAY/annulee/SENT de nouveau constatés après rétablissement. Aucun reset/restauration de Sheet, compteur, journal, budget ou inscription. Export après retour confirme les cinq historiques strictement identiques.

## État remis pour la recette

Inspection Google17:15:24Toronto :25formations stockées/24publiques, cinq sessions stockées/trois publiques, neuf inscriptions (quatre historiques confirmées et cinq annulées), zéro diagnostic de formation/session. Budget persistant **8/10inscriptions avec tentative,16/20destinataires**, quota quotidien partagé94 à cet instant ; **deux inscriptions avec envoi restent disponibles** pour Sofiane, uniquement avec les destinataires autorisés. Le quota courant ne réinitialise pas ce budget.

Après mesure bornée : onEdit conservé, secours TEST remis au repos **12heures**, deux déclencheurs constatés. `installV1TrialTriggers` réactive la cadence nominale cinq minutes avant une nouvelle recette du secours, puis remettre au repos. Les éditions ordinaires utilisent onEdit ; ce réglage de repos n’est pas présenté comme la cadence nominale5min testée.

Dernière passe Computer Use à l’adresse4173, sans interception :24offres, filtre Dimo4offres, fiche/préselection09:30, formulaire/récapitulatif à390px sans débordement global, retour de politique conservant « Recette » et accord décoché, validation native bloquant les champs requis avant émission. Aucun nouveau POST d’inscription/envoi dans cette passe ; largeur mobile de navigateur, pas téléphone physique. Serveur loopback démarré et onglet de recette conservé.

## Couverture et suivi de la cible locale

| Stories / Linear | Résultat vérifié et limites |
|---|---|
| 1.1 / TEM-12 | Catalogue24, textes/import/rejeu/intégrité Google ; source privée préservée |
| 1.2 / TEM-13 | Types/diagnostics/dates et capacités ; cas de bord locaux, trois dates Google fictives |
| 1.3 / TEM-14 | Dix éditions<120s, douze passages inchangés, secours réel, budget≤45min |
| 2.1 / TEM-15 | Catalogue/filtres/pagination, tests et Computer Use Google réel |
| 2.2 / TEM-16 | Calendrier général grille/liste et navigation, tests/Google réel |
| 2.3 / TEM-17 | Programme avant dates, choix/préselection/retour, Sally et Computer Use |
| 3.1 / TEM-18 | Admission/verrou/concurrence réels ; rate3/30 et bords à horloge contrôlée locaux |
| 3.2 / TEM-19 | BUSY/FULL, reconfirmation réelle, replay réel ; perte de réponse HTTP contrôlée |
| 3.3 / TEM-20 | Trois confirmations+trois avis reçus, ICS Google hiver/été ; Outlook/Apple réservés |
| 3.4 / TEM-21 | Quota injecté sur Google sans mail, BLOCKED/replay ; autres pannes locales distinctes |
| 4.1 / TEM-22 | Annulation Google/réplay annulé ; nouvelle demande/réinscription locale |
| 4.2 / TEM-23 | Fermeture/modification/réouverture09:30 réelles, instantanés conservés ; suivi manuel guidé |
| 4.3 / TEM-24 | Export Google/XLSX/Numbers ; nettoyage testé localement, non exécuté sur données conservées |
| 5.1 / TEM-25 | Maquettes/Sally, contrastes/clavier/axe ; limites manuelles ci-dessous |
| 5.2 / TEM-26 |103Node/156Playwright, sécurité, CI et matrice52scénarios |
| 5.3 / TEM-27 | Campagne locale+Google décrite, préservation/budgets ; recette finale Sofiane distincte |
| 5.4 / TEM-28 | Adresse/commandes/guide/rapport remis ; séance/remise client et publication hors GO courant |

Checkpoint BMAD : spec Build done pour la réalisation,17stories review, cinq epics in-progress avant acceptation globale. Linear :22issues TEM-7 àTEM-28 relues en Review après écriture, projet In Progress. Review signifie candidat vérifié à examiner, pas acceptation finale ni Done. Les étapes historiques TEM-6 restent datées dans leur rapport propre et ne sont pas réécrites comme une preuve actuelle.

## Réservé à Sofiane et à l’ouverture ultérieure

- Recette finale fonctionnelle/visuelle et acceptation de ce candidat ; aucun choix visuel bloquant restant identifié par Sally, ajustements de préférence regroupés à cette recette.
- Import Outlook et Apple Calendar, application Microsoft Excel, téléphone physique/Safari installé, VoiceOver/NVDA, zoom natif et essai avec technologie d’assistance : non vérifiés ici.
- Avant ouverture commerciale : véritables dates, tarifs/modalités, politique/consentement et conservation/responsable à valider par Tema ; droits des employés, hébergement et livraison publique ont leurs GO propres.
- Pas de purge irréversible exécutée, pas d’épuisement réel de quota, d’observation24h ou de charge Google1000inscriptions. Les simulations et injections ci-dessus ne remplacent pas ces preuves.

Les preuves nominatives sont conservées en privé hors dépôt, notamment exports avant/après, réceptions/ICS, mesures et captures ; aucune copie dans ce rapport public. Voir [handoff](../handoff.md), [fonctionnalités](../features.md), [contexte](../project-context.md) et [registre Linear](../planning/linear-v1.json) pour reprise.
