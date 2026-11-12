# Contrôles techniques et étapes de validation — Tema V1

28 octobre 2026. Compagnon d’architecture préparé dans le cadre du GO de consolidation documentaire. Les seuils ci-dessous sont des paramètres et objectifs d’ingénierie initiaux à éprouver ; ils n’ajoutent ni limite commerciale à cinquante inscriptions, ni service payant, ni garantie fournisseur. Aucun contrôle futur n’est déclaré exécuté par ce document.

## Ce que clôture l’architecture

L’architecture peut être cohérente et suffisamment fixée pour la revue UX/UI sans que son implémentation complète existe. Ses contrats, responsabilités, configurations et preuves requises sont définis ici et dans les11AD. Les preuves TEM-6 restent historiques :4ET entièrement PASS,8partiels ; les61tests Node/28parcours Chromium du prototype ne prouvent pas les nouvelles règles V1 encore non codées.

| Étape | Résultat requis | Ce qui reste interdit ou non accepté |
|---|---|---|
| G0 — Dossier → UX/UI | Architecture/Spec réconciliées, lint et revues documentaires réussis, décisions/prérequis identifiés | Aucun GO de code ni nouvelle mesure Google déduit ; passer aux maquettes ne transforme aucun ET en PASS |
| G1 — Démarrage d’un lot | UX du lot et contrats concernés suffisamment définis ; GO principal explicite portant sur les stories choisies ; suite locale connue et ressources isolées ; CI à câbler dès le premier push applicatif | Pas de mutation/déploiement Métier sans son autorisation ; pas de nouveau starter imposé ni montée de version globale automatique |
| G2 — Exposition du parcours concerné | Contrôles ET-01à05/08/10/11 pertinents sur le candidat : lecture sans compte, transport lisible, concurrence/reprise/refus, confidentialité, supports ; cadre anti-abus/charge vérifié pour les règles changées | Pas de parcours d’inscription accepté sur réponse opaque, quota supposé ou simple simulation ; défaut d’intégrité/réception non présenté comme résolu |
| G3 — Recette de la solution entière | Candidat de recette publié après GO de déploiement précis, identifié par site/script/HEAD/schéma ; recette complète, vraies réceptions ET-06 et agendas ET-07 | Outlook/Apple sont contrôlés par Sofiane ici, conformément à son report explicite ; aucun contrôle indisponible assimilé à réussite |
| G4 — Remise / ouverture publique | Tous contrôles requis de la cible PASS, ou dérogation humaine explicite nommant le contrôle et son effet ; prix/identité/textes/accessibilité/accès et cible acceptés | Une limite mentionnée dans un rapport ne suffit pas à fermer une recette ; fusion, publication et ouverture restent des GO distincts |

Dans ces étapes, « exposition » désigne l’ouverture aux utilisateurs hors du périmètre de test contrôlé. Un déploiement TEST ou une prévisualisation autorisés peuvent précéder les contrôles dont ils sont le support ; leur URL accessible ne constitue ni acceptation ni livraison.

Les demandes complémentaires des ET sont réalisées avec la fonctionnalité à tester, avant son exposition/acceptation, puis reprises en recette. Cela fixe leur ordre d’exécution sans accorder un GO principal ni une dérogation générale aux prérequis. La revue UX documentaire n’exige pas de refaire l’essai réel maintenant. Le premier lot proposé reste1.1–1.3 ; son GO n’est pas encore donné. Les autres étapes de définition restent successives : G0 puis revue UX/UI, validation globale du plan, GO de code.

## Référence des preuves actuelles

