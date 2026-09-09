NLT.VISUAL - GÉNÉRATEUR DE MATCH

À placer dans ton site comme ceci :

NLT-Visual/
├─ index.html
├─ match-page/
├─ assets/
└─ tools/
   └─ nlt-match-generator/
      ├─ ajouter_match.py
      ├─ requirements.txt
      ├─ installer.bat
      ├─ lancer.bat
      └─ templates/
         └─ match-template.html

AVANT LA PREMIÈRE UTILISATION

1. Vérifie que ton site contient :
   assets/js/match-page-shared.js
   assets/css/match-page.css

2. Dans assets/css/match-page.css, cherche dans .match-info :
   grid-template-columns: repeat(4, 1fr);

   Remplace uniquement cette ligne par :
   grid-template-columns: repeat(var(--info-count, 4), 1fr);

   Cela permet :
   - client renseigné = 4 cases
   - client vide = 3 cases
   - aucune case Client vide

3. Python doit être installé.

4. Double-clique une seule fois sur installer.bat.
   Cela installe Pillow pour convertir les images en WebP.

UTILISATION

1. Depuis Lightroom, exporte :
   - toutes les photos que tu veux dans la galerie (nombre libre)
   - 1 cover
   - 1 miniature home

2. Lance lancer.bat.

3. Remplis :
   - Équipe 1
   - Équipe 2
   - Compétition
   - Date
   - Lieu
   - Client (facultatif)

4. Choisis :
   - le dossier contenant les photos de galerie
   - la cover
   - la miniature

5. Clique CRÉER LA RÉALISATION.

LE SCRIPT FAIT AUTOMATIQUEMENT

- slug du match
- dossier assets/images/match-page/<slug>/
- cover.webp
- 01.webp, 02.webp, etc. sans limite fixe
- miniature dans assets/images/thumbs/matchday/
- page match-page/<slug>.html
- bloc Client uniquement s'il est renseigné
- carte en première position dans Réalisations
- data-competition pour tes futurs filtres
- ajout au sitemap.xml s'il existe
- sauvegarde de index.html / sitemap.xml / match-page.css avant modification
- refus d'écraser un match existant

IMPORTANT

Le script ne modifie PAS :
- home-v2.css
- home-v2.js
- match-page-shared.js
- ton design existant

Tu gardes donc tes modifications actuelles.
