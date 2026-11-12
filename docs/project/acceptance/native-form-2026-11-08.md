# Prototype de saisie native — 8 novembre 2026

## Itération suivante — bouton après le contenu et remise à vide explicite

Sur demande Sofiane, l’enregistrement est désormais un vrai bouton natif après Formateurs, précédé du choix de publication. Les anciennes commandes au milieu sont retirées. « Préparer une autre fiche » devient « Vider le formulaire », accompagné de l’explication que seuls les champs de saisie sont effacés et que les formations enregistrées restent au catalogue.

Migration réelle de l’onglet existant sans effacement : dix champs, publication cochée, UUID et état SAVED conservés. Exports avant/après : Accueil, **33 formations, 15 sessions, 12 inscriptions et Paramètres strictement identiques**, aucun ajout de recette ni écriture métier. Cette base comprend les ajouts humains après le premier prototype décrit plus bas.

Safari habituel rechargé pour afficher le nouvel objet image : Tema actif et autre compte connecté par défaut constatés ; vrai clic sur le bouton → Running script, Finished script, puis « Cette formation est déjà enregistrée. Aucun doublon créé. ». La saisie humaine déjà enregistrée est laissée intacte. Cette passe vérifie l’invocation native et l’idempotence, pas une nouvelle création ou une nouvelle mesure de vitesse de sauvegarde. Le writer et la version web restent inchangés, aucun nouveau scope ni déclencheur ajouté.

Module Google relu identique au bundle local ; **143 tests administration réussis, dont28 ciblés**. Revue indépendante : cinq constats corrigés et couverts (réparation du bouton partiel, reprise de la remise à vide sur verrou, conservation des messages d’erreur, vrai faux objet mémorisant l’assignation, migration des contenus et états SAVED/SAVING/UNCERTAIN). Preuves privées `~/.config/tema-academie/native-button-20261108/`, dont capture du pied de formulaire, export et synthèse d’intégrité. Images assignées : usage ordinateur, mobile non revendiqué, conformément à la [documentation Google](https://developers.google.com/apps-script/guides/menus#clickable_images_and_drawings_in_google_sheets).

Les sections suivantes conservent les mesures et la recette initiales du prototype.

## Résultat et périmètre

Sur GO explicite Sofiane, l’onglet [Nouvelle formation](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=949868304#gid=949868304) est fonctionnel dans la seule copie privée. Champs essentiels, contenu facultatif, publication explicite, commande Enregistrer et préparation d’une autre fiche. Les boutons HTML existants sont conservés.

L’essai porte sur une formation ; pas encore de formulaire natif pour les sessions. Espace partagé, une personne à la fois. Acceptation Sofiane et extension à d’autres parcours restent ouvertes. Aucun commit/push, changement de l’ancien TEST/PROD, partage, publication web, inscription ou courriel.

## Vérification Google et Safari réels

- Session Safari existante : compte Tema actif, autre compte personnel connecté et indiqué Default ; deux autres entrées expirée/déconnectée. Aucun compte déconnecté ni réglage navigateur modifié. Le classeur est bien la copie autorisée, privée.
- Commande avec champs vides : refus « Choisissez Divalto, Dimo ou MoovApps. », champs conservés.
- Saisie Dimo, titre `RECETTE — Saisie native Safari — 2026-11-08`, durée 1 jour, tarif numérique 450 CAD, précision à partir de, publication décochée. Succès réellement observé dans la session Safari : « Formation ajoutée dans Dimo, en brouillon. ».
- Un nouvel enregistrement de la même fiche depuis Safari affiche « Cette formation est déjà enregistrée. Aucun doublon créé. ».
- Préparer une autre fiche remet les champs à vide avec une nouvelle requête, sans supprimer la fiche source. L’onglet est laissé prêt pour la recette humaine.

## Rapidité observée

| Contrôle | Résultat |
| --- | --- |
| Premier accès au nouvel onglet dans le classeur Safari déjà ouvert | 2,795 s |
| Trois retours ultérieurs à l’onglet | 1,141 / 0,975 / 0,694 s |
| Exécution Google complète du traitement de sauvegarde | 20,287 s, Completed |
| Intervalle interne conservé dans les métadonnées du formulaire | 18,545 s |

Les accès mesurent le clic natif plus l’observation d’accessibilité, avec le coût d’automatisation. Ce sont des bornes d’observation, pas une mesure précise du premier pixel ou une garantie sous une seconde. Une première ouverture du classeur avec session froide n’a pas été mesurée.

Le parcours évite l’ouverture d’un formulaire HTML et a sauvegardé malgré les comptes simultanés dans cet essai. La sauvegarde n’est pas instantanée : elle réutilise le writer existant, qui attend aussi la synchronisation et le suivi des inscriptions. Déporter ces rafraîchissements hors de la confirmation est une piste ultérieure, non réalisée ici. Pas de garantie de performance ni de correction générale de tous les navigateurs/comptes.

## Intégrité et installation

Exports natifs comparés par identifiants, valeurs et types : les **31 formations préexistantes, 15 sessions et 12 inscriptions sont strictement préservées**. Accueil et Paramètres identiques. Seul ajout source : une formation Dimo non publiée, ID `DIMO-PR-7bd88473-0643-4221-b763-1387c967950e`. Les ajouts humains antérieurs sont inclus dans ce contrôle, aucune restauration depuis une ancienne sauvegarde.

Module séparé `SaisieNative.gs` ajouté au projet lié COPY. Un déclencheur d’édition `traiterSaisieFormationTema`, version Head, propriétaire Tema, est ajouté ; le déclencheur minute `reconcilierCopieTema` reste présent. Aucun scope ajouté ni nouvelle autorisation Google demandée. Les champs sont modifiables, la présentation et les métadonnées sont protégées ; seule la copie est acceptée par le code.

Relecture native finale : module installé identique au fichier local testé, fichier existant `Code.gs` strictement identique à sa sauvegarde préalable, scopes du manifeste identiques à la référence COPY. Synchronisation TEM-27 vérifiée par relecture du commentaire ; statut In Progress conservé.

Preuves privées hors dépôt : `~/.config/tema-academie/native-form-20261108/`, exports avant/après, intégrité et durées, captures Safari/rendu et sauvegarde du code antérieur. Ces fichiers ne sont pas des livrables publics.

## Contrôles locaux et revue

**135 tests des modules d’administration réussis**, dont 20 pour le nouveau formulaire. Couverture des refus, valeurs zéro/vide, formules, mauvais classeur/événement, verrou, requête stable, état incertain, reprise malgré modifications des champs, installation interrompue et protection. Les tests locaux ne sont pas utilisés comme preuve du temps Google.

Revue indépendante courte terminée ; quatre constats corrigés : protection explicite des métadonnées, conservation du contenu soumis pour la reprise, retrait du seul onglet créé en cas d’installation interrompue, explication de la reprise si le verrou est occupé. Tests ciblés puis suite administration rejoués après corrections. `git diff --check` passe.

Pour retirer l’essai : supprimer uniquement le déclencheur `traiterSaisieFormationTema`, le fichier `SaisieNative.gs` et l’onglet Nouvelle formation. Conserver le déclencheur minute et les lignes source. Aucun retrait effectué à ce stade.
