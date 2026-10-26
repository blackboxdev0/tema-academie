---
name: Tema Académie V1
description: Parcours, fonctions et dispositions UX approuvés le 25 octobre ; finition graphique différée.
status: final
document_maturity: authoring-complete
visual_identity: owner-approved-v2
visual_approval: owner-approved-direction-v2
visual_approved_on: 2026-10-24
visual_approval_scope: identity-base-only
official_charter: unavailable
technical_validation: not-executed
approval: owner-approved-functional-ux
approved_on: 2026-10-25
approval_scope: functional-flows-and-layout
mock_coverage: inferred-native-surfaces
final_visual_approval: pending_rework
created: 2026-10-20
updated: 2026-10-25
sources:
  - ../../../specs/spec-tema-academie-v1/SPEC.md
  - ../../../specs/spec-tema-academie-v1/contrat-donnees.md
  - ../../../specs/spec-tema-academie-v1/regles-et-acceptation.md
  - ../../briefs/brief-tema-academie-2026-10-19/brief.md
  - ../../briefs/brief-tema-academie-2026-10-19/addendum.md
  - ../../../../docs/project/sources/brief-initial-2026-10-19.md
  - ../../../../docs/project/project-context.md
  - ../../../../docs/project/decisions/index.md
  - .memlog.md
  - .working/observations-site-tema-2026-10-24.md
  - .working/proposition-visuelle-tema-v2-2026-10-24.md
  - .working/maquettes-inscription-confirmation-2026-10-24.md
  - reconcile-site-tema.md
  - reconcile-direction-v2.md
---

# Tema Académie — EXPERIENCE

## Foundation

**Fonctions, parcours et dispositions UX approuvés par Sofiane le 25 octobre 2026 ; passage à l’architecture demandé.** Le site web français responsive utilise Google Sheets comme administration privée et Gmail pour le suivi manuel. [DESIGN.md](DESIGN.md) conserve la base logo/rose/Manrope–Inter de la V2 ; la finition graphique est différée après le jugement de rendu trop générique, sans exécution visuelle finale approuvée. Aucune charte officielle Tema ou David n’est déclarée. Aucun système d’interface tiers n’est retenu ; les fonctions natives du navigateur et de Google Sheets servent de base aux comportements concernés.

La [spécification fonctionnelle V1](../../../specs/spec-tema-academie-v1/SPEC.md) approuvée par Sofiane le 24 octobre et ses [règles](../../../specs/spec-tema-academie-v1/regles-et-acceptation.md) gouvernent les comportements métier. Ce contrat fonctionnel approuvé traduit leurs effets dans l’interface ; il ne remet pas au choix les règles approuvées. La capacité est configurable par date/session, sans plafond à huit ; une personne réserve une place et les prérequis restent informatifs.

Le compte projet `temaacademie@gmail.com` est déclaré créé par Sofiane ; Tema décidera qui l’utilise pour Gmail et le Sheet privé. Sofiane prévoit cet accès et trois Gmail contrôlés pour la recette : adresses, connexion, droits et récupération restent à constater. La recette utilisera des données/sessions fictives et un Sheet de test séparé. Vercel est choisi pour les premiers essais ; aucun accès réel, essai ou développement n’est autorisé par l’approbation fonctionnelle.

La limite de couverture marquée **[ASSUMPTION COVERAGE]** reste non bloquante pour l’architecture. L’approbation fonctionnelle et des dispositions n’autorise aucun essai réel, développement, commit, fusion ou livraison ; ces GO restent distincts. Le transport du formulaire reste ouvert : formulaire servi avec le site Vercel si la réponse réelle est exploitable, ou formulaire Apps Script HTML Service si cette variante est retenue après essai. La variante Google change la navigation et doit être approuvée ; elle n’est pas ajoutée silencieusement au parcours cible.

La V1 conserve un site publié sur une destination d’exploitation acceptée, éventuellement Vercel après confirmation du compte, des droits et des coûts. L’intégration au site de David reste reportée ; cela ne réduit pas la livraison à une simple URL de test.

Les capacités CAP-1 à CAP-8 correspondent au découpage de la spécification approuvée : catalogue ; dates/calendrier ; administration Sheet ; inscription ; courriels/agenda ; annulation/replanification ; confidentialité/résilience ; remise/exploitation. Le présent document décrit leur expérience approuvée sans remplacer leurs règles métier. Les détails techniques restent à valider dans l’architecture puis à éprouver lors de l’essai autorisé.

S1–S5 disposent de maquettes de disposition ; S6–S11 restent décrites par les tables, les interfaces natives et le guide/politique. **[ASSUMPTION COVERAGE]** Le maintien de cette couverture est déduit de la clôture fonctionnelle et de la priorité donnée au fonctionnement, sans vote explicite sur chaque surface native. Cette limite ne remet pas l’UX globale en attente et ne bloque pas l’architecture. UX-SORT est résolue ; UX-MONTH décrit l’initialisation à l’arrivée puis la navigation manuelle convenue.

## Information Architecture

**Accueil approuvé : catalogue des formations, puis calendrier général sur la même page.** Les liens Catalogue et Calendrier en haut donnent accès à ces deux sections. Le clic sur une carte ouvre la fiche de la formation ; le clic sur une date du calendrier général ouvre cette fiche sur le créneau choisi, prioritaire sur son initialisation par défaut. Le formulaire est une page dédiée, liée à la formation et à la date choisies.

