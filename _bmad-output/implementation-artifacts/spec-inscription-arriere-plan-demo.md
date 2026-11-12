---
title: Inscription durable et courriels indépendants du navigateur
created: '2026-11-12'
status: done
route: dispatch
baseline_commit: e95c5025409d4395956db366ddf960418785c26f
review_loop_iteration: 1
context: []
---
<frozen-after-approval>
## Intent
Sofiane autorise explicitement la correction pendant la recette du12novembre : le serveur doit enregistrer la réservation puis répondre sans attendre les courriels ni les calculs dérivés. Un traitement planifié poursuit les envois après fermeture du navigateur. La transmission initiale avant réception serveur reste une limite expliquée, sans fausse garantie. Incident réel : POST Google terminé en66,963s contre45s côté client, ligne confirmée, participant PENDING et Tema SENT.

## Boundaries & Constraints
Toujours : conserver la source dans Inscriptions, états existants et garanties de réservation. Réutiliser le déclencheur propriétaire minute existant, pas de nouvelle table/base. Conserver budgets consommés, plafonds13/26, protections mode démo, nom Tema sans marqueurs et couleurs. Le replay vérifie sans renvoyer. MailApp hors ScriptLock. Éligibilité explicite par date d’activation privée et liste privée d’IDs de récupération autorisés, pour ne jamais expédier le stock historique de tests. Aucune purge, reset, émission aveugle ou changement Vercel/Git. La bascule Google est autorisée pour ce correctif dans la démo ; préparer sauvegarde, retour version10 et preuves. Seul le participant PENDING de l’incident sera récupérable explicitement ; pas de nouveau mail Tema pour son canal SENT.

Jamais : remettre automatiquement SENDING/UNKNOWN/FAILED/BLOCKED à PENDING ; réessayer une tentative ambiguë peut doubler un courriel. Ne pas modifier le moteur historique TEST pour déplacer son API submit, ni les données humaines en cours de recette.

## I/O & Edge-Case Matrix
| Situation | Résultat attendu |
|---|---|
| Nouvelle admission asynchrone activée | Ligne durable/flushée et états PENDING ; réponse RECORDED sans MailApp, compteur ou vue synchrone |
| Fenêtre fermée après admission | Appel minute autonome traite la ligne et met à jour les états, sans visite navigateur |
| Replay et concurrence | Même réservation, aucune émission par replay ; claims atomiques empêchent deux envois par canal |
| Canal participant PENDING, Tema SENT | Participant traité une fois, Tema et son budget inchangés |
| Vue propre ou réconciliation en erreur | Le worker est exécuté avant les retours anticipés et sa tentative ne dépend pas du rendu de vue |
| Anciennes lignes de recette | Aucun envoi sauf ID explicitement autorisé, sans recopier les données métier |
| Annulation avant envoi | Canaux PENDING supprimés sans envoi ; autres états conservés |
| Interruption après claim/acceptation | SENDING/UNKNOWN restent sans retry aveugle ; diagnostic de suivi disponible |
| Budget/quota/format invalides | Aucun dépassement, état existant de blocage conservé, pas de reset |
| Plusieurs lignes, échec persistant | Lot borné et curseur de rotation ; une ligne défaillante ne bloque pas toutes les suivantes |
| Compteurs différés | Réparation minute ; capacité publique et dernière place restent calculées depuis les inscriptions confirmées |
| Fonction désactivée ou configuration invalide | Absent : voie synchrone actuelle conservée pour retour ; invalide : échec fermé avant nouvelle admission |
</frozen-after-approval>

