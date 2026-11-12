# Revue rubric walker — Architecture Tema Académie V1

Revue indépendante effectuée le 20 octobre 2026 selon le Reviewer Gate natif de `bmad-architecture`. Périmètre : `ARCHITECTURE-SPINE.md`, ses cinq compagnons, la spécification racine et les décisions fonctionnelles déjà fournies. Aucun code produit, compte ou déploiement créé. Les références de lignes ci-dessous portent sur la version relue avant corrections du parent.

## Verdict

La préparation couvre les huit capacités et distingue correctement organisation approuvée, propositions d’architecture et preuves restant à obtenir. Elle peut servir à la discussion humaine ; quatre précisions sont à intégrer avant un handoff de développement afin que les adaptateurs ne divergent pas sur l’issue d’une demande, les envois après changement et l’exploitation.

Décompte : **0 critical, 1 high, 3 medium**. Les corrections proposées sont documentaires et ne requièrent ni nouveau fournisseur ni réalisation anticipée.

## Réconciliation préalable avec la spécification et l’UX

| Capacité de la spécification | Contrat UX et architecture | Conclusion |
|---|---|---|
| CAP-1 — Comprendre les formations | S1/S2, F1/F2 ; AD-2/3/7/8 ; import 24 formations et fiche conservant prérequis/contenu/résultat. | Cohérent. Les codes formateurs internes restent une proposition de publication à valider, pas une nouvelle décision humaine. |
| CAP-2 — Choisir une session | S2/S3, F1/F2/F4 ; AD-3/6/8 ; liste et calendrier, fuseau Toronto, fermeture proposée et sessions complètes. | Cohérent. L’UX ne prétend pas qu’un affichage de places réserve la place. |
| CAP-3 — Administrer sans développeur | S8/S9, F4/F5 ; AD-3/7/8/9. | La source Sheet et ses protections sont communes. La procédure de changement sensible pendant des inscriptions reste à rendre exécutable : R-4. |
| CAP-4 — Réserver une place | S4/S5, F2/F3 ; AD-2/3/4/6/7 ; verrou script et idempotence. | Le service métier unique évite des règles différentes par transport. L’issue incertaine UX n’a pas encore de représentation non ambiguë dans l’enveloppe : R-1. |
| CAP-5 — Recevoir confirmation et agenda | S5/S6/S7/S9, F2/F3/F4 ; AD-3/5/7/9/10. | Réservation et emails sont séparés ; MailApp accepté ne signifie pas email reçu. Le cas d’un envoi initial/repris après annulation ou replanification manque : R-2. |
| CAP-6 — Gérer les changements manuellement | S9/S10, F5 ; AD-3/4/8 ; instantanés, annulation libérant une place, contact humain. | Aucun portail ou message automatique de replanification ajouté. Les opérations de gestion sensibles ont encore besoin d’une procédure commune : R-2/R-4. |
| CAP-7 — Protéger les données et traiter les erreurs | S4/S5/S9/S11, F2/F3/F4/F5 ; AD-4/5/6/7/9/10. | Liste blanche publique, contrôle serveur et texte inerte cohérents ; résultat inconnu à expliciter dans le contrat machine. |
| CAP-8 — Exploiter et recevoir la solution | S10, F4/F5 ; AD-1/9/10 ; guide, recette, ajustements et remise. | Comptes, récupération et preuves sont identifiés. La phrase excluant l’hébergement final de la V1 doit être resserrée : R-3. |

La structure `app/web`, `app/apps-script`, `app/tests` est une décision humaine approuvée. Les modes de transport, versions/outils, champs détaillés, fermeture au début du cours, reprise après annulation et règles visuelles restent des propositions. Le nom du compte Google et Vercel initial sont choisis ; leur disponibilité, les droits et le forfait ne sont pas prouvés. Aucune trace ne transforme cette préparation en GO de développement, achat, commit ou livraison.

## Constats prioritaires

### R-1 — High — Le résultat inconnu n’est pas représentable sans ambiguïté par `recorded` booléen

**Sources :** `contrat-donnees.md:87-89` ; `ARCHITECTURE-SPINE.md:84-90` ; EXPERIENCE, Voice and Tone et State Patterns S5/F3.

