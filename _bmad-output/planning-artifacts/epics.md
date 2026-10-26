---
status: draft
validation: structural-checks-passed-owner-review-pending
principal_development_go: not-granted
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - _bmad-output/specs/spec-tema-academie-v1/SPEC.md
  - _bmad-output/specs/spec-tema-academie-v1/regles-et-acceptation.md
  - _bmad-output/specs/spec-tema-academie-v1/contrat-donnees.md
  - _bmad-output/specs/spec-tema-academie-v1/strategie-tests.md
  - _bmad-output/specs/spec-tema-academie-v1/plan-essai-technique.md
  - _bmad-output/specs/spec-tema-academie-v1/ressources-services.md
  - _bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/EXPERIENCE.md
  - _bmad-output/planning-artifacts/architecture/architecture-tema-academie-2026-10-20/ARCHITECTURE-SPINE.md
  - docs/project/technical-trial/TEM-6-results.md
  - docs/project/decisions/2026-10-26-jalons-et-recette.md
  - docs/project/handoff.md
---

# Tema Académie - Epic Breakdown

## Overview

Préparation autorisée, **validation finale du découpage en attente, aucun GO principal**. Le 26 octobre, Sofiane délègue la préparation complète et les décisions cohérentes avec le périmètre sans questions à chaque étape ; les menus intermédiaires du workflow sont donc parcourus en autonomie, validation regroupée à la fin. SPEC et compagnons tiennent lieu de PRD dans ce projet ; pas de PRD parallèle. Les décisions humaines actuelles priment sur les états historiques des spines et du bilan.


This document provides the complete epic and story breakdown for Tema Académie, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Importer les 24 formations (18 Divalto, 4 Dimo, 2 MoovApps) sans perdre les neuf informations source ; exclure les neuf présentations/webinaires du parcours inscriptible, sans inventer de date. **Source :** CAP-1; AC-01
FR2: Afficher les formations actives et masquer les inactives avec leurs dates, sans supprimer leurs historiques ; maintenir les actives sans date avec Dates à venir. **Source :** CAP-1/2/3; AC-02
FR3: Afficher titre, logiciel, durée, programme, prérequis informatifs, résultat attendu et tarif qualifié par participant en CAD hors taxes ; codes formateurs privés. **Source :** CAP-1; AC-01/14
FR4: Présenter catalogue puis calendrier général avec filtre logiciel commun et ordre réservables, complètes/terminées, sans date ; ordre source à égalité. **Source :** CAP-1/2; AC-03
FR5: Ouvrir le calendrier général sur le mois courant pertinent sinon le premier mois futur ; différencier mois vide, filtre vide et absence de toute date future. **Source :** CAP-2; AC-03
FR6: Ouvrir une fiche sur la date explicitement cliquée sinon le mois de la prochaine date réservable ou visible ; aucune sélection implicite du seul mois ; dates avant programme. **Source :** CAP-1/2; AC-03
FR7: Partager mois, données et sélection entre grille ordinateur et liste mobile ; conserver filtre, mois, position et changement de date pendant la visite. **Source :** CAP-2/4; AC-03/18
FR8: Distinguer open/full/closed : fermée avec confirmé visible Inscriptions terminées, sans confirmé masquée ; complète future consultable ; fermeture au début. **Source :** CAP-2/3; AC-02/16
FR9: Administrer quatre onglets privés avec en-têtes reconnus par nom, diagnostics de lignes invalides isolées et refus des ambiguïtés de configuration. **Source :** CAP-3; AC-05
FR10: Générer une fois des codes lisibles/stables/uniques ; choix logiciel modifiable dans Paramètres et formation par ID — titre ; Formateurs texte libre. **Source :** CAP-3; AC-04/05
FR11: Démarrer toute nouvelle formation inactive et date fermée ; ouverture indépendante par date ; capacité totale configurable, défaut source seulement indicatif. **Source :** CAP-3; AC-02/13
FR12: Publier une modification valide en moins de deux minutes en fonctionnement normal ; contrôle de secours toutes les cinq minutes pour événements manqués, sans mail. **Source :** CAP-3; AC-04; décision humaine 26 octobre remplaçant cible uniforme
FR13: Recueillir prénom, nom, entreprise libre et courriel obligatoires, téléphone facultatif, consentement explicite non précoché et version de politique ; une personne/place. **Source :** CAP-4/7; AC-06
FR14: Vérifier sous verrou réel demande existante puis conditions, activité, ouverture, début, doublon normalisé et places courantes ; écrire/flush avant confirmation. **Source :** CAP-4; AC-07/09/16
FR15: Reprendre la même demande incertaine sans deuxième ligne/place/email ; restituer son statut actuel même après fermeture, politique modifiée ou annulation ; conflit sans divulgation. **Source :** CAP-4/7; AC-08/09/17
FR16: Refuser une nouvelle réservation dont les conditions ont changé et demander une nouvelle confirmation avec coordonnées préservées ; pas de watcher du formulaire. **Source :** CAP-3/4/6; AC-13/17
FR17: Garder la demande admise avant fermeture manuelle ; refuser les suivantes ; aucune tolérance après démarrage, verrou non acquis sans mutation. **Source :** CAP-4; AC-07/16
FR18: Envoyer une confirmation initiale avec ICS puis avis Tema, à partir des instantanés acceptés ; lien privé si disponible sinon annonce du lien transmis manuellement. **Source :** CAP-5; AC-10/11
FR19: Séparer réservation et états email ; conserver place lors de panne, avis de problème si possible, sinon traces privées ; ni relance applicative, ni troisième alerte. **Source :** CAP-5/7; AC-12
FR20: Bloquer/supprimer un envoi initial devenu périmé ou annulé avant engagement ; incertitude honnête après interruption, aucune réception déduite de SENT. **Source :** CAP-5/6/7; AC-12
FR21: Annuler en changeant le statut sans suppression ; libérer une place, conserver ancienne ligne/ID ; réinscription par nouvelle demande/ligne. **Source :** CAP-6; AC-09/13
FR22: Reprogrammer sur la même ligne après fermeture puis contact Gmail manuel et réouverture ; conserver inscrits et instantanés ; aucune notification automatique de modification. **Source :** CAP-3/6; AC-13
FR23: Bloquer les nouvelles inscriptions et signaler une capacité sous les confirmés, sans annulation automatique ; compter seulement les confirmées. **Source :** CAP-3/6; AC-13
FR24: Publier une projection en liste blanche et reçu minimal : pas de participant, code formateur, lien visio, destinataire interne supplémentaire ou donnée privée. **Source :** CAP-7; AC-14
FR25: Rendre tous les textes inertes dans site, Sheet, courriel, en-têtes et ICS ; aucune donnée personnelle dans URL ou stockage durable navigateur. **Source :** CAP-7; AC-15/17
FR26: Préparer une politique dédiée et accord/version consultables avant envoi, validation Tema avant ouverture ; guide de conservation12 mois et nettoyage manuel Emma, sans purge. **Source :** CAP-7/8; AC-06/19
FR27: Permettre export tabulaire Excel sans formule Google ; nettoyage fictif vérifiable avec cohérence des places/reprises et suivi des copies contrôlées. **Source :** CAP-3/7/8; AC-19
FR28: Transmettre guide utilisable, récupération compatible du code sans restaurer les inscriptions, une ronde d’ajustements et séance30 minutes. **Source :** CAP-8; AC-20
FR29: Conserver une batterie locale déterministe avant push, CI sur push/PR et recette réelle séparée, critères reliés et résultats PASS/FAIL/NON VÉRIFIÉ. **Source :** CAP-1 à 8; AC-21
FR30: Livrer un candidat statique démontrable sur Vercel, Google pérenne ; préparer la portabilité pour bascule FTP par Sofiane et contrôler la cible avant acceptation. **Source :** CAP-8; AC-20

