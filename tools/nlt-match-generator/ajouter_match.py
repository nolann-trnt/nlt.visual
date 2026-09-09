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


SUPPORTED = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}
DEFAULT_SITE = Path(__file__).resolve().parents[2]


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def esc(value: str) -> str:
    return html.escape(value.strip(), quote=True)


def natural_key(path: Path):
    return [int(x) if x.isdigit() else x.lower() for x in re.split(r"(\d+)", path.name)]


def convert_webp(src: Path, dst: Path, max_side: int, quality: int = 84):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "WEBP", quality=quality, method=6)


def backup_files(site: Path, files: list[Path]) -> Path:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = site / "_backups" / f"avant-ajout-match-{stamp}"
    backup.mkdir(parents=True, exist_ok=True)
    for f in files:
        if f.exists():
            shutil.copy2(f, backup / f.name)
    return backup


def extract_base_url(index_text: str) -> str:
    m = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', index_text, re.I)
    return m.group(1).rstrip("/") if m else "https://nltvisual.fr"


def update_sitemap(sitemap: Path, page_url: str):
    if not sitemap.exists():
        return
    text = sitemap.read_text(encoding="utf-8")
    if page_url in text:
        return
    block = "  <url>\n    <loc>" + page_url + "</loc>\n  </url>\n"
    if "</urlset>" in text:
        sitemap.write_text(text.replace("</urlset>", block + "</urlset>"), encoding="utf-8")


def add_home_card(index_path: Path, card_html: str):
    text = index_path.read_text(encoding="utf-8")
    marker = '<div class="project-rail" data-project-rail>'
    pos = text.find(marker)
    if pos == -1:
        raise RuntimeError("Impossible de trouver la section Réalisations dans index.html.")
    insert_at = pos + len(marker)
    text = text[:insert_at] + "\n\n" + card_html + "\n" + text[insert_at:]
    index_path.write_text(text, encoding="utf-8")


def build_match_page(template_path: Path, data: dict, gallery_count: int) -> str:
    template = template_path.read_text(encoding="utf-8")

    if data["client"]:
        client_block = (
            '      <div><span>Client</span><strong>'
            + esc(data["client"])
            + '</strong></div>\n'
        )
        info_count = 4
    else:
        client_block = ""
        info_count = 3

    gallery_html = []
    for i in range(1, gallery_count + 1):
        n = f"{i:02d}"
        gallery_html.append(
            '        <button class="match-photo" type="button"><img src="../assets/images/match-page/'
            + data["slug"]
            + "/"
            + n
            + '.webp" alt="'
            + esc(data["team1"])
            + " - "
            + esc(data["team2"])
            + " - photo "
            + str(i)
            + '" loading="lazy"></button>'
        )

    replacements = {
        "{{TITLE}}": f'{esc(data["team1"])} - {esc(data["team2"])}',
        "{{TEAM1}}": esc(data["team1"]),
        "{{TEAM2}}": esc(data["team2"]),
        "{{SLUG}}": data["slug"],
        "{{COMPETITION}}": esc(data["competition"]) if data["competition"] else "Match",
        "{{DATE}}": esc(data["date"]) if data["date"] else "-",
        "{{LIEU}}": esc(data["lieu"]) if data["lieu"] else "-",
        "{{CLIENT_BLOCK}}": client_block,
        "{{INFO_COUNT}}": str(info_count),
        "{{PHOTO_COUNT}}": str(gallery_count),
        "{{PHOTO_COUNT_2}}": f"{gallery_count:02d}",
        "{{GALLERY}}": "\n".join(gallery_html),
    }
    for key, value in replacements.items():
        template = template.replace(key, value)
    return template


