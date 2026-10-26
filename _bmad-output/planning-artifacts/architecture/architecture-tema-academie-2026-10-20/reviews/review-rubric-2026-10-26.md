# Reviewer Gate — Rubric walker, 26 octobre 2026

**Verdict : PASS documentaire pour présenter la proposition d’architecture à Sofiane. Aucun défaut P0, P1 ou P2 ne bloque cette présentation. Les preuves réelles et les GO restent à obtenir aux étapes déjà définies.**

## Périmètre et méthode

Revue indépendante du good-spine checklist de `bmad-architecture/references/reviewer-gate.md`, à l’altitude feature de Tema Académie V1. Cible : [ARCHITECTURE-SPINE.md](../ARCHITECTURE-SPINE.md), version datée du 26 octobre, 200 lignes, SHA-256 `345057b5902931bba6ac36e32647c7fdb81e58755c9127f8a7ee45cc1e394a64`.

Sources relues : consignes `AGENTS.md`, identité et continuité du projet, Spec et contrat de données, plan d’essai et les trois [réconciliations Spec](reconcile-spec-2026-10-26.md), [UX](reconcile-ux-2026-10-26.md) et [décisions humaines](reconcile-decisions-2026-10-26.md). Les derniers arbitrages humains du journal d’architecture, notamment admission et maintenance minimale, priment sur les formulations antérieures des compagnons.

Les corrections annoncées à l’entrée de cette revue sont présentes : export Excel et calculs script dans AD-8 ; capacité source indicative et sans héritage dynamique dans AD-8 ; préfixes des logiciels supplémentaires dans AD-3 ; limite anti-énumération de `DUPLICATE` dans AD-7. Les mises à jour des compagnons par leur writer sont un checkpoint d’adoption en cours, pas une absence à redéclarer dans la spine.

Le lint natif a été exécuté : `uv run .agents/skills/bmad-architecture/scripts/lint_spine.py --workspace _bmad-output/planning-artifacts/architecture/architecture-tema-academie-2026-10-20`. Résultat : `ok: true`, zéro constat. Cela contrôle la forme ; l’analyse ci-dessous porte sur la cohérence sémantique. Aucun code produit, ressource Google, test réel, ticket ou commit n’a été créé ou modifié par cette revue. L’écriture est limitée à ce rapport.

## Constats sévérisés et traitement minimal

### RUB-01 — Information : aucun blocage propre à la proposition documentaire

Les onze AD fixent les propriétaires, schémas partagés, frontières de publication, mutations, temps, reprise, états d’envoi, environnements et contrôles. Les huit capacités de la Spec sont représentées. Les limites des éditions humaines et des services gérés sont explicites. Aucun couple d’unités du niveau inférieur n’a été identifié qui puisse respecter ces règles tout en choisissant des contrats partagés incompatibles.

**Traitement : conserver. Correction minimale : aucune modification de la spine demandée par ce rubric walker.** Cela n’anticipe pas le verdict des autres lentilles du gate ni l’acceptation de Sofiane.

### RUB-02 — P2, preuve future avant développement principal : invariants encore non exécutés

AD-4/5/6/11 (`:80,86,92,122`) imposent le résultat navigateur lisible, la dernière place unique, la reprise de la même demande, le statut courant après annulation, l’absence de nouvel envoi au rejeu, les limites d’admission et la séparation réservation/courriel. Le document les présente correctement comme des obligations à prouver. Une lecture documentaire ou un test API ne suffira pas à établir le parcours navigateur ni la réception/import agenda.

**Traitement : différer vers les preuves prévues, sans bloquer la proposition. Correction minimale : aucune prescription supplémentaire ; après GO limité, renseigner les scénarios ET existants avec le transport retenu, le candidat, l’environnement, attendu/observé et `PASS/FAIL/NON VÉRIFIÉ`.** En cas de repli, rejouer les scénarios critiques sur ce transport. Une preuve obligatoire absente doit conserver son effet bloquant sur le développement principal, selon AD-6/10 et le plan ; aucun GO n’est déduit de ce rapport.

### RUB-03 — P2, preuves futures : fraîcheur/quotas à l’essai, abus avant ouverture

