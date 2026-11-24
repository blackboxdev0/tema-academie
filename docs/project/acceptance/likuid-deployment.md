# Publication de Tema Académie chez Likuid

## Réglages

| Champ | Valeur |
| --- | --- |
| Adresse publique | [academie.temasolutions.ca](https://academie.temasolutions.ca/) |
| Transfert | FTPS explicite sur `cpamg12.likuid.com:21`, certificat et nom vérifiés, contrôle et données chiffrés |
| Compte FTPS | Compte dédié avec la racine du sous-domaine comme dossier de départ |
| Environnement GitHub | `likuid-production`, prévu pour `main` |
| Secrets GitHub | `TEMA_PRODUCTION_PROFILE_JSON`, `LIKUID_FTP_USERNAME`, `LIKUID_FTP_PASSWORD` |
| Profil web | Profil attesté de la mise en ligne Vercel du 19 novembre, avec le nouveau classeur et le déploiement Google de production existant |

Le workflow **Likuid** exécute les tests applicatifs et de transfert à chaque PR vers `main`, puis sur les push et les lancements manuels de `main`. Le déploiement attend la réussite de la vérification. Les exécutions de `main` sont sérialisées dans la file étendue de GitHub. Une exécution active va au bout de sa vérification ou de sa reprise. Le workflow réserve le profil et les identifiants FTPS aux étapes de production concernées. Le build vérifie les identifiants du classeur et du script, l’attestation du déploiement Google et le contenu public. Le profil complet reste dans le secret GitHub et la configuration web publique contient l’URL Google. [Publication Vercel](vercel-production-preparation-2026-11-19.md)

### Contraste

Le workflow Likuid accepte les écarts Axe connus de `color-contrast` dans les états catalogue et catalogue paginé. L’exception correspond aux sélecteurs `.card-month`, `.card-year`, `.card-date > .eyebrow` et `article:nth-child(1) > .card-main > .card-date > .eyebrow`, pour le texte blanc sur `#ff008f` au ratio de 3,71 pour 4,5 requis. Tout autre écart Axe reste bloquant. Le rapport GitHub `likuid-browser-report` joint chaque résultat Axe complet. Le workflow **Application verification** continue d’appliquer le contrôle strict.

## Bascule et reprise

1. Le transfert lit l’accueil actuel par FTPS et vérifie la réponse publique sur `/` et `/index.html`. Pour la première publication, il exige que le fichier soit absent dans le dossier FTP, que `/index.html` réponde 404 et que `/` réponde 403 ou 404.
2. Le workflow publie la sortie du build dans `/_releases/<commit>-<run>-<attempt>/`, puis compare chaque fichier aux octets servis par HTTPS. L’accueil référence ce dossier pour les deux scripts, la feuille de style et le logo. Les fragments et les liens relatifs de la feuille de style conservent leur fonctionnement.
3. Le transfert place une copie vérifiée de l’ancien accueil dans `previous-index.html` du dossier de la nouvelle version quand un accueil existe. Il téléverse également le nouvel accueil dans un temporaire à la racine, puis compare les fichiers par FTPS. Il relit la révision distante de `main` autour du renommage atomique. Après le renommage il contrôle les octets publics de `/` et `/index.html`.
4. Après un échec avant le renommage, relancer **Likuid** sur `main`. Une nouvelle tentative utilise son propre dossier de ressources. Les versions déjà servies restent disponibles.
5. Après un échec de bascule, le workflow relit l’accueil FTP. Si les octets actifs correspondent au candidat, il restaure l’accueil à partir d’une copie vérifiée ou retire l’accueil installé lors d’une première publication. Il vérifie l’état restauré par HTTPS. Si la reprise est signalée comme non vérifiée, suspendre les déploiements avant toute intervention manuelle. Comparer l’accueil actif avec `/_releases/<commit>-<run>-<attempt>/index.html` et `previous-index.html`. Restaurer uniquement l’accueil connu en renommant une copie à la racine, puis revérifier les deux URL. Lors d’une première publication, retirer l’accueil seulement si ses octets correspondent à ceux du run en échec.

Les versions précédentes restent en place pour les navigateurs et la récupération. Le workflow ne touche ni à la configuration Apache ni aux autres fichiers du dossier. Une interruption forcée du runner peut empêcher la reprise automatique. Le dossier de la tentative et son index précédent restent disponibles pour identifier l’état au redémarrage.

## Vérifications du 24 novembre 2026

- La matrice axe stricte locale retrouve les huit échecs attendus et les mêmes 24 nœuds sur Chromium, Chromium mobile, Firefox et WebKit.
- Dix-neuf tests de publication passent. Ils couvrent la première publication, la mise à jour, le transfert incomplet, le contrôle HTTPS, les protections TLS du client, la tête distante et les reprises.
- Un test local avec curl, serveurs FTPS et HTTPS, et vérification du certificat rejoue les deux publications et les deux reprises avec le vrai build. Le build attesté et le contrôle de sécurité passent. Ses neuf fichiers publics comprennent un `config.js` identique octet pour octet à celui du candidat Vercel.
- Le certificat de `cpamg12.likuid.com` valide en TLS 1.3 sur le port 21. Le compte FTPS dédié a listé sa racine par `MLSD` et remplacé un fichier temporaire existant par renommage depuis un sous-dossier. Les octets ont été vérifiés en HTTPS et les sondes retirées.
- L’environnement GitHub `likuid-production` n’autorise que la branche `main`. Les trois secrets attendus sont configurés.

## Première mise en ligne

Le site du commit `54a7a4a10799d1a0f653e7f9bfc1c92b2fc1bdfc` a été publié par le script FTPS en attendant l’accord distinct de fusion du workflow. Les neuf fichiers du build correspondaient aux octets du candidat Vercel avant adaptation des liens au dossier versionné. Après la bascule, Likuid renvoie HTTP 200 sur HTTPS et redirige HTTP vers HTTPS en 301. Chromium dans une session neuve a chargé 24 formations et trois sessions depuis Google Production, puis ouvert et rechargé une fiche. L’essai a bloqué les requêtes d’écriture.

Le client curl système du Mac a interrompu le premier transfert de `app.js` à 32 Kio. La tentative partielle a été retirée et le même script a publié avec curl compilé avec OpenSSL. La première activation via GitHub Actions reste à vérifier après intégration du workflow.
