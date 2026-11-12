# Neuf correctifs approuvés, choix UX différés

Sofiane valide oralement le 30 octobre 2026 les neuf correctifs du contre-audit et demande leur implémentation groupée, avec mise à jour BMAD et Linear. Il précise ensuite de réaliser uniquement ces neuf correctifs et de préparer un rapport visuel des propositions UX/UI, pour arbitrage ultérieur pendant sa recette.

Le périmètre approuvé est R1, R3, R4, R5, R6, R7, R8, R9 et R11 du [rapport indépendant](../acceptance/independent-audit-2026-10-30.md) : notes humaines, listes de formations vides, places calculées invalides, diagnostics logiciels, résultat conservé dans l’historique, focus visible, titre reconfirmé, délai anti-spam de reconfirmation et collisions de libellés.

Les trois propositions facultatives (densité du formulaire mobile, accès à la prochaine date, texte de confirmation du courriel) restent non approuvées et ne sont pas implémentées. Le rapport visuel doit illustrer l’existant et les propositions, sans les confondre avec un comportement livré. R2 et les deux autres durcissements rejetés par le triage restent hors lot.

Les tests de non-régression et la revue portent sur le code corrigé. Les résultats historiques, simulations, navigateurs automatisés, Safari installé et import Calendrier Apple gardent leurs preuves distinctes. Aucune garantie d’absence de défaut ne remplace la recette. Les budgets Google TEST et les deux inscriptions avec envoi réservées à Sofiane sont conservés.

Cette décision autorise le développement de ce lot. Elle ne donne aucun nouveau GO de fusion/main, déploiement, publication ou production. Les autorisations de commits/push de branche déjà en vigueur restent applicables.

## GO Google TEST complémentaire

Sofiane demande ensuite explicitement d’appliquer les correctifs à Google TEST et de refaire les tests avant sa recette. Le candidat autorisé est le code096772d (bundle b0737bb59743af0216eb62a83a1143ec10570872c0e8c636343a7334df61f447), avec mise à jour de la version TEST existante, garde TEST et accès inchangés. Les essais ciblés doivent conserver l’historique, les budgets et les deux envois réservés à Sofiane. Cela n’autorise ni Métier/PROD, ni main, Vercel ou FTP.
