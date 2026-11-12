# Brief projet : Tema Académie, plateforme d'inscriptions aux formations

Client : Tema Solutions (temasolutions.ca), volet Tema Académie
Référé par : David Leblanc (Caractère Gras)
Prestataire : bkbx
Date du brief : 19 octobre 2026
Statut : proposition présentée, en attente du go client

---

## 1. Contexte

Tema Solutions est un intégrateur de logiciels de gestion au Québec (Divalto, Microsoft Dynamics 365, Esker, etc.). Tema Académie offre des formations sur ces logiciels à ses clients.

Aujourd'hui, Tema n'a pas d'outil simple pour :
- présenter son catalogue de formations sur le web;
- afficher les prochaines dates (cohortes);
- recevoir les inscriptions sans intervention manuelle.

Le client veut le plus petit outil possible : rapide à livrer, peu cher, sans plateforme lourde, et qu'il peut mettre à jour lui-même sans dépendre de quelqu'un.

Le site vitrine de Tema est en refonte par David Leblanc (site statique). Notre module s'intègre à côté ou dedans.

## 2. Objectif

Un Google Sheet devient le « back-office » de Tema. Un petit site web lit ce sheet et l'affiche. Les inscriptions reviennent automatiquement dans le sheet.

Le circuit, en trois étapes :
1. Tema ajoute une formation ou une date dans le Google Sheet.
2. Elle apparaît sur le site (catalogue + calendrier mensuel).
3. Un client s'inscrit : la ligne arrive dans le sheet, le participant reçoit sa confirmation avec ajout à l'agenda, Tema est avisé, les places restantes se mettent à jour.

Critère de réussite : un employé de Tema, sans compétence technique, ajoute une cohorte dans le sheet et la voit sur le site au prochain rafraîchissement, sans nous appeler.

## 3. Contraintes du mandat

- **Budget :** forfait de 3 600 $ (taxes en sus), environ 3 jours-homme. Le développement est fait en agentique; le temps humain couvre l'investigation, les tickets, les tests et la remise.
- **Aucun frais mensuel :** pas de serveur applicatif, pas de base de données, pas d'abonnement payant.
- **Compte Google :** pour l'instant, bkbx crée le compte Gmail gratuit dédié (ex. academy-tema@gmail.com) de son côté. On développe, on met en production et on livre avec ce compte.
- **Compatibilité Excel :** Tema travaille sous Microsoft. Sofiane s'occupe de la façon dont Tema pourra aussi travailler avec Excel. Pour ne pas fermer cette porte côté technique :
  - garder des données tabulaires simples (une ligne = un enregistrement, en-têtes sur la ligne 1);
  - éviter les fonctions propres à Google Sheets (QUERY, ARRAYFORMULA, IMPORTRANGE) dans les onglets de données;
  - faire les calculs (places restantes, etc.) dans le script plutôt que dans des formules quand c'est possible;
  - le script lit les colonnes par nom d'en-tête.
- **Langue :** français seulement.
- **Livraison :** 1 mois après réception de l'acompte (30 % au démarrage, 70 % à la livraison).
- **Garantie :** 30 jours, correction des bogues sans frais.

## 4. Périmètre

### Inclus

- **Le site :**
  - catalogue des formations (cartes);
  - agenda mensuel des cohortes;
  - une couleur par logiciel (filtre ou légende par logiciel, pour ne pas mélanger les formations Divalto, Dynamics, etc.);
  - affichage des places restantes et état « Complet » quand c'est plein;
  - les dates passées ne s'affichent plus.
- **Le formulaire d'inscription**, avec consentement Loi 25.
- **Les courriels :**
  - confirmation au participant avec fichier d'invitation agenda (.ics) compatible Google, Outlook et Apple;
  - avis à Tema pour chaque nouvelle inscription.
- **Le Google Sheet**, avec le catalogue actuel déjà importé (fichier fourni par David) et un mode d'emploi.
- **La mise en ligne**, une ronde d'ajustements, une séance de remise de 30 minutes.

### Exclu (pour l'instant)

- Paiement en ligne (Tema facture ses clients de façon classique).
- Inscriptions aux webinaires.
- Version anglaise.
- Espace client, authentification, gestion des annulations en libre-service.

### Évolution prévue (hors mandat)

Si Tema veut un jour le paiement en ligne ou un espace client, les données du sheet seront migrées vers un système plus complet, sans perte. Garder une structure de données propre et normalisée pour rendre cette migration triviale.

## 5. Architecture technique

```
[Google Sheet] <-> [Google Apps Script (Web App)] <-> [Site statique HTML/CSS/JS]
                           |
                           +--> MailApp : confirmation participant + avis Tema
```

### 5.1 Google Sheet (source de vérité)

