# Recette du site local avec Google Production

Le 19 novembre 2026, Sofiane a autorisé la version Google en accès « Anyone », le raccordement local et une recette limitée à deux courriels reçus dans la boîte Tema. Le candidat est celui du commit `822a362`, sur la [PR 2](https://github.com/blackboxdev0/tema-academie/pull/2).

## Contre-essai de l’annulation

Le même jour, Sofiane a demandé de corriger la restitution automatique avant publication. La version de départ a réussi un nouvel essai natif. Cela n’efface pas le retour à zéro constaté lors du premier essai. Le correctif utilise la même lecture Sheets v4 pour compter les confirmations et vérifier les écritures dans les deux chemins de gestion. Le test de régression couvre une lecture native périmée, un premier calcul non confirmé, un déplacement de ligne et une modification simultanée de capacité.

Dans le vrai classeur, une session fictive fermée de capacité 1 et son inscription confirmée ont donné 0 place. Le choix « Annulée » puis la confirmation ont donné 1 place sans utiliser « Actualiser le suivi ». Le statut et la valeur ont concordé dans le suivi, dans une lecture native indépendante et dans une lecture Sheets v4. Ils sont restés identiques après un passage du traitement de maintenance. Aucun courriel n’a été envoyé. [Préparation Vercel](vercel-production-preparation-2026-11-19.md)

Les trois onglets sources sont identiques dans les exports avant et après nettoyage. Le classeur est revenu à 24 formations, aucune session et aucune inscription. Le code corrigé a été relu dans l’éditeur Google, sans les commandes de recette. La version publique Google reste la version 1. La nouvelle passe a validé 132 tests standard, 409 expériences et les contrôles de build et de sécurité. Les pièces du contre-essai sont dans le sous-dossier privé `cancel-20261119`.

## Résultats en conditions réelles

| Contrôle | Résultat |
| --- | --- |
| Raccordement | Version Google 1 exécutée sous le compte Tema. GET anonyme HTTP 200 en 5,2 s, 24 formations et politique `TEMA-2026-11-18-1`. Aperçu local en mode production sur le port 4187, sans bandeau TEST. |
| Inscription | Une demande via le site pour Ergonomie. La confirmation est apparue dans les 10,3 s observées après le clic. Une seule inscription confirmée, dernière place occupée et deux courriels en attente à ce stade. |
| Courriels | Après fermeture de l’onglet, le déclencheur planifié a envoyé la confirmation participant et l’avis Tema. Deux messages reçus dans la boîte Tema. Gmail présente `formation.ics` en pièce jointe de la confirmation. |
| Annulation | Statut `annulee` enregistré par la commande de recette propriétaire. Le rejeu de la demande d’origine a renvoyé `REPLAY`, `annulee`, sans écriture d’une nouvelle réservation ni nouvel envoi. |
| Place restituée | Le compteur a d’abord indiqué 1, puis une autre lecture et l’export ont indiqué 0. La commande de suivi a rétabli 1. Résultat confirmé par deux lectures Google et un nouvel export. La persistance du recalcul automatique après annulation depuis le suivi reste à vérifier. |

## Vérifications de code

Le 19 novembre, 132 tests standard et 405 expériences ont réussi, dont 117 de production. Les 20 scénarios navigateur de production sur transport simulé, la compilation et les contrôles de sécurité du candidat ont également réussi. Le résultat Google et les deux réceptions Gmail sont des vérifications distinctes de ces simulations.

## État après la recette

Le classeur a retrouvé ses 24 formations, sans session ni inscription. Les valeurs brutes des trois onglets sources concordent avec l’export initial. Les commandes temporaires ont été retirées et le code Google relu à l’identique. Le plafond d’essai est revenu à zéro et le traitement planifié est en pause, avec une cadence de 12 heures et le déclencheur d’édition intact. Le journal conserve les deux tentatives antérieures et les deux de cette recette. Le GET final anonyme a répondu HTTP 200 en 3,6 s avec 24 formations et aucune session.

Les preuves détaillées sont dans le sous-dossier privé `activation-20261119`. Le reçu `google-deployment.jpg` et le profil privé attestent la version, `http-after-cancellation.json` atteste le rejeu et les exports `before.xlsx`, `after.xlsx` et `cancelled-after-refresh.xlsx` permettent de vérifier les valeurs. Le profil et le build restent hors dépôt.

Cette commande relance l’aperçu du build raccordé depuis la racine du dépôt.

```sh
PORT=4187 npm --prefix app run preview:production -- ~/.config/tema-academie/production-candidate-20261118/activation-20261119/connected-web
```

Le site public Vercel utilise COPY. Le contre-essai ci-dessus clôt le contrôle de restitution pour ce candidat. TEM-28 garde la remise et la publication ouvertes. Sur GO de mise en service, le passage de l’aperçu au build Vercel s’accompagne de la reprise du déclencheur minute, du contrôle des en-têtes, du retrait de la pause et du réglage du plafond. Le budget quotidien réel des déclencheurs partagé avec la démo reste à mesurer. Les autres réserves figurent dans le [bilan du 18 novembre](production-preparation-2026-11-18.md).
