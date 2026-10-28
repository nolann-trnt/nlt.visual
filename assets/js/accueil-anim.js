(() => {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.add('js');

  /* Le nom : chaque lettre monte de derrière un masque, l'une après l'autre */
  const h1 = document.querySelector('.hero-d h1');
  if (h1) {
    const text = h1.textContent.trim();
    h1.setAttribute('aria-label', text);
    h1.textContent = '';
    [...text].forEach((char, i) => {
      const mask = document.createElement('span');
      mask.className = 'ch';
      mask.setAttribute('aria-hidden', 'true');
      const letter = document.createElement('span');
      letter.className = 'in';
      letter.style.setProperty('--i', i);
      letter.textContent = char;
      mask.appendChild(letter);
      h1.appendChild(mask);
      if (i === 3) {
        const br = document.createElement('br');
        br.className = 'mbr';
        h1.appendChild(br);
      }
    });
  }
  setTimeout(() => root.classList.add('hero-play'), 80);

  /* La photo du haut glisse doucement quand on descend */
  const bg = document.querySelector('.hero-d .hero-bg');
  if (bg) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking || scrollY > innerHeight * 1.2) return;
      ticking = true;
      requestAnimationFrame(() => {
        bg.style.setProperty('--py', `${Math.round(scrollY * 0.22)}px`);
        ticking = false;
      });
    }, {passive:true});
  }

  /* Apparitions au défilement */
  const groups = [
    ['.intro h2, .section-title-row h2, .services-intro h2, .about h2, .contact h2, .faq-head h2', 'rv-up'],
    ['.intro > p, .services-intro .section-note, .about-copy > p, .contact-copy > p, .contact-form', 'rv-up'],
    ['.showcase-viewport', 'rv-up'],
    ['.project-card', 'rv-card'],
    ['.about-media', 'rv-wipe'],
    ['.faq-item', 'rv-up']
  ];
  const items = [];
  groups.forEach(([selector, cls]) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add(cls);
      el.style.setProperty('--d', `${(index % 4) * 90}ms`);
      items.push(el);
    });
  });
  /* Contrôle direct : si un bloc est à l'écran, il apparaît, même si l'observateur du navigateur n'a pas réagi */
  const reveal = () => {
    items.forEach(el => {
      if (el.classList.contains('seen')) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.94 && r.bottom > 0) el.classList.add('seen');
    });
  };
  let timer = 0;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(reveal, 60); };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('load', reveal);
  setTimeout(reveal, 400);
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('seen'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('seen');
      observer.unobserve(entry.target);
    });
  }, {threshold: .14, rootMargin: '0px 0px -6% 0px'});
  items.forEach(el => observer.observe(el));
})();
