# Sessions natives dans la copie — 8 novembre2026

**Décision ultérieure de Sofiane : prototype abandonné.** L’onglet Nouvelles sessions est retiré ; ajout et modification directement dans Disponibilités, dropdowns conservés. Adaptation multi-compte différée selon le client. Code source local archivé en privé, aucune suppression de session. Export avant/après retrait : valeurs et types de Formations, Disponibilités, Inscriptions, Paramètres, Accueil et Nouvelle formation strictement identiques.32tests directs réussis. Déclencheur dédié supprimé après confirmation explicite ; seuls les deux déclencheurs préexistants subsistent. Module Google SessionsNatives.gs retiré. Le reste du rapport décrit l’essai historique.

La copie privée comporte désormais [Nouvelles sessions](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=481978225#gid=481978225). Choisir une formation publiée, saisir une à douze dates, puis cliquer Enregistrer en bas. Date, début, fin, capacité, format et lieu/lien sont modifiables. Les lignes vides sont ignorées. Les inscriptions restent fermées tant que la case n’est pas cochée. Vider le formulaire conserve toutes les sessions déjà enregistrées.

Dans Disponibilités, les trois tables possèdent un dropdown Format, y compris les nouvelles lignes. La colonne Lieu ou lien est visible. Le formulaire affiche En ligne/Présentiel ; le listing conserve en_ligne/presentiel pour rester compatible avec le site et COPY v5. Formation se choisit également via les listes existantes ; ouverture reste une case, dates/heures/capacités leurs champs typés. Accueil et ancienne méthode par formulaire HTML conservés.

## Vérification

- 233/233 tests locaux administration/COPY, dont43 nouveaux contrôles de sessions, revue intégrée et corrections terminées. Les limites de ces faux services ne remplacent pas les essais natifs suivants.
- Safari réel : deux dates fermées sur la formation fictive existante ESSAI — Boutons — Formation guidée ; capacités4/6, horaires09–12h et13–17h, formats en ligne et présentiel. Vrai bouton, confirmation de création, second clic sans doublon, remise à vide sans suppression réussis. Menu Format ouvert nativement sur une nouvelle ligne, deux choix visibles.
- Exports Google avant/après :34formations identiques ;15anciennes sessions identiques,2ajouts fermés ;12inscriptions identiques ; Paramètres, Accueil et saisie humaine de Nouvelle formation identiques. Comparaison des valeurs ET types, dates/heures conservées. Après reset et réessai, mêmes sources et formulaire vide, ouverture décochée.
- Module SessionsNatives.gs relu depuis l’éditeur Google et identique au bundle testé. Installation terminée12:57:54 Montréal. Trois déclencheurs au total : réconciliation, saisie formation, nouveau saisie sessions ; un seul nouveau, propriétaire, sans scopes supplémentaires.

Preuves privées dans ~/.config/tema-academie/native-sessions-20261108/ : before.xlsx, after-dropdowns.xlsx, after-save.xlsx, after-final.xlsx, integrity.json, formulaire-safari.png et dropdown-safari.png. Aucun export ou contenu utilisateur versionné. La sauvegarde Google reste asynchrone et peut prendre plusieurs secondes ; aucune nouvelle garantie de performance annoncée.

## Choix techniques et limites

Le module réutilise le writer existant et ses identifiants stables, avec snapshot et réessai idempotent. Un refus métier définitif sans écriture permet une correction ; réponse incertaine ou commit partiel conserve la même requête et interdit un reset ambigu. Contrôles capacité, dates/heures, publication, lieu présentiel et HTTPS du formulaire couverts localement.

Les colonnes des tables natives refusent getDataValidations et les écritures classiques de validation, parfois seulement à flush. Le candidat lit les métadonnées Sheets API tables.columnProperties, respecte les règles natives et ne force aucune écriture sur ces colonnes. Les validations des trois colonnes Format ont été réglées via l’UI native ; leur extension est constatée dans les exports des deux lignes ajoutées.

Prototype pour le compte propriétaire sur ordinateur, une personne à la fois. Aucun support mobile/multiéditeur recetté. Les essais n’ajoutent ni inscription ni courriel ; l’enveloppe COPY reste épuisée. API web COPY v5, ancien TEST, PROD et site public inchangés. Aucun commit/push. TEM-27 reste In Progress ; acceptation humaine du rendu et recette globale ouvertes.
