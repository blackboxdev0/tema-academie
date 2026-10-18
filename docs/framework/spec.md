# Socle V1 — périmètre accepté

## Intention

Permettre à un utilisateur de prendre ce dépôt, décrire son projet, indiquer Linear et GitHub, puis retrouver un fonctionnement conversationnel fondé sur BMAD : cadrage, choix, stories, réalisation, revue, vérification, recette et livraison autorisée. Le contexte du produit s'enrichit entre fonctionnalités et sessions.

La réalisation de ce périmètre a été autorisée par l'utilisateur le 17 octobre 2026. Le candidat initial conservait une interdiction de commit issue d'un checkout historique ; la correction des permissions suit la [décision courante](decisions.md). Aucun changement d'un workspace non désigné ou déploiement n'a été demandé.

## Critères d'acceptation

1. Le nouveau dépôt contient des skills BMAD officiels exécutables, accessibles depuis un clone à Codex et Claude Code ; le parcours de stories et de revue est conservé. La clarification du 17 octobre impose la stable actuelle à l'initialisation et l'apprentissage du catalogue installé, selon [la décision en vigueur](decisions.md).
2. Aucun nouveau skill BKBX n'est requis ; une demande naturelle est guidée par les instructions communes vers le vrai skill approprié.
3. Les règles communes n'imposent aucun langage, plateforme, hébergeur, architecture ou nombre de dépôts au produit.
4. La configuration et le contexte sont portables, sans chemin personnel ni dépendance à la mémoire d'un assistant.
5. L'initialisation à partir du besoin et des liens crée le profil, le contexte et la configuration BMAD ; une relance conserve les connaissances et les changements humains. Les destinations différentes et collisions sont signalées avant écriture.
6. Les fichiers du profil sont des données ; aucune commande du produit, mutation Git, autorisation ou publication n'est exécutée par l'initialisation locale.
7. Les décisions, artefacts et informations pertinentes sont conservés et reliés de feature en feature, puis lus lorsque nécessaires par l'assistant courant ou un autre fournisseur ; aucune conversation brute n'est exportée. Le handoff permet une reprise sans mémoire personnelle et distingue constat actuel, preuves et limites. Les décisions remplacées restent accessibles.
8. Le workflow Linear préserve préparation validée, GO, réalisation effective, revue/tests terminés, recette et livraison vérifiée. Une tâche technique se clôture seulement après acceptation, vérification et intégration de tout son livrable à la cible convenue ; le projet et les tâches de recette/livraison gardent leurs critères propres. Les états BMAD ne sont pas copiés aveuglément.
9. L'initialisation prévoit la vérification des accès, de l'équipe et du workspace, des statuts et des liens ; les seules créations manquantes sont proposées puis appliquées au périmètre autorisé. La configuration Linear ne réinitialise aucun workflow existant.
10. Les lectures et résultats partiels, erreurs GraphQL, réponses incertaines, mutations non persistées et modifications humaines concurrentes ne produisent pas de fausse confirmation ni de nouvelle tentative aveugle.
11. Les statuts sont relus après écriture ; le mapping n'est enregistré qu'après vérification complète. Les vues et intégrations non vérifiées restent identifiées comme telles.
12. Les secrets restent dans l'environnement et ne sont pas exposés dans les arguments ou les erreurs. Le helper utilise l'endpoint officiel.
13. Les commits de progression, push sur branches de travail et PR en brouillon suivent le périmètre autorisé sans nouvelle demande, sauf restriction humaine explicite plus récente. Fusion principale, déploiement et publication conservent leurs GO. L'agent poursuit de façon autonome le périmètre de développement accepté et vérifie les checkpoints Git/BMAD/Linear.
14. Les tests et la revue portent sur les comportements observables : clone sans config personnelle, reprise, préservation du contexte, isolation et erreurs de synchronisation. Les preuves locales et les validations externes restent distinctes.
15. L'analyse des capacités BMAD est liée à la version et à l'inventaire exact ; toute dérive impose une nouvelle inspection. Les routes et artefacts restent proportionnés, avec les GO, tests, revue et règles Linear convenus. Une question sur la méthode reçoit l'explication des capacités actuelles sans développement fictif.

## Vérification prévue

- Contrôle d'intégrité des fichiers BMAD distribués et des références de la documentation.
- Tests de l'initialisation et de sa répétition depuis des copies temporaires, sans configuration personnelle ni mutation Git.
- Scénarios de configuration Linear sur un serveur HTTP isolé : lecture seule, création additive, relecture, reprise, erreurs, conflits et conservation des modifications humaines.
- Vérification du contrat de mutation contre le SDK officiel Linear.
- Revue des scripts, de la méthode et des possibilités de reprise. Pilotes d'initialisation pour une application web, un service sans interface et un projet existant à plusieurs dépôts.
- Essai d'activation réelle des skills par un agent dans une nouvelle conversation et configuration d'un workspace Linear de test : à distinguer des contrôles locaux tant que non réalisés.

## Hors périmètre

Développement d'un produit, import d'un ancien backlog, export de conversations, création de nouveaux comptes externes, surveillance permanente, déploiement et publication du dépôt. Les droits et destinations réels sont nécessaires à l'essai externe ; aucun workspace de production n'est utilisé comme fixture.
