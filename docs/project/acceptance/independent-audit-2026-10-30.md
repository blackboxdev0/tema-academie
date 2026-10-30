# Contre-audit développement, UX et tests — 30 octobre 2026

## Avis de remise

**Je ne recommande pas de considérer le candidat comme entièrement vérifié.** La réalisation couvre les parcours attendus et les tests historiques restent utiles, mais cette contre-revue découvre des défauts de gestion et de navigation absents de la première couverture. Les corriger puis rejouer les parcours concernés est recommandé avant l’acceptation finale. Aucun défaut de sur-réservation ou de double envoi nouveau n’a été démontré dans cette passe.

Le cadrage visuel reste cohérent avec la direction approuvée : catalogue en premier, cartes rose/gris, programme avant dates, récapitulatif après sélection sur mobile, réservation distincte de l’état du courriel. **Aucune refonte graphique n’est justifiée par cet audit.** Quelques améliorations de confort sont proposées plus bas, distinctes des défauts.

Safari installé et Calendrier Apple **ne sont pas validés** : l’outil a refusé l’accès aux deux applications, y compris après leurs mentions explicites par Sofiane et une réinitialisation de la connexion. L’inventaire indiquait aussi l’accès navigateur désactivé. Les essais Playwright sont empêchés par les restrictions d’exécution locales. Aucune simulation ne remplace ces essais natifs.

## Candidat, méthode et périmètre

- HEAD examiné : `0f3249feab56161a90f31984115683885f94e44d`, branche `tem-6-technical-trial`. Code applicatif du jalon `c5eca1e1` inchangé par cet audit.
- Bundle Google reconstruit : SHA-256 `f8689f42a980ea8d1fecf0eaac47dbf47328dc88cb91ae2c7ba288ec1a9b85ee`, identique à l’empreinte du candidat documenté. Cela ne constitue pas une nouvelle lecture du HEAD Google distant.
- Diff applicatif contre la référence locale `origin/main` : 35 fichiers, 3 523 lignes ajoutées. La fraîcheur de cette référence distante n’a pas pu être reconfirmée : DNS GitHub indisponible depuis le terminal ; `gh pr view` échoue aussi. CI/PR distantes de cette passe : non revérifiées.
- Skill natif `bmad-code-review` exécuté : personnalisation/configuration, diff/claims temporaires, quatre revues indépendantes (code sans contexte, cas limites, lacunes de vérification, conformité aux critères), triage par l’orchestrateur. Aucun reviewer absent simulé. La revue sans contexte a livré neuf constats étayés plutôt que d’inventer un dixième pour atteindre sa consigne de nombre.
- Références : spec Build V1, epics/52 scénarios, contrat de données, exigences d’acceptation, contrôle technique, EXPERIENCE/DESIGN, maquettes courantes et décisions reprises dans le contexte du projet. Skill `design:design-critique` pour la lecture UX.
- Évaluation visuelle limitée aux captures réelles antérieures référencées par Sally et à la lecture du code actuel : aucun nouveau rendu natif ou navigateur n’est présenté comme observé ici. Le code rendu est resté inchangé ; les captures restent des preuves datées.
- Aucun POST Google réel, nouvel envoi, import dans un agenda personnel, modification du classeur ou opération PROD. Les deux inscriptions avec tentative restantes du budget précédemment observé sont préservées ; le quota courant n’a pas été relu.

## Tests effectivement exécutés

