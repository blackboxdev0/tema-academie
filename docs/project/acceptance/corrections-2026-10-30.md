# Résultat du lot des neuf correctifs — 30 octobre 2026

**Les neuf correctifs approuvés sont réalisés et vérifiés localement, après contre-revue.** Le lot n’est pas encore appliqué au projet Google TEST. Safari installé et Calendrier Apple restent non vérifiés : leur accès est toujours refusé par Computer Use. La recette complète ne peut donc pas être déclarée acquise.

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
| Bundle construit et fichiers ICS | **9/9 réussis**, aucun ignoré dans la passe privée | Exécution Code.gs simulée et parsing des fichiers ; aucun import Apple |
| Parcours navigateur | **184/184 réussis**, en 2,6 min | 46 scénarios × Chromium ordinateur, Chromium mobile, Firefox et WebKit ; API simulée |
| Build et sécurité locale | **Réussis** | Aucun déploiement |
| Audit npm complet | **0 vulnérabilité signalée** | Inventaire courant, pas une garantie de sécurité exhaustive |
| Contrôle de méthode | **Réussi** | BMAD 6.12.4, références et intégrité locales |

Les délais POST 45 s et GET 15 s sont franchis avec l’horloge de test du navigateur. Sont notamment vérifiés : reprise de commande identique, une seule réservation/deux notifications simulées, lecture fraîche après expiration, dernière place, historique après confirmation, politique, double sélection et reconfirmation immédiate. Les attentes historiques sur les caches ont été adaptées pour exiger leur invalidation avant mutation puis un nouveau checkpoint valide après reprise ; aucune assertion de résultat métier n’a été affaiblie.

Bundle local final : SHA-256 `b0737bb59743af0216eb62a83a1143ec10570872c0e8c636343a7334df61f447`. Candidat Google TEST précédemment installé : version 7, empreinte historique `f8689f42a980ea8d1fecf0eaac47dbf47328dc88cb91ae2c7ba288ec1a9b85ee`, inchangé par cette passe. Les mesures Google de l’ancien candidat ne sont pas attribuées au nouveau bundle.

## Contrôle avec données Google réelles

Le navigateur intégré est de nouveau accessible. Contrôle en lecture seule de `http://127.0.0.1:4173` : 24 formations chargées, fiche Ergonomie avec programme avant date, récapitulatif de la date de janvier, ouverture du formulaire, consultation de la politique et retour avec saisie fictive conservée. Aucun clic de confirmation, POST d’inscription, mail ou modification de Sheet. Le projet Apps Script TEST s’ouvre aussi avec le compte attendu ; son code n’a pas été modifié.

Ce contrôle valide ce parcours de lecture du frontend corrigé contre le service TEST existant. Il ne valide pas l’exécution réelle des nouveaux correctifs administratifs. Aucun budget d’envoi consommé : les deux tentatives précédemment réservées à Sofiane restent hors de cette campagne.

## Ce qui reste ouvert

- Appliquer le candidat compatible à Google TEST dans son jalon propre, puis contre-vérifier notes/listes/capacité/logiciels, reprise après réparation et coût des réconciliations. L’historique, les budgets et les identifiants doivent être conservés ; aucune réinstallation initiale.
- Safari macOS et import Calendrier Apple : accès outil refusé malgré les mentions explicites. WebKit et les fichiers ICS analysés ne les remplacent pas.
- Outlook, Excel installé, téléphone physique, VoiceOver/zoom natif : les réserves de recette antérieures restent distinctes.
- R2, modification manuelle du seul affichage calculé `Paramètres.choix`, reste exclu des neuf correctifs approuvés. `npm run test:audit-optional` a été rejoué et demeure rouge. Il n’est ni masqué ni compté dans la validation du lot.
- Les trois options UX restent à arbitrer dans le rapport visuel ; aucune nouvelle direction produit n’est déduite de cette passe.

BMAD garde la cible globale en revue, avec les neuf cases locales cochées et les contrôles réels ouverts. Linear distingue les corrections frontend prêtes en Review des stories encore en In Progress pour Google réel/recette. Aucun Done humain, fusion dans main ou déploiement/publication effectué. Git et la CI du commit de remise ont leur preuve propre dans la PR ; le résultat local ci-dessus n’en déduit pas un succès distant.
