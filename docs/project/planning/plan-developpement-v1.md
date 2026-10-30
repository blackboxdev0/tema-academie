# Préparation du développement V1

26 octobre 2026 — préparation déléguée par Sofiane, validation finale regroupée en attente. **Aucun GO de développement principal, de fusion ou de livraison.** Le plan est validé le 30 octobre ; le démarrage V1 reste différé pendant les confirmations préparatoires. Commits par jalon et push sur branche de travail autorisés le 30 octobre. [Découpage BMAD](../../../_bmad-output/planning-artifacts/epics.md).

## Résultats et ordre

| Bloc | Résultat vérifiable | Stories | Réutilisation de TEM-6 |
|---|---|---|---|
| 1 | Tema prépare et publie son offre dans Sheets | 1.1 Catalogue/import ; 1.2 Dates/capacités ; 1.3 Actualisation/secours | Schéma, codes/validations et moteur de projection ; import24 formations et cadence V1 à finir |
| 2 | Le visiteur trouve la formation et sa date | 2.1 Catalogue/filtre ; 2.2 Calendrier général ; 2.3 Fiche/calendrier de formation | Contrats publics, statuts et dispositions UX ; interface complète à construire |
| 3 | Le participant réserve et reçoit ses informations | 3.1 Formulaire/admission ; 3.2 Reprise/reconfirmation ; 3.3 Courriels/ICS ; 3.4 Incidents d’envoi | Cœur de réservation, transport A testé, emails/ICS et tests ; liaison au vrai parcours et cas incomplets à finir |
| 4 | Tema gère les changements avec historique | 4.1 Annulation ; 4.2 Reprogrammation ; 4.3 Export/nettoyage | Statuts/instantanés/capacité ; gestion et guide complets à terminer |
| 5 | Tema reçoit une solution vérifiée et transmissible | 5.1 Finition/accessibilité ; 5.2 Non-régression/CI ; 5.3 Recette complète ; 5.4 Remise/publication autorisée | Suite locale et retour de code compatibles ; CI, supports et recette V1 restent à réaliser |

Chaque story comprend ses tests et sa revue au fil du développement. Le socle local existe ; la CI est à câbler dès1.1 pour le premier push applicatif autorisé. La story5.2 achève la couverture V1 et son intégration, elle n’autorise pas à différer tous les tests jusqu’à la fin. Les cinq blocs sont des résultats métier, pas cinq implémentations séparées du même moteur.

## Décisions de préparation déléguées

- Reprendre le code et les contrats TEM-6, en séparant proprement la configuration Métier de la garde TEST fixe ; pas de réinitialisation d’un starter ou de deuxième moteur. La proposition Vite/clasp de la spine n’est pas un outil déjà installé : aucun ajout ni version imposés par ce document. Vérifier l’outillage nécessaire au checkpoint autorisé, sans changer le runtime global.
- Transport A comme base de travail sur sa preuve existante ; absence de preuve sur les autres supports conservée. Ne pas transformer cette recommandation en validation universelle. Un repli qui modifie UX/coût repasse par un arbitrage.
- Cadence normale<2min, secours nominal5min, admission fraîche sous verrou ; le TEST reste réglé à12h au repos. Mesures et implémentation ne sont pas déduites de l’accord.
- Les17 stories restent Backlog tant que leur préparation détaillée n’est pas acceptée ; aucun point Linear n’est converti en jour. Les issues parents regroupent les résultats et les liens, sans créer cinq projets séparés.
- Modifications progressives dans le même dépôt ; les commits/push historiques sont consignés dans handoff.md. Sofiane autorise le 30 octobre le checkpoint des maquettes actuelles, les commits par jalon et les push sur la branche de travail, et retire la demande par commit. Les règles d’autorisation de déploiement/fusion restent applicables.

## Contrats consolidés et séquence de validation

La spine et la Spec sont réconciliées le28octobre : cadence normale<2min/secours5min, tarif absent non réservable, quotas gratuits, anti-abus, import/export et promotion. Les états historiques des bilans restent datés ; les obligations futures ne sont pas des preuves acquises. Le [contrôle commun](../architecture/controle-technique-v1.md) fixe les scénarios et paramètres techniques partagés.

G0 clôture le dossier pour passer à la revue UX/UI ; G1 exige le GO principal d’un lot identifié ; G2 vérifie les garanties concernées avant l’ouverture hors test contrôlé ; G3 publie après autorisation un candidat de recette puis exécute la recette complète, dont Outlook/Apple ; G4 accepte la remise/ouverture après tous contrôles requis ou dérogation humaine identifiée. Une preview TEST autorisée peut précéder les essais dont elle est le support. Aucun test réel nouveau n’est exécuté pour cette consolidation.

