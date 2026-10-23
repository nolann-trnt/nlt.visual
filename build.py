#!/usr/bin/env python3
"""Fabrique le site dans le dossier _site/ à partir de content/ et templates/.

Usage : python build.py
Netlify lance cette commande à chaque mise à jour du dépôt, puis publie _site/.
"""
import json
import shutil
import sys
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup, escape
from PIL import Image

ROOT = Path(__file__).resolve().parent
OUT = ROOT / '_site'
CONTENT = ROOT / 'content'

# Fichiers et dossiers copiés tels quels dans le site publié.
STATIC = ['assets', 'match-page', '404.html', 'merci.html', 'robots.txt', 'sitemap.xml', 'site.webmanifest']


def fail(message):
    print(f'ERREUR : {message}', file=sys.stderr)
    sys.exit(1)


def load(name):
    path = CONTENT / name
    if not path.is_file():
        fail(f'fichier introuvable : content/{name}')
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as exc:
        fail(f'content/{name} n\'est pas un JSON valide ({exc})')


def nl2br(value):
    lines = str(value).replace('\r\n', '\n').replace('\r', '\n').split('\n')
    return Markup('<br>'.join(escape(line) for line in lines))


def clean_path(value):
    """Chemin d'image tel qu'enregistré par le CMS (avec ou sans / au début)."""
    return str(value).strip().lstrip('/')


def image_size(rel_path):
    path = ROOT / rel_path
    if not path.is_file():
        fail(f'image introuvable : {rel_path}')
    with Image.open(path) as im:
        return im.size


def main():
    site = load('site.json')
    accueil = load('accueil.json')
    prestations = load('prestations.json')
    faq = load('faq.json')['items']
    carrousel = load('carrousel.json')['items']
    realisations = load('realisations.json')['items']

    if not faq:
        fail('la FAQ est vide (content/faq.json)')

    photos = []
    for item in carrousel:
        src = clean_path(item['image'])
        width, height = image_size(src)
        photos.append({'src': src, 'width': width, 'height': height, 'alt': item['alt']})

    cards = []
    for card in realisations:
        if not (ROOT / 'match-page' / f'{card["slug"]}.html').is_file():
            fail(f'la page match-page/{card["slug"]}.html n\'existe pas (content/realisations.json)')
        cards.append({**card, 'thumb': clean_path(card['thumb'])})

    for key in ('image', 'image_small'):
        accueil['about'][key] = clean_path(accueil['about'][key])
    accueil['about']['width'], accueil['about']['height'] = image_size(accueil['about']['image'])
    site['share_image'] = clean_path(site['share_image'])

    business_schema = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        'name': 'NLT.Visual',
        'description': site['schema_description'],
        'url': f'{site["url"]}/',
        'areaServed': site['area_served'],
        'sameAs': [site['instagram_url']],
    }
    faq_schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {'@type': 'Question', 'name': entry['question'],
             'acceptedAnswer': {'@type': 'Answer', 'text': entry['answer']}}
            for entry in faq
        ],
    }

    env = Environment(
        loader=FileSystemLoader(ROOT / 'templates'),
        autoescape=select_autoescape(['html', 'j2'], default_for_string=True, default=True),
        trim_blocks=False,
        lstrip_blocks=False,
    )
    env.policies['json.dumps_kwargs'] = {'ensure_ascii': False, 'sort_keys': False}
    env.filters['nl2br'] = nl2br

    context = {
        'site': site,
        'accueil': accueil,
        'prestations': prestations,
        'faq': faq,
        'carrousel': photos,
        'realisations': cards,
        'business_schema': business_schema,
        'faq_schema': faq_schema,
    }

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()

    for name in STATIC:
        source = ROOT / name
        if not source.exists():
            fail(f'fichier ou dossier manquant : {name}')
        target = OUT / name
        if source.is_dir():
            shutil.copytree(source, target)
        else:
            shutil.copy2(source, target)

    (OUT / 'index.html').write_text(env.get_template('index.html.j2').render(**context), encoding='utf-8')

    llms_env = Environment(loader=FileSystemLoader(ROOT / 'templates'), autoescape=False, keep_trailing_newline=True)
    (OUT / 'llms.txt').write_text(llms_env.get_template('llms.txt.j2').render(**context), encoding='utf-8')

    print(f'Site construit dans {OUT.name}/ : {len(photos)} photos au carrousel, '
          f'{len(cards)} réalisations, {len(faq)} questions FAQ.')


if __name__ == '__main__':
    main()