| Surface | Accès et besoin couvert | Sortie et parcours associé | Référence visuelle de cette passe |
|---|---|---|---|
| S1 — Catalogue | Entrée du site ; formations actives, filtre partagé ; CAP-1. | Voir la formation et les dates ; calendrier dessous ; F1/F2. | [Accueil V2, cartes](mockups/direction-tema-academie-v2.html#catalogue). |
| S2 — Fiche formation | Carte ou date du calendrier général ; présentation courte, dates, puis programme ; CAP-1/2. | Consulter une date, récapitulatif, S’inscrire à cette date ; F1/F2. | [Fiche V2](mockups/direction-tema-fiche-v2.html#ergonomie). |
| S3 — Calendrier mensuel et liste chronologique | Sous le catalogue et sur la fiche ; mêmes sessions visibles, périmètre général ou formation ; CAP-2. | Choix explicite d’une date et fiche/récapitulatif correspondants ; F2. | [Accueil V2, calendrier](mockups/direction-tema-academie-v2.html#calendrier) et fiche V2. |
| S4 — Formulaire d’inscription | Page dédiée depuis S’inscrire à cette date ; récapitulatif, coordonnées et accord ; CAP-4/7. | Confirmer mon inscription ; Changer de date vers la même fiche/mois, saisie transitoire conservée ; F2/F3. | [Formulaire et variantes S4](mockups/key-inscription-v2.html#normal), disposition approuvée, graphisme à reprendre. |
| S5 — Résultat d’inscription | Réservation certaine, refus certain ou résultat inconnu ; CAP-4/5/7. | Retour au catalogue, Changer de date ou Reprendre mon inscription selon l’état ; F2/F3. | [Confirmation S5](mockups/key-confirmation-v2.html#confirmee) et états S4 ; dispositions approuvées, graphisme à reprendre. |
| S6 — Courriel participant et invitation agenda | Réservation enregistrée puis envoi initial ; CAP-5. | Informations pratiques, agenda, contact Tema ; F2/F3. | Spine-only. |
| S7 — Avis à Tema | Nouvelle inscription ; échec de confirmation signalé si avis envoyable ; CAP-5. | Sheet privé et suivi manuel Gmail ; F3/F4. | Spine-only, interface Gmail native. |
| S8 — Sheet Formations/Disponibilités | Compte de gestion privé ; formation, dates, capacité et commande d’ouverture ; CAP-3. | Vérifier rendu/publication ; F4/F5. | Spine-only, interface Google native. |
| S9 — Sheet Inscriptions/Paramètres | Compte privé ; statut, traces d’envoi, contrôle entreprise après confirmation ; CAP-3/6/7. | Annulation, vérification des places et contact manuel Gmail ; F3/F4/F5. | Spine-only, interface Google native. |
| S10 — Mode d’emploi et remise | Ressource privée et séance de 30 minutes ; CAP-8. | Gestion et récupération selon procédures retenues ; F4/F5. | Spine-only. |
| S11 — Politique de confidentialité Tema | Lien de navigation/consentement ; CAP-7. | Retour au formulaire sans perte de saisie dans le parcours ; F2. | Spine-only ; texte à valider par Tema. |

Cinq HTML de référence sont promus : accueil, fiche, [planche de style V2](mockups/direction-tema-style-v2.html), formulaire S4 et confirmation S5. Ils illustrent S1–S5 et leurs états utiles sans démontrer formulaire connecté, conservation du contexte entre fichiers ou résultat d’inscription réel. Les dispositions fonctionnelles sont approuvées, le traitement graphique final reste à retravailler. S6–S11 restent des surfaces décrites uniquement dans les contrats (spine-only), selon l’hypothèse de couverture non bloquante déclarée en Foundation. Le [logo importé](imports/site-tema-2026-10-24/logo-tema.png) appartient à l’identité ; [réconciliation V2](reconcile-direction-v2.md) et [réconciliation du site](reconcile-site-tema.md) précisent sa provenance.

### Catalogue, filtre et visibilité

- Tous est le filtre initial. Divalto, Dimo ou MoovApps filtrent ensemble les cartes et le calendrier général placé dessous. La fiche d’une seule formation n’ajoute pas ce filtre.
- Une formation inactive et ses dates sont masquées du public, données et historique conservés dans le Sheet. Une formation active reste consultable même sans date visible ; les 24 sources ne sont pas présumées toutes actives au lancement.
- Une date future valide/publiée est visible si ouverte, ou si fermée manuellement avec au moins une inscription encore confirmée. Fermée sans confirmé : masquée des deux calendriers, conservée dans le Sheet. Les lignes annulées ne comptent pas pour cette visibilité.
- Le libellé Inscriptions terminées prime pour une date fermée visible, même à capacité atteinte. Une date ouverte sans place est Complet ; une date ouverte avec place montre le compteur. Sans aucune date visible pour une formation active : Dates à venir. Les dates passées ne sont pas ajoutées à l’historique public et aucune nouvelle inscription n’est possible à partir du début de la session.
- La carte montre titre/logiciel, durée, tarif qualifié, prochaine date réservable/places ou statut applicable, puis Voir la formation et les dates. Les états d’une date ne condamnent pas toute la formation lorsqu’une autre date reste réservable.

**Classement approuvé le 25 octobre — UX-SORT résolue :** formations avec au moins une date réservable ; puis celles dont toutes les dates visibles affichent « Complet » ou « Inscriptions terminées », avec libellés distincts ; puis formations sans date visible. Les inactives restent masquées. À égalité, conserver l’ordre du classeur. Aucun tri paramétrable ou champ métier de priorité ajouté.

### Mois d’ouverture, sélection et contexte

| Situation | Règle d’ouverture ou de navigation |
|---|---|
| Calendrier général à l’arrivée | Mois courant s’il contient une date future visible ; sinon premier mois futur qui en contient, en sautant les mois vides. Aucune date future visible : Aucune formation planifiée pour le moment, catalogue conservé. |
| Fiche ouverte depuis une carte | Mois de la prochaine date réservable ; sans date réservable mais avec dates visibles, mois de la prochaine date future visible, même complète/terminée. Afficher alors Aucune date réservable pour le moment et désactiver l’inscription. Aucune date visible : Dates à venir. |
| Date déjà cliquée dans le calendrier général | La même date et son mois gardent la priorité à l’arrivée sur la fiche ; pas de remplacement par une autre prochaine disponibilité. |
| Ouverture sur un mois seulement | Le mois est positionné sans sélectionner une date à la place de la personne. Le récapitulatif reste neutre jusqu’au choix explicite. |
| Mois précédent/suivant | Commandes disponibles dans la grille et la liste ; un mois vide est nommé. UX-MONTH : l’initialisation automatique concerne l’arrivée ; la navigation manuelle ensuite choisie reste libre, sans saut automatique. |
| Retour au catalogue depuis la fiche | Retrouver le filtre logiciel, le mois du calendrier général et la position de lecture précédents pendant la visite. |
| Changer de date depuis le formulaire | Revenir à la fiche de la même formation, sur le mois consulté ; conserver les champs transitoirement pendant le choix d’une autre date de cette formation. |

Ce contexte de navigation non personnel dure la visite. Les coordonnées ne sont ni placées dans l’URL ni mémorisées durablement entre visites ; la conservation transitoire du parcours ne garantit pas une restauration après fermeture du navigateur. Le moyen technique de tenir ce contexte reste à vérifier avec le transport retenu.

## Voice and Tone

Ton français simple et professionnel. Le texte nomme la situation et l’action possible. Il n’affirme ni le paiement, ni la facturation, ni le contrôle des prérequis, ni l’envoi d’un email sur la seule base d’un clic.

| Situation | Texte d’interface et règle |
|---|---|
| Formation active sans date future visible | « Dates à venir ». La fiche et le programme restent consultables ; aucun formulaire actif ni liste d’attente ajoutée. |
| Session ouverte | « 1 place restante » ou « 7 places restantes ». Le nombre affiché n’est pas une garantie tant que la réservation n’est pas enregistrée. |
| Session pleine | « Complet ». La session reste consultable tant qu’elle est future ; proposer de consulter les autres dates. |
| Date future fermée manuellement | Avec des inscrits confirmés : « Inscriptions terminées », même à capacité atteinte ; consultable, inscription désactivée. Sans confirmé : date masquée. Aucune suppression de l’historique. |
| Tarif | « À partir de [montant] $ CAD par participant, taxes en sus », formulation approuvée le 23 octobre ; montants finaux à confirmer par Tema avant publication. |
| Calendrier général sans aucune date future visible | « Aucune formation planifiée pour le moment ». Le catalogue reste visible ; ne pas confondre avec un simple mois vide. |
| Mois parcouru sans session visible | « Aucune formation planifiée ce mois-ci » dans le calendrier général ; « Aucune date ce mois-ci » sur la fiche. Garder précédent/suivant et le retour au catalogue. |
| Fiche avec dates visibles mais aucune réservable | « Aucune date réservable pour le moment ». Conserver les dates consultables et leurs statuts, inscription désactivée. |
| Filtre sans résultat | « Aucune formation pour ce logiciel. » Proposer « Voir toutes les formations ». |
| Envoi du formulaire | « Inscription en cours… ». Ne pas promettre de place avant le retour autoritatif. |
| Réservation effectivement enregistrée | « Votre inscription est confirmée » ; « Votre place est réservée pour [Formation], le [date], de [heure de début] à [heure de fin]. » Récapitulatif format/lieu/tarif, état d’envoi de confirmation/invitation, contact et Retour au catalogue. Si le service a accepté l’envoi, le dire sans prétendre prouver sa réception. |
| Enregistrement confirmé, envoi initial non achevé | La place reste réservée. Présenter l’envoi en préparation (`PENDING`) ou en cours (`SENDING`) selon l’état établi ; aucun échec ou résultat d’envoi incertain n’est déduit de ces seuls états. Aucune commande de renvoi ajoutée. |
| Enregistrement confirmé, échec de confirmation détecté | « Votre place est réservée. Le courriel de confirmation n’a pas pu être envoyé. Vous pouvez contacter Tema à temaacademie@gmail.com. » Ne pas inviter à réserver de nouveau ni promettre un renvoi automatique. |
| Enregistrement confirmé, envoi incertain | « Votre place est réservée. Nous n’avons pas pu vérifier l’envoi du courriel de confirmation. » Ajouter le même contact ; distinguer cet état d’un échec certain. |
| Session en ligne sans lien disponible | Dans la confirmation : « Le lien de connexion vous sera envoyé dans les jours précédant la formation. » Dans l’agenda : « En ligne — lien à venir ». Transmission ultérieure manuelle par Tema. |
| Réponse perdue ou résultat inconnu | « Nous n’avons pas pu vérifier le résultat de votre inscription. » Bouton « Reprendre mon inscription » : même demande, sans deuxième place ni nouvel email. Champs conservés tant que la page reste ouverte ; contact Tema si le problème persiste. Aucun faux succès ni refus certain. |
| Rejeu d’une inscription ensuite annulée | « Cette inscription a été annulée. Aucune nouvelle place n’a été réservée. » Ne pas réafficher une confirmation active ni relancer un courriel. |
| Conditions de session modifiées avant enregistrement | « Les informations de cette session ont changé. Vérifiez les nouvelles informations avant de confirmer. » Montrer le récapitulatif actuel et conserver les coordonnées dans la page. |
| Doublon courriel/cohorte reconnu | « Une inscription existe déjà pour ce courriel et cette session. » Ne pas révéler de nom ou d’autres coordonnées ; la politique anti-énumération est à confirmer dans l’architecture. |
| Dernière place prise, refus certain avant enregistrement | « Cette session est désormais complète » ; « Votre inscription n’a pas été enregistrée. » Proposer « Changer de date » vers la même formation, champs conservés. Sans autre date réservable : « Aucune autre date disponible pour le moment » et contact Tema. |
| Donnée invalide | Indiquer le champ et sa correction : « Saisissez une adresse courriel valide. » Le refus du consentement ne doit pas entraîner d’inscription. |
| Service temporairement indisponible, refus certain avant écriture | « Le service est temporairement indisponible. Réessayez dans quelques instants. » Cette formulation suppose que l’absence d’enregistrement est connue. |
| Envoi privé supprimé pour annulation | « Non envoyé : inscription annulée. » État réservé à l’administration, sans relance automatique. |
| Envoi privé bloqué après modification de session | « Envoi bloqué : les informations de la session ont changé. » Tema vérifie et contacte manuellement dans Gmail ; ne pas expédier l’ancienne confirmation. |

Confirmation certaine, complet après saisie, résultat inconnu et actions associées reprennent les validations UX du 24 octobre ; le tarif et l’annonce de lien à venir reprennent les règles approuvées. La synthèse des notifications approuvée le 25 octobre conserve ces cas précis : refus certain avec absence d’enregistrement ; résultat inconnu avec reprise de la même demande ; état d’envoi distinct d’une réservation déjà certaine. Les informations saisies sont conservées transitoirement pendant le parcours ; aucune nouvelle demande aveugle ou reprise automatique de courriel n’est ajoutée. Le texte dédié de confidentialité et l’accord seront préparés puis soumis à Tema avant ouverture réelle ; aucun texte marketing ou consentement précoché ajouté.

## Component Patterns

Les règles visuelles sont dans [DESIGN.md, Components](DESIGN.md#components). La V2 utilise notamment `{colors.brand-pink}`, `{colors.action-pink}`, `{typography.body.fontFamily}` et `{rounded.card}` ; les tokens de couleur ne remplacent jamais les libellés d’état.

| Composant | Comportement et règles |
|---|---|
| NavigationAcadémie | Catalogue et Calendrier mènent aux deux sections de l’accueil. Retour au catalogue depuis la fiche restaure filtre, mois et position pendant la visite. Changer de date revient à la même fiche/mois. Aucun accès public aux inscrits. |
| FiltreLogiciel | Tous par défaut ; Divalto, Dimo et MoovApps filtrent ensemble cartes et calendrier général. Pas de filtre logiciel sur la fiche d’une seule formation. Sélection annoncée ; formations actives sans date conservées ; aucune recherche avancée ajoutée. |
| CarteFormation | Voir la formation et les dates ouvre la fiche ; titre/logiciel, durée, tarif qualifié, prochaine date réservable/places ou statut sont affichés. Même complète/terminée/sans date, une formation active reste consultable. L’ordre des groupes et ses propositions de finition sont explicités dans Information Architecture. |
| FicheFormation | Présentation courte, dates, puis programme/objectifs-prérequis complets. Mois de la prochaine date réservable, sinon prochaine future visible ; un créneau explicitement cliqué garde priorité. Ne contrôle pas l’historique du participant. Adresse présentielle publique avant inscription ; aucun lien visio public. |
| CalendrierMensuel | Grille mensuelle sur ordinateur pour le général et la fiche, liste du même mois sur téléphone. Initialisation et visibilité selon Information Architecture ; navigation mois précédent/suivant sans mutation. Une date cliquée mène à son récapitulatif ; aucune sélection déduite du seul mois d’ouverture. |
| ListeCohortes | Sur téléphone, mêmes sessions visibles du mois que la grille, chronologiques et regroupées par jour ; mêmes commandes de mois et sélection. Récapitulatif immédiatement après la date ciblée, avant les suivantes ; utilisable au clavier/toucher. |
| SélecteurCohorte | Consulter une date affiche date/heures/format/adresse/places puis S’inscrire à cette date. Une date complète ou terminée reste consultable ; l’inscription y est désactivée. Une seule session par formulaire ; une ouverture neutre n’en sélectionne aucune. Changer de session change le récapitulatif avant confirmation. |
| IndicateurDisponibilité | Montre la dernière disponibilité reçue, calculée depuis les seules inscriptions confirmées et la capacité de cette date ; aucune limite à huit. Fermeture au démarrage et commande par date priment sur une place affichée. Le serveur reste l’arbitre ; aucune réservation optimiste dans le navigateur. |
| FormulaireInscription | Page dédiée : récapitulatif formation/date/heures/format/lieu/tarif, puis prénom, nom, entreprise et courriel obligatoires, téléphone facultatif, accord et Confirmer mon inscription. Entreprise libre vérifiée après confirmation, sans attente préalable. Les champs restent transitoirement remplis lors d’un changement de date de la même formation ou d’une reprise ; une personne/place par demande. Après conditions modifiées, montrer le récapitulatif actuel et demander confirmation. Nouvelle personne ou réinscription après annulation : nouveau formulaire. |
| ChampSaisie | Libellé toujours visible, erreurs liées au champ, valeurs conservées après refus corrigeable. Pas de nom/courriel dans l’URL, pas de sauvegarde locale durable de coordonnées. |
| ConsentementConfidentialité | Non coché par défaut ; lien consultable avant accord. La saisie ne vaut pas consentement ; le serveur enregistre sa preuve horodatée avec la version prévue par l’architecture. |
| BoutonAction | S’inscrire à cette date ouvre le formulaire dédié associé. Confirmer mon inscription soumet ; Inscription en cours… empêche le double clic. Changer de date garde le contexte ; Reprendre mon inscription réutilise la même demande incertaine. Flèche droite pour les liens internes, contact textuel. |
| MessageÉtat | Persistant dans le flux, lisible par lecteur d’écran ; traduit les états communs de réservation, y compris annulation et résultat inconnu. Après `SESSION_CHANGED`, rend les nouvelles conditions et leur confirmation explicites. Pas de pile de modales ou d’avis temporaires comme seule preuve d’inscription. |
| RécapitulatifInscription | Formation et conditions présentées pour la tentative en cours ; distingue état courant confirmé/annulé, état d’envoi et issue inconnue. Au rejeu d’une demande annulée, affiche l’annulation sans réactiver la place. Ne permet ni annulation autonome ni gestion de compte. |
| CourrielParticipant | Une tentative initiale après enregistrement éligible ; aucune confirmation périmée après annulation ou modification. Fournit formation, date, heures/fuseau, adresse ou lien privé, contact et `.ics`. Sans lien en ligne : annonce l’envoi manuel ultérieur, sans URL inventée. Aucun RSVP, paiement, renvoi applicatif ou notification automatique de replanification. |
| AvisTema | Avis vers `temaacademie@gmail.com` ; signale l’échec participant détecté et le lien visio à transmettre lorsque concernés. Ouvre le Sheet sous ses droits. Son échec n’annule pas la place ; quota ou interruption peuvent empêcher cet avis aussi, avec trace privée pour le suivi manuel Gmail. |
| FeuilleAdministration | Colonnes métier de Formations/Disponibilités modifiables : actif/inactif et ouverture/fermeture par date distincts ; capacité configurable. Inscriptions conserve statut, identifiants, instantanés et traces d’envoi. Annuler passe la ligne à Annulée sans suppression ; toute réinscription crée une nouvelle ligne/ID. Les protections techniques restent à valider ; aucune commande de relance ni saisie directe des états d’envoi. |
| ModeEmploi | Ajouter formation/session, régler capacité/ouverture, masquer une formation, vérifier l’entreprise après confirmation, annuler et contacter dans Gmail. Décrit la modification sur la même ligne, le suivi des emails et liens en ligne, la récupération et le nettoyage manuel par Emma selon les 12 mois retenus et la politique à valider. Aucun menu technique supplémentaire prescrit. |
| LienPolitique | Accessible avant soumission, intitulé explicite ; ouverture choisie conserve le formulaire. Sans politique/lien validé, le mode test reste distinct d’une mise en service publique. |

### Dispositions S4/S5 approuvées

Le [formulaire S4](mockups/key-inscription-v2.html#normal) présente le récapitulatif avant Vos coordonnées, puis l’accord et l’action ; Changer de date reste accessible. Les champs prénom/nom, entreprise, courriel et téléphone suivent les règles existantes ; la grille de référence devient une colonne sur téléphone. Accord initial décoché, texte/politique encore à valider par Tema. Les variantes [erreur de courriel](mockups/key-inscription-v2.html#erreur), [complet](mockups/key-inscription-v2.html#complet), [inconnu](mockups/key-inscription-v2.html#inconnu) et [conditions modifiées](mockups/key-inscription-v2.html#conditions-modifiees) gardent les informations déjà saisies dans le parcours ; elles n’exécutent aucune inscription.

La [confirmation S5](mockups/key-confirmation-v2.html#confirmee) place d’abord la réservation certaine, puis formation/date/horaires/format/tarif, état du courriel et de l’invitation, puis retour au catalogue et contact. [Échec d’envoi](mockups/key-confirmation-v2.html#envoi-echoue) et [envoi incertain](mockups/key-confirmation-v2.html#envoi-incertain) conservent la place réservée ; ils ne deviennent pas un échec de réservation. La [variante d’horaires reconfirmés](mockups/key-confirmation-v2.html#horaires-modifies) reprend les conditions actualisées. Ces dispositions et fonctions sont approuvées ; leur finition graphique est différée.

### Champs et page dédiée validés

| Champ | Règle à respecter | Présentation ou limite |
|---|---|---|
| Prénom | Obligatoire, validé le 21 octobre. | Champ distinct dans la page dédiée approuvée ; ne pas exclure les noms usuels. |
| Nom | Obligatoire, validé le 21 octobre. | Même règle de saisie ; détail visuel spine-only dans cette passe. |
| Entreprise | Obligatoire, saisie libre ; vérification manuelle Tema après confirmation automatique. | Aucun registre clients, import Excel ou état d’attente préalable. |
| Courriel | Obligatoire, destinataire de la confirmation. | Type de saisie adapté ; normalisation et contrôles dans le contrat de données. |
| Téléphone | Facultatif, validé le 21 octobre. | Facultatif indiqué ; aucun format local rigide sans motif. |
| Consentement confidentialité | Accord explicite obligatoire ; case non cochée et politique liée. | Texte dédié, accord/version et modalités de conservation à faire valider par Tema. |

### Opérations privées et envois

La gestion se fait dans le Sheet privé et Gmail avec le compte confié par Tema. Une formation inactive et ses dates disparaissent de l’offre publique, sans suppression des données. La commande d’ouverture/fermeture vise une seule date ; elle ne contourne ni l’heure de début ni la capacité. La capacité totale est configurable directement par Tema ; une baisse sous les confirmés ferme les nouvelles inscriptions et signale l’écart sans annuler personne.

**Procédure humaine approuvée le 24 octobre :** fermer les nouvelles inscriptions de la date concernée, modifier la même ligne, prévenir les inscrits concernés depuis Gmail, puis rouvrir si souhaité selon date et places. L’identifiant de session, les inscriptions, les places réservées et l’historique sont conservés ; les inscrits ne se réinscrivent pas. L’actualisation, les protections de colonnes et le traitement des réservations/envois en cours restent à définir dans l’architecture puis à vérifier en essai. La fermeture manuelle ne prouve pas leur atomicité ; aucun menu technique n’est prescrit ici.

**Suivi email approuvé le 23 octobre :** après enregistrement, conserver la place et tenter l’avis vers `temaacademie@gmail.com`. L’avis interne signale un échec détecté de confirmation si son envoi reste possible. Tema vérifie ensuite les traces privées et les éventuels avis de non-distribution dans Gmail, puis contacte manuellement le participant avec les informations actuelles. Un quota ou une interruption peuvent empêcher cet avis lui-même ; sa réception n’est pas garantie. Pas de commande de vérification/relance, de délai de dix minutes, de nouvelle tentative automatique ou de canal supplémentaire.

Les traces privées séparent réservation et envois. Selon le contrat technique proposé, `SUPPRESSED` empêche une confirmation initiale après annulation et `BLOCKED` une confirmation devenue périmée ; les messages déjà `SENT` gardent leur historique. Un état incertain reste incertain jusqu’à vérification, sans renvoi applicatif ni saisie directe d’état. Ajouter le premier lien visio ne déclenche aucun envoi : Tema le transmet manuellement avant la formation.

**Conservation retenue :** 12 mois, nettoyage manuel par Emma. Le point de départ après formation ou annulation, les finalités, les exceptions légales et les copies sous contrôle Tema doivent figurer dans la politique dédiée à faire valider. Ce rôle de nettoyage ne désigne pas Emma comme responsable légale de la confidentialité ; ce responsable et le contenu du texte restent à préciser avec Tema. Aucun automatisme de purge n’est ajouté.

## State Patterns

### Résultat commun des demandes

Les règles fonctionnelles et les cas UX confirmés imposent un état honnête de la demande. Le [contrat de données](../../../specs/spec-tema-academie-v1/contrat-donnees.md#résultat-commun-et-états-dinterface) propose la convention technique ci-dessous, indépendante du transport et encore à éprouver ; les noms machine ne sont jamais affichés au visiteur.

| État machine proposé | Interprétation UX |
|---|---|
| `recording_status: recorded`, `reservation_status: confirmee` | Réservation enregistrée et actuellement active ; état de courriel distinct. |
| `recording_status: recorded`, `reservation_status: annulee` | Demande historique reconnue mais inscription désormais annulée ; pas de réactivation ni nouvelle place. |
| `recording_status: not_recorded`, `reservation_status: null` | Refus certain sans réservation créée pour cette demande ; correction ou autre session selon le code. |
| `recording_status: unknown`, `reservation_status: null` | Le résultat reste à vérifier ; aucune affirmation de succès ou de refus certain. Une réponse perdue sans enveloppe reçue suit aussi cet état. |

Le rejeu de la même clé avec le même contenu retrouve son résultat avant les contrôles mutables d’une nouvelle réservation — fermeture, politique et capacité. Il rend l’état courant de la réservation et ne relance aucun email. Le même identifiant avec un autre contenu ne modifie pas l’inscription existante.

Le formulaire conserve la révision opaque `session_revision` des conditions présentées et la renvoie avec sa demande. Un retour `SESSION_CHANGED` est un refus certain sans réservation : relire les conditions, montrer le récapitulatif courant et demander une nouvelle confirmation avant une nouvelle demande. Les coordonnées restent dans la page ; aucun nouvel envoi automatique ne part à la simple actualisation. Une réponse perdue est d’abord rejouée/vérifiée avec la même clé et le même contenu ; elle n’est pas remplacée silencieusement par une demande fondée sur une nouvelle révision.

### États par surface

| Surface | États applicables et réponse attendue |
|---|---|
| S1 — Catalogue | Chargement sans faux stock ; formations actives avec date réservable, non réservable ou sans date ; catalogue vide distinct d’un filtre vide ; inactives absentes. Réseau/hors ligne : message et réessai, aucune inscription hors ligne. Filtre/focus annoncés, contexte de retour conservé pendant la visite. |
| S2 — Fiche | Présentation puis dates puis programme ; mois de la prochaine date réservable, sinon de la prochaine date visible, ou Dates à venir ; arrivée sur date explicite prioritaire. Récapitulatif neutre ou date consultée ; Complet/terminée : consultables sans inscription. Formation inactive/introuvable : retour Catalogue. Adresse présentielle publique, lien visio privé. Réseau : contenu ancien identifié, aucun faux résultat ; titres/focus dans l’ordre de lecture. |
| S3 — Calendrier/liste | Chargement ; mois avec dates ; mois vide ; aucune formation planifiée dans le futur ; filtre partagé au général. Ouverte avec place, Complet ou Inscriptions terminées selon priorité ; fermée sans confirmé absente. Grille/liste partagent mois, données et choix. Réseau/actualisation échouée : aucun stock garanti ; précédent/suivant et focus nommés. |
| S4 — Formulaire | Page dédiée prête ; téléphone vide accepté ; erreur de champ/accord ; envoi ; dernière place perdue avec refus certain ; doublon/fermeture/session retirée ; conditions modifiées ; résultat inconnu. Conserver les champs transitoirement et la formation lors de Changer de date ; pas de coordonnées dans l’URL ni stockage durable. Conditions modifiées : nouveau récapitulatif à confirmer. |
| S5 — Résultat | Confirmation et place réservée seulement si enregistrées avec certitude ; état d’envoi distinct. FULL certain : Votre inscription n’a pas été enregistrée, Changer de date ; sans autre date : message/contact. Inconnu : Reprendre mon inscription avec la même demande, pas de faux succès/refus. Rejeu annulé : annulation courante sans réactivation. Accès à aucun résultat tiers par identifiant devinable. |
| S6 — Courriel/agenda | Reçu lisible avec images bloquées ; invitation et heures exactes ; lien privé présent ou annonce de transmission manuelle ultérieure. Échec ou issue incertaine : place maintenue et contact Tema. Modification ultérieure : informations actuelles communiquées manuellement. |
| S7 — Avis Tema | Acceptation d’envoi, échec ou incertitude ; échec participant signalé si possible. Quota/interruption : avis éventuellement absent et trace privée conservée. Accès au Sheet sous droits Google, refus sinon. Aucune réception déduite de la possibilité d’envoyer. |
| S8 — Formations/Disponibilités | Vide/import ; ligne partielle isolée ; protection/diagnostic ; propagation attendue <2 min, non mesurée. Actif/inactif, date ouverte/fermée et capacité par date distincts. Baisse sous confirmés : écart/nouvelles inscriptions fermées, aucune inscription annulée. Fermer/modifier même ligne/prévenir Gmail/rouvrir ; protection des opérations à prouver. Droits insuffisants : refus privé. |
| S9 — Inscriptions/Paramètres | Vide ; confirmée/annulée ; réinscription nouvelle ligne/ID, historique gardé. États d’envoi PENDING/SENDING/SENT/FAILED/UNKNOWN/SUPPRESSED/BLOCKED avec raison privée ; paramètres incomplets ; modification protégée refusée. Suivi manuel Gmail, aucune commande de relance. Dernière annulation d’une date fermée : disparition publique selon nombre encore confirmé. |
| S10 — Mode d’emploi/remise | Accès autorisé ou refus ; procédure présente ou manque nommé. Recette et séance ne se remplacent pas. Destination finale/droits/récupération à accepter et vérifier ; compte déclaré créé distinct d’un accès constaté. Nettoyage manuel selon politique à valider. |
| S11 — Politique | Texte/lien consultables avant accord ; indisponibles : blocage de l’ouverture réelle, aucun texte légal inventé. Retour au formulaire avec champs gardés dans le parcours ; contenu/version à valider par Tema. |

## Interaction Primitives

- Cliquer, toucher et naviguer au clavier doivent permettre les mêmes actions ; aucune opération essentielle réservée au survol ou au glisser-déposer.
- L’ouverture d’une fiche ou d’un formulaire donne un titre clair et un focus cohérent. Le retour au catalogue conserve filtre/mois lorsque possible sans mémoriser les coordonnées d’une personne.
- Le formulaire dédié est approuvé. S’inscrire à cette date conserve formation et créneau ; Changer de date revient à la fiche sur le mois consulté. L’URL réelle et la conservation transitoire de la saisie seront vérifiées avec le transport retenu.
- L’actualisation des places après réservation utilise l’état connu du serveur. Une session devenue pleine pendant la saisie est refusée clairement ; aucun compte à rebours artificiel ni paiement n’est affiché.
- Une saisie n’est ni une réservation, ni une mise en attente. Le double clic et la reprise d’une réponse perdue ne doivent pas consommer une deuxième place.
- Reprendre mon inscription réutilise la même demande, retrouve d’abord son résultat malgré fermeture/politique/capacité modifiées et ne renvoie aucun email ; une annulation reste annulée. Lors du clic sur Confirmer, le traitement Apps Script envisagé relit les conditions courantes : si elles diffèrent, montrer le nouveau récapitulatif et demander confirmation avant réservation. Aucun contrôle en direct ou webhook ajouté ; révision/transport et protections restent à éprouver.
- Hors ligne, aucune file d’inscriptions locales n’est constituée. Le résultat d’une demande déjà partie reste inconnu tant qu’il n’a pas été vérifié.
- Les changements de session suivent fermer → modifier la même ligne → prévenir dans Gmail → rouvrir si souhaité ; ils conservent inscrits, identifiants et historique. L’annulation change le statut dans le Sheet ; une réinscription crée une nouvelle ligne/ID. Pas de lien public d’annulation ou d’espace participant.

## Accessibility Floor

Plancher proposé pour ce parcours web : libellés explicites, clavier complet, ordre de titres cohérent, gestion du focus, agrandissement des textes, annonces d’état et vérification des contrastes décrits dans DESIGN.md. Aucune certification n’est annoncée.

- Langue de page française ; dates compréhensibles et horaires avec fuseau America/Toronto expliqué en texte.
- Les états « Complet », « Dates à venir », sélectionné et erreur sont écrits. La couleur du logiciel est une aide supplémentaire.
- Le formulaire dispose de libellés, aides et erreurs associées ; après validation refusée, le premier champ invalide et un résumé compréhensible sont accessibles. Un message de résultat est annoncé sans déplacer le focus de façon inattendue.
- Les deux calendriers offrent la liste équivalente sur téléphone, regroupée par jour ; commandes précédent/suivant nommées et même date ciblée. Dans la V2, l’ordre de lecture mobile place le récapitulatif après la date choisie, pas après toutes les autres. Cette observation ciblée ne vaut pas audit complet de l’interface finale.
- Les commandes restent visibles et utilisables à 200 % de zoom et sans défilement horizontal global sur une largeur étroite. Les cellules du calendrier peuvent céder la place à la liste équivalente.
- Les dimensions des maquettes fournissent des références, pas une preuve globale d’accessibilité. Espacement des cibles, focus, zoom, champs et erreurs restent à vérifier lors de la réalisation ; les mesures partielles de contraste sont dans DESIGN.
- Pas d’animation requise pour comprendre un état ; une préférence de réduction des animations doit être respectée si des transitions sont ajoutées.
- Recette prévue au clavier, sur téléphone et avec un lecteur d’écran pour le formulaire et la confirmation ; ces contrôles ne sont pas encore exécutés.

## Key Flows

Marie Tremblay et Usinage ABC sont l’exemple de la proposition PDF, page 6, pas une personne ou entreprise réellement inscrite. Aucun profil démographique supplémentaire ne lui est attribué. Les dates du PDF sont illustratives ; les essais utiliseront des cohortes synthétiques futures. Le nom du référent Tema n’étant pas fourni, **[ASSUMPTION UX-5]** Sofiane joue ce rôle uniquement dans les scénarios de recette ci-dessous.

### F1 — Marie consulte une formation avant la programmation des dates

1. Marie ouvre l’accueil : catalogue d’abord, calendrier général dessous ; Tous est choisi.
2. Elle filtre Divalto : cartes et calendrier général utilisent le même filtre. Ergonomie montre titre, durée, tarif qualifié et Dates à venir lorsque ses dates ne sont pas encore visibles.
3. Elle choisit Voir la formation et les dates : présentation courte, zone des dates, puis programme/objectifs-prérequis complets.
4. **Point décisif : elle comprend la formation et l’absence de date réservable sans faux formulaire actif.** La formation active reste consultable ; aucune liste d’attente ajoutée.
5. Retour au catalogue retrouve filtre, mois et position de lecture de la visite. Le lien Calendrier en haut mène à sa section sur l’accueil.

Échecs : chargement impossible → réessai ; catalogue vide distinct du filtre vide. Aucune date future visible dans le calendrier général → Aucune formation planifiée pour le moment, sans retirer les formations actives. Une formation devenue inactive disparaît du public, sans effacer ses données privées.

### F2 — Marie choisit une date, réserve une place et ajoute la session à son agenda

1. Marie ouvre le calendrier général sous le catalogue. Il montre le mois courant s’il contient une date future visible, sinon le premier mois futur pertinent ; sur téléphone, les sessions du mois sont groupées par jour dans une liste.
2. Elle clique une date : la fiche s’ouvre sur cette même date et son mois. Une arrivée par carte aurait ouvert le mois de la prochaine date réservable, ou la prochaine visible en repli ; cela ne sélectionne aucune date silencieusement.
3. Elle consulte le récapitulatif date/heures/format/adresse du présentiel/places. Sur téléphone, il suit immédiatement la date ciblée. Le programme reste disponible dessous ; le lien visio n’est pas public. Complet ou Inscriptions terminées restent consultables, inscription désactivée.
4. Pour une date réservable, S’inscrire à cette date ouvre la page dédiée : récapitulatif formation/date/heures/format/lieu/tarif, prénom, nom, entreprise libre et courriel obligatoires, téléphone facultatif, puis accord et action. Tema vérifiera l’entreprise après confirmation.
5. Elle consulte la politique, revient dans le parcours, accepte puis clique Confirmer mon inscription. L’envoi empêche le double clic ; aucun succès n’est annoncé au seul clic.
6. **Point décisif : une réponse certaine établit que sa place est réservée.** Votre inscription est confirmée et la phrase formation/date/heures précèdent le récapitulatif pratique, l’état d’envoi de confirmation/invitation, le contact Tema et Retour au catalogue.
7. Le courriel reçu et son invitation reprennent les informations ; elle ajoute le fichier `.ics` à son agenda. Si le lien en ligne manque encore, le message annonce sa transmission manuelle dans les jours précédant la formation, sans URL inventée.

Échecs : champs/accord invalides → correction sans perte des autres champs ; doublon reconnu → aucune nouvelle place. Conditions modifiées au clic → récapitulatif actuel et nouvelle confirmation, champs gardés. Dernière place perdue, résultat inconnu ou échec de courriel → F3. Si l’essai de transport impose une navigation Google, son effet sur les étapes 4–6 demandera sa validation distincte.

### F3 — Marie retrouve un résultat fiable après refus, interruption ou échec de courriel

1. Marie soumet sa demande avec ses coordonnées déjà remplies ; une saisie seule n’a réservé aucune place.
2. Refus certain pour dernière place prise : Cette session est désormais complète et Votre inscription n’a pas été enregistrée. Changer de date revient à la même fiche/mois et conserve les champs transitoirement pour une autre date de cette formation. Sans autre date réservable : Aucune autre date disponible pour le moment et contact Tema.
3. Réponse perdue : Nous n’avons pas pu vérifier le résultat de votre inscription. Elle active Reprendre mon inscription ; même demande/contenu, résultat existant prioritaire, sans seconde place ni renvoi email. Les champs restent remplis tant que la page reste ouverte.
4. Conditions modifiées au clic : le traitement relit le Sheet ; aucune réservation sur les anciennes conditions. Marie relit le récapitulatif actualisé et confirme à nouveau avec les champs conservés. Aucun suivi en direct du formulaire n’est requis.
5. **Point décisif : l’écran lui rend un état vérifié sans inscription en double.** Confirmation seulement si enregistrée ; ancienne demande annulée affichée annulée sans réactivation ; incertitude persistante nommée avec `temaacademie@gmail.com`.
6. Si la réservation est certaine mais le courriel échoue, la place reste réservée. L’avis de problème à Tema est tenté si possible ; Tema consulte les traces privées et les éventuels retours Gmail puis contacte manuellement Marie avec les informations actuelles. Aucune confirmation périmée ne part après annulation/modification ; aucun menu de renvoi applicatif ajouté.

Échecs persistants : résultat impossible à établir → contact Tema et vérification privée, sans nouvelle demande aveugle. Quota/interruption peuvent bloquer l’avis Tema aussi ; seule la trace privée demeure alors disponible. La reprise, le maintien transitoire des champs et les protections sont à prouver dans architecture/essai ; les HTML visuels ne les démontrent pas.

### F4 — Sofiane teste le rôle d’un employé Tema qui publie une session

1. Après un GO d’essai distinct, Sofiane suit le ModeEmploi et ouvre le Sheet de test séparé avec le compte autorisé. Les trois Gmail contrôlés prévus servent aux participants fictifs ; aucun compte ni accès n’est vérifié par ce récit.
2. Dans Formations, il vérifie le catalogue importé, ajoute une formation synthétique valide ou ajuste le statut actif dans les colonnes prévues.
3. Dans Disponibilités, il ajoute une cohorte synthétique : formation choisie, date future, heures, capacité librement configurable, mode, adresse en présentiel ou lien privé facultatif en ligne, ouverture/fermeture de cette date. Les contrôles, diagnostics et l’actualisation restent à définir techniquement ; aucun menu particulier n’est présumé.
4. Il actualise le site public ; Catalogue et Calendrier présentent la session en moins de deux minutes selon le critère de délai fixé dans la spécification.
5. Il fait une inscription fictive ; AvisTema doit arriver au destinataire contrôlé et la ligne apparaître dans Inscriptions. Il joue le contrôle manuel de l’entreprise après confirmation, sans attente client préalable.
6. **Point décisif : il retrouve le même enregistrement et la bonne capacité sans intervention technique de bkbx.**

Échecs : ligne incomplète → diagnostic privé sans casser les autres formations ; droits manquants → accès à résoudre, jamais publication du Sheet ; avis absent ou incertain → trace privée consultable et suivi Gmail. La présence de la session en moins de deux minutes, l’accès réel et la réception de l’avis seront des preuves à produire, pas des résultats acquis. Tema confiera l’accès de gestion avant remise.

### F5 — Sofiane teste annulation et replanification manuelles

1. Sofiane consulte le ModeEmploi puis l’inscription de test dans le Sheet privé.
2. Il annule dans le champ/opération autorisée, sans supprimer la ligne ni modifier l’identifiant.
3. Il vérifie le recalcul et l’affichage public de la place libérée selon le délai retenu.
4. Il peut inscrire à nouveau la personne fictive par un nouveau formulaire si formation active, date ouverte/publiée, non commencée et place disponible : nouvelle ligne/ID ; l’ancienne ligne reste annulée.
5. Pour modifier une session, il ferme les nouvelles inscriptions de cette date, modifie la même ligne en gardant identifiant, inscrits et historique, prévient manuellement les inscrits depuis Gmail, puis rouvre si souhaité selon date/capacité. Les personnes déjà inscrites gardent leur place, sans réinscription.
6. **Point décisif : le Sheet, la capacité publique et les informations communiquées concordent**, avec une preuve de recette conservée sans données personnelles.

Échecs : capacité sous les inscrits → nouvelles réservations fermées et écart signalé, sans annulation automatique. La fermeture manuelle ne prouve pas la protection d’une demande ou d’un envoi déjà en cours ; architecture et essai doivent établir ce comportement. Une confirmation initiale devenue périmée est bloquée, un envoi déjà effectué garde sa trace ; Tema vérifie puis contacte dans Gmail. Si l’information pratique ou la mise à jour d’agenda n’a pas été communiquée, elle reste une action manuelle à achever : éditer le Sheet ne la prouve pas.

## Responsive & Platform

| Usage | Comportement retenu et limite de preuve |
|---|---|
| Téléphone | Les deux calendriers montrent une liste des sessions du mois regroupées par jour, avec précédent/suivant. Récapitulatif immédiatement après la date explicitement ciblée ; mêmes statuts et choix. Cartes en une colonne sous 480 px dans la V2 ; formulaire dédié détaillé par les contrats. |
| Tablette/ordinateur | Grille mensuelle et récapitulatif voisin sur la fiche ; calendrier général sous les cartes. Les données actives du calendrier V2 sont à 12 px, tablette comprise. Le CSS bascule vers la liste sous 760 px ; ce seuil est une référence de composition. Aucun survol indispensable. |
| Google Sheets/Gmail | Interfaces natives privées, accès sous le compte confié par Tema ; gestion principalement à éprouver sur ordinateur. Aucun back-office ou nouvel outil mobile ajouté. |
| Courriels/agenda | Confirmation lisible en texte ; fichier `.ics` à vérifier dans Google Agenda, Outlook et Apple Calendar lors de l’intégration réelle. Aucune intégration OAuth aux agendas. |

Les observations locales du parent et le contrôle ciblé Sally portent sur les vues V2 examinées ; ils ne prouvent ni le parcours complet sur appareils réels ni le transport Google/Vercel. Les cinq HTML sont autonomes sans script ni chargement réseau nécessaire au rendu ; ce format de maquette n’impose pas l’architecture de réalisation.

## Inspiration & Anti-patterns

Le [site actuel Tema, relevé local](.working/observations-site-tema-2026-10-24.md) fournit le logo et le rose source ; la future refonte David n’est pas disponible. La modernisation choisie dans la [planche V2](mockups/direction-tema-style-v2.html) remplace ses polices observées par Manrope/Inter, sans prétendre reproduire sa charte.

Les corrections V2 évitent les slogans génériques avant l’offre, le récapitulatif mobile éloigné de la date, les horaires/statuts minuscules et la même flèche décorative pour tout. Elles préservent la simplicité publier → consulter → s’inscrire ; aucun écran métier supplémentaire ne découle de ces choix graphiques. Sofiane estime néanmoins le rendu encore trop générique : le retravail visuel est différé, sans nouveau style choisi pendant cette clôture.

## Couverture des capacités et décisions ouvertes

| Capacité | Surfaces et parcours | Limite/document complémentaire |
|---|---|---|
| CAP-1 — Comprendre les formations | S1/S2 ; F1/F2 ; CarteFormation/FicheFormation. | 24 formations réelles du catalogue, pas les 9 webinaires ; préservation dans [reconcile-catalogue.md](reconcile-catalogue.md). |
| CAP-2 — Choisir une session | S2/S3 ; F1/F2/F4. | Règles de mois, priorité de date explicite, grille/liste et visibilité confirmées ; fermée sans confirmé masquée, terminée avec confirmé visible ; transport et données fraîches à prouver. |
| CAP-3 — Administrer sans développeur | S8/S9 ; F4/F5. | Capacité par date sans plafond huit, actif/inactif et commande d’ouverture distincts ; validations, protections et actualisation à prouver, aucun menu nouveau prescrit. |
| CAP-4 — Réserver une place | S4/S5 ; F2/F3. | Fonctions et dispositions approuvées, S4/S5 illustrées ; maintien transitoire et reprise à prouver techniquement, finition graphique différée. |
| CAP-5 — Recevoir confirmation et agenda | S5/S6/S7/S9 ; F2/F3/F4/F5. | Place maintenue ; avis d’échec tenté vers Gmail puis suivi manuel, sans relance applicative. Lien en ligne manquant transmis manuellement. Quota, réception et agendas non prouvés. |
| CAP-6 — Gérer les changements manuellement | S8/S9/S10 ; F5. | Fermer/modifier même ligne/prévenir Gmail/rouvrir validé ; réinscription nouvelle ligne après annulation ; protection des opérations en cours non prouvée. |
| CAP-7 — Protéger les données et traiter les erreurs | S4/S5/S9/S11 ; F2/F3/F4/F5. | Contact validé ; politique dédiée et modalités des 12 mois à faire valider, nettoyage manuel par Emma ; responsable légal à préciser, droits/reprise à prouver. |
| CAP-8 — Exploiter et recevoir la solution | S10 puis S8/S9 ; F4/F5. | Guide, ajustements et séance de 30 minutes ; accès et destination d’exploitation à accepter avant site V1 publié, intégration David reportée. |

Restent à leur jalon : texte dédié/accord de confidentialité, responsable et modalités des 12 mois à faire valider par Tema ; montants finaux et informations pratiques ; droits effectifs et récupération ; architecture/transport/plan puis GO d’essai ; remise et destination finale acceptées. Logo, rose et Manrope/Inter restent la base V2 retenue ; la finition graphique sera retravaillée et n’est pas approuvée comme exécution finale. La charte officielle de la refonte de David demeure indisponible. Les codes formateurs restent privés.

Aucun essai produit n’est exécuté ; F1–F5 décrivent les parcours et preuves futures sur ressources fictives séparées. L’approbation fonctionnelle des parcours et dispositions est acquise ; le retravail graphique, l’essai, le développement et la livraison gardent leurs décisions et GO distincts.