- Code d’essai : `app/web`, `app/apps-script`, `app/tests` ; destination TEST fixe et protections toujours présentes. `app/apps-script/appsscript.json` : V8 et Toronto, Sheets/MailApp/déclencheurs, aucune lecture Gmail.
- Runtime local observé le28octobre : Node22.9.0 et npm11.7.0 ; Playwright1.64.1 dans le lockfile. Ces chiffres décrivent l’outillage existant et testé, pas les dernières versions recommandées. Aucun Vite/clasp installé ni nouveau runtime lié par la clôture.
- Dernière relance produit connue28octobre avant push :61Node, build et28Playwright réussis, Google/réseau simulés ; pas de CI produit exécutée.
- Quota92 au26octobre17:17:39Toronto et réglage TEST12h sont des observations datées, pas une lecture du compte aujourd’hui. Aucun nouveau relevé de quota, installation de trigger ou envoi effectué ici.

## Tarif à confirmer : contrat commun

Le prix numérique absent (`null` après normalisation du vide) ne vaut jamais zéro. Une formation active reste consultable avec « Tarif à confirmer » ; nouvelle inscription désactivée. Un zéro explicitement numérique est distinct d’une absence, sans introduire de formation gratuite dans le catalogue fourni.

Les sessions publiques ajoutent deux champs dérivés : `registration_enabled:boolean` et `registration_block_reason:null|"price_unconfirmed"`. `registration_enabled` vaut `status === "open"` ET prix numérique renseigné valide ; le motif vaut `price_unconfirmed` uniquement pour une session `open` sans prix, sinon `null`. Aucun nouveau champ d’approbation tarifaire à saisir par Tema.

Les états `open/full/closed` et les règles de visibilité restent ceux de l’ouverture/capacité : fermeture manuelle visible avec confirmé prioritaire, pleine ensuite ; le prix absent ne masque pas à lui seul une date future valide. La date reste consultable sans bouton actif. Le tri catalogue utilise trois groupes exhaustifs : au moins une date visible éligible ; au moins une date visible mais aucune éligible (y compris open sans prix) ; aucune date visible. Ordre source à égalité. La recherche de la prochaine date réservable utilise `registration_enabled`, pas seulement `status`.

Nouvelle commande sans prix : `CLOSED`, `recording_status=not_recorded`, `message_key=price_unconfirmed`, `errors=[{field:"prix",code:"PRICE_UNCONFIRMED"}]`, aucune ligne/mail. La recherche du replay/conflit précède ce contrôle : retirer le prix après une inscription ne crée ni annulation ni nouvelle inscription, son reçu conserve l’état courant et les instantanés acceptés. Les messages non engagés gardent la vérification de révision prévue ; les courriels déjà envoyés ne sont pas réécrits. Test requis dans projection, fiche, formulaire et serveur ; le prototype actuel ne réalise pas encore cette extension de contrat V1.

## Rafales : garde minimale partagée

Une protection courte serveur est nécessaire pour ne pas considérer qu’un honeypot suffit. Ce n’est pas une défense DDoS ou une authentification. Le navigateur ne fournit pas une identité IP fiable à Apps Script.

- Valeurs techniques initiales : **3nouvellescommandes/60s par empreinte du courriel normalisé et30/60s pour le projet**, dans des fenêtres fixes UTC `floor(epoch_ms/60000)`. Les compteurs des nouvelles tentatives identifiables incluent leurs refus métier ; le traitement d’un payload mal formé reste borné et n’autorise aucun effet métier. L’identité d’un courriel n’est pas une preuve de propriété : une nuisance ciblée sur ce courriel reste une limite à documenter.
- Recherche du replay/conflit d’une demande identifiée d’abord ; un replay existant restitue le reçu, sans consommer de nouvelle place ou de budget d’envoi. Il n’est pas refusé par le limiteur des nouvelles commandes.
- Décision/écriture du compteur privée et atomique sous le verrou du projet ; ne pas faire autorité avec un compteur client ou un cache évictable seul. État borné, expirant et sans coordonnées en clair. Implémentation de départ possible : une propriété du projet contenant fenêtre, compteur global et map de hash plafonnée par la limite globale ; renouvellement de fenêtre remplace la map. Garder ce stockage et ses limites vérifiables sans nouvelle base.
- Refus pour commande nouvelle identifiée : `INVALID`, `not_recorded`, `message_key=rate_limited`, `errors=[{field:"anti_spam",code:"RATE_LIMITED"}]` ; aucune ligne/place/mail. Message clair d’attente, champs conservés ; le résultat certain sans enregistrement suit le contrat existant de correction/nouvelle demande, sans refaire aveuglément une demande dont le résultat serait inconnu.
- Compteur indisponible : `UNAVAILABLE/unknown`, aucune nouvelle mutation d’inscription ; conserver clé/contenu pour reprise. Aucune promesse anti-abus parfaite ; si les essais montrent une insuffisance, corriger le mécanisme dans ce cadre avant exposition, et revenir à Sofiane seulement pour une modification de coût/parcours/périmètre.

