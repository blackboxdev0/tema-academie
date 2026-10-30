# Préparation à l’implémentation — Tema V1

Actualisé le 30 octobre 2026 après confirmation du plan et des règles Git ; revue des maquettes et contrôle Git/Linear/BMAD conservés. Clôture d’architecture G0 du28octobre conservée.

**G0 PASS : l’architecture documentaire est clôturée.** Le verdict de préparation du développement reste **CONCERNS** : clôture documentaire UX, estimation humaine et fin des confirmations avant démarrage restent à terminer. Le plan et la méthode future autonome sont validés le 30 octobre ; commits par jalon et push de travail sont autorisés. La validation humaine globale du design est acquise le29octobre. Aucun sprint de développement activé.

| Sujet | État actuel | Prochain jalon |
|---|---|---|
| Cohérence des sources |11AD et8CAP/21AC/12ET réconciliés ; cadence, tarif absent, limites gratuites, contrat public et états alignés ; lint et3reviewers natifsPASSG0 | Consommer ces versions pour la revue UX puis le code autorisé |
| Contrôles techniques | Import reprenable, protection rafales, export texte, promotion TEST/Métier, navigation portable et preview avant recette définis | Réalisation/tests aprèsGOselonG1–G4, pas desPASSactuels |
| Preuves TEM6 |4PASS/8NONVÉRIFIÉ historiques ; nouvelle cadence/éligibilité/limiteur non implémentés | Vérifier le composant réalisé avant ouverture hors périmètre contrôlé ; Outlook/Apple àrecettecomplète |
| UX/UI | Accueil/calendrier retenus, formulaire/confirmation validés ;24fiches/cas harmonisés, pastille verte validée/appliquée et contrôles ciblés effectués | Design global confirmé terminé par Sofiane ; préparation des maquettes versionnée dans 5fa86f7, consolidation finale des références et contrôles techniques de finition avant code dépendant |
| Plan/estimation |5blocs/17stories, estimation3jours-personnes humains actifs reste proposition ;22issues du plan relues Backlog dans Linear | Plan validé le 30 octobre ; estimation humaine encore à confirmer, démarrage différé pendant les points préparatoires |
| Ouverture/remise | Prixactifs/textes/identité/offre/droits/cible client àconfirmer | Leurjalon avantdéploiementclient/ouverture, sans bloquer la revueUX |

[Contrôle commun G0–G4](../../docs/project/architecture/controle-technique-v1.md) · [Gate natif](architecture/architecture-tema-academie-2026-10-20/reviews/resolution-2026-10-28.md) · [Plan](../../docs/project/planning/plan-developpement-v1.md).

Aucune décisionpartagée manquante ne bloque la phaseUXdocumentaire. Un GO principal ultérieur doit nommer son périmètre ; une preuve requise indisponible maintient son acceptation ouverte sauf dérogation humaine identifiée. Les nouvelles limites de rafale ne sont ni un plafond quotidien50 ni un fournisseurpayant. Aucun code, envoi, trigger ou déploiement modifié pendant la consolidation.

Checkpoint Git du29octobre :41fichiers non commités (21modifications,13suppressions,7nouveaux),0staged, un commit local476fc04 non poussé ; branche distante190a881, main8217e52 inchangée. Aucun changement app/ dans cette revue. Ces constats du 29 octobre sont historiques : la restriction de demande par commit a été explicitement retirée par Sofiane le 30 octobre ; préparation actuelle, commits par jalon et push sur branche de travail sont autorisés. Voir le handoff pour le checkpoint courant.

Contrôles du 30 octobre pour l’adoption documentaire du socle BKBX Agentic 1.0.1 (source 48d56f7) : 89 tests de méthode, check et doctor réussis ; BMAD 6.12.4 stable confirmé en ligne, catalogue relu. Cinq maquettes / 385 liens locaux vérifiés. Aucun changement app/, nouvelle campagne produit/Google ou démarrage de story ; aucune fusion ni livraison.
