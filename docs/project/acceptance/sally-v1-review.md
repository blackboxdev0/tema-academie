# Revue UX Sally — candidat V1 local

Revue du 30 octobre 2026 effectuée, **avis favorable sur les surfaces examinées ; les cinq constats UX sont corrigés et UX-05 est contre-vérifié avec Google TEST version 5**. Aucun P1 ni P2 restant identifié dans cette passe ciblée. Cet avis ne constitue pas l’acceptation humaine du livrable. La revue applique le vrai skill `bmad-agent-ux-designer` : résolveur de personnalisation exécuté, persona Sally activée, configuration française chargée ; aucune étape personnalisée ni fait persistant additionnel.

## Références et méthode

Référence actuelle : les cinq HTML de `.working/` dans `_bmad-output/planning-artifacts/ux-designs/ux-tema-academie-2026-10-20/` (`accueil-tema-academie.html`, `fiche-ergonomie.html`, `fiche-tema-academie.html`, `inscription.html`, `confirmation.html`), avec DESIGN et EXPERIENCE et les décisions du 29 octobre. Les anciennes références V2 ne constituent pas la cible visuelle. Aucune nouvelle direction graphique n’est proposée.

Lecture du code et comparaison visuelle Chromium sur `http://127.0.0.1:4183`, ordinateur 1440 px et téléphone 390 px. Les premières captures correspondent à Google TEST encore en version TEM-6 : une formation fictive, dates fermées, inscription désactivée. Cette donnée est une limite de la passe, pas un défaut du futur catalogue V1.

Captures temporaires hors dépôt : `/tmp/tema-sally-home-desktop.png`, `/tmp/tema-sally-detail-desktop.png`, `/tmp/tema-sally-home-mobile.png`, `/tmp/tema-sally-detail-mobile.png` ; références rendues dans `/tmp/tema-sally-reference-home-desktop.png` et `/tmp/tema-sally-reference-detail-desktop.png`. Ces captures initiales décrivent un candidat en cours de correction, pas une preuve du rendu final.

## Constats initiaux transmis pour correction

| Réf. | Priorité | Constat et preuve | État |
|---|---|---|---|
| UX-01 | P2 | Fidélité aux maquettes courantes : cartes avec date grise au-dessus, corps blanc et lien simple ; direction 03 approuvée avec date rose/blanc latérale, contenu gris clair et action sur socle graphite. Confirmé dans les captures réelles ordinateur et téléphone, et par `.card-date`/`.card-body` dans `app/web/styles.css`. | Corrigé et observé sur le build local avec catalogue simulé de 24 formations source. Les petites métadonnées sur rose passent en graphite pour leur lisibilité ; le grand numéro reste blanc. |
| UX-02 | P2 | Fiche : programme dans trois colonnes horizontales et dates sur fond papier ; référence avec programme/résultat/prérequis structurés dans un blanc continu jusqu’aux dates, récapitulatif avec grande tuile rose sur ordinateur. Même famille d’écarts : titre accueil recoloré et retour ligne imposé, filtres arrondis à droite au lieu du traitement courant. | Corrigé et observé : programme éditorial, blanc continu, date rose du récapitulatif, titre graphite et filtres sous le titre. |
| UX-03 | P2 | « Voir les dates » remplace l’URL par `#dates-formation`, sans identifiant formation/mois/date. Une ouverture neuve ne peut reconstruire la fiche ; la branche de routage peut traiter une ancre absente et afficher un échec d’actualisation malgré une lecture réseau réussie. Preuve : `app/web/app.js`, lien dans `renderDetail` et traitement d’ancre dans `applyRoute`, puis ouverture réelle du hash seul. | Corrigé et contre-vérifié avec GET simulé : formation/date/mois/section conservés, rechargement sur la même fiche et focus sur `dates-formation`. |
| UX-04 | P2 | Lors d’un échec de lecture en fiche, l’erreur n’était écrite que dans `#catalogue-status`, caché par la vue fiche ; les places anciennes restaient sans avis visible. | Correction déjà observée : interception locale du GET Google en échec, avis visible sur la fiche, ancienneté et variation des places nommées, bouton de réessai. Aucun appel d’inscription. |
| UX-05 | P2 | Projection du contenu Ergonomie : l’introduction reprend le programme puis le répète dans sa rubrique ; « Formation destinée aux utilisateurs de Divalto… » reste sous Prérequis. La maquette courante utilise cette phrase pour l’introduction et garde seulement les connaissances/équipement dans les prérequis. Confirmé avec le vrai catalogue Google dans la capture de fiche. | Corrigé et contre-vérifié en session neuve sans interception avec Google TEST version 5 : audience en introduction, programme complet conservé, seuls les prérequis de connaissances/équipement dans leur rubrique. |

Les aides Entreprise/Courriel et la disponibilité au choix de la date manquaient sur le premier formulaire : elles ont été rétablies et observées. Les badges de disponibilité des calendriers ont également été portés à 12 px, taille calculée vérifiée sur le build local.

La reconstruction périodique des commandes présentait aussi un risque de perte de focus. Après correction, le bouton « Mois suivant de la formation » conserve son focus lors d’une actualisation à données identiques, puis après modification du prix dans la réponse GET simulée. Aucun déplacement intempestif observé sur cette commande.

## Points déjà observés

- Ordre programme puis dates conservé ; la consultation d’une date fermée reste possible et l’inscription reste désactivée.
- Sur téléphone, la liste mensuelle remplace la grille ; le récapitulatif suit immédiatement la date sélectionnée.
- Aucun défilement horizontal global observé sur la fiche à 390 px.
- Réservation et état du courriel sont distincts dans le code ; une reprise n’est pas présentée comme une nouvelle réservation.
- Revue du produit en lecture seule : seul ce compte rendu a été écrit ; aucun changement de code, Google ou Linear, aucune opération Git de mutation, aucune inscription ni émission de courriel.

