/* =========================================================
   KILLER BEES — MUAY THAI
   script.js — JavaScript puro (sem dependências)
   Índice:
   1. Menu mobile
   2. Navbar no scroll
   3. Fechar menu ao clicar em link / scroll suave
   4. Intersection Observer (reveal)
   5. Tabs de horários
   6. Carrossel de depoimentos
   7. Galeria + Lightbox
   8. WhatsApp flutuante
   9. Botão voltar ao topo
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. MENU MOBILE ---------- */
  const navToggle = document.getElementById('navToggle');
  const navbarNav = document.getElementById('navbarNav');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    navbarNav.classList.add('is-open');
    navToggle.classList.add('is-active');
    navOverlay.classList.add('is-active');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu');
  }

  function closeMenu() {
    navbarNav.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navOverlay.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navbarNav.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  navOverlay.addEventListener('click', closeMenu);

  /* Fecha o menu ao clicar em qualquer link de navegação */
  document.querySelectorAll('.nav-link, .navbar__nav .navbar__cta').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Fecha o menu com a tecla ESC */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- 2. NAVBAR NO SCROLL ---------- */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }
  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  /* ---------- 4. INTERSECTION OBSERVER (REVEAL) ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('active'));
  }

  /* ---------- 5. TABS DE HORÁRIOS ---------- */
  const scheduleTabs = document.querySelectorAll('.schedule__tab');
  const schedulePanels = document.querySelectorAll('.schedule__panel');

  scheduleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      scheduleTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      schedulePanels.forEach(panel => {
        const isTarget = panel.id === `panel-${target}`;
        panel.classList.toggle('is-active', isTarget);
        panel.hidden = !isTarget;
      });
    });
  });

  /* ---------- 6. CARROSSEL DE DEPOIMENTOS ---------- */
  const track = document.getElementById('testimonialTrack');
  const slides = track ? Array.from(track.children) : [];
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const carousel = document.getElementById('testimonialCarousel');

  let currentSlide = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 6000;

  if (track && slides.length) {
    // Cria os indicadores dinamicamente
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ir para o depoimento ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function updateCarousel() {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentSlide);
      });
    }

    function goToSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      updateCarousel();
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });
    prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    /* Suporte a swipe (touch) */
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? nextSlide() : prevSlide();
      }
      startAutoplay();
    }, { passive: true });

    updateCarousel();
    startAutoplay();
  }

  /* ---------- 7. GALERIA + LIGHTBOX ---------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;

  function renderLightboxContent(index) {
    const item = galleryItems[index];
    // Se o item já possui uma <img> real (após substituição do placeholder), exibe a imagem.
    const img = item.querySelector('img');
    if (img) {
      lightboxContent.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
    } else {
      const label = item.querySelector('span') ? item.querySelector('span').textContent : 'Foto';
      lightboxContent.innerHTML = `<span>${label}</span>`;
    }
  }

  function openLightbox(index) {
    currentGalleryIndex = index;
    renderLightboxContent(currentGalleryIndex);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function showNextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
    renderLightboxContent(currentGalleryIndex);
  }

  function showPrevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
    renderLightboxContent(currentGalleryIndex);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', showNextImage);
    lightboxPrev.addEventListener('click', showPrevImage);

    /* Fecha ao clicar fora da imagem */
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    /* Fecha com ESC e navega com as setas do teclado */
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNextImage();
      if (e.key === 'ArrowLeft') showPrevImage();
    });
  }

  /* ---------- 8. WHATSAPP FLUTUANTE ---------- */
  const whatsappBtn = document.getElementById('whatsappBtn');
  const whatsappPanel = document.getElementById('whatsappPanel');
  const whatsappFloat = document.getElementById('whatsappFloat');

  whatsappBtn.addEventListener('click', () => {
    const isHidden = whatsappPanel.hidden;
    whatsappPanel.hidden = !isHidden;
    whatsappBtn.setAttribute('aria-expanded', String(isHidden));
  });

  document.addEventListener('click', (e) => {
    if (!whatsappFloat.contains(e.target)) {
      whatsappPanel.hidden = true;
      whatsappBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      whatsappPanel.hidden = true;
      whatsappBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 9. BOTÃO VOLTAR AO TOPO ---------- */
  const backToTop = document.getElementById('backToTop');

  function handleBackToTopVisibility() {
    if (window.scrollY > 600) {
      backToTop.hidden = false;
      requestAnimationFrame(() => backToTop.classList.add('is-visible'));
    } else {
      backToTop.classList.remove('is-visible');
      backToTop.hidden = true;
    }
  }
  handleBackToTopVisibility();
  window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
