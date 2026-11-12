// À exécuter avec javascript_tool sur la page d'un post Instagram (https://www.instagram.com/nlt.visual/p/XXXX/),
// après avoir attendu environ 15 s que les images chargent. Parcourt le carrousel et renvoie une empreinte par image :
// "<nombre> | <empreinte>:<largeur>x<hauteur> ..." (la liste est à passer telle quelle à match_photos.py).
(async () => {
  const dh = (im) => {
    const c = document.createElement('canvas'); c.width = 72; c.height = 64;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, 72, 64);
    const d = x.getImageData(0, 0, 72, 64).data; const g = [];
    for (let r = 0; r < 8; r++) {
      g.push([]);
      for (let k = 0; k < 9; k++) {
        let s = 0;
        for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 8; xx++) {
          const p = ((r * 8 + yy) * 72 + (k * 8 + xx)) * 4;
          s += d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114;
        }
        g[r].push(s / 64);
      }
    }
    let bits = '';
    for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++) bits += g[r][k] > g[r][k + 1] ? '1' : '0';
    let hex = '';
    for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
    return hex;
  };
  const out = [], seen = new Set();
  let stuck = 0;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 700));
    const vis = [...document.querySelectorAll('main img')].filter(im => {
      const r = im.getBoundingClientRect();
      return r.width > 330 && r.height > 400 && r.top < innerHeight && r.bottom > 0 && im.naturalWidth > 0 && im.complete;
    });
    let added = 0;
    vis.forEach(im => {
      try {
        const h = dh(im);
        if (h !== '0000000000000000' && !seen.has(h)) { seen.add(h); out.push(h + ':' + im.naturalWidth + 'x' + im.naturalHeight); added++; }
      } catch (e) {}
    });
    stuck = added ? 0 : stuck + 1;
    const nb = document.querySelector('button[aria-label="Suivant"]');
    if (!nb || stuck >= 4) break;
    nb.click();
    await new Promise(r => setTimeout(r, 500));
  }
  return out.length + ' | ' + out.join(' ');
})()
