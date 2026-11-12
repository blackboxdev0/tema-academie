# Configuration dans le code et retrait de Paramètres

## Résultat

Sur GO Sofiane, onglet Paramètres supprimé de la seule copie privée. COPY version9 activée au même /exec après comparaison des contrats avant suppression. Config embarquée dans app/experiments/copy-config.gs : contacts, expéditeur, politique/version TEST et trois logiciels. Lectures natives et groupées limitées à Formations, Disponibilités et Inscriptions. Le contenu de confidentialité reste dans le site ; aucune nouvelle politique juridique rédigée.

Valeurs équivalentes conservées : nom d’expéditeur Tema Académie — TEST, version TEST-1 et lien d’essai. Le module retourne des objets indépendants à chaque lecture. Les valeurs ne peuvent plus être modifiées depuis le classeur ; aucune lecture de secours de l’ancienne feuille. Secrets, allowlist, budgets et droits restent dans leurs propriétés privées existantes.

## Preuves locales

132 tests standard et238 expérimentaux réussis, build COPY, sécurité et diff check réussis. Tests : feuille absente/contradictoire, trois ranges, configuration indépendante et absence de fallback, politique obsolète sans admission, historique préexistant avec ancienne version et dates typées intactes, options et préparation admin, annulation/réconciliation existantes. Bundle complet : submit, deux envois simulés vers participant et destinataire interne configuré, budget borné et replay sans nouvel envoi. Ces envois sont des fakes, pas des courriels réels.

Revue intégrée trois lectures : deux renforcements de tests appliqués ; risques préexistants du builder concernant symlinks, permissions héritées et écritures de sortie non atomiques regroupés dans deferred-work.md. Aucun nouveau mécanisme de sécurité ni refonte du builder dans cette tâche. Sortie utilisée privée, sans symlink, modes vérifiés et code natif relu conforme avant activation.

## Preuves Google réelles

- Sauvegardes privées fraîches du code v8, manifeste, module SaisieNative et export du classeur avant intervention. Aucun accès d’écriture ancien TEST/PROD, même si un onglet TEST était ouvert.
- Diagnostic avant migration, après code embarqué et après suppression : configuration/public/métier/propriétés protégées conservent leurs quatre hashes. Lecture native et API concordantes ;30formations,9sessions,15inscriptions.
- Rejeu réel register d’une commande existante annulée dont l’empreinte a été vérifiée : REPLAY aux trois étapes. Aucun appel notify/submit dans cette recette réelle, garde d’envoi explicitement fermée ; aucun nouvel inscrit ni consommation de budget. Nouvelle admission et notifications vérifiées en simulation avec les vrais modules, pas par nouvel envoi Google.
- Retrait réversible de Paramètres par UI Sheets après activation v9. Export final : Formations, Disponibilités, Inscriptions, Accueil et Nouvelle formation strictement identiques avant/après en valeurs et types. Aucun #REF! de formule ni validation référençant la feuille retirée. Inscriptions toujours masquée.
- Actualiser le suivi natif terminé sans erreur en21secondes, contexte vérifié dans l’export final. Formulaire natif consulté sans saisie/sauvegarde. Son module ne dépend pas de Paramètres et reste inchangé.
- Code natif final identique au candidat, SHA-256 canonique374c25f5ab146e2f71611bcedf45804ddfd829c44aa6f63d7cbd91ad5b8df095 ; diagnostic temporaire retiré. Manifeste relu identique, exécution propriétaire et accès existants inchangés. Pas de nouveau déclencheur ni permission.
- GET réel version9 après retrait :30formations/9sessions, contact et politique TEST-1 conservés, aucune propriété privée registrations.

## Parcours site local réel

Profil COPY persistant et serveur relancé sur http://127.0.0.1:4173/. Nouveau chargement puis rechargement avec cache :30formations, dates/places chargées depuis Google. Filtre Dimo, fiche, date disponible, formulaire/accord TEST-1, politique inline et retour avec brouillon préservé vérifiés. Saisie fictive nettoyée, aucune confirmation d’inscription. Site laissé au catalogue et copie à l’Accueil.

## Récupération et limites

Version8 conservée. Pour revenir à v8, restaurer d’abord la feuille Paramètres de la sauvegarde/historique, puis le code/manifeste v8 et son déploiement ; ne pas restaurer tout le classeur et ne pas réinitialiser les propriétés/budgets. Version9 continue de fonctionner même si l’ancienne feuille était restaurée, car elle est ignorée.

Preuves privées : ~/.config/tema-academie/code-config-20261110/. Aucun export, donnée personnelle, secret ou capture brute ajouté au dépôt. Aucun commit/push ni publication publique. TEM-27 reste In Progress : cette vérification ne clôture pas la recette humaine globale.
