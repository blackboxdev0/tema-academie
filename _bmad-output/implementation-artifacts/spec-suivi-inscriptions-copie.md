---
title: 'Suivi des inscriptions par formation et session dans la copie'
type: 'feature'
created: '2026-11-04'
status: 'done'
baseline_commit: 'e95c5025409d4395956db366ddf960418785c26f'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Intention validée par le GO explicite de Sofiane dans le chat">

## Intent

**Problème :** l’onglet Inscriptions expose d’abord les champs techniques. Le client ne voit pas rapidement qui participe à quelle formation et à quelle session.

**Approche :** créer dans la copie une vue de consultation par logiciel, formation et session, avec participants, compteurs et filtres. Sofiane regarde le rendu avant toute action de gestion.

## Boundaries & Constraints

**Toujours :** copie privée `10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8` uniquement. Une seule table source Inscriptions, 29 colonnes et IDs conservés. Jointures par ID cohorte/formation. Couleurs DIV #FF008F, DIMO #365AA7, MOOV #176C68. Fuseau America/Toronto. Historique, inscriptions annulées et instantanés conservés. Aucune donnée personnelle dans Git ou le site.

**Jamais :** modifier le classeur actuel ou PROD, connecter le site, créer une inscription pour tester, envoyer un courriel, installer un déclencheur, déployer, annuler/modifier/exporter un participant depuis la vue, commiter ou pousser.

## I/O & Edge-Case Matrix

| Scénario | Entrée | Sortie attendue | Erreur |
|---|---|---|---|
| Session avec participants | Confirmées et annulées liées au même ID | Groupe formation puis date, lignes nominatives, statuts français et état courriel distinct | État inconnu affiché À vérifier |
| Session vide | Date programmée sans inscription | Session visible et zéro inscrit | Capacité absente ≠ zéro place |
| Filtres | Période, logiciel, formation, statut et recherche | Vue recalculée, à venir par défaut, toutes/passées disponibles | Choix devenu absent réinitialisé explicitement |
| Capacité | Recherche ou masquage de participants | Compteurs calculés sur toutes les confirmations de chaque session affichée | Dépassement signalé, jamais annulation |
| Historique | Cohorte/formation supprimée ou conditions modifiées | Inscription toujours accessible, identité/date historique et note d’écart | Groupe historique si référence absente |
| Texte malveillant | Nom/titre commençant par =,+,-,@ | Texte inerte dans Sheets | Aucune formule créée |
| Reprise | Actualisation répétée, filtre édité rapidement, autre classeur | Vue remplaçable sans toucher aux sources ; dernière sélection prise en compte ; garde ID | Erreur visible, aucun compteur trompeur |

</frozen-after-approval>

## Code Map

- `app/experiments/admin-sheet-prototype.gs` : `records` ignore les bandeaux logiciels, `confirmedCounts` utilise confirmee, onOpen/onEdit existants. Ne pas lancer la synchronisation métier lors d’un simple filtre.
- `app/experiments/admin-sheet-actions.gs` : commandes validées et verrou existant. Les écritures programmatiques ne déclenchent pas onEdit ; brancher explicitement la vue après ajout si elle existe.
- `app/experiments/build-admin-sheet-actions.cjs` : bundle privé de la seule copie, HTML/images existants à conserver.
- `app/apps-script/engine.js` : contrat des en-têtes, instantanés JSON et états mail ; lecture de référence seulement, aucune modification produit.
- `docs/project/acceptance/admin-sheet-buttons-2026-11-04.md` : état natif antérieur et limites de concurrence connues.

## Tasks & Acceptance

**Exécution :**
- [x] `app/experiments/admin-sheet-registrations.gs` : projection pure des sources, sélection et rendu natif dans Suivi des inscriptions, garde cible et branche filtres.
- [x] `app/experiments/admin-sheet-registrations.test.cjs` : jointures, compteurs, filtres, historique, dates typées/texte, erreurs, injection et isolation.
- [x] `app/experiments/admin-sheet-prototype.gs`, `admin-sheet-actions.gs`, `build-admin-sheet-actions.cjs` : hooks de rafraîchissement, menu de consultation, bundle conservant les deux formulaires.
- [x] `docs/project/acceptance/admin-sheet-registrations-2026-11-04.md` et contexte : preuves réelles, intégrité des sources, limites et accès de revue.

