// FAQ accordion — /partials/faq.html
// one-open mode: при открытии одного — остальные закрываются

(function initFAQ(){
  const root = document.querySelector("[data-faq]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll("[data-faq-item]"));

  function setOpen(item, open){
    const btn = item.querySelector(".faq-item__toggle");
    if (!btn) return;

    item.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  // initial state: ВСЕ закрыты (игнорируем случайно оставленный is-open)
  for (const item of items){
    setOpen(item, false);

    const panel = item.querySelector(".faq-item__panel");
    const btn = item.querySelector(".faq-item__toggle");

    // a11y: region label
    if (panel && btn && !panel.getAttribute("aria-labelledby")){
      if (!btn.id) btn.id = `faq_toggle_${Math.random().toString(16).slice(2)}`;
      panel.setAttribute("aria-labelledby", btn.id);
    }
  }

  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-item__toggle");
    if (!btn || !root.contains(btn)) return;

    const item = btn.closest("[data-faq-item]");
    if (!item) return;

    const isOpen = item.classList.contains("is-open");

    // one-open mode
    for (const it of items) setOpen(it, false);
    setOpen(item, !isOpen);
  });
})();
