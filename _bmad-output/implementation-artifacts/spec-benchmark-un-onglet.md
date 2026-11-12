---
title: 'Mesurer la lecture exclusive de Disponibilités'
type: 'chore'
created: '2026-11-02'
status: 'done'
route: 'oneshot'
---
<frozen-after-approval>
## Intent
Sofiane demande une lecture de l'onglet Disponibilités seul pour comparer la première visite au calcul lisant quatre tables. Expérience TEST sans cache, aucune écriture métier ni envoi, récupération du HEAD et de la version8 après campagne.
</frozen-after-approval>

## Implementation Notes
Code app/experiments/availability-one-sheet.gs, aucun appel aux autres tables. Réutilise les types et conversions temporelles existants, renvoie seulement id session, id formation, dates UTC, mode et places calculées présentes dans l'onglet. Pas de vérification d'activité formation/prix, aucun recomptage d'Inscriptions. Expérience de vitesse, sans usage pour l'admission. Mesures comparées sur projection commune, ordre tournant, cinq contextes neufs et deux rechargements suivants par variante. Revue indépendante : trim de référence formation ajouté pour correspondre au moteur.

## Vérification
45 lectures valides, trois projections de sessions identiques, paramètres et marqueurs contrôlés. Deux tests expérimentaux PASS. Première passe rejetée pour une réponse d’ancienne version. Première visite : 3,991 s catalogue complet, 3,295 s projection quatre tables, 2,331 s lecture un onglet. Version10 temporaire remise à8, HEAD b0737bb59743af0216eb62a83a1143ec10570872c0e8c636343a7334df61f447 restauré strictement et HTTP contrôlé. Rapport docs/project/acceptance/availability-one-sheet-2026-11-02.md.