AD-7/8/9/10 (`:98,104,110,116`) et Deferred (`:196–198`) distinguent la cible approuvée de publication en moins de deux minutes des cadences candidates. Ils reconnaissent les quotas partagés, l’absence de garantie de réception et le fait que `DUPLICATE` révèle l’existence d’une inscription pour le couple courriel/session. Ni le honeypot ni le délai ne sont présentés comme une protection complète.

**Traitement : garder les conditions existantes. Correction minimale : aucune nouvelle plateforme ou procédure ; mesurer ET-09 avec éditions, événements manqués/import, runtime, quota et charge représentatifs pendant l’essai autorisé, puis éprouver la limitation de fréquence avant ouverture.** Les contrôles requis par le plan avant développement principal conservent cette échéance. Si la cible ou la protection ne peut être tenue dans le cadre retenu, présenter l’effet concret à Sofiane avant de changer le contrat. L’absence actuelle de ces preuves ne constitue pas une omission documentaire.

### RUB-04 — P3, checkpoint documentaire déjà pris en charge : adoption des compagnons

La spine lie explicitement le contrat de données et les contrats UX. Les anciennes formulations des compagnons sur `publie`, les codes, l’admission, le cache ou la cadence doivent être remplacées par les décisions consolidées. Cette adoption est en cours et a été expressément identifiée avant le gate ; elle ne justifie pas d’ouvrir à nouveau les choix humains.

**Traitement : adoption par le writer désigné. Correction minimale : relire la cohérence des renvois et des attentes ET/AC à la fin de son travail, en gardant AD-1 à AD-11 stables.** Ne pas ajouter un menu de publication, de relance ou une procédure détaillée de récupération. Une remise globale du package attend ce contrôle ; la proposition de spine n’est pas bloquée par cet écart attendu.

## Application du good-spine checklist

| Critère | Évaluation | Preuve et limite |
|---|---|---|
| Divergences réelles du niveau inférieur fixées | Conforme | Un seul moteur métier et une canonisation commune ; frontières web/Google/Sheet explicites. L’adaptateur ne choisit ni capacité, ni schéma, ni destination. |
| Rules applicables et reliées à leur divergence | Conforme | Chaque règle contient un comportement ou une interdiction contrôlable ; détail AD par AD ci-dessous. Aucune règle ne présente son contrôle futur comme déjà réalisé. |
| Deferred ne laisse pas des unités inventer des contrats incompatibles | Conforme | Transport sous contrat commun et gate ; cadences sous cible ; détails internes sous schémas/frontières ; valeurs absentes non inventées ; hébergement final sous responsabilité identifiée. |
| Technologies nommées vérifiées | Conforme au niveau du seed | Versions exactes confirmées auprès des registres officiels ; V8 géré et ses limites documentés. Revérification au GO conservée. Aucun paquet installé, starter exécuté ou runtime Google éprouvé ici. |
| Compatibilité avec un code existant | Sans objet pour le produit | Le dépôt est un socle sans `app/` produit. AD-1 conserve cette séparation ; les artefacts historiques du socle ne sont pas interprétés comme code ou fonctionnalités Tema. |
| Capacités de la Spec couvertes | Conforme | CAP-1 à CAP-8 ont une localisation et des AD correspondantes ; vérification détaillée ci-dessous. Les textes et parcours restent gouvernés par leurs compagnons. |
| Invariants hérités préservés | Conforme | Pas de spine parente d’epic à redériver. Les contraintes humaines, la Spec et les décisions plus récentes sont conservées sans GO étendu. |
| Dimensions structurelles toutes traitées | Conforme | Publication, dépendances, données, mutations, intégrations, exploitation, ressources, versions, coûts/quotas et tests sont décidés ou bornés. Aucun pan opérationnel entier n’est laissé silencieux. |
| Simplicité proportionnée à la V1 | Conforme | Site statique vanilla, Apps Script, quatre onglets, suivi Gmail ; pas de serveur applicatif, base externe, système de rôles ni outil de récupération additionnel. |
| Auteur, humain, preuve et autorisation distingués | Conforme | Introduction `:28`, maturité/approval/technical_validation, AD-10/11 et Deferred distinguent principes adoptés, mécanismes délégués et preuves non exécutées. Un futur statut documentaire final ne vaut pas GO produit. |

## Applicabilité des onze invariants

