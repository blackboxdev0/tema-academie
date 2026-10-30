# Exploiter Tema Académie — Google TEST

La cible courante est locale + Google TEST. Fusion/main, Métier, démonstration Vercel et bascule FTP ont leurs GO propres. Les dates de recette sont fictives ; « à venir » dans le classeur client ne crée aucune vraie session. Les données privées et les preuves nominatives restent hors dépôt et Linear.

## Installer un candidat compatible

1. Ouvrir **Tema Académie — TEST** depuis `config/project.json`. Vérifier compte, ID projet et ID classeur ; un seul projet écrivain par Sheet. Le visiteur ne choisit jamais ces destinations.
2. Relever `inspectTrial`, version web app, HEAD et empreintes avant changement ; garder le précédent couple site/script compatible en privé. Conserver inscriptions, allowlist, budgets, compteur formation et journal d’import. Ne pas rejouer l’installation initiale sur TEM-6 rempli.
3. Générer avec `cd app && npm run verify`. Copier `dist/apps-script/Code.gs` dans l’éditeur TEST et utiliser son manifeste ; aucune deuxième copie du moteur. Permissions Sheets/MailApp/déclencheurs, pas de lecture Gmail. Toute nouvelle demande sensible Google suit son contrôle propre.
4. Garder privés `ENVIRONMENT=TEST`, `SPREADSHEET_ID`, `CONTACT_EMAIL`, `TEMA_EMAIL`, `ALLOWED_RECIPIENTS_JSON`. La liste contient chaque participant fictif et le destinataire interne. Ne pas ajouter de destinataire sans autorisation. Aucun réglage navigateur n’affaiblit cette garde.
5. Exécuter `reconcileTrial` puis vérifier les diagnostics, sans courriel. La lecture publique reste non mutante et l’admission relit les valeurs courantes sous verrou.
6. Après son GO TEST, créer la version web app exécutée par le propriétaire, accès anonyme autorisé, et garder HEAD compatible. Le build utilise l’URL TEST publique du registre, surchargeable par `TEMA_TEST_API_URL`. Vérifier catalogue, transport, reprise et comptages.

Le plafond persistant d’essai est dix inscriptions avec tentative automatique et vingt destinataires réservés, sans reset entre versions. Une interruption peut consommer du budget sans réception. Il se distingue du quota quotidien partagé du compte : relire les deux avant chaque séquence. Le manque de quota n’annule jamais une place enregistrée. SENT signifie acceptation MailApp, pas réception.

## Importer les24formations en privé

`python3 app/scripts/catalogue-source.py --output /CHEMIN_PRIVE/catalogue-import.json` contrôle le hash du snapshot approuvé dans `config/project.json` et prépare24formations18/4/2, neuf informations source conservées. Le JSON contient les codes formateurs privés. Les neuf présentations sont exclues ; aucune date n’est importée ; nouvelles formations inactives.

Dans l’éditeur privé seulement, préparer `TEMA_PRIVATE_CATALOGUE_IMPORT` avec ce manifeste, ou propriétés `CATALOGUE_IMPORT_CHUNKS` et `CATALOGUE_IMPORT_0`… dont la concaténation forme le JSON. Exécuter `importCatalogueTrial`, inspecter résultat et diagnostics. Retirer le global temporaire avant empreinte finale de HEAD. Les chunks d’entrée peuvent être retirés après succès ; conserver impérativement journal source→ID et compteurs.

La clé source stable est la plage d’origine, jamais le titre courant. Le journal réserve un code avant insertion ; une reprise partielle/complète retrouve le même code. Une modification Tema divergente produit un conflit sans écrasement. Comparer les clés signalées et décider de la correction, sans effacer la correspondance pour forcer un import.

Pour recette autorisée seulement : `activateV1TrialCatalogue` active les24formations importées et conserve la formation historique ; `seedV1TrialSessions` crée trois dates futures explicitement fictives et fermées (Divalto en ligne sans lien capacité1, Dimo présentiel capacité3, MoovApps en ligne capacité12 avec lien fictif). Examiner puis ouvrir volontairement les dates nécessaires ; ces exemples ne sont jamais des dates client.