Contre-vérification complémentaire : catalogue GET simulé depuis les 24 textes source et sessions du harness local. Cette passe couvre le rendu du code produit et ses interactions, sans prouver le catalogue réel Google. Le formulaire s’ouvre, le retour depuis la politique conserve une saisie fictive et laisse l’accord décoché, les aides réapparaissent, aucun débordement global n’est observé à 390 px. Le compteur d’appels POST reste à zéro.

Captures complémentaires : `/tmp/tema-sally-final-home-desktop-simulated.png`, `/tmp/tema-sally-final-detail-desktop-simulated.png`, `/tmp/tema-sally-final-form-desktop-simulated.png`, `/tmp/tema-sally-final-form-mobile-simulated.png`.

## Contre-vérification Google TEST V1 réelle

Après signal du parent (Apps Script TEST version 4), création d’un **nouveau contexte Chromium**, sans interception ni remplacement de configuration. Réponse réelle Google anonyme HTTP 200 : 24 formations et trois sessions. Les quatre pages du catalogue affichent 24 titres uniques. Aucune requête POST n’a été émise pendant cette passe.

La fiche Ergonomie présélectionne la date du 15 janvier 2027 ; le lien « Voir les dates » conserve formation/date/mois/section après un véritable rechargement et redonne le focus à la zone des dates. Le formulaire affiche formation, durée, date/horaires Montréal, tarif qualifié, format et disponibilité au choix de la date ; cinq champs, aides Entreprise/Courriel et accord initial décoché. La politique TEST s’ouvre et revient au parcours. À 390 px, aucun débordement global observé et le récapitulatif mobile suit immédiatement la session choisie.

Captures réelles hors dépôt : `/tmp/tema-sally-google-v1-home-desktop.png`, `/tmp/tema-sally-google-v1-detail-desktop.png`, `/tmp/tema-sally-google-v1-form-desktop.png`, `/tmp/tema-sally-google-v1-form-mobile.png`, `/tmp/tema-sally-google-v1-detail-mobile.png`. La disponibilité observée est un instantané de recette, pas une promesse de place durant la saisie. La revue ne modifie ni Google ni les budgets d’envoi.

## Confirmation réelle examinée

Le parent fournit la capture de sa campagne réelle autorisée : `/Users/sofiane/.config/tema-academie/acceptance-v1/confirmation-real-v1.png`. Sally l’a inspectée : certitude de réservation en premier, phrase formation/date/horaires, récapitulatif pratique, puis état du courriel et de l’invitation. Le texte précise une acceptation par le service d’envoi et demande de vérifier boîte/indésirables ; il ne transforme pas cet état en preuve de réception.

La hiérarchie et la continuité du récapitulatif sont cohérentes avec la confirmation approuvée. Cette capture est une vue ordinateur partielle : le bas de page et une confirmation réelle sur téléphone n’y sont pas visibles. Sally n’a pas déclenché l’inscription et ne certifie pas par cette image la ligne privée, le fichier agenda reçu ou la réception du courriel. Ces preuves relèvent de la campagne du parent. Les variantes erreur/incertitude ont été relues dans le code ; leurs résultats réels appartiennent à cette campagne, pas à cette capture de succès.

## Dernière contre-vérification — Google TEST version 5

Nouveau contexte Chromium sans interception ni remplacement de configuration sur le vrai candidat local connecté à Google TEST. Zéro POST. La fiche Ergonomie montre désormais l’introduction « Formation destinée aux utilisateurs de Divalto souhaitant améliorer leur efficacité au quotidien. », le programme dans sa rubrique, puis « Connaissances informatiques de base; un ordinateur avec Divalto installé. » sous Prérequis. Capture réelle hors dépôt : `/tmp/tema-sally-google-v5-ergo-desktop.png`. UX-05 est résolu.

La pagination vers la deuxième page donne le focus à `catalogue-status`, au début des résultats. Depuis un formulaire éligible, l’activation du lien d’évitement puis l’ouverture de la politique et son retour rétablissent bien le formulaire, gardent la saisie fictive et l’accord décoché, et donnent le focus au lien de politique. La bordure des champs au repos est calculée `rgb(145, 142, 146)` (`#918E92`). Aucun débordement global observé à 390 px après ce parcours.

Cette dernière passe observe 25 offres et cinq sessions : le parent a temporairement réactivé la fixture historique pour ses mesures d’édition Google. Cette fixture ne fait pas partie des 24 formations source ; son masquage et le contrôle du catalogue final avant remise restent sous la responsabilité de la campagne du parent. Ce nombre transitoire ne constitue pas une approbation d’un catalogue à 25 offres.

Les contrôles de focus après variation de données restent locaux simulés ; le rechargement, les 24 offres de la passe version 4 et le formulaire sont également vérifiés avec Google réel. Les états d’erreur transport ont été vérifiés avec interception locale, en les identifiant comme simulation. Le parent indique trois confirmations et trois avis reçus dans sa campagne réelle ; la présente revue UX n’a pas inspecté elle-même ces boîtes de réception.

## Réserves de recette humaine et limites

La recette finale appartient à Sofiane. Cette revue ne prouve ni la réception réelle des messages, ni l’import Outlook/Apple Calendar, ni les droits Google d’un autre employé, ni un appareil physique, ni une conformité WCAG exhaustive. La politique et les modalités de conservation restent des propositions TEST à valider par Tema avant ouverture réelle. Aucun avis de Sally ne vaut acceptation humaine ou autorisation de publication.
