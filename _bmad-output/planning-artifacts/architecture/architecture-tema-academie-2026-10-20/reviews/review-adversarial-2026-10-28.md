# Reviewer Gate — attaque des divergences entre unités

28 octobre 2026. Revue indépendante de la spine consolidée, du contrat de données, des règles/acceptations et du contrôle technique commun. Aucun autre rapport de reviewer du28octobre consulté ; aucun code, service ou donnée modifié.

## Verdict

**PASS pour G0, clôture documentaire avant revue UX/UI.** Aucun trou de contrat P0/P1/P2 identifié permettant à deux unités du niveau inférieur de respecter tous les AD tout en choisissant des comportements incompatibles sur les sujets examinés. Aucun arbitrage humain nouveau demandé par cette lecture.

Le verdict concerne la cohérence du contrat. Il ne constate pas l’implémentation des nouveaux champs, du limiteur ou de la cadence, ni une nouvelle preuve Google. Le bilan TEM-6 reste4ET PASS/8NON VÉRIFIÉ et le GO principal reste distinct.

## Paires adversariales examinées

| Paire construite | Divergence tentée | Règle qui l’interdit ou résolution déjà fixée |
|---|---|---|
| Projection et interface | Le producteur garde `status=open` sans tarif ; le consommateur active le bouton sur ce seul état | AD-3/8 et contrat public imposent `registration_enabled`, motif dérivé, garde en cas de champ absent/incohérent, classement exhaustif et choix de prochaine date éligible. La date reste consultable sans nouvelle admission |
| Reçu de reprise et contrôle de prix | Le prix est retiré après réservation ; une unité retourne l’inscription existante, l’autre refuse avant recherche | AD-4 et contrat exigent la recherche du replay/conflit avant les validations mutables. Le prix absent bloque seulement la nouvelle admission ; la réservation et ses instantanés restent reconnus |
| Deux adaptateurs d’admission | Un adaptateur conserve une fenêtre glissante ou un quota par IP tandis que l’autre applique3/30par fenêtre fixe | AD-2 impose le moteur commun ; AD-7 et le compagnon fixent fenêtre UTC `floor(epoch_ms/60000)`, empreinte du courriel normalisé et compteur global sous verrou, sans IP cliente réputée fiable |
| Limiteur et moteur de reprise | Le compteur plein empêche une reprise, ou un résultat indéterminé est transformé en refus certain | Lookup/replay prioritaire, absence de renvoi, `INVALID/not_recorded` réservé à une commande nouvelle identifiée ; indisponibilité du compteur→`UNAVAILABLE/unknown` sans nouvelle inscription |
| Édition/import et contrôle périodique | Un import dépend seulement d’onEdit et un contrôle périodique réattribue un ID après interruption | AD-3/8 fixent service partagé, appel explicite par import/script, identités stables, provenance de reprise et absence de doublon/écrasement silencieux ; réparation sans email |
| Lecture de places et admission | Le site fait autorité avec son dernier compteur ou la cadence5min reporte la vérification du stock | AD-4/8 exigent lecture actuelle des confirmés sous verrou à l’admission, indépendante de l’actualisation publique et du secours |
| Réservation et budget de courriels | Une unité annule ou refuse une réservation enregistrée à partir d’un compteur quotidien50 | AD-5/10 et le contrat distinguent réservation et envoi, quota réel et plafond théorique ; aucun plafond métier50 ajouté, place conservée si l’envoi échoue |
| Export et saisie Google | Un champ est inerte dans Sheets mais un exporteur le laisse exécutable dans Excel | AD-7 et les contrôles imposent l’inertie à l’ouverture du format exporté, essais `=,+,-,@` et absence de promesse CSV brute |
| Configuration TEST et Métier | L’un retire globalement les gardes du prototype pour promouvoir, l’autre conserve la configuration d’essai en exploitation | AD-9 et le contrat fixent séparation des ressources et un écrivain, destination serveur, paramètres métier vérifiés, suppression/désactivation des modes de panne côté métier et conservation des gardes surTEST |
| Publication de candidat et recette | La recette complète exige un déploiement qui attend déjà son acceptation | AD-9/10 et G0–G4 distinguent preview/candidat autorisés, tests contrôlés, acceptation puis promotion ; publication du candidat précède la recette distante |
| Chronométrage normal et cas manqué | Une unité annonce une moyenne<120s et l’autre assimile le secours5min à une garantie absolue | Le contrôle commun exige chaque édition normale de la séquence<120s, maximum observé et budget mesuré/extrapolé séparés ; cas manqué et panne fournisseur explicitement distincts |

## Limites et preuves à produire ultérieurement

Les futurs tests doivent appliquer les mêmes conventions : prix absent/replay/tri et réception des champs,4ecommande par empreinte et31eglobale dans la fenêtre fixe, reprise de fenêtre/compteur indisponible/concurrence, import interrompu puis relancé, ouverture Excel et promotion de configuration. Ces obligations sont déjà affectées aux contrats et aux gates ; leur absence actuelle n’est pas présentée comme un défaut de conception silencieux.

Les limites connues sont conservées : le verrou script n’atomise pas les éditions humaines, un envoi engagé n’est pas révoquable, la garde de rafale n’est ni une authentification ni une défense DDoS, et la clôture documentaire n’accorde aucun nouveau GO de code ou de déploiement.
