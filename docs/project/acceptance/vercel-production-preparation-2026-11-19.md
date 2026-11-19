# Préparation de la mise en ligne Tema sur Vercel

Le [site public](https://project-w1j1x.vercel.app/) sert la démo. Le [projet Vercel](https://vercel.com/blackboxsaas-projects/tema-academie) suit `main`, avec un build réglé pour COPY. Le code du candidat reste associé à la [PR de préparation](https://github.com/blackboxdev0/tema-academie/pull/2). Cette procédure prépare le changement de cible vers le nouveau classeur Google.

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

Le push du correctif sur la PR 2 est autorisé. `vercel.json` reporte les aperçus automatiques de la seule branche `feat/production-candidate-20261118` jusqu’à la prochaine décision de livraison. [Configuration des branches Vercel](https://vercel.com/docs/project-configuration/git-configuration)

## Ordre de mise en service au GO

1. Relever les réglages Vercel COPY et l’identifiant du déploiement public précédent. Vérifier le plan du compte, les droits et les conditions de recette encore ouvertes. Fixer le plafond opérationnel des envois.
2. Promouvoir la version Google candidate sur le déploiement prévu, relire la version et les identifiants et vérifier la réponse anonyme. Mettre à jour le profil privé pour cette version. Contrôler les en-têtes, remettre le traitement à cadence minute et réactiver les envois avec le plafond convenu en conservant le journal.
3. Appliquer les réglages Vercel et la variable Production, puis fusionner la PR vers `main` pour déclencher le build. Vérifier le catalogue public, la politique, la disponibilité et le parcours d’inscription avec un essai autorisé.
4. Si le build ou le contrôle public échoue, restaurer le déploiement COPY précédent et ses réglages de build pour les déploiements suivants. Conserver le classeur, les inscriptions et le journal Google. [Retour à un déploiement Vercel précédent](https://vercel.com/docs/instant-rollback)
