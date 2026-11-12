# Réconciliation Spec → Architecture — 28 octobre 2026

**Verdict : compatible pour le Reviewer Gate documentaire. Aucun écart P0/P1/P2 identifié entre les contrats redérivés et les onze AD.** La compatibilité du dossier ne constitue ni validation empirique de la V1 ni GO de développement.

## Entrées examinées

- SPEC.md et ses huit CAP, contrat-donnees.md, regles-et-acceptation.md, plan-essai-technique.md et strategie-tests.md, redérivés le28octobre.
- ARCHITECTURE-SPINE.md : onze AD conservés, consolidation en draft avant gate.
- docs/project/architecture/controle-technique-v1.md : paramètres, scénarios et gates G0–G4.
- Décisions et preuves reprises explicitement dans ces sources : cadence normale<2min/secours5min, tarif à confirmer, cadre Google gratuit, TEM-6 historique4PASS/8NON VÉRIFIÉ et suite locale61Node/28Playwright. Aucun résultat réel nouveau n’est inféré.

## Couverture des capacités

| Capacité | Rattachement constaté | Résultat de réconciliation |
|---|---|---|
| CAP-1 Catalogue | AD-1/2/3/7/8 |24formations, logiciels, contenu/prérequis/durée/résultats/tarifs et informations internes conservés ; actif/inactif et absence de date distincts |
| CAP-2 Sessions | AD-2/3/6/8/11 | Même projection pour grille/liste ; visibilité future, fermeture manuelle et capacité séparées de l’éligibilité tarifaire ; contexte de date porté par UX adopté |
| CAP-3 Administration | AD-3/7/8/9/11 | IDs stables, colonnes par nom, diagnostics, défauts inactif/fermé, import reprenable, traitement commun édition/import/secours et capacité par date |
| CAP-4 Réservation | AD-2/3/4/6/7/10/11 | Un écrivain et verrou effectif, replay/conflit prioritaires, contrôle frais et flush, absence de doublon/surréservation, accord et prix requis |
| CAP-5 Notifications | AD-3/5/7/9/10/11 | Instantanés/temps communs, une tentative initiale par canal, place maintenue, SENT distinct de réception, suivi Gmail manuel, lien privé ou à venir |
| CAP-6 Changements | AD-3/4/5/8/11 | Annulation conservée et nouvelle ligne à réinscription ; reprogrammation même ID, pas de notification automatique ni révocation atomique prétendue d’un envoi engagé |
| CAP-7 Confidentialité et erreurs | AD-4/5/6/7/9/10/11 | Projection/reçu minimaux, champs inertes ycompris export, statut inconnu honnête, reprise sûre et garde des rafales bornée ; politique/conservation restent à leur validation client |
| CAP-8 Exploitation et remise | AD-1/8/9/10/11 | Candidat publié avant recette, promotion contrôlée, code/HEAD/build identifiés et récupérables sans restauration Sheet ; guide/tests/ajustements/séance et bascule Sofiane distincts |

## Coutures et états communs contrôlés

- **Tarif absent :** `registration_enabled` et `registration_block_reason` sont dérivés, non des commandes gestionnaires. Vrai seulement pour `status=open` et prix numérique valide renseigné ; motif `price_unconfirmed` seulement si open sans prix. Les trois statuts et les règles de visibilité restent inchangés. Tri/prochaine disponibilité/CTA se fondent sur l’éligibilité ; aucun prix absent assimilé à zéro.
- **Admission à tarif absent :** nouveau refus `CLOSED/not_recorded`, message `price_unconfirmed`, erreur `prix/PRICE_UNCONFIRMED` ; pas de nouvelle famille de résultat. Replay/conflit avant contrôles mutables, ancienne place non annulée et instantanés non réécrits. Un prix modifié continue aussi de participer à la révision des conditions.
- **Rafales :** mêmes valeurs3par empreinte courriel et30par projet dans une fenêtre fixe UTC60s, après lookup de demande existante ; compteur privé atomique/borné. Limite→`INVALID/not_recorded` + `rate_limited` + `anti_spam/RATE_LIMITED`, sans ligne/mail. Indisponibilité→`UNAVAILABLE/unknown`, reprise conservée. Les sources ne prétendent ni identité IP fiable ni défense DDoS.
- **Temps et identité :** Toronto à la saisie/affichage, UTCZ pour API/traces/ICS sans TZID concurrent ; ambiguïtés DST refusées. Codes/UUID, compteurs monotones, sérialisation et instantanés communs ne sont pas redéfinis par les adaptateurs.
- **Ownership :** Sheets privé source métier, Apps Script propriétaire des mutations applicatives et projet écrivain unique par Sheet ; navigateur et caches non autoritaires. Les éditions humaines restent hors atomicité du verrou.
- **Cadence/quota :** cible normale<120s et secours nominal5min acceptés ; import contrôlé appelle le traitement, aucune relance mail depuis secours. Admission fraîche indépendante. Les valeurs50inscriptions théoriques et quota partagé ne deviennent ni compteur métier fixe ni garantie d’envoi.
- **Import/export/promotion :** reprises sans doublon/écrasement silencieux, Excel inerte et maintien de la garde TEST sont des obligations explicites, avec scénarios futurs. La promotion ne consiste pas à retirer globalement les restrictions d’essai.

## Gates et preuves conservées

G0 peut clore les contrats pour passer à la revue UX documentaire sans inventer une nouvelle campagne Google. G1 garde le GO explicite du lot avant code. G2 vise l’acceptation/exposition aux utilisateurs hors périmètre de test ; le compagnon précise qu’un déploiement TEST ou preview autorisé peut précéder les contrôles dont il est le support. G3 publie le candidat autorisé avant sa recette complète et garde Outlook/Apple à Sofiane. G4 requiert les contrôles obligatoires PASS ou une dérogation humaine identifiée ; une simple limite notée ne ferme pas la recette.

Les seuils et nouveaux champs restent à implémenter/tester ; leur présence dans le contrat ne requalifie pas les8ET incomplets. Les besoins de supports, données/prix/politique/identité et offre Vercel restent aux jalons correspondants, sans interdire la revue UX. Les références historiques de versions proposées ne sont pas un ordre de réinitialiser le prototype.

## Conclusion

Aucune capacité silencieusement perdue et aucune convention contradictoire nécessitant un nouvel arbitrage humain n’a été observée dans ce périmètre. Le parent peut poursuivre son lint et les reviewers indépendants de la spine. Le dossier, la recette, le GO principal, la fusion et la livraison conservent leurs acceptations distinctes.
