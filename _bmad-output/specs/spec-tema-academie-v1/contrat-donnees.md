# Contrat de données — Tema Académie V1

**Préparé le 20 octobre, réconcilié le 26 octobre 2026.** Règles fonctionnelles approuvées, schéma et mécanismes techniques à valider. Convention commune de CAP-1 à CAP-7, indépendante du transport A/B/C. Les noms et types ci-dessous sont le contrat logique ; les octets d’un formulaire ou d’un appel RPC sont décodés vers ce même objet.

## Source, formats et droits

Le classeur Google est la source métier. Onglets `Formations`, `Disponibilités`, `Inscriptions`, `Paramètres` ; une ligne par enregistrement, en-têtes en première ligne. Une colonne déplacée conserve son sens. Un en-tête manquant ou dupliqué produit une erreur de configuration, jamais une interprétation par position.

Identifiant de formation : code textuel lisible, unique et attribué automatiquement après saisie des champs nécessaires, puis protégé et stable même si le titre change. Convention technique proposée AD-3 : préfixe logiciel `DIV`/`DIMO`/`MOOV`, trois premiers caractères alphanumériques du titre après décomposition NFKD/suppression des diacritiques, majuscules et filtrage A-Z/0-9, compteur global sur au moins trois chiffres (`DIV-ERG-001`). Titre sans caractère utilisable : diagnostic, pas de code deviné. Nouveau logiciel : quatre premiers alphanumériques de son identifiant stable Paramètres ; renommage sans changer cet identifiant. Générateur unique sous verrou : réserver un numéro serveur supérieur au maximum déjà attribué avant écriture, trous permis, réutilisation interdite. Mécanisme à éprouver ; aucun code réel attribué. La sélection dans Disponibilités présente code et titre, mais référence toujours le code stable. Cette décision remplace le préfixe `F-` suivi d’un UUID proposé initialement. Les autres IDs gardent les préfixes `C-` et `I-` suivis d’un UUID ; `request_id` est un UUID de demande distinct de l’inscription. Un ID absent est attribué une seule fois, un doublon est signalé et une ligne ambiguë n’est pas publiée. Le titre, le numéro et la position d’une ligne ne sont jamais une clé.

L’attribution doit couvrir saisie, collage de lignes et import par script, sans supposer que chaque modification déclenche onEdit. Les parcours d’initialisation et de contrôle réutilisent le même mécanisme ; aucune réattribution d’un code existant lors d’un tri, changement de titre ou rejeu. Une nouvelle formation est inactive par défaut. Le classeur métier est pérenne ; les tests répétitifs/pannes utilisent des ressources fictives distinctes selon strategie-tests.md.

Dates de session : `YYYY-MM-DD`, heures `HH:mm`, fuseau `America/Toronto`. Le script dérive les instants UTC et rejette une heure locale inexistante ou ambiguë au changement d'heure. Horodatages : ISO 8601 UTC avec `Z`. Prix numérique nullable avec qualificatif textuel ; une valeur absente ne devient jamais zéro.

Tema édite les colonnes métier autorisées ; en-têtes, IDs, instantanés et calculs sont protégés. Ces protections limitent les accidents ; le propriétaire et les éditeurs restent capables de modifier le document. Aucune clé Google ou donnée d'inscrit n'est distribuée dans le site. Gestion V1 via le compte Google `temaacademie@gmail.com`, pour Gmail et le Sheet privé ; Tema décide qui dispose de cet accès. Aucun compte gestionnaire ou système de rôles propre au site. Droits effectifs et récupération à vérifier avant usage réel.

## Commande manuelle des inscriptions

Fermeture automatique au démarrage et commande ouverte/fermée du gestionnaire confirmées le 21 octobre. Colonne « Inscriptions ouvertes » (nom technique `inscriptions_ouvertes`, case à cocher, décochée par défaut pour une nouvelle date) par ligne de Disponibilités, donc par date/session ; portée confirmée par Sofiane. Distincte de `actif` dans Formations ; aucun second booléen de publication dans Disponibilités : fermer les inscriptions d’une date ne désactive ni la formation ni les autres dates.

