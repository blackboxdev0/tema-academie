# Extension des courriels de test dans la copie — 9 novembre2026

Sofiane autorise une extension du budget de test, uniquement vers les boîtes déjà autorisées, et la reprise des deux courriels d’une inscription précisément identifiée. Enveloppe annoncée dans le chat :10inscriptions supplémentaires,20courriels maximum, reprise incluse. Aucun reset de compteur, nouvel inscrit, destinataire ajouté, changement ancien TEST/PROD ou déploiement.

## Exécution Google vérifiée

Contrôle propriétaire dans le seul projet COPY. Avant : limites3inscriptions/6destinataires, réservations3/6. Les deux canaux de l’inscription sont BLOCKED/COPY_LIMIT, sans attempt_id, attempt_at ou sent_at ni réservation de budget. Inscription confirmée, entreprise/courriel/cohorte identifiés, révision de session et liste autorisée vérifiées avant toute écriture.

Sous ScriptLock : limites portées à13/26, budget antérieur conservé, seuls les deux canaux explicitement bloqués remis PENDING. Appel du notify existant sur cette seule inscription, sans nouvelle admission. Les canaux SENT/SENDING/UNKNOWN/FAILED ne sont pas réarmés par ce helper. Aucun endpoint de renvoi public ajouté.

Google a confirmé : participant SENT à09:42:39 Montréal, avis Tema SENT à09:42:44. Budget final4inscriptions/8destinataires, donc9inscriptions supplémentaires et18courriels disponibles. ALLOWED_RECIPIENTS_JSON strictement identique avant/après. Ces états attestent l’acceptation de l’envoi, pas la réception dans la boîte externe du participant.

Exports natifs avant/après : nombre d’inscriptions identique, seules10colonnes mail de la ligne ciblée changées. Statut/réservation et toutes les autres inscriptions conservés. Valeurs et types de Formations, Disponibilités, Paramètres, Accueil et Nouvelle formation identiques. Aucune autre inscription ni session créée, aucune mutation de capacité.

Helper Google temporaire retiré après succès ; Code.gs, SaisieNative.gs, manifeste, scopes, déclencheurs et version web inchangés. Preuves et code privés dans ~/.config/tema-academie/mail-diagnostic-20261109/ ; aucun export ni donnée nominative dans le dépôt. Contrôles réels Google, aucun test simulé présenté comme preuve d’envoi. TEM-27 reste In Progress ; aucun commit/push.
