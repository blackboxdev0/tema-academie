# Catalogue durable — intégration et validation du 2 novembre 2026

## Décision et comportement

Après les essais d’aperçu, de cache et de lecture exclusive des disponibilités, Sofiane demande des dates actuelles dès la première visite, sans republication ni seconde source à entretenir. Le prototype batchGet puis son intégration sont autorisés ; activation de Sheets APIv4 explicitement confirmée dans TEST. La lecture groupée est maintenant la lecture publique normale. Les expériences précédentes restent hors build et leur ancienne route publique est retirée.

Sheets reste la seule source : formations, disponibilités, inscriptions et paramètres sont lus ensemble pour conserver les validations de l’offre et recomptabiliser les places depuis les inscriptions. Les informations privées servent au calcul serveur, jamais au contrat public. Aucune copie de catalogue embarquée, aucune lecture ou écriture persistante localStorage/sessionStorage. Un changement de formation, date ou prix dans Sheets est pris en compte à la lecture suivante sans republier le site. Les onglets ne sont pas dupliqués et aucun nouveau service de stockage n’est ajouté.

La page montre un chargement neutre jusqu’à la réponse fraîche. Une panne initiale propose de réessayer sans afficher d’anciennes dates. Après une lecture réussie, une panne ultérieure peut conserver l’état en mémoire avec avertissement existant. Le rafraîchissement visible périodique et l’admission serveur sous verrou restent en place. Aucune promesse de temps réel pendant une modification concurrente ; l’admission revérifie les places au POST.

## Implémentation

`app/apps-script/catalogue.js` utilise `Sheets.Spreadsheets.Values.batchGet` : Formations A:N, Disponibilités A:L, Inscriptions A:AC et Paramètres A:Z. Le schéma Paramètres réel avec colonne D séparatrice est respecté. Le moteur public existant est réutilisé. Dates/heures canoniques texte : un appel Sheets API. En présence de cellules temporelles numériques, un second appel conditionnel lit leurs formats DATE/TIME avant conversion ; de simples nombres non typés ne deviennent pas artificiellement des dates valides. Cette variante a un coût supplémentaire et n’a pas son benchmark réel de bout en bout.

Les routes/instrumentations des expériences ne sont pas dans le produit. Les erreurs publiques restent opaques. POST et règles d’admission conservés. Le navigateur envoie `cache: no-store` et ne charge aucun asset de dates.

## Google TEST et contrôles réels

Version **14**, 2 novembre vers18h01 Montréal, même déploiement TEST, identité propriétaire et accès existants conservés. Bundle et HEAD exacts :

`a2009f22df3417ca459dd0e5fd59022d7f43244feec32131ebcc72cfa0321ee2`

Manifest Sheets APIv4, scopes inchangés. Un helper privé temporaire vérifie la forme réelle des métadonnées : onglet Disponibilités trouvé, grille présente,1000 lignes de formats. Exécution Google terminée avec succès ; helper retiré, code recopié depuis l’éditeur et strictement égal au bundle sauvegardé. Public version14 déjà propre. Aucun POST, inscription, envoi, modification des tables ou réinstallation de triggers dans cette passe.

Trois contextes Chromium neufs sur le site local relié à Google réel, mesurés depuis navigation jusqu’aux premières cartes :

| Contexte neuf | Cartes fraîches | Cartes avant réponse | GET public | POST | Stockage persistant |
|---|---:|---:|---:|---:|---:|
|1|2333 ms|0|1|0|0 clé|
|2|1819 ms|0|1|0|0 clé|
|3|1837 ms|0|1|0|0 clé|

Fiche Ergonomie puis formulaire ouverts dans les trois contextes sans seconde lecture ni soumission. Capture de contrôle examinée : date janvier2027 fictive et1 place disponible. Lien local courant : http://127.0.0.1:4173/. Un contrôle Computer Use supplémentaire montre24 formations et leurs prochaines dates ; capture temporaire hors dépôt.

Ces mesures finales incluent le site et ses assets ; elles ne remplacent pas la campagne20lectures du [prototype](sheets-batchget-prototype-2026-11-02.md), dont les médianes premières/suivantes étaient1,333/1,057s. Échantillon final limité à3lectures, contexte réseau non contrôlé, aucune garantie sous1s. Les bonnes dates sont affichées après lecture, pas instantanément.

## Vérifications locales

- 110 tests Node réussis, dont7 contrats spécifiques de lecture groupée : équivalence du catalogue entier, places recomptées, données privées exclues, dates typées et nombres invalides, erreurs opaques, schéma Paramètres réel.
- Build et sécurité réussis ;7 contrôles bundle/ICS portables réussis,2 ICS privés absents explicitement ignorés.
- 21 régressions administratives et2 transitions VM réussies.
- 192 parcours navigateur réussis sur Chromium ordinateur/mobile, Firefox et WebKit (2,6min) ; contrôle de fraîcheur final8/8 sur ces quatre profils également réussi.
- Une ancienne copie de catalogue et une ancienne clé localStorage injectées par le runner sont ignorées ; l’ajout d’une formation côté réponse est découvert après recharge du même bundle. Ce scénario d’édition est simulé ; aucun nouvel ajout réel à Sheets n’est revendiqué ici.
- Revue indépendante réalisée, simplification de la file de lecture et sélection explicite de l’onglet de métadonnées par titre appliquées ; régression pour un onglet non concerné placé en tête.

## État de remise et limites

Candidat local + Google TEST disponible pour recette Sofiane. TEM-27 reste In Progress ; validation humaine et livraison sont distinctes. Aucun commit/push de cette campagne conformément à l’instruction actuelle du chat. Pas de fusion main, PROD, Vercel ou FTP. Retour compatible possible vers version11 sans restaurer les données ; ce retour n’est pas exécuté, version14 reste active.

Les nouveaux envois réels ne sont pas retestés ; le budget mail est préservé pour la recette humaine. Safari installé, téléphone physique et lecteurs d’écran n’ont pas de preuve nouvelle dans cette passe. La performance avec beaucoup plus d’inscriptions reste à remesurer si le volume augmente. La version Métier conserve son état antérieur.
