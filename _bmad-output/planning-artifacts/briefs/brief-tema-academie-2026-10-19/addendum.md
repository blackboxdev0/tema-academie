# Compléments au cadrage — Tema Académie

## Sources et niveau de preuve

- **S1 — Brief initial du 19 octobre 2026** : [copie fournie par Sofiane](../../../../docs/project/sources/brief-initial-2026-10-19.md). Entrée de cadrage, avec architecture proposée et GO client explicitement en attente.
- **S2 — Proposition PDF** : `/Users/sofiane/Downloads/Tema Académie · Proposition bkbx.pdf`, 9 pages. Périmètre pages 3 à 8, conditions page 9. Le montant de 3 600 $ n'est pas affiché ; la page 9 a aussi été inspectée visuellement. Les dates et personnes des exemples ne sont pas des données de lancement.
- **S3 — Catalogue Excel** : `/Users/sofiane/Downloads/Académie - Programmes pour le Pré Lancement.xlsx`, onglet `Sheet1`. Données lues sans modification. Empreintes et chemins des trois sources dans `docs/project/sources/manifest.json`.
- **D1 à D3 — Réponses humaines du 19 octobre** : formations sans date visibles sans inscription ; une personne/place par formulaire ; prérequis informatifs. Ces décisions sont validées indépendamment de la validation finale du brief.
- **D4 à D6 — Réponses suivantes de Sofiane du 19 octobre** : voie de synthèse rapide, nouvelle adresse Gmail dédiée à créer et Vercel pour commencer et tester. Ces décisions précisent le cadrage et n'autorisent pas à elles seules le développement, la création de compte ou la publication immédiate.
- **Validation fonctionnelle suivante de Sofiane du 19 octobre** : « oui clairement », en réponse à la vision et aux deux règles finales (H1, H2), puis compte Google explicitement retenu : `temaacademie@gmail.com`. L'existence du compte, ses accès et son propriétaire n'ont pas été vérifiés. Cette validation porte sur le fonctionnement, pas sur le budget, l'architecture exécutée ou le GO de développement.

## Lecture du catalogue et préparation de l'import

| Zone source | Contenu constaté | Traitement proposé |
|---|---|---|
| `A5:I23` | En-têtes et 18 formations Divalto | Importer les 18 formations, conserver les colonnes métier. |
| `A25:I33` | Groupe Dimo et MoovApps : 4 Dimo, 2 MoovApps | Classer par logiciel réel, conserver la séparation. |
| `A35:C48` | Présentations/webinaires : 9 entrées | Conserver en référence ; ne pas ouvrir d'inscription V1. Leur éventuel affichage n'est pas décidé. |
| `A50` | Phrase de mise en forme hors catalogue | Ne pas importer comme formation ni exécuter comme demande de calendrier. |

Une formation dure une demi-journée et commence à 450 $ ; les 23 autres durent une journée et commencent à 850 $. Les prix sont des textes « À partir de », pas des prix numériques exacts facturables. Préserver cette qualification et confirmer devise, taxes et unité tarifaire avant publication. Toutes les capacités des formations valent 8 et toutes les dates valent « à venir » ; aucune cohorte réelle ne peut être créée à partir de ce fichier seul.

Les formateurs sont des codes internes, pas des noms prêts à publier. Les cellules `G18` et `G23` sont vides. La plage de feuille annonce 1 000 lignes, mais il ne s'agit pas de 1 000 enregistrements : titres, en-têtes répétés, lignes vides et notes sont exclus du décompte. Aucun calcul/formule n'a été trouvé.

Les onglets de destination proposés sont `Formations`, `Disponibilités`, `Inscriptions`, `Paramètres`. Le PDF illustre trois onglets métier ; un quatrième onglet de réglages n'ajoute pas de fonctionnalité client. La structure définitive doit préserver les prérequis, le contenu et les résultats en plus des champs simplifiés du brief. Les identifiants stables doivent rester distincts des titres modifiables. Les formateurs peuvent rester internes tant que leur affichage n'est pas décidé.