Hébergé sur le compte Gmail dédié créé par bkbx. Les personnes de Tema y ont un accès éditeur. Pour un compte Gmail gratuit, chaque personne invitée doit avoir un compte Google; elle peut en créer un avec son adresse Microsoft existante, sans nouvelle boîte courriel. Onglets proposés (à valider à partir du catalogue fourni) :

**Onglet `Formations`** (le catalogue)
| Colonne | Description |
|---|---|
| id | Identifiant court, unique (ex. ERGO-01). Généré ou saisi. |
| logiciel | Liste déroulante (Divalto, Dynamics 365, etc.). Pilote la couleur sur le site. |
| titre | Nom de la formation |
| description | Texte affiché sur la carte |
| duree | Ex. « ½ jour », « 1 jour » |
| prix | Ex. 450 (affiché « À partir de 450 $ ») |
| actif | Oui / Non (masque la formation sans la supprimer) |

**Onglet `Disponibilités`** (les cohortes)
| Colonne | Description |
|---|---|
| id_cohorte | Unique |
| formation | Liste déroulante alimentée par `Formations` |
| date | Format date |
| heure_debut / heure_fin | Ex. 9 h / 12 h |
| places_max | Ex. 8 (modifiable : 4, 6, 10...) |
| mode | Présentiel / En ligne (à confirmer avec Tema) |
| lieu_ou_lien | Adresse ou lien de la session; inséré dans le courriel de confirmation |
| places_restantes | Calculée par le script (places_max moins inscriptions confirmées) et écrite dans la colonne, protégée. Éviter une formule propre à Google pour rester compatible Excel. |

**Onglet `Inscriptions`** (rempli uniquement par le script)
horodatage, id_cohorte, formation, date, prénom, nom, entreprise, courriel, téléphone, consentement_loi25 (avec horodatage), statut (confirmée / annulée).

**Onglet `Paramètres`**
courriel d'avis Tema, nom d'expéditeur (« Tema Académie »), lien vers la politique de confidentialité, couleur par logiciel.

