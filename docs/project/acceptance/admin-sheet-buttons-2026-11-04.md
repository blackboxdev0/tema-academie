# Boutons et formulaires dans la copie — 4 novembre 2026

## Résultat

GO explicite Sofiane réalisé dans la seule copie privée : [Accueil et boutons](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=1006726952#gid=1006726952). Les deux images-boutons natives **Ajouter une formation** et **Ajouter une session** ouvrent leurs formulaires dans Google Sheets. Le menu **Tema Académie** offre les mêmes commandes depuis les autres onglets.

Le client peut créer la fiche complète, choisir son logiciel, conserver un brouillon ou publier explicitement. Les sessions choisissent une formation publiée dans une liste groupée par logiciel ; chaque date a ses horaires, capacité, format et lieu/lien. **Ajouter une autre date** permet un lot de 1 à 12 sessions. L’ouverture des inscriptions est explicite, fermée par défaut. L’édition directe des lignes reste disponible.

Les formulaires écrivent dans les tables existantes, sans autre base ni copie des fiches. Accueil contient seulement actions et liens. Le classeur actuel, le moteur TEST et le site restent inchangés ; la copie ne leur est pas raccordée. Aucun mail, inscription, déclencheur installable ni déploiement web créé. Acceptation Sofiane et intégration restent ouvertes.

## Essais réels dans Google

- Clic sur **Ajouter une formation**, saisie d’un titre fictif puis **Annuler** : aucune ligne correspondante créée.
- Création et publication de **ESSAI — Boutons — Formation guidée**, dans Divalto, durée 1 jour et tarif 950 $ CAD. Description, prérequis, programme, résultats et formateurs fictifs saisis depuis le formulaire, sans afficher les colonnes masquées. Confirmation native observée et fiche présente dans la liste de sessions.
- Clic sur **Ajouter une session** : sélection de cette fiche par son titre. Date passée envoyée : refus serveur « La session doit être dans le futur », sélection, horaires, capacité et ouverture conservés. Export intermédiaire : aucune nouvelle session.
- Ajout, suppression d’une date vide et réajout vérifiés ; focus placé dans la date ajoutée puis rétabli dans une session survivante après suppression.
- Lot final de trois sessions enregistré en une fois et confirmé dans Google : **9 juin 2027 / 6 places / en ligne**, **7 juillet 2027 / 10 places / présentiel**, **11 août 2027 / 4 places / en ligne**, toutes de **09:00 à 17:00 Montréal**, ouvertes. Lieu fictif de la seconde date conservé. Même fiche, trois IDs distincts, compteurs 6/10/4.

L’export XLSX natif final vérifie aussi les types numériques des nouvelles dates/heures et leur reconversion indépendante aux jours/horaires attendus. Les tables se sont étendues : formations A1:M21 / A23:M28 / A30:M32 ; sessions A1:L7 / A9:L13 / A15:L16.

## Intégrité et candidat

Comparaison par ID et types de cellules : **26 formations et 8 sessions préexistantes strictement identiques**, ajout net **1 formation et 3 sessions**, aucun ID dupliqué. Valeurs et formules d’**Inscriptions et Paramètres strictement identiques**, y compris les fixtures antérieures. Accueil sans erreur de formule ; liens natifs RichText.

Export avant SHA-256 `fed4662ddc674cacd75beacee6ae97d924af99b6b01d2b94ed0cf396ba0809f9`, final `84d8dd039dc419e2a4fd076f50a0ab33ac6248e0c7b73fb9157937b826e3674a`. Sauvegardes du code/manifeste, bundle, exports et synthèse privés hors dépôt : `/Users/sofiane/.config/tema-academie/prototype-boutons-20261104/`. Capture de remise : `/tmp/tema-boutons-accueil-20261104.png`.

Projet lié de la copie seulement : `1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA`. Lecture native finale du bundle identique au fichier local après retrait des blancs finaux, SHA-256 **`3a6bdc32cf57d57bb7d8d7d4feae2ddbc3879777b77e55c43ba91552b4f4f71f`**. Manifeste revu : `spreadsheets.currentonly` et `script.container.ui` seulement ; écran Google **0 triggers**. Toutes les fonctions vérifient l’ID de copie avant les accès.

Sources : `app/experiments/admin-sheet-actions.gs`, `.html`, `.test.cjs`, `build-admin-sheet-actions.cjs`, plus extension du prototype et de son manifeste. Les images sont construites localement à partir de SVG, incluses dans le bundle privé et assignées aux fonctions Google. Aucun asset externe appelé.

## Contraintes Google rencontrées et résolues

L’installation initiale a créé l’accueil mais échoué sur `getUi()` depuis l’éditeur ; le menu est maintenant créé par `onOpen` dans le classeur. Le lanceur d’installation ne dépend plus de ce contexte et peut réparer les liens d’un accueil reconnu. Les formules HYPERLINK refusées par la locale ont été remplacées par RichText. Le second modal facultatif depuis le succès a été retiré ; le parcours revient aux deux commandes d’Accueil.

Les colonnes C/D/E typées Text empêchaient l’écriture de formats de date. Ces **neuf colonnes des trois tables de sessions sont passées à None par l’UI**, sans conversion des anciennes valeurs. Les formats sont appliqués aux seules nouvelles lignes, une colonne à la fois comme l’exigent les tables. Les tentatives interrompues avant écriture ont retiré leurs seules lignes encore vides ; les saisies du formulaire ont permis le réessai final. Le premier clic d’ajout de date avait aussi révélé un handler manquant, corrigé puis rejoué dans Google.

## Validation et limites

**63 tests locaux réussis** : 32 du prototype direct et 31 des commandes. Ils couvrent validation, droits hors copie, insertion, données existantes, réessai idempotent et contenu différent sous la même requête, lot raccourci, erreurs de verrou/écriture/installation, conservation d’une saisie après échec post-écriture, avertissement si actualisation reportée et données HTML échappées. Ces injections et les réessais de réponse perdue sont des simulations locales ; les scénarios Google réels sont ceux décrits plus haut.

Revue indépendante intégrée terminée, constats traités dans la spec. Aucun nouveau défaut bloquant identifié sur ce périmètre. La recette multiutilisateur et l’admission transactionnelle du moteur complet restent hors de ce prototype. Un échec après écriture conserve toute ligne non vide et demande une vérification/réessai, sans supprimer des données saisies.

Boutons destinés à Sheets sur ordinateur : Google indique que les images/dessins assignés à un script ne s’exécutent pas dans l’application mobile. [Documentation officielle des commandes](https://developers.google.com/apps-script/guides/menus), [dialogues HTML](https://developers.google.com/apps-script/guides/dialogs).

Aucun commit/push selon la consigne actuelle, aucune fusion/main/production. TEM-27 demeure In Progress pour la recette globale. Ce rapport complète le [parcours direct précédent](admin-sheet-journey-2026-11-04.md), sans modifier ses preuves historiques.
