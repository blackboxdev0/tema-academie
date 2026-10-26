# Revue visuelle de Sally — Tema Académie

Date : 24 octobre 2026. Statut : avis de designer sur une proposition, à discuter avec Sofiane.

Je recommande de conserver cette base et de faire une passe ciblée avant de figer la direction. Le logo, le rose et les contenus réels donnent déjà des points d’appui solides. L’impression de maquette générique vient surtout de l’accumulation d’accroches avant le catalogue, puis de quelques composants dont la composition prend le pas sur l’usage. Une meilleure rédaction et une hiérarchie plus utile apporteront davantage qu’un changement complet de style.

## Activation native et éléments examinés

Le vrai skill [Sally — UX Designer](../../../../../.agents/skills/bmad-agent-ux-designer/SKILL.md) a été lu et son activation exécutée :

```text
uv run /Users/sofiane/Software/tema/_bmad/scripts/resolve_customization.py --skill /Users/sofiane/Software/tema/.agents/skills/bmad-agent-ux-designer --project-root /Users/sofiane/Software/tema --key agent
uv run /Users/sofiane/Software/tema/_bmad/scripts/resolve_config.py --project-root /Users/sofiane/Software/tema
```

Les deux commandes ont réussi. Les listes de hooks prepend/append et de faits persistants étaient vides ; aucune étape supplémentaire n’était à exécuter. Persona Sally et configuration française adoptées. La demande de critique ciblée est traitée comme une continuation d’expertise prévue à l’étape 8 du skill ; ce rapport ne prétend pas être une validation globale du workflow `bmad-ux`.

Sources relues : `AGENTS.md`, configuration et contexte courant du projet, handoff, les 50 entrées du journal UX, la [synthèse de proposition](../.working/proposition-visuelle-tema-2026-10-24.md), le [relevé du site Tema](../.working/observations-site-tema-2026-10-24.md), ainsi que les sources HTML de [l’accueil](../.working/direction-tema-academie.html), de [la fiche](../.working/direction-tema-fiche.html) et de [la palette](../.working/direction-tema-style.html). Les décisions récentes du journal gouvernent le périmètre de cette revue.

Neuf images ont effectivement été ouvertes et regardées avec l’outil de visualisation d’images :

- La référence actuelle de Tema : `/tmp/tema-academie-proposition-2026-10-24/site-tema-actuel.jpg`.
- Dans `/Users/sofiane/.codex/visualizations/2026/10/19/01a1551a-3732-7bb3-b932-f618697f98c4/tema-proposition-2026-10-24/` : `accueil-desktop.jpg`, `accueil-mobile.jpg`, `calendrier-mobile.jpg`, `palette-desktop.jpg`.
- Dans son sous-dossier `revue-sally-v1/` : `accueil-complet-desktop.jpg`, `accueil-complet-mobile.jpg`, `fiche-complete-desktop.jpg`, `fiche-complete-mobile.jpg`.

Les vues complètes de l’accueil et de la fiche couvrent les largeurs de 1280 et 390 px. Les premières captures d’accueil montrent aussi les premiers écrans à 1280 × 720 et 390 × 844 px. La planche palette a été vue sur sa partie supérieure et lue dans sa source HTML.

## Ce qui mérite d’être conservé

- **Le lien de marque est visible.** Le logo original associé à « Académie » fonctionne ; le rose vif du grand titre retrouve une couleur réellement présente chez Tema. Les fonds clairs laissent le contenu respirer. Le rose d’action plus foncé reste cohérent avec cette famille de couleur.
- **Le contenu donne de la crédibilité.** « Ergonomie », « Dimo – Reporting/BI » et les autres intitulés réels, les durées, les tarifs et les disponibilités permettent de comparer une offre concrète. Leur présence est plus utile que des illustrations décoratives supplémentaires.
- **Les cartes ont une structure stable.** Logiciel, titre, tarif, prochaine date et accès à la fiche se retrouvent au même endroit. Les titres longs restent lisibles. Les états « Complet », « Inscriptions terminées » et « Dates à venir » sont écrits en toutes lettres.
- **Les deux écrans appartiennent au même ensemble.** Même en-tête, même rythme typographique, mêmes repères logiciels, mêmes couleurs d’action. La fiche est particulièrement claire sur ordinateur : titre et tarif, calendrier avec récapitulatif à côté, puis programme et prérequis.
- **L’adaptation du calendrier au téléphone sert bien la lecture.** Les jours, les intitulés et les horaires se lisent en liste ; le nom du logiciel accompagne sa couleur. Les filtres restent peu nombreux et explicites.

