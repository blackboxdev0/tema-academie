# Revue indépendante des frontières — Tema Académie V1

Date : 20 octobre 2026. Lentille : deux composants respectant les règles écrites peuvent-ils néanmoins produire des résultats incompatibles ?

**Verdict : à corriger avant transmission au développement — deux divergences fortes et une convention commune incomplète.** Le statut de proposition est respecté ; cette revue documentaire n'est ni une preuve des services Google/Vercel ni une autorisation de les utiliser.

## Réconciliation avec les sources humaines

Le brief initial est réconcilié avec `docs/project/decisions/index.md` : formations sans date visibles/non inscriptibles, une personne/place, prérequis informatifs, compte Google choisi, Vercel initial, journée unique/huit places modifiables et annulation/replanification manuelles sont conservés. Les éléments encore proposés (fermeture à l'heure de début, téléphone facultatif, réinscription après annulation et confidentialité du lieu/lien) sont bien signalés. Aucun écart avec ces décisions humaines n'est relevé. L'absence d'accès vérifié, d'essai exécuté et de GO de développement est explicite.

Corpus lu : `ARCHITECTURE-SPINE.md`, `SPEC.md`, `contrat-donnees.md`, `regles-et-acceptation.md`, `plan-essai-technique.md`, les deux documents UX, le brief initial et l'index des décisions. Les lignes ci-dessous désignent l'état examiné avant correction.

## Constats forts

### S-1 — Une modification de date pendant la saisie peut réserver une autre session que celle acceptée

- **Sources :** `contrat-donnees.md:35-44,54,77` ; `ARCHITECTURE-SPINE.md:72,78,102` ; `regles-et-acceptation.md:14-16` ; UX F2 et récapitulatif figé.
- **Deux unités conformes mais incompatibles :** le site conserve le récapitulatif de la cohorte C au 10 novembre pendant la saisie ; Tema déplace C au 17 novembre en conservant son identifiant, conformément au contrat. Le service relit les données à jour et enregistre C au 17 novembre, conformément à AD-4. La commande ne transporte que l'identifiant de cohorte : aucune révision des conditions affichées ne permet de détecter ce changement. Le participant réserve donc une date qu'il n'a pas choisie, même sans course pendant la section verrouillée.
- **Effet :** les instantanés protégés et le courriel décrivent correctement la nouvelle date ; ils ne prouvent pas l'accord du participant sur cette date. Le contact manuel des inscrits existants ne couvre pas cette personne encore en train de remplir son formulaire.
- **Disposition proposée : autofix documentaire.** Ajouter une révision opaque des conditions publiques de session dans la projection et la commande ; la comparer à la session courante sous verrou avant une nouvelle réservation. En cas de différence, refuser sans écriture et faire relire/confirmer le récapitulatif à jour. Le lieu/lien privé n'a pas à être publié pour cela. Préciser aussi la procédure de fermeture temporaire avant modification humaine sensible ; le verrou seul ne couvre pas une édition Google Sheets.
- **Preuve à ajouter :** ouvrir un formulaire, changer date/horaires/mode dans le Sheet, puis soumettre ; aucune réservation silencieuse aux nouvelles conditions. Conserver séparément le cas d'une demande déjà enregistrée rejouée après changement.

### S-2 — Le résultat d'un rejeu ne permet pas au site de distinguer une inscription active d'une inscription ensuite annulée

- **Sources :** `contrat-donnees.md:50-55,81-89` ; `regles-et-acceptation.md:14,29-30` ; `ARCHITECTURE-SPINE.md:78,121-123`.
- **Deux unités conformes mais incompatibles :** le service retrouve une demande enregistrée puis annulée et renvoie son résultat historique `REPLAY`, sans réactiver la ligne. Le site reçoit `recorded=true`, `replayed=true` et l'état de courriel : aucun champ ne porte le statut actuel `annulee`. Il peut donc annoncer « Votre place est réservée », alors que cette place a été libérée et éventuellement prise par quelqu'un d'autre.
- **Effet :** l'idempotence du stockage est respectée, mais la vérité présentée au visiteur ne l'est pas. Le code `REPLAY` doit définir ce qui reste historique et ce qui est l'état courant ; le statut d'envoi n'est pas un statut de réservation.
- **Disposition proposée : autofix documentaire.** Définir dans le résultat le fait historique d'enregistrement et le statut courant de réservation, avec une correspondance UX explicite pour le rejeu d'une demande annulée. Fixer que la recherche d'une demande déjà enregistrée précède les nouveaux contrôles d'éligibilité susceptibles d'avoir changé (fermeture, capacité, politique), sans créer de nouvelle place ni relancer un message. Les refus initiaux non enregistrés doivent être distingués de ce reçu existant.
- **Preuve à ajouter :** réponse initiale perdue → annulation manuelle → rejeu de l'ancienne clé ; résultat « inscription annulée », zéro réactivation et zéro courriel. Répéter un rejeu après fermeture de session ou changement de politique : restitution du reçu existant, pas un refus laissant croire que l'inscription initiale n'a jamais existé.

## Convention commune à compléter

### S-3 — La forme du contrat et le contenu soumis à l'empreinte sont encore interprétables par chaque adaptateur

- **Sources :** `contrat-donnees.md:50,52,67-89` ; `ARCHITECTURE-SPINE.md:72,78,90,120` ; `plan-essai-technique.md`, options A/B/C et ET-03/ET-05.
- **Deux unités conformes mais incompatibles :** un site attend des sessions rattachées à chaque formation, un service renvoie deux tableaux à plat ; le document impose les données mais aucune enveloppe de lecture exacte. Pour l'écriture, le nom/type du consentement et des signaux anti-spam ainsi que le type de `mail_status` ne sont pas fixés. Un adaptateur peut réencoder un booléen en chaîne. Enfin, deux implémentations peuvent calculer `payload_fingerprint` sur tout le POST ou seulement ses champs métier ; un délai anti-spam recalculé lors du rejeu transforme alors une reprise valable en `RETRY_CONFLICT` dans la première.
- **Effet :** AD-3 et AD-6 renvoient à un contrat commun qui ne fixe pas encore ces points de jonction. Choisir le transport après essai est légitime ; la forme logique et la définition de « même contenu » peuvent être fixées sans choisir ce transport.
- **Disposition proposée : autofix documentaire.** Ajouter un schéma logique concret minimal pour lecture, commande et résultat (noms, types, champs obligatoires/nullables, emplacement des tableaux, politique et erreurs). Définir une seule canonisation serveur et l'ensemble exact des champs de l'empreinte, en séparant signaux de transport/anti-spam et identité métier de la demande. Prévoir le mapping de formulaire URL-encodé/RPC vers ce même objet ; les octets du transport ne constituent pas l'empreinte métier.
- **Preuve à ajouter :** exemples de contrat et rejeu de la même demande après normalisation des espaces/casse autorisée et changement du délai de formulaire ; résultat identique, aucune inscription ou notification supplémentaire. Un changement de champ métier sous la même clé reste un conflit.

## Points examinés sans nouveau constat

- Dernière place entre deux demandes publiques : autorité serveur, verrou unique, relecture et preuve concurrente sont prévus. Les limites des éditions humaines sont reconnues ; S-1 vise le trou restant sur les conditions effectivement acceptées.
- Courriels : enregistrement indépendant, deux états par destinataire, claim sous verrou, résultat inconnu et reprise opérateur sont explicitement distingués ; aucune garantie d'envoi exactement une fois n'est promise.
- Transport : les variantes et leurs conséquences UX restent une décision bloquée par l'essai ; ni réponse opaque ni succès HTTP seul n'est accepté comme preuve de réservation.
- Consentement, projection publique et erreurs : contrôle serveur, politique présentée, liste blanche et absence de détails personnels dans le résultat sont prévus ; la politique réelle et sa validation restent correctement ouvertes.

Ces constats ne demandent ni nouvelle plateforme ni élargissement métier. Ils précisent les contrats que les unités déjà prévues doivent partager avant leur réalisation.

## Addendum — Vérification des corrections du 20 octobre 2026

Relecture limitée à `contrat-donnees.md`, `regles-et-acceptation.md`, `ARCHITECTURE-SPINE.md` et F2/F3/F5 d'`EXPERIENCE.md`, conformément à la demande de vérification. Cette section remplace le verdict initial pour l'état documentaire corrigé ; les constats précédents restent la trace de la revue.

**Verdict documentaire après correction : S-1, S-2 et S-3 fermés. Aucun conflit résiduel constaté dans ce périmètre.** Les propositions restent soumises à la validation humaine ; aucun essai de service, développement ou déploiement n'est établi par cette fermeture.

| Constat | Correction constatée et concordance | État |
|---|---|---|
| S-1 — Conditions modifiées pendant la saisie | `session_revision` opaque figure dans la projection, la commande et l'inscription. Son périmètre de conditions est défini ; le service seul la produit. Une nouvelle demande périmée renvoie `SESSION_CHANGED` sans réserver, puis impose relecture/confirmation et nouvelle clé. AD-3/4/8, règle 5, procédure de suspension et UX F2/F5 concordent. Une demande déjà enregistrée est rejouée avant le contrôle des conditions actuelles. | Fermé sur pièces ; comportement réel à éprouver. |
| S-2 — Rejeu après annulation | Le résultat distingue `recording_status: recorded/not_recorded/unknown` et `reservation_status: confirmee/annulee/null`. La recherche/empreinte d'une demande existante précède fermeture, politique et capacité. `REPLAY` rend le statut courant ; UX F3 annonce explicitement l'annulation sans réactivation. Réponse perdue, verrou indisponible et conflit de contenu ne prétendent pas établir une absence d'inscription. | Fermé sur pièces ; reprise réelle à éprouver. |
| S-3 — Forme commune et empreinte | Schémas logiques V1 explicites pour lecture, commande et résultat ; formations/sessions à plat reliées par ID, politique publique et états mails typés. Le décodage URL-encodé/RPC aboutit au même objet. Canonisation NFC/trim/casse du courriel/téléphone nul, tableau ordonné et SHA-256 sont communs ; anti-spam, temps et transport sont exclus de l'empreinte. Les jeux d'exemples communs sont exigés avant les tests. | Fermé sur pièces ; exemples et tests à produire pendant la réalisation autorisée. |

Les états de courriel `UNKNOWN`, `BLOCKED` et `SUPPRESSED` sont distincts du statut courant de réservation. Les règles, AD-5 et F3/F5 concordent : aucun rejeu ne relance un email ; une annulation empêche les messages non partis, des conditions modifiées bloquent l'ancien contenu et un résultat d'envoi inconnu demande vérification opérateur. La suspension attend ou fait vérifier les envois en cours ; les éditions humaines brutes hors procédure ne sont pas annoncées atomiques.

La fermeture porte sur la cohérence des frontières documentées. Elle ne valide ni les accès, ni le transport choisi, ni le respect des quotas, ni les effets concurrents sur les services réels. Ces preuves et les décisions humaines demeurent les étapes prévues du dossier.
