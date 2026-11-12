# Actualisation discrète — 3 novembre2026

## Comportement validé avec Sofiane

Après brainstorming, Sofiane donne explicitement le GO de réalisation intégrale : cacher le bloc de synchronisation normale, afficher un petit « Vérification… » à la place des places, permettre de parcourir fiches/calendrier et de commencer la saisie pendant la réponse Google. Seule la confirmation reste bloquée avant disponibilité, tarif et politique actuels. Pas de soumission automatique. Cache public24h et backend Google TEST14 inchangés.

Le bouton d’inscription d’une date en cache ouvre désormais un formulaire provisoire. Les champs personnels sont actifs mais l’accord et la confirmation attendent la politique fraîche. La réponse valide la sélection sans reconstruire les champs ni perdre leur focus. Tarif/horaire/titre/durée modifiés demandent une relecture explicite et un nouvel accord. Date complète/fermée/supprimée ou tarif non confirmé garde la saisie et bloque la confirmation. Une panne du chargement initial depuis cache donne une reprise locale près de la disponibilité, sans gros bloc. Les pannes ultérieures après lecture fraîche conservent leur comportement existant.

La navigation est indépendante de la validation finale : événements sélectionnables, fiche complète disponible, lien direct inscription géré depuis cache. Aucun bouton de reprise imbriqué dans les liens/boutons du calendrier. Le focus du bouton de réessai est restauré après échec ; après succès il passe au bouton de confirmation, ou reste dans le champ actif. Aucun champ de formulaire ni reçu n’est sauvegardé.

## Preuves

Contrôle Chromium relié à Google réel : première lecture de préparation, puis recharge avec cache. Une attente volontaire du GET dans le runner permet d’exercer l’interface pendant la lecture ; la réponse est celle de Google. Cartes en43ms, aucun bandeau, choix→formulaire→saisie possibles avant réponse, confirmation inactive jusque-là puis active après Google ; saisie conservée. Zéro POST/envoi, aucune donnée personnelle persistée. Ce délai ponctuel du rendu en cache n’est pas une garantie tous supports, et le retard de vérification est volontaire dans ce contrôle. Captures examinées, temporaires hors dépôt /tmp/tema-seamless-catalogue.png et /tmp/tema-seamless-form.png.

Tests initiaux60parcours ciblés sur Chromium ordinateur/mobile, Firefox et WebKit réussis. Revue indépendante puis corrections du focus de reprise et des actions imbriquées ; scénarios supplémentaires d’envoi réel dans le moteur simulé (révision et politique actualisées, un seul POST), navigation historique, panne répétée, aucune persistance personnelle. La fixture de capacité a été corrigée pour respecter les identifiants et états de courriels exigés par le moteur ; une fixture incomplète provoquait UNAVAILABLE, sans défaut de l’application.

Résultats finaux :110tests Node,21régressions administratives,2transitions VM,7contrôles bundle/ICS portables réussis ;2ICS privés absents ignorés. Build et sécurité réussis, diff sans erreur, BMAD6.12.4/verrou/routage valides.

La passe complète quatre profils découvre256parcours et termine avec254réussites et2échecs d’assertion (Chromium ordinateur/mobile) sur le nouveau test de retour historique. L’assertion comptait les badges d’une ancienne fiche masquée ; elle est désormais limitée au catalogue affiché. Aucun changement produit nécessaire pour cette correction de test. Les72tests cache/parcours discret sont ensuite tous rejoués avec succès sur les quatre profils ; les4retours historiques ont également leur passe ciblée réussie. Les184autres parcours de la matrice complète sont verts. La commande initiale `npm run verify` conserve son exit1 historique ; il n’est pas présenté comme une commande intégralement verte après correction. Les deux seuls échecs sont rejoués via `test:e2e -- --last-failed` :2PASS, exit0 au checkpoint final. Aucun envoi de réservation réel supplémentaire revendiqué par les tests simulés. Backend/bundle a2009f22df3417ca459dd0e5fd59022d7f43244feec32131ebcc72cfa0321ee2 inchangé ; aucun déploiement Google nécessaire.

## Revue et limites

Revue intégrée Build : focus de reprise et contrôles imbriqués corrigés ; tests positifs de soumission et transitions historiques ajoutés. L’objection concernant footer-policy ne se reproduit pas au démarrage depuis cache (lien masqué sans données fraîches) ; le blocage a néanmoins été limité au lien de politique du formulaire. Aucun blocage de revue restant. Rapport de triage dans spec-actualisation-discrete.md.

Candidat local http://127.0.0.1:4173/, recette Sofiane ouverte et TEM-27 In Progress. Aucun commit/push selon consigne actuelle, PR1 Tema ouverte en brouillon, pas de main/PROD/Vercel/FTP. Safari installé, téléphone physique et lecteur d’écran ne sont pas vérifiés par cette passe.

## Ajustement de l’en-tête demandé ensuite
« Nous contacter » est désormais présent dans le HTML initial avec mailto:temaacademie@gmail.com, adresse existante validée au registre des décisions ; sa destination peut toujours suivre la réponse Google. Vérifié sur Google réel avec lecture volontairement retardée : lien visible et utilisable avant réponse, coordonnées du lien strictement identiques après réponse (aucun saut). Les4contrôles existants de contact/retour politique passent sur les quatre profils ; build/sécurité et diff valides. Aucun commit ni déploiement.
