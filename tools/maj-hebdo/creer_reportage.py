"""Crée un reportage de match sans passer par l'interface graphique du générateur.

Usage :
  python -I creer_reportage.py --dossier <photos> --club1 "OMF" --club2 "US Camon" \
      [--competition "Championnat R1"] [--client OMF] [--date "8 novembre 2026"] [--lieu Arras] \
      [--fond 2] [--miniature 1]

<photos> contient 01.jpg, 02.jpg... dans l'ordre du carrousel. Par défaut : fond = photo 2, miniature = photo 1.
À lancer depuis la racine du dépôt, sur une branche de travail (jamais main).
"""
import argparse
import importlib.util
from pathlib import Path

SITE = Path.cwd()
spec = importlib.util.spec_from_file_location('am', SITE / 'tools' / 'nlt-match-generator' / 'ajouter_match.py')
am = importlib.util.module_from_spec(spec)
spec.loader.exec_module(am)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument('--dossier', required=True)
    p.add_argument('--club1', required=True)
    p.add_argument('--club2', required=True)
    p.add_argument('--competition', default='')
    p.add_argument('--client', default='')
    p.add_argument('--date', default='')
    p.add_argument('--lieu', default='')
    p.add_argument('--fond', type=int, default=2)
    p.add_argument('--miniature', type=int, default=1)
    a = p.parse_args()

    gallery = sorted(Path(a.dossier).glob('*.jpg'), key=am.natural_key)
    if not gallery:
        raise SystemExit('Aucune photo dans le dossier.')
    fond = gallery[min(a.fond, len(gallery)) - 1]
    mini = gallery[min(a.miniature, len(gallery)) - 1]
    slug = am.slugify(f'{a.club1}-{a.club2}')
    page = SITE / 'match-page' / f'{slug}.html'
    folder = SITE / 'assets' / 'images' / 'match-page' / slug
    if page.exists() or folder.exists():
        raise SystemExit(f"'{slug}' existe déjà, rien n'a été écrasé.")

    folder.mkdir(parents=True)
    am.convert_webp(fond, folder / 'cover.webp', 2400, 86)
    am.convert_webp(mini, SITE / 'assets' / 'images' / 'thumbs' / 'matchday' / f'{slug}.webp', 1400, 84)
    for i, src in enumerate(gallery, 1):
        am.convert_webp(src, folder / f'{i:02d}.webp', 2000, 84)

    base = am.base_url_from_site(SITE / 'content' / 'site.json')
    data = dict(project_type='Match', field1=a.club1, field2=a.club2, field3=a.competition, date=a.date,
                lieu=a.lieu, client=a.client, slug=slug, title=f'{a.club1} - {a.club2}', base_url=base)
    template = SITE / 'tools' / 'nlt-match-generator' / 'templates' / 'match-template.html'
    page.write_text(am.build_project_page(template, data, len(gallery)), encoding='utf-8')

    cfg = am.PROJECT_TYPES['Match']
    card = dict(slug=slug, thumb=f'assets/images/thumbs/matchday/{slug}.webp', alt=data['title'],
                label=f'Client · {a.client}' if a.client else 'Photo sportive',
                title=f'{a.club1}\n- {a.club2}', meta=f'{a.competition or "Match"} · {cfg["cta"]}', category='match')
    if a.client:
        card['client'] = am.slugify(a.client)
    am.add_card(SITE / 'content' / 'realisations.json', card)
    am.rebuild_sitemap(SITE, base)
    print(f'ok {slug} : {len(gallery)} photos')


if __name__ == '__main__':
    main()
