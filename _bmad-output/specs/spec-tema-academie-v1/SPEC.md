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
updated: 2026-10-28
non_regression_requirement: owner-required
non_regression_required_on: 2026-10-25
companions:
  - ../../../docs/project/architecture/controle-technique-v1.md
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

Contrat dérivé du journal canonique au **28 octobre 2026** : spécification fonctionnelle approuvée le24octobre, parcours/dispositions UX le25, architecture d’ensemble et plan d’essai le26. Les décisions de cadence et de tarif du28octobre sont intégrées ; la finition graphique reste à valider. Le GO actuel couvre la clôture documentaire d’architecture avant UX/UI, pas le développement principal.

TEM-6 a produit un prototype isolé et un [bilan](../../../docs/project/technical-trial/TEM-6-results.md) historique **4PASS/8NON VÉRIFIÉ**. La suite locale existe (61Node/28Playwright, Google simulé), la CI produit reste à câbler. Branche et PR de préparation sont publiées ; aucune fusion ou livraison V1 déduite. Les [contrôles et étapes](../../../docs/project/architecture/controle-technique-v1.md) distinguent décisions documentées, implémentation, preuve réelle et autorisations.

## Why

Tema Solutions doit présenter ses formations et prochaines sessions, recevoir les inscriptions et gérer les places depuis un tableau privé, sans intervention de bkbx à chaque modification. Le site doit rester portable pour une bascule ultérieure vers le serveur Tema, distincte de la refonte de David.

## Capabilities

- **CAP-1 — Comprendre les formations**
  - **intent:** Le visiteur consulte les formations par logiciel et comprend prérequis, contenu, résultats, durée et tarif.
  - **success:** Les24formations source sont conservées sans perte utile ; Divalto/Dimo/MoovApps restent distincts. Formation active sans date visible, inactive masquée ; tarif absent affiché « Tarif à confirmer », sans inscription.
- **CAP-2 — Choisir une session**
  - **intent:** Le visiteur trouve et consulte une session future dans le catalogue, la fiche et les calendriers.
  - **success:** Mêmes dates/places dans grille et liste ; date choisie conservée jusqu’au formulaire. Complet, Inscriptions terminées, Dates à venir et Tarif à confirmer restent distincts ; aucune inscription au démarrage, sans place ou sans tarif renseigné.
- **CAP-3 — Administrer sans développeur**
  - **intent:** Tema maintient formations, sessions et paramètres et commande leur activité ou l’ouverture des inscriptions.
  - **success:** Modification valide publiée en moins de deux minutes en fonctionnement normal ; contrôle de secours nominal toutes les cinq minutes pour traitement manqué. Codes stables, diagnostics/protections et import reprenable limitent les erreurs sans interrompre les offres valides.
- **CAP-4 — Réserver une place**
  - **intent:** Une personne réserve une place aux conditions présentées, avec ses coordonnées et son accord.
  - **success:** Admission autoritaire, pas de doublon actif ni surréservation ; conditions modifiées à reconfirmer. Reprise de la même demande sans nouvelle ligne/place/email et statut annulé jamais réactivé.
- **CAP-5 — Recevoir confirmation et agenda**
  - **intent:** Le participant reçoit les informations pratiques et une invitation ; Tema reçoit un avis.
  - **success:** Courriels/ICS fidèles aux conditions acceptées ; réception et heures vérifiées dans les agendas requis avant mise en service, Outlook/Apple pendant la recette complète de Sofiane. Une panne d’envoi conserve la place et laisse un suivi privé, avec avis de problème si possible puis suivi manuel Gmail.
- **CAP-6 — Gérer les changements manuellement**
  - **intent:** Tema annule une inscription ou reprogramme une session puis contacte les participants.
  - **success:** Annulation libérant exactement une place, historique conservé ; réinscription par nouvelle ligne/ID. Reprogrammation sur la même ligne sans réinscription ou notification automatique.
- **CAP-7 — Protéger les données et traiter les erreurs**
  - **intent:** Visiteur et équipe connaissent l’état réel des demandes sans exposer les données privées.
  - **success:** Projection/reçu minimaux, textes inertes jusque dans l’export, accord/version conservés, résultat inconnu repris honnêtement. Protection des rafales éprouvée sans prétendre masquer toute existence de doublon.
