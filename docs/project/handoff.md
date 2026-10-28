# Reprise du projet

## Publication GitHub du 28 octobre 2026

Sur demande explicite de Sofiane, les sept commits jusqu’à `1046c0c` sont publiés sur `origin/tem-6-technical-trial`. [PR nº1 en brouillon](https://github.com/blackboxdev0/tema-academie/pull/1), base `main`, ouverte et attachée au chat. Aucun merge, push direct sur main ou déploiement effectué. `main` distante vérifiée inchangée à `8217e5253055e6c669e0a154beee17ef3c4f814b`.

Avant push : `cd app && npm run verify`,61tests Node et28Playwright réussis, build réussi ; Google simulé, aucun email réel. Contrôle ciblé des112fichiers différents de main sans clé API ni adresse des participants de test détectée. Branche propre avant publication. Ce checkpoint documentaire est versionné et poussé à son tour ; il ne change pas le prototype testé.

Les validations métier ouvertes de la revue restent les mêmes : volume de lancement et tarif absent. Aucun GO principal ou acceptation des huit ET incomplets déduit du push. TEM-5 Review, TEM-6 In Progress ; les tickets V1 restent préparés en Backlog. La PR reste volontairement en brouillon, non prête pour fusion.

Les mentions « aucun push/PR » dans les constats du26octobre ci-dessous décrivent l’état historique de ce jour et sont remplacées par ce checkpoint pour l’état actuel.

## Situation historique au 26octobre2026

**Essai limité TEM-6 exécuté, bilan à examiner avec Sofiane.** Le transport A fonctionne dans le navigateur intégré ; quatre ET entièrement vérifiés et huit incomplets. [Bilan détaillé](technical-trial/TEM-6-results.md) · [fiche BMAD](../../_bmad-output/implementation-artifacts/spec-tem-6-essai-technique.md) · [TEM-6](https://linear.app/tema-academie/issue/TEM-6/eprouver-le-parcours-dinscription-google-sur-lenvironnement-test).

Spécification fonctionnelle approuvée24 octobre, UX fonctionnelle/dispositions25 octobre avec finition graphique différée, architecture d’ensemble et plan d’essai approuvés26 octobre. GO explicite du 26 octobre pour le prototype/essai isolé ; **aucun GO principal, push, fusion, achat ou livraison** ; commits par jalon désormais autorisés. La préparation et le prototype ont été versionnés par jalon ; aucun push.

## Prochaine conversation

**Revue globale du plan demandée et exécutée.** [Bilan à présenter](planning/reviews/revue-globale-plan-v1.md) : périmètre5blocs/17stories conservé, mais précisions internes nécessaires (contrats avant1.1, dépendances réelles, import rejouable, promotion TEST/Métier, anti-abus, export et candidat de recette avant5.3). Aucun code ni correctif du plan source appliqué par la revue, aucune autorisation de développement déduite.

Deux informations à discuter avec Sofiane : pic d’inscriptions attendu pour dimensionner les courriels du compte gratuit ; comportement d’une formation nouvelle sans tarif (proposition fiche visible/Tarif à confirmer, inscriptions désactivées). Cette proposition n’est pas approuvée. Le catalogue initial24prix n’a pas cette absence.

La prochaine proposition de GO doit nommer le lot1.1–1.3 sur ressources isolées et les prérequis qui le concernent, sans waiver général des8ET incomplets. Cadence normale<2min/secours5min déjà approuvée ; Outlook/Apple reportés à recette complète, ne pas les remettre au choix. Estimation3jours humains restante toujours proposée, répartition Sofiane/Tema à clarifier en jours-personnes cumulés ; pas une promesse de délai de code.

[Plan et estimation](planning/plan-developpement-v1.md), [epics BMAD](../../_bmad-output/planning-artifacts/epics.md), [couverture](planning/validation-decoupage-v1.md), [registre Linear](planning/linear-v1.json). Native readiness CONCERNS, document draft jusqu’à validation globale. TEM-7–11 parents etTEM-12–28 enfants en Backlog ; TEM-5 Review, TEM-6 In Progress, P-TEM-1 Backlog inchangés.

Sofiane délègue la préparation sans micro-confirmations et autorise les commits par jalon. Aucun GO principal, fusion ou déploiement nouveau. La revue est documentaire, pas une nouvelle recette produit ; publication GitHub autorisée et vérifiée au checkpoint du28octobre.

## Preuves acquises

- `app/` : moteur partagé Google/Node, adaptateurs TEST fixes, quatre fichiers web statiques, tests et mode de relance. **61 Node et28 E2E Chromium** verts (14 scénarios ordinateur/format Pixel 7), build réussi ; Google simulé dans la suite. Aucun pipeline CI exécuté.
- Vercel→Apps Script réel : inscription normale avec délai45 s, résultat inconnu repris sans doublon, dernière place concurrente unique/FULL, refus de doublon/consentement/politique/fermeture/révision/inactivité, annulation conservée et nouvelle ligne. Admission/flush ont assertions d’adaptateur, certains interleavings seulement locaux.
- Courriels : réception présentielle attestée par Sofiane avec capture, avis Tema reçu ; variantes avec/sans lien et trois fichiers ICS inspectés côté Envoyés. Deux imports Google Agenda affichent9 h–12 h hiver/été. Outlook/Apple non vérifiés ; carte Gmail Envoyés Unable to load event, pas de garantie d’ajout automatique.
- Pannes privées : FAILED/SENT avec avis reçu puis FAILED/FAILED, place maintenue et aucune troisième alerte. Après retrait du flag, rejeux sans renvoi. Textes HTML/formule inertes, catalogue/bundle sans adresse participante ou lien privé.
- Retour site/script/HEAD précédent puis rétablissement courant : cinq métadonnées de lignes identiques, reçus et compteurs conservés ; aucun retour de données.

## État des services laissé

[Registre](../../_bmad-output/specs/spec-tema-academie-v1/ressources-services.md) et `config/project.json` portent IDs/URLs/empreintes. Google `temaacademie@gmail.com`, Sheets Métier/TEST privés et projets liés distincts, V8/Toronto. Métier conserve en-têtes/paramètres et squelette Google ; aucun catalogue métier importé ou déploiement métier.

TEST : une formation active, **deux dates fermées**, cinq inscriptions fictives (quatre confirmées/une annulée). Budget persistant5/10 inscriptions avec tentatives,10/20 destinataires réservés (injections incluses), quota92 au 26octobre17:17:39 Toronto, partagé entre projets. Sept états SENT/trois FAILED ne prouvent pas toute la consommation du compte. Panne retirée ; deux déclencheurs de données, onEdit et périodique **12 h au repos**, réglage relu. Ne pas réinstaller/reconfigurer le minuteur sans prévoir une séquence bornée ; aucun email depuis ces triggers.

Google web app version 3, propriétaire/Anyone autorisé ; HEAD et bundle SHA-256 `34e7ab30766995dd62e7bb593042f2b514364a79ea673721c4e33049c0c4364c`. [Prototype Vercel](https://project-w1j1x.vercel.app/) : déploiement `5zNTif7SBSon5aEMm3RMoeEPb8Gf`, quatre fichiers Drop, fichier servi identique. Label plateforme Production utilisé pour ce seul TEST ; aucune livraison client. Espace Hobby retenu provisoirement, compatibilité commerciale à résoudre avant déploiement client ; aucun achat, Git non relié. GitHub Tema PUBLIC/ADMIN/main constatés.

Destinataires privés hors dépôt : `/Users/sofiane/.config/tema-academie/test-recipients.json`,0600. Captures/ICS/traces dans `/tmp/tema-trial-TEM-6`, pas dans Git/Linear. Préserver les propriétés de budget/IDs/checkpoint ; aucun reset HTTP. [README de relance](../../app/README.md).

## Documents et règles à préserver

[SPEC et compagnons](../../_bmad-output/specs/spec-tema-academie-v1/SPEC.md) :8 CAP/21 AC/12 ET, décisions humaines et exclusions conservées. UX [EXPERIENCE](../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/EXPERIENCE.md)/[DESIGN](../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/DESIGN.md) et [spine d’architecture](../../_bmad-output/planning-artifacts/architecture/architecture-tema-academie-2026-10-20/ARCHITECTURE-SPINE.md) sont des compagnons adoptés, à mettre à jour par leurs writers. Leur statut final est rédactionnel, pas une acceptation de toutes les preuves de l’essai.

Formation inactive distincte de date fermée ; Inscriptions terminées avec confirmé, date fermée sans confirmé masquée. Capacité autoritaire par date, sans plafond huit ; ancien annulé jamais réactivé. Une demande déjà admise avant fermeture manuelle peut finir ; le verrou ne bloque pas une édition humaine. État inconnu repris même clé, pas de faux refus. Une tentative initiale participant puis avis Tema ; aucun renvoi automatique/menu ou délai dix minutes. Envoi MailApp engagé non révocable atomiquement. Confidentialité dédiée, conservation12 mois/nettoyage manuel Emma et marque/prix finaux à faire valider par Tema avant ouverture. [Décisions](decisions/index.md).

Vercel démo/recette puis bascule FTP sous responsabilité Sofiane, sans bloquer le cadrage. Budget3600 $HT et trois jours humains actifs proposés, non acceptés par la rédaction ; impact des tests à intégrer avant engagement, acompte/GO client non constatés.

## Reprise technique

Branche `tem-6-technical-trial`, base historique `8217e5253055e6c669e0a154beee17ef3c4f814b` ; candidat de plan relu `7f429da`. Rattrapage local par jalon du 26 octobre : `58cee54` configuration, `d816d9c` spécification, `261aeb5` UX/architecture, `276c5fe` prototype TEM-6 ; suivi courant dans un commit documentaire séparé. Aucun push/PR. Ne pas effacer la préparation indépendante. Node 22.9.0/npm 11.7.0 constatés, Playwright 1.64.1 verrouillé ; Vite/clasp non installés. Build Node statique minimal pour l’essai, pas de changement global du runtime. [Commandes](../../app/README.md).

BMAD 6.12.4/29skills et routage local valides ; stable réseau non recontrôlée depuis19 octobre. Connecteur dédié `linear_tema`, équipe TEM UUID `b6fe00a9-ac52-42c1-a3ef-d08b3dbd2f8f` ; vérifier équipe/ticket avant chaque écriture. Le connecteur général peut pointer sur Pink Gossip.

## Vérification du checkpoint Git

Relance locale le 26 octobre : `cd app && npm run verify`, 61 tests Node et 28 parcours Playwright Chromium réussis (ordinateur/format mobile), build réussi ; Google simulé dans cette suite, aucun nouvel envoi ou déploiement. Contrôle ciblé des secrets et des adresses de participants sans correspondance dans les fichiers candidats. Les 28 espaces de fin de ligne détectés dans les licences de fontes intégrées aux maquettes sont conservés avec leur source ; aucun autre diagnostic du contrôle Git. Les dépendances, builds et preuves temporaires restent ignorés.
