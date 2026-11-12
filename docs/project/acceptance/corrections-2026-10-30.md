# Résultat du lot des neuf correctifs — 30 octobre 2026

**Les neuf correctifs approuvés sont réalisés, revus et appliqués à Google TEST version 8. Le candidat local est prêt pour la recette de Sofiane.** Les régressions Google, la matrice automatisée, le parcours Safari installé et les imports Calendrier Apple hiver/été ont été exécutés. L’acceptation humaine reste ouverte ; les limites précises figurent ci-dessous.

Les propositions UX/UI ne sont pas appliquées. Le [rapport visuel](ux-options-2026-10-30.html) compare trois options à l’existant, avec illustrations explicitement distinctes de captures. Aucune refonte graphique n’est recommandée. L’arbitrage revient à Sofiane pendant sa recette.

## Ce qui est corrigé

| Réf. | Résultat vérifié |
|---|---|
| R1 | Les diagnostics conservent les notes humaines avant, pendant et après réparation. Seul le bloc appartenant au programme est retiré. |
| R3 | Les listes de formations retirent leurs options devenues inexistantes ou ambiguës. La restauration fonctionne aussi après écriture interrompue. |
| R4 | Une capacité invalide efface les places restantes calculées ; diagnostic et refus d’admission sont conservés. |
| R5 | Les logiciels invalides ont un diagnostic privé utile. Sa suppression après réparation, ligne vidée ou interruption conserve les notes humaines. |
| R6 | Une confirmation connue est restaurée lors du retour historique. Choisir une autre date efface cette mémoire et ne confirme pas une inscription non soumise. |
| R7 | Le focus revient au contrôle visible sur ordinateur/mobile ; si la dernière place disparaît, il revient au titre plutôt qu’à un bouton désactivé. |
| R8 | Le titre de formation suit les conditions actualisées après reconfirmation. |
| R9 | La reconfirmation conserve le début réel de la saisie pour éviter un refus anti-spam artificiel ; nouvel accord et nouvelle clé restent requis. |
| R11 | Les libellés logiciels qui ressemblent à des propriétés JavaScript ne provoquent plus de collision. |

Les revues natives Build ont été réalisées par trois agents distincts. Elles ont fait compléter les frontières d’interruption, de ligne vidée, de focus désactivé et de nouvelle sélection. Tous les constats retenus du lot ont été traités ; le triage exhaustif reste dans la spec. La baseline historique incluait aussi la spec dans le diff : une séparation parfaite des claims de la couche cas limites n’est pas revendiquée.

## Tests réellement exécutés sur le dernier code

Commande locale complète :

```sh
cd app
TEMA_TEST_PORT=4184 TEMA_BROWSER_MATRIX=all npm run verify
```

La passe privée renseigne aussi `TEMA_AUDIT_RECEIVED_ICS_DIR` vers le dossier des deux ICS reçus précédemment. Sans ce dossier, ces deux seuls contrôles sont explicitement ignorés ; les sept contrôles portables restent exécutés.

| Niveau | Résultat | Limite de la preuve |
|---|---|---|
| Logique et intégration locale existantes | **103/103 réussis** | Google/notifications simulés |
| Régressions administratives du lot | **21/21 réussies** | Adaptateur Sheets en mémoire, erreurs d’écriture injectées |
| Transitions UI instrumentées | **2 réussies** | Node VM/DOM simulé, complément aux parcours navigateur |
| Bundle construit et fichiers ICS | **9/9 réussis**, aucun ignoré dans la passe privée | Exécution Code.gs simulée et parsing des fichiers ; parsing distinct des imports Apple réels décrits ci-dessous |
| Parcours navigateur | **184/184 réussis**, en 2,8 min | 46 scénarios × Chromium ordinateur, Chromium mobile, Firefox et WebKit ; API simulée |
| Build et sécurité locale | **Réussis** | Contrôles locaux distincts de la mise à jour Google TEST |
| Audit npm complet | **0 vulnérabilité signalée** | Inventaire courant, pas une garantie de sécurité exhaustive |
| Contrôle de méthode | **Réussi** | BMAD 6.12.4, références et intégrité locales |

Les délais POST 45 s et GET 15 s sont franchis avec l’horloge de test du navigateur. Sont notamment vérifiés : reprise de commande identique, une seule réservation/deux notifications simulées, lecture fraîche après expiration, dernière place, historique après confirmation, politique, double sélection et reconfirmation immédiate. Les attentes historiques sur les caches ont été adaptées pour exiger leur invalidation avant mutation puis un nouveau checkpoint valide après reprise ; aucune assertion de résultat métier n’a été affaiblie.

Bundle local, HEAD Apps Script et version TEST 8 : SHA-256 `b0737bb59743af0216eb62a83a1143ec10570872c0e8c636343a7334df61f447`. Code produit `096772d03772012752dcc1b7948004318b3e3ad8`, inchangé pendant cette campagne. Le GO complémentaire de Sofiane est versionné dans `51c3d42` et la [décision](../decisions/2026-10-30-correctifs-et-ux-differee.md).

## Vérification Google TEST réelle après correction

Version 8 déployée le 30 octobre à 20 h 17 (Montréal), sur le déploiement et l’URL existants, exécution propriétaire et accès inchangés. Sauvegardes privées préalables du classeur et du code version 7. Le helper de tests temporaire a été retiré avant déploiement ; la copie intégrale relue dans l’éditeur est exactement le bundle construit.

**13 assertions réelles réussies**, sans appel MailApp :

