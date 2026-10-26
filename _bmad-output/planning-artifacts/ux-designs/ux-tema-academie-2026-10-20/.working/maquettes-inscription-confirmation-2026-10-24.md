# Maquettes d’inscription et de confirmation — 24 octobre 2026

Références proposées pour les surfaces S4/S5, à la demande de Sofiane après la direction graphique V2 retenue. Les contrats DESIGN.md et EXPERIENCE.md restent la référence ; ces fichiers illustrent leur traduction graphique et attendent leur validation humaine.

- [Formulaire](key-inscription-v2.html) : récapitulatif avant les champs, coordonnées fictives, téléphone facultatif, accord décoché, lien de politique provisoire, action Confirmer mon inscription et Changer de date.
- [Confirmation](key-confirmation-v2.html) : place réservée avec certitude, récapitulatif, état d’envoi distinct, contact Tema et retour au catalogue.

## Retour de Sofiane

Le formulaire est accepté le 24 octobre pour son fonctionnement et sa disposition. Sofiane juge le traitement visuel trop générique et souhaite reprendre la finition plus tard ; la maquette ne constitue donc pas une exécution graphique finale approuvée. La hiérarchie de la confirmation est ensuite acceptée : place réservée, récapitulatif, état du courriel/invitation, puis retour au catalogue/contact. La réserve graphique reste applicable. Les contrats seront distillés au prochain jalon avec cette distinction, sans nouvelle approbation globale ou GO déduit.

## Variantes consultables

| Surface | État | Référence |
|---|---|---|
| Formulaire | Initial, accord décoché | [Formulaire](key-inscription-v2.html#normal) |
| Formulaire | Adresse courriel invalide | [Champ à corriger](key-inscription-v2.html#erreur) |
| Formulaire | Dernière place prise, refus certain | [Session complète](key-inscription-v2.html#complet) |
| Formulaire | Résultat inconnu et reprise de la même demande | [Résultat inconnu](key-inscription-v2.html#inconnu) |
| Formulaire | Récapitulatif modifié à reconfirmer, champs conservés | [Conditions modifiées](key-inscription-v2.html#conditions-modifiees) |
| Confirmation | Courriel accepté par le service, invitation jointe | [Confirmation](key-confirmation-v2.html#confirmee) |
| Confirmation | Courriel non envoyé, place maintenue | [Échec d’envoi](key-confirmation-v2.html#envoi-echoue) |
| Confirmation | Envoi incertain, place maintenue | [Envoi incertain](key-confirmation-v2.html#envoi-incertain) |
| Confirmation | Horaires fictifs reconfirmés après modification | [Horaires mis à jour](key-confirmation-v2.html#horaires-modifies) |

Les variantes se consultent depuis une barre de revue séparée du contenu produit, sans afficher tous les états à la fois. Le clic de démonstration vers la confirmation devient visible après avoir coché l’accord ; il n’effectue aucune soumission. La variante Conditions modifiées mène à la confirmation illustrant les mêmes horaires actualisés.

## Sources et limites

Session de démonstration reprise de la fiche V2 : Ergonomie, jeudi 12 novembre 2026, 9 h à 12 h 30, heure de Montréal, en ligne, tarif À partir de 450 $ CAD par participant, taxes en sus. La variante de changement illustre 13 h à 16 h 30, horaires également fictifs. Logo et fontes Manrope/Inter embarqués depuis les actifs V2, licences OFL conservées ; aucun téléchargement ou modification de l’original.

S4 et S5 illustrent FormulaireInscription, ChampSaisie, ConsentementConfidentialité, MessageÉtat, RécapitulatifInscription et BoutonAction ; State Patterns S4/S5 et parcours F2/F3. Une personne/place par demande, entreprise libre vérifiée par Tema après confirmation ; aucun état d’approbation, paiement, compte participant ou renvoi automatique ajouté.

Ces pages sont autonomes, sans JavaScript, formulaire soumis, ressource distante ou stockage personnel. Marie Tremblay/Usinage ABC sont l’exemple fictif du PDF ; `marie.tremblay@example.test` est une adresse de démonstration. Le lien visio manque dans cet exemple et son envoi ultérieur manuel est annoncé avec le texte convenu. La politique et le texte d’accord restent à faire valider par Tema avant ouverture réelle.

Contrôle de source : identifiants uniques, 33 liens/ancres locaux résolus, accord décoché, aucun script ou formulaire envoyé. La QA navigateur est menée séparément par le parent ; aucun résultat de réservation, de conservation de contexte entre fichiers, de courriel ou de Google/Vercel n’est prouvé par ces maquettes.

## Corrections ciblées après relecture visuelle

- Dans l’état Session complète, le bouton Changer de date garde un texte blanc, y compris au survol et au focus. La règle ne modifie pas les liens texte de contact.
- Le récapitulatif affiche alors le statut courant Complet ; la disponibilité initiale de quatre places et son aide sont masquées dans ce seul état. Les coordonnées restent présentes et le refus certain conserve son action.
- Les sélecteurs de masquage des horaires alternatifs sont conservés avec leur spécificité renforcée ; seuls les états de modification prévus affichent ces horaires. Ces corrections de source attendent le rechargement et le contrôle navigateur ciblé du parent.

La barre d’états sert uniquement à comparer les vues de démonstration ; elle ne consulte aucun stock, ne reprend aucune demande réelle et ne prouve pas une conservation de données entre fichiers.
