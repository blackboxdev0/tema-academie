# Reprise du projet

## Point Git et socle — 30 octobre

Sofiane autorise les commits de la préparation actuelle, les commits par jalon et les push sur la branche de travail, et retire explicitement la restriction de demande par commit. Conventional Commits en anglais, sans attribution. Cette décision remplace la consigne restrictive fournie précédemment dans le chat ; fusion/main/déploiement/publication restent soumis à leur GO. Aucun démarrage du développement V1 déduit. Point 3 réglé ; points préparatoires suivants : effort humain, source Excel originale et échéance.

Socle source : [bkbx-agentic](https://github.com/blackboxdev0/bkbx-agentic), version 1.0.1, révision `48d56f7bab5f5e18dcc0a455784dae77854bcbd5`, main distante relue le 30 octobre. Onze fichiers de méthode repris après comparaison avec la base `8217e52` : règles worktrees/version et documentation ; consignes Tema et contexte produit conservés. BMAD reste 6.12.4.

Carte de travail : ce chat travaille dans `/Users/sofiane/Software/tema`, branche `tem-6-technical-trial`, [PR 1 en brouillon](https://github.com/blackboxdev0/tema-academie/pull/1). Checkout conservé pendant la préparation et les prochaines étapes : aucun déplacement vers main ni nouveau worktree nécessaire pour cette adoption documentaire.

Contrôles du checkpoint : 89 tests de méthode réussis ; `scripts/check.py` et `scripts/project.py doctor` réussis ; catalogue complet relu et BMAD 6.12.4 stable confirmé en ligne. Cinq HTML courants / 385 liens locaux contrôlés sans cible ou ancre manquante ; aucun script/formulaire/asset distant ni secret/adresse de participant de test dans les ajouts. Espaces terminaux corrigés dans les licences embarquées ; espaces client encodés en entités HTML sans modifier leur valeur décodée. Aucun test produit ou Google relancé à cette occasion.

Préparation UX enregistrée dans `5fa86f7` ; ce checkpoint versionne aussi les instructions, la configuration et les bilans préparatoires. La branche de travail et sa PR en brouillon portent le candidat, sans intégration dans main. Les détails des anciens audits ci-dessous sont historiques ; pour l’état Git externe, relire la branche distante et Linear au prochain jalon.


## Publication GitHub du 28 octobre 2026

Sur demande explicite de Sofiane, les sept commits jusqu’à `1046c0c` sont publiés sur `origin/tem-6-technical-trial`. [PR nº1 en brouillon](https://github.com/blackboxdev0/tema-academie/pull/1), base `main`, ouverte et attachée au chat. Aucun merge, push direct sur main ou déploiement effectué. `main` distante vérifiée inchangée à `8217e5253055e6c669e0a154beee17ef3c4f814b`.

Avant push : `cd app && npm run verify`,61tests Node et28Playwright réussis, build réussi ; Google simulé, aucun email réel. Contrôle ciblé des112fichiers différents de main sans clé API ni adresse des participants de test détectée. Branche propre avant publication. Ce checkpoint documentaire est versionné et poussé à son tour ; il ne change pas le prototype testé.

À ce checkpoint de publication initial, volume de lancement et tarif absent restaient ouverts ; ils ont ensuite reçu réponse et sont intégrés à la clôture ci-dessous. Aucun GO principal ou acceptation des huit ET incomplets déduit du push. TEM-5 Review, TEM-6 In Progress ; les tickets V1 restent préparés en Backlog. La PR reste volontairement en brouillon, non prête pour fusion.

Les mentions « aucun push/PR » dans les constats du26octobre ci-dessous décrivent l’état historique de ce jour et sont remplacées par ce checkpoint pour l’état actuel.

## Situation historique au 26octobre2026

**Essai limité TEM-6 exécuté, bilan à examiner avec Sofiane.** Le transport A fonctionne dans le navigateur intégré ; quatre ET entièrement vérifiés et huit incomplets. [Bilan détaillé](technical-trial/TEM-6-results.md) · [fiche BMAD](../../_bmad-output/implementation-artifacts/spec-tem-6-essai-technique.md) · [TEM-6](https://linear.app/tema-academie/issue/TEM-6/eprouver-le-parcours-dinscription-google-sur-lenvironnement-test).

Spécification fonctionnelle approuvée24 octobre, UX fonctionnelle/dispositions25 octobre avec finition graphique différée, architecture d’ensemble et plan d’essai approuvés26 octobre. GO explicite du 26 octobre pour le prototype/essai isolé ; **aucun GO principal, push, fusion, achat ou livraison** ; commits par jalon désormais autorisés. La préparation et le prototype ont été versionnés par jalon ; aucun push.

## Plan et méthode d’exécution — clarification du 30 octobre

Sofiane valide le plan de cinq blocs / 17 stories et la méthode future : développement autonome, tests pertinents, assurance qualité, revue UX avec Sally et rapport final avant sa recette. Il précise ensuite que nous poursuivons les points de préparation : **le développement de la V1 n’est pas lancé à ce stade**. La précédente consignation comme GO immédiatement exécutable était trop large ; le démarrage est différé pendant cette revue.

Conserver les consignes d’autonomie pour la réalisation : décisions courantes déléguées, vrais blocages ou changements de périmètre à signaler, pas de demande de test humain à chaque story. Point 3 ensuite confirmé : commits par jalon et push sur la branche de travail autorisés, selon la décision ci-dessus. Clôture documentaire, checkpoint Git et autres confirmations préparatoires restent à terminer. Aucun code `app/` modifié, nouveau test produit exécuté ou ticket de développement démarré à cette occasion ; fusion, déploiement et publication conservent leurs validations propres.

## Validation globale du design — 29 octobre

Sofiane confirme que tout est fait en termes de design. Revue humaine des maquettes V1 terminée : accueil/calendriers,24fiches, formulaire, confirmation et états couverts globalement. Cette validation remplace les attentes d’avis sur la généralisation visuelle ; elle n’est ni une preuve produit ni un GO de développement principal. Reste à clôturer/consolider le dossier BMAD, régler les contrôles techniques de finition déjà recensés, préparer le checkpoint Git et valider plan/estimation puis GO du lot identifié. Ne pas rouvrir les choix graphiques validés.

## Checkpoint de préparation — 29 octobre

Audit direct :41fichiers non commités (21M/13D/7nouveaux),0staged, HEAD476fc04 sur tem-6-technical-trial, un commit devant origin190a881. Références distantes relues : travail190a881 et main8217e52. Aucun changement app/. Les maquettes et décisions récentes sont enregistrées localement et synchronisées dans TEM-5 ; elles ne sont pas encore publiées dans GitHub.

Linear relu : projet P-TEM-1 Backlog, TEM-5 Review, TEM-6 In Progress ;5parents et17stories du plan Backlog. Ne pas clôturer TEM-5 avant validation globale convenue. BMAD6.12.4/29skills et routage local valides ; stable réseau non recherchée à ce checkpoint. [Readiness](../../_bmad-output/planning-artifacts/implementation-readiness.md) actualisée : architecture G0PASS, reste revue UX globale, validation plan/estimation puis GO d’un lot identifié (proposition1.1–1.3 isolée). Consolidation finale des contrats à finir avec la revue globale, sans réinventer de choix métier.

État historique de l’audit du 29 octobre : une consigne fournie dans le chat imposait encore une demande par commit. Sofiane l’a explicitement retirée le 30 octobre ; la règle courante est celle du point Git ci-dessus. Aucun nouveau commit/push/fusion ou livraison n’avait été réalisé pendant cet audit.

## Revue UX/UI courante — 29 octobre

**Formulaire et confirmation courants validés par Sofiane ; fiches24/cas particuliers harmonisés prêts à examiner.** GO limité à ces maquettes et au contrôle de cohérence, sans réalisation V1 principale, commit, push ou déploiement. Inventaire : [features.md](features.md#revue-design-courante--29-octobre).

Références courantes sur le serveur local8742 :

- [Accueil](../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/.working/accueil-tema-academie.html) : cartes03 Rose + gris clair, trois colonnes/six formations par page ; calendrier02 à en-tête blanc et repères logiciels retenus.
- [Fiches des24formations](../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/.working/fiche-tema-academie.html) : modèle Ergonomie décliné,48contextes carte/retour filtre/page,9sessions fictives ; barre de revue sans date/complet/terminé/tarif à confirmer. Source/prix normaux inchangés ; absence de tarif simulée uniquement dans cet état de revue.
- [Fiche Ergonomie de référence](../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/.working/fiche-ergonomie.html) : encore utilisée par Changer de date du formulaire ; même modèle, conservée.
- [Formulaire](../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/.working/inscription.html) : étape visuelle validée après focus rose unique des champs ; sept inputs sources dont rendu courriel alternatif, un accord décoché et cinq états.
- [Confirmation](../../_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/.working/confirmation.html) : validation explicite du29octobre, place certaine puis récapitulatif puis statut d’envoi ; quatre états conservés sans nouvel accord individuel inventé.

**Règles retenues :** programme/résultat/prérequis sur fond blanc avant dates ; Voir les dates en bouton graphite ; flèches conservées mais soulignement du texte seul ; prochaine date future réservable présélectionnée/récapitulatif ouvert ; date explicitement ciblée prioritaire même complète/terminée, inscription désactivée dans ces cas. Navigation manuelle des mois neutre. Mobile : agenda et récapitulatif immédiatement après la date choisie. Formation sans date : bloc compact Dates à venir, sans grille vide ni inscription active. Pastilles de disponibilité vert pâle/point et texte foncés validées et appliquées sur les quatre maquettes concernées ; textes/nombres/liens/IDs/inputs inchangés, retour à la ligne des calendriers observé, masque du formulaire complet vérifié. Captures `indicateur-places-desktop.png` et `indicateur-places-mobile.png` dans le dossier temporaire de revue.

**Preuves ciblées de généralisation :**24sources/48contextes vérifiés texte par texte (titre/programme/résultat/prérequis/durée/tarif),0écart ;18ancres sessions, IDs uniques,0script/form. Accueil modifié uniquement sur18hrefs du calendrier, cartes/CSS inchangés. Empreintes du JSON, de la fiche Ergonomie et des deux écrans validés identiques. Navigateur1265/641px : cas sans date/complet/terminé/tarif manquant, Dimo par défaut17novembre et retourDimo1, fiche de production puis retourTous4, dateErgo20complète et Dimo15décembre depuis le calendrier général, priorité sur défaut et bon mois, récapitulatif mobile sous15décembre. Microcopie sans date rendue précise sans toucher les textes client. Tous les liens/ancres locaux courants contrôlés après nettoyage.

**Limites de maquette :** données de programmation fictives ; seul Ergonomie12novembre ouvre le formulaire illustratif correspondant. Les autres CTA réservable restent illustratifs ; aucune mauvaise redirection vers une autre formation. Les retours depuis le calendrier général vont à Tous1, sans mémoire dynamique de filtre/mois/position simulée. Le comportement final prévu reste celui d’EXPERIENCE. Glissement/filtres signalés par Sofiane restent à éprouver dans la solution entière ; ce contrôle ne vaut pas campagne produit. Aucun formulaire soumis, stockage participant ou email réel.

**Sources et finitions ouvertes :** extraction initiale24formations conservée ; original Excel absent de son ancien chemin, empreinte historique non revérifiée aujourd’hui. Tous supposés actifs pour le volume seulement. Textes courts/manquants à revoir avec Tema sans invention ; politique/accord proposés et montants finaux à faire valider par Tema. Petites mentions blanches sur rose#FF008F (contraste3,72:1) à renforcer avant ouverture ; pas de dérogation d’accessibilité déduite du choix visuel. Reste à examiner les nouveaux cas particuliers et la cohérence finale avant clôture UX globale, puis plan/estimation/GO principal.

**Nettoyage terminé pour les anciens écrans remplacés :**6doublons/V1 retirés précédemment, puis5HTML promus retirés après disparition des dépendances8741. Sources de ces5identiques au commit publié190a881149766fd72c2411bf6e77314968bdff97 ; références historiques redirigées vers ces sources Git immuables. Récupération locale : `/Users/sofiane/.Trash/tema-ux-doublons-obsoletes-20261029-150717` et `/Users/sofiane/.Trash/tema-ux-references-remplacees-20261029-163539` (manifestes/empreintes). Les nettoyages plus anciens restent dans .memlog. Cinq HTML courants dans .working ; aucune modification de app/ ou services Google.

Captures actuelles hors Git dans `/tmp/tema-ux-review-2026-10-29/` : `fiches-sans-date-mobile.png`, `fiches-tarif-a-confirmer-desktop.png`, `fiches-dimo-date-decembre.png`, `inscription-desktop.png`, `confirmation-desktop.png`. Nouvelle revue à poursuivre sur `http://127.0.0.1:8742/fiche-tema-academie.html` ; résultats visuels de la généralisation non encore acceptés. Préparation et nettoyage non commités, aucune fusion/livraison.

## Prochaine conversation — après clôture d’architecture du 28 octobre

**Architecture de conception clôturée pour passer à l’UX/UI.** La [spine](../../_bmad-output/planning-artifacts/architecture/architecture-tema-academie-2026-10-20/ARCHITECTURE-SPINE.md) et la [Spec](../../_bmad-output/specs/spec-tema-academie-v1/SPEC.md) sont réconciliées. Les 11 AD, 8 CAP, 21 AC et 12 ET conservent leurs identifiants. Le [contrôle commun](architecture/controle-technique-v1.md) définit le tarif absent, l’anti-abus, les mesures de charge/cadence, l’import/export, la promotion et les étapes G0–G4. [Résolution du gate](../../_bmad-output/planning-artifacts/architecture/architecture-tema-academie-2026-10-20/reviews/resolution-2026-10-28.md) : lint sans constat, réconciliations Spec/UX et trois reviewers indépendants PASS pour G0. Aucun nouvel arbitrage humain avant la phase UX.

Les décisions « Tarif à confirmer / inscription désactivée » et limites Google gratuites sont intégrées. Une date sans tarif garde sa visibilité et reste consultable, avec action d’inscription désactivée. Les champs d’éligibilité publics sont dérivés ; aucune nouvelle case d’approbation gestionnaire. Les paramètres techniques de protection (3/30 commandes par fenêtres fixes de 60 s) et de charge (budget cible de 45 min/jour) restent à implémenter et éprouver. Aucun plafond métier de 50 inscriptions ou nouveau PASS produit. Aucun code, service Google, trigger ou envoi modifié.

**Ordre demandé par Sofiane :** revoir les maquettes UX/UI existantes, dont les fonctions/dispositions sont approuvées et la finition reste ouverte ; valider ensuite le plan global et l’estimation ; puis donner un GO principal identifié. Ne pas redemander les choix d’architecture consolidés ni démarrer le code maintenant. L’autorisation actuelle porte sur la clôture documentaire ; les acceptations et publications restent séparées.

Le [plan](planning/plan-developpement-v1.md), les [epics](../../_bmad-output/planning-artifacts/epics.md) et le [registre Linear](planning/linear-v1.json) suivent les contrats. Les dépendances techniques ont été distinguées de l’ordre conseillé, avec relations relues ; cinq parents et 17 stories conservés, 52 scénarios précisés sans nouveaux IDs. G0 est PASS ; la préparation du développement reste CONCERNS car la finition UX, le plan, l’estimation et le GO ne sont pas acceptés. Aucun sprint activé.

Restent pour la réalisation et la recette : nouvelle cadence, limiteur, tarif absent, import/export et promotion ; compléments ET requis avant acceptation du composant ; Outlook/Apple à la recette complète convenue. Le bilan historique TEM-6 reste 4 PASS / 8 NON VÉRIFIÉ. Un contrôle requis indisponible maintient son acceptation ouverte sauf dérogation humaine précise. Valeurs client, récupération, offre et cible sont contrôlées à leur jalon. Aucune nouvelle campagne réelle pour fermer G0.

Les conditions commerciales et paiements courants relèvent du contrat commercial distinct, pas des valeurs historiques de proposition. Cette consolidation ne modifie aucune condition commerciale.

TEM-5 reste Review, TEM-6 In Progress, le projet et les stories V1 Backlog : aucun Done déduit. Commits par jalon et push de branche de travail autorisés ; PR 1 en brouillon, aucune fusion de main ni livraison.

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
