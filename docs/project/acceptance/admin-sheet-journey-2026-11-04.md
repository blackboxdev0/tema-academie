# Ajout de formation et sessions dans la copie — 4 novembre 2026

Checkpoint direct par lignes conservé. Un GO suivant a ajouté les deux boutons et formulaires dans cette copie : [rapport courant](admin-sheet-buttons-2026-11-04.md). Les nombres et la procédure ci-dessous décrivent l’état antérieur à cet incrément.

## Résultat et cible

GO explicite Sofiane : rendre le parcours fonctionnel et tester une formation avec plusieurs sessions, uniquement dans la copie privée. Le parcours direct par lignes est réalisé et vérifié dans Google ; l’acceptation de Sofiane reste ouverte.

[Formations](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=0#gid=0) · [Disponibilités](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=336481329#gid=336481329).

Même copie **Tema Académie — ESSAI VISUEL — 2026-11-03**, accès privé inchangé. Le classeur actuel et son script TEST ne sont pas modifiés. Aucun raccordement de la copie au site, aucune inscription ni notification envoyée.

## Utilisation du prototype

1. Dans **Formations**, sélectionner la dernière ligne du bon logiciel, puis clic droit sur son numéro → **Insérer une ligne en dessous**. Le petit + natif fonctionne également ; le script restaure l’espace avant le logiciel suivant si nécessaire.
2. Saisir le titre, la durée et le tarif, puis cocher **Publiée**. L’identifiant et le logiciel sont attribués automatiquement. Les autres champs de fiche restent dans les colonnes masquées, accessibles avec les flèches d’affichage des colonnes.
3. Dans **Disponibilités**, ajouter une ligne dans le même bloc logiciel. Choisir la formation dans la liste, saisir date `AAAA-MM-JJ`, début/fin `HH:mm`, capacité et format `en_ligne` ou `presentiel`. En présentiel, renseigner aussi le lieu dans H masquée.
4. Cocher **Inscriptions ouvertes** quand la ligne est complète. Répéter pour chaque date : une seule fiche de formation, plusieurs identifiants de session et des capacités indépendantes.

Les listes et contrôles se mettent à jour après validation d’une cellule, en quelques secondes. Une erreur décoche l’ouverture et ajoute une note sur la formation de la session ; il faut corriger puis rouvrir explicitement. Un renommage conserve les IDs. Dépublier une formation retire le choix pour les nouvelles sessions et ferme ses sessions ; republier ne les rouvre pas automatiquement.

**Capacité et format sont des saisies explicites.** Le remplissage automatique testé au début a été retiré : un calcul Google en cours pouvait remplacer une capacité saisie rapidement. Le script n’écrit plus dans F/G des sessions. Le compteur J reste calculé depuis les capacités et les inscriptions confirmées, ces dernières étant lues sans modification.

## Réalisation isolée

La copie possédait son propre projet lié, distinct du TEST : `1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA`. Son ancien bundle copié et son manifeste ont été sauvegardés hors dépôt, puis remplacés dans ce seul projet. Nom courant : **Tema Académie — Prototype administration — COPIE**.

Sources hors build produit : `app/experiments/admin-sheet-prototype.gs`, `.manifest.json`, `.test.cjs`. Garde stricte de l’ID de copie avant toute lecture/écriture ; manifeste limité à `spreadsheets.currentonly`, sans service avancé ni accès mail/externe. Deux déclencheurs simples `onOpen`/`onEdit`, aucun déclencheur installable (écran Google : **0 triggers**), aucun déploiement web.

Premier `onOpen` réel interrompu par Google : les colonnes B des tables de sessions étaient typées Text et refusaient la validation personnalisée. Le type de ces trois colonnes seulement a été passé à None, en conservant les tables, couleurs et listes. Les réouvertures suivantes ont réussi. Dernier `onOpen` observé : **15:03:20 Montréal, 4,275 s, Completed** ; cinq `onEdit` précédents terminés en 5,952 à 8,962 s. Ces durées d’exécution ne sont pas un engagement de délai ni une mesure du site.

Lecture finale du code par le presse-papiers natif de l’éditeur identique à la source locale, après retrait des blancs finaux : SHA-256 `76a994f61c0b086f56dcb36d90189471d517278e92e6ac53035d7ed2efbcbc75`. Manifeste minimal revu dans l’éditeur.

## Vérifications

**Google réel, saisie native et déclencheurs automatiques**, sans fonction de création préremplie :

- Formation `ESSAI — Dimo — Formation multi-sessions`, durée 1 jour, tarif 850, créée en brouillon puis publiée. Apparition constatée dans la liste Dimo ; aucune session créée par la seule publication.
- Trois sessions conservées, toutes ouvertes : **10 février 2027 / 8 places**, **10 mars 2027 / 12 places**, **14 avril 2027 / 4 places**, de 09:00 à 17:00, en ligne. Même référence de formation, trois IDs uniques, compteurs 8/12/4.
- Capacité mise à zéro sur la troisième session : ouverture automatiquement décochée. Capacité remise à 4, session rouverte. Les deux autres capacités restent inchangées.
- Saisie rapide rejouée sur une quatrième ligne temporaire : le premier correctif de comparaison avant écriture ne suffisait pas dans Google. Après retrait des défauts F/G, capacité et compteur **12** conservés dans l’export natif ; ligne temporaire retirée. Aucune donnée de cette quatrième ligne ne reste dans la copie.
- Réouverture native réussie ; tables finales Formations A1:M20 / A22:M27 / A29:M31, sessions A1:L4 / A6:L10 / A12:L13.

**Intégrité par exports XLSX natifs avant/après**, comparés par ID et types de cellules, indépendamment des déplacements de lignes : 25 formations et 5 sessions existantes strictement inchangées ; ajout net d’une formation et trois sessions ; valeurs et formules des onglets Inscriptions et Paramètres strictement identiques. Export avant SHA-256 `3df7489ff91dcbe0722e21c0c6e5c6b75d838948236c931a8c64df44a9d43553`, final `5084fbf9e31bb38c2a5c434bc55ccad03dcce178a9cfc916097b6d7b73c4d25c`.

Sauvegardes et synthèse d’intégrité privées : `/Users/sofiane/.config/tema-academie/prototype-administration-20261104/`. Exports bruts et captures temporaires hors Git. Capture de démonstration : `/tmp/tema-admin-copie-trois-sessions-20261104.png`.

**Vérification locale distincte : 32 tests Node réussis**, logique et faux adaptateur Google : publication, listes par logiciel, références stables, copie de lignes sans doublon, dates/heures/capacités invalides, heure d’été ambiguë/inexistante, compteurs, absence d’écriture dans les inscriptions, verrou libéré en erreur et refus de toute action hors copie. Renommage/dépublication, duplication et scénarios d’inscriptions sont couverts localement ; ils ne sont pas présentés comme des tests Google réels de cette passe. Revue indépendante intégrée terminée, constats corrigés et limite de concurrence consignée dans la spec.

## Limites avant intégration

Prototype de manipulation dans Sheets, sans bouton ni formulaire latéral, sans recette multiutilisateur ni garantie transactionnelle. Les déclencheurs peuvent se chevaucher et Google peut refuser un verrou avec un message de réessai ; le compteur peut attendre le prochain déclenchement ou la prochaine ouverture lors d’éditions concurrentes. Aucune promesse de recalcul instantané. Les champs saisis capacité/format ne sont plus écrits par le script.

L’intégration future demande d’adapter le lecteur aux sections/en-têtes et de réutiliser les validations/admissions du moteur complet. Elle nécessite son propre GO. Inscriptions/Paramètres restent pour l’incrément suivant. Aucun commit/push demandé, aucune fusion/main ni mise en production ; TEM-27 reste In Progress pour la recette globale.

Références techniques officielles : [déclencheurs simples](https://developers.google.com/apps-script/guides/triggers), [validations](https://developers.google.com/apps-script/reference/spreadsheet/data-validation-builder), [verrous](https://developers.google.com/apps-script/reference/lock/lock-service).
