---
title: Transitions fluides entre vues et défilement interne
created: '2026-11-03'
status: done
route: oneshot
---
<frozen-after-approval>
## Intent
Sofiane demande des transitions de page et un défilement plus fluides. Apparition légère (240ms, fondu et déplacement vertical6px) lors d’un changement réel de vue catalogue/fiche/formulaire/confirmation/politique. Défilement natif doux pour les liens internes et retours ; aucune interception de la molette. L’interface reste immédiatement interactive. Réduction des animations respectée. Saisie, focus, historique, cache et admission conservés. Aucun commit/push ni déploiement.
</frozen-after-approval>
## Implementation Notes
app.js : animation d’entrée sans attendre sa fin, animation sortante annulée sur navigation rapide ; pas de relance sur actualisation des données. Focus des titres sans saut implicite puis défilement explicite vers haut de page. preserveFocus conserve instantanément la position pendant les actualisations. styles.css : scroll-behavior smooth avec préférence réduite existante prioritaire. Tests motion.spec.cjs : animation active et annulation, préférence réduite, ancre calendrier et dates, refresh pendant saisie sans animation, historique et confidentialité.

## Review Triage Log
- medium/patch : bascule vers réduction en plein défilement abandonnait la destination ; suivi de destination puis fin instantanée, test dédié.
- medium/patch : translation du conteneur décalait l’ancre de6px ; fondu du conteneur et translation du titre seul, test de marge24px sur changement de vue.
- medium/patch (preuve) : test refresh identique et trop tôt ; prix modifié, rendu attendu, focus et position mesurés après remplacement.
- medium/patch : réponse fraîche initiale depuis cache réappliquait route/focus ; route initiale marquée et position/focus préservés, scénario dédié.
- medium/patch complémentaire : interaction annulant le suivi laissait le défilement actif après réduction ; arrêt instantané à position courante si destination annulée, test ajouté.
- Préexistant hors périmètre : contraste des petits textes blancs sur rose3,71:1, comparé avec source JS antérieure ; maintenu signalé, aucun contournement de règle axe.

## Validation finale
110Node,21administration,2VM,7bundle portables PASS (2ICS privés ignorés). Matrice280 :272PASS et8échecs de contraste préexistant.28contrôles dédiés de mouvement PASS sur quatre profils après correction complémentaire. Race de focus du lien d’évitement corrigée,12rejeux clavier/reflow PASS. Pas de conformité a11y globale ni de commande verify verte revendiquée. Parcours Google réel sans POST/envoi, saisie conservée. Aucun commit/push/déploiement ; recette Sofiane ouverte.
- medium/patch complémentaire : focus différé de l’ancre native #main pouvait reprendre la main après Tab ; click explicite/history/focus puis défilement,12rejeux de contrôle et régression politique après évitement.
