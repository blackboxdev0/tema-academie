# Réconciliation d’entrée Spec — 26 octobre 2026

Périmètre : étape Finalize 2 de `bmad-architecture`, comparaison de la spine avec `SPEC.md`, `contrat-donnees.md`, `regles-et-acceptation.md`, `plan-essai-technique.md`, `strategie-tests.md` et les passages pertinents des journaux. Lecture documentaire uniquement ; aucune validation technique, écriture applicative, ressource Google, transition Linear ou création de commit.

**Verdict : un manque P2 propre à la spine, puis quatre dérivations attendues lors de son adoption par Spec.** Les arbitrages du 26 octobre priment sur les compagnons encore datés du 25 octobre. Les écarts de dérivation ci-dessous ne constituent pas des besoins nouveaux ou des omissions de la spine. Le dossier reste sans GO de code, d’essai réel ou de commit.

Les chemins courts ci-dessous désignent le package `_bmad-output/specs/spec-tema-academie-v1/`. `Spine` désigne `../ARCHITECTURE-SPINE.md` depuis ce rapport.

## 1. P2 — Manque dans la spine : export Excel sans dépendance aux formules Google

**Entrée :** `SPEC.md:60-62` exige des données tabulaires exportables vers Excel ; `SPEC.md:80` prescrit des calculs script ; `regles-et-acceptation.md:61` porte AC-19, export sans formules Google. Le journal Spec `.memlog.md:19` précise la contrainte existante : pas de dépendance `QUERY` / `ARRAYFORMULA` / `IMPORTRANGE`, calculs script. Il ne s’agit donc pas d’une nouvelle interprétation.

**Constat :** AD-3 lie les en-têtes/types et schémas, AD-8 les règles d’administration et de calcul, AD-10 la remise (`Spine:70-74`, `100-104`, `112-116`), mais aucun ne conserve cette contrainte d’export. Le renvoi au contrat de données ne suffit pas à la retrouver : ce compagnon n’explicite pas lui-même cette interdiction. Un auteur des calculs pourrait introduire des formules propres à Google pendant qu’un autre prépare le guide d’export Excel.

**Correction attendue dans la spine :** rattacher à AD-3 ou AD-8 la portabilité tabulaire Excel et les calculs script sans dépendance aux formules Google, avec renvoi à AC-19. Conserver l’exclusion de synchronisation Excel ; aucun export automatisé supplémentaire n’est demandé. L’observation porte sur une contrainte technique perdue, pas sur le détail commercial de la remise.

## 2. P2 — Dérivation Spec attendue : retirer la publication proposée

**État de la spine :** AD-8 supprime explicitement le booléen `publie` et conserve les commandes humaines Active et Inscriptions ouvertes, avec visibilité calculée (`Spine:100-104`). Le journal d’architecture `.memlog.md:68` confirme qu’il n’avait jamais été adopté.

**Écart dans l’entrée :** `contrat-donnees.md:19-21`, `48-55`, `110` et `131` continuent de porter `publie` ou une condition indépendante de publication. `regles-et-acceptation.md:7`, `10` et `14` peuvent également être lus comme un contrôle distinct. Deux développeurs suivant ces sources pourraient accepter des lignes différentes ou ajouter une seconde commande.

**Adoption attendue :** enlever ce champ et recaler projection, validation et réinscription sur les règles calculées d’AD-8. Préserver la différence fermé avec confirmé / fermé sans confirmé, les défauts inactive/fermée et l’indépendance de chaque date. Aucun manque de la spine sur ce point.

## 3. P2 — Dérivation Spec attendue : distinguer fermeture avant et après admission

**État de la spine :** AD-4 définit les derniers contrôles frais immédiatement avant écriture comme point d’admission ; une fermeture manuelle postérieure laisse finir cette demande avec ses conditions acceptées, les suivantes sont refusées. Le verrou ne bloque pas les éditions humaines (`Spine:76-80`). AD-11 réclame les deux cas de test (`Spine:118-122`).