L’ouverture effective doit aussi respecter activité de la formation, validité, heure de début et places ; un Oui manuel ne force pas une session passée ou complète. Le service relit la commande aux derniers contrôles frais juste avant écriture, point d’admission sous verrou, et refuse CLOSED si fermée. Fermeture manuelle postérieure : cette demande peut terminer avec les instantanés acceptés, les suivantes sont refusées. Formulaire ouvert/clic sans contrôle ne réserve rien ; confirmation après écriture établie, résultat incertain repris même demande. Début horaire vérifié à l’admission, sans tolérance supplémentaire ; le verrou ne bloque pas les éditions humaines. Les inscriptions déjà confirmées et leurs messages restent inchangés. Visibilité confirmée le 24 octobre : date future fermée avec au moins un inscrit confirmé visible avec « Inscriptions terminées » ; sans inscrit confirmé, date absente des deux calendriers publics. Les lignes annulées restent dans l’historique et ne comptent pas pour cette visibilité. La formation active reste au catalogue.

## Formations

| En-tête proposé | Type et règle | Visibilité |
|---|---|---|
| `id` | Code lisible, unique, automatique et stable ; colonne protégée | Public |
| `logiciel` | Liste déroulante native contenant identifiant et nom (`DIV — Divalto`, `DIMO — Dimo`, `MOOV — MoovApps`), administrable dans Paramètres ; les trois logiciels confirmés sont conservés | Public |
| `titre` | Texte non vide | Public |
| `description` | Résumé issu du contenu, sans promesse inventée | Public |
| `prerequis`, `contenu`, `resultat` | Textes conservés du catalogue | Public |
| `duree` | Libellé fourni : demi-journée ou journée | Public |
| `prix`, `prix_qualificatif` | Nombre nullable, 450/850 dans la source ; affichage validé « À partir de [montant] $ CAD par participant, taxes en sus » | Public |
| `places_par_defaut` | Entier positif nullable, capacité source indicative pour préremplir une nouvelle date ; jamais un plafond ou une liaison dynamique vers des dates existantes | Interne |
| `formateurs` | Texte libre confirmé pour V1 ; codes source conservés sans interpréter CB/MMI, aucun nom inventé | Interne |
| `actif` | Inactive par défaut pour une nouvelle formation, activation volontaire confirmée ; Non retire la formation et ses dates de l’offre publique et empêche les nouvelles inscriptions, sans suppression de données | Filtre de publication |

Import : 18 Divalto (`Sheet1!A6:I23`), quatre Dimo et deux MoovApps (`A28:I33`). Préserver les textes et leur sens ; corriger seulement les espaces parasites. Écarter titres de section, en-têtes répétés et note `A50`. Les neuf entrées `A40:C48` restent une référence hors formations inscriptibles. Ne créer aucune session depuis « à venir » ou les exemples du PDF.

Provenance tarifaire vérifiée en lecture seule le 21 octobre : `Sheet1!E6` contient « À partir de 450 $ » ; `E7:E23` et `E28:E33` contiennent « À partir de 850 $ ». Les 24 formations portent ce qualificatif. Ce sont les textes des cellules, pas un format ajouté à l’export ; l’empreinte du classeur correspond au manifeste original. La raison d’une variation du prix n’est pas précisée par ces cellules. Sofiane valide le 23 octobre l’affichage « À partir de [montant] $ CAD par participant, taxes en sus » ; Tema doit encore confirmer les montants finaux avant publication.

## Références des logiciels et des formations

Dans Paramètres, chaque logiciel a `id` stable unique et `label` affiché, initialement `DIV`/Divalto, `DIMO`/Dimo, `MOOV`/MoovApps. Pour un ajout : générer une fois l’ID depuis le libellé normalisé NFKD, sans diacritiques, majuscules, A-Z/0-9 ; collision résolue par suffixe numérique croissant sous verrou. Un libellé renommé ne réattribue jamais l’ID ; label vide/dupliqué ou ID incohérent produit un diagnostic.

