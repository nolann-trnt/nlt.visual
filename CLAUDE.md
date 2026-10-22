# NLT.Visual : consignes pour Claude

Site vitrine de Nolann, photographe sport & street (football principalement), Hauts-de-France.
Site statique (HTML/CSS/JS, sans framework). Production : https://nltvisual.fr

## Mise en ligne
- Dépôt GitHub : nolann-trnt/nlt.visual, branche `main`.
- Un push sur `main` met le site en ligne (hébergement Netlify, formulaire de contact Netlify Forms).
- Ne jamais commiter ni pousser sans que Nolann l'ait demandé.
- Ne rien modifier sans son accord quand il l'a précisé.

## Structure
- `index.html` : accueil (hero, carrousel, réalisations, prestations, à propos, contact, FAQ)
- `match-page/` : une page par reportage (générées par l'outil)
- `assets/css/home-v2.css`, `assets/css/match-page.css`, `assets/js/`
- `assets/images/match-page/<slug>/` : photos WebP d'un reportage ; `assets/images/thumbs/matchday/` : miniatures de l'accueil
- `llms.txt`, `sitemap.xml`, `robots.txt` : visibilité moteurs et IA
- `tools/nlt-match-generator/` : outil Python (Pillow) pour créer une page reportage. Il convertit les photos, crée la page, ajoute la carte sur l'accueil et met à jour le sitemap. Lancement : `ajouter un match.bat`.

## Tester en local
`python -m http.server 8123` dans le dossier du site, puis http://localhost:8123 (le fichier ouvert directement perd son CSS).

## Règles de contenu
- Positionnement : photographe football, sport & street. Pas uniquement foot.
- Pas de SIRET pour l'instant : aucun prix, délai ferme, mention d'entreprise ni page légale à publier.
- Éviter les tournures qui sonnent IA : « ce n'est pas X, c'est Y », listes de trois, mots creux (« sublimer », « univers »), tiret long.
- Chaque photo a un texte alt descriptif. Les textes de la FAQ doivent rester identiques dans le HTML et dans les données `FAQPage` de `index.html`.
- Une page reportage ajoutée à la main doit aussi être ajoutée à `llms.txt`.

## Photos
- Les originaux ne sont pas dans ce dépôt. Seuls les WebP optimisés y vont.
- Format : WebP, 2000 px de côté max pour la galerie.

## Restaurer sur un nouveau PC
1. Installer Git ou GitHub Desktop, se connecter au compte GitHub, cloner `nolann-trnt/nlt.visual`.
2. Installer Python, puis `pip install -r tools/nlt-match-generator/requirements.txt`.
3. Récupérer les photos originales dans la sauvegarde (cloud / disque externe).
