# Vérification du découpage V1

26 octobre 2026. Contrôle du document et du suivi, pas une nouvelle exécution de tests produit. Sources : `epics.md`, contrats fonctionnels/UX/architecture, décisions humaines courantes et bilan TEM-6.

## Résultat de la validation native Epics and Stories

- 5 epics orientées résultat utilisateur et 17 stories avec 52 scénarios Given/When/Then, réutilisation, reste à réaliser et moyen de vérification.
- Toutes les dépendances pointent vers une story antérieure ; pas de cycle ni d’attente d’un composant futur pour valider une story. Les liens de navigation des stories2.2/2.3 fixent des destinations contractuelles avant la réalisation de l’écran suivant.
- Catalogue utilisable avant inscription ; gestion des dates avant navigation ; moteur étendu une seule fois. Le partage de fichiers engine/google entre les blocs1/3/4 est intentionnel : trois résultats métier distincts (offre/admission/gestion), contrôle de régression partagé, aucun moteur doublé.
- Le starter neuf n’est pas appliqué : le dépôt contient déjà TEM-6 et son outillage verrouillé. La proposition Vite/clasp de la spine est historique, non installée ; reprendre ces sources est cohérent avec les preuves, sans imposer un remplacement.
- Données et écrans créés seulement lorsqu’utiles à la story ; les quatre onglets déjà existants ne sont ni recréés ni détruits pour correspondre au découpage.
- Cas nominaux, erreurs, confidentialité et reprises présents dans les critères. Suite locale héritée61Node/28E2E indiquée comme preuve TEM-6, pas comme89tests nouveaux de la V1.
-5parents et17enfants dans le workspace Tema, équipeTEM/projetP-TEM-1 ; statuts Backlog, parents et dépendances relus. Aucun champ d’estimation en points attribué, aucune responsabilité client imposée par l’agent.

## Couverture contrôlée

| Inventaire | Nombre | Stories porteuses |
|---|---:|---|
| FR | 30/30 | Toutes affectées ; détail ci-dessous |
| NFR | 14/14 | Toutes affectées ; détail ci-dessous |
| AR | 13/13 | Toutes affectées ; détail ci-dessous |
| UX-DR | 24/24 | Toutes affectées ; détail ci-dessous |
| AC | 21/21 | Toutes affectées ; détail ci-dessous |
| ET | 12/12 | Toutes affectées ; détail ci-dessous |

Le rattachement vérifie une affectation documentaire ; il ne certifie pas une implémentation ou un test réussi. Le contrôle sémantique a notamment conservé capacité par date, réinscription nouvelle ligne, date fermée sans inscrit masquée, priorité terminées, données privées, absence de relance et lien en ligne manuel.

### FR

| Exigence | Stories |
|---|---|
| FR1 | 1.1 |
| FR2 | 1.1, 2.1 |
| FR3 | 2.1, 2.3, 5.1 |
| FR4 | 2.1 |
| FR5 | 2.2 |
| FR6 | 2.3 |
| FR7 | 2.2, 2.3, 5.1 |
| FR8 | 1.2, 2.2, 2.3 |
| FR9 | 1.1, 1.2 |
| FR10 | 1.1 |
| FR11 | 1.2 |
| FR12 | 1.3 |
| FR13 | 3.1 |
| FR14 | 3.1 |
| FR15 | 3.2 |
| FR16 | 3.2, 4.2 |
| FR17 | 3.1, 4.2 |
| FR18 | 3.3, 5.3 |
| FR19 | 3.4, 5.3 |
| FR20 | 3.4, 5.3 |
| FR21 | 4.1 |
| FR22 | 4.2 |
| FR23 | 1.2, 4.1, 4.2 |
| FR24 | 3.1, 3.2, 5.1 |
| FR25 | 3.1, 3.2, 5.1 |
| FR26 | 4.3 |
| FR27 | 4.3 |
| FR28 | 5.3, 5.4 |
| FR29 | 5.2, 5.3 |
| FR30 | 5.4 |

### NFR

| Exigence | Stories |
|---|---|
| NFR1 | 2.1, 2.2, 2.3, 3.1, 5.1, 5.3 |
| NFR2 | 1.2, 1.3, 3.1, 3.2, 3.4, 4.1, 4.2, 5.2 |
| NFR3 | 1.1, 1.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.2 |
| NFR4 | 1.2, 2.2, 2.3, 3.1, 3.3, 5.3 |
| NFR5 | 1.1, 1.2, 2.1, 2.3, 3.1, 3.3, 4.3, 5.1, 5.2, 5.4 |
| NFR6 | 1.3, 2.2, 5.3 |
| NFR7 | 3.1, 3.2, 3.4, 4.1, 4.2 |
| NFR8 | 3.3, 3.4, 5.3 |
| NFR9 | 1.1, 1.3, 3.4, 4.3, 5.2, 5.3, 5.4 |
| NFR10 | 1.1, 1.3, 5.2, 5.4 |
| NFR11 | 3.1 |
| NFR12 | 1.1, 5.2 |
| NFR13 | 1.1, 4.3, 5.4 |
| NFR14 | 5.4 |

### AR

| Exigence | Stories |
|---|---|
| AR1 | 1.1, 1.2, 2.1, 3.1, 3.2, 3.3, 3.4, 4.1, 5.1, 5.2 |
| AR2 | 1.1 |
| AR3 | 1.2, 1.3, 4.1, 4.2 |
| AR4 | 1.3, 2.1, 2.2, 2.3 |
| AR5 | 2.3, 3.1, 3.2, 5.3 |
| AR6 | 1.1, 1.2, 3.1, 3.3, 3.4, 4.3, 5.3, 5.4 |
| AR7 | 1.1 |
| AR8 | 1.1, 5.2 |
| AR9 | 1.3, 3.4, 4.2, 5.2, 5.4 |
| AR10 | 1.1, 1.3 |
| AR11 | 1.3, 5.2, 5.3 |
| AR12 | 4.3, 5.3, 5.4 |
| AR13 | 5.4 |

