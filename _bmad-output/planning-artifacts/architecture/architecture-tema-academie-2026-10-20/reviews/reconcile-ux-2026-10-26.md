# Réconciliation de l’entrée UX — 26 octobre 2026

Périmètre : Finalize, étape 2 de `bmad-architecture`. Lecture de la spine du 26 octobre et des contrats UX finaux du 25 octobre. Revue documentaire uniquement ; aucun essai produit, accès Google, changement Linear ou GO produit.

## Verdict

**Compatible pour poursuivre le Reviewer Gate.** Aucun écart P0/P1/P2 et aucune régression des parcours approuvés constatés. La précision anti-énumération a été intégrée à AD-7 ; reste une clarification amont P3 sur l’admission. Les détails UX peuvent rester dans leurs contrats : l’adoption par référence suffit, sans répéter les écrans, tokens ou textes dans chaque AD.

## Constats

### UX-01 — P3 résolu : limite de la réponse DUPLICATE

- **Source :** `EXPERIENCE.md:122` conserve expressément « la politique anti-énumération est à confirmer dans l’architecture ». Le message prévu révèle seulement qu’une inscription existe pour le couple courriel/session ; il ne doit révéler aucune autre coordonnée.
- **Spine :** AD-4 protège le reçu en cas de même clé avec contenu différent ; AD-7 limite les données et mentionne un anti-spam simple. Le contrat adopté interdit les détails personnels (`contrat-donnees.md:135,145`).
- **Traitement retenu :** conserver `DUPLICATE` et la microcopie approuvée, sans reçu ni PII. Consigner que cette réponse révèle l’existence d’un doublon et que honeypot/délai ne garantissent pas l’absence d’énumération ; signaler cette limite avant ouverture. Aucun nouveau fournisseur ou changement UX ne découle du constat. Cette précision ferme la question technique sans contradiction bloquante.
- **Résolution :** précision ajoutée à AD-7 par l’auteur de la spine pendant la finalisation ; aucun correctif restant demandé sur ce point.

### UX-02 — P3 : préciser le point de référence dans le contrat UX lors de la synchronisation

- **Source :** `EXPERIENCE.md:121,201,274` décrit le refus des anciennes conditions « avant enregistrement » et la reconfirmation. AD-4 précise maintenant que l’admission correspond aux derniers contrôles frais réussis immédiatement avant écriture ; une fermeture manuelle postérieure laisse finir cette demande avec ses conditions acceptées. Le journal d’architecture et le handoff attestent l’arbitrage humain du 26 octobre.
- **Effet :** aucune incompatibilité bloquante. Le point d’admission et les instantanés précisent le contrôle au clic déjà prévu par l’UX ; AD-5 relit encore les conditions avant engagement du courriel. Les limites face aux éditions humaines sont explicites.
- **Suite :** lors de la synchronisation amont, mentionner le cas approuvé de fermeture manuelle postérieure à l’admission, sans en déduire de tolérance horaire supplémentaire ou généraliser cet accord à tout changement humain. Début contrôlé à l’admission, reconfirmation si changement détecté avant admission, confirmation seulement après écriture établie. Aucun nouvel arbitrage ni procédure de suspension imposés.

## Exigences portantes retrouvées

