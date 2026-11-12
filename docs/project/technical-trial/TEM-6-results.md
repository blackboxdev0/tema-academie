# TEM-6 — Bilan de l’essai technique

Essai limité autorisé et exécuté le **26 octobre 2026**. [Ticket Linear](https://linear.app/tema-academie/issue/TEM-6/eprouver-le-parcours-dinscription-google-sur-lenvironnement-test) · [fiche BMAD](../../../_bmad-output/implementation-artifacts/spec-tem-6-essai-technique.md) · [relance locale](../../../app/README.md).

**Le transport A fonctionne sur le navigateur intégré testé.** Réservation, dernière place, reprise, annulation, contrôles et courriels ont des preuves Google réelles. Le plan complet n’est pas entièrement vérifié : cadence de réparation à arbitrer, autres navigateurs/agendas et plusieurs courses temporelles encore non vérifiés. Aucun GO de développement principal ou de livraison n’en découle.

## Candidat et cible

| Élément | Référence vérifiée |
|---|---|
| Git | Branche `tem-6-technical-trial`, base `8217e5253055e6c669e0a154beee17ef3c4f814b` ; aucun commit/push |
| Sources du prototype | SHA-256 `0b6a955bf2a5c3e0cc516c65cd29f11b3ea58b1393fbf3915bbd460f3bca0fd1` par `npm run fingerprint` |
| Google TEST | Web app version **3**, propriétaire Tema, Anyone confirmé ; HEAD sauvegardé et relu identique, SHA-256 `34e7ab30766995dd62e7bb593042f2b514364a79ea673721c4e33049c0c4364c` |
| Manifeste Google | SHA-256 `62112d4ac721d70b6b46d89daab5b5f3899ca7b2d7cfcdbf96d0fe060339a168` ; Sheets, MailApp et déclencheurs, aucune lecture Gmail/Drive |
| Vercel TEST | Déploiement `5zNTif7SBSon5aEMm3RMoeEPb8Gf`, Ready ; [prototype](https://project-w1j1x.vercel.app/) ; quatre fichiers statiques, aucun serveur Vercel |
| Fichier navigateur servi | app.js identique au build local, SHA-256 `1a03fd30e453f29f1008672918d1fdddf4f30488062cd7ecb1ff2a6a1b5a18e5` ; POST45 s, GET15 s |
| Ressources | [Registre](../../../_bmad-output/specs/spec-tema-academie-v1/ressources-services.md) ; Sheet/projet TEST distincts du Métier, destination fixe côté service |

Le label plateforme « Production » de Vercel concerne ce seul prototype TEST ; aucune livraison client. Le classeur Métier conserve ses seuls en-têtes/paramètres et le squelette Google, sans import ni déploiement métier.

## Vérification reproductible

`cd app && npm run verify` : **61 tests Node**, build et **28 E2E Chromium** (14 scénarios, ordinateur et format Pixel 7), zéro échec/saut. Dernière suite navigateur38,6 s. Moteur identique concaténé dans Google ; Sheets/Lock/MailApp et réseau navigateur simulés dans cette commande. Elle n’envoie aucun courriel réel. Playwright 1.64.1 verrouillé ; Node 22.9.0/npm 11.7.0 constatés. Aucun workflow GitHub Actions dédié au prototype installé ou exécuté.

Trois couches de revue BMAD exécutées ; constats et correctifs consignés dans la fiche. Contrôles réels séparés ci-dessous : navigateur intégré par Computer Use, HTTP anonyme/API, Sheet privé, Gmail Tema et Google Agenda. Aucun vrai Safari, Firefox, appareil physique, Outlook ou Apple déduit des profils Chromium.

## Observations réelles

- Premier formulaire présentiel : une ligne enregistrée, deux SENT. Le délai initial15 s expire ; reprise inchangée confirmée sans doublon ni renvoi. Acceptation finale des mails16,746 s après le clic ; exécution Google24,419 s. Correctif POST45 s et régression locale à réponse lente20 s. Nouvelle inscription en ligne sur le candidat corrigé : confirmation normale et deux SENT observés au contrôle effectué25,815 s après le clic ; ce dernier chiffre est une borne d’observation, pas un chronométrage exact de la réponse.
- Concurrence du 26octobre21:00:40Z sur une capacité1 : une demande FULL en 10,041 s, l’autre RECORDED en 27,998 s, une seule nouvelle ligne. Son reçu initial indique PENDING conservateur ; le Sheet montre ensuite SENT/SENT et le rejeu retourne SENT. BUSY avait été reproduit auparavant sans écriture pendant un recalcul18,151 s. Acquisition/flush et verrou inaccessible ont aussi leurs assertions d’adaptateur.
- Refus réels sans réservation : DUPLICATE, INVALID, CONSENT_REQUIRED, POLICY_CHANGED, CLOSED, NOT_FOUND et SESSION_CHANGED. Une adresse hors liste TEST reçoit INVALID/TEST_RECIPIENT_NOT_ALLOWED. Changement de contenu sous même clé : RETRY_CONFLICT sans reçu privé.
- Annulation manuelle : ancienne ligne conservée annulee, place libérée observée en 14,895 s après actualisation ; reprise de l’ancienne clé reste annulée. Une nouvelle inscription crée une nouvelle ligne/ID. Fermée avec confirmé : Inscriptions terminées ; fermée sans confirmé : date masquée ; autre date indépendante. Formation inactive : catalogue vide et admission refusée, historique conservé.
- Confirmation présentielle et ICS reçus : Sofiane les confirme et fournit une capture. Avis interne reçu dans Gmail Tema. Les confirmations envoyées sans lien et avec lien fictif privé ont été inspectées dans Gmail Tema ; réception dans les deux boîtes participantes correspondantes non observée directement. Sans lien : annonce des jours précédant la formation, ICS sans URL. Avec lien : URL dans le courriel et l’ICS, absente du catalogue.
- Deux véritables pièces jointes importées dans Google Agenda : **1/1 événement pour chaque import**, puis deux résultats affichés9 h–12 h,15janvier2027 et15juillet2027, lieux/accents conservés. UTC hiver14 h–17hZ, été13 h–16hZ, CRLF et absence de TZID contrôlés. La carte automatique du dossier Envoyés de Gmail affiche « Unable to load event » ; l’import manuel Google et l’affichage dans la capture participante fonctionnent. Ne pas promettre une carte Gmail/ajout automatique universels.
- Panne privée PARTICIPANT : FAILED/SENT, place conservée, avis d’échec reçu par Tema. Panne ALL : FAILED/FAILED, place conservée et suivi Sheet ; aucune troisième alerte. Après retrait de l’injection, rejeux toujours FAILED sans renvoi ni nouvelle ligne. Quota épuisé, interruption et annulation/replanification avant engagement d’envoi restent simulés localement.
- Confidentialité : liste blanche HTTP vérifiée, aucun destinataire participant ou lien privé dans le catalogue/bundle web ; requête avec pseudo-commandes reset/destination/panne sans effet d’administration. Texte HTML affiché littéralement ; entreprise `=1+1` conservée comme texte dans le Sheet, pas calculée. Consentement/instantanés restent privés.
- Retour compatible : Vercel courant→déploiement `2ys9tZZ7kCcqpXvKwXCrfqRUkRVi` (app.js70dded…) ; Google version 3/HEAD 34e7…→version 2/HEAD568b…. Catalogue lisible et rejeu d’une inscription existante sans renvoi. Métadonnées des cinq lignes identiques octet pour octet. Versions courantes rétablies puis relues, compteurs conservés ; aucune restauration du classeur.

Heures des appels API en UTC ; éditeur Google relevé en heure locale Toronto. Captures, ICS et traces de travail sont hors dépôt dans `/tmp/tema-trial-TEM-6` ; seuls constats non nominatifs ici. Les coordonnées participantes restent en configuration privée hors dépôt/Linear.

## Résultat des douze ET

Un PASS couvre l’exécution prévue ; un contrôle partiel conserve NON VÉRIFIÉ avec ses preuves utiles. Aucune réussite locale seule ne valide une garantie Google réelle.

| Cas | Résultat | Preuve et limite restante |
|---|---|---|
| ET-01 — lecture publique sans compte | NON VÉRIFIÉ | HTTP anonyme et lecture Vercel avec credentials omit réussis ; contexte distinct de navigation privée non ouvert |
| ET-02 — transport A et inscription | PASS | Réponse exploitable et confirmation normale sur navigateur intégré, une ligne ; premier délai corrigé et candidat réessayé |
| ET-03 — reprise et conflit | NON VÉRIFIÉ | Reprise réelle après délai, rejeu/conflit/annulation/fermeture sans renvoi prouvés ; double clic et priorité devant changement de politique/signaux anti-spam seulement déterministes locaux |
| ET-04 — dernière place et verrou | PASS | Deux demandes réelles, une réservation et FULL ; BUSY sans mutation reproduit ; acquisition/flush complétés par assertions d’adaptateur |
| ET-05 — contrôles, fermeture et révision | NON VÉRIFIÉ | Refus et gestion manuelle réels ; frontière exacte du démarrage et fermeture avant/après les derniers contrôles uniquement à horloge contrôlée |
| ET-06 — réception et liens | NON VÉRIFIÉ | Présentiel reçu attesté/capture, avis Tema reçu, variantes en ligne et trois ICS inspectés côté expéditeur ; réception participante des deux variantes en ligne à observer |
| ET-07 — Toronto et trois agendas | NON VÉRIFIÉ | Deux imports Google réels aux bonnes heures, ICS contrôlés ; Outlook/Apple indisponibles, transitions DST invalides/ambiguës uniquement locales |
| ET-08 — erreurs de courriel | NON VÉRIFIÉ | Deux injections Google réelles, avis reçu, traces et absence de renvoi prouvés ; quota/interruption/annulation avant envoi uniquement simulés localement |
| ET-09 — administration et actualisation | NON VÉRIFIÉ | Génération initiale/défauts et commandes réelles, annulation<15 s ; collages/imports/événements manqués couverts localement. Cadence minute non acceptable sans étude de marge quota/charge |
| ET-10 — confidentialité et textes inertes | PASS | Réponse/bundle inspectés, lien privé absent, HTML et formule inertes réels, TEST fixe/projets séparés et interface sans commande admin |
| ET-11 — navigateurs et mobile | NON VÉRIFIÉ | Navigateur intégré réel ; Chromium ordinateur/mobile automatisés avec réseau contrôlé ; Chrome/Firefox/Safari réels et téléphone physique non vérifiés |
| ET-12 — retour de code compatible | PASS | Site et Google/HEAD revenus puis rétablis ; cinq lignes/reçu et compteurs conservés, aucun reset Sheet |

**4 PASS, 8 NON VÉRIFIÉ ; aucun FAIL encore reproduit sur le candidat courant.** Cela n’est pas une acceptation des huit cas incomplets.

## Latence et cadence à arbitrer

La première réconciliation minute réécrivait calculs/listes/notes sans changement :11–19 s habituelles,37,746 s et76,694 s observées, avec collisions BUSY. Empreinte privée ajoutée : passage inchangé sans mutation, nouvelles mesures3,547 s et4,813 s ; édition réelle12,477 s. IDs, annulations, compteur monotone et réparation des cellules calculées conservés, régressions dédiées.

Extrapolation indicative des deux passages inchangés : environ85–116 min/jour si exécutés1440 fois, avant les éditions. Google annonce **90 min/jour de runtime des déclencheurs** sur compte gmail.com, et100 destinataires/jour ; quotas partagés et modifiables. [Source officielle relue le 26 octobre](https://developers.google.com/apps-script/guides/services/quotas). Il ne s’agit ni d’une mesure24 h ni d’un quota réellement épuisé. La marge du mécanisme minute n’est pas démontrée ; réviser la réparation/sa cadence sans modifier tacitement la cible fonctionnelle<2 min.

Le transport n’exige pas de repli B/C dans le navigateur testé. Les latences observées ne permettent pas de promettre une confirmation instantanée ; la réponse inconnue et la reprise restent nécessaires. Proposer le traitement de la cadence puis compléter les supports manquants avant décision de développement principal.

## État laissé après l’essai

- TEST : une formation active, deux dates fermées, cinq inscriptions fictives (quatre confirmées, une annulée). Sept états SENT et trois FAILED conservés ; aucune file de relance.
- Budget persistant : **5/10 inscriptions**, **10/20 destinataires réservés**, injections comprises ; quota MailApp **92 restants** au relevé26octobre17:17:39 Toronto. Ne pas inférer toute la consommation du compte à partir des seuls états SENT ; le quota est partagé.
- Propriété de panne retirée. Deux déclencheurs de données subsistent : onEdit et réconciliation **toutes les12 heures**, réglage de repos relu dans Google ; aucune suppression définitive ou perte d’historique. La cadence d’essai minute peut être rétablie par l’interface pour une séquence bornée, puis remise au repos. Ce réglage TEST ne choisit pas la cadence V1.
- Google version 3 et HEAD 34e7…, Vercel 5zNT… et app.js 1a03… rétablis. Aucun Métier importé/exécuté/déployé ; aucun commit/push/merge/achat.
- TEM-6 reste In Progress : vérifications requises et décision de cadence/transport encore à conclure avec Sofiane. TEM-5 Review et projet Backlog restent leurs jalons propres.
