NLT.Visual - Générateur V2

À remplacer dans ton dossier actuel :

1. tools/nlt-match-generator/ajouter_match.py
2. tools/nlt-match-generator/templates/match-template.html

Le reste ne change pas :
- lancer.bat continue de lancer ajouter_match.py
- Pillow reste la seule dépendance
- tes anciennes pages ne sont pas modifiées

Nouveaux types disponibles :
- Match
- Shooting maillot
- Shooting joueur
- Media day
- Autre

Le générateur continue volontairement d'utiliser les dossiers match-page/ et assets/images/match-page/
pour rester compatible avec ton CSS, ton JS et tes anciennes réalisations.