Google Sheets n’associe pas implicitement un libellé affiché à une valeur cachée. Les listes natives contiennent donc `ID — Libellé` : logiciel dans Formations, code formation/titre dans Disponibilités. Le service extrait la partie avant le premier séparateur exact ` — ` et vérifie son existence unique ; le suffixe est un affichage rafraîchissable, jamais une clé. Import initial : résoudre seulement les noms source uniques puis écrire ce choix complet ; ambiguïté isolée. Les valeurs projetées sont `formations[].logiciel = softwares[].id` et `sessions[].formation = formations[].id`. Changer un libellé met à jour les choix et affichages sans casser les références existantes.

## Disponibilités

| En-tête proposé | Type et règle | Visibilité |
|---|---|---|
| `id_cohorte`, `formation` | Clé stable et référence à `Formations.id` | Public |
| `date`, `heure_debut`, `heure_fin` | Même journée ; fin strictement après début | Public |
| `places_max` | Capacité totale, entier positif saisi/modifié par Tema par date/session ; valeur du catalogue utilisable comme préremplissage, sans plafond fixé à huit | Public |
| `mode` | `presentiel` ou `en_ligne`, obligatoire avant publication | Public |
| `lieu_ou_lien` | Adresse obligatoire en présentiel ; URL de session en ligne facultative au lancement des inscriptions, valide si renseignée | Adresse publique si présentiel ; lien visio non public, utilisé dans la confirmation s’il est disponible |
| `inscriptions_ouvertes` | Case à cocher par date/session, décochée par défaut ; décocher ferme les nouvelles réservations pour cette seule date | `closed` / Inscriptions terminées si des inscrits confirmés restent ; sinon date masquée |
| `places_restantes` | Calcul protégé : max(0, capacité − inscriptions confirmées) | Public |
| `etat_validation` | Diagnostic de champ/identifiant manquant ou incohérent | Interne |

Le champ `publie` proposé est retiré : visibilité calculée selon activité, validité, futur, ouverture et confirmés, sans seconde commande humaine. Calculs script ; export Excel tabulaire, sans dépendance QUERY/ARRAYFORMULA/IMPORTRANGE. Les états publics sont calculés ; le gestionnaire ne saisit pas « Complet » ou « Inscriptions terminées ».

`session_revision` est une valeur opaque calculée côté service sur une sérialisation stable de l'ID cohorte, ID formation, titre, durée, prix/qualificatif, date, heures, mode et adresse du présentiel. Elle ne dépend ni du compteur, ni de l'ordre des lignes, ni des tentatives d'envoi. Le lien de visioconférence est une information pratique privée, distincte des conditions publiques de réservation ; sa première fourniture ultérieure ne change pas cette révision. L’adresse du présentiel est publique. Toute modification de ces conditions invalide un formulaire encore non enregistré ; le service retourne `SESSION_CHANGED` sans réserver. L'algorithme commun et son jeu d'exemples sont versionnés avec le schéma ; aucun adaptateur ne calcule sa propre révision.

Une session en ligne sans lien reste valide et réservable si ses autres conditions sont satisfaites. La confirmation et l’invitation indiquent « En ligne — lien à venir » et annoncent un envoi dans les jours précédant la formation ; aucune URL vide, inventée ou cassée n’est affichée. L’avis Tema signale le lien à communiquer. Ajouter ensuite le premier lien au Sheet ne réactive aucune inscription et ne déclenche pas à lui seul un envoi ou une mise à jour d’agenda ; Tema transmet manuellement le lien aux inscrits avant la formation (Q-7 résolue). Les instantanés d’inscription sont conservés ; Tema vérifie les informations pratiques actuelles avant tout contact manuel dans Gmail.

Une capacité abaissée sous le nombre de confirmés ferme les nouvelles inscriptions et signale l'écart ; elle n'annule personne. Modifier date/heure/lieu conserve la clé, les inscriptions et leurs instantanés, sans réinscription. Procédure humaine validée le 24 octobre : fermer les nouvelles inscriptions, modifier la même ligne, prévenir les inscrits concernés depuis Gmail, puis réouvrir si souhaité selon date/capacité ; voir les [règles communes](regles-et-acceptation.md). AD-4/8 proposent les contrôles à l’admission et un même validateur/générateur pour édition/import/réparation périodique candidate minute, sans courriels depuis cette réparation. Projection publique actuelle non mutante et sans cache serveur initial ; catalogue/calendriers visibles relus au plus toutes les trente secondes et au focus, aucun watcher du formulaire. Cible <2 minutes et quota/runtime à vérifier en ET-09 ; fermeture manuelle ne prouve pas l’atomicité.

