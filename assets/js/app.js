(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* Footer year */
  qsa("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  /* Header state + reading progress */
  const header = qs("[data-header]");
  const progressBar = qs(".scroll-progress span");
  let ticking = false;

  const updateScrollUi = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;

    header?.classList.toggle("is-scrolled", scrollTop > 24);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollUi);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateScrollUi();

  /* Mobile menu */
  const menuToggle = qs(".menu-toggle");
  const mobileMenu = qs(".mobile-menu");

  const setMenuState = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    [qs("main"), qs(".site-footer"), qs(".mobile-contact")].forEach((element) => {
      if (element instanceof HTMLElement) element.inert = open;
    });

    if (open) {
      window.requestAnimationFrame(() => qs("a", mobileMenu)?.focus());
    }
  };

  menuToggle?.addEventListener("click", () => {
    setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  qsa(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      setMenuState(false);
      menuToggle.focus();
    }
  });

  /* Scroll reveal */
  const revealElements = qsa(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* Hero micro-parallax — disabled on touch and reduced motion */
  const parallaxElement = qs("[data-parallax]");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (parallaxElement && finePointer && !reducedMotion) {
    let parallaxTicking = false;
    const updateParallax = () => {
      const amount = Number(parallaxElement.dataset.parallax || 0.06);
      const y = Math.min(window.innerHeight, Math.max(0, window.scrollY)) * amount;
      parallaxElement.style.transform = `translate3d(0, ${y}px, 0)`;
      parallaxTicking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!parallaxTicking) {
          requestAnimationFrame(updateParallax);
          parallaxTicking = true;
        }
      },
      { passive: true }
    );
  }

  /* Upgrade large project cards from light thumbnail to full image close to viewport */
  const fullImageTargets = qsa("img[data-full-src]");
  if ("IntersectionObserver" in window) {
    const imageUpgradeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const image = entry.target;
          const fullSrc = image.dataset.fullSrc;
          if (fullSrc) {
            const preload = new Image();
            preload.src = fullSrc;
            preload.onload = () => {
              image.src = fullSrc;
              image.removeAttribute("data-full-src");
            };
          }
          observer.unobserve(image);
        });
      },
      { rootMargin: "400px 0px" }
    );
    fullImageTargets.forEach((image) => imageUpgradeObserver.observe(image));
  }

  /* Portfolio gallery */
  const galleryGrid = qs("[data-gallery-grid]");
  const galleryFilters = qsa("[data-gallery-filter]");
  const galleryTitle = qs("[data-gallery-title]");
  const galleryCount = qs("[data-gallery-count]");
  const galleryDescription = qs("[data-gallery-description]");
  const galleryData = window.NLT_GALLERY || {};
  const galleryPanelId = "portfolio-gallery-panel";
  if (galleryGrid) {
    galleryGrid.id = galleryPanelId;
    galleryGrid.setAttribute("role", "tabpanel");
  }
  let activeGalleryKey = "matchday";
  let activeItems = [];
  let activeLightboxIndex = 0;
  let galleryRenderTimer = null;

  const lightbox = qs("[data-lightbox]");
  const lightboxImage = qs("[data-lightbox-image]");
  const lightboxCaption = qs("[data-lightbox-caption]");
  const lightboxPosition = qs("[data-lightbox-position]");
  const lightboxClose = qs("[data-lightbox-close]");
  const lightboxPrevious = qs("[data-lightbox-prev]");
  const lightboxNext = qs("[data-lightbox-next]");
  let lastFocusedElement = null;
  let pointerStartX = 0;

  const updateLightbox = (index) => {
    if (!activeItems.length || !lightboxImage) return;
    activeLightboxIndex = (index + activeItems.length) % activeItems.length;
    const item = activeItems[activeLightboxIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxPosition) {
      lightboxPosition.textContent = `${String(activeLightboxIndex + 1).padStart(2, "0")} / ${String(activeItems.length).padStart(2, "0")}`;
    }

    const nextItem = activeItems[(activeLightboxIndex + 1) % activeItems.length];
    if (nextItem) {
      const preload = new Image();
      preload.src = nextItem.src;
    }
  };

  const openLightbox = (index, trigger) => {
    if (!lightbox || typeof lightbox.showModal !== "function") return;
    lastFocusedElement = trigger || document.activeElement;
    updateLightbox(index);
    lightbox.showModal();
    document.body.style.overflow = "hidden";
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox?.open) return;
    lightbox.close();
    document.body.style.removeProperty("overflow");
    if (lightboxImage) lightboxImage.src = "";
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  const buildGallery = (key) => {
    const category = galleryData[key];
    if (!galleryGrid || !category) return;

    activeGalleryKey = key;
    activeItems = category.items;
    galleryGrid.replaceChildren();

    const fragment = document.createDocumentFragment();
    category.items.forEach((item, index) => {
      const article = document.createElement("article");
      article.className = `gallery-item gallery-item--${item.layout}`;

      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Agrandir : ${item.caption}`);

      const figure = document.createElement("figure");
      const image = document.createElement("img");
      image.src = item.thumb || item.src;
      image.alt = item.alt;
      image.loading = index < 2 ? "eager" : "lazy";
      image.decoding = "async";
      image.width = 720;
      image.height = item.layout === "tall" ? 900 : 540;

      const caption = document.createElement("figcaption");
      const captionText = document.createElement("span");
      const captionMeta = document.createElement("span");
      captionText.textContent = item.caption;
      captionMeta.textContent = item.meta;
      caption.append(captionText, captionMeta);

      figure.append(image, caption);
      button.append(figure);
      article.append(button);
      button.addEventListener("click", () => openLightbox(index, button));
      fragment.append(article);
    });

    galleryGrid.append(fragment);
    galleryGrid.setAttribute("aria-busy", "false");
    const activeFilter = galleryFilters.find((filter) => filter.dataset.galleryFilter === key);
    if (activeFilter?.id) galleryGrid.setAttribute("aria-labelledby", activeFilter.id);
    if (galleryTitle) galleryTitle.textContent = category.label;
    if (galleryCount) {
      galleryCount.textContent = `${String(category.items.length).padStart(2, "0")} image${category.items.length > 1 ? "s" : ""}`;
    }
    if (galleryDescription) galleryDescription.textContent = category.description;
    galleryGrid.classList.remove("is-changing");
  };

  const renderGallery = (key, immediate = false) => {
    if (!galleryData[key] || key === activeGalleryKey && activeItems.length) return;
    window.clearTimeout(galleryRenderTimer);
    galleryFilters.forEach((filter) => {
      const selected = filter.dataset.galleryFilter === key;
      filter.setAttribute("aria-selected", String(selected));
      filter.tabIndex = selected ? 0 : -1;
    });

    if (immediate) {
      buildGallery(key);
      return;
    }

    galleryGrid?.classList.add("is-changing");
    galleryGrid?.setAttribute("aria-busy", "true");
    galleryRenderTimer = window.setTimeout(() => buildGallery(key), 180);
  };

  galleryFilters.forEach((filter, filterIndex) => {
    filter.id = `portfolio-tab-${filter.dataset.galleryFilter || filterIndex}`;
    filter.setAttribute("aria-controls", galleryPanelId);
    filter.addEventListener("click", () => renderGallery(filter.dataset.galleryFilter));
    filter.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = filterIndex;
      if (event.key === "ArrowLeft") nextIndex = (filterIndex - 1 + galleryFilters.length) % galleryFilters.length;
      if (event.key === "ArrowRight") nextIndex = (filterIndex + 1) % galleryFilters.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = galleryFilters.length - 1;
      galleryFilters[nextIndex].focus();
      renderGallery(galleryFilters[nextIndex].dataset.galleryFilter);
    });
  });

  if (galleryGrid && galleryData.matchday) {
    buildGallery("matchday");
    galleryFilters.forEach((filter, index) => {
      filter.tabIndex = index === 0 ? 0 : -1;
    });
  }

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrevious?.addEventListener("click", () => updateLightbox(activeLightboxIndex - 1));
  lightboxNext?.addEventListener("click", () => updateLightbox(activeLightboxIndex + 1));

  lightbox?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeLightbox();
  });

  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") updateLightbox(activeLightboxIndex - 1);
    if (event.key === "ArrowRight") updateLightbox(activeLightboxIndex + 1);
  });

  lightbox?.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
  });

  lightbox?.addEventListener("pointerup", (event) => {
    const delta = event.clientX - pointerStartX;
    if (Math.abs(delta) < 55) return;
    updateLightbox(activeLightboxIndex + (delta < 0 ? 1 : -1));
  });

  /* Services accordion — one open panel at a time */
  const serviceButtons = qsa("[data-accordion] .service-item > button");
  serviceButtons.forEach((button, index) => {
    const panel = button.nextElementSibling;
    const buttonId = `service-button-${index + 1}`;
    const panelId = `service-panel-${index + 1}`;
    button.id = buttonId;
    button.setAttribute("aria-controls", panelId);
    if (panel instanceof HTMLElement) {
      panel.id = panelId;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", buttonId);
    }

    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      serviceButtons.forEach((otherButton) => {
        const panel = otherButton.nextElementSibling;
        otherButton.setAttribute("aria-expanded", "false");
        if (panel instanceof HTMLElement) panel.hidden = true;
      });

      if (willOpen) {
        const panel = button.nextElementSibling;
        button.setAttribute("aria-expanded", "true");
        if (panel instanceof HTMLElement) panel.hidden = false;
      }
    });
  });

  /* Back to top */
  qs("[data-scroll-top]")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
})();
