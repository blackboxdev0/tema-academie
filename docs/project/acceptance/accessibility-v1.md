# Accessibilité V1 — contrôle du 30 octobre 2026

## Portée et méthode

Contrôle ciblé WCAG 2.1 A/AA selon le skill `design:accessibility-review` : moteur axe, clavier, structure et noms accessibles, contrastes et largeur de lecture réduite. Ce dossier ne constitue pas une attestation complète de conformité WCAG.

Outils : Playwright 1.64.1 et `@axe-core/playwright` 4.13.0, version exacte enregistrée avec le lock npm. Le registre npm consulté le 30 octobre donne 4.14.0 comme version courante, mais celle-ci demande Node >=22.12 ; 4.13.0 reste compatible avec Node 22.9 du projet. Aucun changement de runtime. L’installation a retourné zéro vulnérabilité connue pour les six paquets installés.

La [documentation officielle Playwright](https://playwright.dev/docs/accessibility-testing) guide l’intégration axe et rappelle les limites des scans automatiques. Tags retenus : `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`. Aucun élément exclu et aucune règle désactivée.

## Résultats et preuves

La suite [accessibility.spec.cjs](../../../app/tests/browser/accessibility.spec.cjs) contrôle huit états : catalogue, fiche, formulaire, politique, confirmation, erreur de champ, résultat inconnu et catalogue paginé. Les quatre projets sont Chromium ordinateur, Chromium format Pixel 7, Firefox et WebKit Playwright. WebKit utilise Option+Tab pour inclure les contrôles selon la préférence native macOS ; cela ne constitue pas un essai de Safari installé.

Les écritures et envois de cette suite restent dans le harness Node privé. Toute requête navigateur vers une origine externe est bloquée par le runner. Les coordonnées sont fictives en `example.invalid`, le serveur statique n’expose aucun endpoint de simulation. Le port 4193 permet de laisser les serveurs de recette et les autres tests séparés.

Commande de reproduction, depuis `app/` :

```sh
npm run build
TEMA_TEST_PORT=4193 TEMA_BROWSER_MATRIX=all npm run test:a11y
```

Le résultat final de cette commande et le détail des scans sont consignés au checkpoint ci-dessous. Les preuves brutes de cette session restent hors Git : `/tmp/tema-a11y-final.json` et `/tmp/tema-a11y-results-final/`.

Lecture réelle complémentaire sur `http://127.0.0.1:4183/` connecté à Google TEST : catalogue (six cartes visibles), première fiche Dimo, formulaire puis politique. Les quatre scans Chromium ne signalent aucune violation dans les règles exécutées. Aucun formulaire rempli ou soumis ; aucune requête POST émise, aucune place réservée, aucun email envoyé. Preuve synthétique locale : `/tmp/tema-a11y-real-read.json`. Confirmation et erreurs restent éprouvées avec le runner privé.

### Deux écarts détectés et corrigés

| Écart reproduit | Correction | Vérification |
|---|---|---|
| Les bordures normales des champs `#D3D0D4` ne permettent pas de repérer suffisamment le champ blanc : contraste 1,528:1 sur blanc et 1,427:1 sur le fond `#F8F7F5`. | Bordure des champs texte uniquement assombrie vers `#918E92` ; dimensions et focus rose conservés. | Contrastes calculés sur les couleurs rendues : 3,237:1 sur blanc et 3,023:1 sur le fond. Le test vérifie aussi le focus sur les deux fonds. |
| Au clavier, activer Page 2 remplace les boutons de pagination et perd le focus. Le nouveau compte affiche pourtant bien 7–12 sur 24. Reproduit dans les quatre projets. | Le focus rejoint le compte de résultats rendu focalisable, cohérent avec le défilement existant vers le début du lot. | Activation par Entrée, compte 7–12, focus sur ce compte, puis Tab vers la première fiche du nouveau lot. |

Le contrôle de bordure applique [WCAG 1.4.11, niveau AA](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) : le fond blanc du champ et le fond de page étant très proches, la limite est nécessaire pour identifier la zone de saisie. La valeur 3:1 est un seuil sans arrondi.

### Contrastes complémentaires

Axe classe certains contrastes de la fiche comme indéterminés, notamment autour du fond décoratif pseudo-élément, et ceux des flèches. Aucun résultat indéterminé n’est assimilé à un PASS automatique. Les couleurs CSS utiles à ces cas ont été rapprochées et calculées :

| Usage | Premier plan / fond | Ratio | Seuil applicable |
|---|---|---:|---:|
| Texte principal, flèches de navigation | `#20212B` / blanc | 15,984:1 | 4,5:1 texte |
| Texte secondaire sur blanc | `#62636F` / blanc | 5,943:1 | 4,5:1 |
| Texte secondaire sur panneau | `#62636F` / `#F4F4F4` | 5,403:1 | 4,5:1 |
| Petites mentions accentuées | `#C6006F` / blanc | 5,784:1 | 4,5:1 |
| Grands chiffres de date | blanc / `#FF008F` | 3,718:1 | 3:1, grande taille |
| Petites mentions sur rose | `#260016` / `#FF008F` | 5,163:1 | 4,5:1 |
| Disponibilité | `#236247` / `#EAF5EC` | 6,451:1 | 4,5:1 |
| Focus rose du champ | `#FF008F` / fond `#F8F7F5` | 3,472:1 | 3:1 non textuel |
| Message d’erreur | `#8D1740` / `#FFF0F7` | 8,183:1 | 4,5:1 |

Le blanc sur rose n’est utilisé ici que pour les grands chiffres de date ; les petites mentions ont un texte foncé. Le contrôle des valeurs de palette ne remplace pas une évaluation perceptive avec des utilisateurs.

### Clavier, structure et largeur réduite

- Lien d’évitement visible au focus puis accès au `main` ; navigation jusqu’à une fiche par Tab et Entrée, indicateurs de focus présents.
- Un `main`, une langue française déclarée, un titre de niveau 1 visible par écran, hiérarchie de titres et libellés natifs des champs ; logo doté d’un texte alternatif. Aucun contrôle personnalisé de type grille ARIA n’est annoncé à tort.
- Focus placé sur les titres de parcours et de confirmation ; erreurs associées au champ avec `aria-invalid` et `aria-describedby`, résumé en alerte, action de correction atteignable au clavier. Le résultat inconnu garde une reprise clavier accessible.
- Fiche et formulaire sans débordement horizontal à 640 et 320 CSS px. 640 CSS px reproduit la largeur de mise en page d’une fenêtre 1280 px zoomée à 200 % ; le zoom natif du navigateur et le zoom du texte seul restent à vérifier manuellement. Le CSS `zoom:2` sur `body` n’a pas été retenu comme preuve de zoom navigateur, car il ne reproduit pas ses media queries.
- Les cibles de 44×44 CSS px du skill restent une recommandation de confort : [WCAG 2.1 2.5.5 est de niveau AAA](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html). Les liens de navigation/texte et certains petits contrôles n’ont pas tous cette taille ; aucune conformité AAA n’est revendiquée.

## Limites et checkpoint

VoiceOver, NVDA, Safari installé, téléphone physique, zoom natif et test avec une personne utilisant une technologie d’assistance : non vérifiés dans cette campagne. Les scans axe ne prouvent pas le comportement oral complet, la compréhension des contenus ni l’intégralité des critères WCAG. Aucun changement de Google, commit/push ou transition Linear réalisé par cet audit.

Checkpoint final : build réussi, **20 tests réussis sur 20 en 27,2 s**, quatre projets, **32 scans axe sans violation dans les règles exécutées** après les deux corrections. Les quatre scans réels en lecture seule apportent une preuve distincte sur les écrans connectés à Google TEST. Le statut de conformité complète reste ouvert aux contrôles manuels non réalisés ci-dessus.