Les dépendances techniques ont été distinguées de l’ordre conseillé des cinq blocs, en conservant17stories. La finition peut avancer indépendamment d’une attente de validation client sur la conservation ; les critères de publication gardent leurs prérequis.

## Compléments d’essai : affectation et effet sur le GO

| ET incomplet | Travail prévu | Gate conservée |
|---|---|---|
| ET-01 Navigation privée | Lecture sans compte/contexte réellement distinct, stories2.1 et3.1, matrice finale5.3 | À confirmer avant dépendance au parcours public ; ce contrôle n’est pas déclaré PASS |
| ET-03 Reprise/politique/double clic | Compléments déterministes et Google pertinents,3.2/3.4 | Aucune reprise aveugle ; défaut d’intégrité bloque le parcours |
| ET-05 Frontières admission/début/fermeture | Compléments horloge/contrôles réels bornés,1.2/3.1/4.2 | Preuves nécessaires avant acceptation du moteur dépendant |
| ET-06 Réceptions en ligne | Vérifier réception des variantes avec/sans lien,3.3 et5.3 | Observation destinataire, pas seulement dossier Envoyés |
| ET-07 Autres agendas | Sofiane ouvre Outlook/Apple sur solution entière,5.3 ; formats/Google dans3.3 | Report explicitement approuvé par Sofiane ; toujours requis avant mise en service |
| ET-08 Interruptions/envois périmés | Injections isolées sans épuisement réel,3.4/4.2 | Place/traces/absence de renvoi exactes avant acceptation des notifications |
| ET-09 Publication/secours/quotas | Édition/collage/import/événement manqué,1.3 et4.1 | Cadence acceptée mais non mesurée ; marge à démontrer avant déploiement dépendant |
| ET-11 Supports | Navigation/envoi/erreurs et contexte conservé sur supports prévus,2.2/3.1/5.3 | Autres navigateurs non vérifiés ; transport ne doit pas être accepté sur une seule simulation |

**Séquence désormais documentée :** intégrer les contrôles au plus tôt à la story qui réalise la fonctionnalité, avant l’exposition/acceptation concernée, puis recette complète enG3. Les mesures impossibles sur une fonctionnalité non encore construite ne sont pas prétendues acquises àG0. Les preuves historiques4PASS/8NON VÉRIFIÉ restent inchangées. Le premier lot proposé est1.1–1.3 sur ressources isolées, après revue UX et validation du plan ; son GO n’est pas donné par la consolidation.

## Estimation du reste : interventions humaines actives

**Base de planification validée par Sofiane au point 4 le 30 octobre : 2,5 jours-personnes humains actifs cumulés de base +0,5 jour-personne de réserve =3 jours-personnes, pour Sofiane et Tema réunis.** Fourchette de préparation2,5–3,5 jours selon les résultats de recette. Il s’agit du reste estimé à partir de maintenant, sans reconstituer un temps passé non mesuré ni soustraire mécaniquement les anciens trois jours proposés pour le mandat entier. Aucun supplément commercial ou prix modifié n’en découle.

| Intervention humaine restante | Base | Qui intervient |
|---|---:|---|
| Revue finale du découpage, arbitrages et GO par lot | 0,5 j | Sofiane |
| Coordination des accès, données finales, politique/identité et disponibilité des environnements | 0,5 j | Sofiane et interlocuteur Tema ; aide technique humaine si un blocage exige leur action |
| Recette fonctionnelle E2E, supports/agendas, retours et arbitrages d’une ronde d’ajustements | 1 j | Sofiane avec Tema pour les points qui leur appartiennent |
| Validation de remise, passation30min et coordination bascule gérée par Sofiane | 0,5 j | Sofiane/Tema |
| Réserve pour reprise de recette ou accès | 0,5 j | Affectation au besoin, non consommée par défaut |

Les postes ci-dessus cumulent les interventions des personnes concernées ; ils ne réservent pas automatiquement trois journées personnelles à Sofiane. La répartition précise Sofiane/Tema sera ajustée selon les interventions réelles ; la validation porte sur l’enveloppe cumulée. Le code, les tests et les revues exécutés en autonomie sont du travail distinct : leur durée d’exécution n’est ni un jour humain continu ni une promesse calendaire. Le temps de lecture et d’arbitrage réel est inclus dans les postes humains ; l’agent ne s’attribue pas du temps humain fictif. La bascule FTP technique reste sous responsabilité Sofiane et son effort ne peut être chiffré sans information serveur ; le poste ci-dessus couvre la coordination/validation, pas un chantier d’hébergement inconnu.

Attentes externes séparées : réponses Tema, validation des textes/prix/identité, récupération du compte, disponibilité Outlook/Apple et appareils, offre Vercel compatible. Aucun délai de calendrier ou date de livraison promis. Réviser l’estimation si le transport échoue hors navigateur intégré, si les quotas imposent une autre solution ou si le périmètre change.

