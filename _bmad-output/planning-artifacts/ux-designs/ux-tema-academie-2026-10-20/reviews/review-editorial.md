# Revue éditoriale native — Contrats UX Tema Académie

Date : 20 octobre 2026. Lentilles natives exécutées par le parent : **structure**, puis **prose**. Le présent fichier consigne leurs recommandations transmises à l’auteur et leur application ; il ne constitue pas une revue UX supplémentaire ou une preuve d’essai produit.

Base relue annoncée par la lentille structure : **DESIGN.md, 1 917 mots ; EXPERIENCE.md, 5 427 mots**. Ces nombres décrivent l’entrée de revue, avant les corrections ci-dessous.

## Structure — Trois recommandations retenues

| Recommandation | Application |
|---|---|
| Déplacer « Résultat commun des demandes » de Voice and Tone vers State Patterns. | Bloc déplacé intégralement avant le tableau des états par surface, sans suppression de règle ; Voice and Tone conserve les textes d’interface. |
| Condenser DESIGN [ASSUMPTION VIS-4] en traduction visuelle. | Détail du protocole dupliqué remplacé par les distinctions visuelles et des liens vers les règles communes et opérations privées d’EXPERIENCE.md. La source comportementale complète reste présente. |
| Retirer les deux phrases de clôture sur les revues optionnelle et éditoriale. | Retirées du contrat d’expérience ; l’état des revues est conservé dans ce compte rendu et le journal, puis transmis au handoff par le parent. |

## Prose — Quatre lignes, cinq remplacements retenus

| Formulation relue | Correction appliquée |
|---|---|
| « Cette session vient d’être complétée. » | « Cette session est maintenant complète. » |
| « Avant claim et reprise, relire annulation et comparaison entre instantané et session actuelle » | « Avant claim et reprise, relire le statut de l’inscription et comparer l’instantané à la session actuelle » |
| « sans troncature indispensable à la décision » | « sans troncature des informations indispensables à la décision » |
| Formulations pouvant faire croire à une preuve déjà acquise : « selon le critère mesuré de la spécification » et « Administration principalement testée sur ordinateur ». | « selon le critère de délai fixé dans la spécification » et « Administration à tester principalement sur ordinateur ». |

Toutes les recommandations transmises sont retenues. Aucun parcours, comportement métier, périmètre, montant ou accord humain n’est modifié. Les squelettes natifs DESIGN/EXPERIENCE sont conservés.

## Clôture documentaire et limites

Les deux contrats portent `status: final` pour leur maturité de rédaction et `approval: pending-human-validation` pour l’approbation attendue de Sofiane. L’identité visuelle demeure partielle/non vérifiée ; les propositions de détail et les preuves techniques restent ouvertes. Aucune maquette ni revue UX optionnelle par lentilles supplémentaires n’a été produite.

Contrôles de clôture : YAML et sources résolus, correspondance des 20 composants, liens locaux et ancres, références de tokens et couverture CAP-1 à CAP-8 vérifiés. La finalisation est enregistrée par append dans `.memlog.md`. Aucun de ces contrôles documentaires ne valide Google, Vercel, MailApp ou les agendas réels.
