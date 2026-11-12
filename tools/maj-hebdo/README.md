# Mise à jour hebdomadaire des reportages

Routine suivie chaque lundi soir par la tâche planifiée. Elle ajoute au site les matchs publiés sur Instagram,
avec les photos retrouvées dans Lightroom, et ouvre une pull request que Nolann valide. Rien n'est jamais publié sans lui.

## Règles
- Seulement les **matchs** (légende du type `@club1 ⚔️ @club2`). Ignorer reels, Octobre rose, shootings et autres posts.
- Toujours travailler sur une branche `maj-hebdo-AAAA-MM-JJ` créée depuis `origin/main`. Jamais de push sur `main`, jamais de fusion.
- Ne pas modifier le carrousel de l'accueil. Ne pas toucher aux reportages existants.
- Pas de captures d'écran. Lire les pages avec `get_page_text`, `find`, `read_page` ou `javascript_tool`.
- S'il n'y a aucun nouveau match, ne rien faire : pas de branche, pas de PR.

## Étapes
1. `git fetch`, puis `git switch -c maj-hebdo-AAAA-MM-JJ origin/main`.
2. Lister les posts récents de `https://www.instagram.com/nlt.visual/` (liens `/p/` : l'attribut `alt` de la vignette contient le début de la légende).
3. Garder les posts de match absents du site : comparer les deux clubs avec les titres de `content/realisations.json`
   (ex. `omf-us-camon`). La date du post sert de repère : le match a eu lieu la veille ou le jour même.
4. Pour chaque nouveau match :
   - Ouvrir le post, attendre 15 s, puis exécuter `instagram_hashes.js` avec `javascript_tool` (copier le contenu du fichier). Noter la liste d'empreintes.
   - Dans Lightroom web (`https://lightroom.adobe.com/libraries/f4d1b9b97ec24646ade192bc5442ea49/assets?tab=photos&panel=organize`),
     ouvrir l'album du match (nom proche des clubs), attendre le chargement, appuyer deux fois sur Ctrl+A (le compteur « N sélectionnés » doit apparaître),
     puis Télécharger > **Optimisé** (JPEG 2048 px avec les retouches). Un zip arrive dans `Downloads`.
   - Extraire le zip dans un dossier temporaire hors du dépôt.
   - `python -I tools/maj-hebdo/match_photos.py <dossier extrait> <dossier sélection> "<empreintes>"`.
   - `python -I tools/maj-hebdo/creer_reportage.py --dossier <dossier sélection> --club1 ... --club2 ... --competition ... [--client OMF] [--date ...]`
     (club domicile en premier, comme dans la légende du post ; client `OMF` pour les matchs de l'OMF).
5. `python build.py`, puis vérifier la page avec `python -m http.server 8123 --directory _site`.
6. Commiter, pousser la branche et ouvrir une PR vers `main`. Corps de la PR : pour chaque match, nombre de photos retrouvées sur celles du post,
   photos non retrouvées, et les points **à compléter ou à confirmer** (compétition, date, lieu, choix du fond et de la miniature).
   Ne mettre ni compétition ni date si elles ne sont pas certaines : les laisser vides et les signaler.

## Fichiers
- `instagram_hashes.js` : calcule une empreinte par image du carrousel Instagram.
- `match_photos.py` : retrouve les photos Lightroom correspondantes.
- `creer_reportage.py` : crée la page, les WebP, la miniature, la carte de l'accueil et le sitemap.
