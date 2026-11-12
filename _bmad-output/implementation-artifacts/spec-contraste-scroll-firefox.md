---
title: Corriger les réserves de contraste et de défilement Firefox
type: bugfix
created: '2026-11-10'
status: done
route: oneshot
---
<frozen-after-approval>
## Intent
Corriger les neuf échecs identifiés dans la recette : petits textes blancs sur les dates roses du catalogue et arrêt du défilement Firefox après interaction puis réduction des animations. Conserver les textes blancs et la palette Tema en employant un fond rose suffisamment contrasté. Garder le défilement natif et les entrées de vues ; la préférence réduite doit interrompre le mouvement sans saut après une interaction et terminer à destination sinon. Relancer les tests sans exclure les règles ni assouplir leurs assertions. GO explicite Sofiane du10novembre ; uniquement site local et tests, aucun changement Google, envoi, commit ou déploiement.
</frozen-after-approval>
## Implementation Notes
Investigation : styles.css .card-date utilise #FF008F (3,71:1) malgré le rose action #C6006F déjà disponible. app.js handler motionQuery.change appelle scrollTo instant à la position courante après pointerdown qui annule navigationScroll ; Firefox peut conserver son mouvement natif lors d’un appel sans déplacement. Tester une interruption effective du mouvement sans changement visuel à l’image suivante. motion.spec.cjs garde ses scénarios de destination, cache, focus et interruption ; accessibilité axe inchangée. Empreinte limitée au CSS, gestion du scroll et régressions ; aucune API nouvelle ni action irréversible. État Git antérieur connu et conservé, réutilisation du checkout.

Correction : .card-date utilise le rose action #C6006F ; textes blancs conservés. Handler de réduction : déplacement synchrone1px puis retour à la même position si une interaction a annulé la destination, ce qui interrompt le scroll Firefox sans déplacement visible à l’image suivante. Assertion visuelle v1 adaptée uniquement pour ce fond. Test existant renforcé à32frames, deux cas supplémentaires réellement en mouvement (montée vers Catalogue et descente vers Calendrier), avec mesure au premier appel natif après le signal système. Première correction Firefox :10répétitions réussies. Première passe globale interrompue après découverte par revue de l’assertion de palette antérieure ; elle n’est pas présentée comme une validation complète. Aucun changement du backend ou de Google.

## Review Triage Log
- medium/patch : assertion de composition encore liée à #FF008F ; fond attendu remplacé par #C6006F, les autres assertions de géométrie et la bordure focus restent inchangées.
- medium/patch : mouvement antérieur insuffisant pour prouver une interruption en cours ; déclenchement au premier frame déplacé et distance restante vérifiée. Montée vers Catalogue pour garantir une destination différente du bord bas sur mobile.
- medium/patch : simple stabilité après réduction aurait accepté un saut à destination ; mesure avant le premier appel scrollTo suivant la réduction et comparaison de32positions avec ce point exact.
- maybe-false, risque faible non reproduit : la préférence pourrait être émulée après la fin du mouvement sur une machine fortement ralentie ; synchronisation au premier mouvement réduit cette fenêtre, assertion de distance empêche un faux PASS. Pas de relâchement ni de retry ajouté. Relecture complémentaire sans défaut résiduel concret,36contrôles de mouvement réussis sur quatre profils.

## Validation finale
Matrice complète292/292, standard132/132, COPY238/238, audit21/21 et2VM, build/sécurité verts. Artefacts relancés avec les deux fichiers privés historiques retrouvés :9/9, zéro ignoré. Scénario Firefox répété10fois ; mouvement36/36 quatre profils. Vérification syntaxique et diff propres. Rapport docs/project/acceptance/contrast-motion-2026-11-10.md. Aucun commit selon consigne humaine ; acceptation globale et livraison demeurent ouvertes.