### NonFunctional Requirements

NFR1: Français, ordinateur/mobile ; clavier, lecteur d’écran formulaire/résultat, zoom200%, focus/labels/erreurs associés et contrastes contrôlés. **Source :** AC-18; DESIGN/EXPERIENCE
NFR2: Un seul moteur et projet écrivain par Sheet ; capacité fraîche à l’admission indépendante du secours ; verrou des scripts distinct des éditions humaines. **Source :** AD-2/4/9
NFR3: Identifiants immuables et compteurs non réutilisés ; sérialisation canonique/révision partagée, contrats publics V1 et instantanés privés communs. **Source :** AD-3; contrat-donnees
NFR4: Fuseau America/Toronto, UTCZ pour API/ICS ; rejeter heures locales inexistantes/ambiguës, imports hiver/été sans TZID contradictoire. **Source :** AC-11/16; AD-3
NFR5: Site statique sans serveur Vercel ni base externe ; Sheets privé, secrets hors Git/build/Linear, séparation stricte TEST/Métier. **Source :** AD-1/2/7/9
NFR6: Objectif normal<120s et secours nominal5min ; durée/quota/charge à mesurer sans garantie en panne fournisseur ; pas de polling de formulaire. **Source :** décision cadence; AD-8
NFR7: Résultat inconnu jamais présenté comme refus certain/succès ; conservation transitoire des champs sans inscription hors ligne ni renvoi automatique. **Source :** AC-08/12/17
NFR8: Courriels en texte lisible sans image ; acceptation MailApp et réception distinctes ; Google/Outlook/Apple contrôlés avant ouverture, ces deux derniers en recette Sofiane. **Source :** AC-10/11; décision recette
NFR9: Tests rapides sans effets Google ; essais réels fictifs isolés, destinataires/plafonds contrôlés, aucune injection ou restauration de données métier. **Source :** AC-21; stratégie
NFR10: Publication statique et bundle Google limités aux sorties nécessaires ; code HEAD des triggers compatible avec version web app et candidat identifiés. **Source :** AD-1/9
NFR11: Protection anti-abus à éprouver avant ouverture ; DUPLICATE divulgue seulement existence de paire, aucun reçu personnel ; pas de nouveau fournisseur tacite. **Source :** AD-7
NFR12: Pas de nouveau runtime/version promis sur les chiffres candidats anciens : vérifier/verrouiller l’outillage à la préparation autorisée, sans modifier le runtime global. **Source :** spine Stack vs preuve TEM-6
NFR13: Aucun paiement, compte participant/gestionnaire web, groupe, anglais, inscription webinaire, synchro Excel, purge ou relance automatique. **Source :** SPEC Non-goals
NFR14: GO de développement, fusion, déploiement/achat restent distincts ; commits par jalon autorisés, estimation humaine proposée indépendante du travail autonome. **Source :** décisions humaines actuelles

### Additional Requirements

- AR-1: Réutiliser app/web, app/apps-script et app/tests de TEM-6 : moteur commun, adaptateurs et89 tests existants ; ne pas créer un second moteur ni un starter parallèle. **Source :** bilan et code existant
- AR-2: Le starter Vite vanilla de la spine est une proposition historique non installée ; choisir le minimum compatible au GO, sans réinitialiser les sources existantes. **Source :** spine Structural Seed
- AR-3: Génération des IDs, diagnostics et choix par un service commun édition/import/secours ; scripts contrôlés l’appellent explicitement. **Source :** AD-3/8 + décision cadence
- AR-4: Lecture publique fraîche non mutante ; actualisation visible toutes les30s au plus et au focus, sans cache serveur initial ; inscription autoritaire. **Source :** AD-8
- AR-5: Transport A réutilisé comme base prouvée sur navigateur intégré, autres supports à vérifier ; repli B/C modifiant UX/coût soumis à arbitrage. **Source :** AD-6 + bilan
- AR-6: Le prototype TEST est fixé à sa destination/allowlist et plafonds ; préparer un chemin métier distinct sans désactiver sa garde TEST. **Source :** AD-9 + ressources-services
- AR-7: Source du catalogue référencée par manifeste ; aucun exemple du PDF ou mockup converti en vraie cohorte ; validation des formations actives par Tema. **Source :** AC-01/02
- AR-8: Node/test runner et Playwright existants ; CI déterministe à ajouter sans envoi réel, sans déploiement automatiquement autorisé par un push. **Source :** AD-11
- AR-9: Conserver récupérabilité du couple site/script/HEAD et données entre versions ; note courte, aucun système de maintenance supplémentaire. **Source :** AD-9; ET-12
- AR-10: Inventorier la dette de cohérence des spines : minute/uniforme<2min, absence de prototype/commits et anciennes préconditions agendas remplacées par décisions et preuves datées ; mise à jour par writers natifs avant code dépendant. **Source :** décisions actuelles + sources historiques
- AR-11: Niveaux de preuve conservés :4ET PASS/8NON VÉRIFIÉ ; redistribution explicite des compléments par story, aucune clôture TEM-6 automatique. **Source :** bilan
- AR-12: Avant démo client : compte/forfait Vercel compatible et accès/récupération ; avant ouverture : politique/accord, prix/identité et informations pratiques validés par Tema. **Source :** AC-19/20; AD-10
- AR-13: La bascule FTP reste Sofiane ; livrer build portable et points de contrôle, pas une intégration David ou automatisation FTP sans mandat. **Source :** décision hébergement

### UX Design Requirements

