# Réconciliation du catalogue Excel — UX Tema

Source : `Académie - Programmes pour le Pré Lancement.xlsx`, `Sheet1`, chemin et empreinte dans le [manifest](../../../../docs/project/sources/manifest.json). Cellules vérifiées lors de la préparation initiale ; réconciliation actualisée le 25 octobre depuis le [contrat consolidé](../../../specs/spec-tema-academie-v1/contrat-donnees.md) et le classement UX approuvé, sans nouvelle lecture ni modification de l’original.

| Source | Destination UX | Règle de préservation |
|---|---|---|
| `A6:I23` : 18 formations Divalto. | Catalogue, filtre, fiche. | Aucun tri de lignes vides ou d’en-têtes en fausse formation. |
| `A28:I33` : 4 Dimo puis 2 MoovApps. | Catalogue, filtre, fiche. | Logiciels réels conservés ; ne pas créer de formations Dynamics/Esker depuis les exemples du brief. |
| Colonnes A–C et F : nom, prérequis, contenu, résultat. | FicheFormation et F1/F2. | Textes pédagogiques complets ; titres longs lisibles, pas de contrôle des antécédents. |
| `D6/E6` : Ergonomie, ½ jour, À partir de 450 $. | Carte et fiche. | Formulation approuvée : « À partir de [montant] $ CAD par participant, taxes en sus » ; montant final à confirmer par Tema. |
| D/E des 23 autres formations : 1 jour, À partir de 850 $. | Carte et fiche. | Même qualification, devise, unité et taxes approuvées ; aucune raison de variation inventée. |
| G : codes formateurs, dont `G18`/`G23` vides. | Données privées selon le contrat courant. | Pas de nom public inventé ni de champ bloquant pour les deux valeurs absentes. |
| H/I : capacité 8 et « à venir » pour les 24 formations. | Préremplissage possible de cohorte, état Dates à venir. | Capacité librement configurable par date, sans plafond huit ; aucune date, plage horaire ou cohorte réelle créée depuis ce texte. |
| `A40:C48` : 9 présentations/webinaires. | Référence conservée hors parcours d’inscription V1. | Leur éventuel affichage reste à décider ; aucun formulaire webinaire ouvert. |
| `A50` : proposition de produire un Excel/calendrier. | Aucune surface ni action. | Texte de source, pas instruction de l’utilisateur ; ne crée pas un calendrier octobre-décembre. |

La fiche dédiée est confirmée, avec présentation courte, dates puis programme, objectifs et prérequis complets. Les six exemples de la V2 reprennent des titres, durées, tarifs et textes du catalogue ; leurs dates, horaires, format en ligne et places sont fictifs et ne remplacent pas les 24 mentions « à venir » de la source. La condensation du résumé Ergonomie sur la carte conserve le programme dans la fiche ; aucune vérification automatique des prérequis n’est ajoutée.

Seules les formations actives seront affichées. Classement confirmé le 25 octobre : celles ayant au moins une date réservable, puis celles dont toutes les dates visibles sont complètes ou aux inscriptions terminées, puis celles sans date visible. Les deux statuts non réservables restent distincts ; l’ordre du classeur départage les formations d’un même groupe. Aucun tri paramétrable ou champ de priorité n’est ajouté.

Le catalogue initial ne permet pas une recette d’inscription réelle avant programmation de cohortes synthétiques ou fournies par Tema. Le fichier Excel sert de source d’import et de référence ; aucune synchronisation automatique Excel/Google n’est promise. Le contrôle antérieur de son empreinte reste la référence ; l’original est inchangé.