class App:
    def __init__(self):
        self.root = Tk()
        self.root.title("NLT.Visual - Ajouter un match")
        self.root.geometry("720x720")
        self.root.minsize(680, 650)

        self.site = StringVar(value=str(DEFAULT_SITE))
        self.team1 = StringVar()
        self.team2 = StringVar()
        self.competition = StringVar()
        self.date = StringVar()
        self.lieu = StringVar()
        self.client = StringVar()
        self.gallery_dir = StringVar()
        self.cover = StringVar()
        self.thumb = StringVar()

        self.build()

    def row(self, parent, label, var, browse=None):
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=6)
        ttk.Label(frame, text=label, width=18).pack(side="left")
        ttk.Entry(frame, textvariable=var).pack(side="left", fill="x", expand=True)
        if browse:
            ttk.Button(frame, text="Choisir", command=browse).pack(side="left", padx=(8, 0))

    def build(self):
        outer = ttk.Frame(self.root, padding=18)
        outer.pack(fill="both", expand=True)

        ttk.Label(outer, text="Ajouter une réalisation", font=("Arial", 18, "bold")).pack(anchor="w", pady=(0, 12))
        ttk.Label(
            outer,
            text="Le script crée la page match, les WebP, la miniature home, la carte Réalisations et met à jour le sitemap.",
            wraplength=650,
        ).pack(anchor="w", pady=(0, 12))

        self.row(outer, "Dossier du site", self.site, self.pick_site)
        ttk.Separator(outer).pack(fill="x", pady=12)

        self.row(outer, "Équipe 1", self.team1)
        self.row(outer, "Équipe 2", self.team2)
        self.row(outer, "Compétition", self.competition)
        self.row(outer, "Date", self.date)
        self.row(outer, "Lieu", self.lieu)
        self.row(outer, "Client (optionnel)", self.client)

        ttk.Separator(outer).pack(fill="x", pady=12)

        self.row(outer, "Dossier galerie", self.gallery_dir, self.pick_gallery)
        self.row(outer, "Cover", self.cover, self.pick_cover)
        self.row(outer, "Miniature home", self.thumb, self.pick_thumb)

        ttk.Label(
            outer,
            text="Galerie : mets uniquement les photos que tu veux afficher. Il n'y a aucun nombre imposé.",
            wraplength=650,
        ).pack(anchor="w", pady=12)

        ttk.Button(outer, text="CRÉER LA RÉALISATION", command=self.create).pack(fill="x", ipady=10, pady=(10, 0))

    def pick_site(self):
        p = filedialog.askdirectory(title="Choisir la racine du site NLT.Visual")
        if p:
            self.site.set(p)

    def pick_gallery(self):
        p = filedialog.askdirectory(title="Choisir le dossier contenant les photos de galerie")
        if p:
            self.gallery_dir.set(p)

    def pick_cover(self):
        p = filedialog.askopenfilename(
            title="Choisir la cover",
            filetypes=[("Images", "*.jpg *.jpeg *.png *.webp *.tif *.tiff")]
        )
        if p:
            self.cover.set(p)

    def pick_thumb(self):
        p = filedialog.askopenfilename(
            title="Choisir la miniature home",
            filetypes=[("Images", "*.jpg *.jpeg *.png *.webp *.tif *.tiff")]
        )
        if p:
            self.thumb.set(p)

    def create(self):
        try:
            site = Path(self.site.get()).resolve()
            index = site / "index.html"
            match_dir = site / "match-page"
            shared_js = site / "assets" / "js" / "match-page-shared.js"
            match_css = site / "assets" / "css" / "match-page.css"
            thumbs_dir = site / "assets" / "images" / "thumbs" / "matchday"
            images_root = site / "assets" / "images" / "match-page"
            sitemap = site / "sitemap.xml"

            for required in [index, match_dir, shared_js, match_css, thumbs_dir, images_root]:
                if not required.exists():
                    raise RuntimeError(f"Élément introuvable : {required}")

            team1 = self.team1.get().strip()
            team2 = self.team2.get().strip()
            if not team1 or not team2:
                raise RuntimeError("Équipe 1 et Équipe 2 sont obligatoires.")

            gallery_dir = Path(self.gallery_dir.get())
            cover = Path(self.cover.get())
            thumb = Path(self.thumb.get())
            if not gallery_dir.is_dir():
                raise RuntimeError("Choisis un dossier galerie valide.")
            if not cover.is_file():
                raise RuntimeError("Choisis une cover valide.")
            if not thumb.is_file():
                raise RuntimeError("Choisis une miniature home valide.")

            gallery = sorted(
                [p for p in gallery_dir.iterdir() if p.is_file() and p.suffix.lower() in SUPPORTED],
                key=natural_key,
            )
            gallery = [p for p in gallery if p.resolve() not in {cover.resolve(), thumb.resolve()}]
            if not gallery:
                raise RuntimeError("Aucune photo de galerie trouvée.")

            slug = slugify(f"{team1}-{team2}")
            page = match_dir / f"{slug}.html"
            photo_folder = images_root / slug
            thumb_target = thumbs_dir / f"{slug}.webp"

            if page.exists() or photo_folder.exists():
                raise RuntimeError(f"Le match '{slug}' existe déjà. Rien n'a été écrasé.")

            backup = backup_files(site, [index, sitemap, match_css])

            photo_folder.mkdir(parents=True)
            convert_webp(cover, photo_folder / "cover.webp", 2400, 86)
            convert_webp(thumb, thumb_target, 1400, 84)

            for i, src in enumerate(gallery, start=1):
                convert_webp(src, photo_folder / f"{i:02d}.webp", 2000, 84)

            data = {
                "team1": team1,
                "team2": team2,
                "competition": self.competition.get().strip(),
                "date": self.date.get().strip(),
                "lieu": self.lieu.get().strip(),
                "client": self.client.get().strip(),
                "slug": slug,
            }

            template = Path(__file__).parent / "templates" / "match-template.html"
            page.write_text(build_match_page(template, data, len(gallery)), encoding="utf-8")

            competition_label = esc(data["competition"]) if data["competition"] else "Match"
            top_label = f"Client · {esc(data['client'])}" if data["client"] else "Photo sportive"
            comp_slug = slugify(data["competition"]) if data["competition"] else "match"
            client_attr = f' data-client="{slugify(data["client"])}"' if data["client"] else ""

            card = (
                f'      <a class="project-card" href="match-page/{slug}.html" '
                f'data-category="match" data-competition="{comp_slug}"{client_attr}>\n'
                f'        <img src="assets/images/thumbs/matchday/{slug}.webp" alt="{esc(team1)} - {esc(team2)}" loading="lazy">\n'
                f'        <div>\n'
                f'          <p>{top_label}</p>\n'
                f'          <h3>{esc(team1)}<br>- {esc(team2)}</h3>\n'
                f'          <span>{competition_label} · Voir le match ↗</span>\n'
                f'        </div>\n'
                f'      </a>'
            )
            add_home_card(index, card)

            base_url = extract_base_url(index.read_text(encoding="utf-8"))
            update_sitemap(sitemap, f"{base_url}/match-page/{slug}.html")

            messagebox.showinfo(
                "NLT.Visual",
                f"Réalisation créée.\n\nPage : match-page/{slug}.html\n"
                f"Galerie : {len(gallery)} photos\n"
                f"Sauvegarde : {backup.relative_to(site)}"
            )
        except Exception as exc:
            messagebox.showerror("Erreur", str(exc))

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    App().run()
