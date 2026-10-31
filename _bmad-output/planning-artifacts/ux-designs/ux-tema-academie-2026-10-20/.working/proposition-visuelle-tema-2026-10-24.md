# Proposition visuelle Tema Académie — 24 octobre 2026

Statut : proposition à valider par Sofiane ; aucune charte officielle de la refonte de David disponible. Maquettes de cadrage locales, sans réservation réelle ni connexion Google/Vercel.

## Écrans proposés

- Accueil : catalogue puis calendrier (ancienne proposition retirée).
- Fiche formation : dates avant programme (ancienne proposition retirée).
- Palette et typographies (ancienne proposition retirée).

Les trois HTML sont autonomes et lisibles hors ligne, logo et fontes embarqués. Liens de navigation, filtres communs et changement de mois illustrés sans JavaScript. La conservation du filtre, du mois et de la position entre fichiers, ainsi que la page réelle d’inscription, restent à réaliser après les validations ; ils ne sont pas prouvés par cette maquette.

## Observé sur le site actuel

[Source Tema Solutions](https://www.temasolutions.ca/) consultée le 24 octobre : logo original, rose `#FF008F`, titres Bitter, corps Open Sans, navigation Lato. [Relevé](observations-site-tema-2026-10-24.md). Le logo original est conservé sans modification, avec la mention Académie à côté.

## Direction proposée

- Signature rose `#FF008F`, notamment sur les grands accents de titre.
- Rose d’action dérivé `#C6006F` pour les petits boutons à texte blanc.
- Titres Manrope ; texte et interface Inter. Fichiers officiels Google Fonts et licences OFL embarqués.
- Graphite `#20212B`, fonds clairs `#F8F7F5` et blanc, texte secondaire `#62636F`.
- Repères logiciels proposés : Divalto `#C6006F`, Dimo `#725070`, MoovApps `#176C68`, toujours accompagnés du nom en texte. Ces teintes ne sont pas présentées comme les couleurs officielles des éditeurs.
- Cartes sobres, bordures discrètes, composition aérée ; héros et en-tête resserrés pour rapprocher le catalogue.

## Vérifications de maquette

Contrôles du renderer : structure HTML, identifiants et liens locaux, logo/fontes/licences embarqués, aucun script et aucune ressource réseau au rendu. Observation parent au navigateur : accueil et fiche sur ordinateur 1280 px et téléphone 390 px, sans débordement horizontal constaté ; calendrier en grille sur ordinateur et liste par jour sur téléphone. Filtre Dimo : deux formations affichées et calendrier filtré ; clic sur la session Ergonomie du 12 : bonne formation et bonne date sélectionnées. Capture du héros après retouche et contrôle final à 390 px réalisés. Le bouton actif de la fiche utilise bien blanc sur `#C6006F`.

Contrastes calculés : blanc/rose de marque 3,72:1 (réservé aux grands accents lorsqu’appliqué au texte) ; blanc/rose d’action 5,78:1 ; graphite/fond clair 14,93:1 ; texte secondaire/blanc 5,94:1. Pas d’audit complet d’accessibilité ni de preuve d’intégration réelle déduits de ces mesures.

Six formations du catalogue fourni servent de contenu. Les dates, horaires, modalités et places sont fictifs et annoncés comme tels dans les maquettes ; les montants finaux de publication restent à confirmer par Tema. Aucun compte, paiement, collecte de participant ou publication ajouté.

Après arbitrage : extraire la direction retenue dans DESIGN.md, consolider EXPERIENCE.md avec les choix du journal et réconcilier la projection publique du contrat/AC-02 avant la revue d’architecture et du plan d’essai. L’approbation globale UX reste distincte du choix de cette direction et du GO de développement.