## Code Map
- app/experiments/copy-backend.gs : doPost choisit register en mode async validé, conserve submit absent et journalise phase/code seulement ; store différé invalide par propriétés sans B12. Worker minute avant réconciliation. Empreinte administrative séparée hors inscriptions/courriels/compteurs/diagnostics, compteurs natifs groupés sous verrou et acquittement de vue avec contrôles hors verrou puis section critique de propriétés.
- app/apps-script/engine.js : register enregistre sous verrou et flush ; notify traite uniquement PENDING avec revendication durable SENDING + budget avant MailApp. Réutiliser ces méthodes, ne pas exposer de nouvelle route HTTP administrative.
- app/experiments/copy-helpers.cjs : harness réel des modules avec horloge/verrous/propriétés ; mode restricted des fixtures par défaut, activation privée en tests et distinction des décorations sans écriture métier.
- app/experiments/admin-sheet-prototype.gs : sync métier sous ScriptLock ; listes/notes groupées hors ScriptLock sous verrou de rendu et contrôle d’empreinte avant/après. COPY onOpen ne synchronise plus systématiquement ; onEdit Inscriptions marque les compteurs en attente sans synchronisation administrative.
- app/experiments/admin-sheet-registrations.test.cjs : notes de fixture isolées par onglet comme Google, pour ne pas écraser artificiellement le marqueur de la vue avec une note de session.
- app/experiments/copy-backend.test.cjs et nouveau test proportionné si utile : vérifier matrice ci-dessus avec vraies fonctions doPost/wrapper minute dans le harness.
- app/web/app.js : écran processing et confirmation séparés déjà en place ; message PENDING ne doit pas prétendre un envoi reçu. Aucun changement UI nécessaire sauf défaut prouvé.

## Tasks & Acceptance
- [x] Ajouter une configuration privée d’activation validée (horodatage en ms, IDs de récupération explicites, curseur), absente par défaut ; aucun état métier dupliqué.
- [x] Séparer le chemin doPost activé : register uniquement, dirty sans rendu, compteurs marqués en attente ; préserver voie de retour synchrone inactive.
- [x] Ajouter worker autonome borné sur PENDING éligibles, rotation, suppression sûre si annulé, appels notify sans verrou externe et isolation des erreurs du rendu.
- [x] Exécuter les tests de chaque ligne de matrice et les suites moteur/COPY/build/sécurité ; vérifier capacité avant/après réparation et absence d’envoi historique.
- [x] Préparer les fichiers pour activation Google propriétaire après revue, sans les activer depuis le sous-agent ; le pilote vérifiera les effets réels, la fermeture de page et le cas incident.

Critères : Given une admission acceptée en mode activé, when la page disparaît, then le worker sans navigateur peut terminer les canaux PENDING. Given un canal déjà SENT ou ambigu, when le worker repasse, then il ne réémet pas. Given la dernière place et compteur pas encore réparé, when une autre admission arrive, then elle est refusée. Given un vieux stock de tests, when on active la fonction, then seuls nouveaux horodatages et IDs explicitement autorisés sont traités. Given une projection défaillante, when le déclencheur minute tourne, then les mails éligibles sont tentés indépendamment.

## Implementation Notes
GO déjà donné, pas de nouvelle demande de cadrage. Implémenter seulement les fichiers indiqués ; préserver les autres modifications du worktree. Ne pas déployer, envoyer de courriel réel ou écrire Google depuis le sous-agent. Les316tests navigateur de la tranche précédente sont terminés :308réussis/8contrastes connus du rose initial, aucun autre échec. Les tests courriels/serveur réels restent distincts des simulations.

## Review Triage Log
- medium/defer : notify/dataView valide globalement les identifiants et états d’inscriptions. Une corruption manuelle d’une autre ligne peut bloquer les notifications, mais ce contrôle strict existait avant cette tranche pour catalogue/admission/notification. Conserver l’échec fermé plutôt qu’envoyer sur une source structurellement corrompue ; le problème réel observé possède au contraire une source valide et un canal Tema envoyé. Le test de snapshot malformé prouve seulement la rotation face à une erreur d’envoi locale, pas la tolérance à une corruption globale.
- medium/patch : exception du worker empêche toute réconciliation ; isoler les deux traitements et vérifier un échec de worker avec projection encore exécutée.
- medium/patch : allowance commence après sélection et ne borne pas le démarrage du second canal ; inclure sélection et vérifier l’autorisation de commencer un canal, sans interrompre une tentative déjà revendiquée.
- medium/patch : dirty(true) consomme le drapeau de publication B12 sans écrire ; rendre l’invalidation limitée aux propriétés distincte du diagnostic publié, avec preuve d’échec de projection.
- medium/patch documentation : suppression de configuration fournit un retour synchrone, mais ne termine pas les PENDING admis auparavant. Documenter drain/récupération manuelle et conserver configuration/cutoff/budgets ; test explicite de désactivation/replay.
- medium/patch (verification-gap) : le retrait en mémoire du test de temps40s laissait toute la suite verte. Ajouter avancement déterministe de l’horloge pendant le travail et démontrer arrêt puis reprise sur passage suivant.
- Edge-case hunter : aucun constat supplémentaire.

