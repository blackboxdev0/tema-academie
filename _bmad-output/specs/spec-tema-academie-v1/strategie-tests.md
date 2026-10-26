# Stratégie de tests et non-régression — Tema Académie V1

Exigence demandée par Sofiane le 25 octobre 2026 : disposer d’une batterie reproductible avant les push applicatifs et les mises à jour futures. Socle du prototype TEM-6 implémenté :61 tests Node et28 E2E Chromium verts par npm run verify ; Google réel et limites dans le bilan. Aucun pipeline GitHub exécuté ni réalisation V1 déduite. Les huit capacités fonctionnelles restent inchangées. [AC-21](regles-et-acceptation.md) porte cette exigence transversale.

## Organisation recommandée

| Niveau | Ce qui sera vérifié | Moyen recommandé | Exemples |
|---|---|---|---|
| Logique locale | Règles métier, formats, projections et états | JavaScript pur et test runner natif Node ; horloge et données contrôlées | Places, fermeture au démarrage, fermeture manuelle avant/après admission, annulation, génération/stabilité des codes, révision des conditions, empreinte de demande, horaires été/hiver |
| Contrats et intégration | Cohérence site/service, écritures, verrou et reprise | Contrats locaux avec adaptateurs contrôlés ; appels au véritable déploiement Apps Script de test pour les garanties Google | Dernière place à deux demandes, rejeu sans doublon/renvoi, annulation, absence de données privées dans le catalogue |
| Parcours navigateur rejouables | Enchaînement des écrans et erreurs visibles | Quelques tests Playwright versionnés, Chromium pour le socle CI ; format mobile inclus | Catalogue → date → formulaire → confirmation ; complet ; reprise après réponse perdue ; conditions modifiées |
| Recette réelle | Usage dans le vrai navigateur, administration, réception et agendas | Computer Use et étapes de recette documentées sur Vercel, Sheet et boîtes contrôlées | Ajouter/activer une formation, ouvrir/fermer une date, consulter la confirmation reçue, importer l’invitation dans les agendas prévus |

Les règles métier partagées sont séparées des adaptateurs Sheets, MailApp et HTTP pour être testables localement. Le code testé doit être celui utilisé par le service, sans seconde implémentation métier dédiée aux tests. Apps Script V8 reste un environnement Google distinct de Node : les tests locaux ne prouvent pas les droits, les verrous et les écritures du véritable service.

Node fournit son propre test runner ; Playwright fournit les parcours navigateur et peut aussi tester les contrats HTTP. Prototype : Node 22.9.0/npm 11.7.0 constatés, Playwright 1.64.1 épinglé et lockfile présent ; commande npm run verify et prérequis dans app/README.md. Un seul socle de tests produit est prévu dans `app/tests`, avec les points d’entrée nécessaires côté application ; aucune plateforme de test ou base externe abonnée ajoutée.

## Couverture attendue

| Domaine critique | Critères reliés | Couverture minimale |
|---|---|---|
| Import, colonnes, identifiants, saisie administrable | AC-01, AC-04, AC-05 | Cas nominal et données absentes/dupliquées ; code unique et stable ; défauts inactive/fermée |
| Catalogue et disponibilités | AC-02, AC-03, AC-13, AC-16 | Tous les états de visibilité et capacité, indépendance des dates, fuseau, affichage des informations pratiques |
| Inscription et intégrité | AC-06 à AC-09, AC-17 | Réservation unique, dernière place concurrente, doublon, consentement, conditions modifiées, reprise et rejeu après annulation |
| Courriels et invitation | AC-10 à AC-12 | Contenu/ICS et états testés automatiquement ; réception et import réellement observés, échec participant et alerte elle-même indisponible |
| Confidentialité et entrées | AC-14, AC-15, AC-18 | Liste blanche publique, lien visio privé, textes inertes, labels/focus/erreurs ; complément clavier et appareils réels |
| Exploitation et remise | AC-19 à AC-21 | Scénarios de gestion documentés, batterie rejouable, résultat associé au candidat, récupération ; politique et remise gardent leur validation humaine |

Chaque invariant critique possède une assertion automatisée et un lien vers son critère. La matrice distingue les compléments humains ou externes ; aucun pourcentage arbitraire de lignes n’est imposé. Les cinq parcours navigateur initiaux, enrichis à quatorze scénarios pour chaque profil après revue/correctifs, sont inscription réussie, date devenue complète, reprise d’une réponse perdue, conditions modifiées et visibilité après fermeture/inactivation.

## Rejouer avant de pousser et de livrer

