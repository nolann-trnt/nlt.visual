from __future__ import annotations

import html
import re
import shutil
import unicodedata
from datetime import datetime
from pathlib import Path
from tkinter import Tk, StringVar, filedialog, messagebox
from tkinter import ttk

from PIL import Image, ImageOps


SUPPORTED = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'}
DEFAULT_SITE = Path(__file__).resolve().parents[2]

PROJECT_TYPES = {
    'Match': {
        'labels': ('Équipe 1', 'Équipe 2', 'Compétition'),
        'kicker': 'REPORTAGE',
        'category': 'match',
        'cta': 'Voir le match ↗',
        'section': 'Le match<br>en images.',
    },
    'Shooting maillot': {
        'labels': ('Club', 'Nom du projet / maillot', 'Type de maillot'),
        'kicker': 'SHOOTING',
        'category': 'shooting',
        'cta': 'Voir le projet ↗',
        'section': 'Le projet<br>en images.',
    },
    'Shooting joueur': {
        'labels': ('Joueur', 'Nom du projet', 'Contexte'),
        'kicker': 'SHOOTING',
        'category': 'shooting',
        'cta': 'Voir le projet ↗',
        'section': 'Le projet<br>en images.',
    },
    'Media day': {
        'labels': ('Club / structure', 'Nom du projet', 'Contexte'),
        'kicker': 'MEDIA DAY',
        'category': 'shooting',
        'cta': 'Voir le projet ↗',
        'section': 'Le projet<br>en images.',
    },
    'Autre': {
        'labels': ('Sujet / structure', 'Nom du projet', 'Type de projet'),
        'kicker': 'PROJET',
        'category': 'projet',
        'cta': 'Voir le projet ↗',
        'section': 'Le projet<br>en images.',
    },
}


def slugify(value: str) -> str:
    value = unicodedata.normalize('NFKD', value)
    value = ''.join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower().strip()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    return value.strip('-')


def esc(value: str) -> str:
    return html.escape(value.strip(), quote=True)


def natural_key(path: Path):
    return [int(x) if x.isdigit() else x.lower() for x in re.split(r'(\d+)', path.name)]


def convert_webp(src: Path, dst: Path, max_side: int, quality: int = 84):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        im.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, 'WEBP', quality=quality, method=6)


def backup_files(site: Path, files: list[Path]) -> Path:
    stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup = site / '_backups' / f'avant-ajout-projet-{stamp}'
    backup.mkdir(parents=True, exist_ok=True)
    for f in files:
        if f.exists():
            shutil.copy2(f, backup / f.name)
    return backup


def extract_base_url(index_text: str) -> str:
    m = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', index_text, re.I)
    return m.group(1).rstrip('/') if m else 'https://nltvisual.fr'


def rebuild_sitemap(site: Path, base_url: str):
    sitemap = site / 'sitemap.xml'
    page_dir = site / 'match-page'
    urls = [f'{base_url}/']
    for page in sorted(page_dir.glob('*.html')):
        urls.append(f'{base_url}/match-page/{page.name}')

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in urls:
        lines.extend(['  <url>', f'    <loc>{html.escape(url)}</loc>', '  </url>'])
    lines.append('</urlset>')
    sitemap.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def add_home_card(index_path: Path, card_html: str):
    text = index_path.read_text(encoding='utf-8')
    marker = '<div class="project-rail" data-project-rail>'
    pos = text.find(marker)
    if pos == -1:
        raise RuntimeError('Impossible de trouver la section Réalisations dans index.html.')
    insert_at = pos + len(marker)
    text = text[:insert_at] + '\n\n' + card_html + '\n' + text[insert_at:]
    index_path.write_text(text, encoding='utf-8')


def build_info_blocks(project_type: str, third_label: str, data: dict) -> tuple[str, int]:
    blocks = []
    if data['field3']:
        blocks.append((third_label, data['field3']))
    elif project_type != 'Match':
        blocks.append(('Type', project_type))
    if data['client']:
        blocks.append(('Client', data['client']))
    if data['date']:
        blocks.append(('Date', data['date']))
    if data['lieu']:
        blocks.append(('Lieu', data['lieu']))
    if not blocks:
        blocks.append(('Type', project_type))

    html_blocks = [f'      <div><span>{esc(label)}</span><strong>{esc(value)}</strong></div>' for label, value in blocks]
    return '\n'.join(html_blocks), len(blocks)


