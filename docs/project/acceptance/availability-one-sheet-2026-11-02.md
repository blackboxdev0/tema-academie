# Lecture exclusive de Disponibilités — 2 novembre 2026

Campagne complémentaire demandée par Sofiane. Google TEST version temporaire10 puis retour version8. 45 lectures valides Chromium, sans cache Google ni localStorage. Chaque variante est mesurée dans cinq contextes neufs, avec deux rechargements suivants par contexte. Ordre tournant. Temps du début du fetch jusqu’au texte de disponibilités inséré dans la page. Un contexte navigateur neuf ne garantit pas un démarrage à froid du runtime Google ou du DNS système.

## Résultats de la même campagne

| Variante | Onglets lus | Première visite (n=5), médiane et plage | Suivantes (n=10), médiane et plage |
|---|---:|---:|---:|
| Catalogue complet | 4 | 3.991 s (3.183–4.504) | 3.363 s (2.758–3.907) |
| Sessions projetées après calcul complet | 4 | 3.295 s (3.066–3.867) | 3.418 s (2.705–4.831) |
| Disponibilités directement | 1 | 2.331 s (1.765–2.595) | 2.012 s (1.643–2.453) |

Première visite : lecture directe 2,331 s contre catalogue complet 3,991 s, soit 41,6 % de moins. Face à la projection quatre onglets (3,295 s), réduction de 29,3 %. Visites suivantes : 2,012 s contre catalogue complet 3,363 s.

Le traitement dans Apps Script, sur les 15 lectures de chaque variante instrumentée, passe de 2 404 ms médians pour la projection quatre onglets à 926 ms pour un onglet. Les réponses passent de 11 665 octets (catalogue) à 1 414 (projection complète) et 757–758 (un onglet).

## Ce qui est effectivement lu

`availability-one-sheet.gs` appelle trialSheet_ (garde TEST et ouverture du classeur), puis trialReadTable_ pour le seul nom Disponibilités. Une seule lecture de valeurs de cet onglet, aucun appel Formations, Inscriptions ou Paramètres. Le test unitaire espionne le lecteur de table et exige exactement [Disponibilités]. Les 15 réponses réelles de la variante sont marquées BYPASS / sheet_reads=1. Le cache serveur n’est pas consulté. Les deux contrôles expérimentaux sont verts.

Les dates de début/fin sont converties avec le même moteur Toronto que le parcours existant. L’identifiant formation est extrait de sa référence. Les sessions fermées, déjà commencées ou portant un diagnostic sont exclues. Ni lien de visioconférence ni texte de diagnostic privé ne sont renvoyés.

## Fidélité et limites

Les 45 réponses ont des projections communes strictement égales pour les trois sessions TEST : id cohorte, id formation, début/fin, mode et places. Places observées 1/3/12. Il ne s’agit pas d’une égalité des contrats entiers : la variante directe ne renvoie ni révision de session ni indicateurs d’admission calculés.

Les places sont les valeurs déjà calculées dans l’onglet. Aucune lecture d’Inscriptions pour les recompter et aucun contrôle du prix/de l’activité formation dans les autres tables. Une modification récente ou un état incohérent pourrait donc produire une différence avec le calcul complet. Cette égalité sur les fixtures stables ne prouve pas leur équivalence pour tous les états métier. Le chemin d’admission conserve son contrôle complet sous verrou. La variante directe reste expérimentale, hors build produit.

Une première passe a été interrompue et entièrement rejetée : une réponse au paramètre un-onglet était revenue sous la forme du catalogue complet, sans marqueur de benchmark, pendant la propagation du déploiement. La passe retenue utilise une assertion de marqueur sur chaque réponse un-onglet. Les marqueurs BYPASS de la variante quatre tables ont également été contrôlés dans les 45 enregistrements retenus. Les mesures rejetées sont conservées séparément en privé.

## Revue et récupération

Revue indépendante exécutée, correction du trim de référence formation pour correspondre au moteur. `node --test app/experiments/availability-one-sheet.test.cjs app/experiments/availability-benchmark.test.cjs` : deux PASS ; syntaxe du banc de mesure et git diff --check réussis. Aucun changement du produit pour cette campagne.

HEAD original restauré et copie intégrale strictement comparée, SHA-256 b0737bb59743af0216eb62a83a1143ec10570872c0e8c636343a7334df61f447. Déploiement revenu de10 à8, confirmation Google et HTTP normal + paramètre expérimental : catalogue complet24formations/3sessions/places1,3,12, aucun marqueur de mesure. Aucun POST, envoi ou writer métier dans le banc de mesure. Pas de nouvelle comparaison intégrale des cellules ni des compteurs revendiquée pour cette campagne. Fichiers non commitées selon consigne du chat.

Preuves de durées en privé : ~/.config/tema-academie/availability-benchmark-20261102/one-sheet-measurements.json. Reproduction via `node app/experiments/measure-availability.cjs /CHEMIN_PRIVE/mesures.json --one-sheet` après installation temporaire des deux helpers expérimentaux et du dispatcher dans TEST, puis récupération de la version8 et du HEAD original.