### UX-DR

| Exigence | Stories |
|---|---|
| UX-DR1 | 2.1, 2.2, 5.1 |
| UX-DR2 | 2.1, 2.2, 5.1 |
| UX-DR3 | 2.1, 2.3, 5.1 |
| UX-DR4 | 2.3, 5.1 |
| UX-DR5 | 2.2, 2.3, 5.1 |
| UX-DR6 | 2.2, 2.3, 5.1 |
| UX-DR7 | 2.3, 5.1 |
| UX-DR8 | 1.2, 2.1, 2.2, 2.3, 4.1, 5.1 |
| UX-DR9 | 3.1, 3.2, 5.1, 5.3 |
| UX-DR10 | 3.1, 3.2, 5.1 |
| UX-DR11 | 3.1, 5.1 |
| UX-DR12 | 2.3, 3.1, 3.2, 5.1 |
| UX-DR13 | 3.2, 3.4, 4.2, 5.1, 5.2, 5.3 |
| UX-DR14 | 2.3, 3.1, 3.2, 3.3, 3.4, 4.2, 5.1, 5.3 |
| UX-DR15 | 3.3, 3.4, 5.3 |
| UX-DR16 | 3.3, 3.4, 4.2, 5.3 |
| UX-DR17 | 1.1, 1.2, 1.3, 3.4, 4.1, 4.2, 4.3, 5.2, 5.3 |
| UX-DR18 | 4.1, 4.2, 4.3, 5.2, 5.3, 5.4 |
| UX-DR19 | 3.1, 4.3, 5.1, 5.4 |
| UX-DR20 | 2.1, 5.1 |
| UX-DR21 | 2.1, 2.2, 2.3, 5.1 |
| UX-DR22 | 2.2, 5.1, 5.3 |
| UX-DR23 | 2.1, 2.2, 2.3, 3.2, 5.1 |
| UX-DR24 | 5.1 |

### AC-

| Exigence | Stories |
|---|---|
| AC-01 | 1.1, 2.1, 5.2, 5.3 |
| AC-02 | 1.1, 1.2, 2.1, 2.2, 2.3, 4.1, 5.2, 5.3 |
| AC-03 | 2.1, 2.2, 2.3, 5.1, 5.2, 5.3 |
| AC-04 | 1.3, 5.2, 5.3 |
| AC-05 | 1.1, 1.2, 1.3, 5.2, 5.3 |
| AC-06 | 3.1, 5.2, 5.3 |
| AC-07 | 3.1, 5.2, 5.3 |
| AC-08 | 3.2, 3.4, 5.2, 5.3 |
| AC-09 | 3.1, 3.2, 4.1, 5.2, 5.3 |
| AC-10 | 3.3, 5.2, 5.3 |
| AC-11 | 3.3, 5.2, 5.3 |
| AC-12 | 3.4, 4.2, 5.2, 5.3 |
| AC-13 | 1.2, 1.3, 3.2, 3.4, 4.1, 4.2, 5.2, 5.3 |
| AC-14 | 1.1, 2.1, 2.3, 3.1, 3.3, 4.3, 5.1, 5.2, 5.3 |
| AC-15 | 3.1, 3.3, 5.2, 5.3 |
| AC-16 | 1.2, 2.2, 3.1, 4.2, 5.2, 5.3 |
| AC-17 | 3.2, 3.4, 5.1, 5.2, 5.3 |
| AC-18 | 2.1, 2.2, 2.3, 3.1, 3.2, 5.1, 5.2, 5.3 |
| AC-19 | 4.3, 5.2, 5.3, 5.4 |
| AC-20 | 4.3, 5.2, 5.3, 5.4 |
| AC-21 | 1.1, 1.3, 5.2, 5.3, 5.4 |

### ET-

| Exigence | Stories |
|---|---|
| ET-01 | 2.1, 2.2, 2.3, 3.1, 5.2, 5.3 |
| ET-02 | 3.1, 5.2, 5.3 |
| ET-03 | 3.2, 3.4, 4.1, 5.2, 5.3 |
| ET-04 | 3.1, 5.2, 5.3 |
| ET-05 | 1.2, 3.1, 3.2, 4.2, 5.2, 5.3 |
| ET-06 | 3.3, 5.2, 5.3 |
| ET-07 | 3.3, 5.2, 5.3 |
| ET-08 | 3.4, 4.2, 5.2, 5.3 |
| ET-09 | 1.1, 1.2, 1.3, 2.2, 2.3, 4.1, 4.2, 4.3, 5.2, 5.3 |
| ET-10 | 1.1, 1.2, 2.1, 2.3, 3.1, 3.3, 4.3, 5.1, 5.2, 5.3 |
| ET-11 | 2.1, 2.2, 2.3, 3.1, 3.2, 5.1, 5.2, 5.3 |
| ET-12 | 5.2, 5.3, 5.4 |

## État de validation

Vérification structurelle terminée ; document **draft** en attente de la revue finale demandée par Sofiane. Les continuations intermédiaires ont été déléguées par sa demande explicite d’avancer sans question à chaque étape. Cette délégation ne fabrique pas une approbation détaillée, une acceptation des tests incomplets ou un GO principal.

Aucun test applicatif n’a été relancé pour ces seuls documents. La dernière relance connue du checkpoint précédent reste61Node/28Playwright/build réussis, réseau Google simulé.
