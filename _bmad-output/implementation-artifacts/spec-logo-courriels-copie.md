---
title: 'Logo du site intégré aux courriels de la copie'
type: 'feature'
created: '2026-11-09'
status: 'done'
route: 'oneshot'
baseline_commit: 'e95c5025409d4395956db366ddf960418785c26f'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="GO Sofiane : logo du site dans les courriels COPY et un test vers sa boîte déjà autorisée">

## Intent

Remplacer le mot TEMA de l’en-tête des confirmations et avis COPY par le logo PNG exact du site, en conservant Académie et le reste du modèle validé. Image jointe en CID et texte alternatif, aucun téléchargement réseau ni nouveau scope. Activer dans le déploiement COPY existant après tests/revue, puis envoyer un seul test à l’adresse déjà autorisée de Sofiane, sans nouvelle inscription, sans réarmer un envoi existant. Conserver les budgets, liste autorisée, sources, calendrier et garanties de reprise. Ancien TEST/PROD, autres envois, Git et site public exclus.

</frozen-after-approval>

## Implementation Notes

Route courte : comportement clair, modification restreinte au rendu/transport COPY/constructeur et tests. Les effets externes se limitent au GO explicite ci-dessus, avec sauvegarde native code/manifeste, récupération version6, état de test persistant et réservation dans le budget existant avant envoi. Réutiliser makeMail ; option interne au dependency COPY pour ne pas changer le rendu de l’ancien TEST. Builder embarque les octets de app/web/assets/logo-tema.png en base64 dans le bundle privé ; MailApp.inlineImages associe le CID fixe temaLogo à un blob PNG. Preview local remplace le CID par une data URL uniquement dans son artefact, sans changer le HTML expédié. Rendu Gmail à vérifier réellement ; Outlook et mode sombre non garantis sans recette propre. Arbre sale connu préservé, aucun commit/push.


Réalisation : dépendance interne mailLogo dans COPY uniquement ; en-tête à image CID et Académie textuel, fond blanc, alt Tema Solutions,160px nominal. Ancien TEST conserve son en-tête textuel sans nouvelle dépendance. Constructeur privé embarque les octets exacts du PNG ; transport MailApp associe temaLogo au blob image/png nommé logo-tema.png, sans URL fetch. Texte, calendrier et destinataires inchangés.

Validation :132tests standard et198expérimentaux réussis, build/sécurité/diff verts. Aperçu Chromium320px sans débordement (réduction du logo à150px si nécessaire). Bundle généré exécuté dans le simulateur jusqu’au transport, octets/MIME/nom/CID contrôlés. Version7 Google activée à10:13Montréal, code natif final conforme4fbb19238dcfd3bcbfa5deafa70f93b94f109e2163cf6b17d054300acce6a796 et manifeste inchangé. Test unique à10:15:12 : SENT, image inline et ICS, aucun nouvel inscrit. Gmail copie Envoyés : image réellement chargée400x146 et rendue160px ; réception externe/Outlook/mode sombre non vérifiés. Sources exportées avant/après identiques en valeurs/types. Budget7réservations/13destinataires sur13/26, liste autorisée intacte, helper retiré et preuve privée mise à jour. Aucun Git/autre environnement. [Rapport](../../docs/project/acceptance/mail-logo-2026-11-09.md).

## Review Triage Log

Route oneshot : revue courte indépendante Blind Hunter, trois constats reçus.

| Constat | Verdict | Résolution / preuve |
|---|---|---|
| Logo160px au lieu de320px demandés | false | Aucun besoin de logo320px dans la demande.320px est le viewport de validation ;160px avec Académie est le choix de rendu. Contrôle réel320px sans débordement, dimensions naturelles400x146. |
| Faux blob perdant type MIME et nom | medium, patch | Métadonnées conservées dans le faux blob PNG ; tests image/png, logo-tema.png, clé CID et octets exacts. |
| Test constructeur compilé mais non exécuté jusqu’au transport | medium, patch | Bundle généré exécuté dans le contexte Google simulé, création d’un message puis transport mock : CID/MIME/nom/octets issus de la déclaration du bundle validés. |

GO d’intégration et du seul envoi explicites dans la demande ; aucune question supplémentaire nécessaire. Version6 et sauvegardes privées conservées pour récupération sans restaurer données/propriétés/compteurs.
