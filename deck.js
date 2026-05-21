/**
 * 毕业答辩演示文稿 · 交互逻辑
 */
(function () {
  'use strict';

  const ASSET_BASE = 'https://raw.githubusercontent.com/Sxx1277/repo0522/main/ppt_assets/';
  const AVATARS = [
    { src: ASSET_BASE + 'avatar2.png', label: '测试样本 1' },
    { src: ASSET_BASE + 'avatar3.png', label: '测试样本 2' },
    { src: ASSET_BASE + 'avatar4.png', label: '测试样本 3' },
  ];
  const DEMO_VIDEO_URL = '';
  const TOTAL = 8;
  const TRANSITION_MS = 450;

  const slides = [...document.querySelectorAll('.slide')];
  const prevBtn = document.getElementById('nav-prev');
  const nextBtn = document.getElementById('nav-next');
  const progressFill = document.getElementById('nav-progress-fill');
  const navPage = document.getElementById('nav-page');
  const dotsEl = document.getElementById('nav-dots');
  const themeBtn = document.getElementById('theme-toggle');
  const fullscreenBtn = document.getElementById('fullscreen');

  let cur = 0;
  let transitioning = false;

  /* ---------- 角标装饰（图表 L 型边框） ---------- */
  document.querySelectorAll('.img-wrap.corner-frame').forEach(wrap => {
    if (!wrap.querySelector('.corner-bl')) {
      const bl = document.createElement('span');
      bl.className = 'corner-bl';
      bl.setAttribute('aria-hidden', 'true');
      const br = document.createElement('span');
      br.className = 'corner-br';
      br.setAttribute('aria-hidden', 'true');
      wrap.appendChild(bl);
      wrap.appendChild(br);
    }
  });

  /* ---------- 导航圆点 ---------- */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
    dot.title = `第 ${i + 1} 页`;
    dot.setAttribute('aria-label', `跳转到第 ${i + 1} 页`);
    dot.addEventListener('click', () => go(i));
    dotsEl.appendChild(dot);
  });

  function updateUI() {
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === slides.length - 1;
    const pct = ((cur + 1) / slides.length) * 100;
    progressFill.style.width = pct + '%';
    navPage.textContent = `${cur + 1} / ${TOTAL}`;
    [...dotsEl.children].forEach((d, i) => d.classList.toggle('active', i === cur));
    slides.forEach((s, i) => {
      const num = s.querySelector('.slide-num');
      if (num) num.textContent = `${i + 1} / ${TOTAL}`;
    });
  }

  function resetReveal(slide) {
    slide.querySelectorAll('.reveal').forEach(el => {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });
  }

  function go(n) {
    if (transitioning || n < 0 || n >= slides.length || n === cur) return;

    transitioning = true;
    const dir = n > cur ? 1 : -1;
    const outgoing = slides[cur];
    const incoming = slides[n];

    outgoing.classList.remove('active');
    outgoing.classList.add(dir > 0 ? 'exit-left' : 'exit-right');

    incoming.classList.add(dir > 0 ? 'enter-right' : 'enter-left', 'active');
    resetReveal(incoming);

    window.setTimeout(() => {
      outgoing.classList.remove('exit-left', 'exit-right');
      incoming.classList.remove('enter-left', 'enter-right');
      cur = n;
      updateUI();
      transitioning = false;
    }, TRANSITION_MS);
  }

  prevBtn.addEventListener('click', () => go(cur - 1));
  nextBtn.addEventListener('click', () => go(cur + 1));

  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  });

  /* ---------- 主题切换 ---------- */
  const THEME_KEY = 'deck-theme';
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  function updateThemeLabel() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    themeBtn.textContent = isDark ? '浅色' : '深色';
    themeBtn.title = isDark ? '切换为浅色学术主题' : '切换为暗黑科技主题';
  }

  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeLabel();
  });
  updateThemeLabel();

  /* ---------- 灯箱 ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxInner = document.getElementById('lightbox-inner');
  const avatarModal = document.getElementById('avatar-modal');
  const videoModal = document.getElementById('video-modal');
  const avatarGrid = document.getElementById('avatar-grid');
  const demoVideo = document.getElementById('demo-video');
  const videoPlaceholder = document.getElementById('video-placeholder');

  function getCaption(img) {
    const cell = img.closest('.img-cell');
    if (cell) {
      const c = cell.querySelector('.caption');
      if (c) return c.textContent.trim();
    }
    const wrap = img.closest('.img-wrap');
    const next = wrap?.nextElementSibling;
    if (next?.classList.contains('caption')) return next.textContent.trim();
    const slideCap = img.closest('.slide')?.querySelector('.caption');
    return slideCap ? slideCap.textContent.trim() : (img.alt || '');
  }

  function openLightbox(img, captionText) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = captionText || getCaption(img);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    if (!avatarModal.classList.contains('open') && !videoModal.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.img-wrap').forEach(wrap => {
    wrap.addEventListener('click', e => {
      const img = wrap.querySelector('img');
      if (img?.src) {
        e.stopPropagation();
        openLightbox(img);
      }
    });
  });

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  lightboxInner.addEventListener('click', e => e.stopPropagation());

  AVATARS.forEach(a => {
    const item = document.createElement('div');
    item.className = 'avatar-item';
    item.innerHTML = `<img src="${a.src}" alt="${a.label}"><span>${a.label}</span>`;
    const img = item.querySelector('img');
    img.addEventListener('click', e => {
      e.stopPropagation();
      openLightbox(img, a.label + ' · 现场测试头像');
    });
    avatarGrid.appendChild(item);
  });

  function openModal(el) {
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(el) {
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    if (el === videoModal) demoVideo.pause();
    if (!lightbox.classList.contains('open') && !avatarModal.classList.contains('open') && !videoModal.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function anyOverlayOpen() {
    return lightbox.classList.contains('open') ||
      avatarModal.classList.contains('open') ||
      videoModal.classList.contains('open');
  }

  document.getElementById('btn-avatars').addEventListener('click', () => openModal(avatarModal));
  document.getElementById('btn-video').addEventListener('click', () => {
    openModal(videoModal);
    if (DEMO_VIDEO_URL) {
      demoVideo.src = DEMO_VIDEO_URL;
      demoVideo.style.display = 'block';
      videoPlaceholder.style.display = 'none';
    }
  });

  avatarModal.addEventListener('click', e => {
    if (e.target === avatarModal) closeModal(avatarModal);
  });
  videoModal.addEventListener('click', e => {
    if (e.target === videoModal) closeModal(videoModal);
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(document.getElementById(btn.dataset.close)));
  });

  if (DEMO_VIDEO_URL) {
    demoVideo.src = DEMO_VIDEO_URL;
    demoVideo.style.display = 'block';
    videoPlaceholder.style.display = 'none';
  }

  /* ---------- 键盘 ---------- */
  document.addEventListener('keydown', e => {
    if (anyOverlayOpen()) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (lightbox.classList.contains('open')) closeLightbox();
        else if (avatarModal.classList.contains('open')) closeModal(avatarModal);
        else if (videoModal.classList.contains('open')) closeModal(videoModal);
      }
      return;
    }
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      go(cur + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      go(cur - 1);
    }
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(slides.length - 1);
  });

  /* ---------- 触摸滑动 ---------- */
  let touchStartX = 0;
  document.addEventListener('touchstart', e => {
    if (anyOverlayOpen()) return;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (anyOverlayOpen()) return;
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) go(cur + 1);
    else go(cur - 1);
  }, { passive: true });

  updateUI();
})();
