# Revue adversariale — architecture Tema Académie V1

Date : 26 octobre 2026. Lentille configurée du Reviewer Gate natif de `bmad-architecture` : construire deux unités aval qui respectent les AD mais choisissent des contrats incompatibles.

## Verdict

**PASS après corrections documentaires vérifiées — aucun constat ouvert dans cette lentille.** La première lecture avait relevé deux précisions de contrat, une de sévérité haute et une de sévérité moyenne ; les paires incompatibles et leurs correctifs sont conservés ci-dessous pour la traçabilité du gate. Le moteur unique, l’admission sous verrou, la reprise et les limites des envois sont cohérents avec les arbitrages reçus. Les corrections concernent les représentations partagées entre unités, sans capacité nouvelle, commande humaine supplémentaire ou infrastructure à ajouter.

La revue porte sur la spine figée fournie au gate, non sur une application réalisée. Aucun code produit, essai Google, commit, changement Linear ou modification de la spine n’a été effectué par cette revue.

## Périmètre et état de référence

- `ARCHITECTURE-SPINE.md`, AD-1 à AD-11, SHA-256 `345057b5902931bba6ac36e32647c7fdb81e58755c9127f8a7ee45cc1e394a64`.
- `contrat-donnees.md` lu au gate, SHA-256 `1167f8031b58093fd9f032230db2bf5ed008f079ed267a6003a4038cbacac253`.
- Compléments : `SPEC.md`, `regles-et-acceptation.md`, `strategie-tests.md`, `plan-essai-technique.md`, `EXPERIENCE.md`, journal d’architecture et contexte courant du dépôt.
- Les deltas explicitement transmis au gate sont pris en compte : suppression de `publie`, admission immédiatement après les derniers contrôles frais, relecture publique toutes les trente secondes, réparation minute candidate et distinction principes adoptés/mécanismes proposés. Leur ancienne formulation dans une entrée en cours de synchronisation n’est pas un constat adversarial.
- Le champ interne nullable `places_par_defaut`, annoncé comme correction par le rédacteur Spec pendant cette revue, est traité comme réconciliation connue. Son ancienne absence n’ajoute pas un troisième blocage ; la clôture vérifiera simplement son rendu effectif.

Les références de lignes ci-dessous désignent les versions lues, identifiées par les empreintes ci-dessus. Les correctifs sont proposés au parent ; ils ne sont pas appliqués par le reviewer.

## H-1 — Haute : représentation des instantanés privés non contractée

**Frontière :** CAP-4, producteur des inscriptions, vers CAP-5, consommateur MailApp/ICS ; AD-3/4/5.

**Preuve :** AD-3, ligne 74, renvoie au contrat pour les en-têtes/types et demande de conserver les instantanés. AD-4, ligne 80, fait écrire les conditions admises. Le tableau Inscriptions du contrat, lignes 65–73, nomme `formation_snapshot`, `debut_snapshot`, `fin_snapshot`, `lieu_snapshot` mais ne fixe pas la forme ni les champs des deux instantanés composites. Les règles de révision et d’empreinte sont plus précises ; elles ne définissent pas cette représentation consommée par l’envoi.

### Paire concrète conforme mais incompatible

Unité A, service d’inscription : elle conserve toutes les valeurs acceptées dans des tableaux JSON, protégés et immuables, dans les cellules d’instantané :

```json
{
  "formation_snapshot": "[\"DIV-ERG-001\",\"Ergonomie\",\"Demi-journée\",450,\"À partir de\"]",
  "debut_snapshot": "2026-11-03T14:00:00Z",
  "fin_snapshot": "2026-11-03T17:00:00Z",
  "lieu_snapshot": "[\"en_ligne\",null,null]"
}
```

Unité B, générateur de courriel et d’invitation : elle attend des objets JSON dans ces mêmes cellules :

```json
{
  "formation_snapshot": "{\"id\":\"DIV-ERG-001\",\"titre\":\"Ergonomie\",\"duree\":\"Demi-journée\",\"prix\":450,\"prix_qualificatif\":\"À partir de\"}",
  "lieu_snapshot": "{\"mode\":\"en_ligne\",\"adresse_presentiel\":null,\"lien_visio\":null}"
}
```

Les deux unités utilisent les mêmes noms de colonne, des données privées, les valeurs au point d’admission, des instants UTC et un snapshot inchangé après replanification. Elles peuvent réutiliser la logique commune de validation/révision et satisfaire chacune ses tests locaux. Aucun AD ne permet de choisir entre ces deux formes.

À l’assemblage, B lit `snapshot.titre` et `snapshot.mode` sur les tableaux de A : valeur absente, contenu incomplet ou génération en erreur. Le nombre de places reste correct, mais la confirmation et le fichier ICS ne disposent plus du contrat nécessaire pour reprendre la session réservée. Un test d’intégration trouverait le défaut ; le rôle du spine est d’empêcher que les deux unités arrivent avec des représentations incompatibles.