Revue corrigée : isolation worker→projection, budget depuis la sélection et avant chaque nouveau canal, drapeau de diagnostic réellement publié, procédure de retour préservant la file. Vérification pilote :132standard/265COPY,9artefacts,21audit+2VM et24browserciblés réussis. Le test navigateur ferme réellement sa page avant d’appeler le worker dans le harness ; preuve simulée, à distinguer de la validation Google qui suit. Candidat canonique330d605aed5ca7fefa1d2734776c7039748021a769f44c451c7425757f0f2f81, backup Google10 et manifeste relus identiques.


### Correctif de contention pendant la recette v11

Incident observé : POST d’admission sans ligne créée après6,143s et chevauchement avec minute job de55,7s. Contention ScriptLock probable, pas une cause Google démontrée par ces seules durées. Le canal participant de l’incident précédent a été réellement marqué SENT ; ce fait n’autorise aucun renvoi et ne vaut pas réception utilisateur.

GO Sofiane transmis par le pilote pour ce complément du correctif async. Le chemin minute ne relance désormais l’administration complète que si l’empreinte privée des champs métier Formations/Disponibilités diffère de celle acquittée après synchronisation. Inscriptions, états mail, places restantes et diagnostics dérivés sont exclus de cette empreinte ; une empreinte initiale absente impose une première synchronisation. L’audit périodique existant détecte les modifications humaines dont l’événement a été manqué. Aucun état métier n’est recopié dans les propriétés.

La section ScriptLock de sync conserve les lectures/validations et écritures métier ; les listes et notes sont ensuite calculées déjà en mémoire, groupées et écrites sous verrou de rendu, avec comparaison d’empreinte avant et après. Une décoration sur source modifiée ne s’acquitte pas. Les compteurs natifs lisent seulement Disponibilités/Inscriptions sous le verrou partagé, ignorent les valeurs déjà correctes et regroupent les lignes adjacentes modifiées sans toucher aux autres cellules. Le signal pending n’est effacé qu’après flush réussi. La dernière place demeure calculée depuis les inscriptions confirmées sous verrou d’admission.

L’acquittement de vue vérifie les sources et la sélection avant et après sa section critique, qui conserve uniquement versions/drapeaux/propriétés. Une relecture échouée ou modifiée invalide l’acquittement avant retour. Les éditions humaines Google ne respectent jamais ScriptLock : les contrôles de version, empreinte, relecture et audit restent nécessaires ; aucun verrou instantané absolu contre leur saisie n’est revendiqué. Les lectures/écritures métier indispensables à une vraie modification administrative ou admission peuvent encore prendre plusieurs secondes. Aucune durée réelle améliorée ni résolution définitive de la contention n’est annoncée avant mesure Google.

COPY onOpen garde menus et rendu sans sync administratif systématique. onEdit Inscriptions invalide et marque les compteurs pour réparation minute sans refaire listes/notes. Les autres événements administratifs gardent leur synchronisation. POST écrit uniquement un diagnostic de phase/code (aucun UUID, coordonnées ou contenu de commande) et conserve request_id dans le reçu UNAVAILABLE après décodage. Aucun retry ambigu ajouté.

Validation locale ciblée :205tests des modules outbox/backend COPY/prototype/suivi réussis. Sept régressions supplémentaires couvrent les vraies fonctions minute/onOpen/onEdit, le rattrapage métier et compteurs après événement manqué, une admission pendant les décorations, les changements concurrents et lectures d’acquittement échouées, les écritures groupées et diagnostics de POST. Cela reste une simulation Google. Aucun Google, mail réel, commit/push, budget, cutoff, donnée humaine ou couleur modifié par le sous-agent.


