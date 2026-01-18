// LOVE: пытаемся запустить фоновое видео (iOS иногда блокирует autoplay)

(function initLoveVideo(){
  const v = document.querySelector(".love__video");
  if (!v) return;

  const tryPlay = () => {
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Ждём первого взаимодействия пользователя
        const once = () => {
          v.play().catch(() => {});
          window.removeEventListener("touchstart", once);
          window.removeEventListener("click", once);
        };
        window.addEventListener("touchstart", once, { passive: true, once: true });
        window.addEventListener("click", once, { passive: true, once: true });
      });
    }
  };

  if (v.readyState >= 2) {
    tryPlay();
  } else {
    v.addEventListener("loadedmetadata", tryPlay, { once: true });
  }
})();