**Robustesse du sheet** (point soulevé par David : « s'il change des affaires, le site va plus savoir où est mon prix ») :
- en-têtes et colonnes calculées protégés;
- listes déroulantes et validation de données (dates, nombres);
- le script lit les colonnes par nom d'en-tête, jamais par position;
- le site ignore proprement une ligne incomplète au lieu de planter.

### 5.2 Google Apps Script (Web App)

Déployé en « Exécuter en tant que : moi », « Accès : tout le monde ».

- `doGet` : renvoie en JSON les formations actives et les cohortes à venir avec places restantes. Cache court (CacheService, environ 60 s) pour limiter les lectures.
- `doPost` : reçoit une inscription.
  - Valide les champs et le consentement.
  - Prend un verrou (LockService) pour éviter la surréservation lors d'inscriptions simultanées.
  - Revérifie les places restantes; refuse si complet.
  - Refuse un doublon (même courriel, même cohorte).
  - Ajoute la ligne dans `Inscriptions`.
  - Envoie la confirmation (avec .ics, fuseau America/Toronto) et l'avis à Tema.
  - Renvoie un statut clair au site (succès, complet, erreur).
- Anti-spam léger : champ piège (honeypot) et délai minimal de remplissage.

**Quotas Gmail gratuit :** environ 100 destinataires par jour via script. Chaque inscription consomme 2 envois, donc une cinquantaine d'inscriptions par jour. Largement suffisant pour des cohortes de 8. Prévoir un message d'erreur propre et un journal si le quota est atteint.

### 5.3 Site statique

- HTML, CSS, JS sans backend. Pas de dépendance lourde.
- Vues :
  - **Catalogue :** cartes (titre, logiciel, durée, prix « À partir de », prochaine date, places, bouton « S'inscrire »).
  - **Calendrier mensuel :** cohortes positionnées par date, couleur par logiciel, navigation mois précédent / suivant.
  - **Formulaire d'inscription** (modale ou page) : prénom, nom, entreprise, courriel, téléphone, case de consentement Loi 25 avec lien vers la politique.
  - **États :** chargement, « Complet », erreur réseau, confirmation après inscription.
- Responsive (mobile d'abord).
- Accessibilité de base : contrastes, navigation clavier, libellés de formulaire.

**Identité visuelle :** celle de Tema, pas celle de bkbx.
- Gris : #585D6B
- Rose : #FF008F
- Ces deux couleurs sont relevées sur le logo; les codes officiels sont à obtenir de David.
- Logo fourni.
- Alignement avec le nouveau site que David construit.

**Hébergement**, au choix du client :
- FTP de leur site;
- sous-domaine (ex. formations.temasolutions.ca);
- petit serveur Hostinger pris par bkbx.

### 5.4 Courriels

**Confirmation participant :**
- Objet : « Votre inscription est confirmée »
- Contenu : formation, date, heures, lieu ou lien, bouton « Ajouter à mon agenda » (.ics joint).
- Expéditeur affiché : « Tema Académie ».
- Les courriels partent de l'adresse Gmail, pas d'un domaine @temasolutions.ca. Accepté par le client.

**Avis à Tema :** résumé de l'inscription, lien vers le sheet.

## 6. Conformité Loi 25

- Case de consentement explicite, non cochée par défaut, avec lien vers la politique de confidentialité de Tema.
- Horodatage du consentement stocké avec l'inscription.
- Collecter seulement les champs nécessaires.
- Le sheet est partagé uniquement avec les personnes autorisées chez Tema.
- Documenter dans le mode d'emploi comment supprimer les données d'un participant sur demande.

## 7. Livrables

1. Google Sheet structuré, protégé, avec le catalogue actuel importé.
2. Apps Script déployé (lecture + inscription + courriels).
3. Site statique déployé à l'endroit choisi par Tema.
4. Mode d'emploi court (ajouter une formation, ajouter une date, changer le nombre de places, consulter les inscrits, retirer une formation).
5. Une ronde d'ajustements.
6. Séance de remise de 30 minutes.
7. Accès : tout est sur le compte Google créé par bkbx. Tema a un accès éditeur au sheet. Le transfert éventuel du compte à Tema est à décider plus tard.

## 8. Critères d'acceptation

- [ ] Une nouvelle ligne dans `Disponibilités` apparaît sur le site (catalogue et calendrier) en moins de 2 minutes, sans action de bkbx.
- [ ] Une nouvelle formation dans `Formations` (actif = Oui) apparaît comme nouvelle carte.
- [ ] Modifier `places_max` change les places affichées.
- [ ] Une inscription crée une ligne dans `Inscriptions`, envoie la confirmation avec .ics valide et l'avis à Tema.
- [ ] Les places restantes baissent de 1 après chaque inscription.
- [ ] À 0 place, la cohorte affiche « Complet » et le script refuse toute nouvelle inscription, même simultanée.
- [ ] Une inscription en double (même courriel, même cohorte) est refusée avec un message clair.
- [ ] Les dates passées ne s'affichent pas.
- [ ] Les formations sont différenciées par logiciel (couleur et filtre ou légende).
- [ ] Le consentement Loi 25 est obligatoire et horodaté.
- [ ] Une ligne mal remplie dans le sheet ne casse pas le site.
- [ ] Le site fonctionne sur mobile et sur les navigateurs courants.

## 9. Découpage suggéré (épics / stories)

**Épic 1 : Données**
- 1.1 Structurer le Google Sheet (onglets, validations, protections, formules).
- 1.2 Importer le catalogue fourni par David.

**Épic 2 : API Apps Script**
- 2.1 `doGet` : formations actives + cohortes à venir + places restantes (JSON, cache).
- 2.2 `doPost` : inscription avec verrou, contrôle des places, doublons, anti-spam.
- 2.3 Courriel de confirmation avec .ics et courriel d'avis à Tema.

**Épic 3 : Site**
- 3.1 Vue catalogue (cartes, couleur par logiciel, places, état Complet).
- 3.2 Vue calendrier mensuel.
- 3.3 Formulaire d'inscription + consentement Loi 25 + états (succès, complet, erreur).
- 3.4 Habillage Tema, responsive, accessibilité de base.

**Épic 4 : Mise en ligne et remise**
- 4.1 Déploiement (FTP, sous-domaine ou Hostinger).
- 4.2 Tests de bout en bout (scénarios de la section 8).
- 4.3 Mode d'emploi + séance de remise.

## 10. Questions ouvertes (à valider avec Tema via David)

1. Formations en présentiel ou en ligne ? Si en ligne : quelle plateforme (Teams, Zoom, autre) ? Le lien de session va dans `lieu_ou_lien` et dans le courriel de confirmation. Sinon, bkbx peut suggérer une plateforme.
2. Nom exact de l'adresse Gmail créée par bkbx, et liste des personnes de Tema à inviter sur le sheet.
3. Hébergement choisi : FTP, sous-domaine ou Hostinger.
4. Adresse courriel qui reçoit les avis d'inscription.
5. Lien vers la politique de confidentialité de Tema.
6. Codes couleur officiels de Tema (via David).
7. Liste définitive des logiciels pour la colonne `logiciel`.

## 11. Contacts

- **Client :** Tema Solutions (Tema Académie). Contact à préciser.
- **Partenaire :** David Leblanc, Caractère Gras (référent, refonte du site de Tema).
- **bkbx :** Sofiane Korbi.