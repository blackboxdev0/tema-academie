# Contrôle proactif Pass 1 — clôture fonctionnelle UX du 25 octobre

Contrôle mécanique de l’auteur, le 25 octobre 2026, borné à la clôture des fonctions/parcours/dispositions, à la promotion S4/S5 et aux références des contrats. Le parent a réconcilié les compagnons Spec sur les décisions du 25 octobre. Il vérifie la couverture et les références ; il ne constitue ni une rubrique indépendante d’évaluation UX, ni un audit WCAG, ni une recette produit. La [synthèse de portée des revues](validation-report.md) distingue le contrôle visuel Sally réellement effectué des présents contrôles d’auteur.

Les deux contrats sont `final` / `authoring-complete`, avec `approval: owner-approved-functional-ux`, `approved_on: 2026-10-25` et `approval_scope: functional-flows-and-layout`. Le passage à l’architecture est demandé. La base logo/rose/Manrope–Inter reste retenue ; `final_visual_approval: pending_rework` distingue la finition graphique différée de l’accord fonctionnel. `technical_validation: not-executed` reste inchangé. S1–S5 sont illustrées ; le maintien S6–S11 en tables/interfaces natives est une hypothèse non bloquante déduite de la clôture, pas un vote explicite sur chaque surface. Les sources V1 et .working restent inchangées.

## 1. Parcours et exigences — couverture mécanique présente

