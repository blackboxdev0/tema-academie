# Revue globale du plan V1 — 26 octobre 2026

**Conclusion : le périmètre et les cinq résultats restent cohérents ; le plan demande des précisions avant un GO principal sans réserve.** Il n’y a pas de besoin démontré de changer l’architecture de base ou d’ajouter une plateforme. Les observations portent sur le plan, pas sur des défauts constatés de la future V1.

## Recommandation à présenter à Sofiane

1. Conserver les cinq blocs et les17stories ; rendre les conditions de démarrage exécutables, sans une nouvelle série de confirmations à chaque étape.
2. Avant le premier code dépendant, aligner les contrats obsolètes et distinguer l’ordre conseillé des dépendances techniques. Ne pas attendre1.3 pour corriger une règle utilisée en1.1.
3. Proposer comme premier lot le catalogue et l’administration sur ressources de test isolées (stories1.1–1.3), avec les contrôles de cadence/charge. Le GO doit nommer ce lot ; un GO sur la préparation ne l’autorise pas. Les contrôles anonyme/transport et supports requis précèdent l’acceptation du parcours public concerné, sans attendre arbitrairement la toute dernière recette.
4. Publier explicitement un candidat de recette, après autorisation du déploiement correspondant, avant de lancer la recette distante5.3. Promotion après acceptation et ouverture publique restent distinctes. Cela résout une boucle implicite entre5.3 et5.4 ; le prototype déjà en ligne n’est pas le candidat complet.
5. Garder les compléments Google et la recette complète dans leurs stories, avec critère explicite : un contrôle requis NON VÉRIFIÉ laisse l’acceptation concernée ouverte, sauf dérogation humaine précise. Le report Outlook/Apple reste déjà approuvé et n’est pas remis au choix.

Ces recommandations sont issues de la revue ; les sources examinées ne sont pas silencieusement réécrites ou déclarées approuvées. Aucun correctif de code ou test réel n’est exécuté ici.

## Deux informations à demander maintenant

### Volume lors du lancement

Quel ordre de grandeur de nouvelles inscriptions est attendu lors d’une journée chargée, par exemple après une annonce : quelques unités,20,50ou davantage ? L’absence de prévision chiffrée peut être dite explicitement ; un scénario hypothétique de test n’est pas un objectif métier inventé.