Le contrat prévoit que `BUSY` ou `UNAVAILABLE` peuvent avoir une issue incertaine, mais impose `recorded` comme booléen sans état inconnu ni règle d’omission. Une implémentation peut retourner `false` après une écriture dont le résultat est perdu ; une autre peut ignorer ce champ pour ces codes. Les deux interfaces traduiraient alors différemment le même cas, alors que F3 interdit justement un faux refus.

**Correction — autofix documentaire :** choisir un état explicite commun, par exemple `recording_status: recorded | not_recorded | unknown`, ou un booléen nullable dont la sémantique est définie. Donner la table code/état autorisée. Définir aussi le statut courant de réservation pour le rejeu d’une demande ensuite annulée, afin de ne pas afficher une confirmation active à partir d’un ancien succès. Le rejeu authentifié par la même demande doit être traité avant les validations mutables d’une nouvelle réservation (fermeture/politique/capacité), sans relancer les emails. Ajouter les assertions correspondantes aux scénarios AC-08/ET-03.

### R-2 — Medium — Les envois initiaux et les reprises ne sont pas réconciliés avec une annulation/replanification

**Sources :** `ARCHITECTURE-SPINE.md:72-84` ; `contrat-donnees.md:51-56` ; `regles-et-acceptation.md:12-15` ; EXPERIENCE F3/F5.

Le cycle `PENDING → SENDING` est défini, ainsi que les instantanés de réservation et les changements manuels. Il n’indique pas si le claim doit relire le statut et une éventuelle différence de date/lieu. Après panne/quota, une inscription peut avoir été annulée ou sa session reprogrammée avant la reprise : l’expéditeur pourrait alors annoncer « Votre inscription est confirmée » pour une inscription annulée, ou envoyer les anciens horaires sans explication. Cela touche aussi l’envoi initial s’il n’a pas encore été pris en charge lors du changement.

**Correction — autofix documentaire :** préciser l’éligibilité d’un message avant chaque claim, la règle pour une inscription annulée et la décision opérateur en cas d’écart entre instantané et session actuelle. Garder le contact de replanification manuel, sans ajouter une notification automatique. Définir qui déclenche la transition d’un `SENDING` expiré vers `UNKNOWN` et la commande/procédure privée de reprise ; elle ne doit pas être une édition arbitraire de colonnes protégées. Ajouter un cas de recette « annuler/replanifier avant reprise d’un message ».

### R-3 — Medium — La mise hors périmètre de l’hébergement final peut réduire le livrable V1

**Sources :** `ARCHITECTURE-SPINE.md:196` ; SPEC.Non-goals ; brief initial §7 ; EXPERIENCE S10/CAP-8.

La dernière ligne Deferred regroupe « hébergement final/intégration David » et paiement/comptes comme hors V1. Les sources reportent le choix de la destination finale et l’intégration David, mais conservent la mise en ligne dans les livrables. Une unité de livraison pourrait ainsi considérer qu’un test Vercel suffit et qu’aucune destination acceptée n’est due pour la V1.

**Correction — autofix documentaire :** distinguer « intégration David non prévue dans le présent chantier » et « choix de destination d’exploitation restant à valider avant livraison ». Dire que la V1 conserve un site publié sur une destination acceptée, éventuellement Vercel si cette destination est approuvée avec son coût. L’achat et le déploiement restent soumis à leurs GO.

### R-4 — Medium — La procédure commune pour une modification humaine sensible n’est pas encore fixée

**Sources :** `ARCHITECTURE-SPINE.md:78/102/195` ; `regles-et-acceptation.md:15` ; EXPERIENCE F5 et ses échecs.

L’architecture reconnaît correctement qu’un verrou script ne bloque pas une édition humaine, et sait signaler une capacité abaissée sous les confirmés. Elle ne décide pas comment Tema change date/heure/lieu/capacité pendant des demandes en cours, ni par quel point privé la normalisation des IDs, le recalcul et les diagnostics sont déclenchés sans dépendre d’un `onEdit` absent sur les écritures script/API. Deux implémentations pourraient choisir une mutation au premier GET, un déclencheur ou une commande manuelle, et diverger sur le délai de publication et les instantanés.

