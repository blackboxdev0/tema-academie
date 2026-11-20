# Préparation de la mise en ligne Tema sur Vercel

## Mise en ligne vérifiée le 19 novembre

Sofiane a autorisé la bascule et la fusion si les vérifications retrouvaient uniquement les huit écarts de contraste connus. Les deux exécutions du candidat ont terminé avec les mêmes huit écarts et 332 scénarios navigateur réussis chacune. La [PR 2](https://github.com/blackboxdev0/tema-academie/pull/2) a été fusionnée dans `main` au commit `9836ea2` à 16 h 18, heure de Montréal. Le [déploiement Vercel Production](https://vercel.com/blackboxsaas-projects/tema-academie/HqpYey9mJUXVjJc9zDmLHTvZM1cM) est prêt.

La [CI après fusion sur `main`](https://github.com/blackboxdev0/tema-academie/actions/runs/44617505889) a confirmé 332 réussites sur 340 et les mêmes huit écarts de contraste. Le projet Linear reste en cours et la remise sur le sous-domaine de Tema attend la fin de la recette.

Le [site public](https://project-w1j1x.vercel.app/) utilise le nouveau classeur via la version Google 2 sur l’URL Web App existante. La vérification anonyme retrouve 24 formations, quatre sessions réservables et la politique de production. La fiche et l’ouverture du formulaire ont été testées dans le navigateur. La feuille de style servie correspond au code validé, rose d’origine compris. Le contrôle de mise en ligne s’est arrêté avant la soumission du formulaire.

Le 20 novembre, Sofiane confirme avoir réussi ses propres essais sur le site public. Il a effectué une inscription, reçu les courriels et récupéré la place après annulation. Ce résultat est consigné dans [TEM-27](https://linear.app/tema-academie/issue/TEM-27/53-recetter-la-solution-complete-et-ses-invitations-de-bout-en-bout). La recette de l’équipe Tema reste ouverte.

Vercel limite la commande du projet à 256 caractères. La commande sauvegardée appelle `TEMA_BUILD` en Production, et le script validé charge `TEMA_PRODUCTION_PROFILE_JSON` pour contrôler le classeur et produire `app/dist/web`. Ces deux variables sont limitées à Production. L’ancien build demeure le chemin par défaut des autres branches et l’aperçu de la PR garde sa configuration dédiée. La commande précédente, la référence du déploiement de repli et les preuves sont conservées hors dépôt dans le dossier privé `release-20261119`.

Les sections suivantes conservent la préparation et la procédure utilisée pour la bascule.

## Réglages préparés

| Champ Vercel | Valeur |
| --- | --- |
| Framework | Other |
| Root Directory | Racine du dépôt |
| Install Command | `npm --prefix app ci` |
| Output Directory | `app/dist/web` |
| Variable de l’environnement Production | `TEMA_PRODUCTION_PROFILE_JSON`, contenu du profil Google relu après vérification de la version publique |

La commande ci-dessous charge le profil hors du dépôt, vérifie les identifiants du nouveau Sheet et de son script, compile le site, puis place uniquement les fichiers web dans le dossier publié. [Réglages de build](https://vercel.com/docs/builds/configure-a-build) · [Variables d’environnement](https://vercel.com/docs/environment-variables)

```sh
set -eu
: "${TEMA_PRODUCTION_PROFILE_JSON:?Profil Google Production requis}"
umask 077
tema_vercel_tmp=$(mktemp -d /tmp/tema-vercel-build.XXXXXXXX)
trap 'rm -rf -- "$tema_vercel_tmp"' EXIT
printf '%s' "$TEMA_PRODUCTION_PROFILE_JSON" > "$tema_vercel_tmp/profile.json"
node - "$tema_vercel_tmp/profile.json" <<'JS'
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { validateTarget } = require('./app/scripts/production-target.cjs');
const profile = validateTarget(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
const target = require('./config/project.json').verification.production_preparation;
assert.ok(profile.apiUrl, 'URL publique Apps Script requise');
assert.equal(profile.spreadsheetId, target.spreadsheet_id);
assert.equal(profile.scriptId, target.script_id);
JS
TEMA_PRODUCTION_PROFILE_PATH="$tema_vercel_tmp/profile.json" TEMA_PRODUCTION_OUTPUT_PATH="$tema_vercel_tmp/site" npm --prefix app run build
TEMA_SECURITY_WEB_PATH="$tema_vercel_tmp/site/web" npm --prefix app run security
mkdir -p app/dist
mkdir app/dist/web
cp -R "$tema_vercel_tmp/site/web/." app/dist/web/
```

Le profil complet et le résultat de l’essai restent dans le dossier privé du candidat. Le build Vercel reçoit uniquement la configuration web publique, les textes et les assets.

Le build de préparation a réussi dans un checkout temporaire avec le profil actuellement attesté. La sortie `app/dist/web` contient exclusivement les fichiers publics. La configuration générée correspond octet pour octet à l’aperçu relié au nouveau Sheet. Un profil absent et un profil lié à un autre Sheet ont été refusés avant toute sortie publique. Les réglages Vercel et la version Google publique attendent le GO.

Sofiane a autorisé la réactivation de l’aperçu de la PR 2. Vercel réserve `TEMA_PREVIEW_PROFILE_JSON` à la branche `feat/production-candidate-20261118`. `vercel.mjs` choisit le build raccordé seulement pour cet aperçu. Les réglages de build existants s’appliquent sur les autres branches et en production. Le profil passe la validation du nouveau Sheet et du script avant le build. [Configuration des branches Vercel](https://vercel.com/docs/project-configuration/git-configuration) · [Variables d’environnement](https://vercel.com/docs/environment-variables)

## Ordre de mise en service au GO

1. Relever les réglages Vercel COPY et l’identifiant du déploiement public précédent. Vérifier le plan du compte, les droits et les conditions de recette encore ouvertes. Fixer le plafond opérationnel des envois.
2. Promouvoir la version Google candidate sur le déploiement prévu, relire la version et les identifiants et vérifier la réponse anonyme. Mettre à jour le profil privé pour cette version. Contrôler les en-têtes, le traitement actif chaque minute depuis la recette client et le plafond de 100 destinataires sur 24 heures glissantes. Le journal d’envoi doit être conservé. Pour réduire le plafond, utiliser le code actuel qui sait lire le journal compact. Le déclencheur planifié de la démo a été supprimé.
3. Appliquer les réglages Vercel et la variable Production, puis fusionner la PR vers `main` pour déclencher le build. Vérifier le catalogue public, la politique, la disponibilité et le parcours d’inscription avec un essai autorisé.
4. Si le build ou le contrôle public échoue, restaurer le déploiement COPY précédent et ses réglages de build pour les déploiements suivants. Conserver le classeur, les inscriptions et le journal Google. [Retour à un déploiement Vercel précédent](https://vercel.com/docs/instant-rollback)