## Corrections ciblées

### 1. Donner la priorité au catalogue dans le premier écran

**Constat visible.** L’accueil enchaîne « Votre expertise, un cran plus loin », « Vos outils, tout leur potentiel », « De nouveaux réflexes. Pour votre travail de tous les jours », puis « Faites place à de nouvelles compétences ». Le calendrier ajoute ensuite « La bonne formation. Au bon moment ». Ces formules pourraient appartenir à de nombreux organismes de formation. Dans les captures du premier écran, aucun titre de formation n’est encore visible : seules les bordures supérieures des cartes arrivent en bas, sur ordinateur comme sur téléphone.

**Effet pour le visiteur.** Une personne venue trouver sa formation Divalto traverse plusieurs promesses similaires avant de pouvoir lire l’offre. Le catalogue est bien la première section, mais l’entrée visuelle reste dominée par la présentation publicitaire.

**Correction proposée.** Conserver une seule accroche expressive et rendre le titre principal ou son voisin immédiat descriptif, par exemple « Formations Divalto, Dimo et MoovApps ». Remplacer le second grand slogan par « Les formations », et celui du calendrier par « Calendrier des formations ». Réduire l’espace et les textes du bloc `.hero-note` pour rapprocher les filtres et les premières cartes ; vérifier ensuite que le premier intitulé apparaît dans les deux vues de premier écran. L’objectif est de rendre l’offre tangible plus tôt, sans ajouter de section.

Une finition éditoriale va dans le même sens : la carte Ergonomie reprend un long passage de programme alors que la carte Dimo – Reporting/BI contient une courte description. Une phrase factuelle de même niveau serait plus facile à parcourir, par exemple « Personnaliser Divalto, naviguer plus vite et utiliser raccourcis et favoris », avec le programme complet conservé dans la fiche. Dans cette fiche, la phrase « Formation destinée aux utilisateurs de Divalto souhaitant améliorer leur efficacité au quotidien » apparaît à la fois en présentation et sous Prérequis ; la garder en présentation permettrait aux prérequis de commencer directement par les connaissances et l’équipement nécessaires. La note répétée « Ces prérequis vous aident à choisir la formation adaptée » peut être retirée.

**Zones :** accueil `.hero`, `.hero-note`, `#catalogue .section-heading`, `#calendrier .section-heading`, `.card-description` ; fiche `#ergonomie .program-block`.

### 2. Rapprocher le récapitulatif de la date choisie sur téléphone

**Constat visible.** Dans la fiche Ergonomie à 390 px, la session du 12 novembre est sélectionnée, mais son récapitulatif et « S’inscrire à cette date » se trouvent après les lignes du 20 novembre complet et du 27 novembre aux inscriptions terminées. L’adaptation passe le bloc `.selection-panel` sous l’ensemble du calendrier. Sur ordinateur, le récapitulatif reste à côté de la sélection et cette relation est beaucoup plus immédiate.

**Effet pour le visiteur.** Après avoir trouvé une date ouverte, il faut continuer à travers deux dates non réservables pour atteindre l’action correspondante. La chronologie du mois s’interpose entre le choix et sa suite.

