---
title: 'Aperçu immédiat du catalogue'
type: 'feature'
created: '2026-11-02'
status: 'done'
route: 'oneshot'
---
<frozen-after-approval>
## Intent
GO Sofiane du 2 novembre. Afficher les cartes et filtres en moins d'une seconde sur ce Mac neuf, puis remplacer les informations par la lecture Google TEST. Décision complémentaire Sofiane après revue visuelle : dates connues affichées immédiatement, actualisation discrète unique, places après réponse Google. Cache public isolé par URL, limité à 24 h, et réservation vérifiée sur Google.
</frozen-after-approval>

## Implementation Notes
Aperçu public formations/logiciels capturé en lecture seule depuis TEST, livré comme asset statique. Aucune session ni coordonnée d'inscription dans cet asset. Mettre à jour cet aperçu lors des prochaines livraisons du catalogue. La lecture initiale et les rafraîchissements existants actualisent les données. En panne, conserver l'aperçu et proposer la reprise.

## Review Triage Log
- Medium, corrigé — fiche ouverte avant Google conservait le calendrier vide sur ancre dates. La première réponse force la résolution complète de la route.
- Medium, corrigé — fiche annonçait aucune date pendant l'attente. Libellé de vérification explicite.
- Medium, corrigé — filtres reconstruits perdaient le focus clavier. Préservation au remplacement du catalogue, puis application de la route.
- Medium, corrigé — lien absent de l'aperçu annoncé indisponible trop tôt. Vérification affichée jusqu'à la réponse.

## Vérification
- Chromium réel, trois contextes neufs : cartes 86/59/54 ms ; sessions Google réel 5434/3877/3914 ms, places 1/3/12.
- 16 contrôles ciblés sur Chromium ordinateur/mobile, Firefox et WebKit réussis, avec seuil performance <1000 ms, changement simulé des places, panne/reprise et fiche ouverte pendant l'aperçu.
- Le test réel vérifie la réponse et l'affichage. La mutation de capacité est simulée, aucune édition du classeur pendant cette campagne.

Suite finale npm run verify réussie : 103 Node, 21 régressions administratives, 2 scénarios VM, 7 bundle/ICS portables (2 fichiers ICS privés absents explicitement ignorés), 98 parcours Chromium ordinateur/mobile, build et sécurité. Fichiers non commitées selon consigne Git du chat.

Reprise après GO testons : cache public projeté par liste de champs, dates dans l'asset, indicateur unique par vue.

## Complément après revue visuelle
GO Sofiane « go testons ». Aperçu enrichi des sessions publiques, cache projeté limité à 24 h par URL de service. Les dates passées sont filtrées. Places masquées et formulaire bloqué jusqu'au succès live. Indicateur unique discret par vue.
Revue complémentaire, deux observations corrigées : recalcul du mois initial sauf choix manuel, et préservation de focus autour de la résolution de route.
Vérification visuelle réelle : date visible en 87 ms, places 1/3/12 égales à Google TEST. 28 contrôles ciblés sur quatre profils et deux tests de stockage public réussis. Les anciennes preuves ci-dessus décrivent le premier aperçu.

Validation finale complémentaire : 100 parcours Chromium ordinateur/mobile réussis, 84 parcours V1 sur quatre profils réussis, 28 ciblés réussis. Tests Node 105, régressions 21, VM 2, bundle portable 7 réussis (deux ICS privés absents ignorés). Build et sécurité réussis. Le lancement E2E initial a rencontré le port occupé, relance sur 4190 réussie. Correctif du recalcul du mois et contrôle de confidentialité (adresse publique fictive autorisée, champs personnels interdits) couverts.
