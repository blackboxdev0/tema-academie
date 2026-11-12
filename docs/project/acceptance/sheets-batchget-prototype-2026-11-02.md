# Prototype rapide de lecture groupée Sheets API — 2 novembre 2026

## Résultat pour décision

Le prototype donne le même catalogue public que le moteur actuel sur les données TEST, avec une réduction mesurée de60,6% de la première lecture navigateur et67,8% de la lecture suivante. Sheets reste l’unique source. Aucun cache applicatif, copie publique synchronisée ou republication du site pour les dates dans ce banc de mesure. L’intégration produit n’est pas effectuée.

| Lecteur | Première visite, n=5 | Lecture suivante, n=5 |
|---|---:|---:|
| Lecteur actuel SpreadsheetApp | 3.383 s (3.139–6.078) | 3.280 s (3.107–3.635) |
| Lecture groupée Sheets API batchGet | 1.333 s (1.174–1.624) | 1.057 s (1.012–2.099) |

Plages min–max entre parenthèses. Aucun des dix appels batch mesurés sous une seconde : minimum1,012s. Aucun engagement de délai fixe déduit.

## Ce qui a été testé

- 20 lectures Chromium, cinq contextes neufs par lecteur et une seconde lecture dans chaque contexte. Ordre des lecteurs alterné. Le temps va du fetch au texte des sessions inséré dans une page locale vierge, redirections et JSON inclus. Pas de localStorage ni cache serveur applicatif utilisé. Un contexte neuf ne prouve pas un démarrage à froid du runtime Google ou du DNS.
- Même moteur public intégral dans les deux variantes. Batch lit Formations, Disponibilités, Inscriptions et Paramètres en une requête API. Le prototype conserve des plages larges pour comparer fidèlement le calcul existant ; sélection plus fine des colonnes hors périmètre de cet essai.
- Les vingt réponses sont comparées intégralement après retrait de generated_at et benchmark, avant chaque enregistrement. 24formations,3sessions, mêmes titres, prix, politique, contact public, révisions et places1/3/12. Aucun export de table privée dans les fichiers de mesure.
- Les places sont recomptées depuis les inscriptions. Le compteur potentiellement périmé de Disponibilités n’est pas utilisé comme autorité. Aucun writer métier, POST ni envoi de courriel par le banc.
- Dix appels batch attestés par reader=sheets-batchget-v1 et api_calls=1. Médiane de lecture API320,5ms (258–520), traitement serveur total370,5ms contre2274,5ms pour le lecteur natif. Les réponses font11753octets contre11725pour le témoin : gain dû au chemin de lecture et non au retrait de fonctionnalités du catalogue.

## Prototype et contrôles locaux

app/experiments/sheets-batchget.gs, environ75lignes, hors build du produit. Appel batchGet UNFORMATTED_VALUE/SERIAL_NUMBER, normalisation des dates et horaires avant réutilisation de publicCatalogue. app/experiments/measure-batchget.cjs écrit uniquement les durées et comptages dans un emplacement privé.

Cinq tests PASS : égalité hiver/été et recomptage, booléens/chaînes/cellules finales vides, conversions des dates/heures, erreurs opaques et confidentialité, schéma réel Paramètres avec colonne séparatrice. Revue indépendante favorable pour la campagne bornée. Une saisie numérique manuellement mal formatée n’a pas encore de preuve d’équivalence exhaustive avec le lecteur natif ; ce cas reste à durcir pour le produit.

## Préparation et récupération

Accord humain explicite reçu dans le chat pour activer Sheets APIv4 et accepter les conditions Google APIs à l’écran d’ajout. Scopes OAuth inchangés. Version12 initiale écartée avant chronométrage : plage Paramètres A:F insuffisante car D est une colonne séparatrice et choix est en G. Plage étendue A:Z et test de régression ajouté. Les mesures retenues concernent uniquement la version13 corrigée, HEAD SHA-25674f435e5421f726b1c37adf49e87e2066c738137ee134ea4db51818f9a061d82. Un helper privé de diagnostic a été retiré avant cette version ; il n’a journalisé que schémas et comptages.

Après campagne : version11 de recette restaurée, même URL/identité/accès. HEAD exact97dd49032437e96b3423f3ec465ae494bf3cd135dff63d86a3d70f3cb570df0c restauré et comparé intégralement. Manifeste initial exact restauré (dependencies={} et scopes inchangés), service avancé retiré du manifeste de travail. Pas de suppression de version historique ni de désactivation globale du service Cloud revendiquée. HTTP à la fin : route standard24formations/3sessions/places1,3,12 ; availability-preview existante attestée un onglet ; ancien paramètre catalogue-batch renvoie le catalogue standard sans marqueur expérimental.

## Limites et suite

Petit jeu TEST stable, pas de charge ni mesure sur réseau mobile physique. Les tests de dates invalides, quotas/erreurs de service et l’intégration au parcours doivent être complétés avant adoption produit. Pour répondre à la fraîcheur dès première visite, l’intégration devra afficher dates/formations seulement après cette lecture et retirer les sessions figées du bundle/localStorage d’affichage initial. La campagne démontre le gain du lecteur ; elle ne réalise pas cette intégration.

Mesures brutes de durées en privé : ~/.config/tema-academie/availability-benchmark-20261102/batchget-measurements.json. Fichiers du prototype non commitées selon la consigne du chat.
