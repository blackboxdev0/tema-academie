---
id: SPEC-tema-academie-v1
title: "Tema Académie — Spécification V1"
status: approved
approval: owner-approved-functional-v1
approved_on: 2026-10-24
approval_scope: functional-v1
scope_approval: approved
scope_approved_on: 2026-10-21
created: 2026-10-20
updated: 2026-10-26
non_regression_requirement: owner-required
non_regression_required_on: 2026-10-25
companions:
  - contrat-donnees.md
  - regles-et-acceptation.md
  - plan-essai-technique.md
  - strategie-tests.md
  - ressources-services.md
  - ../../planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-tema-academie-2026-10-20/ARCHITECTURE-SPINE.md
  - ../../../docs/project/project-context.md
sources:
  - ../../planning-artifacts/briefs/brief-tema-academie-2026-10-19/brief.md
  - ../../planning-artifacts/briefs/brief-tema-academie-2026-10-19/addendum.md
  - ../../../docs/project/sources/brief-initial-2026-10-19.md
---

# Tema Académie — Spécification V1

Sofiane a approuvé la spécification fonctionnelle le 24octobre2026, les parcours et dispositions UX le 25, puis l’architecture d’ensemble et le plan d’essai le 26. Finition graphique reportée. Le GO explicite limité TEM-6 a permis un prototype TEST et des contrôles Google/Vercel réels ; le développement principal reste sans GO. Le [bilan](../../../docs/project/technical-trial/TEM-6-results.md) distingue les preuves, les huit scénarios incomplets et la cadence de réparation à arbitrer. Aucun commit ou livraison autorisé.

Les cinq champs du noyau et les compagnons forment le contrat V1. Les contraintes métier restent approuvées ; les détails techniques candidats ne sont pas acceptés par le seul succès du prototype. Les ressources et la batterie de tests sont décrites dans leurs compagnons propres.

## Why

Tema Solutions doit publier son catalogue et ses prochaines sessions, recevoir les inscriptions de ses clients et gérer les places sans intervention de bkbx à chaque modification. La V1 doit être administrable par une personne non technique à partir d'un tableau, puis s'intégrer ultérieurement au site vitrine refait par David Leblanc.

## Capabilities

- **CAP-1 — Comprendre les formations**
  - **intent:** Le visiteur consulte les formations et leurs prérequis, contenus, résultats, durées et tarifs indicatifs par logiciel.
  - **success:** Les 24 formations fournies sont importées sans perte utile ; Divalto, Dimo et MoovApps sont distingués ; une formation active sans date reste visible, une inactive est masquée.
- **CAP-2 — Choisir une session**
  - **intent:** Le visiteur trouve une session future en liste et calendrier mensuel.
  - **success:** Les vues présentent les mêmes sessions visibles, horaires et places ; « Dates à venir », « Complet » et « Inscriptions terminées » distinguent les disponibilités ; les dates fermées sans inscrit confirmé sont masquées, les dates passées retirées et aucune inscription n’est possible au démarrage.
- **CAP-3 — Administrer sans développeur**
  - **intent:** Tema maintient formations, sessions et paramètres depuis son tableau, et commande l’ouverture ou la fermeture des inscriptions.
  - **success:** Une session valide ajoutée apparaît en moins de deux minutes ; codes lisibles attribués automatiquement et protections limitent les erreurs ; une ligne invalide n'interrompt pas les autres offres ; les changements sensibles suivent une procédure compréhensible.
- **CAP-4 — Réserver une place**
  - **intent:** Un participant s'inscrit à la session et aux conditions qu'il a choisies, avec ses coordonnées et son consentement.
  - **success:** Une demande valide réserve une place, refuse un doublon actif et ne surréserve pas la dernière place ; conditions modifiées à reconfirmer ; reprise sans deuxième inscription et statut actuel présenté même après annulation.
- **CAP-5 — Recevoir confirmation et agenda**
  - **intent:** Le participant reçoit les informations pratiques et une invitation agenda ; Tema reçoit un avis.
  - **success:** Courriels et `.ics` reprennent la session réservée ; Google, Outlook et Apple sont vérifiés ; un échec d’envoi conserve la place ; l’avis Tema signale le problème si son envoi reste possible, puis Tema fait le suivi manuellement dans Gmail.
- **CAP-6 — Gérer les changements manuellement**
  - **intent:** Tema annule une inscription ou reprogramme une session et contacte les participants.
  - **success:** Une annulation libère exactement une place ; historique compréhensible ; aucune replanification n'envoie implicitement une nouvelle notification.
- **CAP-7 — Protéger les données et traiter les erreurs**
  - **intent:** Visiteur et équipe connaissent l'état réel des demandes, avec données privées et entrées non exécutables.
  - **success:** Le public ne voit aucun inscrit ni lien privé ; consentement/référence de politique conservés ; une réponse perdue reste explicitement inconnue puis se reprend sans place supplémentaire.
