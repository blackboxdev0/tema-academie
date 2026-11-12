# Essai visuel natif Google Sheets — 3 novembre 2026

## Périmètre autorisé

Sofiane demande un petit essai dans une copie du Google Sheet, sans toucher au classeur actuel. Cette autorisation porte sur le prototype visuel isolé ; elle ne vaut pas intégration dans le classeur source ou le moteur.

Copie native privée : **Tema Académie — ESSAI VISUEL — 2026-11-03**.

- [Vue Formations par logiciel](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=0#gid=0&fvid=1561907260)
- [Disponibilités](https://docs.google.com/spreadsheets/d/10-aTYKJq3Idxc1eAM4hevNnZMT0jnKRCVMwaY9pFwj8/edit?gid=336481329#gid=336481329)

## Résultat observé dans Google

Formations : table native `Catalogue_Tema`, vue enregistrée `Formations par logiciel`, trois sections Dimo/Divalto/MoovApps. Formation, durée, tarif CAD et publication visibles ; identifiants, logiciel répété et longs détails masqués, sans suppression des colonnes. Titres élargis, texte 11, en-têtes français, couleur personnalisée #C6006F. Vue et mise en forme retrouvées après rechargement ; captures du rendu réel conservées temporairement hors dépôt.

Disponibilités : table native `Sessions_Tema`, noms de colonnes français, formation élargie avec retour à la ligne, date et horaires conservés tels quels, capacité, format, ouverture et places visibles. Identifiant, lien privé et diagnostic masqués ; places sur fond gris. Même couleur d’en-tête. Les cinq sessions fictives copiées sont conservées.

## Isolation vérifiée

Copie créée avec le dialogue natif, sans copie des collaborateurs ni commentaires ; badge Google « Private to only me » observé. Aucune écriture effectuée dans le classeur source, aucun script installé ou exécuté dans la copie, aucun raccordement du site, aucun envoi ou inscription. Le nom des en-têtes est modifié dans la copie seulement.

Valeurs du source lues par sélection/copie avant et après : mêmes empreintes SHA-256, mêmes plages et même sérialisation du presse-papiers Google.

| Source | Plage | Empreinte avant = après |
|---|---|---|
| Formations | A1:M26 | `02014cf6942a7c4a7116cace8c6ae9e73ccbd819e169bab89ed77799aef256a6` |
| Disponibilités | A1:K6 | `36e1ecc8db34a8ff204a7059ebdaacfa7cd8a6f4cb082e876ae197f9674117a9` |

La dernière modification du source reste indiquée par Google environ une heure avant la vérification finale. Inscriptions et Paramètres n’ont pas été ouverts ni édités pour cet essai ; leurs valeurs n’ont pas été comparées dans cette campagne.

## Limites et suite

Le rendu est celui des tables Google Sheets : sections grises, ordre natif Dimo puis Divalto puis MoovApps ; ce n’est pas le rendu exact de l’aperçu HTML. Aucun bouton/formulaire latéral, automatisme de style par logiciel ou test d’ajout de ligne n’est inclus. Les dates sont les fixtures TEST, pas une programmation client.

La copie n’est pas raccordée au moteur : les compteurs copiés ne constituent pas une preuve de recalcul après saisie. Le moteur reconnaît les noms techniques de la première ligne ; transposer ces intitulés français au source demande une décision de compatibilité, puis des tests. Les avertissements de protection copiés ont été conservés ; leur confirmation pour les seules retouches visuelles n’est pas une suppression de protection.

Acceptation visuelle Sofiane et choix de l’incrément suivant ouverts. Aucun changement de code produit, commit, push, fusion ou déploiement dans cette étape.