La documentation Google relue le26octobre indique100destinataires MailApp/jour pour un compte grand public, et90min/jour de déclencheurs ; quotas partagés par utilisateur, sujets à évolution. Une inscription tente normalement deux messages : le plafond théorique est donc environ50inscriptions/jour avant les autres envois et aléas. Ce calcul n’est ni une capacité garantie ni une mesure du quota restant. [Quotas Google](https://developers.google.com/apps-script/guides/services/quotas).

Le profil de charge et la marge doivent être définis pour la mesure1.3. Aucun Workspace, fournisseur email ou achat n’est décidé par la revue.

### Formation sans prix renseigné

Les24prix source existent, mais le contrat autorise une valeur absente pour de nouvelles formations. Le prototype affiche déjà « Tarif à confirmer » sans que le plan dise si une réservation doit alors être autorisée.

**Proposition à confirmer :** conserver la fiche visible avec « Tarif à confirmer » mais désactiver les nouvelles inscriptions tant que le tarif n’est pas renseigné. Ne jamais interpréter l’absence comme0$, ni assimiler ce cas à une formation gratuite. C’est une précision métier, pas une décision à imposer depuis le code.

## Travail de précision interne, sans nouvelle question métier

| Sujet | Observation retenue | Traitement recommandé |
|---|---|---|
| Contrats de référence | Cadence minute/uniforme<2min, absence de prototype/commits et starter proposé encore présents dans les sources anciennes | Mise à jour par les writers propriétaires avant la première story qui dépend de ces passages ; conserver l’historique de preuve |
| Dépendances Linear | Les17stories sont une chaîne stricte, par exemple finition bloquée par nettoyage/politique | Garder l’ordre de présentation, mais réserver blockedBy aux prérequis réels et laisser avancer le travail indépendant |
| CI | La phrase « socle CI existant est câblé » est au présent, alors que seuls commande/tests locaux existent | Dire « câbler la CI dès le premier jalon applicatif autorisé » ; vérifier son premier résultat avant intégration, pas seulement son fichier |
| Import | Résultat24formations couvert, relance après interruption non exprimée | Critère de reprise sans doublon, codes conservés, absence d’écrasement silencieux des modifications Tema |
| Anti-abus | Protection « à documenter » sans essai d’acceptation mesurable | Critère de rafale/rejet sans ligne ni mail supplémentaire et reprise correcte ; pas de fournisseur ajouté tacitement |
| TEST et Métier | Principes d’isolation présents mais promotion non testable en un seul critère | Contrôler destination fixe, un écrivain, destinataires métier, absence d’outils de panne/reset publics et garde TEST conservée sur TEST |
| Export Excel | L’inertie dans Google ne suffit pas à décrire l’ouverture d’un export dans Excel | Vérifier =,+,-,@ dans les textes libres sur le format exporté, sans réinterprétation comme formule |
| Hébergement statique | Les vues futures n’ont pas de critère de lien direct/refresh sur serveur FTP | Choisir une navigation compatible sans réécriture serveur puis tester les URLs directes et actualisation ; détail technique délégué |
| Supports | Chrome/Firefox/Safari et téléphone sont nommés sans matrice bornée | Définir supports/versions de recette réellement disponibles et qui observe chacun ; ne pas confondre profil Chromium et appareil physique |
| Clôture | « cible convenue » ne nomme pas les états de code, recette et remise | Distinguer code revu/intégré selon GO, candidat Vercel identifié/accepté et remise ; aucun Done déduit d’un commit local |

## Estimation et validations à leur jalon

L’enveloppe proposée3jours ne signifie pas trois jours calendaires de développement. Elle additionne arbitrages, coordination, recette et remise, avec0,5jour de réserve ; le travail autonome et les attentes restent séparés. La répartition Sofiane/Tema n’est pas assez claire : la reformuler en **jours-personnes cumulés** et distinguer la disponibilité attendue de Sofiane avant de considérer l’estimation acceptée. Ce rapport ne transforme pas les3jours proposés en engagement.

Avant la démo/recette client, regrouper les validations Tema : formations actives au lancement, prix finaux, identité/finitions et interlocuteur de validation. Avant ouverture réelle, ajouter politique/accord, accès/récupération, informations pratiques et cible acceptée. Sofiane peut être le relais ; aucun nouveau rôle client n’est attribué ici.

Vercel Hobby est toujours documenté comme personnel non commercial. Son maintien provisoire a été choisi par Sofiane ; cela ne prouve pas son adéquation à la démonstration ou livraison d’un projet client. Résoudre cette offre avant le déploiement client concerné, sans achat automatique ni remise en cause du code local. [Vercel Hobby](https://vercel.com/docs/plans/hobby).

## Méthode, preuves et limites

- Skill natif `bmad-review`, personnalisation résolue : aucune instruction/extension de revue locale supplémentaire.
- Trois lectures indépendantes : adversarial, edge-case-hunter et structure. La lens verification-gap s’applique au code, absent du périmètre de revue ; prose ne s’applique pas puisque la demande n’est pas une correction rédactionnelle. Aucune revue de code indépendante prétendue.
- Contenu examiné figé au commit de préparation `7f429dafca2ce54690d46f12d0cfbb8304b6ea7e` : plan, epics, readiness, matrice de couverture et registre Linear. Lectures sources ciblées pour corroboration. Enveloppe temporaire hors dépôt.
-12observations adversariales,5cas limites,4recommandations de structure et2corroborations auteur. Les recoupements (notamment import) sont conservés ; ce total n’est pas un nombre de bugs ni une notation de risque.
- Linear relu : équipeTEM/projetP-TEM-1,5parents/17enfants Backlog ; TEM-5 Review et TEM-6 In Progress. Aucune transition ne découle de la revue.
- Les19observations comportementales/de cohérence sont disponibles dans le [JSON](revue-globale-plan-v1-findings.json). La table structurelle indépendante est conservée ci-dessous.
- Suite produit non rejouée pour cette revue documentaire ; aucun nouvel email, injection, accès Google, déploiement ou achat. Le bilan TEM-6 reste4PASS/8NON VÉRIFIÉ.

## Lecture structurelle indépendante

Public : humain qui doit décider du périmètre, de l’effort et des conditions de démarrage. Plan de synthèse : modèle pyramidal ; epics : référence consultable par story. Le regroupement des fichiers dans l’enveloppe de revue n’est pas une recommandation de les fusionner.

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| structure | Plan : les confirmations sont après les détails techniques ; CONCERNS est dans un autre document | MOVE : remonter une décision à prendre regroupant statut, réserves, estimation et validations attendues après l’introduction | Décision compréhensible sans parcourir tout le dossier ; aucun contenu métier supprimé |
| structure | Plan :108mots consacrés aux journaux/spines/writers dans la consolidation | CONDENSE/MOVE : garder besoin d’alignement et effet sur démarrage, déplacer méthode au suivi technique | Environ63mots de moins dans le plan humain, sans lever une réserve |
| structure | Epics :392mots répètent les titres d’epic pour chaque FR | CONDENSE : références compactes FR→epic et titres complets dans Epic List | Environ242mots de moins,30rattachements conservés |
| structure | Stories et matrices de couverture détaillées | PRESERVE : conserver les références et leur schéma, sans fusion dans la synthèse | Consultation isolée et traçabilité maintenues |

Les suggestions structurelles n’ont pas été appliquées au document examiné dans cette exécution de revue. Elles ne demandent pas un vote de Sofiane sur chaque déplacement rédactionnel.
