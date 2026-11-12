---
title: Écran de suivi immédiat et nettoyage des tirets éditoriaux
created: '2026-11-12'
status: in-progress
route: oneshot
---
<frozen-after-approval>
## Intent
GO Sofiane pendant la recette accompagnée : après validation du formulaire, ouvrir immédiatement un écran de suivi avec récapitulatif et enregistrement en cours. Réserver la confirmation au reçu durable ; préserver les coordonnées, le rejeu identique et les erreurs. Retirer les tirets cadratins des textes visibles rédigés pour le produit, sans casser les liens du classeur ni réécrire les données humaines. Le rose d’origine et toutes les couleurs restent inchangés sans nouvel accord. Site local et classeur de démo actuel, Vercel à la toute fin. L’ouverture des envois à toute adresse demeure un travail autorisé distinct, pas encore activé.
</frozen-after-approval>
## Implementation Notes
Première tranche réversible locale : vue processing dédiée dans app/web/index.html et app.js ; garde sending/pending, historique, échéance45s, reprise UUID conservées. Les refus durables reviennent au formulaire avec saisie conservée. Textes éditoriaux web nettoyés ; inventaire indépendant des mails/administration pour traiter séparateurs et migration sans casser le contrat. Tests ciblés attente/succès/refus/inconnu/reprise et audits clavier nécessaires, matrice complète ensuite. Les contrastes du rose initial sont un choix explicite conservé : ne pas prétendre que ces règles axe sont vertes.

Décision complémentaire Sofiane : phrases naturelles et lignes séparées, sans points médians de remplacement. Appliqué aux cartes, récapitulatifs, horaires et messages éditoriaux du site ; données humaines et séparateurs de références Sheets conservés. Le12novembre, GO explicite d’activation Google : admissions ouvertes aux adresses saisies, identité courriel Tema Académie sans COPY/TEST. admissions_mode=demo dans copy-config.gs ; restricted rétablit l’allowlist participant, valeur inconnue échoue fermée. Canal Tema toujours limité, budgets persistants et quota/replay inchangés. Trois régressions de mode ajoutées. Activation native Google version10, code relu exact et manifeste conservé, même endpoint ; GET33formations/12sessions réussi. Aucun nouveau courriel ou inscription créé par l’agent ; prochain essai réel effectué avec Sofiane.

## Review Triage Log
- medium/patch : couverture des refus après écran insuffisante ; FULL/INVALID/SESSION_CHANGED/POLICY_CHANGED paramétrés avec saisie/focus/reconfirmation.
- medium/patch : reprise pouvait atteindre résultat sans preuve d’écran intermédiaire ; réponse de rejeu retenue, focus et commande identique vérifiés avant libération.
- medium/patch : nouvel écran absent d’axe/reflow ; état processing ajouté, test dédié pendant réponse retenue et viewport320.
- medium/patch : historique partiellement vérifié ; hash canonique, saisie conservée et focus de résolution ajoutés. Régressions inconnus/refus existantes complétées.
- Relecture complémentaire sans défaut concret restant ; mode démo également relu, aucune nouvelle écriture source ni envoi historique automatique.
- Harness d’attente : avancer l’horloge serveur de fixture avant admission ; ne pas interpréter un INVALID artificiel lié à now figé comme une régression produit.

Validation locale complète :132tests standard/241COPY,9artefacts,21audit+2VM ;316browserexécutés,308PASS et8contrastes connus. La recette Google a révélé un traitementPOST66,963s et un mail participantPENDING ; l’écran rend honnêtement le dépassement de45s et le replay récupère la réservation. L’acceptation réelle est bloquée sur la correction serveur, autorisée et suivie par spec-inscription-arriere-plan-demo.md. Ne pas marquer cette recette globale Done sur la seule matrice simulée.