La SPEC courante nomme les huit capacités suivantes, sans parcours UJ supplémentaire. Les titres sont repris verbatim dans [EXPERIENCE, couverture](EXPERIENCE.md#couverture-des-capacités-et-décisions-ouvertes).

| Capacité extraite | Surfaces | Parcours qui la délivrent |
|---|---|---|
| CAP-1 — Comprendre les formations | S1/S2 | F1/F2 |
| CAP-2 — Choisir une session | S2/S3 | F1/F2/F4 |
| CAP-3 — Administrer sans développeur | S8/S9 | F4/F5 |
| CAP-4 — Réserver une place | S4/S5 | F2/F3 |
| CAP-5 — Recevoir confirmation et agenda | S5/S6/S7/S9 | F2/F3/F4/F5 |
| CAP-6 — Gérer les changements manuellement | S8/S9/S10 | F5 |
| CAP-7 — Protéger les données et traiter les erreurs | S4/S5/S9/S11 | F2/F3/F4/F5 |
| CAP-8 — Exploiter et recevoir la solution | S10/S8/S9 | F4/F5 |

Les cinq [Key Flows](EXPERIENCE.md#key-flows) ont chacun un protagoniste nommé, des étapes numérotées, un point décisif et un chemin d’échec : F1 Marie consulte sans date (5 étapes), F2 Marie réserve/agenda (7), F3 Marie traite refus/interruption/email (6), F4 Sofiane joue la publication en recette (6), F5 Sofiane joue annulation/replanification (6). Marie est l’exemple PDF, pas une inscription réelle ; Sofiane joue le rôle de recette sans être nommé gestionnaire d’exploitation. S11 est atteint dans F2, S10 dans F4/F5. Aucune surface orpheline de parcours.

Les exigences confirmées sont présentes : catalogue puis calendrier, filtre partagé, mois initial et repli, date explicitement cliquée prioritaire, fiche avec dates avant programme, formulaire dédié, contexte de navigation et champs transitoires, confirmation seulement sur réservation certaine, refus complet/inconnu/conditions modifiées, suivi Gmail. Le rapprochement Spec/UX couvre le masquage d’une date fermée sans confirmé et la priorité Inscriptions terminées sur Complet lorsque la date est fermée.

**Décisions closes :** UX-SORT est approuvée le 25 octobre : réservables, puis seules dates visibles complètes/terminées, puis sans date visible ; ordre du classeur à égalité, inactives masquées. UX-MONTH est l’initialisation à l’arrivée suivie d’une navigation manuelle libre sans saut automatique. La synthèse des notifications approuvée conserve refus certain, résultat inconnu et reprise de la même demande, état d’envoi distinct avec PENDING/SENDING/échec/incertitude, sans renvoi automatique. Aucune règle déjà décidée n’est remise au vote.

## 2. Tokens et structure — références résolues

Frontmatter YAML parsé. DESIGN respecte l’ordre Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do’s and Don’ts. EXPERIENCE contient Foundation, Information Architecture, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor et Key Flows ; Responsive & Platform et Inspiration & Anti-patterns sont présents car le produit est responsive et la source Tema est utilisée.

Extraction de [DESIGN, frontmatter](DESIGN.md) : **17 couleurs**, **6 rôles typographiques**, **5 arrondis**, **7 espacements**, **9 groupes de tokens de composants**, soit **84 valeurs terminales**. Les **33 chemins uniques de référence** présents dans les valeurs et le texte des deux spines se résolvent ; les 17 couleurs ont un hexadécimal à six chiffres. Aucun token défini seulement par un nom vague ou une couleur sans valeur.

Couleurs extraites : brand-pink, action-pink, action-hover, ink-primary, ink-secondary, surface-base, surface-raised, border-default, border-control, surface-selected, software-dimo, software-moovapps, availability, status-background, status-text, disabled-background, disabled-text. Familles Manrope/Inter, tailles et traitements proviennent des CSS V2 choisis ; les marges sont dérivées explicitement de leurs largeurs `calc()`, sans nouvelle échelle inventée.

Les quatre associations de contraste déjà calculées restent partielles : blanc/rose source 3,72:1 ; blanc/action 5,78:1 ; graphite/fond 14,93:1 ; secondaire/blanc 5,94:1. [DESIGN, Colors](DESIGN.md#colors) conserve les cibles 4,5:1 et 3:1 et la limite d’audit. **Écarts à éprouver dans la réalisation :** toutes les combinaisons de focus, les repères logiciels, les états désactivés, le zoom et les erreurs des surfaces sans maquette. La direction graphique approuvée n’est pas une certification d’accessibilité ; l’absence de charte officielle David n’est pas remplacée par une prétention de charte officielle.

## 3. Composants — deux tables concordantes

Les tables [DESIGN.Components](DESIGN.md#components) et [EXPERIENCE.Component Patterns](EXPERIENCE.md#component-patterns) ont les mêmes **19 noms uniques**, avec règles visuelles et comportementales :

NavigationAcadémie ; FiltreLogiciel ; CarteFormation ; FicheFormation ; CalendrierMensuel ; ListeCohortes ; SélecteurCohorte ; IndicateurDisponibilité ; FormulaireInscription ; ChampSaisie ; ConsentementConfidentialité ; BoutonAction ; MessageÉtat ; RécapitulatifInscription ; CourrielParticipant ; AvisTema ; FeuilleAdministration ; ModeEmploi ; LienPolitique.

Les sous-tables des champs ne créent pas des composants supplémentaires. Les dispositions de la page dédiée et de la confirmation sont illustrées par S4/S5 et approuvées ; les tokens V2 restent une base de travail, sans nouvelle valeur graphique ajoutée lors de cette clôture. MenuAdministration et ses anciennes commandes de suspension/relance ne sont pas réintroduits. Une capacité de huit demeure une donnée source possible, sans plafond métier.

## 4. États par surface — onze lignes correspondantes

Les identifiants de l’architecture d’information et de [State Patterns](EXPERIENCE.md#state-patterns) coïncident exactement : S1 à S11.

| Surface | États couverts et limite de preuve |
|---|---|
| S1 Catalogue | Chargement, catalogue/filtre vides distincts, disponibilité/absence de date, inactives masquées, réseau/hors ligne, focus/retour. |
| S2 Fiche | Mois initial/repli/date prioritaire, récapitulatif neutre ou date choisie, sans date/non réservable, inactive/introuvable, réseau, titres/focus. |
| S3 Calendriers/liste | Chargement, mois vide versus aucun futur, filtre général, ouverte/complète/terminée, fermée sans confirmé masquée, réseau, mois/focus. |
| S4 Formulaire | Prêt, téléphone vide accepté, champ/accord invalide, envoi, refus certain, conditions modifiées, résultat inconnu, changement de date et conservation transitoire. Disposition illustrée et approuvée ; finition graphique différée. |
| S5 Résultat | Réservée avec certitude et envoi distinct, FULL certain et autre date, inconnu/reprise même demande, annulation au rejeu ; pas de reçu tiers. Disposition illustrée et approuvée ; finition graphique différée. |
| S6 Courriel/agenda | Reçu lisible, invitation, lien présent/à venir, échec/incertitude sans perte de place, changement manuel. Réception réelle non vérifiée. |
| S7 Avis Tema | Envoi accepté/échoué/incertain, échec participant signalé si possible, avis lui-même éventuellement bloqué, droits Google. |
| S8 Formations/Disponibilités | Vide/import/ligne invalide, diagnostics/protection/droits, actif/ouvert/capacité, baisse sous confirmés, propagation et opérations concurrentes à prouver. |
| S9 Inscriptions/Paramètres | Vide, confirmée/annulée/réinscrite, états d’envoi privés, paramètres/protection, disparition d’une date fermée après dernière annulation confirmée. |
| S10 Remise | Accès/refus, procédure présente ou manquante, recette/destination/droits/récupération et nettoyage. Aucune recette accomplie annoncée. |
| S11 Politique | Texte/lien présents ou indisponibles, accord préalable, retour avec champs ; texte légal non inventé. |

Les règles communes de focus, erreurs associées, clavier/tactile, hors ligne sans inscription locale et absence de données personnelles dans l’URL complètent ces lignes. Les statuts privés ne deviennent pas publics. Couverture documentaire présente ; fonctionnement réel non exécuté.

## 5. Références visuelles et promotion — aucune référence orpheline

| Fichier | Illustration et rattachement |
|---|---|
| [mockups/direction-tema-academie-v2.html](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-academie-v2.html) | S1/S3 ; catalogue, filtre commun, calendrier général et liste téléphone. Lié dans DESIGN Brand/Layout et EXPERIENCE IA. |
| [mockups/direction-tema-fiche-v2.html](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-fiche-v2.html) | S2/S3 ; dates avant programme, état neutre, date choisie, récapitulatif mobile voisin, complète/terminée/sans date. Lié dans les mêmes sections et composants. |
| [mockups/direction-tema-style-v2.html](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/direction-tema-style-v2.html) | Palette, fontes, composants et états de la direction. Lié dans DESIGN Brand et EXPERIENCE IA/Inspiration. |
| [mockups/key-inscription-v2.html](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-inscription-v2.html) | S4 ; récapitulatif puis coordonnées/accord/action ; initial, erreur, complet certain, inconnu et conditions modifiées. Disposition approuvée, finition graphique différée. |
| [mockups/key-confirmation-v2.html](https://github.com/blackboxdev0/tema-academie/blob/190a881149766fd72c2411bf6e77314968bdff97/_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/mockups/key-confirmation-v2.html) | S5 ; place certaine puis récapitulatif, état d’envoi et retour/contact ; échec/incertitude d’envoi et horaires reconfirmés. Disposition approuvée, finition graphique différée. |
| [imports/site-tema-2026-10-24/logo-tema.png](imports/site-tema-2026-10-24/logo-tema.png) | Original logo Tema, lié dans les deux spines ; aucune modification du PNG. |

Cinq copies HTML promues, identiques octet pour octet aux sources sélectionnées dans .working, dont les deux nouvelles key-inscription-v2.html et key-confirmation-v2.html ; V1 et .working préservés. **127 liens/ancres HTML locaux vérifiés** entre ces fichiers, aucune rupture et aucun chemin inter-fichier à corriger après copie dans le même répertoire. Les fontes et le logo sont embarqués ; zéro script et zéro chargement réseau nécessaire au rendu. Les liens externes documentaires ne sont pas visités par ce contrôle. Aucun wireframe ; aucun formulaire HTML soumis dans les deux nouveaux fichiers.

Les deux contrats et les cinq réconciliations totalisent **72 liens Markdown locaux**, ancres comprises, résolus ; les deux frontmatters totalisent **28 références sources** résolues. Chaque visuel/import conservé possède un lien inline et une description de son rôle. Une seule règle commune de priorité des spines est donnée dans DESIGN.Brand & Style. Les mentions historiques « proposition à valider » à l’intérieur des HTML/synthèses ne remplacent pas l’approbation graphique ultérieure du journal.

**Couverture fonctionnelle clôturée :** accueil/fiche/formulaire/confirmation illustrent S1–S5. S6–S11 restent spine-only : courriels/agenda, avis, interfaces natives Sheets/Gmail, guide et politique. Ce maintien est une hypothèse non bloquante déduite de la clôture et de la priorité fonctionnelle ; aucune approbation explicite d’un visuel de chaque surface native n’est prétendue. Les maquettes ne prouvent ni conservation du contexte entre fichiers, ni formulaire connecté, ni cas d’erreur réels ; la finition graphique reste à reprendre.

## Portée et remise au parent

Les cinq réconciliations ont été relues ; les sources brutes PDF/Excel ne sont ni relues ni modifiées dans cette distillation. Le contrat de projection, AC-02/03 et ET-09 relus après le signal Spec prêt concordent avec les règles de dates confirmées. L’approbation fonctionnelle, la finition graphique différée et l’hypothèse de couverture native sont exposées sans nouveau chantier ni GO de développement.

La revue Sally et son contrôle ciblé V2 sont des preuves visuelles existantes, présentées dans le [rapport de synthèse](validation-report.html). La [revue native structure puis prose de la consolidation V2 du 24 octobre](reviews/review-editorial-v2-2026-10-24.md) reste historique. La [revue éditoriale native du delta de clôture du 25 octobre](reviews/review-editorial-cloture-2026-10-25.md) est terminée : structure sans constat ; deux lignes prose retenues, soit trois remplacements appliqués, sans changement métier. Aucun audit ni reviewer UX optionnel supplémentaire n’est lancé. Aucun reviewer indépendant de rubrique ni nouvelle lentille optionnelle n’est simulé par ce Pass 1.

Contrôles exécutés par commandes ponctuelles, sans dépendance projet ajoutée. Aucun code app/, compte, accès Google, essai réel, envoi, réseau, Linear, déploiement ou commit. Les opérations de journal restent sous la responsabilité exclusive du parent.