## Inscriptions

| Groupe de champs proposés | Règle |
|---|---|
| `id_inscription`, `request_id`, `payload_fingerprint` | Protégés ; même demande/même contenu = même inscription ; même clé/contenu différent = conflit |
| `horodatage`, `id_cohorte`, `session_revision`, `statut` | UTC, cohorte stable, conditions acceptées ; statut `confirmee` ou `annulee` |
| `prenom`, `nom`, `entreprise`, `courriel`, `telephone` | Textes ; prénom, nom, entreprise et courriel obligatoires, téléphone facultatif (validés le 21 octobre) ; normalisation définie ci-dessous |
| `consentement_loi25`, `consentement_horodatage`, `politique_version` | Accord explicite, instant serveur et version présentée ; aucun accord marketing implicite |
| `formation_snapshot`, `debut_snapshot`, `fin_snapshot`, `lieu_snapshot` | Valeurs protégées à la réservation ; non réécrites lors d'une replanification |
| `mail_participant_etat`, `mail_tema_etat` | États séparés : `PENDING`, `SENDING`, `SENT`, `FAILED`, `UNKNOWN`, `BLOCKED`, `SUPPRESSED` |
| `mail_*_attempt_id`, `mail_*_attempt_at`, `mail_*_sent_at`, `mail_*_error_code` | Suivi minimal protégé ; aucun détail technique ou corps d'email dans l'API publique |

Format privé commun des instantanés : cellules JSON textuelles pour les objets, mêmes clés pour le producteur Inscription et les consommateurs Mail/ICS. `formation_snapshot` = `{id: string, logiciel_id: string, titre: string, duree: string, prix: number|null, prix_qualificatif: string}` ; `debut_snapshot`/`fin_snapshot` = ISO UTC avec `Z` ; `lieu_snapshot` = `{mode: "presentiel"|"en_ligne", adresse_presentiel: string|null, lien_visio: string|null}`. En présentiel, adresse obligatoire et lien null ; en ligne, adresse null et lien facultatif. Valeurs figées à l’admission ; l’envoi initial utilise ces instantanés après ses contrôles d’éligibilité, pas un programme ou horaire relu à la place. Ces objets ne sont jamais projetés dans le reçu public. Le premier lien ajouté ensuite reste un suivi manuel, sans réécriture d’historique.

Le statut d’inscription est la référence de l’annulation : Tema passe la ligne de `confirmee` à `annulee`, sans la supprimer. Le calcul de capacité et le contrôle des doublons actifs excluent alors cette ligne. Une réinscription autorisée crée un nouvel ID et une nouvelle ligne ; rejouer l’ancienne demande rend toujours son statut annulé, sans réactivation.

`BLOCKED` empêche l’envoi initial participant lorsque ses conditions sont devenues différentes ; Tema vérifie les conditions actuelles avant son suivi manuel. `SUPPRESSED` signifie que le message participant non envoyé ne doit plus l’être après annulation. Les envois réellement partis gardent leur trace. Le contrôle précède l’engagement MailApp ; un envoi déjà engagé ne peut être retiré atomiquement par une édition/annulation ultérieure, sans nouvel envoi automatique. Les états sont un suivi interne, sans commande de vérification/relance dans le Sheet ni délai de dix minutes à gérer. Le choix confirmé le 23 octobre conserve la place puis confie le suivi à Tema dans Gmail, sans nouvelle inscription.

Une seule tentative initiale de confirmation participant précède l’avis Tema. Si l’échec participant est détecté et que l’avis reste envoyable, cet avis indique le problème, l’inscription et la session à retrouver ; il remplit le rôle d’alerte demandé. Aucun troisième message ou renvoi récursif n’est prévu si l’avis Tema échoue. Le résultat de cet avis est suivi séparément, et un arrêt du traitement avant envoi laisse une trace de tentative/non-envoi au lieu d’une preuve de réception inventée.