## Points à arbitrer

- **Intégration et hébergement final** : Vercel est choisi pour l'étape initiale et les essais, ce qui écarte l'attente d'un accès FTP/DNS ou de la refonte David pour cette étape. L'intégration finale reste ouverte. Le compte et le forfait Vercel doivent être vérifiés avant déploiement ; ce choix n'autorise aucun achat et ne promet pas Vercel gratuit pour un mandat commercial.
- **Cohortes** : H1 est validée : une date et une plage horaire par cohorte, huit places initiales modifiables. Mode, lieu/lien, horaires réels et seuil de fermeture des inscriptions le jour du cours restent à fournir/préciser. Les formations sur plusieurs dates ne font pas partie du fonctionnement retenu.
- **Administration** : H2 est validée : Tema gère annulations/changements de date et contact avec le participant ; annuler une inscription libère la place. Définir les protections et le recalcul dans la spécification ; ne pas introduire de libre-service ni d'avis automatique de replanification.
- **Tarif** : sens du prix « À partir de », prix par participant ou groupe, taxes/devise. Le paiement reste externe.
- **Compte et remise** : adresse retenue par Sofiane : `temaacademie@gmail.com`. Vérifier son existence et les accès avant de créer les ressources Google et d'utiliser cet expéditeur. Personnes éditrices, destinataire des avis, récupération et éventuel transfert restent à préciser ; aucun Google Workspace ni domaine email Tema n'est requis à ce stade. Partager des fichiers et transférer un compte ne sont pas la même opération.
- **Confidentialité** : lien et texte de politique Tema, champs réellement nécessaires, caractère obligatoire du téléphone, durée de conservation et personne chargée des demandes de suppression. La présence d'une case ne constitue pas une validation juridique globale.
- **Contenu et visuel** : logo réel, couleurs officielles et maquettes de David non fournis. Les codes `#585D6B` et `#FF008F` du brief restent indicatifs. Préserver les textes pédagogiques sans inventer d'offres Dynamics ou Esker.
- **Commercial** : montant visible sur la proposition destinée au client, statut du GO/acompte, début réel de l'échéancier et définition de la limite « aucun frais mensuel ».

## Vérifications techniques documentaires du 19 octobre 2026

Recherche sur les sources officielles Google par un agent de recherche distinct ; aucun prototype ni déploiement produit réalisé.

