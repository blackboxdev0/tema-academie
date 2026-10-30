---
name: Tema Académie V1
description: Fonctions et dispositions UX approuvées ; base visuelle V2 conservée, finition graphique à retravailler.
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
colors:
  brand-pink: '#FF008F'
  action-pink: '#C6006F'
  action-hover: '#AD0061'
  ink-primary: '#20212B'
  ink-secondary: '#62636F'
  surface-base: '#F8F7F5'
  surface-raised: '#FFFFFF'
  border-default: '#DEDDDF'
  border-control: '#D3D0D4'
  surface-selected: '#FFF0F7'
  software-dimo: '#725070'
  software-moovapps: '#176C68'
  availability: '#236247'
  availability-background: '#EAF5EC'
  status-background: '#F1EFF1'
  status-text: '#62606A'
  disabled-background: '#EAE7EB'
  disabled-text: '#78717D'
typography:
  body:
    fontFamily: 'Inter, Arial, sans-serif'
    fontSize: 15px
    lineHeight: '1.6'
  display:
    fontFamily: 'Manrope, Arial, sans-serif'
    fontSize: 'clamp(44px, 5.1vw, 72px)'
    fontWeight: '750'
    lineHeight: '1.075'
    letterSpacing: '-0.055em'
  section-title:
    fontFamily: 'Manrope, Arial, sans-serif'
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.16'
    letterSpacing: '-0.035em'
  card-title:
    fontFamily: 'Manrope, Arial, sans-serif'
    fontSize: 23px
    fontWeight: '700'
    lineHeight: '1.23'
  calendar-meta:
    fontFamily: 'Inter, Arial, sans-serif'
    fontSize: 12px
    lineHeight: '1.4'
  action:
    fontFamily: 'Inter, Arial, sans-serif'
    fontSize: 13px
    fontWeight: '650'
    lineHeight: '1.45'
rounded:
  card: 18px
  control: 9px
  status: 6px
  event: 5px
  filter: 99px
spacing:
  page-desktop: 48px
  page-tablet: 32px
  page-mobile: 20px
  card-gap: 20px
  card-inset: 26px
  calendar-inset: 24px
  selection-gap: 26px
components:
  NavigationAcadémie:
    accent: '{colors.brand-pink}'
    background: '{colors.surface-raised}'
    border: '{colors.border-default}'
  FiltreLogiciel:
    radius: '{rounded.filter}'
    selectedBackground: '{colors.ink-primary}'
    selectedForeground: '{colors.surface-raised}'
  CarteFormation:
    background: '{colors.surface-raised}'
    border: '{colors.border-default}'
    radius: '{rounded.card}'
    titleFamily: '{typography.card-title.fontFamily}'
  CalendrierMensuel:
    background: '{colors.surface-raised}'
    border: '{colors.border-default}'
    radius: '{rounded.card}'
    eventRadius: '{rounded.event}'
    metadataSize: '{typography.calendar-meta.fontSize}'
  ListeCohortes:
    background: '{colors.surface-raised}'
    selectedBackground: '{colors.surface-selected}'
  SélecteurCohorte:
    background: '{colors.surface-base}'
    accent: '{colors.brand-pink}'
  IndicateurDisponibilité:
    availableForeground: '{colors.availability}'
    availableBackground: '{colors.availability-background}'
    closedForeground: '{colors.status-text}'
    closedBackground: '{colors.status-background}'
    radius: '{rounded.status}'
  BoutonAction:
    background: '{colors.action-pink}'
    foreground: '{colors.surface-raised}'
    hoverBackground: '{colors.action-hover}'
    disabledBackground: '{colors.disabled-background}'
    disabledForeground: '{colors.disabled-text}'
    radius: '{rounded.control}'
  MessageÉtat:
    foreground: '{colors.ink-primary}'
    background: '{colors.surface-base}'
---

# Tema Académie — DESIGN

## Brand & Style

