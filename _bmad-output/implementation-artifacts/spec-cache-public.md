---
title: Cache public actualisé depuis Google
created: '2026-11-03'
status: done
route: oneshot
---
<frozen-after-approval>
## Intent
GO Sofiane pour cache public local 24h, affichage immédiat aux visites suivantes et remplacement par réponse Google systématique ; dates passées masquées, inscription/places confirmées seulement après réponse fraîche, aucune donnée de formulaire conservée. Première visite ou cache inutilisable : chargement habituel. Pas de commit ni modification Google.
</frozen-after-approval>
## Implementation Notes
Projection explicite dans app.js, clé versionnée par URL API, stockage facultatif. Cache sans politique ni coordonnées ; contacts restent chargés depuis Google. Rendu et routage existants, état previewOnly jusqu’à réponse validée. Tests navigateur et sécurité adaptés.

## Review Triage Log
- medium/patch : rendu cache structurellement invalide pouvait bloquer refresh ; démarrage protégé et test end_at invalide.
- medium/patch : test de bouton avant sélection erroné ; sélection explicite de date ajoutée.
- medium/patch : message de fiche après cache puis succès puis panne conservait mauvais texte ; texte normal rétabli.
- medium/patch : contrôle vie privée excluait namespace entier ; contenu du stockage vérifié après soumission fictive.
- medium/patch : reprise avec cache et suppression absente des tests ; scénario panne→réessai→offre supprimée ajouté.
- medium/patch : route directe inscription avec cache non couverte ; accès direct testé avant réponse Google, formulaire caché.

Validation :32tests cache sur quatre profils,96régressions standard,2contrôles de confidentialité après soumission,110Node,21administration,2VM,7bundle portables réussis ;2ICS privés ignorés. Preuve Google réelle1831ms puis38ms/1345ms,0POST.
