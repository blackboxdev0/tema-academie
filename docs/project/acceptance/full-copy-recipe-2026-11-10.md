# Recette complète COPY sans Paramètres

État : campagne terminée le 10 novembre, parcours métier réels réussis ; neuf échecs navigateur restent ouverts. Aucune livraison ni validation globale déclarée.

## Périmètre

Copie privée et site local uniquement. Formation/session/participant fictifs dédiés. Bloquer temporairement les limites d’envoi COPY puis restaurer leurs valeurs exactes ; ne jamais réinitialiser budget consommé ou allowlist. Aucun envoi réel. Garder les sources initiales intactes et ranger les ajouts par dépublication/fermeture/annulation.

## Matrice

| Parcours | Contrôles | Preuve attendue | État |
|---|---|---|---|
| Formation | Saisie native, champs requis, création, répétition sans doublon, modification directe | ID unique, contenu affiché sur site | Réussi Google réel |
| Disponibilités | Trois lignes manuelles, deux ouvertes et une fermée, formats, capacité invalide puis correction | IDs distincts, dates/compteurs exacts | Réussi Google réel |
| Site | Lecture/cache, filtre Dimo, fiche, deux dates ouvertes, formulaire, politique/retour | Données Google réelles, saisie conservée | Réussi réel ; filtres complets couverts en simulation |
| Inscription | Champs/consentement, confirmation réelle, dernière place, doublon/reprise | Source confirmée, décrément une seule fois, aucun mail | Réussi Google/site réels |
| Annulation | Refus puis confirmation dans suivi, recalcul et réaffichage site | Source annulée, place récupérée une fois | Réussi Google/site réels |
| Automatisation | Suites moteur/COPY/audit et quatre profils navigateur simulés | Résultats et réserves explicites | 275/284 navigateur ; 9 échecs décrits ci-dessous |
| Rangement | Ajouts fermés/dépubliés/annulés, formulaire remis, sources antérieures identiques | Config/budgets restaurés, aucun Paramètres | Vérifié après restauration |

Premier lancement de la matrice navigateur empêché par le serveur local déjà présent sur4173 ; relance des seuls tests navigateur sur4187, sans changer le serveur de recette humaine.

## Automatisation exécutée

- Standard132/132, COPY238/238, sécurité/build réussis.
- Artefacts/calendrier7/7 exécutés ; deux contrôles privés d’anciens ICS reçus ignorés car fixtures indisponibles. Audit21/21 + deux scénarios VM réussis.
- Matrice navigateur :284 exécutés,275 réussis,9 échecs. Huit échecs axe de contraste déjà documentés (deux contrôles sur chacun des quatre profils). Un échec Firefox sur arrêt du scroll lors d’un changement vers reduced-motion après interaction ; reproduit2fois sur3 lors d’une relance ciblée, une réussite. Aucun changement de code lié au retrait de Paramètres ne touche ce parcours ; ne pas revendiquer une matrice entièrement verte.
- Premier lancement browser sur4173 empêché par serveur de recette déjà actif. Relance sur4187. Première relance Firefox ciblée sans variable de matrice a refusé le projet ; correction d’environnement puis exécution3cas, sans modifier les tests.

## Recette Google réelle

Code version9 inchangé, diagnostic temporaire en HEAD seulement. Limites d’envoi temporairement0/0, liste autorisée et budget consommé conservés, aucune remise à zéro. Préremplissage de la fixture depuis helper, validations et sauvegarde par vrai bouton natif. Refus vide et réessai sans doublon ; édition directe du listing confirmée sur le site.

Insertion de trois lignes via UI Sheets. Date/heure stockées avec types natifs, IDs générés. Capacité0 : diagnostic et fermeture, puis capacité1 corrigée ; seconde date présentielle capacité2, troisième date fermée. Site : deux dates ouvertes visibles, date fermée non proposée, contenu corrigé et tarif123CAD cohérents.

Inscription depuis vrai formulaire du site local : champs requis/accord refusés si absents, politique TEST-1 et retour avec données conservées. Une admission réelle en ligne confirmée, compteur1→0, deux canaux mail BLOCKED/COPY_LIMIT sans tentative. Site affiche Complet après lecture fraîche. Appels register réels ciblés sur cette fixture : DUPLICATE/FULL/POLICY_CHANGED/CONSENT_REQUIRED/CLOSED conformes, aucune nouvelle ligne ni budget mail modifié.

Une actualisation manuelle concurrente au filtre a renvoyé BUSY ; la vue s’est rétablie avec contexte vérifié. Refus natif d’annulation : source confirmee/compteur0. Confirmation native : source annulee/compteur1. Site affiche de nouveau1place après relecture suivant l’écriture. Réinscription avec nouveau consentement : seconde ligne distincte confirmée, première ligne toujours annulée, compteur de nouveau à0. Deuxième annulation confirmée dans le suivi : les deux inscriptions sont annulées et la place est revenue à1.


## État final vérifié

- Export XLSX avant/après comparé par identifiant, valeurs et types : les35formations,18disponibilités et15inscriptions initiales sont strictement identiques. Accueil, champs/métadonnées du formulaire Nouvelle formation et filtres du suivi restaurés exactement.
- Ajouts de recette conservés pour traçabilité : une formation dépubliée, trois sessions fermées, deux inscriptions annulées. Compteurs finaux1/2/2, sans double restitution. Les quatre canaux mail fictifs sont SUPPRESSED/RECIPE_NO_SEND pour prévenir tout envoi ultérieur.
- Aucun courriel envoyé : limites temporairement0/0, puis13/26 restaurées. Budget consommé et liste autorisée identiques avant/après. La délivrabilité des courriels et l’import Outlook/Apple Calendar ne sont pas prouvés par cette campagne.
- Paramètres absent. HEAD Google restauré exactement au code v9 de départ après retrait du helper ; manifeste inchangé. Aucun nouveau déploiement, scope ou déclencheur. Métadonnée privée de recette conservée en phase FINISHED, sans exécution automatique.
- Site local après lecture fraîche :30formations, fixture retirée du catalogue. Serveur4173 conservé pour les tests de Sofiane. Ancien TEST, PROD et site public non modifiés. Aucun commit/push.
- Preuves brutes privées hors dépôt : full-recipe-20261110 (exports avant/après, comparaison JSON, captures et sorties des tests). Aucun log ou donnée personnelle ajouté au dépôt.

## Réserves avant acceptation globale

Les parcours réels décrits ont été joués dans le navigateur intégré connecté au compte propriétaire. Cette campagne ne constitue pas une nouvelle validation Safari multi-compte. La sauvegarde native Google reste lente ; un rafraîchissement concurrent du suivi a renvoyé BUSY avant récupération. Les filtres complets et scénarios réseau/concurrence sont couverts par la matrice simulée, pas tous reproduits contre Google pendant cette campagne. Deux anciens contrôles ICS privés restent ignorés. Les huit contrastes connus et le scroll Firefox reproduit restent à traiter ou arbitrer ; TEM-27 reste In Progress.