1. [Quotas Apps Script](https://developers.google.com/apps-script/guides/services/quotas) : 100 destinataires/jour pour les comptes grand public ; quota par utilisateur et remise à zéro 24 h après la première requête. Deux destinataires par inscription donnent au plus 50 inscriptions/jour avant tout autre envoi ou reprise. Une cohorte de huit n'établit pas à elle seule le volume journalier global. Six minutes par exécution et 30 exécutions simultanées/utilisateur sont aussi documentées. Valeurs susceptibles de changer ; vérifier avant livraison.
2. [Web Apps](https://developers.google.com/apps-script/guides/web) : `doGet`/`doPost` et exécution comme propriétaire sont documentés. Tester un déploiement public réel en navigation privée. Aucun jeton du propriétaire ne doit être exposé au site.
3. [ContentService](https://developers.google.com/apps-script/guides/content) : réponse redirigée vers `script.googleusercontent.com`. La réponse lisible depuis une origine externe, notamment après POST JSON avec prérequête, n'est pas prouvée par cette documentation. Éviter `no-cors` comme faux succès (réponse opaque) et JSONP pour une inscription ou des données privées.
4. [Communication HTML Service](https://developers.google.com/apps-script/guides/html/communication) : `google.script.run` et ses gestionnaires de succès/échec sont documentés pour une page servie par Apps Script. Une page de formulaire Apps Script liée depuis le catalogue est une alternative à discuter si le formulaire externe ne répond pas au besoin. Elle change le parcours ; ne pas l'imposer silencieusement.
5. [LockService](https://developers.google.com/apps-script/reference/lock/lock-service) : utiliser un verrou script pour protéger, dans une même section, le contrôle de capacité, la recherche de doublons et l'enregistrement. Le verrou document peut être absent dans une Web App. Les modifications manuelles du Sheet ne sont pas protégées par ce verrou.
6. [Propriété Drive](https://support.google.com/drive/answer/2494892?hl=en) : transferts soumis aux types de comptes et à l'acceptation. Ne pas promettre une migration transparente d'un propriétaire Gmail personnel vers un compte professionnel. Prévoir la remise avec le compte choisi avant la production.

Déductions de conception proposées, non implémentées : conserver une inscription avec identifiant stable et états séparés pour les courriels ; une panne d'envoi ne doit pas présenter comme inexistante une réservation déjà enregistrée. Les tentatives répétées ne doivent pas ajouter de place réservée. L'envoi exactement une fois n'est pas garanti par le simple verrou. Distinguer le cache public, réservé au catalogue, de la vérification sous verrou à partir des données à jour ; invalider/rafraîchir les places après inscription et mesurer le délai réel inférieur à deux minutes. Ne jamais exposer l'onglet des inscriptions via l'API publique.

### Hébergement initial précisé ensuite

Vercel pour les essais est une décision de Sofiane. Le [fonctionnement des environnements Vercel](https://vercel.com/docs/deployments/environments) permet de distinguer les déploiements de prévisualisation et de production ; le nom du service ou la présence d'une URL accessible ne prouve pas une livraison acceptée. La [documentation du forfait Hobby](https://vercel.com/docs/plans/hobby), consultée le 19 octobre 2026, réserve cette offre à un usage personnel non commercial. Le forfait et le compte bkbx/Tema doivent donc être constatés avant de promettre l'absence de frais Vercel. L'hébergement final reste à décider ; aucun changement vers une offre payante n'est autorisé par cette recherche.

## Estimation de préparation — proposition à valider

L'enveloppe de trois jours humains du brief n'est pas une estimation déjà acceptée pour un périmètre finalisé. Hypothèse de travail : une seule personne par formulaire, prérequis informatifs, catalogue fourni réutilisable, essais initiaux sur Vercel, compte/forfait disponible avant déploiement, horaires simples, une langue, une ronde d'ajustements. Compter en jours humains actifs :

| Intervention | Hypothèse |
|---|---:|
| Cadrage, arbitrages et vérification de faisabilité | 0,5 j |
| Accès, préparation des données et coordination David/Tema | 0,5 j |
| Recette métier, parcours réel et arbitrages de correction | 1 j |
| GO de livraison, remise et accompagnement | 0,5 j |
| Réserve de coordination et de correction | 0,5 j |
| Total de travail humain actif | 3 j |

Le développement autonome, les revues et tests automatisés ne représentent pas du travail humain continu ; leur durée n'est pas encore mesurée. L'attente des réponses du client, des accès Google/Vercel, de la validation visuelle et de la politique de confidentialité constitue un délai externe. DNS/FTP pourront être nécessaires pour une intégration finale choisie plus tard ; ils ne conditionnent pas les premiers essais Vercel. Le mois après acompte est une échéance commerciale fournie, pas un résultat de planification. Une difficulté de formulaire, un besoin de plusieurs dates ou une extension du suivi des inscrits imposera de revoir hypothèses et réserve avant GO, sans supprimer discrètement de livrable.

## Prochaine étape

La vision fonctionnelle et H1/H2 sont validées. Prochaine préparation recommandée : une spécification courte avec les règles, données, parcours et critères de recette, puis la conception UX/architecture proportionnée et les stories Linear. H3/H4 et l'estimé restent à confirmer sans les assimiler à un GO. Le workflow TEM existe, mais aucun projet ni ticket n'est présent lors de la relecture du 19 octobre. Les sources originales restent intactes ; aucun code applicatif, compte Google, email client ou déploiement n'a été produit par l'agent.

## Clarification de méthode, de validation technique et de structure

Propositions présentées à Sofiane le 19 octobre 2026 en réponse à ses trois questions. Le 20 octobre, Sofiane a validé l'organisation du dépôt et demandé les quatre documents avant développement. Le détail technique et les essais restent à valider ; aucune structure applicative ni infrastructure n'est créée par cette clarification.

### Portée du parcours BMAD proportionné

« Court » désigne la profondeur documentaire et le découpage adaptés à cette V1 : un catalogue, des sessions, une inscription sans paiement ni compte participant. Cela ne sélectionne pas implicitement le mode `oneshot` et ne supprime ni la définition du besoin, ni l'UX, ni l'architecture, ni la revue, ni les tests et la recette. Les questions d'accès Google, d'échanges entre services et de confidentialité restent des critères de faisabilité. Les trois jours humains sont une estimation à confirmer, pas une raison de supprimer ces contrôles.

### Validation de l'infrastructure avant la réalisation principale

1. Définition fonctionnelle et parcours ; proposition d'architecture et plan de vérification.
2. Vérifications documentaires et d'accès : compte Google retenu, droits Sheet/Apps Script, identité d'expéditeur, compte/forfait Vercel, coûts et séparation des environnements. GitHub et Linear sont vérifiés ; Google et Vercel restent non vérifiés.
3. Après GO sur un essai technique limité, preuve sur des ressources de test : lecture depuis l'URL Vercel réelle, soumission et réponse lisible, écriture d'une inscription, réception du courriel et ouverture de l'invitation agenda. Vérifier aussi la concurrence sur la dernière place et la reprise après un échec d'envoi. Critère : des effets observés et des résultats conservés, pas seulement un schéma d'architecture.
4. Confirmer ou adapter l'architecture à partir de cette preuve avant le développement principal ; discuter toute modification du parcours ou du coût.
5. Pendant la réalisation, tests métier et d'intégration ; avant livraison, recette complète depuis un navigateur, édition du Sheet par une personne Tema, accès publics/privés, emails et capacité, puis contrôles sur le candidat réellement livré.

Les ressources et données de test seront séparées des inscriptions réelles. Le plan de livraison identifiera les versions déployées, l'ordre des composants et la récupération. Aucun déploiement n'est implicitement autorisé par ce plan.

### Organisation du dépôt validée le 20 octobre 2026

Conserver le socle, ses configurations et son outillage aux emplacements actuels, puis regrouper le code produit sous un dossier `app/` dans le même dépôt GitHub :

```text
tema/
├── AGENTS.md
├── _bmad/              # BMAD installé
├── .agents/            # Skills Codex
├── .claude/            # Skills Claude
├── config/             # Profil et configuration de la méthode
├── scripts/            # Outils du socle
├── tests/              # Tests du socle
├── docs/project/       # Contexte, décisions et remise Tema
├── _bmad-output/       # Spécifications, UX, architecture et stories
└── app/                # Code propre à Tema, à créer après le GO adapté
    ├── web/            # Site et formulaire
    ├── apps-script/    # Sources des automatisations Google
    └── tests/          # Tests métier, intégration et parcours
```

Cette structure permet de conserver ensemble une version du contexte, du site et des automatisations. La structure de Pink Gossip a été relue localement : racine, `mobile-app` et `backend` sont trois dépôts Git distincts. Pour la V1 Tema, le dépôt unique est recommandé ; des dépôts indépendants seraient justifiés par des cycles ou équipes de livraison distincts, qui ne sont pas établis ici.

Vercel pourra cibler uniquement `app/web/` via son [répertoire racine de projet](https://vercel.com/docs/monorepos), avec un répertoire de sortie limité aux fichiers publics à définir lors de la conception technique. Le code Apps Script doit lui aussi être versionné localement ; [clasp](https://developers.google.com/apps-script/guides/clasp) permet la gestion locale, des versions et des déploiements Google. Les comptes, jetons et données d'inscrits n'entrent pas dans Git.

`origin` reste `tema-academie` et `upstream` reste `bkbx-agentic`. Le socle est une copie embarquée ; les mises à jour seront examinées et appliquées de façon ciblée, avec vérification et préservation du contexte Tema, sans mise à jour automatique du produit depuis le modèle.
