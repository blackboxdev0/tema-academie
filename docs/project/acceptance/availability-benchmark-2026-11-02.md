# Mesure des disponibilités seules — 2 novembre 2026

Essai réel Google TEST version temporaire 9, depuis Chromium sur ce Mac. 45 lectures séquentielles, trois variantes, cinq contextes neufs par variante et deux nouvelles lectures après rechargement dans chaque contexte. Ordre des variantes tournant. Aucun cache localStorage dans la page de mesure. Les temps vont du début du fetch au texte des disponibilités inséré dans la page, redirections et JSON inclus.

## Comparaison navigateur

| Réponse | Première visite, médiane (n=5) | Visites suivantes, médiane (n=10) |
|---|---:|---:|
| Catalogue complet sans cache | 3.359 s | 3.570 s |
| Disponibilités seules sans cache | 3.433 s | 3.271 s |
| Disponibilités seules avec cache Google | 1.227 s | 0.944 s |

La première visite navigateur et le cache serveur sont indépendants. Les cinq premières visites de la variante cache comprennent deux MISS et trois HIT. Les dix suivantes sont toutes HIT. Un contexte neuf ne prouve pas un démarrage à froid du runtime Google ni du DNS système.

## Cache serveur attesté

| État | Lectures | Médiane navigateur | Min–max navigateur | Médiane dans Apps Script |
|---|---:|---:|---:|---:|
| BYPASS | 15 | 3339.0 ms | 2989–5056 ms | 2293.0 ms |
| MISS | 2 | 3510.0 ms | 3440–3580 ms | 2468.0 ms |
| HIT | 13 | 949.0 ms | 684–1271 ms | 116.0 ms |

Première visite avec cache serveur déjà rempli : médiane 1077 ms, n=3.

## Portée et décision technique

- Réponse complète 11 665 octets, disponibilités 1 409–1 414 octets, soit environ 88 % de moins. La réduction de taille seule ne produit pas de gain net sur cette campagne.
- HIT médian 949 ms contre BYPASS 3 339 ms, environ 72 % de réduction. Le traitement serveur médian passe de 2 293 ms à 116 ms.
- Toutes les réponses ont exactement les mêmes trois objets session, y compris révisions, statuts et places. Aucune modification du classeur pendant la campagne.
- Sur MISS/BYPASS, cette expérience réutilise le calcul métier existant, donc lit toujours les quatre tables. Elle isole la projection HTTP et le cache serveur. Elle ne mesure pas une nouvelle lecture ciblée de cellules ni un compteur de places autonome.
- Cache partagé temporaire de 60 secondes, rempli à la demande. Pas de rafraîchissement anticipé ni invalidation métier dans cette expérience. Une intégration produit devrait définir cette fraîcheur et invalider après édition/réservation. Admission conservée sur lecture réelle sous verrou.
- Les temps mesurent des disponibilités reçues du serveur, pas les cartes déjà visibles grâce au cache navigateur. Réseau local, petit jeu TEST, pas de test de charge ni garantie sous la seconde.

## Récupération et intégrité

Code original SHA-256 `b0737bb59743af0216eb62a83a1143ec10570872c0e8c636343a7334df61f447`, comparé intégralement après restauration du HEAD. Retour vers version 8 confirmé dans Google, mêmes URL/identité/accès. HTTP relu sur route normale et deux paramètres expérimentaux : catalogue standard 24 formations/3 sessions/places 1,3,12, aucune propriété benchmark. HEAD sauvegardé et copie intégrale relue strictement égale à l’original. Inspection pendant la campagne : 25 formations /24 publiques, 5 sessions /3 publiques, 9 inscriptions (4 confirmées/5 annulées), budget persistant 8 inscriptions /16 destinataires, quota quotidien 100, deux déclencheurs. Aucune soumission POST par le banc de mesure. Ce comptage ne constitue pas un export intégral des données.

## Reproduction et preuves

`app/experiments/availability-benchmark.gs` reste hors build produit. Remplacer temporairement doGet par un appel à availabilityBenchmarkGet_ pour reproduire sur TEST, puis restaurer code et version. `measure-availability.cjs` refuse un fichier de mesures dans le dépôt. Test de projection/cache/route témoin exécuté avec `node --test app/experiments/availability-benchmark.test.cjs`. Données brutes de durée en privé dans `~/.config/tema-academie/availability-benchmark-20261102/measurements.json`.

Inspection finale du 2 novembre à 14 h 23 min 26 Montréal : mêmes 25/24 formations, 5/3 sessions, 9 inscriptions (4/5), budget 8/16, quota 100, deux déclencheurs, compteur de commandes et fenêtre strictement identiques à l’inspection pendant la campagne à 14 h 21 min 04. Pas de preuve de comparaison intégrale des cellules revendiquée.
