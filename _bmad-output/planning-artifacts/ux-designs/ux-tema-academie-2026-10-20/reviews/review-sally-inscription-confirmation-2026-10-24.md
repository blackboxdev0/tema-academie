# Revue Sally — inscription et confirmation

24 octobre 2026. Avis ciblé sur les deux nouvelles surfaces proposées après la direction V2 approuvée. L’activation native de Sally réalisée dans cette même session reste en vigueur ; aucune validation globale BMAD UX n’est lancée.

## Éléments examinés

[DESIGN.md](../DESIGN.md), [EXPERIENCE.md](../EXPERIENCE.md), [synthèse des deux maquettes](../.working/maquettes-inscription-confirmation-2026-10-24.md), sources du [formulaire](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html) et de la [confirmation](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-confirmation-v2.html).

Les six captures fournies ont effectivement été ouvertes et regardées dans `/Users/sofiane/.codex/visualizations/2026/10/19/01a1551a-3732-7bb3-b932-f618697f98c4/tema-inscription-confirmation-2026-10-24/` :

- `formulaire-desktop.jpg` et `confirmation-desktop.jpg` ;
- `formulaire-mobile.jpg` et `confirmation-mobile.jpg` ;
- `formulaire-complet-mobile.jpg` et `confirmation-courriel-echoue-mobile.jpg`.

## Avis de designer

Ces surfaces prolongent correctement la V2. Le logo, les polices, les fonds, le filet rose et les commandes sont cohérents avec le catalogue et la fiche. « Inscription à Ergonomie » et « Votre inscription est confirmée » nomment directement l’objectif et le résultat ; aucune succession d’accroches génériques n’est réintroduite.

La hiérarchie avant les champs est utile : formation et créneau, tarif qualifié, format/lieu, disponibilité, puis coordonnées et accord. Sur téléphone, le récapitulatif demande du défilement, mais ses informations servent à vérifier la session avant de saisir. Les séparations et les libellés permettent de suivre cette lecture ; les champs occupent la largeur disponible, leurs noms restent visibles et le téléphone facultatif est clairement indiqué. Je ne recommande pas de nouvelle structure pour raccourcir artificiellement cette étape.

La confirmation donne d’abord une réponse certaine sur la place. Le courriel et l’invitation sont traités ensuite, dans une zone distincte. La capture d’échec d’envoi conserve cette confirmation de réservation et indique le contact sans demander de s’inscrire à nouveau. La rédaction des variantes inconnue et conditions modifiées, lue dans le HTML, distingue aussi les situations et leurs actions. La barre de changement d’état appartient aux outils de revue de la maquette et n’entre pas dans cet avis sur le parcours produit.

Deux corrections ont une utilité concrète sur l’état « Session complète ».

## Corrections recommandées

### Rendre le libellé du bouton « Changer de date » visible

Dans `formulaire-complet-mobile.jpg`, le message de refus se termine par un bouton rose qui paraît vide. Le texte « Changer de date » existe dans le HTML. La règle `.message a { color: var(--action) }` est plus spécifique que `.button { color: #fff }` : elle colore le libellé avec le même rose que le fond.

Ce défaut masque l’action prévue pour poursuivre après le refus. Donner explicitement au lien bouton de ce message sa couleur de texte blanche, par exemple via `.message a.button`, puis vérifier son rendu dans le même état sur ordinateur et téléphone. L’action et sa destination restent celles déjà prévues.

### Montrer le statut courant dans le récapitulatif après le refus certain

Dans cette même capture, le récapitulatif affiche encore « Disponibilité au choix de la date — 4 places restantes », tandis que le message sous les champs annonce « Cette session est désormais complète » et « Votre inscription n’a pas été enregistrée ».

Le qualificatif précise que le compteur est historique, mais la personne doit rapprocher deux informations éloignées pour connaître la situation actuelle. Lorsque le refus certain est affiché, remplacer ce compteur par « Complet » dans le récapitulatif. Garder les coordonnées, la formation et le parcours Changer de date tels que validés. Cela rend visible l’état déjà connu sans ajouter de contrôle en direct ou changer la règle de réservation.

## Portée et remise

Ce rapport repose sur les images et les sources fournies ; aucune interaction n’a été rejouée. Les observations navigateur du parent — largeurs 1280/390 sans débordement, accord initial décoché et action désactivée, variantes de refus/reprise, horaires modifiés et reconfirmation, place gardée malgré l’échec ou l’incertitude d’envoi — restent ses vérifications de maquette. Elles ne démontrent pas les opérations réelles.

Les coordonnées, dates et horaires sont fictifs. Le texte dédié et l’accord de confidentialité restent à faire valider par Tema. Conservation du contexte, focus, zoom, lecteur d’écran, inscription, envoi de courriel et intégration Google ne sont pas validés ici. Le problème antérieur d’affichage simultané des horaires, signalé comme corrigé avant ces captures, n’est pas retenu comme défaut actif.

Je conserverais ces compositions après les deux corrections de l’état complet. Aucun HTML, contrat, journal ou suivi externe n’a été modifié par cette revue ; seule la présente note a été créée. L’approbation de ces nouvelles maquettes appartient à Sofiane et reste distincte d’un GO de développement ou d’essai réel.

## Addendum — état complet corrigé

24 octobre 2026. La nouvelle capture `formulaire-complet-mobile.jpg` a effectivement été ouverte et regardée, sans relecture globale.

- **Libellé du bouton : observé corrigé.** « Changer de date » apparaît clairement en blanc sur le bouton rose.
- **Disponibilité du récapitulatif : observé corrigé.** « Disponibilité actuelle — Complet » remplace le compteur historique de quatre places.

Les deux corrections visuelles sont constatées sur cette image mobile. Aucun comportement interactif ou enregistrement réel n’est validé par ce contrôle.