**Fonctions, parcours et dispositions UX approuvés par Sofiane le 25 octobre 2026 ; finition graphique différée.** La base V2 — logo Tema original, rose et association Manrope/Inter — reste retenue. Sofiane juge le rendu trop générique et souhaite reprendre la finition graphique plus tard ; les maquettes ne sont pas une exécution visuelle finale approuvée. La refonte de David reste indisponible et aucune charte officielle Tema n’est déclarée.

Ce document possède les décisions visuelles ; [EXPERIENCE.md](EXPERIENCE.md) possède les parcours, les états et les interactions. **En cas de conflit avec une maquette, une importation ou une ancienne proposition, les deux contrats font référence jusqu’à décision humaine explicite.** L’approbation fonctionnelle permet le passage à l’architecture ; elle n’autorise ni essai réel, développement, commit, fusion ou livraison. Le retravail graphique reste un chantier ultérieur distinct.

Le [logo importé](imports/site-tema-2026-10-24/logo-tema.png), PNG 400 × 146 du site actuel, est conservé intact et accompagné du mot Académie, sans redessin. Le [relevé de source](.working/observations-site-tema-2026-10-24.md) et la [réconciliation du site](reconcile-site-tema.md) distinguent ce qui est observé et ce qui relève de la modernisation choisie. Le gris indicatif #585D6B du brief reste historique ; il n’impose pas une couleur supplémentaire à la V2.