**Correction — discuter ou autofix comme procédure proposée :** nommer un chemin commun de normalisation/recalcul et l’autorité qui l’exécute ; définir une procédure minimale de suspension de publication/inscription avant les changements sensibles, traitement des demandes déjà en cours, contrôle puis réouverture. Si une édition directe en cours d’inscription reste permise, préciser la limite acceptée et le signal de conflit, sans promettre une atomicité inexistante. Ajouter la manipulation concurrente au plan d’essai. Cela reste une convention à valider avant implémentation, sans besoin de bâtir un back-office.

## Checklist good-spine complet

| Dimension | Verdict et éléments examinés |
|---|---|
| Divergences réelles fixées au niveau inférieur | Adequate : frontières statique/service/Sheet/email, autorité de capacité, données par ID, codes et versions communes sont explicites. R-1/R-2/R-4 restent des divergences de résultat/opération à fermer. |
| AD enforceables et accord entre Rule/Prevents | AD-1/2/3/6/7/9/10 sont vérifiables dans les sorties, permissions et preuves. AD-4/5/8 ont les précisions R-1/R-2/R-4. La déclaration d’une règle n’est pas présentée comme un test passé. |
| Deferred sans décision structurante cachée | Le transport est différé avec essai et blocage explicites du développement dépendant : acceptable. Les valeurs de marque/politique/contacts ont des jalons. R-3 et R-4 resserrent les limites d’exploitation. |
| Technologies actuelles vérifiées | Contrôle indépendant : Node 24.22.0 est une LTS dans l’index officiel ; registres npm des trois versions consultés, versions existantes et moteurs compatibles avec Node 24.22.0. Services gérés distingués des versions installables. Pas de dépendance produit installée. |
| Brownfield ratifié | Le dépôt est un socle sans app existante à préserver ; l’arborescence proposée respecte les chemins du socle et l’organisation humaine approuvée. Les documents historiques du socle ne sont pas traités comme un produit Tema. |
| Capacités de la spécification couvertes | CAP-1 à CAP-8 ont un domicile et des AD ; UX et critères décrivent leurs parcours/états. Aucun paiement/compte participant/webinaire ajouté. |
| Héritage respecté | Pas de spine parent technique héritée déclarée. AGENTS et les décisions humaines sont respectés : cadrage seulement, aucun commit automatique, Google/Vercel non prétendus validés. |
| Altitude et dimensions entières | Feature adaptée ; modules métier, données, temps, transport, confidentialité, concurrence, exploitation, environnements, fournisseurs, coûts et récupération sont traités ou explicitement ouverts. Pas de dimension entière laissée silencieuse. |
| Enveloppe opérationnelle/environnements | Test et réel distincts côté Google/site, destination serveur, quotas partagés, version du couple, désactivation et rollback de code séparés des données : solides. Les actions opérateur précises et la cible de livraison demandent R-2/R-3/R-4. |
| Contrôle des données | Public/private et listage autorisé, aucune clé publique, IDs protégés, texte inerte et instantanés : cohérents. La politique/conservation restent explicitement à valider avant publication ; aucune conformité juridique globale n’est annoncée. |
| État des preuves | `technical_validation: not-executed`, matrice ET non exécutée et AC à produire. Lint et revue documentaires ne sont pas confondus avec navigateur/Sheet/MailApp/agenda réels. |

## Contrôles et sources de cette revue

