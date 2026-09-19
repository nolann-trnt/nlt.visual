(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('[data-year]').textContent = new Date().getFullYear();

  const header = $('[data-header]');
  addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 30), {passive:true});

  const brand = $('.brand');
  const menuBtn = $('.menu-button');
  const mobileNav = $('#mobile-nav');
  const pageRegions = $$('main, footer, .mobile-contact');
  const setMenu = (open, restoreFocus = false) => {
    menuBtn?.setAttribute('aria-expanded', String(open));
    menuBtn?.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    mobileNav?.setAttribute('aria-hidden', String(!open));
    if (mobileNav) mobileNav.inert = !open;
    pageRegions.forEach(region => { region.inert = open; });
    document.body.classList.toggle('menu-open', open);
    if (open) $('.mobile-nav a')?.focus();
    if (!open && restoreFocus) menuBtn?.focus();
  };
  menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  brand?.addEventListener('click', () => setMenu(false));
  matchMedia('(min-width: 901px)').addEventListener('change', event => {
    if (event.matches) setMenu(false);
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
      return;
    }
    if (e.key !== 'Tab' || menuBtn?.getAttribute('aria-expanded') !== 'true') return;
    const focusable = [brand, menuBtn, ...$$('a', mobileNav)].filter(Boolean);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  const bindRail = (rail, prev, next, amount = .8) => {
    if (!rail) return;
    const move = dir => rail.scrollBy({left: rail.clientWidth * amount * dir, behavior: reduce ? 'auto' : 'smooth'});
    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
  };
  bindRail($('[data-project-rail]'), $('[data-rail-prev]'), $('[data-rail-next]'), .75);

  const serviceItems = $$('.service-item');
  if (reduce || !('IntersectionObserver' in window)) {
    serviceItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const serviceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          serviceObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.28});
    serviceItems.forEach(item => serviceObserver.observe(item));
  }

  const contact = $('#contact');
  const mobileContact = $('.mobile-contact');
  if (contact && mobileContact && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      mobileContact.classList.toggle('is-hidden', entry.isIntersecting);
    }, {threshold:.08}).observe(contact);
  }
})();
