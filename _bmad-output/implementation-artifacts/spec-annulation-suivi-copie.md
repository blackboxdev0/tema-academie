---
title: 'Annuler une inscription directement dans le suivi de la copie'
type: 'feature'
created: '2026-11-09'
status: 'done'
route: 'dispatch'
baseline_commit: 'e95c5025409d4395956db366ddf960418785c26f'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="Sofiane approuve le statut modifiable dans le suivi avec confirmation, vraie annulation et place libérée ; retouches antérieures recherche/libellé également autorisées">

## Intent

Dans Suivi des inscriptions de la seule copie privée, permettre d’annuler une inscription confirmée par dropdown Statut sans afficher Inscriptions. Le choix Annulée présente une confirmation nommant personne, courriel, formation et date ; source et place ne changent qu’après accord explicite. Rejet, fermeture ou échec avant écriture conservent la réservation. Afficher le résultat réel ; garder ligne/ID et historique. Une annulation déjà appliquée ne libère pas deux places. Réactivation d’une inscription annulée hors périmètre : nouvelle réservation par le site.

Retirer la recherche libre de la vue et ignorer son ancien contenu. Garder quatre filtres natifs. Remplacer Envoyé (réception non garantie) par Envoyé dans les confirmations de la vue, et simplifier le même libellé de l’avis courriel Tema ; retirer la phrase de réception du bandeau de suivi. Ne changer ni les états réels ni les erreurs/incertitudes.

## Boundaries & Constraints

Copie seulement :10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8, projet1fuzTMzZZ4F-0Bn5SIqRuYAmM1ef6rXNNp_s4q9sgyd3wSe1-8H3tpMnA. Aucun commit/push, autre classeur, inscription client de test, envoi ou consommation de budget mail. Autres données et travaux sales préservés. Identité par ID stable, jamais nom ou numéro de ligne seul. Ne jamais garder un verrou pendant une confirmation UI : Google suspend le script et ne conserve pas les verrous. Revalider après réponse sous verrou commun aux admissions. La vue est dérivée et peut être reconstruite : ne pas écrire depuis une ligne périmée, déplacée, filtrée ou une saisie multiple. Propriétaire/ordinateur/une personne à la fois, comme l’administration actuelle. Maintenir la source masquée et son historique.

## I/O & Edge-Case Matrix

| Cas | Résultat |
|---|---|
| Confirmée choisie Annulée puis Oui | Une seule transition source vers annulee, place recalculée depuis inscriptions confirmées, vue à jour |
| Non, fermeture de confirmation | Source inchangée, statut visible restauré depuis source |
| Nouvelle demande identique / source déjà annulée | Aucun effet supplémentaire ni réactivation |
| Filtre/rendu/identité changé pendant dialogue | Demande périmée refusée, aucune autre personne modifiée |
| ID absent/dupliqué, statut inconnu, collage/plage multiple | Aucune écriture métier, retour lisible vers l’état source |
| Verrou occupé, erreur avant commit | Aucune annulation annoncée ; réessai possible, vue honnête |
| Commit confirmé puis échec de rafraîchissement | Annulation annoncée enregistrée, actualisation à reprendre ; jamais faux retour à Confirmée |
| Source conservée et compteur recalculé plusieurs fois | Places stables, autres lignes, capacités et mail_states inchangés |
| Recherche F10 anciennement remplie | Aucun filtrage libre et contrôle absent après migration |

</frozen-after-approval>

## Code Map

- app/experiments/admin-sheet-registrations.gs : project/readSources, render/rows, protection warningOnly, selection B10:F10, edited branch depuis onEdit. Vue existante B:F, statut E ; source29colonnes identifiées par en-têtes. Créer metadata privée de projection et génération ; préserver les invariants de refresh (UserLock puis ScriptLock dans acknowledge, relectures et compteurs retirés pendant pending).
- app/experiments/admin-sheet-prototype.gs : onEdit appelle d’abord TemaRegistrationView.edited. plan/sync recalculent places et peuvent réorganiser lignes, statuts canoniques confirmee/annulee. Garde actuelle seule copie. Ne pas recetter sur une inscription humaine.
- app/experiments/copy-backend.gs : guard/isOwner, lock ScriptLock, dirty, counters/reconcile et assertAdministrativeLayout. Les admissions et écritures sont sérialisées par ScriptLock ; dirty peut tenter UserLock. Source Inscriptions non typée, read by header. Pas d’API publique de gestion.
- Nouveau app/experiments/admin-registration-actions.gs : contrôleur d’édition/confirmation, identification stable, CAS et garde, sans mail. Si un déclencheur installé est indispensable, même propriétaire et scopes existants, unique handler ; expliquer techniquement pourquoi et éviter double exécution simple/installé. Préférer le hook bound onEdit si confirmation native fonctionne réellement.
- app/apps-script/engine.js : makeMail mailStates.SENT contient Envoyée (réception non garantie), rendu HTML/logo activé par dépendance COPY. Remplacement cosmétique seulement.
- app/experiments/build-copy-backend.cjs : concaténation privée Code.gs, inclure le nouveau module sans changer images/formulaires/logo ; builder natif après sauvegarde actuelle avant installation Google par parent.
- app/experiments/admin-sheet-registrations.test.cjs, copy-helpers.cjs, copy-backend.test.cjs et nouveaux tests actions : vrais modules avec services Google simulés ; couverture source/view/locks/UI requise. Tests pure projection recherche peuvent rester pour rétrocompatibilité interne, UI quatre filtres avec sélection cinquième vide.

## Tasks & Acceptance