**Correction proposée.** Sur téléphone, composer le récapitulatif immédiatement sous la ligne sélectionnée, puis reprendre les autres dates dans l’ordre. Conserver le même récapitulatif et le même bouton, ainsi que la liste mensuelle validée ; tout ce bloc reste avant le programme. Ce placement reprend la date déjà choisie dans le parcours, notamment celle explicitement cliquée dans le calendrier général : il ne choisit pas une autre date et ne change pas la règle d’ouverture. La mise en évidence de la date existe déjà ; elle doit rester cohérente avec ce récapitulatif rapproché. Il s’agit d’une correction de placement responsive, sans nouvelle sélection automatique ni fonction métier.

**Zones :** fiche `.calendar-and-selection`, `.mobile-agenda`, `.selection-panel` dans la règle responsive à 760 px.

### 3. Rééquilibrer la typographie du calendrier sur ordinateur

**Constat visible et confirmé dans le CSS.** Le mois occupe une grande surface, mais les événements restent très petits. Dans le calendrier général, le titre d’événement est à 11 px et son statut à 9 px. Dans la fiche, les horaires sont à 10 px et les statuts à 8 px ; le format est lui aussi à 8 px. Les captures complètes montrent ce décalage entre le grand cadre et les petites informations actives.

**Effet pour le visiteur.** Lire « Complet » ou distinguer un horaire demande plus d’attention que lire les grands titres alentour. Ce sont pourtant les informations qui déterminent si la date convient.

**Correction proposée.** Donner davantage de taille aux horaires, intitulés et statuts des événements, en visant une lecture proche du petit corps courant, autour de 12 px, puis ajuster la hauteur des cellules au contenu. Garder les titres entiers. Les numéros de jours et la légende peuvent rester secondaires. Vérifier particulièrement la fiche, dont les cellules sont plus étroites que celles du calendrier général.

**Zones :** accueil `.event .event-title`, `.event .event-status` ; fiche `.detail-calendar .event .event-title`, `.event-software`, `.event-status`.

Cette observation porte sur la lisibilité des composants vus ; elle ne constitue pas un audit d’accessibilité complet.

### 4. Donner aux flèches un sens stable

**Constat visible.** La même flèche diagonale `↗` accompagne « Voir la formation et les dates », les lignes de date sur téléphone, « S’inscrire à cette date » et le contact par courriel. Dans les deux premiers cas, la destination appartient au parcours de consultation ; la sélection d’une date reste même dans la fiche.

**Effet pour le visiteur.** Le symbole n’aide plus à distinguer une progression dans le parcours d’une sortie vers un service de contact. Sa répétition devient surtout un motif décoratif.

**Correction proposée.** Employer une flèche droite pour l’accès interne à une fiche, et un signe de sélection ou de détail pour une date. Le bouton d’inscription se suffit avec son libellé ; la diagonale peut être réservée aux destinations externes si cette convention est retenue. Appliquer le choix de manière cohérente dans les deux écrans et la planche de composants.

**Zones :** accueil `.card-cta`, `.agenda-arrow` ; fiche `.agenda-arrow`, `.recap .button` ; exemples correspondants de la planche style.

## Choix de goût à soumettre séparément

**Manrope et Inter.** L’association est lisible et soutient la modernisation autorisée. Elle apporte une tonalité plus géométrique et plus homogène que le site actuel, où Bitter donne aux titres un caractère plus marqué. Garder cette paire ou retrouver une touche de serif pour les seuls grands titres relève d’un choix de filiation de marque. Je garderais la paire actuelle pendant la passe de corrections ci-dessus ; le contenu et la composition doivent d’abord être jugés sur une version plus directe.

**Les index « 01 / », « 02 / ».** Ils donnent une tonalité de dossier éditorial à l’accueil et à la fiche. Les conserver ou les retirer peut se décider avec Sofiane selon le ton souhaité. Ils ne sont pas nécessaires pour comprendre les deux modes de consultation et ne doivent pas prendre davantage de place.

## Portée de cet avis