**Écart dans l’entrée :** `SPEC.md:73`, `contrat-donnees.md:61` et `regles-et-acceptation.md:31` annoncent encore la protection des opérations en cours comme à définir. AC-13 (`regles-et-acceptation.md:55`), ET-05/ET-09 (`plan-essai-technique.md:55`, `59`) et la couverture d’inscription (`strategie-tests.md:24`) ne distinguent pas explicitement les deux côtés de l’admission.

**Adoption attendue :** reporter ce point de décision et les attentes de preuve : fermeture avant admission = refus sans nouvelle ligne ; fermeture après admission = cette demande peut terminer ; demande contrôlée ensuite = refus. Ne pas transformer cette précision en transaction sur les éditions humaines ou en délai de grâce après l’heure de début. L’architecture a bien conservé l’arbitrage humain ; la preuve reste à produire.

## 4. P3 — Dérivation Spec attendue : adopter les détails techniques déjà fixés

**État de la spine :** AD-3 fixe la génération des codes ; AD-8 retient une projection sans cache serveur initial, relecture visible au plus toutes les trente secondes et réparation minute candidate ; AD-9 fixe un projet écrivain par Sheet et la compatibilité entre code sauvegardé des triggers et version déployée (`Spine:74`, `104`, `110`). Les limites et conditions de mesure restent explicites (`Spine:195-199`).

**Écart dans l’entrée :** la construction/résolution des codes reste « à fixer » dans `contrat-donnees.md:9` ; `regles-et-acceptation.md:16` conserve la proposition de soixante secondes et un cache éventuel ; `strategie-tests.md:51` annonce encore versions/outillage à fixer au checkpoint. Ces formulations ne prouvent pas une contradiction fonctionnelle : trente secondes respecte la cible de moins de deux minutes et les versions restent un seed non installé. Elles laissent néanmoins plusieurs prescriptions techniques concurrentes.

**Adoption attendue :** synchroniser ces renvois et préciser la vérification des codes, de l’actualisation et du projet écrivain dans les scénarios existants. Conserver le caractère candidat/non éprouvé des cadences et des versions, sans prétendre que les mécanismes sont installés ni ajouter un scénario métier.

## 5. P3 — Dérivation Spec attendue : garder la maintenance minimale

**État de la spine :** AD-9 conserve versions et courte note pour rétablir un couple compatible sans restaurer le Sheet ; AD-11 porte les tests (`Spine:110`, `122`). Le journal d’architecture `.memlog.md:67` retire la procédure détaillée comme décision métier à soumettre et n’autorise aucune action réelle.

**Comparaison :** `plan-essai-technique.md:80` préserve déjà les inscriptions pendant un retour de code ; ET-12 (`plan-essai-technique.md:62`) ne nettoie que des données fictives. Ces deux points sont compatibles avec la spine. L’adoption devra simplement borner la note et les versions à cette maintenance minimale, sans réintroduire un outil, menu ou procédure détaillée côté Tema. La remise à zéro de TEST ne doit pas être interprétée comme une restauration des inscriptions métier. Ce point est un garde-fou d’adoption, pas un manque architectural.

## Couverture conservée

La séparation site portable / moteur Google / Sheet privé, les identités et instantanés, la capacité sous verrou, la reprise avant contrôles mutables, les états d’envoi distincts, le suivi Gmail manuel, les données privées, les ressources TEST séparées et la non-régression sont portés par AD-1 à AD-11. Les exigences de contenu et d’UX restent dans leurs compagnons référencés ; leur absence de répétition mot à mot dans la spine n’est pas un défaut.

Suite de cette seule réconciliation : corriger le point 1 dans la spine avant sa remise, puis confier les points 2 à 5 au writer Spec lors de l’adoption. Les vingt et un AC, les douze ET et leurs validations propres restent à conserver. Aucun résultat d’essai n’est établi par ce rapport.
