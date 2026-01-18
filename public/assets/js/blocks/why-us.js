// WHY-US: move left title with scroll (desktop only)
// partials are injected via fetch, so scripts must live here

(function () {
  const mq = window.matchMedia("(min-width: 1025px)");
  if (!mq.matches) return;

  const section = document.getElementById("why-us");
  if (!section) return;

  const moveEl = section.querySelector("[data-whyus-move]");
  const stopEl = section.querySelector("[data-whyus-stop]");
  const balloonImg = section.querySelector(".why-us__balloon");
  if (!moveEl || !stopEl) return;

  let raf = null;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function update() {
    raf = null;

    const secTop = section.getBoundingClientRect().top + window.scrollY;
    const titleH = moveEl.offsetHeight;

    // текущая прокрутка относительно секции
    const current = window.scrollY - secTop;

    // запас над шариком (подкрути если надо ближе/дальше)
    const gap = 40;

    // ✅ стоп: если есть шарик — стопим по верхней границе шарика (точнее, чем маркер)
    // иначе — по маркеру
    let stopTop = stopEl.getBoundingClientRect().top + window.scrollY;

    if (balloonImg) {
      stopTop = balloonImg.getBoundingClientRect().top + window.scrollY;
    }

    // max translate so title bottom stays above stop point
    const maxY = Math.max(0, (stopTop - secTop) - titleH - gap);

    const y = clamp(current, 0, maxY);

    moveEl.style.transform = `translate3d(0, ${y}px, 0)`;
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
})();
