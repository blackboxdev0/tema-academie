# Annulation depuis le suivi, copie privée

## Périmètre

GO Sofiane du 9 novembre : annuler depuis le dropdown Statut du Suivi des inscriptions, après confirmation nommant personne, formation et date. Retirer Recherche libre et simplifier les mentions d’envoi en Envoyé. Copie privée uniquement ; aucun commit/push, ancien TEST, PROD ou site public.

## Comportement

L’action résout l’inscription par identifiant stable, vérifie le contexte affiché et relit la source après confirmation sous verrou partagé avec les admissions. Le statut source passe à annulee ; les places sont recalculées depuis les inscriptions confirmées. Aucun courriel d’annulation. Refus/fermeture/échec avant écriture conservent la réservation ; une reprise ne libère pas deux places. Une erreur après écriture distingue annulation enregistrée et actualisation à reprendre. Le menu Actualiser le suivi et la réconciliation réparent les compteurs natifs avant acquittement.

Quatre filtres restent visibles. Les inscriptions source restent masquées. Les cellules Statut confirmées sont éditables sans double avertissement ; les autres modifications du tableau sont rejetées et le rendu est restauré.

## Vérification

- 132 tests standard et 228 expérimentaux réussis ; sécurité et diff check réussis.
- Revue indépendante en trois lectures, corrections intégrées et relues. Une course préexistante entre annulation et notification initiale Tema est différée dans deferred-work.md ; ce contrôleur n’envoie aucun message.
- Sauvegarde privée du code, manifeste et export des sources avant intervention.
- Sonde native simple onEdit dans Safari multi-compte : dialogue YES_NO puis reprise effective du refus ; sonde retirée et marges nettoyées.
- Recette réelle du dropdown dans Sheets/IAB : formation et participant explicitement fictifs, session fermée dès sa création, capacité 1, mails SUPPRESSED. Choix Annulée puis No : source confirmee, vue Confirmée, places 0. Nouvelle demande puis Yes : source annulee, vue Annulée, places 1 ; compteurs 0 confirmée / 1 annulée.
- Comparaison indépendante des exports : toutes les lignes métier préexistantes identiques en valeurs/types ; une formation, une session et une inscription fictives ajoutées. Paramètres et budgets non modifiés. Source Inscriptions toujours masquée. Recherche libre absente.
- Le rangement avec réinstallation complète de la mise en page a dépassé le budget de rendu de 26 secondes : les compteurs ont été retirés, sans retour arrière de l’annulation. Correction : budget simple onEdit conservé, budget 240s pour installation, menu propriétaire et réconciliation ; trois tests supplémentaires de reprise lente réussis. Reprise réelle réussie, puis menu manuel final terminé en 31 secondes avec contexte vérifié ; aucune relance de réservation ou de mail.
- Les hashes des quatre propriétés budget/limites/rate/allowlist restent identiques après annulation. Aucun envoi ni consommation de budget.

Preuves détaillées privées : ~/.config/tema-academie/registration-cancellation-20261109/ ; aucune donnée personnelle ni sauvegarde versionnée.

## Finalisation

Fixture rangée : formation dépubliée, session fermée, inscription fictive annulée conservée, place toujours 1 après recalculs répétés. Filtres originaux restaurés. Le suivi complet affiche un contexte vérifié, neuf participants, six confirmés et trois annulés ; Recherche libre absente et Envoyé sans suffixe.

COPY version 8 activée au même /exec, exécution propriétaire et accès inchangés. Code natif relu identique au candidat (SHA-256 canonique b21b5344e5c8f84362db654583e3caac8cdc640255223fbbd8c6bff9f44f8007), helper temporaire absent et manifeste relu identique. Version 7 conservée pour récupération ; restaurer le code/manifeste sauvegardés et sélectionner cette version sans restaurer les données ni réinitialiser les budgets. Profil local COPY maintenu. GET réel : 30 formations, 9 sessions, aucune propriété inscriptions privée, fixture absente.

Budget inchangé : 7 réservations / 13 destinataires consommés sur 13/26. Aucun nouvel email. Aucun Git. La recette humaine complète TEM-27 reste ouverte.