## Revue du correctif de contention
- medium/bad_spec : les nombres confirmés et le temps sont des dépendances de plan(), malgré leur exclusion de l’empreinte initiale. Le correctif perd fermeture/diagnostic de surcapacité, récupération après annulation et fermeture des sessions passées. Deux reviewers et une reproduction du harness le confirment.
- false : audit ne réparant pas les compteurs. Le dernier delta marque pending si audit divergent ; test dédié réussi. Conserver ce delta.
- false : absence de dernier contrôle de version dans acknowledge. La source finale contrôle current && version()===v ; premier diff antérieur.
- medium/bad_spec : échec de décoration sur empreinte déjà acquittée peut ne pas être repris. Marquer entretien en attente avant tentative ; reprise minute après liste/note partiellement écrite.
- medium/bad_spec : UserLock distingue les utilisateurs. Réserver la publication des décorations au propriétaire déjà responsable de la vue ; modifications métier conservées, minute propriétaire reprend la présentation. Deux rendus du propriétaire restent sérialisés.
- maybe-false/defer : durée réelle du verrou restante. Les tests locaux ne la mesurent pas ; reprise humaine originale et mesure Google requises, aucune garantie avant preuve.
- medium/patch couverture : injecter échec liste et notes puis vrai wrapper minute ; reprise et acquittement seulement après succès.

## Spec Change Log
- Revue contention, boucle1 : retour aux deux modules Google v11 sauvegardés avant réécriture locale. La décision de repasser plan() doit tenir compte des champs métier, des nombres confirmés par cohorte et du franchissement des débuts de session, sans dépendre des seuls états courriel. Cela peut relancer la validation après admission/annulation ; ne pas rétablir les écritures décoratives sous ScriptLock. Un marqueur privé d’entretien non terminé prime les raccourcis et n’est effacé qu’après publication propriétaire réussie et contrôle de source. Aucun stockage métier dupliqué. Préserver compteurs réparés sur événement manqué et acquittement avant/après verrou court.

KEEP pour réécriture : admission durable async, cutoff/récupération/budgets inchangés, MailApp indépendant, aucune reprise ambiguë ; ouverture sans sync systématique ; groupement compteurs/notes et absence d’écritures inchangées ; décorations hors ScriptLock avec empreinte avant/après ; diagnostics POST phase/code uniquement et UUID conservé dans reçu ; capacité publique sérialisée ; aucune couleur/UI ni opération Google par le développeur. Fichiers privés /Users/sofiane/.config/tema-academie/outbox-20261112/contention-reviewed-* : candidat relu à préserver positivement. Le pilote a restauré copy-backend.gs et admin-sheet-prototype.gs à v11 ; adapter les tests actuels plutôt que les supprimer. Tester surcapacité ajoutée via Inscriptions, annulation récupérant diagnostic, passage à date passée, échec/reprise décoration même empreinte, rendu non propriétaire puis reprise propriétaire et anciens invariants async. Aucune suite navigateur complète sans changement UI.