| AD | Divergence empêchée et contrôle possible | Appréciation |
|---|---|---|
| AD-1 | Sorties web/Google maîtrisées ; exclusions données/tests/secrets ; chemins et politique de commit explicites. Vérifiable par inspection des sorties et du dépôt. | Applicable ; sans modification du socle requise. |
| AD-2 | Autorité métier unique, adaptateurs sans règles recopiées, logique pure séparée et compatibilité V8. Vérifiable par dépendances et tests du même service. | Empêche deux moteurs ou un serveur Vercel implicite. |
| AD-3 | IDs stables, génération commune verrouillée, sérialisation/révision dans le contrat, temps Toronto/UTC et ICS fixés. Vérifiable par exemples communs et fixtures temporelles. | L’extension des logiciels est bornée ; pas de clé par titre ou ligne. |
| AD-4 | Verrou acquis, recherche du rejeu avant les contrôles mutables, admission fraîche, écriture établie et flush avant libération. Vérifiable par concurrence et injection de coupure. | Limite des éditions humaines honnête ; fermeture post-admission précisément bornée. |
| AD-5 | Une tentative initiale par message, claim sous verrou/envoi hors verrou, états indépendants, blocage/suppression et suivi manuel. Vérifiable par transitions et coupures. | Ne promet ni réception ni exactement une fois ; aucun renvoi implicite. |
| AD-6 | Contrat commun de résultat et de reprise quel que soit A/B/C ; choix unique après preuve. Vérifiable dans les navigateurs et par enveloppes communes. | Le transport reste une décision gated ; pas un choix libre pour chaque auteur. |
| AD-7 | Projection en liste blanche, entrées inertes, consentement serveur, aucune PII persistée côté client ou exposée par le reçu. Vérifiable par réponses, bundle et injections fictives. | La limite de `DUPLICATE` et la politique encore à valider ne sont pas masquées. |
| AD-8 | Seules commandes Active/Inscriptions ouvertes, visibilité calculée commune, défauts sûrs, validation/identités et fraîcheur mesurable. | Fidélité client, export et capacité source conservés ; aucune commande supplémentaire. |
| AD-9 | Un projet écrivain par Sheet, TEST isolé, destination serveur, compatibilité HEAD/triggers/version déployée, versions et courte note. | Frontières et maintenance suffisantes sans procédure lourde ; preuves d’accès/déploiement ultérieures. |
| AD-10 | Prérequis et autorisations par étape, coûts non présumés, conditions de remise et d’ouverture explicites. Vérifiable par checklist de GO et preuves identifiées. | Aucun accès, achat, développement ou livraison autorisé par déduction. |
| AD-11 | Même logique et commande de contrôle, local avant push puis CI, fixtures et horloge contrôlées, niveaux de preuve séparés. | Exigence de non-régression applicable après réalisation autorisée ; aucun pipeline déclaré existant. |

## Couverture des capacités et de l’enveloppe structurelle

| Capacité de la Spec | Contrat architectural retrouvé |
|---|---|
| CAP-1 — Catalogue et contenu | AD-3/7/8 et référence UX : neuf informations métier, import fidèle, catalogue public sélectionné, activité et absence de date sans disparition de la formation. |
| CAP-2 — Sessions et calendriers | AD-3/6/8 : temps commun, état calculé identique pour les vues, conditions fraîches et fermeture au début ; tri/navigation gouvernés par EXPERIENCE. |
| CAP-3 — Administration autonome | AD-3/8/9 : IDs automatiques, quatre onglets, lignes invalides isolées, commandes minimales, cible de fraîcheur et diagnostic. |
| CAP-4 — Réservation | AD-2/3/4/6/7 : une demande/personne/place selon le contrat référencé, contrôles serveur, consentement, révision, capacité, doublon, replay et résultat inconnu. |
| CAP-5 — Messages et agenda | AD-3/5/7/10/11 : instantanés, ICS UTC/UID stable, lien privé ou suivi manuel, avis Tema conditionnel, preuve réelle dans les agendas. |
| CAP-6 — Changements | AD-4/5/8 : annulation conservée, nouvelle ligne à la réinscription, fermeture/modification de la même session, suivi Gmail sans envoi implicite. |
| CAP-7 — Confidentialité et erreurs | AD-4/5/6/7/9 : erreurs partagées, reçu minimal, projection publique, entrées inertes, états incertains et environnements séparés. |
| CAP-8 — Exploitation et remise | AD-1/8/9/10/11 : export tabulaire, accès, versions compatibles, note minimale, recette/guide/tests transmissibles et destination acceptée. |