- **CAP-8 — Exploiter et recevoir la solution**
  - **intent:** Tema reçoit un site utilisable et sait gérer son offre et ses inscrits après remise.
  - **success:** Catalogue importé, candidat publié sur cible autorisée puis recette réelle acceptée, guide/export/tests transmis, une ronde d’ajustements et séance30minutes terminées. Retour de code compatible sans restaurer les inscriptions ; bascule du site vers serveur Tema sous responsabilité Sofiane.

## Constraints

- Français, ordinateur/mobile, clavier/labels/focus/messages et contrastes vérifiés. Dispositions fonctionnelles et base logo/rose/Manrope–Inter retenues ; finition visuelle à revoir par le writer UX avant son acceptation, sans charte David présumée.
- Un dépôt : socle racine, `app/web`, `app/apps-script`, `app/tests` existants. Site statique portable, moteur Apps Script géré et Sheet privé, sans serveur Vercel ni base externe abonnée. Réutiliser TEM-6, pas de second moteur ou starter parallèle ; versions réelles et outillage dans la spine propriétaire et le code.
- Une personne/place par formulaire, cohorte sur une date. Capacité totale configurable par date sans plafond huit ; seules les inscriptions confirmées consomment des places. Capacité source de formation indicative, sans propagation aux dates existantes ; prérequis informatifs.
- Prénom/nom/entreprise/courriel obligatoires, téléphone facultatif ; entreprise libre vérifiée manuellement par Tema après confirmation automatique, sans référentiel clients ni état d’attente.
- Formation inactive masquée avec ses dates, données/historique conservés. Nouvelle formation inactive et nouvelle date fermée par défaut ; activité et commande d’ouverture par date sont indépendantes. Fermeture au démarrage Toronto ; aucune case ouverte ne contourne date, capacité ou tarif absent.
- Date future fermée manuellement visible avec « Inscriptions terminées » si elle a un confirmé ; sans confirmé, masquée des deux calendriers. Formation active sans date visible conservée avec « Dates à venir ». Une date ouverte sans tarif reste consultable mais non réservable ; elle ne devient pas une date fermée manuellement.
- Tarif renseigné : « À partir de [montant] $ CAD par participant, taxes en sus », montants source à faire valider par Tema avant ouverture. Tarif absent/null : « Tarif à confirmer », inscriptions désactivées ; aucune absence convertie en zéro et aucun nouveau champ d’approbation gestionnaire. Une valeur zéro explicitement renseignée ne signifie pas absence. Contrat technique dans contrat-donnees.md.
- Fermer une date, modifier la même ligne, prévenir manuellement dans Gmail, rouvrir si future et réservable ; ID/inscrits/instantanés conservés. Demande déjà admise avant fermeture manuelle autorisée à finir, suivante refusée ; le verrou des scripts ne bloque pas une édition humaine ni ne révoque un envoi MailApp engagé.
- Ancienne inscription annulée et son ID conservés ; nouvelle demande sous conditions courantes pour se réinscrire. Une reprise retrouve d’abord le reçu courant malgré fermeture, changement de politique ou de tarif, sans renvoi.
- Présentiel : adresse publique avant inscription. En ligne : lien privé dans confirmation s’il existe, sinon annonce d’un envoi dans les jours précédant la formation et transmission ultérieure manuelle Tema ; aucune URL inventée ou automatisation différée.
- Réservation distincte des envois : une tentative initiale participant puis avis Tema, pas de relance applicative. Panne/rupture/quota peuvent aussi bloquer l’avis ; conserver trace privée et incertitude honnête, suivi manuel dans Gmail. SENT signifie acceptation du service, pas réception.
- Compte Google `temaacademie@gmail.com`, contact public et avis internes configurés séparément même si valeurs communes ; gestion par la personne à qui Tema confie ce compte, sans rôles applicatifs. Récupération/droits finaux à vérifier. Google gratuit accepté : quotas partagés, environ50inscriptions à deux messages au maximum théorique avant autres usages, aucun quota métier fixe50 ni service payant tacite. Dépassement email ne retire pas une place enregistrée.
- Quatre onglets tabulaires, colonnes reconnues par nom ; logiciels en liste administrable, formateurs texte libre privé. Identifiants automatiques puis immuables ; import repris sans doublon/écrasement silencieux. Export Excel sans formules Google et textes libres inertes à l’ouverture.
- Cadence normale<2min avec traitement par événement/import explicite, secours nominal5min sans mail. Exception acceptée pour traitement manqué et panne fournisseur, pas de délai maximal garanti en incident. Admission relit les données courantes sous verrou, indépendamment du compteur affiché ou du secours. Mesure de la cadence V1 encore à produire ; TEST demeure au repos12h selon le dernier constat.
- Politique dédiée et accord/version à faire valider par Tema avant ouverture ; conservation12mois avec nettoyage manuel Emma, point de départ/modalités/copies et exceptions dans cette politique. Aucun rôle légal déduit pour Emma, aucune purge automatique.
- Non-régression locale avant push, CI sur push/PR à câbler au premier jalon applicatif autorisé, assertions critiques et recette réelle distincte. Tests fictifs isolés, destinations serveur fixes et plafonds d’envoi contrôlés ; requis indisponible reste NON VÉRIFIÉ et garde ouverte l’acceptation concernée sauf dérogation humaine précise.
- Vercel pour démonstration/recette puis bascule du site sur serveur Tema par Sofiane, Google métier pérenne. Offre Vercel compatible avec l’usage client et cible précise à régler avant le déploiement concerné ; aucun achat. Publier un candidat autorisé avant sa recette distante ; promotion après acceptation et ouverture publique sont distinctes.
- Budget source fourni3 600$hors taxes, non modifié par cette consolidation ; budget et estimation humaine sont traités séparément du contrat technique, le plan de reste proposé n’est pas accepté par la rédaction. Travail autonome, interventions humaines et attentes externes restent distincts.
- Clôture documentaire d’architecture → revue UX/UI → validation globale du plan → GO principal identifié. Commits par jalon autorisés, branche de préparation publiée avec PR en brouillon ; ni ces traces ni le présent dossier ne valent autorisation de développement, fusion, déploiement ou ouverture.

