/**
 * Mouse-parallax for decorative elements (assets/img/move/*)
 *
 * - Desktop only: min-width 901px + fine pointer + hover
 * - Inverted movement (cursor up -> element down)
 *
 * How to use in HTML:
 *   <img class="hero__deco js-move" data-move="16" ...>
 *   <div class="program__deco program__deco--left js-move" data-move="10"></div>
 *
 * Tuning:
 *   data-move   : max shift in px for both axes
 *   data-move-x : max shift in px on X axis
 *   data-move-y : max shift in px on Y axis
 */

(function () {
  const mq = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let els = [];
  let raf = 0;
  let running = false;

  // target cursor offset in range [-1..1]
  let tx = 0;
  let ty = 0;
  // smoothed current offset
  let cx = 0;
  let cy = 0;

  function collect() {
    els = Array.from(document.querySelectorAll(".js-move"));
  }

  function reset() {
    els.forEach((el) => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  }

  function onMove(e) {
    const vw = Math.max(1, window.innerWidth);
    const vh = Math.max(1, window.innerHeight);

    // normalize to [-1..1] relative to center
    const nx = (e.clientX - vw / 2) / (vw / 2);
    const ny = (e.clientY - vh / 2) / (vh / 2);

    // clamp
    tx = Math.max(-1, Math.min(1, nx));
    ty = Math.max(-1, Math.min(1, ny));
  }

  function tick() {
    // smoothing (smaller = smoother)
    const ease = 0.08;
    cx += (tx - cx) * ease;
    cy += (ty - cy) * ease;

    for (const el of els) {
      const base = parseFloat(el.getAttribute("data-move") || "12");
      const sx = parseFloat(el.getAttribute("data-move-x") || String(base));
      const sy = parseFloat(el.getAttribute("data-move-y") || String(base));

      // ✅ inversion: cursor right -> element left, cursor down -> element up
      const px = (-cx * sx).toFixed(2) + "px";
      const py = (-cy * sy).toFixed(2) + "px";

      el.style.setProperty("--mx", px);
      el.style.setProperty("--my", py);
    }

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    collect();
    reset();
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) return;
    running = false;
    window.removeEventListener("mousemove", onMove);
    cancelAnimationFrame(raf);
    raf = 0;
    tx = ty = cx = cy = 0;
    reset();
  }

  function sync() {
    const shouldRun = mq.matches && !reduced.matches;
    if (shouldRun) start();
    else stop();
  }

  // This script is loaded after partials are injected (main.js does it)
  sync();

  mq.addEventListener?.("change", sync);
  reduced.addEventListener?.("change", sync);

  window.addEventListener(
    "resize",
    () => {
      if (!running) return;
      collect();
    },
    { passive: true }
  );
})();
