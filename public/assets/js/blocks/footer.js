// Footer — scripts for /partials/footer.html
// В целом JS не нужен: анимации сделаны через CSS.
// Этот файл оставлен «безопасным», чтобы не было прыжка страницы,
// если ссылки на мессенджеры/политику пока не заполнены (href="#").

document.addEventListener("click", (e) => {
  const a = e.target && (e.target.closest ? e.target.closest("a") : null);
  if (!a) return;

  const href = a.getAttribute("href") || "";
  if (href.trim() === "#") {
    e.preventDefault();
  }
});
