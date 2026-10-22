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

  const showcase = $('[data-showcase]');
  const showcaseTrack = $('[data-showcase-track]');
  if (showcase && showcaseTrack) {
    const originals = [...showcaseTrack.children];
    originals.forEach(li => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.firstElementChild.alt = '';
      showcaseTrack.appendChild(clone);
    });

    const baseSpeed = reduce ? 0 : -45;
    let x = 0, velocity = baseSpeed, loopWidth = 0;
    let dragging = false, visible = true, lastTime = 0;
    let lastX = 0, lastMove = 0, dragVelocity = 0;

    const measure = () => {
      loopWidth = showcaseTrack.scrollWidth / 2;
    };
    const wrap = () => {
      if (!loopWidth) return;
      x = ((x % loopWidth) - loopWidth) % loopWidth;
    };
    const render = () => {
      showcaseTrack.style.transform = `translate3d(${x}px,0,0)`;
    };

    const tick = now => {
      const dt = Math.min((now - lastTime) / 1000, .05);
      lastTime = now;
      if (visible && !dragging) {
        x += velocity * dt;
        velocity += (baseSpeed - velocity) * Math.min(dt * 2.2, 1);
        wrap();
        render();
      }
      requestAnimationFrame(tick);
    };

    showcase.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
      lastMove = performance.now();
      dragVelocity = 0;
      showcase.classList.add('is-dragging');
      showcase.setPointerCapture(e.pointerId);
    });
    showcase.addEventListener('pointermove', e => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max((now - lastMove) / 1000, .001);
      dragVelocity = dragVelocity * .6 + (dx / dt) * .4;
      lastX = e.clientX;
      lastMove = now;
      x += dx;
      wrap();
      render();
    });
    const endDrag = e => {
      if (!dragging) return;
      dragging = false;
      showcase.classList.remove('is-dragging');
      if (showcase.hasPointerCapture(e.pointerId)) showcase.releasePointerCapture(e.pointerId);
      const idle = performance.now() - lastMove > 90;
      velocity = idle ? baseSpeed : Math.max(-3500, Math.min(3500, dragVelocity));
    };
    showcase.addEventListener('pointerup', endDrag);
    showcase.addEventListener('pointercancel', endDrag);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(showcase);
    }
    addEventListener('resize', measure, {passive:true});
    addEventListener('load', measure);
    measure();
    requestAnimationFrame(now => { lastTime = now; tick(now); });
  }

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

  const mobileContact = $('.mobile-contact');
  if (mobileContact && 'IntersectionObserver' in window) {
    const watched = [[$('.hero'), .3], [$('#contact'), .08], [$('#faq'), .08]];
    const seen = new Set();
    watched.forEach(([el, threshold]) => {
      if (!el) return;
      new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio >= threshold) seen.add(el); else seen.delete(el);
        mobileContact.classList.toggle('is-hidden', seen.size > 0);
      }, {threshold:[0, threshold]}).observe(el);
    });
  } else if (mobileContact) {
    mobileContact.classList.remove('is-hidden');
  }
})();