Après le candidat initial du30octobre, `repairV1TrialCellTypes` répare les seules cases connues des24formations importées et des trois sessions fictives dont le format texte avait produit les chaînes `true`/`false`. Il conserve le choix vrai/faux, l’historique et les budgets ; une autre valeur invalide reste signalée sans conversion. Les nouveaux writers appliquent les formats natifs avant écriture (cases booléennes, nombres numériques, textes inertes). Relire les types réels et les24offres publiques après cette réparation ; ne pas appliquer une conversion générale aux données historiques.

## Gérer les formations et les dates

Dans `Formations`, modifier les champs métier et activer volontairement après validation. Les codes restent stables après tri/renommage. Prix vide : Tarif à confirmer et aucune nouvelle inscription ; zéro numérique est distinct du vide. Formateurs reste texte libre privé. Dans `Paramètres`, ajouter/renommer les logiciels sans modifier leur ID stable ; listes `ID — Libellé`. Les en-têtes font autorité même déplacés ; absent/dupliqué bloque la configuration.

Dans `Disponibilités`, choisir formation par code — titre, saisir date, heures, capacité entière positive, mode et adresse présentielle ou lien visio privé facultatif. La capacité source est un préremplissage, jamais un plafond huit ni une liaison dynamique. Nouvelle date fermée, ouverture volontaire après diagnostics. Fuseau Toronto ; heures locales inexistantes/ambiguës rejetées. Dès le début, plus de nouvelle admission.

Ouverte avec place : visible ; pleine : Complet ; fermée avec confirmé : Inscriptions terminées ; fermée sans confirmé : masquée. Formation active sans date : Dates à venir. Capacité sous les confirmés : diagnostic et admissions bloquées, aucune annulation automatique. Les protections avertissent des modifications sensibles sans bloquer le propriétaire ni rendre ses éditions atomiques.

## Actualisation et mesures

`reconcileTrial` est le service commun pour saisie, collage, import et secours. Un script n’émet pas automatiquement onEdit : l’import l’appelle explicitement. IDs/listes/diagnostics/calculs sont réparés sans courriel et le fingerprint privé évite les écritures inchangées. `installV1TrialTriggers` pose onEdit et secours nominal cinq minutes ; relever fréquence réelle et remettre TEST au repos après mesure bornée.

Le site relit catalogue/calendriers au plus toutes les30secondes et au focus ; aucun watcher de formulaire. Objectif normal<120s ; événement manqué repris au secours cinq minutes nominal, sans garantie lors d’une panne Google. `measureV1TrialUnchanged` relève douze passages inchangés sans mail. Compléter par dix éditions espacées, collage, import/rejeu et événement manqué ; mesurer chaque délai, maximum, durée, attente verrou, volumes et quota. Une moyenne seule ne suffit pas. Extrapoler conservativement288secours/jour +100éditions/jour vers le budget initial≤45min/jour, distinct d’une observation24h. Charges synthétiques d’abord locales ; aucune rafale réelle d’emails ni quota volontairement épuisé.

## Annuler, reprogrammer et suivre les courriels

Annuler dans `Inscriptions` en changeant `statut` de `confirmee` à `annulee`, garder ligne/ID. Une place libérée une seule fois ; l’ancienne demande reste annulée au replay. Réinscription : nouvelle demande/ligne éligible. Ne pas supprimer pour annuler.

Reprogrammer : fermer → modifier la même ligne → prévenir dans Gmail → rouvrir si souhaité. Garder ID, inscrits et instantanés. Aucun avis automatique de modification/annulation ou premier lien visio différé. Le verrou sérialise les scripts ; une demande déjà admise peut terminer après fermeture humaine, les suivantes sont refusées.

Confirmation participant avec ICS puis avis Tema, à partir des instantanés. Sans lien en ligne, annoncer sa transmission manuelle avant formation. UID ICS stable et instants UTC. États PENDING/SENDING/SENT/FAILED/UNKNOWN/BLOCKED/SUPPRESSED distincts de la place. Échec participant : avis Tema si possible ; sinon trace privée, sans troisième alerte ou renvoi. Annulation avant engagement supprime le message non envoyé ; conditions changées le bloquent. Un message déjà engagé ne peut être retiré atomiquement. Vérifier Gmail et avis de non-distribution avant suivi manuel.

