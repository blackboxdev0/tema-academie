# Rapport des revues UX — Tema Académie

- **DESIGN :** [DESIGN.md](DESIGN.md)
- **EXPERIENCE :** [EXPERIENCE.md](EXPERIENCE.md)
- **Date :** clôture du 25 octobre 2026

## Portée

La revue experte Sally demandée par Sofiane porte sur la composition, la rédaction et la lisibilité des maquettes accueil/fiche. Elle a réellement examiné les captures et les sources HTML, puis contrôlé les quatre corrections dans la V2. Les repères V2 restent retenus. Sofiane approuve les fonctions, parcours et dispositions le 25 octobre ; la finition graphique jugée trop générique reste à reprendre. Aucun test utilisateur, intégration Google/Vercel ou GO de développement ne découle de cette revue.

La revue optionnelle complète par rubrique n’a pas été sélectionnée et aucun verdict global n’est attribué. Le contrôle mécanique proactif de l’auteur est conservé dans [coverage-proactive.md](coverage-proactive.md), distinct de l’avis indépendant Sally. Les standards éditoriaux structure puis prose accompagnent la finalisation documentaire ; ils ne constituent pas une validation des comportements.

## Couverture documentaire

| Catégorie native | Preuve et portée |
|---|---|
| Parcours | Couverture auteur Pass 1 ; parcours reliés aux capacités et surfaces dans coverage-proactive.md. |
| Tokens | Résolution et valeurs contrôlées par l’auteur ; mesures de contraste partielles, pas d’audit WCAG complet. |
| Composants | Concordance des tables visuelles/comportementales vérifiée par l’auteur. |
| États | Contrôle auteur des surfaces ; erreurs et formulaire non démontrés par une intégration réelle. |
| Références visuelles | Cinq références HTML promues pour S1–S5 et leur disposition ; S6–S11 documentées sans maquette dédiée selon une hypothèse non bloquante. |
| Densité et prescriptions | Revue éditoriale structure/prose ; aucun verdict de rubrique UX indépendante demandé. |
| Héritage | Sources et liens contrôlés par l’auteur ; décisions fonctionnelles et graphiques distinguées. |
| Forme des contrats | Squelettes natifs contrôlés par l’auteur ; aucune note globale indépendante. |

## Corrections Sally

| Correction demandée sur V1 | Résolution observée sur V2 |
|---|---|
| Catalogue trop repoussé par des slogans | Entrée descriptive, titres de section explicites et premier intitulé visible dans les vues initiales ordinateur/téléphone. |
| Récapitulatif mobile après les autres dates | Récapitulatif et action immédiatement après la date choisie, avant les dates complètes/terminées. |
| Données du calendrier trop petites | Titres, horaires et statuts utiles à 12 px dans le CSS, y compris la règle tablette ; captures relues. |
| Flèches décoratives ambiguës | Flèches droites internes et contact textuel, cohérence accueil/fiche/style. |

Sally ne relève pas de réserve supplémentaire sur ces quatre corrections dans les vues examinées. Elle n’a pas rejoué les interactions ; le contrôle navigateur parent et la lecture des attributs restent des preuves distinctes. Son rapport n’attribue aucun niveau de sévérité : aucun classement n’est ajouté ici. Les quatre demandes sont résolues au niveau de la maquette.

## Clôture du 25 octobre et réserves

- Fonctions, parcours et dispositions UX approuvés ; classement confirmé, ordre du classeur à égalité.
- Réservation confirmée, refus certain et résultat inconnu restent distincts ; envoi initial en préparation/en cours, échec et incertitude séparés de la place déjà enregistrée.
- Cinq références de disposition pour S1–S5 ; S6–S11 restent spécifiées via tables/interfaces natives. Couverture maintenue par déduction de la clôture fonctionnelle, sans vote explicite par surface ; non bloquant pour l’architecture.
- Finition graphique à reprendre ; aucun essai réel, développement, commit ou livraison autorisé par la clôture UX.

## Rapports sources et limites

- [Revue Sally et addendum V2](reviews/review-sally-visuel-2026-10-24.md).
- [Contrôle mécanique auteur](coverage-proactive.md).
- [Standards éditoriaux de clôture](reviews/review-editorial-cloture-2026-10-25.md) : structure sans constat, deux lignes prose retenues et trois remplacements appliqués.
- [Revue éditoriale V2, structure puis prose](reviews/review-editorial-v2-2026-10-24.md) : un déplacement et quatre corrections de rédaction retenus, sans changement de règle.
- [Réconciliation de la direction retenue](reconcile-direction-v2.md).

Les dates/horaires/modalités/places des HTML sont fictifs ; le classeur réel conserve ses dates à venir. Formulaire connecté, conservation du contexte entre fichiers, réservation, courriels et agendas restent non éprouvés. La revue documentaire et l’approbation graphique ne clôturent pas TEM-5, qui couvre aussi architecture et plan d’essai.

## Formulaire et confirmation retenus pour leur disposition

À la demande de Sofiane, [formulaire](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html) et [confirmation](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-confirmation-v2.html) sont maintenant disponibles avec leurs variantes. Leurs dispositions sont approuvées et promues dans mockups/ ; le style final reste à retravailler. Les surfaces S4/S5 ne sont donc plus dépourvues de proposition visuelle ; les courriels et surfaces Google/Gmail/guide S6–S11 restent décrits par les tables.

[Revue Sally des deux nouveaux écrans](reviews/review-sally-inscription-confirmation-2026-10-24.md) : six captures vues, composition jugée cohérente avec la V2. Deux demandes ciblées sur le cas complet ont été appliquées puis observées dans un addendum : bouton Changer de date blanc sur rose ; statut courant Complet à la place des quatre places historiques. Le parent a revu les variantes et les largeurs 1280/390 ; [candidat et portée de QA](.working/qa-inscription-confirmation-2026-10-24.md). Aucun niveau de sévérité, note globale, preuve de réservation ou résultat Google réel n’est ajouté.