| Exigence UX | Atterrissage dans la spine | Résultat |
|---|---|---|
| Tri en trois groupes, ordre du classeur à égalité, filtre commun cartes/calendrier | Convention UX (`ARCHITECTURE-SPINE.md:133`) adopte EXPERIENCE ; règles précises `EXPERIENCE.md:74–82`. AD-8 unifie la projection et les états. | Préservé par référence ; aucun tri paramétrable ajouté. |
| Mois initiaux, priorité à une date explicitement cliquée, absence de sélection implicite, navigation manuelle libre | Convention UX ; `EXPERIENCE.md:84–96`. | Préservé ; ne pas remplacer la navigation manuelle par le saut des mois prévu seulement à l’arrivée. |
| Retour avec filtre/mois/position et changement de date dans la même formation | Convention UX ; `EXPERIENCE.md:93–96,137,145`. | Préservé ; moyen technique à prouver avec le transport. |
| Coordonnées transitoires, reprises et consultation de politique sans perte dans le parcours | AD-7 : mémoire de page, aucune URL ni persistance durable ; EXPERIENCE conserve les modalités de retour (`:94–96,145–155,210,217`). | Compatible ; aucune restauration après fermeture du navigateur promise. |
| Résultat inconnu et reprise de la même demande/contenu avant les contrôles mutables | AD-4/6 et conventions de résultat/statut ; EXPERIENCE `:119–120,194–201,226,273–278`. | Préservé : pas de nouvelle clé aveugle, seconde place ou email au rejeu ; annulation maintenue. |
| Changement de conditions : résultat certain sans place, nouvelles informations et confirmation explicite | AD-3/4, `SESSION_CHANGED`, convention UX et contrat de données adopté (`:57,144,152`). EXPERIENCE `:121,145,149,201`. | Préservé ; appliquer la précision UX-02 sur l’admission. |
| Réservation et envoi indépendants, états d’envoi certain/incertain/en cours distincts | AD-5/6 et conventions ; EXPERIENCE `:114–127,180–182,194–197`. | Préservé ; place conservée, avis Tema seulement tenté, suivi Gmail manuel, aucune relance automatique. |
| Aucun watcher du formulaire ou webhook ; contrôle ponctuel à la soumission | AD-8 l’interdit expressément (`:104`). EXPERIENCE `:226,274`. | Préservé ; la relecture des seuls catalogue/calendriers n’ajoute pas une surveillance du formulaire. |
| Dispositions S1–S5 et responsive, formulaire dédié, hiérarchie de confirmation | Introduction et convention UX ; DESIGN/EXPERIENCE sont compagnons. EXPERIENCE `:56–72,157–161,302–311` et DESIGN `:183–195`. | Préservé par référence ; une variante de transport changeant le parcours requiert une décision selon AD-6. |
| Logo/rose/Manrope–Inter V2 conservés ; rendu final graphique à reprendre | Introduction, convention UX, AD-10 et Deferred ; DESIGN `:144–156,175` et EXPERIENCE `:40,317,332–334`. | Réserve explicite conservée ; aucune validation de la marque ou du rendu final inventée. |
| Ton français clair, états textuels et accessibilité du clavier/focus/formulaire | EXPERIENCE gouverne les messages ; DESIGN et EXPERIENCE restent compagnons (`EXPERIENCE.md:98–129,219–241`). | Référence suffisante à cette altitude ; contrôles à exécuter lors de la réalisation, sans certification annoncée. |
| Maintenance minimale et gestion native Google/Gmail | AD-9 : versions et courte note, sans nouvel outil ou procédure détaillée ; AD-11 : tests. EXPERIENCE `:154,216` reste compatible. | Dernier accord respecté ; aucune procédure suspendre/restaurer/vérifier/rouvrir imposée. |

Les maquettes demeurent des références de disposition avec données fictives. S6–S11 restent décrites dans les contrats/interfaces natives selon l’hypothèse de couverture non bloquante ; leur absence de maquette n’est pas une exigence perdue.

## Sources relues

- [Spine](../ARCHITECTURE-SPINE.md), lignes 28–200.
- [DESIGN](../../../ux-designs/ux-tema-academie-2026-10-20/DESIGN.md), lignes 1–241.
- [EXPERIENCE](../../../ux-designs/ux-tema-academie-2026-10-20/EXPERIENCE.md), lignes 1–334.
- [Contrat de données](../../../../specs/spec-tema-academie-v1/contrat-donnees.md), passages révision, rejeu et résultat commun.
- Journal d’architecture, arbitrages des 26 octobre sur admission et maintenance ; `docs/project/handoff.md`, reprise du 26 octobre. Ces accords récents priment sur les formulations historiques.

Écriture limitée à ce rapport. Aucun autre artefact modifié par cette réconciliation.