| Contrôle | Résultat de cette passe | Portée exacte |
|---|---|---|
| Suite Node existante | **103/103 réussis** | Logique métier et adaptateurs Google simulés ; rejoués après évolution du helper de test |
| Build et sécurité | **Réussis** | Build statique, syntaxe et frontières publiques, hors réseau |
| Nouveau contrôle du bundle et des ICS | **9/9 réussis** avec les deux fichiers privés reçus | Exécution du vrai `dist/apps-script/Code.gs` dans l’adaptateur simulé, catalogue/inscription/replay, une ligne/deux messages simulés, garde PROD ; contrôle de fichiers agenda |
| Même contrôle sans fichiers privés | **7 réussis, 2 ignorés explicitement** | Mode portable/CI ; intégré à `npm run verify` après le build |
| Nouveaux tests de régressions administratives | **7 échecs sur 7 attendus par le diagnostic** | Cinq comportements défectueux, dont trois variantes de logiciel invalide. Ce sont des échecs du candidat, pas une suite verte |
| Matrice navigateur complète | **Non exécutée** | Nouveau serveur refusé : `listen EPERM 127.0.0.1:4184`. Lancement Chromium seul également refusé par le sandbox macOS |
| Inventaire navigateur après ajouts | **176 tests découverts** | 156 antérieurs + 5 scénarios × 4 profils ; découverte/syntaxe seulement, aucun PASS déduit. Le contrôle focus ordinateur est ignoré sur profil mobile |
| Méthode BMAD et références | **Réussies** | `scripts/bmad.py status`, `scripts/check.py`, BMAD 6.12.4 ; pas de mise à jour de méthode |
| Linear | **Relu en direct** | Workspace `tema-academie`, équipe TEM vérifiée ; 22 issues TEM-7 à TEM-28 en Review |
| Safari/Calendrier Apple | **Bloqués par l’accès outil** | Messages `Computer Use was not approved to use Safari/Calendar`, après plusieurs essais autorisés |

Les 156 réussites Playwright et les mesures Google de [V1-results.md](V1-results.md) restent les résultats **de la campagne précédente**, pas des résultats rejoués aujourd’hui. L’audit npm réseau n’a pas été rejoué ; le contrôle de sécurité local ne le remplace pas.

Commandes reproductibles depuis `app/` :

```sh
npm test
npm run build
npm run security
npm run test:artifact
npm run test:audit-regressions
TEMA_BROWSER_MATRIX=all npm run test:e2e
```

Pour les deux fichiers réellement reçus, définir `TEMA_AUDIT_RECEIVED_ICS_DIR` vers leur dossier privé avant `npm run test:artifact`. Aucun fichier ICS, nom de destinataire, capture ou export privé n’est copié dans le dépôt. Les tests de régression utilisent exclusivement des données fictives en mémoire.

## Constats prioritaires et corrections proposées

Les références R sont celles des nouveaux tests. « Reproduit localement » ne veut pas dire exécuté sur le vrai Sheet. Les constats d’interface restent distingués des reproductions navigateur empêchées.

| Réf. | Gravité / preuve | Déclencheur, conséquence et correction proposée |
|---|---|---|
| **R1** | Moyenne, reproduit ; TEM-12/14 | Une note humaine est présente sur un titre de formation. Vider puis corriger le titre fait remplacer la note par le diagnostic, puis l’efface. `google.js:275–283`. Préserver la note humaine et ne retirer que la partie diagnostic. Nouveau test rouge dédié. |
| **R3** | Moyenne, reproduit ; TEM-12/13 | Après suppression de la dernière formation, la liste de choix des disponibilités propose toujours son ancien code/titre. Même problème avec une liste devenue ambiguë. `google.js:255–257`. Effacer ou remplacer la validation native lorsque la liste devient vide. Le serveur n’accepte pas pour autant cette référence invalide. |
| **R4** | Moyenne, reproduit ; TEM-13 | Capacité initiale 3, puis capacité vidée : le diagnostic signale l’erreur, mais le Sheet affiche toujours 3 places restantes. `engine.js:350–354`. Effacer le calcul lorsqu’il n’est plus définissable. La date est bien retirée du public : aucun dépassement de capacité démontré. |
| **R5** | Moyenne, trois reproductions ; TEM-12/14 | Libellé logiciel vide, dupliqué, ou nouveau libellé `!!!` : catalogue indisponible et réconciliation `CONFIG`, sans diagnostic dans la cellule concernée. `google.js:301–340`, `engine.js:104–106`. Le refus d’une configuration ambiguë est correct ; le défaut est l’absence d’aide privée prescrite pour la réparer. |
| **R6** | Moyenne, transition reproduite en Node VM/DOM simulé ; test navigateur ajouté non exécuté ; TEM-19/21/25 | Après confirmation, cliquer Catalogue puis Précédent peut rouvrir le formulaire désactivé avec « Enregistrement en cours… ». `app.js:148`, `205–211`, `233–245`. Conserver le résultat certain et le restaurer lors du retour sur cette route. Aucun nouvel envoi n’est déduit de ce défaut d’affichage. |
| **R7** | Moyenne, chemin de code établi ; test navigateur ajouté non exécuté ; TEM-25 | Actualisation après changement de prix pendant que le bouton d’inscription ordinateur a le focus : la restauration sélectionne d’abord son double mobile masqué par CSS. `app.js:55,95,119,157–160`. Cibler le contrôle réellement visible ou distinguer les deux clés de focus. Le scan axe précédent ne couvre pas cette transition. |
| **R9** | Moyenne, refus moteur reproduit et chemin UI établi ; TEM-19 | Après relecture des nouvelles conditions, le navigateur remet l’horloge anti-spam à zéro et permet immédiatement de soumettre. En moins d’une seconde, le moteur refuse ; l’interface dit de corriger les champs sans désigner de champ corrigeable. `app.js:218–220,249`, `engine.js:174`. Préserver le début réel de l’interaction ou rendre l’attente explicite. Le scénario à 500 ms rend `INVALID/anti_spam`, sans inscription. |
| **R8** | Faible, reproduit en Node VM/DOM simulé ; test navigateur ajouté non exécuté ; TEM-19/25 | Une formation renommée durant la saisie apparaît sous son nouveau titre dans le récapitulatif reconfirmé, mais garde l’ancien titre en tête de page. `app.js:184,225–227,249`. Réactualiser le titre lors de l’adoption des nouvelles conditions. |
| **R11** | Faible, reproduit hors scénario métier courant ; TEM-12 | Un libellé logiciel `constructor` fait échouer toute la lecture à cause d’une collision avec une propriété héritée JavaScript. `engine.js:103–106`. Utiliser des dictionnaires sans prototype pour ces clés. Correction de robustesse secondaire ; aucun impact constaté sur Divalto/Dimo/MoovApps. |