Essais locaux déterministes requis :4commandes même hash dans la même fenêtre (4e refusée),31identités différentes même fenêtre (31e refusée), reprise après changement de fenêtre, replay existant quand budget atteint, compteur indisponible, concurrence contrôlée. Observer0ligne/0mail supplémentaires pour les refus ; les emails sont simulés dans ces rafales. Le passage de frontière entre fenêtres fixes est explicitement permis, pas présenté comme fenêtre glissante. Les seuils sont des paramètres de protection à ajuster sur les mesures, pas une règle commerciale d’inscription quotidienne.

## Profil de mesure pour actualisation et quotas

Deux niveaux distincts, aucune donnée réelle de participant :

1. **Ressources de l’essai limité existant** : une formation/deux dates fictives seulement, sauf autorisation future d’un périmètre plus large. Mesurer édition→traitement→projection→affichage, collage, appel d’import, événement volontairement non traité et réparation5min, ainsi que l’absence de mail depuis ces traitements.
2. **Jeu de charge V1 proposé** :24formations,48dates synthétiques et1000inscriptions fictives ; d’abord local/simulé. Pour Google réel, préparer un environnement isolé et autoriser le périmètre d’écriture avant exécution. Ce volume est un cas de dimensionnement technique, pas une prévision fournie par Tema ni une extension silencieuse du GO TEM-6.

Séquence bornée prévue :12passages inchangés pour caractériser leur coût ;10éditions normales espacées, un collage multilignes et un import rejoué ; un événement manqué pour observer le passage de secours. Relever durées par étape et maximum, attente du verrou, taille des données, état des triggers et quota de la journée. Chaque édition normale de la séquence doit apparaître en moins120s ; une panne/manquement suit l’exception5min approuvée, sans garantie d’exécution à la seconde pendant incident Google. Pas de moyenne seule masquant une édition au-delà de la cible.

Budget d’acceptation d’ingénierie initial : extrapolation sur288secours/jour +100éditions/jour de référence **≤45min/jour de déclencheurs sur le compte**, en documentant les autres traitements connus du compte ; les45min restantes du plafond documentaire90min servent de marge. L’estimation emploie des durées mesurées conservatrices, et reste une extrapolation tant qu’une observation24h n’existe pas. L’hypothèse100éditions/jour est une épreuve de charge, pas un engagement d’usage client.

Échec à ce budget : ne pas déclarer le mécanisme validé ; optimiser le traitement ciblé/les écritures et remesurer. Une modification de la cible ou un coût nouveau exige l’arbitrage de Sofiane. Après tout essai réel autorisé, relever le réglage final et remettre le TEST au repos. Aucun mail de rafale ni quota volontairement épuisé.

Le budget de courriels est indépendant : vérifier le quota réellement disponible à chaque tentative et tracer l’échec/incertitude. Un quota épuisé après réservation ne libère pas la place et ne déclenche aucune relance applicative ; l’avis Tema peut échouer aussi. Pas de compteur métier «50places par jour» ajouté.

## Import, export et promotion