- Lint natif exécuté : `lint_spine.py --workspace .../architecture-tema-academie-2026-10-20` → `ok: true`, 0 finding mécanique.
- [Index officiel Node](https://nodejs.org/dist/index.json) consulté le 20 octobre : entrée 24.22.0, 14 octobre 2026, LTS Krypton.
- Registres officiels [Vite 8.3.4](https://registry.npmjs.org/vite/8.3.4), [clasp 3.4.1](https://registry.npmjs.org/@google%2fclasp/3.4.1), [Playwright 1.64.1](https://registry.npmjs.org/@playwright%2ftest/1.64.1) relus via lecture HTTP directe après indisponibilité de leur rendu par l’outil web ; moteurs respectifs `^20.19.0 || >=22.12.0`, `>=20.0.0`, `>=20`.
- Revue documentaire seulement. Aucun accès Google, usage Vercel, navigateur de produit, envoi réel ou scénario d’essai exécuté.

## Triage recommandé

R-1 : **autofix avant distillation finale**. R-2 : **autofix documentaire**, puis preuve au scénario de reprise. R-3 : **autofix de périmètre**. R-4 : **procédure proposée à compléter et soumettre** ; ne pas la laisser comme détail libre de chaque unité.

Après ces corrections, le dossier pourra être remis à Sofiane comme proposition complète à valider. Les réponses humaines et preuves réelles maintiennent leurs gates ; ce verdict ne les remplace pas.

## Addendum — Vérification des corrections du 20 octobre 2026

Nouvelle lecture limitée aux quatre constats R-1 à R-4 dans `contrat-donnees.md`, `regles-et-acceptation.md`, `plan-essai-technique.md` et `ARCHITECTURE-SPINE.md`. Aucun autre périmètre ou fichier produit modifié.

**Verdict résiduel : les quatre constats sont fermés au niveau documentaire.** Le dossier est cohérent pour être soumis à Sofiane comme proposition. Décompte résiduel de cette lentille : **0 critical, 0 high, 0 medium** sur ces quatre points ; la première revue reste conservée ci-dessus comme trace de leur origine.

| Constat | Correction vérifiée | État |
|---|---|---|
| R-1 — Résultat inconnu et statut courant | Contrat, sections Commande/Résultat : `recording_status` à trois états et `reservation_status` courant ; tableau code/état, résultat local inconnu après réponse perdue, absence d’enregistrement non déduite d’un échec de format. Le reçu est recherché avant les contrôles mutables ; annulation affichée sans réactivation. AD-4/6 et règles 3–5 reprennent ces conventions ; AC-08/09 et ET-03 couvrent les cas. | **Fermé documentairement.** |
| R-2 — Envoi après annulation ou modification | Contrat Inscriptions : `SUPPRESSED`/`BLOCKED`, historique `SENT` préservé. AD-5 et règles 6–7 : contrôle avant tentative initiale/reprise, classification privée de `SENDING` ancien en `UNKNOWN`, décision explicite et pas d’édition arbitraire des états d’envoi. AC-12 et ET-08 prévoient annulation/replanification avant claim ou reprise ; contact de replanification maintenu manuel. | **Fermé documentairement.** |
| R-3 — Destination d’exploitation V1 | Deferred de la spine distingue désormais la destination à accepter avant livraison et l’intégration David reportée. Règles AC-20/Clôture et plan d’essai Environnements conservent un site V1 publié sur cette destination, éventuellement Vercel après droits/coûts ; un test n’est pas livré par déduction. | **Fermé documentairement.** |
| R-4 — Normalisation et opérations sensibles | Contrat Source : attribution des IDs par commande privée. AD-8 et procédure privée des règles : service commun menu/déclencheur installable/écritures script-API, lectures publiques sans mutation ; suspension sous verrou bloquant nouvelles inscriptions/claims, attente ou vérification des envois, validation puis réouverture. La limite des éditions brutes reste explicite. AC-04/05/13 et ET-09 prévoient les preuves. | **Fermé documentairement.** |

La révision opaque `session_revision`, le refus `SESSION_CHANGED` sans réservation et la nouvelle confirmation après relecture des conditions complètent la cohérence des modifications ; ils ne sont pas présentés comme des mécanismes déjà implémentés.

Le lint natif relancé après corrections reste réussi, avec zéro défaut mécanique. Les statuts `approval: pending-owner-validation`, `technical_validation: not-executed` et l’état non exécuté de la matrice d’essai sont préservés. Les comptes, droits, coûts, effets Sheet/MailApp, concurrence et compatibilité navigateur/agenda restent à autoriser puis observer ; aucune fermeture documentaire ci-dessus ne leur attribue un résultat `PASS`.
