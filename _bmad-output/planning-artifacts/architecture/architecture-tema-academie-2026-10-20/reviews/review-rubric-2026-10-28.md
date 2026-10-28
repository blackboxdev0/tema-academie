# Reviewer Gate — Rubric walker — 28 octobre 2026

**Verdict : PASS pour G0, clôture documentaire permettant la revue UX/UI.** Aucun constat bloquant ou divergence de contrat restante identifié par cette lecture. Ce verdict ne valide ni le code futur, ni les mesures de cadence/charge, ni l’ouverture aux utilisateurs.

## Périmètre indépendant

Lecture du Reviewer Gate natif, de la spine actuelle, du noyau Spec et du contrat de données, du plan/stratégie de tests et du compagnon `docs/project/architecture/controle-technique-v1.md`. Le manifeste et le package applicatifs existants ont été confrontés au seed brownfield. Aucun rapport des autres reviewers du gate du jour n’a été lu pour former ce verdict. Aucun code, service Google ou test de produit exécuté.

La référence examinée est une consolidation encore en état draft : le passage final du frontmatter appartient au parent après assemblage du gate. La partie « verified-current » de la checklist est appréciée selon les affirmations effectivement faites : versions locales observées et lockfile existant, pas une promesse de versions les plus récentes. Les vérifications documentaires détaillées des technologies restent aussi le rôle de la lens dédiée du gate.

## Checklist et invariants

| Dimension | Vérification | Résultat |
|---|---|---|
| Paradigme / frontières | Couches + adaptateurs gérés ; navigateur, moteur, Sheet et envois ont des responsabilités distinctes | Cohérent |
| AD-1 — Dépôt / sorties | Arborescence réelle, build public limité, permissions et jalons séparés ; documents du socle et données privées exclus des sorties | Exécutable et vérifiable |
| AD-2 — Moteur / portabilité | Un moteur V8, Node pour outillage/tests ; aucune dépendance à un serveur Vercel ; liens directs et refresh sans rewrite obligatoire | Ratification brownfield avec obligation future explicite |
| AD-3 — Identités / temps / shapes | IDs immuables, références stables, UTC/Toronto, révisions/instantanés et deux champs d’éligibilité communs | Contrat partagé non ambigu |
| AD-4 — Admission / replay | Recherche de demande avant contrôles mutables, acquisition de verrou, admission fraîche, flush et reprise ; édition humaine distincte du verrou script | Prévention des divergences d’intégrité définie |
| AD-5 — Courriels | Claim sous verrou et envoi hors verrou ; réservation indépendante ; un essai initial par canal, aucune relance automatique ou réception inventée | Cycle et limites d’atomicité explicites |
| AD-6 — Transport | A fondé sur preuve limitée ; aucun succès opaque ; même enveloppe et arbitrage avant repli UX/coût | Preuve ancienne distincte de généralisation future |
| AD-7 — Privé / entrées / rafales | Liste blanche, texte inerte, export Excel contrôlé ; limiteur privé atomique borné après replay, états de refus et d’indisponibilité fixés | Règle testable ; protection déclarée best effort |
| AD-8 — Administration / publication | Activité et ouverture séparées ; visibilité indépendante d’éligibilité ; tri exhaustif y compris open sans prix ; import reprenable ; normale<120s et secours5min distincts | Cible et traitement cohérents avec décisions |
| AD-9 — Environnements / promotion | TEST/Métier distincts, un écrivain par Sheet, destination serveur fixe ; garde TEST conservée ; version web app/HEAD/build alignés ; preview avant recette | Enveloppe opérationnelle couverte |
| AD-10 — Gates / quotas | G0 conception, G1 GO du lot, G2 contrôles avant ouverture réelle hors test, G3 preview autorisée puis recette, G4 requis PASS ou dérogation identifiée ; aucun plafond métier50 ajouté | Pas de boucle de validation ni de waiver général implicite |
| AD-11 — Non-régression | Tests par story, commande locale, CI future dès premier jalon ; simulation, API, navigateur et réception distingués | Obligations et limites de preuve conservées |
| 8 capacités | CAP-1 à CAP-8 reliées à des propriétaires et AD ; guide/remise/conservation ne sont pas perdus au profit du seul moteur | Couverture conservée |
| Deferred | Mesures futures, supports, valeurs client et détails de réalisation ont chacun un jalon ; les décisions partagées prix/visibilité/replay/quotas ne sont pas remises au choix de chaque unité | Aucun invariant partagé silencieusement déféré |
| Technologies / seed | `app/package.json` et manifeste corroborent Node/test runner, Playwright1.64.1, V8/Toronto et scopes ; Vite/clasp non supposés installés ; observé ne signifie pas latest | Aucun remplacement brownfield tacite |

## Vérification des passages sensibles

- Une session `open` avec prix absent conserve sa visibilité mais expose `registration_enabled=false`, motif `price_unconfirmed`. Le groupe2 du tri couvre les dates visibles sans éligibilité ; pas de nouveau statut confondu avec fermeture manuelle. Le serveur refuse la nouvelle admission ; les replays restent prioritaires et n’annulent pas une place existante.
- Les nombres3/30 par fenêtres fixes60s et le budget de45min/jour sont explicitement des paramètres d’ingénierie futurs à éprouver. Les mécanismes portent leurs scénarios de rejet, reprise et indisponibilité ; aucun succès de l’ancien prototype n’est réutilisé pour prétendre leur validation.
- Une preview autorisée précède les tests qui en ont besoin. L’exposition G2 vise les utilisateurs hors périmètre de test contrôlé ; elle n’interdit pas ce déploiement de vérification. Les trois moments code, recette et ouverture restent différents.
- Les inconnues client (offre Vercel compatible, textes, actifs/prix/identité, récupération et serveur final) sont des prérequis de leur jalon. Elles ne laissent pas deux unités choisir des schémas concurrents à G0.

## Constats

**Aucun constat nécessitant une correction de contrat avant G0.** Les risques d’implémentation signalés par les documents restent à vérifier selon G1–G4 : temps/quota, anti-abus, reprise d’import, export et promotion, supports et réceptions réelles. Ne pas convertir ces obligations en nouvelles preuves PASS ou en autorisation de code.

Empreinte de la spine lue : `78e94792156b01040a0efb6e79a548afbf73ed00f8bc279d22396862264b29f3`.
