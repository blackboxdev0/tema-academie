---
title: 'Des courriels Tema lisibles, visuels et sans tirets cadratins'
type: 'feature'
created: '2026-11-09'
status: 'done'
route: 'oneshot'
baseline_commit: 'e95c5025409d4395956db366ddf960418785c26f'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Demande Sofiane : retirer les tirets cadratins des courriels, reprendre le visuel Tema et humaniser les horaires">

## Intent

Préparer localement les confirmations participant et avis Tema avec HTML sobre aux couleurs existantes (anthracite, blanc et rose), texte alternatif complet, dates françaises et horaires tels que « 15 janvier 2027, de 9 h à 12 h (heure de Montréal) ». Retirer les longs tirets des objets et textes visibles sans changer les sources. Garder le calendrier joint, la confidentialité des destinataires, les budgets et les garanties anti-doublon. Fournir un aperçu réel généré par le même moteur avec données fictives. Aucun envoi, changement Google, publication ou commit/push pendant cette préparation.

</frozen-after-approval>

## Implementation Notes

Changement autonome local, sans effet externe ni migration. Réutiliser makeMail dans app/apps-script/engine.js, adaptation MailApp dans google.js et experiments/copy-backend.gs ; ajouter htmlBody sans supprimer body. Aucun changement makeIcs/admission/reprise/budgets. Échapper tout contenu dynamique en HTML et ne produire de liens qu’avec protocoles sûrs. Reprendre les dates locales America/Toronto via deps.formatLocal existant, avec cas hiver/été, minutes et changement de jour. Tests ciblés du rendu et transport, aperçu fictif ordinateur/mobile ; intégration Google/rendu Gmail/Outlook restent distincts et non effectués ici. Arbre sale connu préservé, route oneshot, GO de retouche locale reçu ; aucun commit sans demande.


Réalisation : makeMail produit HTML à tables/CSS en ligne, en-tête textuel Tema et palette existante, contact, récapitulatif, avis privé distinct et repli texte. Horaires français depuis la conversion Montréal existante, heures sans minutes nulles et dates distinctes pour passage de minuit. Les adresses et URL restent des identifiants exacts ; seuls les séparateurs éditoriaux sont normalisés. Adaptateurs TEST et COPY transmettent htmlBody en conservant body/ICS. Données source, calendrier, admission, compteurs et Google inchangés. Quatre aperçus fictifs générés par app/scripts/preview-mail.cjs.

Validation :177tests standard+COPY,198tests expérimentaux, build et sécurité hors ligne réussis. Ces nombres se recouvrent de47tests COPY et ne sont pas additionnés. Aperçus Chromium ordinateur et390px, absence de débordement, variantes présentiel/lien disponible/avis privé contrôlées. Gmail/Outlook et intégration Google non effectués ; aucun envoi/commit/push. Le wrapper MSO prépare la largeur Outlook mais ne prouve pas son rendu réel. Ancien arbre sale préservé.

## Review Triage Log

Route oneshot : seule couche Blind Hunter indépendante exécutée, autres couches de dispatch non requises. Cinq constats reçus, vérifiés et traités :

| Constat | Verdict | Preuve / résolution |
|---|---|---|
| Nettoyage altérant un courriel contenant un tiret long | medium, patch | Chemin reachable dans le validateur existant. clean préserve désormais les adresses ; test dédié des deux formats et mailto. |
| Test calendrier comparant deux appels au même générateur | medium, patch | Empreinte SHA256 indépendante calculée depuis HEAD antérieur, fixture accents/pliage/CRLF ; calendrier actuel identique. |
| Aperçus sans branche lien disponible ou suivi privé | low, patch | Générateur produit quatre variantes fictives : défaut, lien disponible, présentiel, avis Tema avec lien privé fictif ; contrôle DOM des liens. |
| max-width seul insuffisant pour Outlook classique | medium, patch | Wrapper conditionnel MSO600px ajouté ; rendu natif Outlook toujours non vérifié, aucune garantie exhaustive. |
| Confidentialité vérifiée seulement en HTML | medium, patch | Tests sentinelles sur body ET htmlBody participant : ni suivi privé, ni adresse interne, référence ou téléphone. |

[Rapport local](../../docs/project/acceptance/mail-visual-2026-11-09.md). Le statut done désigne la préparation locale reviewable, pas une livraison Google ni acceptation visuelle.

## Intégration autorisée après validation visuelle

GO explicite Sofiane réalisé le9novembre : modèle activé dans le déploiement COPY existant version6, hash natif/candidat a031423a6e6e46997bca8f0c1189968f775639f0c89834467b628149200a337c ; manifeste/accès/scopes conservés, version5 pour récupération. Deux tests visuels sur réservation existante, sans nouvelle inscription, bornés par budget et état anti-rejeu persistant. SENT/SENT, rendu Gmail et réception Inbox Tema, téléchargement ICS octets identiques. Sources métier inchangées et GET public OK. Budget6/12 sur13/26, helper retiré ; réception externe/Outlook non vérifiée. Aucun commit/push/autre environnement. [Rapport réel](../../docs/project/acceptance/mail-visual-deployment-2026-11-09.md).
