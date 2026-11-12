---
title: Actualisation discrète et formulaire accessible pendant la vérification
created: '2026-11-03'
status: done
route: oneshot
---
<frozen-after-approval>
## Intent
GO explicite Sofiane après brainstorming : retirer le gros bloc d’actualisation normale, remplacer localement les places par « Vérification… », laisser fiches/calendrier/choix de date et saisie accessibles depuis le cache. Confirmation strictement bloquée jusqu’à lecture fraîche des disponibilités, tarifs et politique. Changement de conditions expliqué et relu explicitement ; saisies conservées en mémoire. Aucune soumission automatique. Cache public24h et lecture groupée inchangés. Aucun commit, Google, main ou publication.
</frozen-after-approval>
## Implementation Notes
app/web/app.js : séparation entre navigation depuis aperçu et éligibilité à la confirmation ; sélection provisoire validée à réception Google sans réinitialiser le formulaire. Consentement activé seulement après politique fraîche. Reprise locale sur panne. Réutiliser candidateChange/accept-change pour changement de conditions. app/web/styles.css : badge stable et discret, aucun saut dû au bandeau. Tests preview et nouveaux parcours navigateur : saisie pendant délai, aucun POST prématuré, conditions modifiées, complet/supprimé, panne/reprise, liens directs, focus et confidentialité. Admission serveur inchangée.

## Review Triage Log
- medium/patch : focus perdu en réessai formulaire ; validation et nouvelle erreur protégées par preserveFocus, destination confirmation/statut prévue si contrôle disparu, tests clavier.
- medium/patch : bouton de reprise imbriqué dans événements interactifs ; badge sans reprise dans ces parents, tests absence d’imbrication.
- false : footer-policy bloqué pendant aperçu non atteignable, lien masqué jusqu’à données fraîches ; condition néanmoins limitée à policy du formulaire.
- medium/patch (couverture) : scénario positif après tarif/politique modifiés ajouté, vérifie révision courante, politique, consentement, coordonnées conservées et un POST simulé.
- medium/patch (couverture) : parcours formulaire→catalogue→retour historique et panne répétée ajoutés, saisie/contexte vérifiés.

## Validation finale
110Node,21administration,2VM,7bundle portables réussis,2ICS privés ignorés ; build/sécurité/diff/BMAD valides. Matrice256parcours :254PASS et2assertions trop larges de tests corrigées (éléments masqués).72parcours ciblés et4retours historiques rejoués PASS, aucun échec produit restant. Preuve Google réelle sans POST ni envoi, captures examinées. Recette humaine ouverte. Aucun commit/push selon instruction humaine prioritaire.
