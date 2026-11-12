---
title: 'Essayer la lecture optimisée dans le site local'
type: 'feature'
created: '2026-11-02'
status: 'done'
route: 'oneshot'
---
<frozen-after-approval>
## Intent
GO Sofiane pour essayer l'expérience optimisée sur le site local Google TEST. Lien dédié ?lecture=disponibilites, lecture d'un seul onglet pour les cartes/calendriers, contrôle complet de la session et du tarif avant ouverture du formulaire. Parcours standard conservé via le lien sans paramètre, toutes les inscriptions soumises au contrôle serveur existant. Aucun envoi lors de la validation par l'agent.
</frozen-after-approval>

## Implementation Notes
Route TEST opt-in availability-preview, hors build Apps Script produit, version existante actualisée sans changer identité/accès. Le HEAD est conservé compatible pour la durée de la recette. GET standard/POST restent d'origine. La consultation merge les sessions de l'onglet avec les fiches publiques déjà livrées/en cache ; les nouvelles fiches ne sont pas découvertes par la lecture d'un seul onglet. Avant formulaire, lecture complète obligatoire si dernière réponse partielle, prix/politique/révision actuels et session éligible exigés. Vérifier fermeture, panne, clic multiple et navigation pendant ce contrôle. Cache navigateur alimenté seulement par les réponses complètes. Erreur si la route optimisée renvoie un catalogue ancien sans marqueur.

## Revue et vérification
Revue indépendante : correction d’une référence forceFull hors portée dans send, POST rétabli sur endpoint standard et test de soumission simulée ajouté. Les horloges du harness sont synchronisées avec le navigateur pour le délai antispam. 20 tests ciblés sur Chromium ordinateur/mobile, Firefox, WebKit réussis. 100 régressions du parcours standard réussies, build/sécurité et tests cache public réussis.
Google réel via lien optimisé : cartes197ms, disponibilités3519ms, précontrôle formulaire3882ms. Une requête GET availability-preview attestée sheet_reads1, puis une GET standard avant formulaire. Places1/3/12, zéro POST réel. Capture catalogue examinée à1500px, pièces temporaires hors Git.
Google TEST version11, même URL/propriétaire/accès, HEAD exact97dd49032437e96b3423f3ec465ae494bf3cd135dff63d86a3d70f3cb570df0c vérifié par copie UI après sauvegarde. Version8 conservée pour récupération. Version11 et HEAD laissés actifs pour recette Sofiane, aucune restauration automatique en fin de session. Le build Apps Script standard reste la base8 : utiliser le dispatcher/helper de l’expérience pour reproduire11, ne pas écraser ce HEAD pendant la recette. Aucun commit selon consigne du chat, acceptation humaine ouverte.
