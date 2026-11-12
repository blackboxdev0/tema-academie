---
title: 'Prototyper la saisie guidée native d’une formation dans la copie'
type: 'feature'
created: '2026-11-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="GO explicite Sofiane : petit prototype dans la copie, rendu et rapidité, sauvegarde Safari multi-compte, sans toucher au classeur actuel">

## Intent

Présenter et tester une alternative au formulaire HTML lent et fragile en session multi-compte : un onglet de saisie guidée natif dans la copie privée `10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8`. Le prototype porte sur l’ajout d’une formation, première étape proposée et autorisée avant extension aux sessions. Champs, publication explicite, validation, retour d’enregistrement et réessai restent dans Sheets. Le client conserve ses autres comptes connectés.

Conserver les données, les boutons actuels et le site. Mesurer accès aux champs et sauvegarde réelle dans Safari habituel multi-compte. Créer seulement une fiche de recette clairement identifiée, non publiée, sans session, inscription ou mail. Ne modifier ni l’ancien TEST ni PROD, ni partager le classeur, ni publier d’API, ni commiter/pousser. Les limites du prototype et toute preuve indisponible restent explicites.

</frozen-after-approval>

## Implementation Notes

- Route courte, un prototype cohérent et réversible dans la seule copie ; aucun choix humain restant. État Git antérieur connu et préservé, branche tem-6-technical-trial ; aucun commit/push selon restriction humaine actuelle. Installation d’un seul déclencheur d’édition dans le projet déjà autorisé, sans extension de scope ni d’accès ; suppression du seul déclencheur et du seul onglet ajoutés suffit à retirer l’essai. Si l’écran Google demande un accès nouveau, le traiter au point réel.
- Ajouter `app/experiments/admin-native-form.gs` et ses tests ; réutiliser garde de copie, validation, identifiants de requête et writer `TemaAdminActions.create`. Module ajouté séparément au projet Google existant, sans remplacer son bundle ou sa version web publiée.
- Onglet Nouvelle formation : champs essentiels et enregistrement visibles, contenu facultatif plus bas, couleurs Tema, listes et cases natives. Espace partagé explicitement une personne à la fois pour ce prototype ; pas de promesse multiéditeur. Métadonnées cachées/protégées pour requête et résultat, champs conservés après erreur, fiche brouillon par défaut, nouvelle saisie sur commande explicite seulement.
- Le traitement d’édition installé s’exécute comme son propriétaire ; les formulaires n’utilisent pas google.script.run. Événements hors copie/hors action ignorés, sérialisation du formulaire, verrou métier existant préservé, UUID stable pendant erreur/réessai. Une réponse incertaine ne permet pas de réinitialiser la requête et créer un doublon.
- Critères : étant donné la copie chargée, quand l’onglet est sélectionné, alors les champs sont accessibles sans formulaire HTML ; quand les champs sont valides et la case Enregistrer cochée, alors une seule fiche est ajoutée dans la bonne section et un succès explicite apparaît ; quand une saisie est invalide, aucune source n’est créée et les champs restent présents ; quand une requête est réessayée, aucune seconde fiche n’est créée. Les sources antérieures et paramètres restent identiques. Safari multi-compte doit être constaté dans la session réelle, sans modification des comptes.
- Vérification prévue : tests locaux ciblés des événements, refus, verrou, état incertain et reprise ; export natif de référence et comparaison typée finale, sauvegarde réelle Safari et plusieurs accès à l’onglet, capture de remise. La mesure serveur et le temps utilisateur ne sont pas confondus. Revue intégrée Blind Hunter avant remise ; acceptation Sofiane reste ouverte.
- Réalisation dans la copie terminée : onglet gid949868304, module séparé et déclencheur d’édition propriétaire, sans remplacement du bundle existant ni nouvelle autorisation Google. Refus de saisie vide, sauvegarde en brouillon et réessai sans doublon réellement réalisés depuis Safari avec Tema et un autre compte connecté par défaut. La fiche diagnostic est conservée ; formulaire remis à vide sur commande explicite.
- Exports typés : 31 formations antérieures, 15 sessions, 12 inscriptions et paramètres/Accueil préservés. Ajout net une formation Dimo non publiée. Aucun autre environnement, inscription ou envoi touché. Preuves privées hors dépôt ; [rapport courant](../../docs/project/acceptance/native-form-2026-11-08.md).
- Accès par clic + observation AX : 2,795s la première sélection du nouvel onglet dans le classeur ouvert, puis 1,141/0,975/0,694s. Coût d’automatisation inclus, pas de preuve sous une seconde ni de premier chargement froid du classeur. Sauvegarde Google Completed20,287s, intervalle interne18,545s : lenteur encore présente au writer/rafraîchissements, pas annoncée résolue.
- 135 tests administration réussis dont20 ciblés, revue indépendante et diff check terminés. `done` concerne le prototype installé et mesuré dans la copie ; acceptation Sofiane/extension aux sessions ouvertes, TEM-27 reste In Progress. Aucun commit/push.

## Review Triage Log

- medium → patch : la protection héritait des éditeurs du classeur ; propriétaire explicitement conservé, autres éditeurs retirés de la protection et domaine désactivé, champs déprotégés seulement. Réinstallation reconnue testée sans effacement de saisie.
- high → patch : champs modifiés pendant un échec rendaient la requête incertaine impossible à reprendre ; contenu soumis stocké dans les métadonnées protégées et réessai depuis cet instantané, UUID conservé. Échec puis réparation avec champs invalides testé ; succès et changements de champs distingués.
- medium → patch : installation interrompue pouvait laisser un onglet incomplet ; rollback du seul onglet nouvellement créé et test d’interruption. Réinstallation d’un prototype reconnu ne réinitialise pas la fiche.
- medium → patch : verrou occupé sans message de reprise ; message explicite de traitement en cours et décocher/recochez si nécessaire. Aucun changement de requête ou d’entrée hors verrou, test du message. Le titulaire du verrou réarme normalement la case en fin de traitement.