### Correctif minimal — autofix documentaire

Compléter le contrat privé lié par AD-3 avec **une seule représentation V1**, puis lier producteur et consommateur à celle-ci. Une solution suffisante est : objets JSON sérialisés dans les cellules composites ; clés/types explicitement fixés pour formation et lieu ; dates UTC pour début/fin ; `null` explicite pour l’information non disponible. Nommer notamment les conditions déjà acceptées dont titre, durée, tarif/qualificatif et mode. Distinguer l’adresse présentielle du lien privé et fixer quel instant pratique le lien stocké représente.

Le contrat doit aussi dire que Mail/ICS décodent cette forme commune par ID d’inscription et ne reconstruisent pas les conditions historiques depuis la ligne actuelle de Disponibilités. La relecture courante d’éligibilité/révision avant engagement reste celle d’AD-5. Aucun de ces champs privés n’est ajouté au reçu ou à la projection publique.

**Vérification de clôture :** une fixture partagée, produite par l’écriture d’inscription puis consommée sans conversion particulière par le générateur Mail/ICS, couvre présentiel, en ligne avec lien et en ligne sans lien. Une replanification ne modifie pas le snapshot enregistré. Cette vérification appartient au futur développement autorisé ; aucun essai réel n’est nécessaire pour préciser le schéma maintenant.

## M-1 — Moyenne : la référence logiciel n’est pas fixée entre Paramètres, Formations et projection

**Frontière :** CAP-3, liste administrable du Sheet et import, vers CAP-1/2, projection et filtres ; AD-3/7/8.

**Preuve :** AD-3, ligne 74, introduit un identifiant logiciel stable de Paramètres et un libellé renommable. Le contrat Formations, ligne 28, décrit `logiciel` comme choix de la liste Divalto/Dimo/MoovApps. La projection, lignes 104–108, possède `softwares[].id`, `softwares[].label` et `formations[].logiciel`, sans dire si ce dernier contient l’ID ou le libellé. La liaison `sessions[].formation = formations[].id` est explicitée ligne 112 ; aucun équivalent n’est donné pour le logiciel.

### Paire concrète conforme mais incompatible

Unité A, adaptateur Sheet/projection, expose la valeur humaine de la liste native :

```json
{
  "softwares": [{"id":"DIV","label":"Divalto","color":null}],
  "formations": [{"id":"DIV-ERG-001","logiciel":"Divalto"}]
}
```

Unité B, catalogue/calendrier, construit le choix du filtre depuis `softwares[]`, garde l’ID stable `DIV` comme valeur de sélection et filtre par `formation.logiciel === selectedSoftwareId`. Ce choix est compatible avec l’ID stable demandé par AD-3 ; A respecte le champ textuel et la liste de noms décrits au contrat.

Le filtre Divalto ne trouve alors aucune formation. Après renommage d’un libellé Paramètres, une résolution fondée seulement sur le nom peut aussi perdre une liaison ou en déduire une autre. Les IDs des formations et des cohortes restent corrects : aucune autre règle existante ne ferme cette divergence.

### Correctif minimal — autofix documentaire

Retenir la présentation native proposée pendant le gate, sans supposer une valeur cachée distincte du libellé dans une liste Google Sheets :

1. Chaque logiciel Paramètres possède un ID stable unique et un libellé. Les logiciels initiaux peuvent porter les IDs `DIV`, `DIMO`, `MOOV`. Un ajout reçoit son ID automatiquement ; un renommage ne le réattribue pas.
2. La cellule `Formations.logiciel` utilise une vraie liste de textes `ID — Libellé`, par exemple `DIV — Divalto`, selon le même principe que la sélection code/titre des formations.
3. L’ID avant le premier séparateur exact ` — ` est la référence autoritaire ; les IDs ne contiennent pas ce séparateur. Le service commun valide son existence/unicité dans Paramètres. Une référence inconnue ou ambiguë produit un diagnostic isolé, sans rapprochement deviné par le nom.
4. Renommer le libellé Paramètres conserve l’ID porté par les cellules existantes ; le service commun rafraîchit leur suffixe d’affichage et la liste. Une ancienne étiquette encore présente ne déplace pas la formation vers un autre logiciel. Édition, import et réparation utilisent cette même règle.
5. La projection fixe explicitement `formations[].logiciel = softwares[].id`. Le site affiche `softwares[].label` après résolution par ID et utilise l’ID pour ses filtres et couleurs.

Ce correctif n’ajoute ni colonne technique au Sheet, ni procédure de renommage à Tema, ni widget de sélection particulier. Divalto, Dimo et MoovApps restent les noms affichés publiquement.

**Vérification de clôture :** une fixture partagée démontre le filtre de chaque logiciel, puis le renommage d’un libellé sans changement d’ID ni perte de formation/session. Une référence inconnue ou un ID dupliqué reste isolé et diagnostiqué.

## Surfaces attaquées sans constat supplémentaire

