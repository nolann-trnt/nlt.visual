/*
  NLT.Visual — galerie éditable
  ---------------------------------
  Pour remplacer une image :
  1. dépose le nouveau fichier WebP dans le dossier indiqué ;
  2. garde le même nom de fichier, ou modifie `src` et `thumb` ci-dessous ;
  3. remplace aussi le texte `alt`, le `caption` et le `meta`.

  `layout` accepte : wide, tall, medium, square, landscape, full.
*/
window.NLT_GALLERY = {
  matchday: {
    label: "Matchday",
    description: "Le match dans son ensemble : contexte, duels, détails et sortie de terrain.",
    items: [
      {
        src: "assets/images/matchday/matchday-01.webp",
        thumb: "assets/images/thumbs/matchday/matchday-01.webp",
        alt: "Visuel de démonstration pour une couverture de match de football",
        caption: "Entrée dans le match",
        meta: "Matchday / 01",
        layout: "wide"
      },
      {
        src: "assets/images/matchday/matchday-02.webp",
        thumb: "assets/images/thumbs/matchday/matchday-02.webp",
        alt: "Visuel de démonstration vertical pour une action de football",
        caption: "Dans le duel",
        meta: "Matchday / 02",
        layout: "tall"
      },
      {
        src: "assets/images/matchday/matchday-03.webp",
        thumb: "assets/images/thumbs/matchday/matchday-03.webp",
        alt: "Visuel de démonstration montrant l'atmosphère d'un stade",
        caption: "Le stade autour",
        meta: "Matchday / 03",
        layout: "medium"
      },
      {
        src: "assets/images/matchday/matchday-04.webp",
        thumb: "assets/images/thumbs/matchday/matchday-04.webp",
        alt: "Visuel de démonstration carré pour un temps fort de match",
        caption: "Impact",
        meta: "Matchday / 04",
        layout: "square"
      },
      {
        src: "assets/images/matchday/matchday-05.webp",
        thumb: "assets/images/thumbs/matchday/matchday-05.webp",
        alt: "Visuel de démonstration horizontal pour une série football",
        caption: "Le jeu s'ouvre",
        meta: "Matchday / 05",
        layout: "landscape"
      },
      {
        src: "assets/images/matchday/matchday-06.webp",
        thumb: "assets/images/thumbs/matchday/matchday-06.webp",
        alt: "Visuel de démonstration pleine largeur pour la fin d'un match",
        caption: "Après le coup de sifflet",
        meta: "Matchday / 06",
        layout: "full"
      }
    ]
  },
  portraits: {
    label: "Portraits joueurs",
    description: "Présence, tenue, regard et environnement : le joueur avant le profil générique.",
    items: [
      {
        src: "assets/images/portraits/portraits-01.webp",
        thumb: "assets/images/thumbs/portraits/portraits-01.webp",
        alt: "Visuel de démonstration pour un portrait de joueur de football",
        caption: "Face au cadre",
        meta: "Portrait / 01",
        layout: "tall"
      },
      {
        src: "assets/images/portraits/portraits-02.webp",
        thumb: "assets/images/thumbs/portraits/portraits-02.webp",
        alt: "Visuel de démonstration de portrait sportif au flash",
        caption: "Flash direct",
        meta: "Portrait / 02",
        layout: "wide"
      },
      {
        src: "assets/images/portraits/portraits-03.webp",
        thumb: "assets/images/thumbs/portraits/portraits-03.webp",
        alt: "Visuel de démonstration de portrait joueur en cadrage serré",
        caption: "Présence",
        meta: "Portrait / 03",
        layout: "medium"
      },
      {
        src: "assets/images/portraits/portraits-04.webp",
        thumb: "assets/images/thumbs/portraits/portraits-04.webp",
        alt: "Visuel de démonstration de portrait football vertical",
        caption: "Tenue de match",
        meta: "Portrait / 04",
        layout: "square"
      },
      {
        src: "assets/images/portraits/portraits-05.webp",
        thumb: "assets/images/thumbs/portraits/portraits-05.webp",
        alt: "Visuel de démonstration éditorial pour un shooting joueur",
        caption: "Hors terrain",
        meta: "Portrait / 05",
        layout: "landscape"
      }
    ]
  },
  goalkeepers: {
    label: "Goalkeepers",
    description: "Le poste traité pour lui-même : attente, lecture, appuis, envol et retour au sol.",
    items: [
      {
        src: "assets/images/goalkeepers/goalkeepers-01.webp",
        thumb: "assets/images/thumbs/goalkeepers/goalkeepers-01.webp",
        alt: "Visuel de démonstration pour un shooting de gardien de but",
        caption: "Position",
        meta: "Goalkeeper / 01",
        layout: "wide"
      },
      {
        src: "assets/images/goalkeepers/goalkeepers-02.webp",
        thumb: "assets/images/thumbs/goalkeepers/goalkeepers-02.webp",
        alt: "Visuel de démonstration vertical d'un gardien en action",
        caption: "Déclenchement",
        meta: "Goalkeeper / 02",
        layout: "tall"
      },
      {
        src: "assets/images/goalkeepers/goalkeepers-03.webp",
        thumb: "assets/images/thumbs/goalkeepers/goalkeepers-03.webp",
        alt: "Visuel de démonstration d'un plongeon de gardien",
        caption: "Extension",
        meta: "Goalkeeper / 03",
        layout: "medium"
      },
      {
        src: "assets/images/goalkeepers/goalkeepers-04.webp",
        thumb: "assets/images/thumbs/goalkeepers/goalkeepers-04.webp",
        alt: "Visuel de démonstration détaillant le poste de gardien",
        caption: "Dernier appui",
        meta: "Goalkeeper / 04",
        layout: "square"
      },
      {
        src: "assets/images/goalkeepers/goalkeepers-05.webp",
        thumb: "assets/images/thumbs/goalkeepers/goalkeepers-05.webp",
        alt: "Visuel de démonstration panoramique d'un gardien de football",
        caption: "Retour au sol",
        meta: "Goalkeeper / 05",
        layout: "landscape"
      }
    ]
  },
  clubs: {
    label: "Clubs",
    description: "Une identité collective : équipe, staff, lieu, supporters, partenaires et détails internes.",
    items: [
      {
        src: "assets/images/clubs/clubs-01.webp",
        thumb: "assets/images/thumbs/clubs/clubs-01.webp",
        alt: "Visuel de démonstration pour du contenu photo de club de football",
        caption: "Le groupe",
        meta: "Club / 01",
        layout: "full"
      },
      {
        src: "assets/images/clubs/clubs-02.webp",
        thumb: "assets/images/thumbs/clubs/clubs-02.webp",
        alt: "Visuel de démonstration vertical pour une communication de club",
        caption: "Avant d'entrer",
        meta: "Club / 02",
        layout: "tall"
      },
      {
        src: "assets/images/clubs/clubs-03.webp",
        thumb: "assets/images/thumbs/clubs/clubs-03.webp",
        alt: "Visuel de démonstration de cohésion d'équipe",
        caption: "Ensemble",
        meta: "Club / 03",
        layout: "wide"
      },
      {
        src: "assets/images/clubs/clubs-04.webp",
        thumb: "assets/images/thumbs/clubs/clubs-04.webp",
        alt: "Visuel de démonstration pour les réseaux sociaux d'un club",
        caption: "Signal club",
        meta: "Club / 04",
        layout: "medium"
      },
      {
        src: "assets/images/clubs/clubs-05.webp",
        thumb: "assets/images/thumbs/clubs/clubs-05.webp",
        alt: "Visuel de démonstration éditorial autour d'un club de football",
        caption: "Le lieu compte",
        meta: "Club / 05",
        layout: "square"
      }
    ]
  },
  training: {
    label: "Training",
    description: "Répétition, précision et intensité : le travail quotidien sans décor forcé.",
    items: [
      {
        src: "assets/images/training/training-01.webp",
        thumb: "assets/images/thumbs/training/training-01.webp",
        alt: "Visuel de démonstration d'une séance d'entraînement de football",
        caption: "Répéter",
        meta: "Training / 01",
        layout: "wide"
      },
      {
        src: "assets/images/training/training-02.webp",
        thumb: "assets/images/thumbs/training/training-02.webp",
        alt: "Visuel de démonstration vertical d'un entraînement joueur",
        caption: "Appuis",
        meta: "Training / 02",
        layout: "tall"
      },
      {
        src: "assets/images/training/training-03.webp",
        thumb: "assets/images/thumbs/training/training-03.webp",
        alt: "Visuel de démonstration d'une opposition à l'entraînement",
        caption: "Opposition",
        meta: "Training / 03",
        layout: "medium"
      },
      {
        src: "assets/images/training/training-04.webp",
        thumb: "assets/images/thumbs/training/training-04.webp",
        alt: "Visuel de démonstration d'un détail de séance football",
        caption: "Précision",
        meta: "Training / 04",
        layout: "square"
      },
      {
        src: "assets/images/training/training-05.webp",
        thumb: "assets/images/thumbs/training/training-05.webp",
        alt: "Visuel de démonstration panoramique d'une séance de football",
        caption: "Dernière série",
        meta: "Training / 05",
        layout: "landscape"
      }
    ]
  },
  lifestyle: {
    label: "Lifestyle / BTS",
    description: "Le temps autour du jeu : arrivée, tunnel, équipement, vestiaire et moments hors action.",
    items: [
      {
        src: "assets/images/lifestyle/lifestyle-01.webp",
        thumb: "assets/images/thumbs/lifestyle/lifestyle-01.webp",
        alt: "Visuel de démonstration dans un tunnel de stade",
        caption: "Le tunnel",
        meta: "BTS / 01",
        layout: "tall"
      },
      {
        src: "assets/images/lifestyle/lifestyle-02.webp",
        thumb: "assets/images/thumbs/lifestyle/lifestyle-02.webp",
        alt: "Visuel de démonstration lifestyle autour du football",
        caption: "Arrivée",
        meta: "BTS / 02",
        layout: "wide"
      },
      {
        src: "assets/images/lifestyle/lifestyle-03.webp",
        thumb: "assets/images/thumbs/lifestyle/lifestyle-03.webp",
        alt: "Visuel de démonstration des coulisses d'un match",
        caption: "Avant le bruit",
        meta: "BTS / 03",
        layout: "medium"
      },
      {
        src: "assets/images/lifestyle/lifestyle-04.webp",
        thumb: "assets/images/thumbs/lifestyle/lifestyle-04.webp",
        alt: "Visuel de démonstration de détail vestiaire football",
        caption: "Détails utiles",
        meta: "BTS / 04",
        layout: "square"
      },
      {
        src: "assets/images/lifestyle/lifestyle-05.webp",
        thumb: "assets/images/thumbs/lifestyle/lifestyle-05.webp",
        alt: "Visuel de démonstration d'un joueur après le match",
        caption: "Après",
        meta: "BTS / 05",
        layout: "landscape"
      }
    ]
  }
};