- [x] Implémenter actions d’annulation dans le suivi et tests de la matrice, sans envoi ; résolution après dialogue par ID/CAS sous verrou, metadata/génération refusant un rendu périmé. Modifier le minimum de modules existants et ajouter le contrôleur dédié si utile.
- [x] Supprimer contrôle Recherche libre, ignorer/effacer ancienne saisie et libellés de réception ; quatre filtres conservés. Tests du rendu et migration.
- [x] Builder complet et adaptations de fakes, tests pertinents et revue intégrée ; ne pas affaiblir les tests des sources/budgets/locks précédents.
- [x] Parent : backup Google code/manifeste et sources, installation COPY puis confirmation native réelle dans Safari/Sheets. Fixture privée sans mail avec session fictive dédiée fermée dès sa création et une seule inscription fictive confirmée, suffisamment complète pour passer le moteur ; ne pas appeler submit. Tester Non puis Oui via vrai dropdown, restitution exactement une place, aucune ligne supprimée. Laisser la fixture fermée/formation dépubliée et inscription annulée ensuite. Vérifier source avant/après, budget/propriétés, GET public, recherche absente et Envoyé sans suffixe. Code temporaire retiré, récupération sans reset, capture et notes.

Critères : étant une inscription confirmée, quand l’utilisateur annule puis confirme depuis le suivi, alors la source passe à annulee et le compteur disponible augmente une seule fois ; quand il refuse, quand contexte périme ou en cas d’erreur avant commit, alors aucune inscription n’est modifiée. Quand le suivi est actualisé, les quatre filtres et libellés simples restent en place. Aucune réservation réelle ni courriel touché par la recette.

## Implementation Notes

GO de développement/intégration COPY déjà reçu dans la demande ; pas de question de routine. Le parent réalise les interactions Google/Safari, la préparation de fixture et les preuves. L’agent de code n’opère pas Google/Git, ne réécrit pas d’artefacts indépendants ; les dépendances/choix fins cohérents se décident dans ce périmètre. Si le dialogue native onEdit est refusé par Google, remonter la preuve et une variante simple dans le même suivi avant tout élargissement. Sources réelles / cas limites et tests unitaires ne remplacent pas la recette native.

Preuve parent préalable : simple onEdit natif, Safari propriétaire multi-compte, getUi.alert YES_NO sur cellule temporaire H1, réponse Non effectivement reprise (SONDE_NON). Sonde retirée et HEAD v7 restauré ; aucune inscription/source/mail touché.


## Review Triage Log

| Origine | Constat | Verdict et disposition |
|---|---|---|
| Blind1 | Compteur avancé Sheets depuis simple onEdit non autorisé | medium, patch : recalcul natif sous ScriptLock et test du chemin simple. Annulation durable distincte du rendu. |
| Blind2 | Menu de rafraîchissement n’assure pas la réparation du compteur avant acquittement | medium, patch : réparation native avant refresh/ack ; test récupération après échec compteur seul. |
| Blind3 | Avis initial Tema peut encore annoncer confirmée si annulation pendant envoi | medium, defer : comportement préexistant sendChannel, déjà possible par modification manuelle source ; le contrôleur n’appelle aucun mail. Test engine de suppression/annulation antérieur conserve l’avis Tema initial. Hors nouvelle action de gestion ; ne pas modifier la politique des envois ici. |
| Blind4 | Promesse de place libérée en historique ou dépassement | medium, patch : annulation et recalcul annoncés, disponibilité dérivée sans promesse inexacte ; cas couverts. |
| Blind5 | Notes et règles par participant ajoutent trop d’appels | medium, patch : matrices groupées, validation en bloc et metadata de projection cachée. |
| Blind6 | Hash global refuse une cible intacte si une autre inscription ou un mail change | medium, patch : empreinte cible pertinente, ID unique et statut, conservation génération/filtre ; tests changements indépendants autorisés. |
| Edge1 | Réduction de dépassement ne rend pas forcément une place disponible | medium, patch, même racine que Blind4, formulation et tests adaptés. |
| Verification1 | Pas de test onEdit→vue→contrôleur | medium, patch : parcours complet dans services simulés, mutation du branchement doit rendre le test rouge. |
| Verification2 | Pas de test réparation compteur après refresh réussi | medium, patch : vrais modules COPY, seul échec compteur initial injecté puis réconciliation réparatrice vérifiée. |
| Parent1 | JSON technique visible en survol de Statut | medium, patch : metadata dans colonne de projection cachée, note de cellule conviviale ; pas de donnée métier dupliquée comme source. |
| Parent2 | Confirmation de protection Google en plus du vrai Oui/Non | low, patch : colonne Statut dans plages de saisie sans retirer les autres avertissements. |
| Parent3 | Date ISO UTC dans confirmation | low, patch : affichage date/heure de Montréal lisible. |

Corrections cohérentes avec l’intention déjà approuvée, aucune nouvelle permission ni effet externe supplémentaire. Revue dispatch : trois couches lancées avant traitement des résultats. Les patches sont confiés au même agent, tests complets et preuve native au parent.

| Recette native | Vue étendue dépasse le budget court 26s pendant rangement | medium, patch : budget court conservé pour simple onEdit, budget 240s pour installation/menu propriétaire/réconciliation ; trois tests de rendu simulé lent réussis. |

## Résultat

132 tests standard, 228 expérimentaux, sécurité/diff réussis. Recette native refus puis confirmation, compteur 0 → 1, source et budget vérifiés. COPY v8 activée ; helper retiré, manifeste identique, fixture rangée, GET 30/9. Menu final et vue complète vérifiés ; aucune inscription préexistante modifiée, aucun envoi. Rapport : docs/project/acceptance/registration-cancellation-2026-11-09.md. Aucun commit/push ; TEM-27 reste In Progress. Une course préexistante de notification initiale reste différée.