UX-DR1: NavigationAcadémie : logo original + Académie, Catalogue/Calendrier sur accueil, contact textuel et politique ; restauration filtre/mois/position au retour. **Source :** S1/S2
UX-DR2: FiltreLogiciel : Tous initial puis trois logiciels, filtre commun cartes/calendrier général, état annoncé et vide avec Voir toutes les formations. **Source :** S1/S3
UX-DR3: CarteFormation : logiciel/titre/durée/prix qualifié/prochaine date et places ou statut, lien fiche ; trois groupes triés sans masquer complète/sans date. **Source :** S1
UX-DR4: FicheFormation : présentation courte, dates avant programme/objectifs/prérequis complets, adresse présentielle publique et aucun lien visio. **Source :** S2
UX-DR5: CalendrierMensuel : général et formation partagent source/visibilité, mois pertinent à arrivée, précédent/suivant libres ensuite et libellés de vide. **Source :** S3
UX-DR6: ListeCohortes : sous760px référence, mêmes dates du mois regroupées par jour ; récapitulatif immédiatement après date sélectionnée. **Source :** S3 mobile
UX-DR7: SélecteurCohorte : sélection explicite avant action ; date cliquée générale prioritaire, complète/terminée consultable non réservable, état neutre sans sélection. **Source :** S2/S3
UX-DR8: IndicateurDisponibilité : texte places/Complet/Inscriptions terminées/Dates à venir, fermeture prioritaire, aucune couleur seule ni garantie de stock. **Source :** S1 à S4
UX-DR9: FormulaireInscription : page dédiée, récapitulatif avant coordonnées, téléphone facultatif, accord puis action ; champs transitoires conservés en changement de date. **Source :** S4
UX-DR10: ChampSaisie : label persistant, erreurs associées/résumé accessible, correction sans perdre autres valeurs, pas de coordonnées URL/localStorage. **Source :** S4
UX-DR11: ConsentementConfidentialité : case décochée, lien/version consultables et retour formulaire conservé, pas de marketing implicite. **Source :** S4/S11
UX-DR12: BoutonAction : libellés S’inscrire à cette date/Confirmer/Changer de date/Reprendre ; envoi bloque double clic, désactivation motivée. **Source :** S2/S4/S5
UX-DR13: MessageÉtat : persistant et annoncé ; refus certain, changement de conditions, réseau lent, inconnu/reprise et résultat annulé distincts. **Source :** S4/S5
UX-DR14: RécapitulatifInscription : formation/date/heures/fuseau/format/lieu/prix actuels présentés ; confirmation certaine avant état d’envoi et contact. **Source :** S4/S5
UX-DR15: CourrielParticipant : texte simple, récapitulatif fidèle et ICS ; lien privé ou annonce jours précédant la formation, place conservée lors d’échec. **Source :** S6
UX-DR16: AvisTema : résumé privé et accès Sheet autorisé, échec participant ou lien à transmettre si concernés, aucune réception garantie. **Source :** S7
UX-DR17: FeuilleAdministration : interfaces Google natives, cases et listes compréhensibles, calculs/IDs/instantanés protégés et diagnostics, statut annulé conservé. **Source :** S8/S9
UX-DR18: ModeEmploi : tâches ajouter/activer/ouvrir/capacité/vérifier entreprise/annuler/reprogrammer/suivi Gmail/export/nettoyage/récupération ; remise30min. **Source :** S10
UX-DR19: LienPolitique : accessible avant accord, texte dédié versionné validé par Tema avant ouverture, aucune validation légale présumée. **Source :** S11
UX-DR20: Identité : conserver logo et rose source #FF008F, action #C6006F, Manrope/Inter ; centraliser tokens de DESIGN sans figer une finition approuvée. **Source :** DESIGN Colors/Typography
UX-DR21: Mise en page : catalogue avant calendrier ;3→2→1 colonnes référence, liste sous760px, formulaire1col mobile et pas de survol indispensable. **Source :** DESIGN Layout
UX-DR22: Accessibilité : langue FR, titres/focus cohérents, commandes nommées, retours à la ligne/zoom200%, contraste des états et réduction animations. **Source :** EXPERIENCE Accessibility
UX-DR23: États vides/indisponibles : catalogue vide, filtre vide, mois vide, aucune date, inactive/introuvable, chargement/réseau distincts sans succès fictif. **Source :** EXPERIENCE State Patterns
UX-DR24: Finition graphique : reprise ciblée en fin de fonctionnalité pour diminuer le rendu générique ; validation visuelle finale distincte et aucune nouvelle piste imposée. **Source :** réserve Sofiane

### FR Coverage Map

FR1: Epic 1 — Tema prépare et publie son offre depuis Google Sheets
FR2: Epic 1 — Tema prépare et publie son offre depuis Google Sheets
FR9: Epic 1 — Tema prépare et publie son offre depuis Google Sheets
FR10: Epic 1 — Tema prépare et publie son offre depuis Google Sheets
FR11: Epic 1 — Tema prépare et publie son offre depuis Google Sheets
FR12: Epic 1 — Tema prépare et publie son offre depuis Google Sheets
FR3: Epic 2 — Le visiteur trouve une formation et choisit sa date
FR4: Epic 2 — Le visiteur trouve une formation et choisit sa date
FR5: Epic 2 — Le visiteur trouve une formation et choisit sa date
FR6: Epic 2 — Le visiteur trouve une formation et choisit sa date
FR7: Epic 2 — Le visiteur trouve une formation et choisit sa date
FR8: Epic 2 — Le visiteur trouve une formation et choisit sa date
FR13: Epic 3 — Le participant réserve une place et reçoit ses informations
FR14: Epic 3 — Le participant réserve une place et reçoit ses informations
FR15: Epic 3 — Le participant réserve une place et reçoit ses informations
FR16: Epic 3 — Le participant réserve une place et reçoit ses informations
FR17: Epic 3 — Le participant réserve une place et reçoit ses informations
FR18: Epic 3 — Le participant réserve une place et reçoit ses informations
FR19: Epic 3 — Le participant réserve une place et reçoit ses informations
FR20: Epic 3 — Le participant réserve une place et reçoit ses informations
FR24: Epic 3 — Le participant réserve une place et reçoit ses informations
FR25: Epic 3 — Le participant réserve une place et reçoit ses informations
FR21: Epic 4 — Tema gère les inscrits et les changements en conservant l’historique
FR22: Epic 4 — Tema gère les inscrits et les changements en conservant l’historique
FR23: Epic 4 — Tema gère les inscrits et les changements en conservant l’historique
FR26: Epic 4 — Tema gère les inscrits et les changements en conservant l’historique
FR27: Epic 4 — Tema gère les inscrits et les changements en conservant l’historique
FR28: Epic 5 — Tema reçoit une solution vérifiée, présentable et transmissible
FR29: Epic 5 — Tema reçoit une solution vérifiée, présentable et transmissible
FR30: Epic 5 — Tema reçoit une solution vérifiée, présentable et transmissible

## Epic List

### Epic 1: Tema prépare et publie son offre depuis Google Sheets

