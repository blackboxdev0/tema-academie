---
title: 'Mesurer les disponibilités seules sur Google TEST'
type: 'chore'
created: '2026-11-02'
status: 'done'
route: 'oneshot'
---
<frozen-after-approval>
## Intent
GO Sofiane : tester disponibilités seules, sans/avec cache Google, premières visites et suivantes. Mesures réelles avec cache HIT/MISS attesté. Aucun envoi, aucune écriture métier. Récupération du déploiement initial et du HEAD après campagne.
</frozen-after-approval>

## Implementation Notes
Expérience dans app/experiments/availability-benchmark.gs, hors build du produit. Route complète témoin et deux projections de sessions utilisant le même calcul métier. Sur MISS/BYPASS, les quatre tables restent lues pour préserver les validations et comptages : ce test isole taille de réponse et cache serveur, pas une nouvelle source de comptage. Cache 60 secondes, aucune invalidation métier implémentée pour cet essai temporaire, aucune admission basée sur cache. Le navigateur de mesure ne persiste aucune réponse.

## Vérification et revue
Revue indépendante favorable, test de projection/cache/route témoin réussi. 45 mesures réelles terminées, objets session strictement égaux. Rapport docs/project/acceptance/availability-benchmark-2026-11-02.md. HEAD original b0737bb59743af0216eb62a83a1143ec10570872c0e8c636343a7334df61f447 restauré et comparé intégralement, déploiement existant revenu à v8 après v9 temporaire, HTTP et agrégats vérifiés. Aucun commit selon consigne du chat. Aucun changement supplémentaire au site de recette.