La topologie est représentée par les trois schémas ; les dépendances, l’autorité de mutation et la source d’état sont explicites. Les ressources TEST et métier, le transfert Vercel/Tema, les versions et les triggers traitent l’enveloppe de déploiement. Les quotas, traces privées et états d’envoi couvrent les limites d’exploitation ; ils n’imposent pas une nouvelle supervision. Les contrôles de non-régression et les gates documentent la vérification et la remise. Les rôles détaillés ont été laissés de côté par choix humain ; permissions Google et accès/récupération avant usage réel conservent une frontière cohérente.

## Contrôle des éléments différés

| Élément différé | Ce qui reste commun et empêche la divergence | Condition de reprise |
|---|---|---|
| Transport | Même moteur, schémas, codes, idempotence et statut inconnu. Un seul transport finalement retenu. | ET-01 à ET-05/ET-11 et arbitrage si effet UX/coût/périmètre. |
| Cadence/quotas | Cible <2 minutes ; absence de cache serveur initial ; pas de watcher du formulaire ; service commun de validation. | ET-09, charge/quota réels ; retour à Sofiane si cible modifiée. |
| Accès/forfait/essai | TEST distinct, destinataires contrôlés, destination serveur, budget borné. | Accès et plan constatés, GO limité explicite. |
| Valeurs avant publication | Types, frontières privées/publiques et états déjà fixés ; aucune valeur inventée. | Validation de la politique, conservation, données finales et marque. |
| Build/fichiers/styles | V8 compatible, contrats/AD communs, dépendances interdites et frontière statique fixes. | Développement autorisé ; nouveau runtime/fournisseur revient au cadrage. |
| Serveur Tema | Même moteur Google pérenne ; build portable ; Sofiane responsable de la bascule avant ouverture. | Destination et transfert validés ; aucune dépendance imposée à la démo Vercel. |

Aucun élément de Deferred ne réouvre la propriété d’une entité, le calcul des places, le protocole de reprise ou les règles de publication. Les détails d’assemblage ne demandent pas de nouvel AD tant qu’ils respectent ces frontières.

## Vérification du seed technique

Les lectures réseau du 26 octobre confirment l’existence de Node `24.22.1`, LTS Krypton, dans l’[index officiel](https://nodejs.org/dist/index.json), ainsi que [Vite 8.3.5](https://registry.npmjs.org/vite/8.3.5), [create-vite 9.3.1](https://registry.npmjs.org/create-vite/9.3.1), [clasp 3.4.1](https://registry.npmjs.org/@google%2fclasp/3.4.1) et [Playwright Test 1.64.1](https://registry.npmjs.org/@playwright%2ftest/1.64.1). Les champs `engines.node` publiés de ces quatre paquets admettent Node 24. Les endpoints npm n’étant pas lisibles via l’outil web lors de cette passe, leurs JSON officiels ont été lus directement par HTTP en lecture seule ; aucune installation n’a été effectuée.

La séparation outil Node/runtime serveur est compatible avec le [V8 Apps Script documenté](https://developers.google.com/apps-script/guides/v8-runtime). Les autres preuves primaires sont référencées dans la spine `:152` et dans son journal de vérification du 26 octobre. Ce rubric walker n’assimile pas ces documents à une preuve d’exécution du starter, du transport, des triggers ou des services. La lentille technologique dédiée conserve son rôle sur leurs détails de fonctionnement.

## Suite minimale

Terminer les autres lentilles du gate et l’adoption documentaire annoncée, puis présenter la proposition consolidée à Sofiane. Aucun correctif supplémentaire de spine n’est demandé par cette lentille. La maintenance reste limitée aux versions, tests avant publication et courte note pour rétablir un couple compatible en préservant les inscriptions. Aucun menu, service, automatisme ou mode opératoire lourd de rollback/relance n’est ajouté. Aucun GO d’essai, de développement, de commit, de fusion ou de livraison n’est établi.