Le script `node tests/audit/ui-state-proof.cjs` reproduit aussi, sur les fonctions réelles de `app.js`, le retour de la politique vers le formulaire après un résultat certain et le titre périmé après reconfirmation. Le DOM et les changements de hash sont simulés : aucune preuve d’historique natif, de rendu ou de validation HTML n’en découle. Son troisième contrôle expose le catalogue incomplet injecté examiné au triage. Ces trois assertions diagnostiques ne sont pas comptées comme des tests de conformité réussis.

Les cinq comportements administratifs reproduits incluent aussi R2, décrit dans le triage ci-dessous : l’échec existe, mais son impact est trop limité pour en faire un préalable de recette.

## Lacunes de preuve traitées

| Réf. | Lacune | Travail réalisé / état restant |
|---|---|---|
| V1 | Aucun test ne franchissait le délai POST de 45 secondes | Scénario ajouté : admission simulée, réponse suspendue, expiration, reprise de commande strictement identique, une inscription/deux notifications. **À exécuter sur navigateur**. |
| V2 | Aucun test ne franchissait le délai GET de 15 secondes avec une lecture en attente | Scénario ajouté : première lecture suspendue, lecture fraîche en attente, expiration, avis d’ancienneté puis données à jour et avis retiré. **À exécuter sur navigateur**. |
| V3 | Les tests Google chargeaient les sources, jamais `Code.gs` généré | Nouveau test exécutant uniquement le bundle construit dans le contexte Google simulé, sans précharger les sources. **Réussi et intégré à `verify` après build**. Ne constitue pas une nouvelle exécution Google distante. |

Les nouvelles assertions de navigateur R6/R7/R8 expriment le comportement attendu et peuvent devenir rouges tant que les défauts restent présents. La suite `test:audit-regressions` reste séparée pour rendre les défauts ouverts visibles sans les transformer en tests ignorés ou assouplis. Les assertions de diagnostic R5 vérifient la cellule du libellé touché, pas une note quelconque du classeur. Les nouveaux tests ont reçu une contre-relecture indépendante ; l’exécution navigateur reste nécessaire.

## Agenda : preuves obtenues et reste à exécuter

