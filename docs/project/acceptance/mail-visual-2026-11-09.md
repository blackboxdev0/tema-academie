# Courriels Tema : préparation visuelle locale du 9 novembre2026

**Suite acceptée et réalisée :** Sofiane valide le visuel puis donne le GO d’intégration et de test. COPY version6 active ; [preuves Google/Gmail et récupération](mail-visual-deployment-2026-11-09.md). Les limites «non activé» du rapport ci-dessous décrivent la préparation initiale.

Sur demande de Sofiane, les confirmations participant et avis Tema sont préparés avec un HTML sobre reprenant la palette du site : rose#FF008F, action#C6006F, anthracite#20212B et fond clair#F8F7F5. En-tête textuel Tema, récapitulatif formation, contact et version texte complète. Aucun chargement d’image ou police externe nécessaire.

Les longs tirets éditoriaux sont retirés des objets et textes visibles. Les horaires deviennent «15janvier2027, de9h à12h (heure de Montréal)», avec minutes utiles, date française et gestion d’un passage de minuit. La conversion existante America/Toronto est conservée. Les identifiants techniques, adresses et liens restent exacts, les sources ne sont pas réécrites et les octets du calendrier joint restent identiques.

Le participant reçoit uniquement sa confirmation et ses informations de connexion. L’avis Tema garde les coordonnées participant, l’état traduit de la confirmation, la référence et le suivi privé. Les états Envoyée/Échec/Incertain ne sont pas transformés en affirmation de réception. Contenus dynamiques échappés, liens à protocoles sûrs et en-têtes sans CRLF. Les transports TEST/COPY transmettent désormais HTML et repli texte, sans changer les budgets ni les règles d’envoi.

## Vérification

177tests locaux standard+COPY et198expérimentaux réussis ;47tests COPY communs aux deux commandes, aucun total additionné.13tests dédiés couvrent dates hiver/été/minutes/minuit, texte et HTML, caractères injectés, confidentialité, URL Unicode exactes, contacts, transport des deux corps/ICS et empreinte calendrier de référence antérieure. Build, syntaxe/sécurité et diff sans erreur. Revue courte indépendante :5constats corrigés, triage détaillé dans la spec.

Aperçus fictifs générés depuis le vrai makeMail : confirmation avec lien à venir, lien disponible, présentiel et avis Tema avec lien privé fictif. Chromium ordinateur et390px contrôlés, sans débordement dans les vues inspectées. Source du générateur : app/scripts/preview-mail.cjs. Aperçus locaux hors dépôt dans ~/.codex/visualizations/2026/11/02/01a19d92-4413-7461-a87f-f9d6228ee199/courriels-tema/. Aucun contenu nominatif réel dans les aperçus.

## Cible et limites

Préparation locale seulement. Aucun code appliqué dans Google, aucune publication ou nouvelle version, aucun message envoyé, aucune inscription ni budget modifié. L’API COPY v5 active utilise encore l’ancien modèle. Rendu Gmail/Outlook/réception externe et acceptation visuelle Sofiane restent ouverts. Le wrapper Outlook prépare une compatibilité, sans la déclarer recettée. Aucun commit/push, autres changements de l’arbre préservés. TEM-27 reste In Progress.
