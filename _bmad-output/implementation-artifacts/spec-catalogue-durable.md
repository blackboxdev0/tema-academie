---
title: 'Catalogue frais et durable par lecture groupée'
type: 'feature'
created: '2026-11-02'
status: 'in-review'
route: 'oneshot'
---
<frozen-after-approval>
## Intent
GO Sofiane après prototype : intégrer la lecture groupée comme lecteur public normal, garder Sheets unique source, dates/formations correctes dès leur premier affichage, sans republication pour modifier les données. Retirer le catalogue livré et le cache navigateur de démarrage. Réutiliser validation/recomptage et admission existantes. Recette Google TEST autorisée, aucun GO main/PROD.
</frozen-after-approval>

## Implementation Notes
batchGet par défaut pour lire quatre tables en une requête et réutiliser publicCatalogue. Aucune instrumentation ou route de prototype dans le produit. Les cellules temporelles numériques exigent une lecture conditionnelle des formats via Sheets API avant conversion ; nombres sans format temporel laissés invalides. Dates canoniques texte : un appel. Aucun cache persistant client ni copie livrée, page réserve la zone catalogue jusqu’à la réponse. Échecs explicites avec reprise, aucune vieille date affichée en secours. POST et moteur d’admission conservés.

## Validation et remise
110 tests Node, build/sécurité, 7 contrôles bundle/ICS portables (2 ICS privés ignorés), 21 régressions administratives et 2 transitions VM réussis. 192 parcours navigateur réussis sur quatre profils. Revue indépendante effectuée ; file des lectures simplifiée, métadonnées sélectionnées par titre d’onglet et régression ajoutée. Preuve réelle TEST : version14, lecture fraîche, fiche→formulaire sans second GET ni POST, ancien stockage ignoré par tests navigateur. Recette humaine encore ouverte ; aucun commit, main ou production. Rapport : docs/project/acceptance/durable-catalogue-2026-11-02.md.
