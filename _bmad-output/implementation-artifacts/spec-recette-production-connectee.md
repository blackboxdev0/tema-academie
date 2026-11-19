---
title: Recette de production connectée avant Vercel
type: chore
created: '2026-11-19'
status: in-review
route: dispatch
review_loop_iteration: 0
context: []
baseline_commit: 822a3629e3cb0f43ee6a55713af8c4d321918b9c
---

<frozen-after-approval reason="périmètre autorisé par Sofiane">

## Intent

Vérifier le vrai parcours d’inscription du site en mode production avec le nouveau classeur Tema, y compris réception et annulation, avant le déploiement Vercel.

## Boundaries & Constraints

Cible exclusive : classeur de préparation et projet Apps Script lié, identités dans `config/project.json`. Version publique Google issue des sources déjà vérifiées de `822a362`. Aperçu local lié à son URL `/exec` attestée. Une session fictive de capacité 1 dans une ligne vide et une seule inscription avec données fictives. Deux courriels vers la boîte Tema déjà autorisée. Plafond d’envoi zéro jusqu’à confirmation du seul dossier attendu et fermeture de la cohorte, puis plafond borné aux tentatives encore dans la fenêtre plus deux. Conserver le journal d’envoi. Après essai, remettre la limite à zéro et le worker de préparation au repos, avec l’API et l’aperçu production raccordés. Les couleurs, Vercel, main et les anciens classeurs sont hors périmètre. Confirmation de l’accès anonyme requise au clic de déploiement Google.

## I/O & Edge-Case Matrix

| Cas | État | Résultat |
|---|---|---|
| Visite locale | Profil prod et API attestée | 24 formations, textes prod, politique versionnée |
| Inscription | Session fictive ouverte, envois suspendus | Une réservation durable, plus de place, reprise sans doublon |
| Envoi | Seul dossier Tema validé, session fermée | Deux messages reçus après fermeture du navigateur, invitation jointe |
| Annulation | Deux envois contrôlés, plafond revenu à zéro | Place restituée et dossier annulé, puis retrait exact de l’essai |
| Anomalie | Données, identité ou configuration divergent | Arrêt de la recette et conservation des preuves, aucune relance d’envoi incertain |

</frozen-after-approval>

## Code Map

- `app/scripts/production-target.cjs` valide le couple d’identités, la version Google et l’URL. `build.cjs` et `serve.cjs` construisent et servent la version locale hors dépôt.
- `app/experiments/copy-backend.gs` et `production-mail.gs` lisent la vraie source, réservent, gèrent les tentatives et traitent les mails. `engine.js` garde la même révision quand seule l’ouverture change.
- `app/experiments/admin-registration-actions.gs` définit l’annulation du suivi et le recalcul. `app/tests/browser/production.spec.cjs` décrit le parcours local simulé.
- Sauvegardes, identité, sources installées et recette du 18 novembre dans `~/.config/tema-academie/production-candidate-20261118/`. Les helpers temporaires restent dans son dossier `activation-20261119`, hors Git et hors version publique Apps Script.

## Tasks & Acceptance

- [x] Préparer les commandes de recette propriétaires hors dépôt. Elles préparent une session fictive dans une ligne vide, contrôlent le résultat du POST navigateur, encadrent les envois et vérifient l’annulation et le nettoyage.
- [x] Attester la version Google et construire/servir le profil production avec son endpoint. Depuis le vrai site local, contrôler l’affichage et soumettre une seule demande avec identité fictive et courriel Tema.
- [x] Vérifier dans Gmail les deux messages et la pièce jointe agenda. Enregistrer l’annulation et vérifier le rejeu, puis restaurer les données d’origine et retirer les commandes temporaires.
- [x] Confirmer la restitution durable de la place sans actualisation manuelle après une annulation depuis le suivi. Suite au correctif du même jour, le [contre-essai](spec-restauration-place-production.md) confirme le passage de 0 à 1 et sa persistance après maintenance.

L’export final doit contenir les mêmes 24 fiches et les mêmes données métier qu’avant le test. Le raccordement, l’inscription et les envois sont vérifiés. Le contrôle de l’annulation conserve la réserve sur la restitution automatique de la place. La mise en ligne Vercel reste une décision distincte.

## Implementation Notes

Le GO du 19 novembre couvre le raccordement, le mode production et la recette réelle. La boîte Tema et la limite de deux messages réutilisent le périmètre de recette approuvé. La demande d’accès « Anyone » est présentée au moment du déploiement.

L’export initial compte 24 formations, aucune session et aucune inscription. Le plafond initial est à zéro, le traitement est en pause et deux tentatives antérieures sont conservées. Les 132 tests standard et 405 expériences passent, dont 117 tests serveur production. Les 20 tests navigateur sur transport simulé passent également.

Sofiane a confirmé l’accès « Anyone ». La version publique 1 a été créée à partir du code canonique Google déjà vérifié. Le GET anonyme et le site local présentent les 24 formations et la politique de production. Une réservation réelle a occupé l’unique place. La page a confirmé l’enregistrement avant les envois. Le traitement planifié a envoyé les deux courriels à Tema après fermeture de l’onglet. Gmail affiche la confirmation, le fichier `formation.ics` et l’avis interne.

L’annulation a été enregistrée dans la source. Le rejeu HTTP renvoie `REPLAY` avec `annulee`. Le compteur technique a indiqué 1 immédiatement après annulation, puis 0 lors d’une lecture indépendante. La commande « Actualiser le suivi » a restauré 1 dans les deux lectures Google et dans l’export. Le déclencheur planifié a été remis à 12 heures. Le parcours d’annulation via le menu de statut et la persistance du recalcul automatique restent à confirmer séparément.

Après nettoyage, les valeurs brutes exportées des trois onglets source sont exactement identiques à l’export initial. Le code propriétaire a été relu à l’identique et les commandes temporaires retirées. Le plafond est à zéro, le traitement en pause, les quatre tentatives conservées. Le GET anonyme final répond HTTP 200 avec 24 formations et zéro session. L’aperçu local reste raccordé sur le port 4187. [Rapport](../../docs/project/acceptance/production-connected-2026-11-19.md).

## Spec Change Log

## Review Triage Log

| Constat | Verdict et suite |
| --- | --- |
| Le bilan pouvait laisser croire à une restitution durable après la commande d’annulation. | Medium, texte corrigé. Les exports et les lectures Google attestent 0 avant l’actualisation explicite, puis 1. Contrôle automatique ouvert. |
| Les points de reprise Git et Google du même jour prêtaient à confusion. | Medium, jalon Git marqué antérieur au déploiement Google dans le registre et le handoff. |
| Le checkpoint BMAD devait distinguer le critère historique de la recette production. | Medium, date actualisée et liens TEM-22, TEM-27 et TEM-28 précisés. Le résultat intégré de TEM-22 décrit la démo précédente. |
| Les conditions de reprise du traitement planifié étaient incomplètes dans le rapport. | Medium, cadence, plafond et contrôles restants référencés. |
| Les preuves et la commande de relance locale étaient difficiles à retrouver. | Low, emplacement relatif des preuves et commande de relance précisés dans le rapport. |
| La date des vingt tests navigateur était ambiguë. | Low, le rapport précise la passe ciblée de production du 19 novembre et le caractère simulé de son transport. |

## Verification

Lire la réponse HTTP réelle sans connexion, observer le site local et l’état Google, relever les réceptions dans Gmail. Comparer les exports natifs avant et après. Rejouer les tests production sur le code du candidat et contrôler ses empreintes. Distinguer mesure ponctuelle et consommation Google sur 24 heures.
