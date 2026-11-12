---
title: 'Prototype rapide Sheets API batchGet'
type: 'chore'
created: '2026-11-02'
status: 'done'
route: 'oneshot'
---
<frozen-after-approval>
## Intent
Sofiane autorise un prototype rapide avant implémentation complète. Tester une lecture groupée API Sheets dans le projet TEST existant, données fraîches sans copie persistée ni cache, comparer au lecteur natif, vérifier égalité des formations/dates/tarifs/places et conversions hiver/été. Aucun changement métier ni envoi. Restaurer la version11 et son HEAD/manifeste de recette après campagne.
</frozen-after-approval>

## Implementation Notes
Code expérimental hors build produit. Un appel batchGet pour les quatre tables, réutilisation du moteur public existant avec validation complète et recomptage des places. Ce prototype privilégie la comparaison fidèle ; sélection plus fine des colonnes et intégration UI hors périmètre. Deux variantes instrumentées, cinq contextes neufs et une lecture suivante par contexte. Pas de garantie sous la seconde avant mesure. Activer temporairement le service avancé Sheets V4 sans changer les scopes.

## Checkpoint local
Prototype de75lignes, banc de mesure20lectures, quatre tests locaux PASS et revue indépendante sans défaut bloquant pour campagne bornée. L’égalité sur toutes les saisies numériques mal formatées n’est pas acquise ; la campagne vérifiera l’égalité stricte du contrat public sur les données TEST.
Mesure Google en attente de l’accord humain sur l’activation du service avancé Sheets V4 : l’écran Add a service affiche explicitement « By using this product you agree to the Google APIs Terms of Service ». Question de confirmation envoyée via outil asynchrone. Aucune activation ni sauvegarde de code Google dans cette campagne ; la version11/HEAD97dd49032437e96b3423f3ec465ae494bf3cd135dff63d86a3d70f3cb570df0c de recette restent la base conservée. Le service est seulement sélectionné dans le dialogue, pas ajouté.

## Résultat final
Accord d’activation SheetsV4 reçu explicitement dans le chat puis appliqué. Scopes inchangés. Cinq tests PASS après correction de plage Paramètres (colonne séparatrice, choix après F). Version13 temporaire mesurée20fois, contrat public intégral identique. Première lecture3383→1333ms, suivante3280→1057ms. Aucun des10appels batch sous1s. Version11, HEAD97dd49032437e96b3423f3ec465ae494bf3cd135dff63d86a3d70f3cb570df0c et manifeste initial exact restaurés, HTTP de recette vérifié. Rapport docs/project/acceptance/sheets-batchget-prototype-2026-11-02.md. Prototype prometteur, intégration produit non effectuée, acceptation V1 toujours ouverte.
