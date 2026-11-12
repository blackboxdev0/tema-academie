- source_spec: `spec-reusable-project-foundation.md`
  summary: Validate complete mutable YAML syntax during initialization and method checks, including unmanaged values.
  evidence: The pre-maintenance merge and checker already accepted an unterminated unmanaged scalar or flow collection; current managed-key guards and native hashes do not parse arbitrary YAML. Choose a maintained parser and its portable dependency policy before adding that validation. Findings BH-3 and BH-4 share this pre-existing gap.

- source_spec: `_bmad-output/implementation-artifacts/spec-ajout-classeur-copie.md`
  summary: Traiter la cohérence transactionnelle et la recette multiutilisateur lors de l’intégration de l’administration par sections au moteur complet.
  evidence: Revue et adaptateur reproduisent une seconde saisie pendant la réconciliation bornée : capacité humaine conservée mais compteur/note possibles du calcul précédent jusqu’au prochain événement. Google a aussi affiché un refus de verrou lors de saisies rapides. Le prototype reste dans une copie non raccordée ; F/G ne sont jamais écrits par le script après correction.
- source_spec: `_bmad-output/implementation-artifacts/spec-suivi-inscriptions-copie.md`
  summary: Fermer le serveur de measure-availability si Chromium ne démarre pas.
  evidence: Revue du diff global ; server.listen précède chromium.launch, lui-même hors try/finally. Défaut de l’expérience antérieure, sans lien avec la vue Inscriptions.

- source_spec: `_bmad-output/implementation-artifacts/spec-suivi-inscriptions-copie.md`
  summary: Fermer le serveur de measure-batchget si Chromium ne démarre pas.
  evidence: Revue du diff global ; même lancement hors try/finally après server.listen. Expérience antérieure indépendante préservée.
- source_spec: `_bmad-output/implementation-artifacts/spec-raccordement-copie-site.md`
  summary: Stabiliser le titre d’un groupe historique dont la formation source a disparu et dont les instantanés divergent.
  evidence: Revue Blind du raccordement : project réaffecte le titre pour chaque participant, donc l’ordre des lignes change le groupe. Préexistant au raccordement, absent des neuf inscriptions courantes ; choisir la règle de titre tout en conservant les différences individuelles.

- source_spec: `_bmad-output/implementation-artifacts/spec-annulation-suivi-copie.md`
  summary: Revoir le contenu de l’avis initial Tema si une réservation est annulée pendant les envois initiaux.
  evidence: sendChannel vérifie annulee pour participant seulement ; ce comportement précède l’action du suivi et existe déjà avec annulation manuelle, tandis que le nouveau contrôleur n’envoie aucun mail. Le test moteur de suppression participant/avis Tema conserve le contrat historique.

- source_spec: `_bmad-output/implementation-artifacts/spec-configuration-code-copie.md`
  summary: Durcir les sorties et sauvegardes du builder COPY contre symlinks, permissions héritées, écritures partielles et collisions, avec tests d’échecs.
  evidence: Revue 10 novembre : contrôles lexicaux, writeFile non atomiques, modes appliqués seulement à la création et timestamp sans exclusivité sont préexistants ; sortie courante réelle privée et hashes natifs vérifiés compensent cette recette, sans corriger le builder général.

- source_spec: `_bmad-output/implementation-artifacts/spec-inscription-arriere-plan-demo.md`
  summary: Le contrôle global de structure des inscriptions bloque aussi les notifications lorsqu’une autre ligne est corrompue manuellement.
  evidence: dataView dans engine.js validait déjà toutes les clés/états avant notification, catalogue et admission. Préserver cet échec fermé dans cette tranche ; étudier séparément une récupération sûre et un diagnostic administratif sans envoyer sur une source corrompue. Le cas réel courant possède une source valide.

- source_spec: `_bmad-output/implementation-artifacts/spec-inscription-arriere-plan-demo.md`
  summary: Durée résiduelle du verrou Google non mesurée après séparation de la présentation (medium, non vérifié).
  evidence: Le candidat conserve des lectures métier et un flush sous verrou ; mesurer la reprise de la demande humaine initiale et le temps POST après activation. Les tests locaux ne prouvent pas la latence Google.

- source_spec: `_bmad-output/implementation-artifacts/spec-inscription-arriere-plan-demo.md`
  summary: Coordonnées des décorations pendant déplacement humain de lignes.
  evidence: Le verrou Apps Script ne bloque pas les éditions natives Google, y compris avant ce correctif ; contrôle final et reprise détectent la divergence mais ne sont pas une transaction Sheets.

- source_spec: `_bmad-output/implementation-artifacts/spec-inscription-arriere-plan-demo.md`
  summary: Audit des notes/dropdowns supprimés manuellement hors changement métier.
  evidence: Les empreintes historiques excluent déjà les décorations ; réparation administrative explicite, sans lien avec admission durable.

- source_spec: `_bmad-output/implementation-artifacts/spec-inscription-arriere-plan-demo.md`
  summary: Note résiduelle d’une ligne administrative entièrement vidée.
  evidence: Le plan préexistant ne produit des notes que pour records non vides ; défaut cosmétique préexistant.

- source_spec: `_bmad-output/implementation-artifacts/spec-inscription-arriere-plan-demo.md`
  summary: Budget réel du simple onEdit en latence Google (medium, non vérifié).
  evidence: Le harness ne mesure pas les services Google ; observer durée des déclencheurs après activation, marqueurs pending et minute conservés.
