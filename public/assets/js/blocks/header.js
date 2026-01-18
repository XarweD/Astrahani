// Sticky header + Drawer menu (overlay + right panel)

const header = document.getElementById("siteHeader");
const burger = document.getElementById("burgerBtn");

const overlay = document.getElementById("menuOverlay");
const drawer = document.getElementById("mobileMenu");
const closeBtn = document.getElementById("menuCloseBtn");

// ✅ чтобы вернуть фокус туда, откуда открыли меню (и убрать aria-hidden warning)
let lastFocusEl = null;

function setSticky() {
  if (!header) return;
  const y = window.scrollY || document.documentElement.scrollTop;
  header.classList.toggle("is-sticky", y > 20);
}
setSticky();
window.addEventListener("scroll", setSticky, { passive: true });

function openMenu() {
  if (!drawer || !overlay) return;

  // запоминаем элемент, который был в фокусе до открытия
  lastFocusEl = document.activeElement || burger;

  overlay.hidden = false;
  drawer.hidden = false;

  // сначала делаем доступным для a11y
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");

  requestAnimationFrame(() => {
    drawer.classList.add("is-open");

    // ✅ переводим фокус внутрь меню (на кнопку закрытия)
    if (closeBtn) closeBtn.focus();
  });
}

function closeMenu() {
  if (!drawer || !overlay) return;

  // ✅ ВАЖНО: сначала вернуть фокус НАРУЖУ, а потом скрывать (иначе warning)
  const focusBackTo =
    (lastFocusEl && typeof lastFocusEl.focus === "function") ? lastFocusEl : burger;

  if (focusBackTo && typeof focusBackTo.focus === "function") {
    focusBackTo.focus();
  }

  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");

  setTimeout(() => {
    overlay.hidden = true;
    drawer.hidden = true;
  }, 250);
}

if (burger) burger.addEventListener("click", openMenu);
if (closeBtn) closeBtn.addEventListener("click", closeMenu);

if (overlay) overlay.addEventListener("click", closeMenu);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

if (drawer) {
  drawer.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    // ✅ если это ссылка, которая открывает попап — просто закрываем меню и выходим
    // (открытие попапа обработает popup.js)
    if (link.hasAttribute("data-popup-open")) {
      closeMenu();
      return;
    }

    const href = link.getAttribute("href") || "";

    // ✅ КРИТИЧЕСКИЙ ФИКС: "#" — невалидный selector, поэтому пропускаем
    if (href === "#") return;

    // якоря вида "#section"
    if (href.startsWith("#")) {
      e.preventDefault();

      closeMenu();

      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.location.hash = href;
      }, 180);
    }
  });
}
