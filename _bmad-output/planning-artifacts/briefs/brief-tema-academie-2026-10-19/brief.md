---
title: "Tema Académie — Brief produit"
status: draft
created: 2026-10-19
updated: 2026-10-19
---

# Brief produit : Tema Académie

Le fonctionnement présenté à Sofiane, y compris les sessions sur une journée et les annulations manuelles, est validé par sa réponse du 19 octobre 2026. Les précisions H3 et H4, l'architecture et l'enveloppe proposée de trois jours humains actifs restent à finaliser dans la définition détaillée. Proposition client et GO de développement restent en attente ; aucun commit sans demande explicite.

## Intention et utilisateurs

Tema Solutions souhaite présenter ses formations et recevoir les inscriptions de ses clients avec un outil simple à administrer. Un employé de Tema doit pouvoir ajouter une formation ou une cohorte sans intervention de bkbx. Les participants consultent le catalogue, les prérequis et les dates, puis réservent leur place et reçoivent une confirmation avec invitation agenda.

Le site vitrine est en refonte avec David Leblanc, Caractère Gras. Pour démarrer rapidement, le module Académie sera présenté et testé sur Vercel, avec l'identité Tema. L'intégration au site vitrine et l'hébergement final seront décidés ensuite. L'objectif est l'autonomie de publication et d'inscription ; aucun objectif commercial chiffré supplémentaire n'est fourni.

## V1 décrite dans les sources

- Catalogue français et calendrier mensuel ; identification par logiciel, prix « À partir de », places restantes et état « Complet ».
- Google Sheet administrable : formations, cohortes, inscriptions et paramètres ; catalogue existant importé, validations et protections, mode d'emploi.
- Inscription avec coordonnées et consentement horodaté ; capacité contrôlée au moment de l'enregistrement et doublon courriel/cohorte refusé.
- Confirmation au participant avec fichier `.ics`, avis à Tema et actualisation des places ; dates passées retirées.
- Site adapté au mobile, clavier et formulaires accessibles ; hébergement, une ronde d'ajustements et séance de remise de 30 minutes.

Hors V1 : paiement en ligne, inscriptions aux webinaires, anglais, compte participant et annulation en libre-service. L'administration des annulations et des changements de date reste à préciser, sans ajouter de portail.

## Décisions validées par Sofiane le 19 octobre 2026

1. Les formations sans cohorte publiée restent visibles avec « Dates à venir » et inscription désactivée.
2. Un formulaire représente une personne et une place. Les inscriptions groupées sont hors V1.
3. Les prérequis sont affichés à titre informatif ; aucun historique de formations n'est contrôlé.
4. Le cadrage suit une synthèse rapide : brief complet avec hypothèses signalées, soumis à validation.
5. Le compte Google retenu est `temaacademie@gmail.com`, précisé ensuite par Sofiane. Aucun domaine de messagerie Tema n'est nécessaire pour cette première étape. L'existence du compte et ses accès ne sont pas vérifiés.
6. Vercel est retenu pour l'hébergement initial et les essais. Ce choix ne fixe ni l'hébergement final, ni le compte ou le forfait Vercel, et ne constate aucun déploiement.
7. Une cohorte se déroule sur une date, avec heures de début/fin et lieu ou lien saisis par Tema. Huit places est la valeur initiale modifiable. Les formations sur plusieurs journées ne sont pas prévues dans ce premier découpage.
8. Tema gère les annulations et changements de date dans le Sheet et contacte les participants manuellement. Une inscription annulée libère sa place ; pas de portail d'annulation ni de notification automatique de replanification.

Source : réponses humaines aux choix de cadrage dans cette conversation. Détail et limites dans l'[addendum](addendum.md).

## Données réellement fournies

Le fichier de prélancement contient 24 formations : 18 Divalto, 4 Dimo et 2 MoovApps. Il contient aussi 9 présentations/webinaires, hors inscription V1. Toutes les formations portent « à venir », sans date, heure ou lieu exploitable. Une capacité de 8 figure sur les 24 formations ; son utilisation comme valeur initiale modifiable de chaque cohorte a été confirmée ensuite par Sofiane (décision 7).

Le contenu, les prérequis, les résultats pédagogiques et les formateurs sont à préserver dans les données. Deux formations n'ont pas de formateur renseigné. Dynamics 365 et Esker sont des exemples du brief, pas des formations attestées dans ce classeur.

## Contraintes et engagements à confirmer

Le brief annonce 3 600 $ hors taxes, environ 3 jours de travail humain actif, et une livraison un mois après l'acompte, avec paiement 30 % / 70 % et garantie de 30 jours. Le PDF fourni reprend échéancier et modalités, mais aucun montant n'y est visible, y compris après vérification visuelle de sa dernière page.

L'absence d'abonnement payant est exigée par le brief ; le PDF promet « Aucun frais mensuel de bkbx ». Pour les essais Vercel, l'accès FTP, un sous-domaine et l'intégration au site vitrine avec David ne sont pas des prérequis. Le compte/forfait Vercel et les éventuels frais tiers restent à confirmer ; aucun service payant n'est commandé. Aucun compte Google ni hébergement n'a été créé.

## Précisions de la V1 restant à valider

- H1 (cohorte sur une date, huit places modifiables) et H2 (administration manuelle des annulations) ont été validées ensuite par Sofiane ; elles figurent désormais parmi les décisions ci-dessus.
- **[HYPOTHÈSE H3]** Les tarifs restent affichés tels que fournis, « À partir de 450 $ / 850 $ » ; devise, taxes et unité tarifaire seront confirmées avant publication publique. Les codes de formateurs restent internes.
- **[HYPOTHÈSE H4]** La recette utilise des cohortes et participants de test. La mise en service réelle attend les contacts Tema, le texte de confidentialité, les horaires, le lieu/lien et le GO de livraison.

Ces hypothèses permettent de préparer un périmètre complet sans transformer les informations manquantes en décisions validées.

## Orientation technique à valider

Site statique, Google Sheet et Google Apps Script sont l'orientation fournie, pas une architecture exécutée ou validée. Les données restent tabulaires, sans dépendance à des formules exclusives Google ; cela facilite l'export Excel sans promettre de synchronisation Excel/Google.

Deux vérifications sont prioritaires après GO technique : réponse fiable du formulaire depuis le domaine du site ; inscription conservée et reprise possible si un courriel échoue. Le quota Google actuel est de 100 destinataires/jour pour un compte grand public, soit au plus 50 inscriptions si chaque inscription produit exactement deux destinataires. Les détails, alternatives et sources sont dans l'addendum.

## Réussite et prochain jalon

Une cohorte ajoutée par Tema apparaît en moins de deux minutes. Une inscription valide réserve une seule place et déclenche une confirmation au participant ainsi qu'un avis à Tema. Deux demandes concurrentes sur la dernière place ne créent pas de surréservation ; une reprise ne crée pas de deuxième inscription. Une ligne invalide n'interrompt pas tout le catalogue et les données des inscrits restent privées.

Les [critères détaillés fournis](../../../../docs/project/sources/brief-initial-2026-10-19.md) restent l'entrée de la future spécification. Préciser les accès nécessaires avant l'exécution des stories.
