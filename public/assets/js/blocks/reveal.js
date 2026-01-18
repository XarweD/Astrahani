// Scroll reveal (fade + slide up) for all blocks inside <main>
// Не трогаем header/hero/footer.

(function initScrollReveal() {
  // если пользователь просит уменьшить анимации — не анимируем
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return;

  const main = document.querySelector("main");
  if (!main) return;

  // Берём все секции в main
  const sections = Array.from(main.querySelectorAll(".section"));
  if (!sections.length) return;

  // ВАЖНО:
  // Нельзя вешать transform на секцию целиком, если внутри есть position: fixed
  // (у тебя много фикс-декора). Поэтому анимируем только "контент"-обёртку.
  const targets = sections
    .map((section) => {
      // чаще всего контент живёт в .container
      const directContainer = section.querySelector(":scope > .container");
      if (directContainer) return directContainer;

      // иногда обёртка называется * __container
      const anyContainer = section.querySelector(":scope > [class*='__container']");
      if (anyContainer) return anyContainer;

      // fallback (если секция без контейнера)
      return section;
    })
    .filter(Boolean);

  // добавляем базовый класс и лёгкий stagger через CSS-переменную
  targets.forEach((el, idx) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(idx * 60, 240)}ms`);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    },
    {
      threshold: 0.15,
      // чуть заранее, чтобы появлялось до того как секция полностью влезла
      rootMargin: "0px 0px -10% 0px",
    }
  );

  targets.forEach((el) => io.observe(el));
})();
