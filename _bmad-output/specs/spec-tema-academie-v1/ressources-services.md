# Ressources Google et Vercel — Tema Académie

Créées et vérifiées par Computer Use le 26 octobre 2026, après connexion de Sofiane. Registre machine correspondant : `config/project.json`. Création initiale suivie du GO explicite d’essai limité TEM-6 le 26 octobre. Prototype TEST exécuté et bilan disponible ; vérifications et arbitrages restants, développement principal non autorisé. Les paragraphes Métier décrivent sa structure inchangée, ceux de TEST son état courant.

## Google

Compte propriétaire : `temaacademie@gmail.com`. [Dossier Tema Académie](https://drive.google.com/drive/u/0/folders/1x9AdxaiqeF40Jpok8xqTusd5w7YwP2C7). Les deux classeurs sont privés au propriétaire ; aucun partage public ajouté.

| Cible | Classeur | Projet Apps Script lié | Propriétés sauvegardées et relues |
|---|---|---|---|
| Métier pérenne | [Tema Académie — Métier](https://docs.google.com/spreadsheets/d/1j8k2FKt5J_Tyx4vNCIY4_dgV4ZYmTO-UOMaTc5-6ji4/edit) | [Tema Académie — Métier](https://script.google.com/u/0/home/projects/1Wu_Bfys_yPnvvSLA5wKljmI5mA5WDreVXmkXLdOYCPLpgs35CjlduhBc/edit) | `ENVIRONMENT=PROD` ; `SPREADSHEET_ID=1j8k2FKt5J_Tyx4vNCIY4_dgV4ZYmTO-UOMaTc5-6ji4` |
| Essai isolé | [Tema Académie — TEST](https://docs.google.com/spreadsheets/d/1Zq8s1Jwd4NgpbMIed35W0LJIsUpJ-JPt19BZK89yM3c/edit) | [Tema Académie — TEST](https://script.google.com/u/0/home/projects/1cQXjhw60iKv9n3P4EcLcgsbWBgWmlj47EFUGM5wqJgXDAQqajC5M0k_x/edit) | `ENVIRONMENT=TEST` ; `SPREADSHEET_ID=1Zq8s1Jwd4NgpbMIed35W0LJIsUpJ-JPt19BZK89yM3c` |

`PROD` désigne la future cible métier, sans code ou déploiement métier. TEST possède désormais son prototype et une version web app d’essai. Un projet Apps Script par classeur, chacun indépendant de l’autre. Les propriétés Métier restent réservées à la future réalisation ; TEST les vérifie avec les identifiants fixes avant chaque accès Google.

Les quatre onglets sont présents dans chaque classeur : **Formations** (13 en-têtes), **Disponibilités** (11), **Inscriptions** (29) et **Paramètres**. Les en-têtes du métier ont été recopiés/relus ; TEST est une copie de cette structure. Ligne d’en-têtes en gras. Paramètres : contact et avis internes Tema distincts mais utilisant la même adresse validée, nom d’expéditeur, référentiel logiciels `DIV — Divalto`, `DIMO — Dimo`, `MOOV — MoovApps` ; URL/version de politique laissées vides pour validation Tema.

Le catalogue Excel original est intact et non importé. Métier conserve en-têtes/paramètres et squelette Google, sans exécution, déclencheur ou déploiement métier. TEST contient une formation active, deux dates fermées et cinq inscriptions fictives (quatre confirmées, une annulée), avec cases/listes/avertissements/calculs et génération initiale des IDs. Défauts numériques, reçus, délai POST et réconciliation corrigés après revue et essai.

Toronto/V8 et locale Canada français constatés. Web app TEST **version 3** exécutée par propriétaire, Anyone confirmé par Sofiane ; HEAD sauvegardé identique au bundle SHA-256 `34e7ab30766995dd62e7bb593042f2b514364a79ea673721c4e33049c0c4364c`. URL/ID dans config/project.json. Retour version 2/HEAD précédent puis rétablissement version 3 effectués sans restauration Sheet ; cinq métadonnées de lignes et compteurs conservés.

Deux déclencheurs de données : onEdit et périodique, testé minute puis ramené **toutes les12 heures au repos**, réglage relu. Ni courriel depuis ces déclencheurs ni choix de cadence V1 déduit. Mesures minute à réévaluer face au quota90 min/jour du compte gratuit ; cible fonctionnelle<2 min conservée. Propriété de panne retirée. Propriétés privées ALLOWED_RECIPIENTS_JSON/TEMA_EMAIL/CONTACT_EMAIL ; ne pas copier les participants ou effacer TRIAL_MAIL_BUDGET_JSON/FORMATION_COUNTER/SOFTWARE_RESERVED_IDS_JSON/TRIAL_ADMIN_DIGEST.

Inspection finale26octobre17:17:39 Toronto : budget **5/10 inscriptions avec tentatives**, **10/20 destinataires réservés**, quota **92 restants** (initial100, quota partagé). Sept états SENT/trois FAILED ; acceptation distincte de réception. Confirmation présentielle reçue attestée par Sofiane avec capture, avis Tema reçu, variantes en ligne inspectées côté Envoyés et deux ICS importés dans Google Agenda aux bonnes heures hiver/été. Outlook/Apple et autres supports non vérifiés ; carte Gmail Envoyés Unable to load event malgré imports manuels réussis.

## Vercel et GitHub

- Espace connecté : **blackboxsaas’ projects**, slug `blackboxsaas-projects`, offre **Hobby**, compte `blackboxsaas-7343`.
- [Projet Vercel tema-academie](https://vercel.com/blackboxsaas-projects/tema-academie), ID `prj_mUzZpB1WZnx2FNg0G23lYFpnWUqw` : initialement créé vide, désormais utilisé pour le prototype statique TEST (Vercel Drop, quatre fichiers). Domaine observé [project-w1j1x.vercel.app](https://project-w1j1x.vercel.app/) ; plateforme labelle ce déploiement Production, mais la seule cible Google et les données restent TEST. Aucun produit métier ou livraison client ; Git toujours non relié. Déploiement courant `5zNTif7SBSon5aEMm3RMoeEPb8Gf`, Ready ; retour au précédent puis rétablissement et hash du fichier servi contrôlés.
- [Dépôt GitHub](https://github.com/blackboxdev0/tema-academie) déjà existant : PUBLIC après changement déclaré par Sofiane, branche `main`, droit ADMIN relus par CLI. Le dépôt apparaît dans la liste Import de Vercel sous `blackboxdev0` ; aucun import ou connexion Git du projet effectué.
- Sofiane retient le compte actuel pour la préparation. [Hobby est réservé à l’usage personnel non commercial](https://vercel.com/docs/plans/hobby) : compatibilité à résoudre avant déploiement client. Aucun achat ou changement d’offre.

## Limites et suite

Trois boîtes participantes restent en configuration privée hors dépôt. [Bilan TEM-6](../../../docs/project/technical-trial/TEM-6-results.md) : quatre PASS, huit NON VÉRIFIÉ ; contrôles locaux61 Node/28 E2E, Google réel et limites distingués. TEM-6 In Progress pendant les compléments/arbitrages ; TEM-5 Review et projet Backlog gardent leurs jalons. Aucun commit, push, GO principal ou livraison client.