## Non-goals

- Paiement/facturation automatisée, comptes participants ou gestionnaires web, groupes, anglais, contrôle d’historique/prérequis.
- Inscription aux neuf présentations/webinaires, annulation autonome, notification automatique de replanification, envoi différé automatique d’un lien visio.
- Relance email applicative, menu de vérification/renvoi, canal externe d’alerte, purge automatique, anti-DDoS garanti.
- Synchronisation Excel/Google, intégration finale David, prise en charge du FTP Sofiane ou achat d’hébergement dans cette préparation.

## Success signal

Tema prépare et ouvre une session valide avec tarif ; l’offre apparaît en moins de deux minutes en fonctionnement normal. Un participant réserve sans compte Google et retrouve une seule inscription et les bonnes informations. Après panne/reprise/annulation, places et historique restent cohérents ; la recette réelle et la batterie rejouable permettent une remise acceptée. Une formation sans tarif reste consultable sans inscription.

## Open Questions

- **Q-1 — Avant déploiement concerné :** récupérer/contrôler les accès finaux, offre Vercel compatible et ressources/candidat précis ; Métier reste au squelette selon le dernier constat, sans déploiement métier.
- **Q-2 — Preuves d’implémentation :** compléter les ET incomplets et mesurer la nouvelle cadence/charge avant acceptation/ouverture à des utilisateurs réels hors essai contrôlé. Les choix sont documentés ; aucune nouvelle preuve réelle ni waiver global ne vient de cette clôture. Outlook/Apple restent à Sofiane lors de la recette complète.
- **Q-3 — Avant ouverture :** Tema valide politique/accord/conservation, prix finaux, formations actives, informations pratiques et identité ; Sofiane confirme cible et bascule du site. Ces valeurs finales n’empêchent pas la revue UX documentaire.
- **Q-4 — Décision de suite :** finition UX/UI puis plan/estimation restante à valider globalement ; GO principal/livraison distincts. TEM-6 et les autres tickets gardent leurs critères de clôture ; aucun Done déduit du présent contrat.