## Triage de la relecture contention corrigée
- medium/patch : empreinte acquittée relit les inscriptions après le snapshot utilisé par plan ; lier empreinte attendue aux comptes/instant réellement planifiés, comparaison fraîche avant/après décorations conserve pending en cas de divergence.
- medium/patch : nativeCounters peut effacer un pending plus récent après édition native intercalée ; conserver pending si source version modifiée depuis lecture.
- medium/patch : onOpen peut acquitter le hash de vue après édition manquée sans planifier entretien ; marquer vérification administrative en attente avant rendu.
- medium/patch couverture : notes groupées sans lecture des cellules de destination ; vérifier coordonnées, notes effacées et voisines non gérées intactes.
- medium/patch : non-propriétaire perd toast d’erreur calculé quand publication déco est différée ; publier toast avant branche propriétaire.
- medium/defer : déplacement humain de lignes pendant écritures décoratives peut déposer une note/validation sur ancienne coordonnée ; le verrou historique ne bloque pas les modifications humaines Google non plus. Contrôle final + pending conservent la reprise ; aucune garantie transactionnelle vis-à-vis édition humaine.
- medium/defer : audit ne répare pas un dropdown/note supprimé manuellement sans modification métier. Les anciens audits ne comparaient déjà pas ces décorations ; hors correction d’admission, garder réparation administrative explicite.
- low/defer : note historique d’une ligne devenue entièrement vide peut survivre ; ancien plan ne produisait déjà aucune note pour ligne vide.
- maybe-false/defer carried : durée réelle du verrou, toujours à mesurer sur Google, pas d’estimation présentée comme mesure.
- maybe-false/defer : budget du simple onEdit non mesuré en latence Google ; marqueurs pending persistants et minute servent de reprise, contrôle runtime restant distinct du harness instantané.


## Validation Google version12
Candidat canonique a2fdf8f84e6246e5285b8bf5a83927c000e6933ecc2115190fdf5afa577dd4db enregistré puis relu exactement, déploiement existant version12, manifeste inchangé. Une nouvelle inscription de recette : exécution POST3,135s, confirmation observée3,739s ; page fermée avec les deux états PENDING. Le déclencheur minute a ensuite marqué SENT participant et Tema après fermeture, aucun nouvel appel de cette page. La récupération autonome initiale et la nouvelle admission sont donc deux preuves réelles distinctes.

- medium/patch, blocage runtime du suivi : B12 rapporte E45 refusée par ancienne validation Confirmée/Annulée ; clearBody utilise Range.clear sans suppression explicite de validation. Ajouter clearDataValidations sur tout corps géré avant écriture, y compris règles orphelines au-delà de getLastRow après échec. Préserver filtres, protections et sources. Test Google simulé doit conserver validations lors de clear puis les faire respecter par setValues pour reproduire le refus. Activation corrective du même déploiement autorisée par GO de recette complet.


## Résultat technique final
Version14 activée, HEAD natif relu exactement et manifeste inchangé ; candidat canonique38e93d5ea8cf97edf6844b01daa91fc6c3a69c361d029184d1faf3903fe39ea9. Validation réelle détaillée dans docs/project/acceptance/processing-demo-2026-11-12.md. Nouvelle admission durable puis page fermée, les deux tentatives mail démarrent après fermeture et sont SENT ; annulation native depuis le suivi et capacité publique3 restaurée, replay annulé sans renvoi.19anciennes inscriptions intactes, versions du suivi acquittées, drapeaux pending à0. Budget10/19 sur13/26 conservé, ancien stock exclu. Recette utilisateur globale ouverte ; done désigne ce correctif technique, aucun commit/push ni Vercel.

- medium/patch supplémentaire runtime : entretiens concurrents pouvaient invalider leur propre version sans édition réelle. Reproduction dans harness : second wrapper minute pendant rendu propriétaire. Le retry de travail déjà pending ne tourne plus la version ; une vraie édition ou un audit/temps invalidant un checkpoint propre la tourne toujours. Deux tests d’intercalage passent. L’attribution de chaque ancien échec Google à cette cause reste une inférence ; le rendu final et ses propriétés sont vérifiés réels.

## Verification
132standard/288COPY,9artefacts sans skip,21audit+2VM, build/sécurité et diff-check passent.24parcours browser ciblés sur4profils passent ; scénario fermeture simulé distingué de la fermeture réelle IAB ci-dessus. Ancienne matrice complète308PASS/8contrastes connus du rose choisi ; pas de nouvelle matrice complète nécessaire pour des corrections purement serveur. Sources, budget, timings et états mail réels vérifiés par exports/propriétés privées hors dépôt.


Validation humaine : Sofiane confirme rapidité, absence de blocage, refus du doublon d’adresse active et réception des courriels après environ une minute, délai accepté. Autorisation explicite de commit de tous les changements accumulés ; aucune autorisation de push ou Vercel dans cette demande.
