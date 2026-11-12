# Contraste des dates et arrêt du scroll Firefox

GO Sofiane du10novembre2026, corrections locales après la recette sans Paramètres. Aucun changement Google, aucune inscription ou tentative d’envoi. Le site local conserve sa connexion COPY.

## Corrections

Fond des dates de catalogue : rose action existant #C6006F à la place de #FF008F. Tous les textes restent blancs ; contraste calculé5,784:1, supérieur à4,5:1 pour les petits textes. Palette de marque, bordures focus et composition conservées. L’assertion visuelle de composition attend maintenant ce fond ; les règles axe restent activées.

Préférence « réduire les animations » après interaction : un scrollTo instant à la même position pouvait laisser continuer le défilement natif Firefox. Déplacement synchrone1px puis retour avant l’image suivante pour interrompre réellement le mouvement ; la position visible est conservée. Sans interruption utilisateur, la navigation termine toujours instantanément à destination. Défilement natif, focus, historique, cache et entrée des vues inchangés.

## Revue et preuves

Build oneshot avec revue indépendante Blind Hunter. Trois constats confirmés et corrigés : ancienne assertion couleur, test qui n’assurait pas un mouvement encore actif, stabilité qui aurait accepté un saut final. Relecture complémentaire sans défaut concret restant. Risque faible non reproduit : une machine très ralentie pourrait finir le scroll avant l’émulation ; l’assertion de distance refuse alors le scénario au lieu de donner un faux PASS.

- Scénario Firefox précédemment intermittent :10répétitions réussies après patch.
- Mouvement :36/36 sur quatre profils, avec32frames d’observation, sens montant/descendant et position mesurée au premier appel natif après réduction.
- Contrôle du site local relié à COPY : fond rgb(198,0,111), quatre éléments date blancs,30formations affichées après lecture fraîche. Aucune écriture Google.
- Artefacts/calendrier :9/9 exécutés, zéro ignoré, après avoir retrouvé les deux ICS privés historiques dans acceptance-v1 et renseigné TEMA_AUDIT_RECEIVED_ICS_DIR. Ce contrôle de fichiers déjà reçus ne prouve pas une nouvelle réception ou un import agenda.
- Matrice complète finale :292/292 réussis sur Chromium, mobile Chromium, Firefox et WebKit ; zéro échec. Commande TEMA_TEST_PORT=4187 TEMA_BROWSER_MATRIX=all npm run verify terminée avec code0. Standard132/132, COPY238/238, audit21/21 et deux scénarios VM réussis, build/sécurité réussis. Le premier passage artefacts de cette commande avait deux contrôles ignorés car variable absente ; leur relance ciblée documentée ci-dessus exécute les neuf avec zéro échec et zéro ignoré. La première passe a été interrompue pour intégrer l’assertion visuelle et les tests renforcés ; elle ne constitue pas une preuve finale.

Preuves brutes privées hors dépôt dans contrast-motion-20261110. Aucun commit/push/déploiement. Recette globale TEM-27 reste distincte.

Ces tests navigateur utilisent le moteur de test et des réponses simulées pour les écritures ; aucun nouveau parcours d’admission réel Google n’a été rejoué. La recette réelle précédente reste référencée dans full-copy-recipe-2026-11-10.md. Les neuf échecs de cette recette sont résolus par cette passe locale ; cela ne clôture pas l’acceptation globale de TEM-27.

## Ajustement de navigation suivant
À la demande de Sofiane, les liens de l’en-tête affichent au hover la même bordure rose3px que le lien sélectionné, en remplaçant le soulignement noir. Build et diff réussis ; navigateur local : Calendrier non sélectionné, hover actif, bordure rgb(255,0,143) et text-decoration none vérifiés. Modification CSS seulement, sans nouvelle matrice complète.

## Décision visuelle ultérieure de Sofiane
Sofiane demande explicitement de restaurer le rose initial #FF008F sur les bandeaux de dates pour conserver l’expérience visuelle. Fond et assertion de composition restaurés ; blanc conservé, correction Firefox et survol rose inchangés. Le contraste des petits textes revient à3,71:1 : les résultats verts précédents décrivent le candidat antérieur et ne valent plus pour ces audits de contraste. Aucun assouplissement des règles axe.