- **CAP-8 — Exploiter et recevoir la solution**
  - **intent:** Tema reçoit un site utilisable et sait publier, consulter les inscrits et reprendre les opérations après remise.
  - **success:** Site publié sur destination acceptée, import, guide, recette réelle, une ronde d'ajustements et séance de 30 minutes terminés ; accès/récupération documentés ; données tabulaires exportables vers Excel ; batterie de non-régression et mode de relance transmis.

## Constraints

- Français, mobile et ordinateur ; formulaires accessibles au clavier, messages explicites et contrastes vérifiables. Parcours et dispositions approuvés ; repères d’identité V2 retenus, finition graphique à reprendre selon DESIGN.md. Validation Tema de l’identité avant publication distincte de ces choix.
- Compte Google choisi : `temaacademie@gmail.com`, également validé le 23 octobre comme contact des participants et destinataire des avis de nouvelles inscriptions Tema. Un éventuel transfert de messagerie pourra être configuré ultérieurement. Vercel accueille démonstration, tests et recette Tema ; compte Google et classeur métier sont pérennes. Sofiane garde la bascule ultérieure du site sur le serveur Tema, sans bloquer la démo. Accès UI vérifiés le 26 octobre ; espace Vercel Hobby retenu provisoirement, prototype TEST publié sans connexion Git. Compatibilité avec l’usage commercial à résoudre avant déploiement client ; aucun abonnement acheté.
- Un dépôt : socle racine, code dans `app/web`, `app/apps-script`, tests dans `app/tests`. Le prototype TEM-6 existe ; la V1 complète reste à réaliser après GO.
- Une personne/place par formulaire ; cohorte sur une date ; capacité totale configurable par Tema dans Google Sheets pour chaque date/session, sans plafond métier fixé à huit. Les places restantes sont calculées depuis les inscriptions confirmées ; prérequis informatifs.
- Champs validés le 21 octobre : prénom, nom, entreprise et courriel obligatoires ; téléphone facultatif. L’entreprise est saisie librement ; Tema la vérifie manuellement après confirmation automatique de l’inscription, sans approbation client préalable ni statut d’attente.
- Fermeture automatique au démarrage confirmée ; le gestionnaire peut aussi ouvrir/fermer les nouvelles inscriptions dans le tableau. Réglage indépendant pour chaque date/session ; ouvrir manuellement ne contourne ni le démarrage ni la capacité. Le statut actif/inactif de la formation commande sa présence dans l’offre publique, sans supprimer l’historique.
- Une date future fermée manuellement reste visible avec « Inscriptions terminées » si elle a des inscrits confirmés ; sans inscrit confirmé, elle est masquée des deux calendriers. Une formation active reste au catalogue, avec « Dates à venir » si aucune date future visible. Les annulations ne comptent pas pour cette visibilité.
- Modification de session validée le 24 octobre : fermer les nouvelles inscriptions, modifier la même ligne dans le Sheet, prévenir manuellement les inscrits concernés depuis Gmail, puis rouvrir si souhaité selon date et capacité. Identifiant, inscriptions et historique conservés ; les inscrits gardent leur place sans se réinscrire. Une demande ayant passé les derniers contrôles du moteur avant une fermeture manuelle peut finir son enregistrement avec ses instantanés ; les suivantes sont refusées. Le seul formulaire ouvert ne réserve rien. Admission et limites des éditions humaines restent à éprouver, sans tolérance horaire supplémentaire.
- Réinscription après annulation validée : nouveau formulaire et nouvelle inscription sous les mêmes conditions d’ouverture, date et capacité ; l’ancienne ligne reste annulée et n’est jamais réactivée par une reprise.
- Présentiel : adresse visible avant inscription, avec date et horaires. En ligne : lien transmis dans la confirmation s’il est disponible ; sinon inscription autorisée avec annonce d’un envoi dans les jours précédant la formation, assuré manuellement par Tema. Le lien n’est pas public.
- Échec du courriel après inscription enregistrée : place maintenue, avis de problème tenté vers `temaacademie@gmail.com`, puis suivi manuel par Tema dans Gmail ; décision du 23 octobre. Traces privées dans le Sheet, sans commandes de relance. Le même service peut aussi échouer à envoyer l’alerte ; acceptation d’envoi distincte de réception.
- Affichage tarifaire validé le 23 octobre : « À partir de [montant] $ CAD par participant, taxes en sus ». Le qualificatif vient du classeur source ; montants finaux du catalogue à confirmer par Tema avant publication.
- Texte de confidentialité dédié aux inscriptions à préparer et faire valider par Tema avant ouverture réelle, choix confirmé le 23 octobre. Conservation retenue par Sofiane : 12 mois, nettoyage manuel par Emma ; départ après formation ou annulation et modalités à reprendre dans la politique à faire valider par Tema, avec respect des finalités et délais légaux. Texte d’accord à préciser.
- Gestion V1 via le compte Google `temaacademie@gmail.com` : Gmail et Sheet privé des inscriptions. Tema confie cet accès à la personne chargée de la gestion ; aucun compte gestionnaire ou système de rôles applicatifs ajouté au site. Accès effectifs et récupération à vérifier.
- Source tabulaire fidèle au catalogue client, colonnes par en-tête et calculs script. Logiciel en liste déroulante administrable, Formateurs en texte libre. Codes de formation lisibles, uniques, automatiques puis stables ; sélection code/titre pour ajouter des dates. Capacité source conservée comme défaut indicatif par formation, sans modifier les capacités des dates ; export Excel sans dépendance aux formules Google. Nouvelle formation inactive et nouvelle date fermée par défaut, activation/ouverture volontaire ; schéma détaillé dans contrat-donnees.md.
- Non-régression requise avant chaque push applicatif : commande locale rejouable, contrôles CI, couverture des invariants critiques et recette réelle complémentaire par Computer Use. Tests et fixtures versionnés, ressources Google fictives isolées, aucun test en échec ou indisponible présenté comme réussi ; stratégie et preuves dans strategie-tests.md.
- Pas de serveur applicatif à exploiter ni de base externe abonnée ; Apps Script est géré. Projection publique distincte des données privées.
- Essais cadrés le 24 octobre : participants/sessions fictifs, Sheet de test séparé et boîtes contrôlées. Sofiane prévoit l’accès au compte Google dédié au projet et trois comptes Gmail comme participants de test ; adresses reçues en configuration locale privée hors dépôt, connexion UI et création des ressources constatées. Autorisation d’exécution TEST confirmée, Google réel éprouvé sur le périmètre du bilan ; quota initial100 puis 92 observé. Réception présentielle attestée, imports Google hiver/été réussis ; autres réceptions, supports et cas incomplets restent non vérifiés. Cadence minute à revoir face au quota de déclencheurs, sans changer tacitement la cible de publication<2 min.
- Temps métier `America/Toronto`, sans offset UTC fixe. Preuves techniques/transport avant le développement principal ; séparation des ressources de test et réelles.
- Budget fourni 3 600 $ hors taxes, estimation proposée trois jours humains actifs ; frais tiers à concilier avec la contrainte sans abonnement. Aucun montant ou estimé accepté par la rédaction.
- Dossier, essai limité, développement principal et livraison gardent leurs validations ; aucun commit sans demande explicite.

