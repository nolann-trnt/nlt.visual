(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('[data-year]').textContent = new Date().getFullYear();

  const header = $('[data-header]');
  addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 30), {passive:true});

  const menuBtn = $('.menu-button');
  const mobileNav = $('#mobile-nav');
  const setMenu = open => {
    menuBtn?.setAttribute('aria-expanded', String(open));
    mobileNav?.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };
  menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  const bindRail = (rail, prev, next, amount = .8) => {
    if (!rail) return;
    const move = dir => rail.scrollBy({left: rail.clientWidth * amount * dir, behavior: reduce ? 'auto' : 'smooth'});
    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
  };
  bindRail($('[data-project-rail]'), $('[data-rail-prev]'), $('[data-rail-next]'), .75);

  const data = window.NLT_GALLERY || {};
  const rail = $('[data-gallery-rail]');
  const tabs = $$('[data-gallery-filter]');
  const title = $('[data-gallery-title]');
  const count = $('[data-gallery-count]');
  const desc = $('[data-gallery-description]');
  const gPrev = $('[data-gallery-prev]');
  const gNext = $('[data-gallery-next]');
  let activeKey = 'matchday';
  let activeItems = [];
  let lbIndex = 0;

  const lightbox = $('[data-lightbox]');
  const lbImg = $('[data-lightbox-image]');
  const lbCaption = $('[data-lightbox-caption]');
  const lbPos = $('[data-lightbox-position]');
  const updateLb = i => {
    if (!activeItems.length) return;
    lbIndex = (i + activeItems.length) % activeItems.length;
    const [src, caption] = activeItems[lbIndex];
    lbImg.src = src; lbImg.alt = caption; lbCaption.textContent = caption;
    lbPos.textContent = `${String(lbIndex+1).padStart(2,'0')} / ${String(activeItems.length).padStart(2,'0')}`;
  };
  const openLb = i => { updateLb(i); lightbox?.showModal(); document.body.style.overflow='hidden'; };
  const closeLb = () => { lightbox?.close(); document.body.style.removeProperty('overflow'); lbImg.src=''; };

  function renderGallery(key) {
    const cat = data[key]; if (!cat || !rail) return;
    activeKey = key; activeItems = cat.items;
    tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.galleryFilter === key)));
    title.textContent = cat.label; count.textContent = `${String(cat.items.length).padStart(2,'0')} photos`; desc.textContent = cat.description;
    rail.replaceChildren(...cat.items.map((item, i) => {
      const button = document.createElement('button'); button.type='button'; button.className='gallery-slide';
      button.setAttribute('aria-label', `Agrandir ${item[1]}`);
      const img = document.createElement('img'); img.src=item[0]; img.alt=item[1]; img.loading=i<3?'eager':'lazy'; img.decoding='async';
      const span = document.createElement('span'); span.innerHTML = `<b>${String(i+1).padStart(2,'0')}</b>${item[1]}`;
      button.append(img, span); button.addEventListener('click', () => openLb(i)); return button;
    }));
    rail.scrollTo({left:0, behavior:'auto'});
  }
  tabs.forEach(t => t.addEventListener('click', () => renderGallery(t.dataset.galleryFilter)));
  bindRail(rail, gPrev, gNext, .78);
  renderGallery(activeKey);

  $('[data-lightbox-close]')?.addEventListener('click', closeLb);
  $('[data-lightbox-prev]')?.addEventListener('click', () => updateLb(lbIndex-1));
  $('[data-lightbox-next]')?.addEventListener('click', () => updateLb(lbIndex+1));
  lightbox?.addEventListener('cancel', e => { e.preventDefault(); closeLb(); });
  lightbox?.addEventListener('keydown', e => { if(e.key==='ArrowLeft') updateLb(lbIndex-1); if(e.key==='ArrowRight') updateLb(lbIndex+1); });
})();
