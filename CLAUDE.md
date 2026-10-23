# NLT.Visual : consignes pour Claude

Site vitrine de Nolann, photographe sport & street (football principalement), Hauts-de-France.
Site statique fabriqué par un petit script Python (`build.py`) à partir de fichiers de contenu. Production : https://nltvisual.fr

## Mise en ligne
- Dépôt GitHub : nolann-trnt/nlt.visual, branche `main`.
- Un push sur `main` déclenche Netlify : il lance `build.py` puis publie le dossier `_site/` (formulaire de contact : Netlify Forms).
- Ne jamais commiter ni pousser sans que Nolann l'ait demandé.
- Ne rien modifier sans son accord quand il l'a précisé.
- Un chantier = une branche (et idéalement un `git worktree`), jamais directement sur `main`.

## Où modifier quoi
| Je veux changer... | Fichier |
|---|---|
| Titre Google, description, mail, Instagram, pied de page | `content/site.json` |
| Textes de l'accueil (hero, intro, à propos, contact) | `content/accueil.json` |
| Prestations | `content/prestations.json` |
| FAQ (le balisage Google est généré avec : un seul endroit à éditer) | `content/faq.json` |
| Photos du carrousel | `content/carrousel.json` |
| Cartes de la section Réalisations | `content/realisations.json` |
| Structure HTML de l'accueil | `templates/index.html.j2` |
| Style de l'accueil (se charge après `home-v2.css`) | `assets/css/accueil-v3.css` |
| Animations de l'accueil (arrivée, apparitions au défilement) | `assets/js/accueil-anim.js` |
| Autre style / comportement | `assets/css/`, `assets/js/` |

Ne jamais éditer `_site/` (généré, ignoré par Git). Il n'y a plus de `index.html` ni de `llms.txt` à la racine : ils sont fabriqués par `build.py` (`llms.txt` se met à jour tout seul avec les réalisations et la FAQ).

L'interface d'administration (Pages CMS, https://app.pagescms.org, connexion avec GitHub) édite ces mêmes fichiers `content/*.json`, d'après `.pages.yml`. Si on ajoute un champ dans un JSON, l'ajouter aussi dans `.pages.yml`.

## Structure
- `build.py` : fabrique `_site/` (copie `assets/`, `match-page/`, 404, merci, robots, sitemap, manifest ; rend `index.html` et `llms.txt`). Il échoue avec un message clair si une image ou une page référencée manque.
- `match-page/` : une page par reportage (générées par l'outil, copiées telles quelles).
- `assets/images/match-page/<slug>/` : photos WebP d'un reportage ; `assets/images/thumbs/matchday/` : miniatures de l'accueil.
- `tools/nlt-match-generator/` : outil Python (Pillow) pour créer un reportage. Il convertit les photos, crée la page, ajoute la carte dans `content/realisations.json` et met à jour `sitemap.xml`. Lancement : `ajouter un match.bat`.
- `previsualiser.bat` : fabrique le site et l'ouvre sur http://localhost:8123.

## Tester en local
`python build.py` puis `python -m http.server 8123 --directory _site`, ou double-clic sur `previsualiser.bat`. (Ouvrir un fichier directement dans le navigateur fait perdre le CSS.)

## Règles de contenu
- Positionnement : photographe football, sport & street. Pas uniquement foot.
- Pas de SIRET pour l'instant : aucun prix, délai ferme, mention d'entreprise ni page légale à publier.
- Éviter les tournures qui sonnent IA : « ce n'est pas X, c'est Y », listes de trois, mots creux (« sublimer », « univers »), tiret long.
- Chaque photo a un texte alt descriptif.
- Dans les fichiers JSON, un retour à la ligne dans un titre s'écrit `\n` (le site le transforme en saut de ligne).

## Photos
- Les originaux ne sont pas dans ce dépôt. Seuls les WebP optimisés y vont.
- Format : WebP, 2000 px de côté max pour la galerie.

## Restaurer sur un nouveau PC
1. Installer Git ou GitHub Desktop, se connecter au compte GitHub, cloner `nolann-trnt/nlt.visual`.
2. Installer Python, puis `pip install -r requirements-build.txt` et `pip install -r tools/nlt-match-generator/requirements.txt`.
3. Récupérer les photos originales dans la sauvegarde (cloud / disque externe).