## Non-goals

- Paiement, facturation automatisée, comptes participants, contrôle d'historique, inscriptions groupées, anglais.
- Commandes de vérification/relance email dans le Sheet, relances automatiques et canal externe d’alerte de secours ; suivi pris en charge par Tema dans Gmail.
- Inscription aux neuf présentations/webinaires, annulation autonome et notifications automatiques de replanification et envoi différé automatique du lien de visioconférence.
- Synchronisation Excel/Google, bascule FTP prise en charge par Sofiane, intégration finale au site David ou achat d’hébergement dans cette préparation.

## Success signal

Tema ajoute une session valide dans le tableau ; elle apparaît en moins de deux minutes. Un participant réserve sans compte Google, reçoit son invitation et Tema retrouve une seule inscription. Places, annulations et conditions choisies restent justes après concurrence et reprises ; la solution est exploitable sur la destination acceptée. La batterie de non-régression se relance selon un mode documenté et ses résultats conditionnent les push applicatifs et la livraison.

## Open Questions

- **Q-1 — Ressources et réception :** accès/exécution/OAuth TEST établis ; ressources Métier séparées et inchangées. Trois boîtes privées reçues ; réception présentielle attestée, variantes en ligne à confirmer. Offre Vercel compatible avec une livraison client et récupération du compte à conclure.
- **Q-2 — Avant développement principal :** transport A exploitable dans le navigateur intégré ; autres navigateurs/agendas et scénarios incomplets du bilan à compléter. Cadence de réparation à arbitrer : les mesures ne démontrent pas la marge sous le quota Google gratuit avec un passage/minute. Préserver publication<2 min ; toute variante UX/coût nécessite décision humaine et mise à jour par le writer architecture.
- **Q-3 — Avant publication :** texte de confidentialité dédié et accord/version à faire valider par Tema ; politique de conservation de 12 mois et nettoyage manuel par Emma, droits effectifs du compte Google, montants finaux du catalogue et identité officielle à fournir/valider ; conditions d’ouverture publique à confirmer avec Sofiane, responsable de la bascule finale depuis Vercel.
- **Q-4 — Décision de suite :** plan et architecture d’ensemble approuvés, essai limité exécuté avec bilan4 PASS/8 NON VÉRIFIÉ ; TEM-6 reste In Progress. Valider les résultats et arbitrages avant préparation finale des stories, estimation incluant les tests et GO principal. UX fonctionnelle approuvée avec finition graphique différée ; GO client/acompte non confirmés.