| Surface | Conclusion de cette lentille |
|---|---|
| Propriété des inscriptions | AD-2/9 attribuent les mutations applicatives à un seul projet et fixent l’environnement côté serveur. L’annulation manuelle est explicitement portée par le statut Sheet ; ce second accès humain est assumé. |
| Dernière place et admission | AD-4 impose le verrou effectivement acquis, la relecture prioritaire des demandes et les derniers contrôles frais. La fermeture humaine postérieure à l’admission laisse terminer la demande ; le simple formulaire ne réserve rien. |
| Éditions humaines | Le verrou n’est pas présenté comme une transaction avec Google Sheets UI. L’absence de cette transaction globale n’est pas un défaut à combler par un menu ou un gel métier nouveau. |
| Courriels et interruption | Claim initial, envoi hors verrou, résultat certain/incertain, blocage/suppression avant engagement, puis suivi Gmail sont définis. `PENDING` non traité et `SENDING` non abouti peuvent rester une limite privée ; aucun délai, renvoi ou surveillant n’est requis par la revue. |
| Rejeu et résultat inconnu | Clé/contenu conservés, recherche avant contrôles mutables, conflit sans reçu et annulation non réactivée sont fixés. Le reçu minimal ne publie pas de coordonnées. La conservation limitée à la page ouverte est déjà annoncée. |
| Visibilité | Les règles fermée avec/sans confirmé, `closed` prioritaire à `full`, formation active sans date et exclusion des annulations sont cohérentes en prenant les deltas réconciliés fournis au gate. |
| Transport et fréquence | La preuve navigateur, les limites de quota et la cible de fraîcheur restent des essais bloquants à leur jalon. Leur absence de preuve dans un dossier avant essai ne constitue pas un contrat contradictoire. |
| Confidentialité | La liste blanche publique, les textes inertes et l’absence de secret client sont définis. La fuite d’existence liée à `DUPLICATE` est explicitement déclarée ; cette revue n’invente pas un objectif de masquage complet. |
| Déploiement et maintenance | TEST séparé, projet métier durable, versions publiques et compatibilité avec HEAD des triggers sont fixés. La note minimale de reprise ne restaure pas le Sheet. Une procédure d’exploitation supplémentaire n’est pas nécessaire pour fermer les deux constats. |
| Tests | Le même code métier, la suite déterministe, les contrôles avant push/CI et les preuves Google réelles distinctes sont contractés. Les fixtures partagées proposées ci-dessus précisent deux assertions ; elles ne changent pas l’organisation retenue. |

## Vérification ciblée des correctifs — 26 octobre 2026

À la demande du parent, relecture limitée aux passages corrigés, sans nouvelle revue complète ni modification des contrats par ce reviewer.

Références relues :

- Spine corrigée : SHA-256 `f1a857b804ff36b799b0ad81ebc8a9e43a75e3bcb4c4a74b236f34b852837bca`.
- Contrat corrigé : SHA-256 `00afd47f261464fe29c7ebe82d805e0ebebd808255d1c5f50a5af27334804a0d`.

| Constat | Correctif effectivement relu | Résultat documentaire |
|---|---|---|
| H-1 — instantanés | Contrat ligne 81 : objets JSON textuels et clés/types de `formation_snapshot` et `lieu_snapshot`, dates UTC, règles `null`, valeurs à l’admission, lecture par Mail/ICS et absence du reçu public. AD-3 lie explicitement les deux consommateurs à ces shapes. | **CLOS** : les tableaux JSON de l’unité A ne sont désormais plus une implémentation conforme ; les deux unités doivent utiliser les objets typés fixés. Le premier lien ajouté après admission reste un suivi manuel, donc la provenance de la valeur pratique est fixée. |
| M-1 — logiciels | Contrat lignes 42–46 : IDs stables, normalisation et collision, cellule native `ID — Libellé`, extraction du premier séparateur exact, référence unique, import unique et projection `formations[].logiciel = softwares[].id`. AD-3 porte les mêmes règles. | **CLOS** : l’unité A ne peut plus exposer `Divalto` comme référence lorsque l’ID est `DIV`. Le suffixe d’affichage renommé ne remplace pas la référence portée par la cellule. Aucune valeur cachée ou colonne additionnelle n’est présumée. |
| Réconciliation capacité indicative | Contrat ligne 34 : `places_par_defaut`, entier positif nullable, interne, préremplissage d’une nouvelle date seulement ; aucun plafond ni lien dynamique sur les dates existantes. | Rendu annoncé constaté ; aucun blocage supplémentaire. |

Ces lectures démontrent la fermeture des divergences **dans le contrat**. Les fixtures partagées et les preuves Google réelles restent à produire dans leurs futurs périmètres autorisés ; elles ne sont pas annoncées comme exécutées par ce PASS.

## Sortie du reviewer

Les deux correctifs techniques délégués sont écrits, liés depuis AD-3 et relus : **aucun constat adversarial restant**. La clôture du gate documentaire ne donne aucun GO d’essai, développement, commit ou livraison.