## Validation finale à regrouper

1. Découpage17stories et ordre de réalisation.
2. Réutilisation du prototype, limites de preuve et traitement des prérequis restants sans waiver implicite.
3. Estimation humaine restante proposée et fourniture des valeurs client à leur jalon.
4. GO de développement identifié, distinct de cette préparation ; fusion, déploiement et ouverture restent des étapes propres.

Critères de clôture : une story est Review après réalisation/revue/tests requis ; Done après acceptation et intégration dans la cible convenue, pas seulement des tests locaux verts. Le ticket de remise requiert recette, cible et passation acceptées. Aucun ticket n’est clos par cette rédaction.

## Correspondance Linear

| Bloc | Parent | Tâches |
|---|---|---|
| 1 | [TEM-7](https://linear.app/tema-academie/issue/TEM-7/v1-1-tema-prepare-et-publie-son-offre-depuis-google-sheets) | [TEM-12](https://linear.app/tema-academie/issue/TEM-12/11-preparer-le-catalogue-fidele-et-administrable) (1.1), [TEM-13](https://linear.app/tema-academie/issue/TEM-13/12-preparer-et-ouvrir-des-dates-avec-capacite-configurable) (1.2), [TEM-14](https://linear.app/tema-academie/issue/TEM-14/13-actualiser-les-modifications-et-rattraper-un-traitement-manque) (1.3) |
| 2 | [TEM-8](https://linear.app/tema-academie/issue/TEM-8/v1-2-le-visiteur-trouve-une-formation-et-choisit-sa-date) | [TEM-15](https://linear.app/tema-academie/issue/TEM-15/21-consulter-et-filtrer-le-catalogue-des-formations) (2.1), [TEM-16](https://linear.app/tema-academie/issue/TEM-16/22-parcourir-le-calendrier-general-sur-ordinateur-et-telephone) (2.2), [TEM-17](https://linear.app/tema-academie/issue/TEM-17/23-lire-la-fiche-et-selectionner-explicitement-une-date) (2.3) |
| 3 | [TEM-9](https://linear.app/tema-academie/issue/TEM-9/v1-3-le-participant-reserve-une-place-et-recoit-ses-informations) | [TEM-18](https://linear.app/tema-academie/issue/TEM-18/31-confirmer-une-inscription-unique-aux-conditions-presentees) (3.1), [TEM-19](https://linear.app/tema-academie/issue/TEM-19/32-reprendre-un-resultat-incertain-et-reconfirmer-des-conditions) (3.2), [TEM-20](https://linear.app/tema-academie/issue/TEM-20/33-recevoir-confirmation-invitation-et-avis-interne-fideles) (3.3), [TEM-21](https://linear.app/tema-academie/issue/TEM-21/34-conserver-la-place-et-un-suivi-honnete-lorsque-lenvoi-echoue) (3.4) |
| 4 | [TEM-10](https://linear.app/tema-academie/issue/TEM-10/v1-4-tema-gere-les-inscrits-et-les-changements-en-conservant) | [TEM-22](https://linear.app/tema-academie/issue/TEM-22/41-annuler-et-reinscrire-sans-effacer-lhistorique) (4.1), [TEM-23](https://linear.app/tema-academie/issue/TEM-23/42-reprogrammer-une-session-avec-suivi-manuel-des-participants) (4.2), [TEM-24](https://linear.app/tema-academie/issue/TEM-24/43-consulter-exporter-et-nettoyer-les-donnees-selon-la-politique) (4.3) |
| 5 | [TEM-11](https://linear.app/tema-academie/issue/TEM-11/v1-5-tema-recoit-une-solution-verifiee-presentable-et-transmissible) | [TEM-25](https://linear.app/tema-academie/issue/TEM-25/51-finaliser-une-interface-tema-lisible-et-accessible) (5.1), [TEM-26](https://linear.app/tema-academie/issue/TEM-26/52-rejouer-les-controles-avant-chaque-mise-a-jour) (5.2), [TEM-27](https://linear.app/tema-academie/issue/TEM-27/53-recetter-la-solution-complete-et-ses-invitations-de-bout-en-bout) (5.3), [TEM-28](https://linear.app/tema-academie/issue/TEM-28/54-remettre-le-candidat-le-guide-et-les-elements-de-publication) (5.4) |

[Vérification de couverture](validation-decoupage-v1.md) · [Préparation à l’implémentation](../../../_bmad-output/planning-artifacts/implementation-readiness.md) · [Registre](linear-v1.json).

La revue globale du26octobre reste un constat historique ; ses corrections techniques sont consolidées dans le [dossier d’architecture](../architecture/controle-technique-v1.md). Les deux arbitrages tarif/limites Google ont reçu réponse le28octobre ; aucun achat automatique, plafond métier50 ou nouvelle approbation graphique.