def build_project_page(template_path: Path, data: dict, gallery_count: int) -> str:
    template = template_path.read_text(encoding='utf-8')
    cfg = PROJECT_TYPES[data['project_type']]
    third_label = cfg['labels'][2]

    gallery_html = []
    for i in range(1, gallery_count + 1):
        n = f'{i:02d}'
        loading = 'eager' if i == 1 else 'lazy'
        gallery_html.append(
            '        <button class="match-photo" type="button">'
            f'<img src="../assets/images/match-page/{data["slug"]}/{n}.webp" '
            f'alt="{esc(data["title"])} - photo {i}" loading="{loading}" decoding="async"></button>'
        )

    info_blocks, info_count = build_info_blocks(data['project_type'], third_label, data)
    kicker_suffix = data['field3'] if data['field3'] else data['project_type']
    meta_description = f'{data["project_type"]} photo {data["title"]} par NLT.Visual.'

    replacements = {
        '{{TITLE}}': esc(data['title']),
        '{{META_DESCRIPTION}}': esc(meta_description),
        '{{CANONICAL_URL}}': f'{data["base_url"]}/match-page/{data["slug"]}.html',
        '{{OG_IMAGE_URL}}': f'{data["base_url"]}/assets/images/match-page/{data["slug"]}/cover.webp',
        '{{SLUG}}': data['slug'],
        '{{KICKER}}': esc(cfg['kicker']),
        '{{KICKER_SUFFIX}}': esc(kicker_suffix),
        '{{TITLE_LINE1}}': esc(data['field1']),
        '{{TITLE_LINE2}}': esc(data['field2']),
        '{{INFO_BLOCKS}}': info_blocks,
        '{{INFO_COUNT}}': str(info_count),
        '{{PHOTO_COUNT}}': str(gallery_count),
        '{{PHOTO_COUNT_2}}': f'{gallery_count:02d}',
        '{{GALLERY}}': '\n'.join(gallery_html),
        '{{SECTION_TITLE}}': cfg['section'],
    }
    for key, value in replacements.items():
        template = template.replace(key, value)
    return template