**Critères d’acceptation :**
- Étant donné la copie existante, quand la vue est installée, alors les valeurs/formules des quatre tables métier restent strictement identiques à la référence native avant modification.
- Étant donné plusieurs sessions et logiciels, quand un filtre est modifié dans Sheets, alors les groupes, participants et compteurs correspondent aux sources et le filtre conserve sa valeur.
- Étant donné les inscriptions historiques existantes, quand Toutes les sessions est choisi, alors aucune inscription n’est perdue et les données techniques restent dans leur table source.
- Étant donné les deux formulaires existants, quand le bundle est mis à jour, alors leurs fonctions/HTML/images restent présents et aucun scope supplémentaire n’est demandé.
- Étant donné le rendu final, quand Sofiane ouvre le lien, alors titre, filtres, couleurs, compteurs, sessions vides et lignes nominatives sont lisibles à 100 %, sans actions de gestion.

## Implementation Notes

- GO déjà donné pour ce périmètre précis. Aucune nouvelle approbation de routine ; reprise sur la branche et les changements existants autorisés, sans commit selon la consigne humaine actuelle.
- Vue dérivée distincte pour ne pas insérer de bandeau dans la table Inscriptions attendue par le moteur. Source masquée après vérification, toujours récupérable par Afficher les feuilles.
- Compteurs globaux portent sur les sessions affichées ; filtres de participants ne réduisent jamais les places occupées. Les états SENT indiquent envoyé, pas reçu.
- Connecteur documentaire sans session Sheets ; accès natif par navigateur. Aucun import d’un nouveau classeur.
- Référence Git : e95c5025409d4395956db366ddf960418785c26f. Autres changements locaux préservés.
- Exécution : l’agent d’implémentation réalise les fichiers et tests locaux ; la racine applique et vérifie ensuite le bundle dans Google. Ne pas ouvrir de navigateur depuis l’agent délégué, pour éviter des opérations concurrentes. Marquer les essais Google comme restant à faire à son retour.
- Disposition native retenue : colonnes B:F (participant, entreprise, courriel, statut, confirmation), marges A/G ; titre B2:F2 ; compteurs en B5:F6 ; cinq filtres en B9:F10 (période, logiciel, formation, statut, recherche libre) ; contexte B12:F12 ; groupes à partir de la ligne15. Bandeaux de formation colorés, sous-bandeau date/horaires/format et compteurs de session, puis table de participants. Largeur totale proche de1100px, police11–12 et texte enveloppé, aucun titre tronqué. Groupes de lignes repliables si réalisables simplement.
- Rendu Apps Script sans formules de projection, protégé avec avertissement et zone filtres accessible ; source Inscriptions masquée uniquement après intégrité vérifiée par la racine. La vue n’est pas une deuxième table éditable. Pas de modification d’Accueil, des images ou des données métier pour ce premier incrément.
- Réalisation et preuves :95tests locaux verts ; projection indépendante de l’export de référence puis sept sélections Google exportées (Dimo, MoovApps, Confirmées, Passées, Test, recherche, Toutes).28formations/12sessions/9inscriptions et quatre tables préservées, zéro formule projetée, HTML/images d’Accueil strictement identiques. Vue gid901030360, source masquée après intégrité. En-tête compact280px après constat natif, réinstallation conserve les filtres. Les groupes fonctionnent mais requièrent l’avertissement natif de feuille protégée ; cette limite est documentée. Rapport docs/project/acceptance/admin-sheet-registrations-2026-11-04.md.
- Clôture technique du prototype : revue à trois couches terminée, corrections de reprise et diagnostics appliquées ;113tests verts, trois mutations de hooks désormais détectées. Code natif canonique16eb6ee9e9c19cb715f6a344443e36f87f332cf5b34baef7508b6b1ba61d8af8 et manifeste identiques au candidat/sauvegarde. Rejeu Dimo puis Tous après correction, état Actualisation et intégrité finale confirmés, filtres remis à À venir/Tous. Derniers filtres11,473/15,802s sous30s mais optimisation à faire avant généralisation. `done` concerne cet incrément fonctionnel dans la copie, pas l’acceptation du rendu, l’intégration site ni la recette globale TEM-27. Aucun commit/push.

## Spec Change Log

## Review Triage Log

