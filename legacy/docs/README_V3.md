# FOSELEV VFG V3.0.0 — Sprint 1

## Réalisé
- Nouvelle architecture modulaire (`js/data.js`, `js/state.js`, `js/ui.js`, `js/main.js`).
- UI-01 : recherche intelligente dans `parc.json`.
- Historique local des 10 dernières machines.
- Ouverture directe sans écran de confirmation.
- UI-02 : tableau de bord Porteur / Tourelle.
- Compteurs au format `restant/total`.
- Zone NC indépendante et cliquable lorsqu'un constat existe.
- Nouvelle identité orange FOSELEV et logo pyramidal stylisé en CSS.
- Ancienne V2 conservée dans `legacy/`.

## Limites de ce sprint
- Les listes Porteur/Tourelle sont des écrans temporaires annonçant le Sprint 2.
- Les données V2 historiques n'ont pas encore assez de granularité pour calculer les nouveaux compteurs par zone ; elles affichent `0/0` tant que le nouveau référentiel n'est pas branché.
- Génération PDF et envoi e-mail non intégrés dans ce sprint.

## Test local
Lancer un serveur HTTP dans ce dossier, par exemple :

```bash
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.