class App:
    def __init__(self):
        self.root = Tk()
        self.root.title('NLT.Visual - Ajouter une réalisation')
        self.root.geometry('760x820')
        self.root.minsize(700, 720)

        self.site = StringVar(value=str(DEFAULT_SITE))
        self.project_type = StringVar(value='Match')
        self.field1 = StringVar()
        self.field2 = StringVar()
        self.field3 = StringVar()
        self.date = StringVar()
        self.lieu = StringVar()
        self.client = StringVar()
        self.gallery_dir = StringVar()
        self.cover = StringVar()
        self.thumb = StringVar()

        self.build()
        self.update_fields()

    def row(self, parent, label, var, browse=None):
        frame = ttk.Frame(parent)
        frame.pack(fill='x', pady=6)
        label_widget = ttk.Label(frame, text=label, width=22)
        label_widget.pack(side='left')
        ttk.Entry(frame, textvariable=var).pack(side='left', fill='x', expand=True)
        if browse:
            ttk.Button(frame, text='Choisir', command=browse).pack(side='left', padx=(8, 0))
        return label_widget

    def build(self):
        outer = ttk.Frame(self.root, padding=18)
        outer.pack(fill='both', expand=True)

        ttk.Label(outer, text='Ajouter une réalisation', font=('Arial', 18, 'bold')).pack(anchor='w', pady=(0, 12))
        ttk.Label(
            outer,
            text='Match, shooting maillot, shooting joueur, media day ou autre projet. Le programme crée la page, les WebP, la miniature home, la carte Réalisations et reconstruit le sitemap.',
            wraplength=700,
        ).pack(anchor='w', pady=(0, 12))

        self.row(outer, 'Dossier du site', self.site, self.pick_site)
        ttk.Separator(outer).pack(fill='x', pady=12)

        type_frame = ttk.Frame(outer)
        type_frame.pack(fill='x', pady=6)
        ttk.Label(type_frame, text='Type de réalisation', width=22).pack(side='left')
        combo = ttk.Combobox(type_frame, textvariable=self.project_type, values=list(PROJECT_TYPES.keys()), state='readonly')
        combo.pack(side='left', fill='x', expand=True)
        combo.bind('<<ComboboxSelected>>', lambda _e: self.update_fields())

        self.label1 = self.row(outer, '', self.field1)
        self.label2 = self.row(outer, '', self.field2)
        self.label3 = self.row(outer, '', self.field3)
        self.row(outer, 'Date (optionnel)', self.date)
        self.row(outer, 'Lieu (optionnel)', self.lieu)
        self.row(outer, 'Client (optionnel)', self.client)

        ttk.Separator(outer).pack(fill='x', pady=12)
        self.row(outer, 'Dossier galerie', self.gallery_dir, self.pick_gallery)
        self.row(outer, 'Cover', self.cover, self.pick_cover)
        self.row(outer, 'Miniature home', self.thumb, self.pick_thumb)

        ttk.Label(outer, text="Galerie : mets uniquement les photos que tu veux afficher. Le nombre de photos est libre.", wraplength=700).pack(anchor='w', pady=12)
        ttk.Button(outer, text='CRÉER LA RÉALISATION', command=self.create).pack(fill='x', ipady=10, pady=(10, 0))

    def update_fields(self):
        labels = PROJECT_TYPES[self.project_type.get()]['labels']
        self.label1.configure(text=labels[0])
        self.label2.configure(text=labels[1])
        self.label3.configure(text=f'{labels[2]} (optionnel)')

    def pick_site(self):
        p = filedialog.askdirectory(title='Choisir la racine du site NLT.Visual')
        if p:
            self.site.set(p)

    def pick_gallery(self):
        p = filedialog.askdirectory(title='Choisir le dossier contenant les photos de galerie')
        if p:
            self.gallery_dir.set(p)

    def pick_cover(self):
        p = filedialog.askopenfilename(title='Choisir la cover', filetypes=[('Images', '*.jpg *.jpeg *.png *.webp *.tif *.tiff')])
        if p:
            self.cover.set(p)

    def pick_thumb(self):
        p = filedialog.askopenfilename(title='Choisir la miniature home', filetypes=[('Images', '*.jpg *.jpeg *.png *.webp *.tif *.tiff')])
        if p:
            self.thumb.set(p)

    def create(self):
        try:
            site = Path(self.site.get()).resolve()
            index = site / 'index.html'
            page_dir = site / 'match-page'
            shared_js = site / 'assets' / 'js' / 'match-page-shared.js'
            match_css = site / 'assets' / 'css' / 'match-page.css'
            thumbs_dir = site / 'assets' / 'images' / 'thumbs' / 'matchday'
            images_root = site / 'assets' / 'images' / 'match-page'
            sitemap = site / 'sitemap.xml'

            for required in [index, page_dir, shared_js, match_css, thumbs_dir, images_root]:
                if not required.exists():
                    raise RuntimeError(f'Élément introuvable : {required}')

            project_type = self.project_type.get()
            field1 = self.field1.get().strip()
            field2 = self.field2.get().strip()
            field3 = self.field3.get().strip()

            if not field1 or not field2:
                labels = PROJECT_TYPES[project_type]['labels']
                raise RuntimeError(f'{labels[0]} et {labels[1]} sont obligatoires.')

            gallery_dir = Path(self.gallery_dir.get())
            cover = Path(self.cover.get())
            thumb = Path(self.thumb.get())
            if not gallery_dir.is_dir():
                raise RuntimeError('Choisis un dossier galerie valide.')
            if not cover.is_file():
                raise RuntimeError('Choisis une cover valide.')
            if not thumb.is_file():
                raise RuntimeError('Choisis une miniature home valide.')

            gallery = sorted([p for p in gallery_dir.iterdir() if p.is_file() and p.suffix.lower() in SUPPORTED], key=natural_key)
            gallery = [p for p in gallery if p.resolve() not in {cover.resolve(), thumb.resolve()}]
            if not gallery:
                raise RuntimeError('Aucune photo de galerie trouvée.')

            slug = slugify(f'{field1}-{field2}')
            if not slug:
                raise RuntimeError('Impossible de générer un nom de page valide.')

            page = page_dir / f'{slug}.html'
            photo_folder = images_root / slug
            thumb_target = thumbs_dir / f'{slug}.webp'
            if page.exists() or photo_folder.exists():
                raise RuntimeError(f"La réalisation '{slug}' existe déjà. Rien n'a été écrasé.")

            backup = backup_files(site, [index, sitemap, match_css])
            photo_folder.mkdir(parents=True)
            convert_webp(cover, photo_folder / 'cover.webp', 2400, 86)
            convert_webp(thumb, thumb_target, 1400, 84)
            for i, src in enumerate(gallery, start=1):
                convert_webp(src, photo_folder / f'{i:02d}.webp', 2000, 84)

            data = {
                'project_type': project_type,
                'field1': field1,
                'field2': field2,
                'field3': field3,
                'date': self.date.get().strip(),
                'lieu': self.lieu.get().strip(),
                'client': self.client.get().strip(),
                'slug': slug,
                'title': f'{field1} - {field2}',
                'base_url': extract_base_url(index.read_text(encoding='utf-8')),
            }

            template = Path(__file__).parent / 'templates' / 'match-template.html'
            page.write_text(build_project_page(template, data, len(gallery)), encoding='utf-8')

            cfg = PROJECT_TYPES[project_type]
            top_label = f"Client · {esc(data['client'])}" if data['client'] else esc(project_type)
            context_label = esc(field3) if field3 else esc(project_type)
            client_attr = f' data-client="{slugify(data["client"])}"' if data['client'] else ''

            card = (
                f'      <a class="project-card" href="match-page/{slug}.html" data-category="{cfg["category"]}"{client_attr}>\n'
                f'        <img src="assets/images/thumbs/matchday/{slug}.webp" alt="{esc(data["title"])}" loading="lazy">\n'
                f'        <div>\n'
                f'          <p>{top_label}</p>\n'
                f'          <h3>{esc(field1)}<br>- {esc(field2)}</h3>\n'
                f'          <span>{context_label} · {cfg["cta"]}</span>\n'
                f'        </div>\n'
                f'      </a>'
            )

            add_home_card(index, card)
            base_url = extract_base_url(index.read_text(encoding='utf-8'))
            rebuild_sitemap(site, base_url)

            messagebox.showinfo(
                'NLT.Visual',
                f'Réalisation créée.\n\nType : {project_type}\nPage : match-page/{slug}.html\nGalerie : {len(gallery)} photos\nSauvegarde : {backup.relative_to(site)}',
            )
        except Exception as exc:
            messagebox.showerror('Erreur', str(exc))

    def run(self):
        self.root.mainloop()


if __name__ == '__main__':
    App().run()
