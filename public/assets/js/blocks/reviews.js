// Reviews slider — /partials/reviews.html
// - Кнопки (desktop)
// - Loop
// - Swipe (iPad/mob), кнопки скрыты CSS-ом

(function initReviews(){
  const root = document.querySelector('[data-reviews]');
  if (!root) return;

  const track = root.querySelector('[data-reviews-track]');
  const viewport = root.querySelector('.reviews__viewport');
  const btnPrev = root.querySelector('[data-reviews-prev]');
  const btnNext = root.querySelector('[data-reviews-next]');

  if (!track || !viewport) return;

  const cards = Array.from(track.querySelectorAll('[data-review]'));
  if (!cards.length) return;

  let index = 0;
  let lastPerView = null;
  let resizeRaf = 0;

  function getPerView(){
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--reviews-per-view')
      .trim();
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 3;
  }

  function getGap(){
    const v = getComputedStyle(track).gap || getComputedStyle(track).columnGap;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  function maxIndex(perView){
    return Math.max(0, cards.length - perView);
  }

  function clampIndex(perView){
    const max = maxIndex(perView);
    if (index > max) index = max;
    if (index < 0) index = 0;
  }

  function update(){
    const perView = getPerView();
    clampIndex(perView);

    const card0 = cards[0];
    const cardRect = card0.getBoundingClientRect();
    const gap = getGap();
    const step = cardRect.width + gap;
    const x = -(index * step);

    track.style.transition = 'transform .45s ease';
    track.style.transform = `translate3d(${x}px, 0, 0)`;

    lastPerView = perView;
  }

  function goNext(){
    const perView = getPerView();
    const max = maxIndex(perView);
    index = (index >= max) ? 0 : (index + 1);
    update();
  }

  function goPrev(){
    const perView = getPerView();
    const max = maxIndex(perView);
    index = (index <= 0) ? max : (index - 1);
    update();
  }

  // кнопки
  if (btnNext) btnNext.addEventListener('click', goNext);
  if (btnPrev) btnPrev.addEventListener('click', goPrev);

  // keyboard
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });
  root.tabIndex = 0;

  // resize
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      const perView = getPerView();
      if (lastPerView !== null && perView !== lastPerView){
        clampIndex(perView);
      }
      update();
    });
  }, { passive: true });

  // ---------- swipe ----------
  let isDown = false;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;
  const SWIPE_MIN = 40;     // px
  const VERTICAL_LOCK = 12; // px

  function onPointerDown(e){
    // только touch/pen (на десктопе мышью не надо)
    if (e.pointerType === 'mouse') return;

    isDown = true;
    dx = 0; dy = 0;

    startX = e.clientX;
    startY = e.clientY;

    track.style.transition = 'none';
    viewport.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e){
    if (!isDown) return;

    dx = e.clientX - startX;
    dy = e.clientY - startY;

    // если пользователь скроллит вертикально — отпускаем
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > VERTICAL_LOCK) {
      isDown = false;
      track.style.transition = '';
      update();
      return;
    }

    const perView = getPerView();
    clampIndex(perView);

    const card0 = cards[0];
    const cardRect = card0.getBoundingClientRect();
    const gap = getGap();
    const step = cardRect.width + gap;
    const baseX = -(index * step);

    track.style.transform = `translate3d(${baseX + dx}px, 0, 0)`;
  }

  function onPointerUp(){
    if (!isDown) return;
    isDown = false;

    // вернуть transition и решить — перелистывать или нет
    if (Math.abs(dx) >= SWIPE_MIN) {
      if (dx < 0) goNext();
      else goPrev();
    } else {
      update();
    }
  }

  viewport.addEventListener('pointerdown', onPointerDown, { passive: true });
  viewport.addEventListener('pointermove', onPointerMove, { passive: true });
  viewport.addEventListener('pointerup', onPointerUp, { passive: true });
  viewport.addEventListener('pointercancel', onPointerUp, { passive: true });
  // ---------- /swipe ----------

  window.addEventListener('load', update, { once: true });
  update();
})();
