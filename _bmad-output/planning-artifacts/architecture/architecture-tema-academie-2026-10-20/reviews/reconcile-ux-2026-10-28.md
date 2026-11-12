# Réconciliation UX → architecture — 28 octobre 2026

**Verdict : compatible pour la clôture documentaire G0 et la revue UX/UI suivante.** Aucun écart P0/P1/P2 constaté entre les parcours et dispositions approuvés et la spine consolidée. La précision de classement issue du nouveau cas « Tarif à confirmer » a été appliquée puis relue dans AD-8 et le compagnon ; aucun point de réconciliation UX ne reste ouvert au G0.

## Sources et limites

- Contrats UX lus ensemble : `ux-tema-academie-2026-10-20/DESIGN.md` et `EXPERIENCE.md`, sources en lecture seule.
- Cible : `ARCHITECTURE-SPINE.md`, version de consolidation du 28 octobre, 11 AD stables ; compagnon `docs/project/architecture/controle-technique-v1.md`.
- Les décisions humaines plus récentes gouvernent les références historiques : publication normale <2 min et secours 5 min ; tarif absent présenté « Tarif à confirmer » et inscription désactivée ; Outlook/Apple en recette complète.
- Cette réconciliation ne valide ni la finition graphique, ni le code, ni les mesures de cadence, ni les effets Google. Le bilan TEM-6 4 PASS / 8 NON VÉRIFIÉ et les limites des tests locaux restent inchangés. Aucun GO principal n’est déduit.

## Couverture des exigences UX

| Domaine UX | Contrat conservé | Ancrage de l’architecture |
|---|---|---|
| Offre et navigation | Catalogue avant calendrier général, filtre logiciel commun, fiche avant inscription ; aucun back-office web ou compte participant ajouté | AD-2 et AD-3 conservent le site portable et le contrat partagé ; AD-8 gouverne projection et sélection sans déplacer les dispositions de DESIGN/EXPERIENCE |
| Calendriers et sélection | Mêmes dates dans grille/liste, choix explicite, date cliquée prioritaire, mois pertinent à l’arrivée puis navigation libre ; récapitulatif proche de la date en mobile | AD-8 conserve visibilité et sélection ; aucune règle technique ne force un autre mois ou une sélection implicite ; les détails restent dans les contrats UX adoptés |
| États d’offre | Inactive masquée ; active sans date consultable ; complète/terminée consultables sans inscription ; fermée sans confirmé masquée ; capacité par date, sans plafond huit | AD-8 conserve ces distinctions et l’historique ; le nouveau prix absent ne détourne pas `closed`/« Inscriptions terminées » |
| Tarif à confirmer | Formation et date déjà visibles restent consultables ; action désactivée et raison lisible | AD-3 et AD-8 ajoutent une éligibilité dérivée, sans nouvelle commande gestionnaire ni prix zéro déduit ; AD-4 refuse aussi côté serveur |
| Formulaire et retours | Page dédiée, récapitulatif avant coordonnées/accord/action ; champs obligatoires et téléphone facultatif ; changer de date garde le contexte et la saisie transitoire | AD-2 permet des vues statiques sans réécriture serveur ; AD-7 limite les coordonnées à la mémoire de parcours, sans URL ou stockage durable ; aucune restauration après fermeture navigateur promise |
| Résultat fiable | Réservation certaine avant confirmation ; refus certain distinct d’inconnu ; reprise même demande, annulation non réactivée, conditions modifiées à reconfirmer | AD-4 et AD-6 conservent les statuts communs et le replay prioritaire ; AD-11 exige leurs preuves et ne confond pas simulation et réalité |
| Courriels et agenda | Place maintenue après incident email, avis Tema si possible, suivi manuel Gmail, lien visio privé ou à venir, aucun renvoi applicatif | AD-5 conserve les états séparés, l’éligibilité avant engagement, la limite d’un envoi déjà engagé, l’absence de troisième alerte et la transmission manuelle du lien |
| Administration et changements | Interface Google native ; actif/ouverture distincts ; fermer/modifier la même ligne/prévenir/rouvrir ; annulation conserve sa ligne, réinscription nouvelle ligne | AD-3/4/8/9 conservent IDs, instantanés et compteurs ; aucun menu de maintenance ou relance n’est introduit |
| Confidentialité et accessibilité | Politique consultable avant accord, consentement non précoché, pas de coordonnées publiques ; messages persistants, clavier/zoom/contrastes/lecture mobile à contrôler | AD-7 et AD-11 gardent confidentialité et preuves d’interface ; le compagnon G4 maintient textes, accessibilité et accès requis avant ouverture |
| Identité visuelle | Logo original, rose Tema, base Manrope/Inter ; finition générique à reprendre, maquettes non approuvées comme exécution finale | Aucune AD ne crée de nouvelle identité ou n’annonce une approbation graphique finale ; G0 mène à cette revue UX/UI sans la remplacer |

## Précision de classement résolue et suivi visuel

**P3 initial résolu — Classement d’une formation avec dates visibles mais prix absent.** Le libellé historique UX-SORT décrivait son deuxième groupe comme les formations dont les dates sont toutes `full`/`closed`. Une date `open` avec `registration_enabled=false` pour prix absent introduit un cas visible non réservable. Après signalement, AD-8 et le compagnon de contrôles ont été précisés ; la partition exhaustive suivante a été relue dans les deux sources.

Règle désormais explicite dans AD-8 et le compagnon : groupe 1 = au moins une date avec `registration_enabled=true` ; groupe 2 = au moins une date future visible et aucune éligible, y compris le tarif à confirmer ; groupe 3 = aucune date future visible. Ordre source à égalité et inactives toujours masquées. Les libellés Complet/Inscriptions terminées restent distincts et le cas prix absent porte sa raison propre, sans quatrième statut de calendrier ou commande de priorité.

La recherche de la prochaine date réservable sur la fiche et les cartes utilise explicitement `registration_enabled`, ce qui conserve la cohérence de cette partition. L’état « Tarif à confirmer » et le message d’attente après refus de rafale sont des variantes à illustrer pendant la phase UX/UI suivante ; leur graphisme n’est pas fixé par cette architecture.

## Éléments historiques qui ne sont pas de nouveaux blocages

Les mentions UX du 25 octobre « aucun essai exécuté », « transport à prouver », « aucune autorisation de commit » et « <2 min non mesuré » datent la source. Les décisions et preuves ultérieures du dossier gouvernent désormais les états courants. Cette réconciliation ne réécrit pas ces contrats adoptés ni leurs maquettes ; elle n’invente pas une révocation des validations fonctionnelles/dispositions ou une acceptation de toutes les preuves produit.

Le prochain jalon reste la revue visuelle proposée avant le GO principal. Les tests clavier/appareil, transport réel, réceptions et agendas sont conservés aux étapes de réalisation/recette définies, sans succès annoncé par cette lecture documentaire.