Références promues : [accueil V2, catalogue puis calendrier](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-academie-v2.html), [fiche V2, dates puis programme](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-fiche-v2.html), [planche V2, base de couleurs et typographies](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-style-v2.html), [formulaire S4](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html#normal) et [confirmation S5](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-confirmation-v2.html#confirmee). Les fichiers conservent leurs mentions de proposition historiques ; les décisions des 24–25 octobre approuvent leurs dispositions et conservent la base d’identité, avec finition graphique à reprendre. Dates, places, modalités et horaires restent fictifs, actions d’inscription illustratives. Les six formations représentées ne remplacent pas les 24 sources ni le choix des formations actives au lancement.

Les quatre corrections de composition retenues avec la V2 restent des références de disposition : titres descriptifs et offre remontée ; récapitulatif mobile près de la date choisie ; données utiles du calendrier lisibles ; flèches internes cohérentes et contact en texte. La [réconciliation V2](reconcile-direction-v2.md) relie ces intentions aux contrats. Les sources V1 et .working sont conservées ; aucun contenu métier n’est déduit des dates de démonstration.

## Colors

Les tokens sont extraits du CSS des trois premières références V2. Ils documentent la base de travail conservée et seront réévalués lors du retravail graphique ; ils ne décrivent pas une exécution finale approuvée. Les valeurs complémentaires et leurs usages ne sont pas les identités officielles des logiciels.

| Tokens | Usage dans la V2 |
|---|---|
| `{colors.brand-pink}` | Rose Tema observé #FF008F : grand accent, signature de navigation et filet du récapitulatif. |
| `{colors.action-pink}`, `{colors.action-hover}` | Action à texte blanc et état de survol ; le rose d’action #C6006F est distinct du rose source. |
| `{colors.ink-primary}`, `{colors.ink-secondary}` | Titres/texte principal graphite et descriptions/métadonnées secondaires. |
| `{colors.surface-base}`, `{colors.surface-raised}` | Fond papier et surfaces blanches des cartes, calendriers et en-tête. |
| `{colors.border-default}`, `{colors.border-control}`, `{colors.surface-selected}` | Séparation, contours des commandes et repère de date sélectionnée. |
| `{colors.software-dimo}`, `{colors.software-moovapps}` | Prune Dimo et bleu-vert MoovApps ; Divalto reprend le rose d’action. Les noms restent écrits. |
| `{colors.availability}`, `{colors.status-background}`, `{colors.status-text}` | Places restantes en vert avec texte ; Complet et Inscriptions terminées dans des statuts neutres. |
| `{colors.disabled-background}`, `{colors.disabled-text}` | Action d’inscription désactivée, accompagnée d’une raison lisible. |

Mesures de luminance déjà calculées sur quatre associations : blanc/rose source **3,72:1** ; blanc/rose d’action **5,78:1** ; graphite/fond papier **14,93:1** ; secondaire/blanc **5,94:1**. Le rose source ne porte donc pas de petit texte blanc. Le contraste visé reste 4,5:1 pour le texte courant, 3:1 pour le grand texte et les éléments nécessaires à l’identification des contrôles. Les mesures sont partielles : focus sur chaque fond, repères logiciels, états désactivés et toutes les combinaisons de la réalisation restent à vérifier. Aucun audit WCAG global n’est annoncé.

Les variantes S4/S5 utilisent le titre, le texte et l’action pour distinguer leurs états ; aucune nouvelle couleur ou règle graphique n’est ajoutée par cette clôture documentaire. Les variantes sombre ou de marque ne sont pas ajoutées.

## Typography

**Manrope pour les titres ; Inter pour la lecture et l’interface**, base d’identité V2 maintenue. Les sources officielles Google Fonts et les licences OFL 1.1 sont conservées dans .working/tema-assets/ et embarquées dans les HTML. Arial puis sans-serif servent de repli dans leur CSS. Le site actuel utilisait Bitter, Open Sans et Lato ; ces observations sont une filiation, pas la police retenue pour Académie.

Les rôles du frontmatter reprennent les styles V2, sans créer une nouvelle rampe. Le titre d’accueil utilise `{typography.display.fontFamily}` ; les cartes `{typography.card-title.fontSize}` ; les horaires, formats et statuts utiles des cellules atteignent `{typography.calendar-meta.fontSize}`, y compris la règle tablette. Le corps reprend `{typography.body.fontSize}` et `{typography.body.lineHeight}`.

Le CSS adapte les titres : section 36 px sur ordinateur et 29 px sur téléphone, fiche 57 px puis 43 px, titre de carte 23 px avec variantes existantes selon la largeur. Ces valeurs sont des références de composition, pas une approbation isolée de chaque pixel. Le nom complet, le tarif qualifié et les informations utiles ne doivent pas être tronqués ; zoom et retour à la ligne restent possibles. Programme, objectifs/résultat et prérequis restent complets sur la fiche ; les codes internes des formateurs restent privés.

## Layout & Spacing

### Indicateur de disponibilité validé — 29 octobre 2026

Sofiane retient une pastille vert pâle#EAF5EC, point décoratif et texte vert foncé#236247, avec nombre et libellé préservés. Appliquée aux places disponibles du catalogue, des calendriers, des récapitulatifs et du formulaire. Point CSS sans contenu textuel, retour à la ligne permis dans les cellules étroites ; ratio texte/fond calculé6,45:1. Complet/terminé/sans date restent neutres ; la confirmation ne reçoit pas un compteur de places. Aucun changement d’éligibilité ou de réservation.

### Modèle de fiche étendu — 29 octobre 2026

[Les24fiches courantes](.working/fiche-tema-academie.html) déclinent désormais la composition Ergonomie : présentation, programme/résultat/prérequis sur blanc, puis dates/récapitulatif ; états sans date, complet/terminé et tarif à confirmer. Les repères logiciels sont ceux déjà retenus ; la pastille de disponibilité est ensuite validée et appliquée. Cette généralisation est prête à examiner ; anciennes sources de mockups archivées dans l’historique Git et retirées localement.

### Formulaire et confirmation harmonisés — 29 octobre 2026

Finition des champs validée par Sofiane le29octobre : fine bordure grise au repos, une seule bordure rose de2px au focus, sans contour extérieur ni ombre supplémentaire. Hauteur48px conservée ; erreurs et indicateurs de focus des autres composants inchangés. Rendu au clavier observé dans la maquette inscription.

Références de travail à examiner : [inscription](.working/inscription.html#normal) et [confirmation](.working/confirmation.html#confirmee). Surfaces blanc/gris#F4F4F4, bordures fines/faibles rayons, identité/logo/fonts existants, grand numéro de date blanc sur rose et action graphite#20212B ; les flèches présentes sont distinctes des labels soulignés. Récapitulatif avant les champs et messages/états fonctionnels conservés. Sofiane valide ensuite cette étape du formulaire courant, après finition des inputs ; la confirmation est ensuite explicitement validée le29octobre. Les anciennes sources promues restent historiques.

### Clarification des CTA — 29 octobre 2026

Le programme Ergonomie rejoint la surface blanche des dates, sans encadré dans l’introduction. Sofiane précise qu’il aimait les flèches et le soulignement indiquant le CTA : seul le texte doit être souligné, jamais l’icône. « Voir les dates » retrouve son bouton graphite avec flèche ; boutons principaux conservés. Labels et icônes sont deux éléments séparés ; le soulignement est porté par le label aux états interactifs, pas par le parent. La suppression antérieure des flèches était une mauvaise interprétation, corrigée dans les trois maquettes courantes. Les chevrons fonctionnels et le calendrier restent inchangés. Pastilles vertes non encore décidées ; rendu à examiner.

### Révision ciblée Ergonomie — 28 octobre 2026

À la demande explicite de Sofiane, la fiche Ergonomie en revue place désormais programme, résultat attendu et prérequis avant le calendrier. Présentation compacte et accès rapide aux dates ; calendrier à en-tête blanc, gris clair et repères Tema, récapitulatif structuré dans la continuité de l’accueil retenu. Textes client conservés. Cette décision prévaut pour Ergonomie sur l’ordre historique dates puis programme décrit dans la référence V2 ci-dessous ; elle autorise une maquette à examiner, sans approbation de sa finition ni généralisation aux autres fiches. Rendu courant : [.working/fiche-ergonomie.html](.working/fiche-ergonomie.html).

L’[accueil V2](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-academie-v2.html#catalogue) présente le catalogue avant le [calendrier général](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-academie-v2.html#calendrier). L’en-tête donne accès aux deux sections. Les titres « Formations Divalto, Dimo et MoovApps », « Les formations » et « Calendrier des formations » orientent directement ; aucun bloc de slogans n’est réintroduit avant l’offre. Les repères « 01 / », « 02 / » restent éditoriaux et n’ajoutent pas d’étape au parcours.

La [fiche V2](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-fiche-v2.html#ergonomie) est une source historique. Le modèle courant des24fiches suit l’ordre révisé : présentation courte, programme détaillé/résultat/prérequis puis dates. Sur ordinateur, le récapitulatif jouxte le calendrier ; sur téléphone, il se place immédiatement après la date explicitement choisie, avant les autres dates. À l’arrivée sans date ciblée, le récapitulatif de la prochaine date réservable est ouvert par défaut (clarification du29octobre). Une navigation manuelle vers un mois seul reste neutre, sans nouvelle présélection ; sans date réservable, l’inscription reste désactivée.

Les espacements sont extraits du CSS V2 : contenu maximal de 1 224 px, marges latérales de 48 px dérivées de `calc(100% - 96px)`, 32 px à la règle tablette puis 20 px sur téléphone. Les tokens `{spacing.card-gap}`, `{spacing.card-inset}`, `{spacing.calendar-inset}` et `{spacing.selection-gap}` reprennent les valeurs des composants ; les adaptations mobiles restent dans les références sélectionnées. Aucune échelle générique supplémentaire n’est créée.

Dans la V2, trois colonnes de cartes deviennent deux sous 760 px puis une sous 480 px. Les deux calendriers passent d’une grille mensuelle à une liste des sessions du mois regroupées par jour sous 760 px. Le seuil vient du CSS choisi ; la règle métier ne change pas avec la largeur. L’information disponible et le parcours sont les mêmes, sans obligation de survol.

Le [formulaire dédié S4](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html#normal) illustre la disposition approuvée : titre de page, récapitulatif formation/date/horaires/format/lieu/tarif, coordonnées, accord puis Confirmer mon inscription ; Changer de date reste accessible. Les champs occupent deux colonnes sur grand écran et une sur téléphone dans la référence. Les libellés restent visibles, le téléphone est facultatif, l’accord initial est décoché ; sa rédaction et la politique restent à valider par Tema. Les coordonnées sont conservées transitoirement pendant les reprises, sans sauvegarde personnelle durable.

La [confirmation S5](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-confirmation-v2.html#confirmee) place la certitude de réservation en premier, puis le récapitulatif pratique, l’état du courriel/invitation, puis Retour au catalogue et le contact Tema. Les variantes [échec d’envoi](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-confirmation-v2.html#envoi-echoue) et [envoi incertain](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-confirmation-v2.html#envoi-incertain) conservent cette hiérarchie et la place réservée. S4/S5 sont approuvées pour leur disposition et leur fonctionnement ; leur finition graphique est différée.

S6–S11 restent décrites uniquement dans les contrats (« spine-only » ci-dessous), avec interfaces Google/Gmail natives, guide et politique. **[ASSUMPTION COVERAGE]** Ce maintien est déduit de la clôture fonctionnelle et de la priorité donnée au fonctionnement ; il ne constitue pas un vote explicite sur une maquette de chaque surface et ne bloque pas l’architecture.

## Elevation & Depth

La V2 sépare les surfaces par fond blanc, papier et bordures légères ; elle ne dépend pas d’ombres. Les cartes ont un changement de contour et une translation de 2 px au survol sur grand écran, supprimée dans la règle téléphone. Les transitions CSS sont retirées lorsque la réduction des animations est demandée. Rien de nouveau n’est ajouté pour l’entrée, le succès ou la réservation.

## Shapes

Cartes et coque du calendrier : `{rounded.card}` ; commandes et boutons : `{rounded.control}` ; statuts : `{rounded.status}` ; événements : `{rounded.event}` ; filtres : `{rounded.filter}`. Le récapitulatif emploie le filet supérieur rose et les angles inférieurs arrondis présents dans la V2. Ces formes distinguent les usages sans transformer chaque donnée en pastille.

## Components

La même nomenclature figure dans [EXPERIENCE, Component Patterns](EXPERIENCE.md#component-patterns). Les règles ci-dessous portent l’anatomie ; les opérations Google héritent de leurs interfaces natives. Aucun menu supplémentaire de suspension ou de relance n’est une exigence.

| Composant | Anatomie visuelle et référence | États et limites |
|---|---|---|
| NavigationAcadémie | Logo original et Académie ; liens Catalogue/Calendrier ; contact textuel. Accueil V2. | Section active soulignée en rose ; focus visible, accès à la confidentialité conservé avant inscription. |
| FiltreLogiciel | Tous, Divalto, Dimo, MoovApps en boutons de filtre arrondis ; résultat en texte. | Sélection graphite/blanc ; nom et état explicites, couleurs en complément. |
| CarteFormation | Logiciel/titre, durée, tarif qualifié, prochaine date réservable/places ou statut, lien Voir la formation et les dates. | Carte blanche bordée, `{rounded.card}` ; les statuts ne masquent pas l’accès à une formation active. |
| FicheFormation | Présentation courte et durée/prix, programme/résultat/prérequis, calendrier et récapitulatif. Modèle courant24fiches. | Programme avant dates ; contenu complet, état Dates à venir ou aucune date réservable distinct. |
| CalendrierMensuel | Mois/année, commandes précédent/suivant, sept colonnes sur ordinateur, cellules nommées et statuts à 12 px. | Même contenu que la liste mobile ; Complet et Inscriptions terminées textuels, focus perceptible. |
| ListeCohortes | Jour et date à gauche, sessions du jour avec horaires/format/statut ; version téléphone des deux calendriers. | Date sélectionnée repérée, récapitulatif placé après cette ligne ; aucun créneau éligible perdu. |
| SélecteurCohorte | Date consultée puis récapitulatif date/heures/format/adresse/places ; action S’inscrire à cette date. | Action désactivée sans sélection explicite ou si non réservable ; lien visio absent du public. |
| IndicateurDisponibilité | Places restantes, Complet, Inscriptions terminées ou Dates à venir en texte. | Vert pour les places, neutre pour les états fermés, sans code couleur unique. |
| FormulaireInscription | [S4](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html#normal) : page dédiée, récapitulatif avant coordonnées, accord et action ; une colonne sur téléphone. | Disposition approuvée ; champs conservés transitoirement. Finition graphique à reprendre, aucune soumission réelle. |
| ChampSaisie | Libellé persistant, obligation/facultatif écrit, aide et [erreur associée](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html#erreur). | Inter reste la base ; pas de placeholder comme seul libellé. Disposition illustrée, traitement graphique final et accessibilité complète à vérifier. |
| ConsentementConfidentialité | Case non cochée, texte et lien lisibles, distincts de l’action. | Texte dédié à faire valider par Tema ; pas de consentement marketing implicite. |
| BoutonAction | Rose d’action/blanc, `{rounded.control}` ; libellé précis et flèche droite pour les liens internes de la V2. | Survol plus sombre ; états désactivé et envoi nommés ; aucune flèche décorative commune au contact. |
| MessageÉtat | Titre, explication et action persistants ; [complet/refus certain](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html#complet), [inconnu/reprise](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html#inconnu), [conditions modifiées](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html#conditions-modifiees). | Aucun succès ou refus certain sur une issue inconnue ; champs et mêmes informations conservés selon le parcours. Finition graphique différée. |
| RécapitulatifInscription | Formation/date/horaires/fuseau/format/lieu/tarif ; avant champs en S4, après confirmation de la place en S5. | Tentative courante seulement ; réservation et envoi distincts. [Horaires modifiés](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-confirmation-v2.html#horaires-modifies) cohérents avec la reconfirmation, données fictives. |
| CourrielParticipant | Identité Tema, confirmation, informations pratiques, invitation et contact. | Lien privé s’il existe ; annonce d’envoi manuel sinon ; mise en forme simple sans dépendance aux images. |
| AvisTema | Résumé privé, inscription/session, lien au Sheet, problème d’envoi ou lien à transmettre si concerné. | Destinataire prévu `temaacademie@gmail.com` ; aucune réception garantie si le canal échoue aussi. |
| FeuilleAdministration | Onglets/en-têtes Google ; actif/inactif distinct d’ouverture/capacité par date ; statut et traces privées. | Identifiants/historique/calculs protégés selon contrat technique à éprouver ; pas de style de back-office nouveau. |
| ModeEmploi | Procédures courtes par tâche et exemples fictifs, vocabulaire du Sheet/Gmail. | Fermer/modifier même ligne/prévenir/rouvrir ; suivi manuel et conservation retenue, sans donnée réelle. |
| LienPolitique | Intitulé explicite vers le texte dédié et validé, consultable avant accord. | Emplacement du lien conservé dans navigation/parcours ; page non maquettée, publication bloquée tant que texte/lien non validé. |

## Do's and Don'ts

| À faire | À éviter |
|---|---|
| Conserver logo, rose source et typographies de la V2 choisie. | Présenter la direction comme la charte officielle de Tema ou la future refonte de David. |
| Employer le rose d’action pour les actions à petit texte blanc. | Poser ce texte sur le rose source à 3,72:1. |
| Donner le sens par noms, dates, places et messages. | Faire porter le logiciel ou la disponibilité uniquement par couleur. |
| Garder une entrée descriptive et le programme avant les dates, avec accès rapide Voir les dates. | Réintroduire des slogans qui repoussent l’offre ou cacher la date choisie sous les autres sessions mobiles. |
| Montrer une place certaine même si le courriel échoue ; distinguer résultat inconnu. | Déduire une réservation d’un clic ou promettre une relance automatique. |
| Garder les coordonnées transitoirement dans le parcours, jamais dans l’URL. | Ajouter une sauvegarde personnelle durable sans décision humaine. |
| Traiter les dates/places des mocks comme des exemples. | Publier les cohortes fictives ou déduire une intégration réelle de leur rendu. |