Revue fondée sur les captures réellement vues et les sources HTML, sans nouvelle recherche, sans manipulation du navigateur ni retouche des maquettes. Les autres fiches présentes dans le HTML ont été lues ; leur rendu visuel complet n’a pas été observé séparément. Les états non photographiés et les comportements de navigation n’ont pas été rejoués ici.

Les dates, horaires, modalités et places sont fictifs et déclarés. Le formulaire réel, la conservation du contexte entre fichiers et l’intégration Google ne sont pas validés par ces images. Les choix métier confirmés restent la référence ; ce rapport ne réouvre pas leur cadrage et ne remplace pas la consolidation documentaire prévue.

## Avis de designer

Je poursuivrais avec cette direction. Elle dispose de bons repères Tema et d’une structure utile pour choisir une formation. Avant son arbitrage visuel final, je recommande quatre corrections :

1. Remplacer la succession de slogans par une entrée plus précise et plus courte, pour voir une vraie formation plus tôt.
2. Placer le récapitulatif mobile juste après la date choisie.
3. Agrandir les informations décisives dans les cellules du calendrier sur ordinateur.
4. Harmoniser le sens des flèches dans le parcours.

La version ainsi resserrée devrait être soumise à Sofiane avec les mêmes contenus et les mêmes largeurs de référence. Le choix de cette direction reste une décision humaine distincte de l’approbation UX globale.

## Addendum — contrôle ciblé de la V2

24 octobre 2026. Contrôle limité aux quatre corrections ci-dessus. Sources examinées : [accueil V2](../.working/direction-tema-academie-v2.html), [fiche V2](../.working/direction-tema-fiche-v2.html) et [planche V2](../.working/direction-tema-style-v2.html). Les six nouvelles captures du dossier `tema-proposition-2026-10-24/revue-sally-v2/` ont effectivement été ouvertes et regardées : `accueil-desktop.jpg`, `accueil-complet-desktop.jpg`, `accueil-mobile.jpg`, `accueil-complet-mobile.jpg`, `fiche-complete-desktop.jpg` et `fiche-complete-mobile.jpg`, aux largeurs de 1280 et 390 px.

| Correction | Statut | Constat sur la V2 |
|---|---|---|
| Entrée plus précise et catalogue rapproché | Observé | « Formations Divalto, Dimo et MoovApps » remplace l’accumulation d’accroches. « Les formations » et « Calendrier des formations » rendent les sections explicites. Le titre Ergonomie est désormais visible dans les deux captures du premier écran. Son résumé de carte est plus court et la répétition sous Prérequis a été retirée de la fiche. |
| Récapitulatif mobile après la date choisie | Observé | La capture de fiche montre le 12 novembre sélectionné, immédiatement suivi de son récapitulatif et du bouton d’inscription, puis les lignes du 20 complet et du 27 aux inscriptions terminées. Le bloc reste avant le programme. Le placement relie clairement choix et action. |
| Informations actives du calendrier agrandies | Observé | Les titres, horaires et statuts sont plus lisibles dans les captures sur ordinateur. Le CSS porte ces informations à 12 px dans le calendrier général et la fiche, y compris dans la règle de 761 à 1050 px. Les retours à la ligne restent lisibles dans la vue de fiche examinée. |
| Flèches harmonisées | Observé | Les accès internes utilisent `→` et les contacts n’emploient plus la même flèche décorative. L’accueil, la fiche et les exemples de la planche sont cohérents sur ce point. |

La V2 est effectivement plus directe et plus utile pour chercher une formation puis poursuivre depuis une date. Je ne relève pas de réserve supplémentaire sur ces quatre corrections dans les vues examinées.

Ce contrôle visuel n’a pas rejoué les interactions. La vérification navigateur à 900 px et celle des boutons désactivés ont été rapportées par le parent ; ici, la règle typographique correspondante et les attributs des boutons ont été lus dans la source. Le formulaire réel, Google et la conservation du contexte restent hors de ce contrôle. Aucun HTML n’a été modifié pendant cette relecture. L’avis ne constitue ni l’approbation graphique de Sofiane ni une validation des parcours réels.