- B1 medium → patch : render ne marque pas le chargement avant les lectures/rendu ; les anciens groupes/compteurs restent sous une nouvelle sélection durant3–9s observés. Invalider explicitement les résultats concernés sous verrou et afficher Actualisation.
- B2 medium → patch : la branche tryLock=false écrit B6/B12 sans posséder le verrou, peut écraser une publication concurrente et conserve les compteurs de session anciens. Ne pas muter la projection hors verrou ; rendre explicite que le résultat précédent n’est pas celui des nouveaux filtres durant l’attente.
- B3 medium → patch : les sources sont lues hors de la boucle ; seul le filtre est revérifié après flush. Une confirmation ajoutée pendant flush n’est pas intégrée et refresh retourne true. Relire/revalider avant succès et borner les reprises.
- B4 medium → patch : failure appelle clearBody avant invalidation/diagnostic ; une erreur de nettoyage empêche les deux autres opérations. Récupérations indépendantes et test de nettoyage défaillant.
- B5 low → rejet : une première installation interrompue avant son marqueur laisse un onglet inconnu explicitement refusé, sans écraser de donnée. Installation déjà réussie et réinstallation reconnue testées ; reprise automatique de ce cas rare exigerait de nouvelles gardes d’identité ou suppression. Pas d’extension complexe pour cette anomalie non quotidienne.
- B6 medium → patch : Date.parse accepte24:00 et aucun contrôle fin>début n’est appliqué aux instantanés ; le rendu historique peut inverser les heures. Valider strictement l’intervalle et afficher le diagnostic sans perdre la personne.
- B7 medium → patch : object('{}') est vrai ; champs requis des instantanés formation/lieu non vérifiés. Le diagnostic incomplet doit couvrir ce cas démontré.
- B8 medium → patch : id_inscription vide accepté sans diagnostic alors que l’utilisateur doit pouvoir contrôler l’identité de la ligne. Signaler l’anomalie en conservant le statut métier, les comptes et l’enregistrement source.
- B9 low → rejet : ancienne durée/prix non affichés dans la note d’écart, suggestion réelle de consultation commerciale détaillée. Les anciens champs restent conservés dans la source et aucun prix n’est présenté dans cette vue de participants ; ajout de cette lecture au-delà de l’incrément visuel non retenu.
- B10 low → patch documentaire : le rapport annonce encore la seconde modale en cours au snapshot de revue ; ouverture/lecture/annulation des deux formulaires ont depuis été réellement vérifiées. Actualiser le rapport sans nouvelle donnée.
- E1 medium → patch, même cause queB3 : reproduction indépendante ajoute une confirmée pendant flush ; compte2 publié pour source3. Garde finale insuffisante confirmée dans refresh.
- E2 low → defer : measure-availability lance Chromium après server.listen et avant try/finally. Un échec de lancement laisse le serveur ouvert. Script expérimental d’un chantier antérieur, sans appel depuis le suivi.
- E3 low → defer : même séquence de fuite de serveur dans measure-batchget ; expérience antérieure indépendante et non appelée par ce changement.
- V1 medium → patch de vérification : mutation retirant les trois hooks create/onOpen/onEdit métier garde95tests verts. Ajouter les assertions au point d’usage et les reprises après échec du suivi.
- V2 medium → patch, même cause queB2 : test busy partait d’un corps vide ; une projection existante garde Divalto/2confirmées sous Dimo. Étendre le test avec corps préexistant et vérifier le contrat d’attente explicite et l’absence d’écriture sans verrou.
- Résolutions B1/B2/B3/B4/E1/V2 : pending invalide/masque sous verrou ; busy ne modifie plus la vue et avertit du contexte précédent ; relectures avant/après publication avec deux passes bornées ; récupération indépendante du nettoyage. Tests de sources modifiées pendant rendu/publication, corps préexistant, budget et nettoyage en échec passés.
- Résolutions B6/B7/B8 : validation stricte ISO/intervalle/champs requis et anomalie d’identité, conservation des personnes et du comptage ; tests des reproductions passés.
- Résolutions V1/B10 : quatre tests au point d’usage, mutations de chacun des trois hooks détectées ; deux modales Google réellement ouvertes puis annulées, résultat inscrit dans le rapport.

## Verification

- `node --test app/experiments/admin-sheet-*.test.cjs` : nouvelles assertions et 63 contrôles antérieurs.
- Google réel : installation dans le projet lié de la copie, filtres période/logiciel/formation/statut/recherche, retour à la vue par défaut, groupes repliables, lecture nominale des formulaires.
- Exports XLSX natifs avant/après : comparer exactement valeurs/formules de Formations, Disponibilités, Inscriptions et Paramètres ; zéro formule dans les données projetées et conservation des objets Accueil.
- Capture native finale, vérification du code/manifeste, aucun déploiement ni déclencheur installable.