1. **Avant chaque push applicatif :** une commande locale unique exécute la logique, les contrats locaux, le build et les parcours navigateur déterministes pertinents. Commande du prototype `cd app && npm run verify`, déjà exécutée ; à conserver et enrichir pour la V1. Un échec empêche le push ; une vérification requise non exécutée est signalée.
2. **Sur GitHub :** les mêmes contrôles sont rejoués sur push et pull request, avec un rapport associé à la révision. GitHub Actions intervient après le push et complète donc le contrôle local. Un résultat en échec bloque l’intégration ou la promotion de la version selon le processus convenu.
3. **Avant une livraison affectant Google ou le parcours réel :** rejouer les intégrations réelles pertinentes et la recette Computer Use sur le candidat Vercel. Contrôler l’état du Sheet, la réception et l’invitation, puis demander le GO de livraison applicable. Une prévisualisation Vercel peut exister avant cette recette, sans être déclarée acceptée.

Le premier essai technique construit une preuve limitée du transport et des invariants ; la batterie s’enrichit ensuite avec chaque fonctionnalité et chaque correction. Un défaut corrigé reçoit un cas de non-régression lorsqu’il concerne une règle ou un parcours durable. Commande/prérequis dans [app/README.md](../../../app/README.md). La suite rapide recrée seulement ses fixtures locales ; le service Google n’expose aucun reset et ne supprime pas ses inscriptions pour rejouer les contrôles.

## Données, coûts et preuves

- Le compte Google et le classeur métier de Tema sont pérennes. Les essais répétitifs, concurrence et pannes utilisent un Sheet/projet de test distinct et des données fictives ; la destination est fixée côté service. Aucun paramètre visiteur ne choisit le classeur ou un mode de réinitialisation.
- Les jeux de données et horloges sont contrôlés, les versions verrouillées et les attentes explicites. Un retour de code conserve les inscriptions fictives créées après la version précédente ; leur éventuel nettoyage est une opération distincte, jamais une restauration implicite de données. Le reset est limité aux ressources d’essai ; aucune donnée d’exploitation n’est supprimée ou réécrite pour lancer la batterie.
- Les envois sont simulés dans la suite rapide. Quelques envois réels bornés partent de `temaacademie@gmail.com` vers les trois boîtes contrôlées de Sofiane et l’avis interne prévu ; adresses reçues dans la configuration locale privée hors dépôt, quotas disponibles à constater. Les quotas restent partagés si les projets utilisent le même compte.
- Les tests API côté serveur prouvent leur contrat HTTP ; le navigateur réel vérifie séparément les redirections, droits et réponses exploitables. Un appel opaque ne vaut pas confirmation.
- Une simulation de mail ne prouve pas MailApp ou la réception. Trois Gmail ne prouvent pas trois logiciels d’agenda. Deux imports Google hiver/été ont été observés ; Outlook/Apple restent à vérifier. WebKit automatisé ne vaut pas Safari réel.
- Computer Use sert à jouer et observer les parcours. La suite déterministe versionnée est exécutée par le runner de tests ; une intervention Computer Use n’est pas annoncée comme un workflow GitHub autonome.
- Résultat par contrôle : `PASS`, `FAIL` ou `NON VÉRIFIÉ`, avec candidat, environnement, type de preuve et limite. Un test en échec ou indisponible ne devient pas vert après répétitions aveugles. Rapports synthétiques sans secret ou donnée réelle ; captures et pièces d’essai hors du code livré.

## État et points à préciser

TEM-6 :61 tests Node et28 E2E réussis, build statique et même moteur Google, cinq inscriptions fictives et contrôles réels documentés dans le [bilan](../../../docs/project/technical-trial/TEM-6-results.md). Restent les jobs CI, supports manquants et cas incomplets ; cadence de réparation à arbitrer devant le quota des déclencheurs. TEST fermé et périodique12 h au repos après mesures, aucune cadence V1 choisie. L’effet sur l’estimation doit être évalué avant engagement ; aucun prix ou délai supplémentaire n’est déduit de cette exigence.

Le [plan d’essai technique](plan-essai-technique.md) conserve ses douze scénarios et ses autorisations. Cette stratégie ne donne aucun GO de développement, de commit, de push ou de publication.

Sources officielles consultées le 25 octobre 2026 : [test runner Node](https://nodejs.org/api/test.html), [Playwright dans GitHub Actions](https://playwright.dev/docs/ci-intro), [environnement Apps Script V8](https://developers.google.com/apps-script/guides/v8-runtime), [quotas Google](https://developers.google.com/apps-script/guides/services/quotas).
