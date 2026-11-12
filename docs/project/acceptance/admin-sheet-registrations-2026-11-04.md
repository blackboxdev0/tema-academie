# Suivi des inscriptions dans la copie — 4 novembre 2026

## Résultat dans la copie

La [spécification approuvée](../../../_bmad-output/implementation-artifacts/spec-suivi-inscriptions-copie.md) est implémentée dans la [vue Suivi des inscriptions de la copie](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=901030360#gid=901030360). Le nouveau module `app/experiments/admin-sheet-registrations.gs` construit cette projection exclusivement dans la copie privée. Les données et leurs instantanés restent dans la seule table source Inscriptions ; la projection ne modifie aucune des quatre tables métier.

La vue propose cinq filtres natifs : période (À venir par défaut, Toutes les sessions, Passées), logiciel, formation, statut et recherche libre. Les bandeaux de formation reprennent DIV `#FF008F`, DIMO `#365AA7`, MOOV `#176C68`, avec texte blanc gras de 14 pt. Les sessions sont triées par formation puis début ; les formations homonymes restent distinctes par ID. Les dates sont affichées en français, avec calcul des instants dans `America/Toronto` et mention « heures de Montréal ».

Chaque session conserve son compteur complet de confirmées/annulées et sa capacité, même si le statut ou la recherche masque des personnes. Une capacité absente reste inconnue ; un dépassement est signalé sans modifier le statut d’une inscription. Les états de confirmation du participant et de Tema sont séparés, et **Envoyé ne garantit pas la réception**. Les états inconnus affichent À vérifier. Les inscriptions dont la session ou la formation a disparu restent consultables dans Toutes les sessions ; les conditions historiques différentes sont visibles sous la personne.

Le menu existant conserve Ajouter une formation / Ajouter une session et ajoute Consulter les inscriptions / Actualiser le suivi. Le simple filtre emprunte une branche séparée sans synchronisation métier. Après un ajout depuis les formulaires, la vue est explicitement rafraîchie si elle existe. Les valeurs, couleurs et styles de projection sont écrits en matrices groupées ; les bandeaux fusionnés et groupes de lignes restent des appels natifs par section. La protection avec avertissement laisse les filtres accessibles. Le module ne masque aucune source : ce geste est réservé à la vérification d’intégrité réelle.

## Vérification locale réalisée

`node --test app/experiments/admin-sheet-*.test.cjs` : **113 tests réussis, zéro échec, zéro ignoré**. Les 63 contrôles antérieurs sont conservés et 50 contrôles du suivi couvrent notamment :

- jointures par ID et en-têtes reconnus par nom même réordonnés dans les 29 colonnes ; compteurs indépendants des filtres de participants ; sessions vides et capacités absentes/dépassées ;
- périodes, filtres dépendants et réinitialisation explicitement signalée, recherche sans accents, formations homonymes et tri stable ;
- historique sans session/formation, conditions modifiées, instantanés corrompus, inscriptions sans cohorte et dates invérifiables ;
- dates/heures Sheets typées et textes, hiver/été et heures ambiguës/inexistantes ; états inconnus et texte projeté rendu inerte contre les formules ;
- garde hors copie avant les services, refus d’un onglet homonyme inconnu, installation simulée, source strictement en lecture seule et répétition sans cumul ;
- absence de synchronisation métier sur les filtres, sélection modifiée pendant le rendu, concurrence continue, verrou occupé et erreurs de source/écriture avec retrait des compteurs trompeurs et message visible.

Ces adaptateurs Google, injections et cas de concurrence sont des **simulations locales**, sans preuve d’exécution réelle dans Sheets. La compilation syntaxique du bundle et `git diff --check` réussissent. Les contrôles précédents du site ne sont pas revendiqués comme rejoués : ce changement concerne uniquement les expériences de la copie.

Le constructeur privé conserve exactement le HTML des deux formulaires et les deux images, comparés au bundle natif précédent. Bundle généré hors dépôt : `/Users/sofiane/.config/tema-academie/prototype-boutons-20261104/Code.gs`, **90 375 octets**, SHA-256 brut **`a6533ef98ba62076cbca747455a214a4447f0a686048a92e768fcb31615beb4c`**. La lecture native du code final après sauvegarde égale exactement le candidat après retrait des blancs finaux : SHA-256 canonique **`16eb6ee9e9c19cb715f6a344443e36f87f332cf5b34baef7508b6b1ba61d8af8`**. Le manifeste natif final est identique à la sauvegarde initiale. Le module n’appelle aucun service de courriel, réseau externe ou déclencheur. Aucun fichier nominatif, export ou capture ajouté au dépôt.

## Contrôles Google réels

L’agent racine a appliqué le bundle dans le seul projet lié de la copie `1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA`. Première installation réussie en11,832s, réinstallation compacte en8,491s. Les lignes1–14 occupent280px, dont264px gelés, et les filtres sélectionnés sont conservés après migration et rechargement.

Sept états réellement saisis dans Sheets puis exportés nativement ont été comparés aux sources, sans créer d’inscription :

| Sélection | Sessions | Confirmées | Annulées | Places restantes | Participants affichés |
|---|---:|---:|---:|---:|---:|
| Dimo |5|0|2|67|2|
| MoovApps |1|0|1|12|1|
| Statut Confirmées |12|4|5|100|4|
| Passées |0|0|0|0|0|
| Formation Test |1|0|0|40|0|
| Recherche recette v1 |12|4|5|100|4|
| Toutes les sessions |12|4|5|100|9|

Le contrôle Formation Test retrouve l’ajout humain existant :19novembre2026,08:15–11:30,40places. Les sources antérieures comportent28formations/12sessions/9inscriptions, dont4confirmées et5annulées. Les sept exports ont **valeurs, formules, types et formats numériques des quatre tables métier strictement identiques** à la référence avant modification. La projection ne contient aucune formule. Les valeurs d’Accueil et ses deux images restent identiques. L’onglet source Inscriptions a ensuite été masqué, sans suppression ni renommage, récupérable par Afficher les feuilles.

Les filtres logiciel/formation/statut/période/recherche, la sélection successive rapide formation/période, les trois couleurs, les dates françaises, les sessions vides et les lignes nominatives ont été examinés à100%. Le repli puis la réouverture d’un groupe fonctionnent ; Google affiche cependant son avertissement standard de feuille protégée à chaque changement de visibilité. Les filtres eux-mêmes restent accessibles sans avertissement. Les deux formulaires ont été ouverts, examinés puis annulés sans saisie ni enregistrement. Les trois groupes de logiciels et la formation humaine Test sont toujours proposés dans l’ajout de session.

Exécutions natives des premiers filtres :3,606 à8,591s, toutes Completed ; onOpen7,933s, puis10,181s après rechargement. Les simples onEdit suivants observés restent sous30s. Ces durées Google ne mesurent pas un rendu garanti à chaque volume ou en cas de panne fournisseur. Les chiffres Node ne sont pas utilisés comme preuve de performance native.

Référence et preuves privées : `/Users/sofiane/.config/tema-academie/prototype-inscriptions-20261104/` contient code/manifeste avant, candidat et vérificateurs de lecture seule. Export de référence natif suffixe`5f30cd89-8a65-436b-bbdc-182a0f4fefac`, export Toutes les sessions suffixe`82aef125-b0f4-4932-a5e7-8d241f86dde4`, export après masquage et deux annulations de modales suffixe`e73bd003-27ca-4aca-97c4-2299bce2d040`, conservés dans le dossier temporaire des exports du navigateur. Ce dernier confirme source masquée,9participants projetés, zéro formule, quatre validations et les quatre sources/Accueil strictement inchangés. Le manifeste relu conserve seulement`spreadsheets.currentonly` et`script.container.ui` ; l’écran natif initial puis final atteste0déclencheur installable.

## Revue et corrections finales

Trois couches indépendantes ont examiné le diff complet : critique, cas limites et lacunes de vérification. Les15constats sont triés individuellement dans la spec. Les problèmes du suivi sont corrigés : état Actualisation sous verrou, corps masqué/compteurs retirés pendant les calculs, aucune écriture sans verrou, sources et filtres revalidés avant succès, au plus deux passes et budget borné. Les diagnostics restent affichables même si le nettoyage échoue. Les instantanés vides, intervalles impossibles/inversés et identifiants d’inscription absents sont signalés sans modifier les sources ni perdre les personnes.

Les quatre tests d’intégration chargent les trois modules réels et couvrent onOpen, onEdit métier, ajout réussi et avertissement après ajout enregistré si le suivi échoue. Vérification par mutations hors dépôt : retirer le hook onOpen, le hook onEdit source ou celui de create fait maintenant échouer leurs tests respectifs. Les113tests complets passent sur le code final.

Deux petits défauts d’anciens scripts de mesure, sans appel depuis le suivi, sont consignés dans deferred-work : nettoyage du serveur HTTP si Chromium échoue au lancement. Ils ne sont pas corrigés dans ce périmètre. Deux suggestions faibles ne sont pas retenues : reprise automatique d’une première installation interrompue avant tout marqueur, et affichage commercial détaillé des anciennes conditions. Un onglet homonyme inconnu reste préservé et exige une récupération manuelle ; les prix/durées historiques restent dans la source.

Le candidat corrigé a été appliqué dans le même projet lié, sans déploiement. État Actualisation observé sans anciens groupes/compteurs ; filtre Dimo réexporté avec 5 sessions, 2 annulées, 67 places et deux participants. Retour aux filtres par défaut : export final suffixe `35d54050-4a8f-46e2-8b41-36fe2701238f`, 12 sessions, 4 confirmées, 5 annulées, 100 places, les 9 participants projetés et les sources/Accueil strictement identiques. Capture de remise `/tmp/tema-inscriptions-copie-20261104.png`. Les contrôles sémantiques antérieurs restent distincts de ce rejeu final.

Exécutions du candidat corrigé : actualisation manuelle 12,685 s, filtres Dimo puis Tous 11,473 et 15,802 s, onOpen 15,814 s, tous Completed. La revalidation renforce la cohérence mais le recalcul reste lent : optimiser ces appels avant généralisation. L’ouverture du formulaire formation a exceptionnellement pris 83,505 s, celle du formulaire session 2,32 s ; les deux ont abouti et ont été annulées sans création, cause de cette variabilité non établie. Ce point reste à reprendre dans la future recette. Aucune concurrence réelle entre deux comptes Google ni injection de panne réelle n’est revendiquée.

## Suites

Une vue partagée conserve des filtres partagés. Le verrou et la relecture après rendu évitent d’appliquer la valeur d’un ancien événement ; si la sélection change continuellement, le résultat est retiré et le menu permet un réessai. Les protections avec avertissement n’empêchent pas un éditeur de confirmer une modification manuelle de la projection : l’actualisation remplace celle-ci. Aucune recette multiutilisateur réelle n’est déduite des simulations.

Aucun commit/push, aucune modification du classeur actuel/PROD ou du site, aucune inscription créée, aucun courriel, déclencheur installé ou déploiement. L’acceptation de Sofiane et l’intégration de ce prototype restent distinctes de cette vérification locale.