- R1 : titre invalide, ajout du diagnostic sans effacer une note humaine, puis réparation qui conserve cette note.
- R4 : capacité invalide, places restantes effacées, puis calcul rétabli à la restauration.
- R5 : libellé absent ou dupliqué diagnostiqué en privé, catalogue public indisponible pendant l’ambiguïté, réparation qui conserve la note humaine.
- R11 : le libellé `constructor` reste valide et publié.
- R3 : suppression puis reconstruction des validations natives Sheets. Pour ce cas, seul l’entrée du writer reçoit une liste vide injectée ; aucune formation réelle n’est supprimée. Les interruptions d’écriture restent testées localement, pas provoquées sur Google.
- Comparaison stricte de toutes les tables, des budgets, de l’allowlist, des compteurs et du journal privé après restauration.

Un deuxième contrôle indépendant par exports XLSX avant/après confirme les **valeurs des quatre onglets strictement identiques**. Les neuf inscriptions sont conservées : quatre confirmées, cinq annulées. Catalogue public réel : 24 formations, trois sessions. Diagnostics finaux : zéro.

HTTP anonyme réel : schéma/projection privée contrôlés, puis rejeu d’une commande historique vérifiée dans l’export préalable. Réponse **REPLAY / annulee**, pas de réactivation. Aucune nouvelle inscription ni tentative d’envoi : budget toujours **8/10 inscriptions avec tentative et 16/20 destinataires** ; quota quotidien observé 94. Les deux inscriptions avec envoi réservées à Sofiane sont intactes. Réception de nouveaux courriels non rejouée dans cette passe ; preuves antérieures conservées dans le [rapport V1](V1-results.md).

Douze réconciliations sans changement : zéro patch, maximum **2 751 ms**, budget mail inchangé. Dix appels mesurés pendant les cas ciblés : maximum **4 188 ms**. Ces durées de fonctions ne sont pas des délais édition→navigateur ni une observation 24 h. Les dix éditions normales, le secours 5 min et l’extrapolation prudente de 41,2995 min/j proviennent de la campagne V1 précédente ; pas de nouvelle promesse de cadence. onEdit conservé, secours laissé au repos 12 h, deux déclencheurs.

## Safari installé et Calendrier Apple

L’accès natif est finalement disponible ; les refus du contre-audit sont historiques.

**Safari 26.2 macOS, vrai Google TEST :** chargement anonyme du catalogue 24 offres, filtre Dimo (4 offres), calendrier juillet, présélection de la date, fiche et formulaire, blocage HTML d’un formulaire vide avec focus Prénom, consultation de la politique puis retour avec les quatre saisies fictives conservées et focus sur son lien, changement de date et retour au catalogue avec filtre conservé. Aucun formulaire valide envoyé. Les scénarios succès/reconfirmation/expiration et les variations mobiles restent couverts par la matrice automatisée ; ils ne sont pas revendiqués comme tous rejoués dans Safari installé.

**Calendrier Apple natif :** import des deux ICS reçus lors des essais antérieurs dans le calendrier dédié `Tema TEST — recette 2026-10-30` (iCloud, deux événements fictifs, aucun invité). Hiver : 15 janvier 2027, **09 h–12 h Montréal**, soit 14 h–17 h UTC, lieu « En ligne — lien à venir » et instruction de transmission du lien. Été : 15 juillet 2027, **09 h 30–12 h Montréal**, soit 13 h 30–16 h UTC, titre « Dimo – Nouveautés », adresse fictive avec accents. Export natif du seul calendrier de test et comparaison : exactement deux événements, **UID, DTSTART, DTEND, titre et lieu conservés**. Le calendrier de test est laissé disponible pour Sofiane. Aucun calendrier personnel modifié.

## Recette de Sofiane et limites restantes

Ouvrir [le site local](http://127.0.0.1:4173) sur ce Mac et le [classeur TEST](https://docs.google.com/spreadsheets/d/1Zq8s1Jwd4NgpbMIed35W0LJIsUpJ-JPt19BZK89yM3c/edit). Actualiser la page avant recette. Le serveur local doit rester lancé ; ce lien n’est pas une URL de démonstration accessible depuis un téléphone distant.

- Deux inscriptions avec envoi restent possibles vers les seules boîtes déjà autorisées ; ne pas réinstaller ni réinitialiser les budgets. Relire `inspectTrial` avant usage.
- Outlook, Excel installé, téléphone physique, lecteur d’écran et zoom natif gardent leurs réserves propres. L’acceptation finale Sofiane reste à réaliser.
- R2, modification manuelle du seul affichage calculé `Paramètres.choix`, est exclu du lot approuvé. Son test optionnel demeure un défaut connu, pas un PASS implicite.
- Les trois options UX sont à arbitrer dans le [rapport visuel](ux-options-2026-10-30.html), sans implémentation.

BMAD conserve la spec globale `in-review`. TEM-12/13/14 retournent en Review ; TEM-27 reste In Progress pour recette/acceptation. Aucun Done, merge/main, publication Vercel/FTP ou PROD.

Preuves privées hors dépôt : `~/.config/tema-academie/acceptance-correctifs-20261030/` (logs agrégés Google, exports avant/après, preuve de rejeu, import/export Apple, captures Google/Safari/Apple). Log de validation locale : `/private/tmp/tema-google-corrective-verify.log`. Les copies et captures privées ne sont pas versionnées.

## Checkpoint Git et CI

Code et tests : [`096772d03772012752dcc1b7948004318b3e3ad8`](https://github.com/blackboxdev0/tema-academie/commit/096772d03772012752dcc1b7948004318b3e3ad8), poussé sur `tem-6-technical-trial`. Les deux CI de ce commit sont réussies : [push 41146931408](https://github.com/blackboxdev0/tema-academie/actions/runs/41146931408) et [PR 41146938573](https://github.com/blackboxdev0/tema-academie/actions/runs/41146938573). La PR 1 reste en brouillon. Le checkpoint documentaire suivant ne change pas le code testé.
