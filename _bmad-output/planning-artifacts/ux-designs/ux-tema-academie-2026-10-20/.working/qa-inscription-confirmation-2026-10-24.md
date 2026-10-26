# Vérification des maquettes d’inscription et de confirmation

24 octobre 2026. Références proposées dans .working/, avant leur validation humaine et leur éventuelle promotion. Aucun code produit, essai Google/Vercel, envoi ou réservation réelle.

## Candidat et portée

| Fichier | SHA-256 après corrections |
|---|---|
| key-inscription-v2.html | `50fcbd729a595a33ccdcc45ba70c262e6eda2bdbfd3d064e35fd43522987dd9b` |
| key-confirmation-v2.html | `9bbd7b88e93d834efea84d3fe7deeb74ee62e06a706a827301ad353cf19162e3` |

Session et coordonnées fictives : Ergonomie, 12 novembre 2026, 9 h–12 h 30 ; changement illustré 13 h–16 h 30. Source métier inchangée. Logo et Manrope/Inter embarqués depuis la V2 retenue. Le choix de voir ces maquettes est consigné au journal UX ; leur approbation et celle de l’UX globale restent en attente.

## Observations navigateur

- Vues complètes ordinateur 1280 px et téléphone 390 px examinées ; largeur du document égale au viewport dans les deux vues mobiles et le formulaire ordinateur, sans débordement observé.
- Récapitulatif avant champs ; champs obligatoires/optionnel, données fictives, accord décoché et action désactivée au repos. En démo, cocher l’accord donne accès à un résultat illustré, sans soumission.
- Champ invalide : message associé et aria-invalid ; autres champs conservés dans la page. Ce n’est pas une validation serveur.
- Complet : refus certain, aucune inscription enregistrée, coordonnées conservées et Changer de date. Disponibilité actuelle Complet, aucun ancien compteur actif.
- Résultat inconnu : message distinct, Reprendre mon inscription et contact, sans affirmation de succès ou de refus certain.
- Conditions modifiées : seul horaire courant 13 h–16 h 30 avec mention de l’ancien, récapitulatif à confirmer ; le lien de démonstration mène à la confirmation des mêmes horaires.
- Courriel échoué ou incertain : place toujours affichée réservée, état d’envoi et contact séparés ; aucune relance automatique proposée.

Trois corrections de maquette appliquées : masquer les horaires alternatifs au repos ; texte blanc du bouton Changer de date sur fond #C6006F ; disponibilité courante Complet à la place des quatre places historiques. Les cas concernés ont été revus après rechargement. L’ancienne capture du cas complet est conservée séparément des vues corrigées.

## Revue Sally et preuves

[Revue experte Sally et addendum ciblé](../reviews/review-sally-inscription-confirmation-2026-10-24.md) : six captures effectivement vues ; deux corrections demandées puis observées dans la nouvelle capture du cas complet. Avis favorable aux compositions ; aucune revue indépendante complète par rubrique ou certification d’accessibilité.

Captures hors dépôt : dossier local tema-inscription-confirmation-2026-10-24 dans le répertoire de visualisations de cette tâche. Fichiers formulaire-desktop.jpg, formulaire-mobile.jpg, confirmation-desktop.jpg, confirmation-mobile.jpg, formulaire-complet-mobile.jpg, formulaire-complet-desktop.jpg et confirmation-courriel-echoue-mobile.jpg. La capture avant correction se nomme formulaire-complet-mobile-avant-correction.jpg.

Les variantes locales ne prouvent ni les reprises réseau, ni la conservation de champs entre fichiers, ni une réservation ou un courriel réel. Les liens retour ouvrent des vues illustratives ; aucun agenda ou compte Google n’est sollicité. Les deux HTML restent à relire avec Sofiane ; les contrats consolidés seront actualisés/promus sur les choix retenus.