**Linear :** [TEM-7](https://linear.app/tema-academie/issue/TEM-7/v1-1-tema-prepare-et-publie-son-offre-depuis-google-sheets) — Backlog, préparation à valider.

Tema peut maintenir les 24 formations et préparer/ouvrir des dates sans développeur, avec données privées, codes stables et actualisation contrôlée.

**FRs covered:** FR1, FR2, FR9, FR10, FR11, FR12

**Dépendances :** aucune epic future ; ressources et prototype existants

### Epic 2: Le visiteur trouve une formation et choisit sa date

**Linear :** [TEM-8](https://linear.app/tema-academie/issue/TEM-8/v1-2-le-visiteur-trouve-une-formation-et-choisit-sa-date) — Backlog, préparation à valider.

Le visiteur consulte le catalogue et les deux calendriers, comprend les disponibilités et rejoint la bonne date depuis ordinateur ou téléphone.

**FRs covered:** FR3, FR4, FR5, FR6, FR7, FR8

**Dépendances :** Epic1

### Epic 3: Le participant réserve une place et reçoit ses informations

**Linear :** [TEM-9](https://linear.app/tema-academie/issue/TEM-9/v1-3-le-participant-reserve-une-place-et-recoit-ses-informations) — Backlog, préparation à valider.

Le participant obtient une inscription fiable, une confirmation et un fichier agenda ; les reprises et incidents ne créent ni doublon ni faux succès.

**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR24, FR25

**Dépendances :** Epic1, Epic2

### Epic 4: Tema gère les inscrits et les changements en conservant l’historique

**Linear :** [TEM-10](https://linear.app/tema-academie/issue/TEM-10/v1-4-tema-gere-les-inscrits-et-les-changements-en-conservant) — Backlog, préparation à valider.

Tema annule, ajuste les capacités ou reprogramme et fait ses suivis manuels, avec export et nettoyage documentés.

**FRs covered:** FR21, FR22, FR23, FR26, FR27

**Dépendances :** Epic1, Epic3

### Epic 5: Tema reçoit une solution vérifiée, présentable et transmissible

**Linear :** [TEM-11](https://linear.app/tema-academie/issue/TEM-11/v1-5-tema-recoit-une-solution-verifiee-presentable-et-transmissible) — Backlog, préparation à valider.

La V1 reçoit sa finition, ses contrôles automatisés et sa recette réelle, puis est remise sur la cible acceptée avec guide et build portable.

**FRs covered:** FR28, FR29, FR30

**Dépendances :** Epic1, Epic2, Epic3, Epic4



Les cinq résultats reprennent les cinq blocs acceptés. Le partage des sources métier entre epics est intentionnel : chaque story étend le moteur commun existant, sans implémentation concurrente. Chaque epic a un résultat utilisable dans son domaine avant les suivantes ; les tests locaux et contrôles de confidentialité font partie de chaque story, pas uniquement de l’epic finale. Validation finale regroupée à la demande de Sofiane ; aucune approbation détaillée inventée.

## Epic 1: Tema prépare et publie son offre depuis Google Sheets

Tema peut maintenir les 24 formations et préparer/ouvrir des dates sans développeur, avec données privées, codes stables et actualisation contrôlée.

### Story 1.1: Préparer le catalogue fidèle et administrable

**Linear :** [TEM-12](https://linear.app/tema-academie/issue/TEM-12/11-preparer-le-catalogue-fidele-et-administrable) — Backlog, préparation à valider.

En tant que gestionnaire Tema,
je veux retrouver et modifier le catalogue client dans un tableau privé,
afin de préparer les formations sans ressaisie ni perte de contenu.

**FR :** FR1, FR2, FR9, FR10

**NFR :** NFR3, NFR5, NFR10, NFR12, NFR13, NFR9

**UX-DR :** UX-DR17

**AR- :** AR-1, AR-2, AR-6, AR-7, AR-10, AR-8

**AC- :** AC-01, AC-02, AC-05, AC-14, AC-21

**ET- :** ET-09, ET-10

**Dépendances antérieures :** ressources et prototype existants ; aucun travail futur

**Réutilisé :** En-têtes et ressources déjà préparés ; adaptateurs, générateur et validations TEM-6.

**Reste à réaliser :** Import candidat des24 lignes et paramètres logiciels, listes et contrôles de saisie ; adapter la destination métier sans retirer la garde TEST.

**Vérification :** Comparaison source/candidat24/18-4-2, doublons/en-têtes déplacés, ID stable, défaut inactif, projection privée.

**Acceptance Criteria:**

**AC story 1.1-1**

**Given** le classeur source identifié et une destination isolée autorisée,
**When** le catalogue est importé,
**Then** 24 formations18/4/2 conservent les neuf informations utiles et les tarifs qualifiés ; aucune date ni entrée inscriptible issue des neuf présentations n’est inventée.

**AC story 1.1-2**

**Given** un gestionnaire ajoute/renomme une formation ou un logiciel,
**When** le traitement commun valide la ligne,
**Then** le code est attribué une seule fois et reste stable ; les choix ID — libellé restent résolus, Formateurs reste texte libre et nouvelle formation inactive.

**AC story 1.1-3**

**Given** des colonnes ont été déplacées ou une ligne/en-tête est invalide,
**When** le tableau est relu,
**Then** les noms d’en-têtes font autorité ; erreur isolable diagnostiquée, ambiguïté refusée, aucune fuite ou effacement des lignes valides.

**AC story 1.1-4**

**Given** un premier changement applicatif doit être poussé après son GO,
**When** le socle de vérification est préparé,
**Then** la commande locale existante conditionne le push et les mêmes contrôles sont câblés sur push/PR dès ce premier jalon ; aucun email, effet Google réel ou déploiement automatique dans la CI.

### Story 1.2: Préparer et ouvrir des dates avec capacité configurable

**Linear :** [TEM-13](https://linear.app/tema-academie/issue/TEM-13/12-preparer-et-ouvrir-des-dates-avec-capacite-configurable) — Backlog, préparation à valider.

En tant que gestionnaire Tema,
je veux choisir formation, date, horaires, lieu et capacité puis ouvrir une date,
afin de garder la maîtrise de chaque cohorte.

**FR :** FR8, FR9, FR11, FR23

**NFR :** NFR2, NFR3, NFR4, NFR5

**UX-DR :** UX-DR8, UX-DR17

**AR- :** AR-1, AR-3, AR-6

**AC- :** AC-02, AC-05, AC-13, AC-16

**ET- :** ET-05, ET-09, ET-10

**Dépendances antérieures :** 1.1

**Réutilisé :** Projection et contrôles horaires/capacité déjà testés dans TEM-6.

**Reste à réaliser :** Saisie native complète, protections et diagnostics ; capacité par défaut sans liaison aux dates existantes.

**Vérification :** Dates sans lien en ligne, deux capacités non8, valeurs invalides/DST, fermeture au démarrage, priorité des statuts.

**Acceptance Criteria:**

**AC story 1.2-1**

**Given** une nouvelle date est ajoutée pour une formation existante,
**When** le gestionnaire renseigne les champs nécessaires,
**Then** un ID cohorte stable est créé ; la date démarre fermée et la capacité reste modifiable par date, sans propager un changement du défaut formation aux dates existantes.

**AC story 1.2-2**

**Given** des dates ouvertes/fermées, complètes et une formation inactive existent,
**When** la projection est lue,
**Then** ouverte avec place/open, sans place/full ; fermée avec confirmé/closed prioritaire, sans confirmé masquée ; inactive et dates passées absentes, historique conservé.

**AC story 1.2-3**

**Given** le début est atteint ou une capacité passe sous les confirmés,
**When** une nouvelle inscription est contrôlée,
**Then** elle est refusée, les confirmés ne sont jamais annulés, le diagnostic est visible en privé et une case ouverte ne contourne ni début ni capacité.

### Story 1.3: Actualiser les modifications et rattraper un traitement manqué

**Linear :** [TEM-14](https://linear.app/tema-academie/issue/TEM-14/13-actualiser-les-modifications-et-rattraper-un-traitement-manque) — Backlog, préparation à valider.

En tant que gestionnaire Tema,
je veux voir mes changements rapidement sans intervention technique,
afin de publier une offre cohérente même après une erreur de traitement.

**FR :** FR12

**NFR :** NFR2, NFR6, NFR9, NFR10

**UX-DR :** UX-DR17

**AR- :** AR-3, AR-4, AR-9, AR-10, AR-11

**AC- :** AC-04, AC-05, AC-13, AC-21

**ET- :** ET-09

**Dépendances antérieures :** 1.2

**Réutilisé :** Même moteur de réconciliation, empreinte privée et tests de stabilité existants.

**Reste à réaliser :** Traitement ciblé onEdit/import, secours5min, mesures bornées runtime/quota/charge ; consolidation préalable des passages de contrats remplacés par la décision datée.

**Vérification :** Chronométrer édition→projection→site du prototype, collage/script/événement manqué ; observer absence de mail et exactitude admission.

**Acceptance Criteria:**

**AC story 1.3-1**

**Given** une modification valide normale ou un import contrôlé intervient,
**When** le traitement associé et la lecture publique sont effectués,
**Then** l’objectif bout en bout est inférieur120s en fonctionnement normal ; les imports appellent explicitement le même service, sans attendre onEdit.

**AC story 1.3-2**

**Given** une modification n’a pas été traitée,
**When** le secours nominal toutes les5min passe,
**Then** IDs/listes/diagnostics/calculs manquants sont réparés sans courriel ni réattribution ; délai de panne fournisseur distingué d’un délai garanti.

**AC story 1.3-3**

**Given** le traitement est inchangé puis une série représentative d’éditions intervient,
**When** les durées et le quota partagé sont relevés,
**Then** les écritures inutiles sont évitées ; mesures et extrapolations distinguées ; marge insuffisante signalée avant déploiement dépendant, TEST remis au repos après séquence bornée.

## Epic 2: Le visiteur trouve une formation et choisit sa date

Le visiteur consulte le catalogue et les deux calendriers, comprend les disponibilités et rejoint la bonne date depuis ordinateur ou téléphone.

### Story 2.1: Consulter et filtrer le catalogue des formations

**Linear :** [TEM-15](https://linear.app/tema-academie/issue/TEM-15/21-consulter-et-filtrer-le-catalogue-des-formations) — Backlog, préparation à valider.

En tant que visiteur,
je veux voir les formations utiles à mon logiciel,
afin de comprendre l’offre même avant programmation de nouvelles dates.

**FR :** FR2, FR3, FR4

**NFR :** NFR1, NFR5

**UX-DR :** UX-DR1, UX-DR2, UX-DR3, UX-DR8, UX-DR20, UX-DR21, UX-DR23

**AR- :** AR-1, AR-4

**AC- :** AC-01, AC-02, AC-03, AC-14, AC-18

**ET- :** ET-01, ET-10, ET-11

**Dépendances antérieures :** 1.3

**Réutilisé :** Projection publique et références UX ; prototype limité ne contient pas le vrai catalogue.

**Reste à réaliser :** Accueil complet avec composants partagés, tri et filtre logiciels, tarifs et états vides.

**Vérification :** Fixtures avec toutes disponibilités, filtre commun, ordre source, clavier et absence de PII réseau/build.

**Acceptance Criteria:**

**AC story 2.1-1**

**Given** plusieurs formations actives et inactives existent,
**When** le catalogue est affiché,
**Then** seules les actives sont consultables, triées réservables puis complètes/terminées puis sans date ; ordre source à égalité et aucune limite à six cartes de maquette.

**AC story 2.1-2**

**Given** Tous ou un logiciel est choisi,
**When** le filtre change,
**Then** les cartes utilisent le filtre et son état partagé est disponible au calendrier ; chaque carte présente titre/logiciel/durée/tarif À partir de en CAD par participant taxes en sus et disponibilité ; le filtre vide offre Voir toutes les formations.

**AC story 2.1-3**

**Given** la lecture charge, échoue ou ne trouve aucune formation active,
**When** l’écran est présenté,
**Then** les états sont distincts et accessibles, aucun stock fictif annoncé ; navigation Catalogue/Calendrier et contact/politique sont présents.

### Story 2.2: Parcourir le calendrier général sur ordinateur et téléphone

**Linear :** [TEM-16](https://linear.app/tema-academie/issue/TEM-16/22-parcourir-le-calendrier-general-sur-ordinateur-et-telephone) — Backlog, préparation à valider.

En tant que visiteur,
je veux parcourir les dates disponibles du catalogue,
afin de trouver une formation compatible avec mon agenda.

**FR :** FR5, FR7, FR8

**NFR :** NFR1, NFR4, NFR6

**UX-DR :** UX-DR1, UX-DR2, UX-DR5, UX-DR6, UX-DR8, UX-DR21, UX-DR22, UX-DR23

**AR- :** AR-4

**AC- :** AC-02, AC-03, AC-16, AC-18

**ET- :** ET-01, ET-09, ET-11

**Dépendances antérieures :** 2.1

**Réutilisé :** Horaires UTC/Toronto et statuts publics ; contrat UX du calendrier.

**Reste à réaliser :** Grille mensuelle et liste mobile du même jeu de données ; navigation/mois/init, lien vers date précise.

**Vérification :** Mois courant vide, premier mois futur, aucun futur, plusieurs dates/jour, transitions et mobilité/clavier.

**Acceptance Criteria:**

**AC story 2.2-1**

**Given** le visiteur arrive avec un filtre actif,
**When** le calendrier général est initialisé,
**Then** les dates suivent le même filtre que les cartes ; mois courant si date future visible sinon premier mois futur pertinent ; sans futur message Aucune formation planifiée pour le moment, catalogue conservé.

**AC story 2.2-2**

**Given** le visiteur navigue entre mois ou change de largeur,
**When** le calendrier est rendu,
**Then** navigation manuelle ne saute pas les mois vides ; grille ordinateur et liste mobile par jour conservent exactement mois, dates, horaires et statuts ; commandes nommées au clavier.

**AC story 2.2-3**

**Given** une date visible est cliquée,
**When** le lien de destination est construit,
**Then** il conserve identifiant de formation, cohorte et mois ciblés ; le mois/filtre/position sont conservés pendant la visite, sans donnée personnelle ; la fiche consommera ce contexte dans la story2.3.

### Story 2.3: Lire la fiche et sélectionner explicitement une date

**Linear :** [TEM-17](https://linear.app/tema-academie/issue/TEM-17/23-lire-la-fiche-et-selectionner-explicitement-une-date) — Backlog, préparation à valider.

En tant que visiteur,
je veux consulter programme et conditions de la bonne date,
afin de décider de mon inscription en connaissant lieu, horaire et tarif.

**FR :** FR3, FR6, FR7, FR8

**NFR :** NFR1, NFR4, NFR5

**UX-DR :** UX-DR3, UX-DR4, UX-DR5, UX-DR6, UX-DR7, UX-DR8, UX-DR12, UX-DR14, UX-DR21, UX-DR23

**AR- :** AR-4, AR-5

**AC- :** AC-02, AC-03, AC-14, AC-18

**ET- :** ET-01, ET-09, ET-10, ET-11

**Dépendances antérieures :** 2.2

**Réutilisé :** Projection publique, références fiche/récapitulatif et statuts du prototype.

**Reste à réaliser :** Fiche complète, calendrier propre formation, récapitulatif proche date et entrée du formulaire.

**Vérification :** Entrée carte vs date explicite, complète/sans date/inactive, changement sélection et retour de contexte.

**Acceptance Criteria:**

**AC story 2.3-1**

**Given** une fiche est ouverte depuis carte ou date du général,
**When** son calendrier est affiché,
**Then** date explicite prioritaire ; sinon mois prochaine réservable, à défaut prochaine visible ; mois seul sans sélection ni bouton actif, dates avant programme/prérequis complets.

**AC story 2.3-2**

**Given** une date est explicitement sélectionnée,
**When** son récapitulatif est affiché,
**Then** date/heures/fuseau/format/adresse présentielle/places/tarif concordent ; en mobile le récapitulatif suit cette date ; aucun lien visio public.

**AC story 2.3-3**

**Given** la date est complète/terminée ou aucune date n’est visible,
**When** le visiteur consulte la fiche,
**Then** elle reste consultable mais inscription désactivée avec raison ; inactive/introuvable propose retour ; l’action d’une date ouverte référence la bonne cohorte et sa révision pour le formulaire de la story3.1.

## Epic 3: Le participant réserve une place et reçoit ses informations

Le participant obtient une inscription fiable, une confirmation et un fichier agenda ; les reprises et incidents ne créent ni doublon ni faux succès.

### Story 3.1: Confirmer une inscription unique aux conditions présentées

**Linear :** [TEM-18](https://linear.app/tema-academie/issue/TEM-18/31-confirmer-une-inscription-unique-aux-conditions-presentees) — Backlog, préparation à valider.

En tant que participant,
je veux réserver une place depuis la date choisie,
afin de obtenir une réservation fiable sans compte Google.

**FR :** FR13, FR14, FR17, FR24, FR25

**NFR :** NFR1, NFR2, NFR3, NFR4, NFR5, NFR7, NFR11

**UX-DR :** UX-DR9, UX-DR10, UX-DR11, UX-DR12, UX-DR14, UX-DR19

**AR- :** AR-1, AR-5, AR-6

**AC- :** AC-06, AC-07, AC-09, AC-14, AC-15, AC-16, AC-18

**ET- :** ET-01, ET-02, ET-04, ET-05, ET-10, ET-11

**Dépendances antérieures :** 2.3

**Réutilisé :** Moteur/admission/flush, normalisation et transport A déjà éprouvés, formulaire minimal et tests.

**Reste à réaliser :** Formulaire V1 relié au parcours complet, récapitulatif, accord/version, protections anti-abus sans service externe nouveau.

**Vérification :** Nominal Google anonyme, dernière place, défaut de verrou, champs/accord/doublon/début, payload malveillant et absence de PII publique.

**Acceptance Criteria:**

**AC story 3.1-1**

**Given** une date est réservable et une politique de test ou validée est présentée,
**When** le participant remplit les quatre champs obligatoires, téléphone optionnel et accepte,
**Then** le serveur conserve consentement/version/instant et conditions acceptées ; une seule ligne/place est enregistrée avant contrôle entreprise manuel Tema.

**AC story 3.1-2**

**Given** deux demandes visent la dernière place ou le verrou échoue,
**When** les demandes sont contrôlées sur les valeurs actuelles,
**Then** une seule est enregistrée, autre FULL ; BUSY sans mutation ; aucune capacité/prix/statut client fait autorité et fermeture horaire à l’admission respectée.

**AC story 3.1-3**

**Given** les champs/consentement sont invalides ou un doublon actif existe,
**When** la demande est soumise,
**Then** refus certain seulement après contrôles établis, pas de ligne indue ; messages liés aux champs et pas de reçu/coordonnée tiers ; anti-abus et limites de divulgation DUPLICATE documentés.

### Story 3.2: Reprendre un résultat incertain et reconfirmer des conditions modifiées

**Linear :** [TEM-19](https://linear.app/tema-academie/issue/TEM-19/32-reprendre-un-resultat-incertain-et-reconfirmer-des-conditions) — Backlog, préparation à valider.

En tant que participant,
je veux retrouver le vrai résultat de ma demande,
afin de ne pas réserver deux fois ni perdre mes informations lors d’un incident.

**FR :** FR15, FR16, FR24, FR25

**NFR :** NFR2, NFR3, NFR7

**UX-DR :** UX-DR9, UX-DR10, UX-DR12, UX-DR13, UX-DR14, UX-DR23

**AR- :** AR-1, AR-5

**AC- :** AC-08, AC-09, AC-13, AC-17, AC-18

**ET- :** ET-03, ET-05, ET-11

**Dépendances antérieures :** 3.1

**Réutilisé :** UUID/empreinte/reçu, gestion unknown/replay et délai corrigé45s, tests existants.

**Reste à réaliser :** Intégration aux changements de date/navigation/politique et reconfirmation de conditions sur vraie fiche.

**Vérification :** Double clic, réponse perdue après écriture, fermeture/politique modifiée, annulation ancienne clé, conflit et formulaire long ouvert.

**Acceptance Criteria:**

**AC story 3.2-1**

**Given** une réponse est perdue ou indécodable après envoi,
**When** le participant reprend,
**Then** même UUID/contenu conservés, reçu courant recherché avant validations mutables ; aucune seconde ligne ou mail ; inconnu jamais traduit en succès/refus certain.

**AC story 3.2-2**

**Given** les conditions ont changé avant une nouvelle admission,
**When** le serveur retourne SESSION_CHANGED,
**Then** aucune place créée ; récapitulatif actuel relu, champs conservés et nouvelle confirmation explicite avant nouvelle clé ; pas de watcher continu.

**AC story 3.2-3**

**Given** le refus est certain ou l’ancienne inscription est annulée,
**When** le résultat et les actions sont rendus,
**Then** complet propose autre date de même formation sans perdre la saisie ; ancienne demande reste annulée, même clé/autre contenu conflit sans divulgation ; aucune coordonnée dans URL/stockage durable.

### Story 3.3: Recevoir confirmation, invitation et avis interne fidèles

**Linear :** [TEM-20](https://linear.app/tema-academie/issue/TEM-20/33-recevoir-confirmation-invitation-et-avis-interne-fideles) — Backlog, préparation à valider.

En tant que participant,
je veux recevoir les informations de la session et un fichier agenda,
afin de préparer ma participation avec des horaires exacts.

**FR :** FR18

**NFR :** NFR3, NFR4, NFR5, NFR8

**UX-DR :** UX-DR14, UX-DR15, UX-DR16

**AR- :** AR-1, AR-6

**AC- :** AC-10, AC-11, AC-14, AC-15

**ET- :** ET-06, ET-07, ET-10

**Dépendances antérieures :** 3.2

**Réutilisé :** MailApp, instantanés communs et ICS déjà produits ; réception présentielle attestée et imports Google hiver/été.

**Reste à réaliser :** Contenus définitifs participant/Tema, texte pratique et intégration aux données complètes.

**Vérification :** Réception présentiel et en ligne avec/sans lien, ICS/UTC/accents/lieu, Google ; Outlook/Apple à recette5.3.

**Acceptance Criteria:**

**AC story 3.3-1**

**Given** une inscription éligible vient d’être enregistrée,
**When** l’envoi initial est tenté,
**Then** confirmation participant puis avis Tema reprennent les instantanés acceptés, contact/expéditeur attendu et ICS ; UID stable par inscription et horaires été/hiver corrects.

**AC story 3.3-2**

**Given** la session en ligne a ou non son lien privé,
**When** confirmation et invitation sont produites,
**Then** lien présent seulement au participant ; sinon mention de transmission dans les jours précédents et lieu En ligne — lien à venir, avis Tema du suivi, aucune URL inventée ou publique.

**AC story 3.3-3**

**Given** le service accepte un envoi et le participant reçoit le message,
**When** les preuves sont relevées,
**Then** SENT est distinct de réception ; fichier réellement reçu/importe contrôlé, aucune carte Gmail ou synchronisation automatique universelle promise.

### Story 3.4: Conserver la place et un suivi honnête lorsque l’envoi échoue

**Linear :** [TEM-21](https://linear.app/tema-academie/issue/TEM-21/34-conserver-la-place-et-un-suivi-honnete-lorsque-lenvoi-echoue) — Backlog, préparation à valider.

En tant que gestionnaire Tema,
je veux retrouver les problèmes de confirmation sans réinscrire le participant,
afin de faire le suivi depuis Gmail avec l’état réel.

**FR :** FR19, FR20

**NFR :** NFR2, NFR7, NFR8, NFR9

**UX-DR :** UX-DR13, UX-DR14, UX-DR15, UX-DR16, UX-DR17

**AR- :** AR-1, AR-6, AR-9

**AC- :** AC-08, AC-12, AC-13, AC-17

**ET- :** ET-03, ET-08

**Dépendances antérieures :** 3.3

**Réutilisé :** Claims et états séparés, injections privées TEST et garde sans renvoi déjà testés.

**Reste à réaliser :** Cas d’interruption/quota et de changement avant engagement non intégralement observés, textes définitifs.

**Vérification :** Pannes participant/globales, annulation et révision avant claim/envoi, coupure après claim ; aucun épuisement réel.

**Acceptance Criteria:**

**AC story 3.4-1**

**Given** la réservation est enregistrée mais la confirmation échoue,
**When** l’avis Tema reste possible,
**Then** place conservée et avis interne signale l’échec ; si le canal échoue aussi, traces privées, pas de troisième alerte ni de renvoi lors d’un rejeu.

**AC story 3.4-2**

**Given** une inscription est annulée ou ses conditions changent avant engagement participant,
**When** l’envoi vérifie son éligibilité,
**Then** SUPPRESSED/BLOCKED empêche un message périmé ; état certain/incertain après interruption conservé et envoi déjà engagé non présenté comme atomiquement révocable.

**AC story 3.4-3**

**Given** le participant voit le résultat et Tema consulte le Sheet,
**When** les états de réservation et email diffèrent,
**Then** confirmation de place reste prioritaire ; échec/incertitude email est explicite avec contact et procédure Gmail, sans bouton de relance applicatif.

## Epic 4: Tema gère les inscrits et les changements en conservant l’historique

Tema annule, ajuste les capacités ou reprogramme et fait ses suivis manuels, avec export et nettoyage documentés.

### Story 4.1: Annuler et réinscrire sans effacer l’historique

**Linear :** [TEM-22](https://linear.app/tema-academie/issue/TEM-22/41-annuler-et-reinscrire-sans-effacer-lhistorique) — Backlog, préparation à valider.

En tant que gestionnaire Tema,
je veux annuler une inscription depuis le tableau,
afin de libérer la place en conservant une trace compréhensible.

**FR :** FR21, FR23

**NFR :** NFR2, NFR3, NFR7

**UX-DR :** UX-DR8, UX-DR17, UX-DR18

**AR- :** AR-1, AR-3

**AC- :** AC-02, AC-09, AC-13

**ET- :** ET-03, ET-09

**Dépendances antérieures :** 3.4

**Réutilisé :** Annulation manuelle et nouvelle ligne déjà prouvées ; calcul à partir des seules confirmées.

**Reste à réaliser :** Parcours gestion complet, validation statut et guide contextualisé.

**Vérification :** Annulation répétée, ancienne clé, nouvelle demande, fermeture avec dernier confirmé et deux capacités non8.

**Acceptance Criteria:**

**AC story 4.1-1**

**Given** une ligne confirmée existe,
**When** Tema la passe à annulée,
**Then** même ligne/ID conservés, une place libérée une seule fois, aucune notification automatique ; dernière annulation d’une date fermée la masque sans supprimer la formation active.

**AC story 4.1-2**

**Given** l’ancienne demande est rejouée puis un nouveau formulaire est soumis,
**When** la date est ouverte future avec place,
**Then** ancien reçu annulé sans réactivation/renvoi ; nouvelle ligne et nouvel ID seulement pour la nouvelle demande éligible.

**AC story 4.1-3**

**Given** la capacité est modifiée à la hausse ou sous les confirmés,
**When** les nouvelles admissions sont testées,
**Then** nouvelle capacité respectée, aucune inscription existante annulée ; écart privé explicite sans plafond8.

### Story 4.2: Reprogrammer une session avec suivi manuel des participants

**Linear :** [TEM-23](https://linear.app/tema-academie/issue/TEM-23/42-reprogrammer-une-session-avec-suivi-manuel-des-participants) — Backlog, préparation à valider.

En tant que gestionnaire Tema,
je veux modifier la même session et contacter les inscrits,
afin de conserver les places et communiquer les bonnes informations.

**FR :** FR16, FR17, FR22, FR23

**NFR :** NFR2, NFR3, NFR7

**UX-DR :** UX-DR13, UX-DR14, UX-DR16, UX-DR17, UX-DR18

**AR- :** AR-3, AR-9

**AC- :** AC-12, AC-13, AC-16

**ET- :** ET-05, ET-08, ET-09

**Dépendances antérieures :** 4.1

**Réutilisé :** Révision/instantanés, refus SESSION_CHANGED et garde d’envoi.

**Reste à réaliser :** Mode opératoire fermer/modifier/prévenir/rouvrir et preuves des frontières admission/envoi.

**Vérification :** Formulaire ouvert avant modification ; fermeture avant/après derniers contrôles, annulation/changement avant envoi ; historique.

**Acceptance Criteria:**

**AC story 4.2-1**

**Given** une session a des inscrits,
**When** Tema ferme puis modifie la même ligne, prévient manuellement et rouvre si possible,
**Then** ID/cohortes/inscrits/instantanés conservés sans réinscription ; aucun avis de changement ni lien visio différé automatique.

**AC story 4.2-2**

**Given** une nouvelle demande traverse une fermeture manuelle,
**When** elle est contrôlée avant ou après le point d’admission,
**Then** déjà admise peut terminer avec ses instantanés, suivante refusée ; pas de tolérance après début et limite du verrou face aux éditions humaines expliquée.

**AC story 4.2-3**

**Given** un formulaire reste ouvert ou un envoi n’est pas encore engagé,
**When** les conditions changent,
**Then** le formulaire doit reconfirmer les conditions et l’envoi périmé est bloqué ; traces d’un mail déjà parti inchangées, suivi actuel assuré dans Gmail.

### Story 4.3: Consulter, exporter et nettoyer les données selon la politique validée

**Linear :** [TEM-24](https://linear.app/tema-academie/issue/TEM-24/43-consulter-exporter-et-nettoyer-les-donnees-selon-la-politique) — Backlog, préparation à valider.

En tant que gestionnaire Tema,
je veux suivre mes inscrits et appliquer la conservation prévue,
afin de exploiter les données sans dépendance technique ni fuite.

**FR :** FR26, FR27

**NFR :** NFR3, NFR5, NFR9, NFR13

**UX-DR :** UX-DR17, UX-DR18, UX-DR19

**AR- :** AR-6, AR-12

**AC- :** AC-14, AC-19, AC-20

**ET- :** ET-09, ET-10

**Dépendances antérieures :** 4.2

**Réutilisé :** Tableaux privés, types et historique du prototype ; conservation12 mois retenue, contenu politique non validé.

**Reste à réaliser :** Guide export Excel, retrait de coordonnées et nettoyage manuel fictif ; brouillon politique/accord à soumettre à Tema.

**Vérification :** Export sans formules Google, accès privé refusé, suppression fictive cohérente et aucun envoi ultérieur.

**Acceptance Criteria:**

**AC story 4.3-1**

**Given** Tema consulte ou exporte des inscriptions de test,
**When** un export tabulaire est ouvert hors Google,
**Then** champs exploitables sans QUERY/ARRAYFORMULA/IMPORTRANGE, identités et places cohérentes, aucune publication de l’export privé.

**AC story 4.3-2**

**Given** la règle12 mois et le retrait de coordonnées sont appliqués à des données fictives,
**When** le gestionnaire suit le guide de nettoyage manuel,
**Then** copies/exports/avis et statut des places/reprises sont traités explicitement, envois futurs empêchés ; aucune purge automatique ou garantie juridique inventée.

**AC story 4.3-3**

**Given** le texte de confidentialité et l’accord sont rédigés,
**When** la solution est préparée pour l’ouverture,
**Then** version et emplacement sont prêts, validation Tema explicitement requise ; Emma exécute le nettoyage sans être désignée responsable légale par défaut.

## Epic 5: Tema reçoit une solution vérifiée, présentable et transmissible

La V1 reçoit sa finition, ses contrôles automatisés et sa recette réelle, puis est remise sur la cible acceptée avec guide et build portable.

### Story 5.1: Finaliser une interface Tema lisible et accessible

**Linear :** [TEM-25](https://linear.app/tema-academie/issue/TEM-25/51-finaliser-une-interface-tema-lisible-et-accessible) — Backlog, préparation à valider.

En tant que visiteur,
je veux utiliser une interface cohérente avec Tema sur mes appareils,
afin de comprendre et terminer mon parcours sans obstacle.

**FR :** FR3, FR7, FR24, FR25

**NFR :** NFR1, NFR5

**UX-DR :** UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR5, UX-DR6, UX-DR7, UX-DR8, UX-DR9, UX-DR10, UX-DR11, UX-DR12, UX-DR13, UX-DR14, UX-DR19, UX-DR20, UX-DR21, UX-DR22, UX-DR23, UX-DR24

**AR- :** AR-1

**AC- :** AC-03, AC-14, AC-17, AC-18

**ET- :** ET-10, ET-11

**Dépendances antérieures :** 4.3

**Réutilisé :** Dispositions approuvées et base rose/logo/Manrope/Inter, sans finition finale approuvée.

**Reste à réaliser :** Retouche ciblée des composants partagés, contrastes/focus, zoom, clavier, lecteur écran et petites largeurs.

**Vérification :** Tous écrans/états avec200%zoom, largeurs étroites, clavier/lecteur écran ; vérification visuelle par Computer Use.

**Acceptance Criteria:**

**AC story 5.1-1**

**Given** les parcours fonctionnels sont complets,
**When** la finition graphique est ajustée,
**Then** logo original/rose/base typo conservés, priorité offre et dates avant programme maintenue ; rendu final présenté à Sofiane/Tema sans déclarer les anciens mocks définitivement approuvés.

**AC story 5.1-2**

**Given** le site est parcouru au clavier, lecteur d’écran et zoom200%,
**When** les états et contrôles sont utilisés,
**Then** labels/erreurs/focus/annonces sont associés, aucune information portée seulement par couleur, pas de défilement horizontal global ni action indispensable au survol.

**AC story 5.1-3**

**Given** la largeur ou la préférence de mouvement change,
**When** catalogue/calendriers/formulaire se rendent,
**Then** grille/liste gardent les mêmes dates et récapitulatif mobile proche sélection ; transitions éventuelles respectent réduction des animations.

### Story 5.2: Rejouer les contrôles avant chaque mise à jour

**Linear :** [TEM-26](https://linear.app/tema-academie/issue/TEM-26/52-rejouer-les-controles-avant-chaque-mise-a-jour) — Backlog, préparation à valider.

En tant que mainteneur,
je veux relancer une batterie de non-régression locale et CI,
afin de détecter les régressions avant intégration ou livraison.

**FR :** FR29

**NFR :** NFR2, NFR3, NFR5, NFR9, NFR10, NFR12

**UX-DR :** UX-DR13, UX-DR17, UX-DR18

**AR- :** AR-1, AR-8, AR-9, AR-11

**AC- :** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16, AC-17, AC-18, AC-19, AC-20, AC-21

**ET- :** ET-01, ET-02, ET-03, ET-04, ET-05, ET-06, ET-07, ET-08, ET-09, ET-10, ET-11, ET-12

**Dépendances antérieures :** 5.1

**Réutilisé :** Commande npm run verify,61 Node/28Playwright et lockfile déjà versionnés.

**Reste à réaliser :** Étendre tests par story et contrôler CI sur push/PR ; matrice de couverture, rapports et relance transmis.

**Vérification :** Pipeline sans Google réel/secret/PII ; échec délibéré local pour vérifier blocage ; build portable et fingerprint.

**Acceptance Criteria:**

**AC story 5.2-1**

**Given** un changement applicatif est préparé,
**When** la commande locale puis le pipeline autorisé sont lancés,
**Then** logique/contrats/build/E2E pertinents se rejouent avec fixtures déterministes ; un échec bloque intégration/promotion et contrôle indisponible reste non vérifié.

**AC story 5.2-2**

**Given** le rapport de couverture est lu,
**When** les tests sont reliés aux21AC et12ET,
**Then** chaque invariant a une assertion et les compléments humains/réels sont identifiés ;89tests hérités ne valent pas couverture complète V1.

**AC story 5.2-3**

**Given** la CI s’exécute,
**When** les sorties et permissions sont inspectées,
**Then** aucun envoi ni écriture Google réel, secret ou donnée utilisateur ; aucun déploiement automatique activé par cette seule story et les résultats portent la révision.

### Story 5.3: Recetter la solution complète et ses invitations de bout en bout

**Linear :** [TEM-27](https://linear.app/tema-academie/issue/TEM-27/53-recetter-la-solution-complete-et-ses-invitations-de-bout-en-bout) — Backlog, préparation à valider.

En tant que référent de recette,
je veux vérifier les parcours réels et les agendas sur le candidat complet,
afin de accepter la solution sur des preuves observables.

**FR :** FR18, FR19, FR20, FR28, FR29

**NFR :** NFR1, NFR4, NFR6, NFR8, NFR9

**UX-DR :** UX-DR9, UX-DR13, UX-DR14, UX-DR15, UX-DR16, UX-DR17, UX-DR18, UX-DR22

**AR- :** AR-5, AR-6, AR-11, AR-12

**AC- :** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16, AC-17, AC-18, AC-19, AC-20, AC-21

**ET- :** ET-01, ET-02, ET-03, ET-04, ET-05, ET-06, ET-07, ET-08, ET-09, ET-10, ET-11, ET-12

**Dépendances antérieures :** 5.2

**Réutilisé :** Bilan4ET PASS/8incomplets et cas déjà observés, sans supprimer leurs limites.

**Reste à réaliser :** Recette du candidat complet, autres navigateurs/appareil et réceptions manquantes ; Outlook/Apple par Sofiane.

**Vérification :** Parcours anonyme→date→inscription→Sheet→réceptions→agendas, opérations gestion et erreurs isolées ; matrice exacte candidate.

**Acceptance Criteria:**

**AC story 5.3-1**

**Given** le candidat complet et ses ressources de test sont identifiés,
**When** les scénarios convenus sont rejoués en vrai,
**Then** lecture sans compte en contexte privé, transport/réponse fiable, Sheet et réceptions vérifiés sur supports Chrome/Firefox/Safari et téléphone prévu ; limites des supports indisponibles conservées.

**AC story 5.3-2**

**Given** Sofiane réalise sa recette des invitations,
**When** les ICS hiver/été sont ouverts dans Outlook et Calendrier Apple,
**Then** heures/durée/lieu/accents/UID corrects observés ; contrôle Google déjà acquis revalidé si candidat affecté ; aucun PASS par inspection seule du fichier.

**AC story 5.3-3**

**Given** les compléments TEM-6 sont examinés,
**When** chaque observation est classée,
**Then** ET01/03/05/06/07/08/09/11 reçoivent preuve ou limite explicite, sans réécrire un résultat historique ; aucune injection métier, plafond d’envoi réévalué avant dépassement et aucune ouverture avec défaut critique connu.

### Story 5.4: Remettre le candidat, le guide et les éléments de publication

**Linear :** [TEM-28](https://linear.app/tema-academie/issue/TEM-28/54-remettre-le-candidat-le-guide-et-les-elements-de-publication) — Backlog, préparation à valider.

En tant que responsable Tema,
je veux recevoir une solution exploitable et portable,
afin de gérer les formations après la remise sans dépendre de bkbx pour chaque changement.

**FR :** FR28, FR30

**NFR :** NFR5, NFR9, NFR10, NFR13, NFR14

**UX-DR :** UX-DR18, UX-DR19

**AR- :** AR-6, AR-9, AR-12, AR-13

**AC- :** AC-19, AC-20, AC-21

**ET- :** ET-12

**Dépendances antérieures :** 5.3

**Réutilisé :** Ressources Google pérennes préparées, retour compatible TEST déjà éprouvé et build statique.

**Reste à réaliser :** Guide final, note compatible versions/HEAD, démonstration Vercel acceptée et paquet portable ; ronde d’ajustements et séance30min.

**Vérification :** Accès/récupération, URLs/builds seuls publics, versions identifiées et contrôle après publication autorisée.

**Acceptance Criteria:**

**AC story 5.4-1**

**Given** la recette est conclue et les prérequis client réunis,
**When** un GO de publication précis est donné,
**Then** cible/versions/ordre site-script-HEAD sont identifiés, prérequis compte/forfait et droits vérifiés ; contrôle postpublication et courte récupération compatible conservent les inscriptions.

**AC story 5.4-2**

**Given** Tema suit le guide pendant la remise,
**When** une formation/date et une annulation sont gérées,
**Then** tâches autonomes accomplies, suivi manuel Gmail/lien manquant et nettoyage documentés ; une ronde d’ajustements et séance30min réalisées et acceptées.

**AC story 5.4-3**

**Given** la démo/recette est sur Vercel puis Sofiane prévoit son serveur,
**When** les fichiers et accès sont transmis,
**Then** Google métier reste pérenne, build statique portable et contrôles de bascule fournis ; FTP et intégration David non réalisés par cette story ; mise en service publique et démo restent des jalons distincts.
