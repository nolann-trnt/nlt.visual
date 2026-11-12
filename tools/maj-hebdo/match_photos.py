"""Retrouve, parmi les exports Lightroom d'un album, les photos publiées dans un carrousel Instagram.

Usage : python -I match_photos.py <dossier_jpg> <dossier_sortie> "<empreinte:LxH> <empreinte:LxH> ..."

Les photos retenues sont copiées dans <dossier_sortie> (01.jpg, 02.jpg...) dans l'ordre du carrousel.
Une image est acceptée si la meilleure distance est <= 14 et d'au moins 5 points meilleure que la suivante.
Si elle échoue, un second essai tient compte du recadrage 3:4 fait par Instagram.
"""
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

MAX_DIST, MIN_GAP = 14, 5


def dhash(im: Image.Image) -> int:
    g = np.asarray(im.convert('L').resize((72, 64), Image.BOX), dtype=float).reshape(8, 8, 9, 8).mean(axis=(1, 3))
    return int(''.join('1' if b else '0' for b in (g[:, :8] > g[:, 1:]).flatten()), 2)


def crops(im: Image.Image, ratio: float = 0.75):
    w, h = im.size
    if w / h > ratio:
        cw = round(h * ratio)
        for o in np.linspace(0, 1, 9):
            x = int((w - cw) * o)
            yield im.crop((x, 0, x + cw, h))
    else:
        ch = round(w / ratio)
        for o in np.linspace(0, 1, 9):
            y = int((h - ch) * o)
            yield im.crop((0, y, w, y + ch))


def best_two(scores):
    scores = sorted(scores, key=lambda s: s[0])
    return scores[0], scores[1]


def main(folder: str, out_dir: str, targets_arg: str) -> None:
    targets = [int(t.split(':')[0], 16) for t in targets_arg.split()]
    files = sorted(Path(folder).rglob('*.jpg'))
    full, cropped = {}, {}
    for f in files:
        with Image.open(f) as im:
            im = ImageOps.exif_transpose(im).convert('RGB')
            full[f] = dhash(im)
            cropped[f] = [dhash(c) for c in crops(im)]
    out = Path(out_dir)
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    kept, missing = [], []
    for i, t in enumerate(targets, 1):
        a, b = best_two([(bin(t ^ h).count('1'), f) for f, h in full.items()])
        pick = a[1] if a[0] <= MAX_DIST and b[0] - a[0] >= MIN_GAP else None
        if pick is None:
            a, b = best_two([(min(bin(t ^ h).count('1') for h in hs), f) for f, hs in cropped.items()])
            pick = a[1] if a[0] <= MAX_DIST and b[0] - a[0] >= MIN_GAP else None
        if pick is None or pick in kept:
            missing.append(i)
            continue
        kept.append(pick)
        shutil.copy2(pick, out / f'{len(kept):02d}.jpg')
        print(f'image {i} -> {pick.name} (distance {a[0]})')
    print(f'{len(kept)} photos retenues sur {len(targets)} ; non retrouvées : {missing or "aucune"}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
