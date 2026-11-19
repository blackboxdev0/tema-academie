---
title: 'Relever le plafond des courriels de production à 100 destinataires'
type: 'feature'
created: '2026-11-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="accord humain">

## Intention

Porter le plafond de « Production (préparation) » à 100 destinataires sur 24 heures glissantes. Utiliser le quota Google réellement disponible, tenir compte des envois en cours et reprendre automatiquement les courriels différés. Conserver les tentatives existantes et le verrou de réservation.

Le journal doit tenir dans une propriété Apps Script de 9 Ko, y compris avec 100 tentatives. Le format existant doit rester lisible. La cadence plus courte est étudiée séparément et le site Vercel reste sur son déploiement actuel.

</frozen-after-approval>

## Notes d’implémentation

Le format actuel atteint 9 453 octets à 100 tentatives, estimés avec des dates sur 13 chiffres. La représentation compacte des mêmes identifiants et dates en atteint 8 353. Prévoir un changement rétrocompatible à la lecture et vérifier la limite, la reprise, les engagements en cours et la conservation des entrées.

Le journal compact s’écrit à partir de la 81e tentative et revient au format historique lors d’une écriture de 80 tentatives ou moins. Le changement de plafond laisse le registre intact. Le plafonnement s’applique aux réservations de tentative. Les vérifications locales couvrent 127 cas de production et 415 cas sur l’ensemble des scripts, sans échec. Les preuves du passage dans Google figurent dans le [rapport de recette](../../docs/project/acceptance/production-connected-2026-11-19.md).

## Revue

- Moyenne. Le code précédent ne sait pas reprendre un journal compact. La procédure de retour réduit le plafond en gardant le lecteur actuel. Une restauration du code précédent exige une pause et un journal compatible avant reprise.
- Moyenne, reportée. Un autre script du même compte peut prendre le dernier destinataire entre la vérification et l’envoi. L’exception de transport garde le traitement existant. Le code ne réarme pas un envoi qui pourrait avoir été accepté par Google.
- Faible. La fenêtre porte sur la réservation horodatée. Cette unité est précisée dans le rapport.
- Moyenne. La corruption du format compact est couverte par les cas de tuple invalide, d’empreinte dupliquée et de longueur supérieure à 100.
- Moyenne. Le test du vrai chemin de traitement simulé passe de 99 à 100, diffère le suivant et le reprend une seule fois après renouvellement.
