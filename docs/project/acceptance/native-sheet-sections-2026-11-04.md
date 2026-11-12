# Sections natives par logiciel — 4 novembre 2026

Checkpoint de présentation conservé. L’ajout de formation/sessions a ensuite reçu un GO distinct et a été réalisé dans la même copie : [rapport fonctionnel](admin-sheet-journey-2026-11-04.md). Les nombres et réserves ci-dessous décrivent l’état avant cet ajout.

## Demande et périmètre

Sofiane demande de séparer aussi les disponibilités par logiciel, puis précise vouloir les couleurs propres aux logiciels sur le site : rose Divalto, bleu Dimo, vert canard MoovApps. L’interprétation initiale anthracite des filtres sélectionnés est corrigée. Itération autorisée sur la copie visuelle uniquement ; Inscriptions et Paramètres seront travaillés ensuite.

- [Formations](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=0#gid=0)
- [Disponibilités](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=336481329#gid=336481329)

Même copie privée **Tema Académie — ESSAI VISUEL — 2026-11-03**, compte Tema. Aucun changement dans le classeur source ou le site.

## Rendu réalisé et vérifié dans Google

Les six bandeaux reprennent les couleurs des logiciels définies par `app/apps-script/engine.js` et reprises dans `app/web/app.js` : **Divalto #FF008F**, **Dimo #365AA7**, **MoovApps #176C68**, avec texte blanc. Les séparateurs gris virtuels de la vue groupée ne proposent pas cette personnalisation dans les options examinées. Le prototype utilise donc trois tables natives successives par onglet, sans recopier les enregistrements.

| Onglet | Tables / sections | Enregistrements |
|---|---|---|
| Formations | Divalto, Dimo, MoovApps | 19 / 4 / 2, dont une formation TEST inactive dans Divalto |
| Disponibilités | Sessions_Divalto, Sessions_Dimo, Sessions_MoovApps | 3 / 1 / 1 |

Ordre Divalto → Dimo → MoovApps dans les deux onglets. Intitulé du logiciel directement dans l’en-tête visible ; détails techniques masqués. Cases de publication et d’ouverture définies comme champs Checkbox natifs. Horaires, capacités et places restent sur la ligne de chaque session ; places sur fond gris. Police 11 et largeurs lisibles conservées.

Tables Formations : A1:M20, A22:M26, A28:M30. Tables Disponibilités : A1:L4, A6:L7, A9:L10 ; colonne L vide ajoutée par l’inférence native, masquée avec K. Google insère automatiquement un espace au-dessus d’une table adjacente. La vue groupée précédente et son ancien lien `fvid` ne sont plus la référence.

Rendu des deux onglets retrouvé après rechargement ; état « Saved to Drive » et accès privé observés. Captures finales réelles hors dépôt : `/tmp/tema-formations-couleurs-logiciels-2026-11-04.png` et `/tmp/tema-disponibilites-couleurs-logiciels-2026-11-04.png`.

## Intégrité

Deux exports XLSX natifs de la copie, avant et après cette réorganisation, comparés localement. Enregistrements identifiés par leur ID stable, indépendamment des nouvelles lignes d’en-tête et des espaces ; les 13 valeurs de formation et 11 valeurs de session sont comparées. Booléens XLSX et représentations TRUE/FALSE normalisés.

- 25 formations avant/après, aucun identifiant dupliqué, toutes les valeurs égales.
- 5 sessions avant/après, aucun identifiant dupliqué, toutes les valeurs égales, dont dates, horaires, capacités, ouverture et places.
- Inscriptions et Paramètres : toutes les valeurs de cellules égales avant/après, aucune édition de ces onglets.

Nouvelle comparaison d’exports natifs avant/après le seul ajustement final des six couleurs : valeurs et formules de toutes les cellules strictement identiques dans les quatre onglets. Aucun déplacement de ligne ni changement de contenu à cette étape.

Exports et synthèse machine gardés temporairement hors dépôt, sans données brutes dans Git/Linear. Aucun script ajouté/exécuté, aucun envoi ou inscription ; toutes les écritures ont ciblé l’ID de la copie. La comparaison du classeur source réalisée le 3 novembre reste une preuve historique, pas une nouvelle mesure du 4 novembre.

## Limites et suite

Essai de présentation isolé, non raccordé au moteur. Ce découpage en plusieurs tables et les en-têtes français demandent une adaptation du lecteur avant toute intégration au source ; ce n’est pas un simple changement de couleurs compatible tel quel avec le contrat courant. Aucun double stockage de formation/session ajouté dans la copie.

Ajout de ligne, listes dépendantes, recalcul des places après saisie et moteur complet non recettés dans cette variante. Aucun bouton ou formulaire latéral ajouté. Acceptation de cette itération et prochaine étape Inscriptions/Paramètres encore ouvertes.

Aucun code produit modifié, commit, push, fusion ou déploiement. Les modifications antérieures du dépôt sont conservées.
