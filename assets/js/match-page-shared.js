(() => {
  function renderSharedChrome() {
    const headerMount = document.querySelector('[data-match-header]');
    if (headerMount) {
      headerMount.outerHTML = `
        <header class="match-header">
          <a class="match-logo" href="../index.html" aria-label="Retour à l'accueil NLT.Visual">
            <img src="../assets/brand/nlt-visual-logo-light.png" alt="NLT.Visual">
          </a>
          <nav class="match-nav" aria-label="Navigation principale">
            <a href="../index.html#realisations">Réalisations</a>
            <a href="../index.html#prestations">Prestations</a>
            <a href="../index.html#apropos">À propos</a>
          </nav>
          <a class="match-contact" href="../index.html#contact">Me contacter ↗</a>
        </header>`;
    }

    const footerMount = document.querySelector('[data-match-footer]');
    if (footerMount) {
      footerMount.outerHTML = `
        <footer class="match-footer">
          <span>NLT.Visual</span>
          <span>Photographe sportif · Hauts-de-France</span>
          <a href="https://www.instagram.com/nlt.visual/" target="_blank" rel="noreferrer">@nlt.visual ↗</a>
        </footer>`;
    }
  }

  function renderLightbox() {
    if (document.querySelector('.photo-lightbox')) return;

    const title = document.querySelector('.match-hero h1')?.innerText
      .replace(/\s+/g, ' ')
      .trim() || 'NLT.Visual';

    document.body.insertAdjacentHTML('beforeend', `
      <dialog class="photo-lightbox" aria-label="Photo agrandie">
        <button class="lightbox-close" type="button" aria-label="Fermer">×</button>
        <button class="lightbox-prev" type="button" aria-label="Photo précédente">←</button>
        <figure>
          <img src="" alt="">
          <figcaption><span>${title}</span><span class="lightbox-counter"></span></figcaption>
        </figure>
        <button class="lightbox-next" type="button" aria-label="Photo suivante">→</button>
      </dialog>`);
  }

  function initGallery() {
    const carousel = document.querySelector('[data-match-carousel]');
    const previousButton = document.querySelector('.match-carousel-prev');
    const nextButton = document.querySelector('.match-carousel-next');
    const photos = [...document.querySelectorAll('.match-photo img')];
    const dialog = document.querySelector('.photo-lightbox');

    if (!carousel || !dialog || photos.length === 0) return;

    const dialogImg = dialog.querySelector('img');
    const counter = dialog.querySelector('.lightbox-counter');
    let current = 0;

    function getScrollAmount() {
      const card = carousel.querySelector('.match-photo');
      return card ? card.getBoundingClientRect().width * 2.15 : carousel.clientWidth * 0.75;
    }

    previousButton?.addEventListener('click', () => {
      carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextButton?.addEventListener('click', () => {
      carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    function showPhoto(index) {
      current = (index + photos.length) % photos.length;
      dialogImg.src = photos[current].src;
      dialogImg.alt = photos[current].alt;
      counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    }

    photos.forEach((img, index) => {
      img.closest('button')?.addEventListener('click', () => {
        showPhoto(index);
        dialog.showModal();
      });
    });

    dialog.querySelector('.lightbox-close')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      dialog.close();
    });

    dialog.querySelector('.lightbox-prev')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showPhoto(current - 1);
    });

    dialog.querySelector('.lightbox-next')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showPhoto(current + 1);
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    document.addEventListener('keydown', (event) => {
      if (!dialog.open) return;
      if (event.key === 'ArrowLeft') showPhoto(current - 1);
      if (event.key === 'ArrowRight') showPhoto(current + 1);
      if (event.key === 'Escape') dialog.close();
    });
  }

  function init() {
    renderSharedChrome();
    renderLightbox();
    initGallery();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