Les erreurs d’appel détectables sont suivies dans le Sheet ; `SENT` signifie acceptation par le service d’envoi, sans garantie de réception. [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app) ne lit pas Gmail : les rejets ultérieurs, adresses inexistantes ou boîtes pleines peuvent générer un [avis de non-distribution](https://support.google.com/mail/answer/6596?hl=fr) à consulter manuellement, sans diagnostic automatique ajouté au Sheet. Les [quotas Apps Script](https://developers.google.com/apps-script/guides/services/quotas), vérifiés documentairement le 23 octobre, peuvent interrompre l’envoi. Une interruption au résultat incertain reste `UNKNOWN` ou `SENDING` non abouti ; Tema vérifie avant un éventuel contact manuel dans Gmail. L’absence de réception ne suffit pas à déclarer `FAILED`. Si le quota ou le traitement empêche aussi l’avis Tema, l’alerte n’est pas garantie : conserver le suivi privé dans le Sheet. Aucun canal externe de secours n’est ajouté.

Les textes libres restent inertes dans Sheet, HTML, email et agenda : aucune formule, balise exécutable ou injection d'en-tête. L'envoi retrouve la ligne par ID, même après tri/filtre. Une suppression de coordonnées suit la procédure validée par Tema : retrait/anonymisation, arrêt des futurs envois, décision explicite sur l'annulation et trace non nominative cohérente pour les places/reprises. Sofiane retient finalement 12 mois le 23 octobre, avec nettoyage manuel par Emma ; ce choix remplace l’orientation conditionnelle de 24 mois. Le départ après formation ou annulation, le besoin de conservation, les exceptions légales et les modalités effectives doivent être repris dans la politique à faire valider par Tema. Aucune purge automatique ajoutée. La procédure doit aussi traiter les copies, exports, avis courriel et transferts contrôlés par Tema ; les détails restent à valider.

Le nom d’entreprise est saisi librement et contrôlé manuellement par Tema (choix du 21 octobre). Aucun onglet Clients ni référence à un fichier clients n’est requis par ce choix. Le contrôle a lieu après confirmation automatique de l’inscription, sans approbation préalable ni nouveau statut d’attente. Une annulation éventuelle suit la procédure manuelle déjà définie.

## Paramètres et configuration technique

| Propriété | Source et usage |
|---|---|
| `courriel_avis_tema` | `Paramètres`, destinataire interne ; `temaacademie@gmail.com` validé pour les avis de nouvelles inscriptions, signalant aussi un échec détecté de la confirmation lorsque l’envoi reste possible |
| `courriel_contact` | `Paramètres`, public ; `temaacademie@gmail.com` validé pour les questions, annulations et changements des participants |
| `nom_expediteur` | `Paramètres`, configuration d’envoi ; nom proposé « Tema Académie » |
| `politique_url`, `politique_version` | Lien/version publiables d’un texte dédié aux inscriptions, à préparer puis faire valider par Tema avant ouverture réelle ; contenu non encore approuvé |
| Logiciels et couleurs | `Paramètres`, identifiant stable et libellé renommable ; liste publique sélectionnée ; couleurs d’interface issues de DESIGN.md, sans les présenter comme couleurs officielles des éditeurs |
| Sheet, environnement, URL publique du site | Propriétés serveur du projet ; jamais choisies par le visiteur |
| URLs de lecture/inscription | Configuration publique ; pas des secrets ni une authentification |
| Jetons Google/clasp | Stockage privé ; aucun fichier versionné ou variable publique Vite |

L’adresse publique de contact et le destinataire des avis gardent des paramètres distincts malgré leur valeur initiale commune. Un transfert de messagerie ultérieur reste possible hors du code produit ; aucune adresse de transfert n’est arrêtée et aucun transfert n’est configuré. Les essais utilisent les destinataires contrôlés du plan, sans envoi réel déduit de cette validation.

## Lecture publique — schéma logique V1

Réponse : un objet avec `schema_version` (entier `1`), `generated_at` (ISO UTC), `timezone` (`America/Toronto`), `contact` (`{courriel: string}`), `policy` (`{url: string, version: string}`), `softwares` (tableau), `formations` (tableau), `sessions` (tableau). Aucune inscription et aucun champ inconnu du Sheet ne sont recopiés.

- `softwares[]` : `{id: string, label: string, color: string|null}` ; couleur d’interface définie dans DESIGN.md ou `null`, jamais seul indicateur.
- `formations[]` : `{id, logiciel, titre, description, prerequis, contenu, resultat, duree, prix, prix_qualificatif}` ; textes en chaînes, `prix` nombre ou `null`.
- `sessions[]` : `{id_cohorte, formation, start_at, end_at, mode, adresse_presentiel, places_max, places_restantes, status, session_revision}`. Dates UTC, capacités entières, `status: open|full|closed`, autres valeurs textuelles selon les tables. `adresse_presentiel` est une chaîne issue de `lieu_ou_lien` seulement en mode `presentiel`, sinon `null` ; aucun lien visio n’est copié dans ce champ.

Projection des dates : formation active, session valide, début futur. Une date fermée manuellement n’est projetée que si elle conserve au moins une inscription confirmée ; son état `closed` s’affiche « Inscriptions terminées », même si sa capacité est atteinte. Sinon une date ouverte sans place donne `full` / « Complet », une date ouverte avec place donne `open`. Les dates passées, invalides ou liées à une formation inactive sont absentes ; dates fermées sans confirmé masquées comme décrit ci-dessus. Le calcul se fait à partir des seules inscriptions confirmées, sans exposer les lignes privées.

Les deux tableaux sont à plat, reliés par `sessions[].formation = formations[].id`. Une formation active sans session future visible reste dans `formations` ; le site en déduit « Dates à venir ». Le classement et les mois d’ouverture suivent EXPERIENCE.md. Le champ brut `lieu_ou_lien`, codes formateurs, configuration des destinataires internes et diagnostics privés sont exclus. Seul `contact.courriel` expose l’adresse de contact explicitement validée, même si elle a actuellement la même valeur que le destinataire interne. L’adresse du présentiel est exposée uniquement par `adresse_presentiel`, pour éviter de publier par erreur une URL de visioconférence. Une configuration ambiguë échoue comme indisponibilité maîtrisée ; les lignes invalides isolables n’empêchent pas les autres offres valides. Le cache public n’est jamais autoritaire pour réserver.

## Commande d'inscription — schéma logique V1

| Champ | Type et règle |
|---|---|
| `schema_version` | Entier `1` |
| `request_id` | UUID créé avant la première soumission et gardé pendant sa reprise |
| `id_cohorte`, `session_revision` | Chaînes non vides issues du choix présenté |
| `prenom`, `nom`, `entreprise`, `courriel` | Chaînes obligatoires ; limites proposées 100/100/200/254 caractères |
| `telephone` | Chaîne ou `null`, facultatif validé ; 30 caractères maximum proposé |
| `consentement` | Booléen `true` explicite ; refus si absent/faux |
| `politique_version` | Chaîne présentée avec l'accord |
| `anti_spam` | Objet `{honeypot: string, form_started_at: string}` ; champ caché vide et instant d'ouverture ISO UTC |

Le formulaire URL-encodé emploie les mêmes noms ; `schema_version` est décodé en entier, `consentement` accepte uniquement la valeur texte `true`, téléphone vide devient `null`, signaux anti-spam sont reconstitués depuis leurs deux champs nommés. RPC transporte directement l'objet typé. Les valeurs inconnues ne pilotent aucune règle : capacité, prix, statut ou destination envoyés par le client sont ignorés comme autorité. Un écran Google porte le même contrat et les mêmes résultats.

Canonisation serveur unique : normalisation Unicode NFC et suppression des espaces de début/fin pour les textes ; casse du courriel abaissée, autres casses/espaces internes conservés ; téléphone vide converti en `null`. L'empreinte SHA-256 porte uniquement sur la sérialisation JSON d'un tableau ordonné : `[schema_version, id_cohorte, session_revision, prenom, nom, entreprise, courriel, telephone, consentement, politique_version]` après normalisation. `request_id`, temps d'ouverture, honeypot et tout signal de transport n'en font pas partie. Les jeux d'exemples fixent une même sérialisation et les mêmes empreintes pour tous les tests ; les adaptateurs n'implémentent pas une autre canonisation.

Sous verrou acquis, une demande existante est recherchée avant les validations mutables d'une nouvelle réservation. Même empreinte : reçu existant avec statut courant, même après fermeture, changement de politique ou annulation ; aucun nouvel envoi. Même clé/empreinte différente : `RETRY_CONFLICT`, sans exposer le reçu d'un contenu différent. Pour une nouvelle demande seulement : vérifier champs, anti-spam, politique, révision, activité, validité, ouverture manuelle, heure, doublon et capacité, puis admettre et écrire selon AD-4.

## Résultat commun et états d'interface

Enveloppe : `schema_version: 1`, `code` (table ci-dessous), `request_id: string|null`, `recording_status: recorded|not_recorded|unknown`, `reservation_status: confirmee|annulee|null`, `replayed: boolean`, `mail_status` (état participant ci-dessus ou `null`), `message_key: string` et `errors: [{field: string, code: string}]` (tableau vide hors erreurs de champ). Aucun nom, courriel, lien privé ou trace technique dans le reçu public.

`recording_status` décrit ce qui est établi pour la demande, pas seulement la mutation de cet appel. `unknown` n'est jamais traduit par « inscription refusée ». L'adaptateur navigateur synthétise ce résultat si la réponse est perdue/indécodable ; `request_id` reste alors celui envoyé. Il rejoue exactement la même demande avant d'autoriser une demande différente.

| Code | `recording_status` / statut courant | Effet attendu |
|---|---|---|
| `RECORDED` | `recorded` / `confirmee` | Une place réservée ; email indépendant |
| `REPLAY` | `recorded` / `confirmee` ou `annulee` | Reçu existant ; si annulé, afficher « Cette inscription a été annulée » ; zéro place/envoi supplémentaire |
| `FULL`, `CLOSED`, `NOT_FOUND` | `not_recorded` / `null` | Nouvelle demande refusée ; revoir les sessions |
| `SESSION_CHANGED` | `not_recorded` / `null` | Conditions modifiées ; rafraîchir, relire et confirmer avant une nouvelle clé de demande |
| `DUPLICATE` | `not_recorded` / `null` | Autre demande active pour ce courriel/cohorte ; aucun reçu ni coordonnée supplémentaire divulgué |
| `INVALID`, `CONSENT_REQUIRED`, `POLICY_CHANGED` | `not_recorded` / `null` pour une nouvelle demande vérifiée | Corriger ou renouveler l'accord ; aucune place créée |
| `RETRY_CONFLICT` | `unknown` / `null` | Clé déjà utilisée avec un autre contenu ; réservation existante non modifiée et non divulguée |
| `BUSY`, `UNAVAILABLE` | `unknown` / `null` par défaut | Aucun résultat fiable ; reprise avec même clé/contenu, même si cet appel n'a rien écrit |

Si une commande trop mal formée ne permet pas d'identifier/canoniser une demande antérieure, elle reste `unknown` avec `INVALID` ; une absence certaine d'enregistrement ne se déduit pas d'un format invalide. `replayed` vaut `true` uniquement pour `REPLAY`. `mail_status` n'est connu que pour `RECORDED/REPLAY`, sinon `null`.

Une seule réussite HTTP ne signifie pas réservation : une enveloppe Apps Script techniquement réussie peut porter un refus métier. Les pages HTML et RPC rendent la même sémantique. Après un résultat certain sans enregistrement, une correction/confirmation produit une nouvelle clé ; un résultat inconnu conserve l'ancienne demande sans la modifier.

DUPLICATE et la microcopie UX indiquent toutefois l’existence d’un doublon courriel/session. Honeypot/délai ne garantissent pas l’absence d’énumération ; protection anti-abus à éprouver avant ouverture et limite à présenter si elle subsiste, sans fournisseur ajouté implicitement.