## Export et nettoyage manuel

Téléchargement natif du classeur privé, procédure éprouvée en TEST :

1. Ouvrir le classeur autorisé dans Google Sheets avec le compte de gestion et vérifier son titre/environnement.
2. Choisir **Fichier → Télécharger → Microsoft Excel (.xlsx)** (interface anglaise : **File → Download → Microsoft Excel (.xlsx)**). Aucun script ni journal d’exécution n’est nécessaire.
3. Enregistrer le fichier dans un dossier privé contrôlé, hors dépôt et dossier public partagé ; vérifier le fichier réellement téléchargé et son extension `.xlsx`.
4. Ouvrir ce fichier avec l’application tableur autorisée. Vérifier les onglets, IDs, statuts, capacités et textes fictifs `=`, `+`, `-`, `@` ; les calculs sont des valeurs et ne dépendent pas de fonctions Google. Le contrôle réalisé dans Numbers ne constitue pas une ouverture dans Excel ; cette dernière garde sa preuve propre.
5. Conserver ou supprimer la copie selon la politique et traiter aussi les téléchargements/copies intermédiaires. Ne jamais commiter, publier ou journaliser les tables nominatives.

L’outil hors ligne `node app/scripts/export-xlsx.cjs /PRIVE/tables.json /PRIVE/inscriptions.xlsx` reste utilisable uniquement lorsqu’un JSON privé `{tables:{nom:[[en-têtes],…lignes]}}` est déjà fourni à l’administrateur. Il ne récupère aucune donnée Google et n’expose aucune route HTTP d’administration ou de téléchargement. Il refuse les chemins physiques du dépôt, y compris via des liens symboliques, et produit des cellules typées sans formule/relation externe. Aucun retour Apps Script contenant les tables ne doit être imprimé dans les logs pour alimenter cet outil.

Conservation retenue12mois, nettoyage manuel Emma, aucune purge automatique. Avant ouverture, Tema valide point de départ, exceptions, responsable légal et texte/accord dédiés. Pour fictif, appeler dans l’éditeur privé `removeTrialCoordinates_(id, annulerLaPlace)` après décision explicite sur la place. Une réservation confirmée pour une session future refuse le retrait si la place doit rester conservée : son courriel reste nécessaire au contrôle des doublons. L’annulation explicite autorise le retrait ; le nettoyage d’une session passée ou d’une inscription déjà annulée reste possible. IDs, cohorte, empreinte et instantanés sont conservés pour la cohérence et la reprise.

Le nettoyage supprime les messages non engagés. **Un message déjà réclamé par une tentative ou en cours d’envoi ne peut pas être rappelé : il peut encore être transmis après le retrait des coordonnées.** Son état reste incertain et aucune garantie d’empêcher cette transmission n’est donnée. Vérifier compteur de places, replay et états privés ; traiter aussi la copie Gmail éventuelle. Ne pas utiliser l’effacement comme annulation implicite ni réactiver une tentative.

Traiter copies/exports, avis Gmail, transferts et ICS contrôlés par Tema ; tracer la date de nettoyage sans copie nominative inutile. Emma n’est pas désignée responsable légale par défaut. Le brouillon dédié de politique et l’accord de test restent à valider par Tema avant ouverture réelle.

## Retour compatible et remise

Remettre le couple site/script/HEAD compatible identifié ; comparer comptes et budget puis rejouer une demande fictive connue. Ne restaurer aucune donnée, ne supprimer aucun compteur/journal. Une future configuration Métier vérifie destination fixe, seul écrivain, destinataires, absence de panne/reset publics et garde TEST préservée.

La recette distingue lecture anonyme, intégrité, MailApp, réception et import agenda réel. Outlook/Calendrier Apple restent Sofiane ; téléphone, Safari réel et lecteur d’écran gardent leur preuve propre. Ronde d’ajustements et séance30minutes doivent être réalisées et acceptées ; publication/démo/bascule FTP gardent leur GO propre.
