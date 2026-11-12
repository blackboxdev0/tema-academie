# Source du catalogue — vérification du 30 octobre 2026

Sofiane fournit de nouveau le classeur client « Académie - Programmes pour le Pré Lancement.xlsx » pour la préparation de l’import V1. Le fichier est lu sans modification ; une copie privée vérifiée est conservée hors dépôt. Son chemin local et son empreinte figurent dans `config/project.json`.

## Structure et comparaison

- Feuille `Sheet1`, neuf colonnes métier : formation, prérequis, contenu, durée, prix, résultat, formateurs, personne au cours, date de cours. En-têtes `A5:I5` et `A27:I27`.
- 24 formations du périmètre V1 ; les neuf présentations/webinaires restent hors parcours d’inscription V1.
- Les 24 enregistrements sont sémantiquement identiques à l’extraction conservée pour les maquettes : mêmes prérequis, programmes, durées, prix, résultats et dates. Huit intitulés source portent seulement un espace terminal supprimé dans l’extraction ; aucune réécriture des textes constatée lors de cette comparaison.
- L’empreinte binaire du fichier fourni diffère de celle consignée historiquement. Cela ne démontre pas un changement métier : la comparaison des cellules ci-dessus confirme les mêmes contenus utiles. L’ancienne empreinte reste historique, sans fausse revalidation.
- Formateurs : 22 cellules remplies, deux vides. Conserver les valeurs source telles quelles en gestion privée, sans fabriquer de noms.
- Capacité source : huit pour chacune des 24 formations. C’est une valeur de départ ; la capacité des sessions reste modifiable selon la décision déjà validée, sans plafond fixe à huit.
- Les 24 dates restent « à venir ». Aucun créneau réel ou ouverture d’inscription ne peut être inventé à l’import.

## Provenance

Empreinte SHA-256 du fichier fourni : `dabc97f1e4261d3bcd9ec200ae452b6300e97ced92f23e15bcbea9779bdf66de`.

La source complète, les codes formateurs et les colonnes internes restent hors dépôt public. Les maquettes et leurs contenus ne sont pas modifiés par cette réception. Aucun import Google, déploiement ou développement produit n’est exécuté ; le point 5 est réglé, reste le point 6 sur l’échéance.