**Import :** lire le manifeste source et préparer le mapping stable source→code destination ; première exécution sur destination vide ou journal de correspondance privé, sans identité déduite du seul titre courant. Réexécution partielle/complète reprend les correspondances et les codes, sans doublon. Une modification de Tema divergente n’est pas écrasée silencieusement : diagnostic et résolution explicite. Les tables déjà existantes ne sont ni réinitialisées ni restaurées pour rejouer. Tests d’interruption après quelques lignes, relance complète, renommage puis relance, compteur supérieur au maximum et doublon/ambiguïté isolés. Le mécanisme de reprise doit être durable et privé, sans donnée personnelle ou sauvegarde brute versionnée.

**Export :** le format exporté doit préserver les textes libres comme textes à l’ouverture dans Excel, y compris chaînes commençant par `=`, `+`, `-` et `@`. Préférer l’export tableur typé du classeur ; ne pas annoncer un CSV sans traitement de l’injection de formule. Les identifiants, statuts et places restent exploitables sans fonctions Google. Contrôle en fichier réel sur données fictives ; pas de promesse déduite de l’inertie d’une cellule Sheets seule.

**Promotion de configuration :** avant activation d’un moteur Métier, contrôler ensemble : destination et environnement fixes serveur, un seul projet écrivain, destinataire/contact validés, aucune panne de test active ni commande publique de reset/admin, aucune liste de participants réels exposée ; les protections et plafonds de TEST restent attachés à TEST. Le candidat métier n’est pas obtenu en retirant globalement la garde du prototype. Relire manifeste/permissions, HEAD et version publique, build/site et schéma compatibles avant exposition. Un réglage d’URL du navigateur ne choisit jamais le Sheet ni son mode.

**Navigation portable :** les liens fiche/date/formulaire, l’accès direct, l’actualisation et le retour doivent fonctionner sans réécriture serveur, fonction Vercel ou dépendance FTP particulière. Une navigation avec vues/paramètres sur un fichier statique est une option conforme ; choix technique à la réalisation. Aucune coordonnée ou lien visio dans l’URL ; état transitoire de saisie gardé dans le parcours, pas de garantie après fermeture navigateur.

**Preview et clôture :** publier un candidat complet de recette après son GO précis avant les tests distants G3 ;5.4 ne doit pas être le premier déploiement permettant5.3. Pour les tâches code : Review après réalisation/revue/contrôles requis ; Done après acceptation et intégration dans la branche de référence autorisée, envisagée `main` mais toujours soumise à GO de fusion. Recette : candidat Vercel précisément identifié et accepté. Remise : guide, ronde d’ajustements et séance acceptés sur la cible choisie ; ouverture publique/bascule finale sous responsabilité Sofiane distinctes. Une PR brouillon n’est pas une acceptation.

## Sources vérifiées le28octobre2026

- [Quotas Google](https://developers.google.com/apps-script/guides/services/quotas) : compte grand public100destinataires/jour,90min/jour de déclencheurs, limites partagées par utilisateur et sujettes à évolution ; ces limites ne mesurent pas le quota restant du compte Tema.
- [Déclencheurs installables](https://developers.google.com/apps-script/guides/triggers/installable) : une écriture script/API ne déclenche pas automatiquement onEdit ; traitements contrôlés doivent appeler le service commun.
- [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app) : envoi distinct de réception, quota restant en destinataires, pas de lecture de Gmail. La disponibilité du quota à un instant ne réserve pas celui des autres exécutions.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby) : usage personnel non commercial ; le choix provisoire du compte est conservé, offre à résoudre avant déploiement client concerné sans achat automatique.

Les paramètres3/30et45min ci-dessus sont des choix techniques de préparation déléguée, non des limites annoncées par ces fournisseurs. Leur acceptation technique se fait sur mesures/tests futurs ; le dossier ne revendique aucun PASS nouveau.