Contrôle indépendant des deux ICS réellement reçus lors de la campagne précédente : hiver **15 janvier 2027, 09:00–12:00 Montréal** ; été **15 juillet 2027, 09:30–12:00 Montréal**. Les dates UTC sont relues et reconverties avec la base de fuseaux du runtime. Pas d’invités/organisateur ajoutés. Fins de ligne CRLF, pliage à 75 octets UTF-8, événement unique et champs examinés conformes aux assertions ; ce n’est pas une certification RFC exhaustive. Le pliage et l’échappement suivent les exigences pertinentes de [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html).

Les cas synthétiques supplémentaires couvrent les bords DST valides du 14 mars et du 7 novembre 2027, accents/emoji/caractères chinois, texte long, retour de ligne ressemblant à un ajout d’invité, virgule/point-virgule/antislash, UID stable, présentiel, lien en ligne présent ou absent. Les heures locales inexistantes/ambiguës restent couvertes par la suite moteur existante.

Protocole Apple prêt dès accès autorisé : créer/choisir un calendrier de recette distinct ; importer les deux `.ics` existants ; vérifier titre, jour, début/fin, fuseau Montréal, lieu/description, absence d’invités ; réimporter le même fichier et observer le comportement de doublon ; ouvrir ensuite un ICS synthétique avec lien privé fictif. Le résultat du second import dépend du client et ne doit pas être présumé. Apple documente l’import de fichiers `.ics` avec choix du calendrier destinataire ([guide Calendrier](https://support.apple.com/en-gb/guide/calendar/icl1023/mac)). Aucun remplacement d’archive `.icbu` ou calendrier personnel n’est requis.

## UX/UI : avis et pistes de confort

**À conserver :** identité rose/gris, cartes scannables, choix par logiciel, lecture du programme avant les dates, statuts textuels, prix qualifié, accord explicite, absence de lien visio public et hiérarchie « place réservée » avant courriel. La revue ne justifie ni nouveau back-office ni refonte de navigation.

**À améliorer après traitement des défauts :**

1. **Réduire la répétition avant les champs sur mobile.** La capture antérieure du formulaire répète le titre de formation et plusieurs explications de réservation avant la première saisie. Condenser les phrases en conservant date, heure, tarif, lieu et caractère non réservé. Préférence de confort, sans obligation de réorganiser le parcours approuvé.
2. **Faciliter les mois sans session.** Entre janvier et juillet, le calendrier demande six clics mensuels. Une action secondaire « Prochaine date disponible » éviterait de traverser les mois vides. Le fonctionnement actuel respecte la navigation mensuelle convenue ; cette amélioration reste à arbitrer.
3. **Simplifier le vocabulaire de confirmation.** « Acceptées par le service d’envoi » expose une distinction technique utile aux preuves mais peu naturelle pour le participant. Garder la certitude de place et une consigne simple de consultation des courriels/indésirables/contact, en conservant des variantes honnêtes pour échec/incertitude.

Ces trois propositions ne sont pas des défauts bloquants et n’ont pas été appliquées. Aucun nouveau problème de contraste n’a été mesuré dans cette passe ; les contrastes antérieurs ne sont pas requalifiés en audit natif actuel.

## Contrôles encore ouverts avant acceptation complète

| Contrôle | État / action |
|---|---|
| Safari macOS réel | Refus d’accès outil. À reprendre : catalogue/filtres, fiche, retour/politique, formulaire requis, historique après succès, erreur/reprise contrôlée, zoom natif 200 % et focus. Ne pas confondre WebKit Playwright et Safari. |
| Calendrier Apple | Import natif non exécuté ; fichiers et heures vérifiés hors application, protocole ci-dessus prêt. |
| Outlook / Excel installé | Preuves toujours absentes ; aucun accès à ces applications vérifié dans cette passe. Numbers et parseur ICS ne les remplacent pas. |
| Téléphone physique / lecteur d’écran | Non exécutés. Contrôler formulaire et confirmation avec VoiceOver, calendrier/liste et clavier/zoom. Profil mobile de navigateur distinct d’un appareil réel. |
| Nouveaux tests navigateur et contre-tests après correctifs | Blocage d’exécution local ; 176 tests découverts, pas 176 réussites. |
| Google réel après correction | À refaire seulement sur les chemins affectés avec candidat identifié ; préserver données, budgets et historique. Aucun budget réel consommé par cet audit. |
| CI, PR, branche distante | Relecture réseau GitHub indisponible ; aucune nouvelle réussite CI, publication, commit ou push revendiqué. |

## Triage exhaustif des revues

Chaque constat a reçu un verdict avant regroupement. Les doublons conservent leur origine. `patch` désigne une action corrective proposée ; aucune correction produit n’a été appliquée par cette revue.

| Origine / constat | Verdict | Suite / preuve |
|---|---|---|
| Blind 1, notes humaines | medium | patch R1 ; test rouge local |
| Blind 2, focus sur copie mobile masquée | medium | patch R7 ; trace DOM/CSS, test préparé |
| Blind 3, résultat perdu dans historique | medium | patch R6 ; trace des transitions, test préparé |
| Blind 4, choix logiciel dérivé non réparé | low | **Rejeté comme préalable de recette** R2 : test rouge réel, mais modification manuelle d’une colonne calculée et aucune erreur des références ID/libellé ou du catalogue démontrée. Ajouter sa prise en compte au digest reste un durcissement optionnel. |
| Blind 5, dernière option de formation | medium | patch R3 ; test rouge local |
| Blind 6, compteur places après capacité invalide | medium | patch R4 ; test rouge local |
| Blind 7, installation sur lignes de cases décochées | low | **Rejeté pour cette recette** : `TRIAL_NOT_EMPTY` reproduit, mais installateur initial historique, non requis sur le TEST déjà peuplé ; guide interdit sa réexécution. Une nouvelle installation devra le traiter si réutilisé. |
| Blind 8, reconfirmation trop rapide | medium | patch R9 ; refus à 500 ms reproduit, origine navigateur relue |
| Blind 9, titre non actualisé | low | patch R8 ; correction directe, test préparé |
| Edge 1, libellé `constructor` | low | patch secondaire R11 ; catalogue UNAVAILABLE reproduit |
| Edge 2, liste vide | medium | regroupé R3 après vérification individuelle |
| Edge 3, catalogue sans `softwares` | low | **Rejeté comme défaut du candidat courant** : exception démontrée sur réponse injectée, mais le producteur actuel renvoie `softwares` ou une enveloppe UNAVAILABLE rejetée en amont. Durcissement du schéma intéressant, sans incident réel établi ; pas de nouvelle branche défensive imposée pour cette seule injection. |
| Verification 1, délai POST | medium | patch V1 ; test ajouté, exécution bloquée |
| Verification 2, délai GET | medium | patch V2 ; test ajouté, exécution bloquée |
| Verification 3, bundle Google | medium | patch V3 **traité et vérifié localement** |
| Acceptance 1, diagnostic logiciel | medium | patch R5 ; trois tests rouges ; contrat données et stories 1.1-2/1.1-3 |
| Acceptance 2, historique après succès | medium | regroupé R6 après vérification individuelle |

Bilan : 17 constats bruts, deux doublons regroupés, trois rejetés avec leur motif, **12 actions distinctes** dont neuf correctifs produit proposés et trois compléments de preuve. V3 est traité ; V1/V2 sont préparés mais pas exécutés ; neuf correctifs produit restent ouverts. Aucune nouvelle décision métier nécessaire pour corriger ces neuf défauts dans les invariants existants. Les trois propositions UX de confort ont leur arbitrage propre.

## Suivi et état laissé

Tests et rapport ajoutés localement, sans modification du code produit, déploiement, commit ou push. Les vérifications Node/bundle sont exécutées ; les régressions rouges sont conservées, non masquées. La spec Build porte les actions ouvertes et n’est plus considérée close après cette contre-revue. Aucun `story_key` unique ne représente cet audit transversal : le sprint conserve ses 17 stories en Review, avec un commentaire de réserve ; les corrections n’ont pas démarré. Linear reste en Review, relu mais non modifié. Aucune acceptation/Done/main n’est déduite de cette passe.

L’affirmation antérieure « prêt pour recette » doit désormais être lue avec ces réserves. L’audit et les tests disponibles sont terminés ; la couverture native demandée reste incomplète tant que l’accès aux applications et aux navigateurs n’est pas effectif.
