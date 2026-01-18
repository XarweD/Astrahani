/* =========================
   POPUP (modal) system (no flags, manual country code)
   ========================= */

(function () {
  const layer = document.getElementById("popupLayer");
  if (!layer) return;

  const popups = Array.from(layer.querySelectorAll(".popup[data-popup]"));

  function getPopup(key) {
    return popups.find(p => p.getAttribute("data-popup") === key);
  }

  function closeAll() {
    popups.forEach(p => p.classList.remove("is-active"));
  }

  function setText(popup, opts) {
    if (!popup || !opts) return;

    const t = popup.querySelector("[data-popup-title]");
    const s = popup.querySelector("[data-popup-sub]");
    const b = popup.querySelector("[data-popup-btn]");
    const tag = popup.querySelector("input[name='tag']");

    if (typeof opts.title === "string" && opts.title.length && t) t.textContent = opts.title;
    if (typeof opts.sub === "string" && opts.sub.length && s) s.textContent = opts.sub;
    if (typeof opts.btn === "string" && opts.btn.length && b) b.textContent = opts.btn;
    if (typeof opts.tag === "string" && tag) tag.value = opts.tag;
  }

  function openPopup(key, opts = {}) {
    const popup = getPopup(key);
    if (!popup) return;

    closeAll();
    setText(popup, opts);

    layer.classList.add("is-open");
    layer.setAttribute("aria-hidden", "false");
    document.body.classList.add("popup-open");

    popup.classList.add("is-active");
    popup.focus({ preventScroll: true });

    // reset status
    const status = popup.querySelector(".pf-status");
    if (status) {
      status.classList.remove("is-error", "is-ok");
      status.textContent = "";
    }
  }

  function closePopup() {
    closeAll();
    layer.classList.remove("is-open");
    layer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("popup-open");
  }

  // Delegated clicks
  document.addEventListener("click", (e) => {
    // open popup
    const opener = e.target.closest("[data-popup-open]");
    if (opener) {
      e.preventDefault();
      const key = opener.getAttribute("data-popup-open");
      openPopup(key, {
        title: opener.getAttribute("data-popup-title") || "",
        sub: opener.getAttribute("data-popup-sub") || "",
        btn: opener.getAttribute("data-popup-btn") || "",
        tag: opener.getAttribute("data-popup-tag") || "",
      });
      return;
    }

    if (layer.classList.contains("is-open")) {
      // close by backdrop click
      if (e.target.classList && e.target.classList.contains("popup-backdrop")) {
        closePopup();
        return;
      }

      // ✅ NEW: close by click on empty area around the card (popup itself is fullscreen)
      if (
        e.target.classList &&
        e.target.classList.contains("popup") &&
        e.target.classList.contains("is-active")
      ) {
        closePopup();
        return;
      }

      // close by explicit close buttons
      if (e.target.closest("[data-popup-close]")) {
        closePopup();
        return;
      }
    }
  });

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && layer.classList.contains("is-open")) {
      closePopup();
    }
  });

  // normalize code input: keep leading +, digits only
  layer.addEventListener("input", (e) => {
    const codeInp = e.target.closest("input[name='code']");
    if (!codeInp) return;

    let v = codeInp.value.trim();

    // allow user to type +, digits
    // remove everything else
    v = v.replace(/[^\d+]/g, "");

    // only one plus at start
    if (v.includes("+")) {
      v = "+" + v.replace(/\+/g, "");
    }

    // if user typed just digits -> add +
    if (v && !v.startsWith("+")) v = "+" + v;

    // clamp length (коды стран обычно до 4 цифр)
    const digits = v.replace(/\D/g, "");
    if (digits.length > 4) v = "+" + digits.slice(0, 4);

    codeInp.value = v || "+";
  });

  // Submit handler (frontend part)
  layer.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-popup-form]");
    if (!form) return;

    e.preventDefault();

    const status = form.querySelector(".pf-status");
    const btn = form.querySelector("button[type='submit']");

    const consent = form.querySelector("input[name='consent']");
    if (consent && !consent.checked) {
      if (status) {
        status.classList.add("is-error");
        status.textContent = "Нужно согласие на обработку персональных данных.";
      }
      return;
    }

    const fd = new FormData(form);

    const codeRaw = String(fd.get("code") || "+7").trim();
    const codeDigits = codeRaw.replace(/\D/g, "");
    const code = codeDigits ? ("+" + codeDigits) : "+7";

    const rawPhone = String(fd.get("phone") || "").trim();
    let phoneDigits = rawPhone.replace(/\D/g, "");

    // комфорт: если человек ввёл полный телефон с + — берём как есть
    let phone = rawPhone;
    if (rawPhone.startsWith("+")) {
      phone = rawPhone;
    } else {
      // если человек случайно начал номер с кода страны — не дублируем
      if (phoneDigits.startsWith(codeDigits)) {
        phone = "+" + phoneDigits;
      } else {
        phone = code + phoneDigits;
      }
    }

    const payload = {
      popup_id: String(fd.get("popup_id") || ""),
      tag: String(fd.get("tag") || ""),
      name: String(fd.get("name") || "").trim(),
      phone,
      page: window.location.href,
      ua: navigator.userAgent,
    };

    // Simple validation
    if (!payload.phone || payload.phone.replace(/\D/g, "").length < 10) {
      if (status) {
        status.classList.add("is-error");
        status.textContent = "Введите корректный телефон.";
      }
      return;
    }

    try {
      if (status) {
        status.classList.remove("is-error", "is-ok");
        status.textContent = "Отправляем...";
      }
      if (btn) btn.disabled = true;

      // Здесь будет твой backend endpoint (сразу Telegram + Email)
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      if (status) {
        status.classList.add("is-ok");
        status.textContent = "Готово! Мы скоро свяжемся с вами.";
      }

      form.reset();

      // вернуть код по умолчанию
      const codeInp = form.querySelector("input[name='code']");
      if (codeInp) codeInp.value = "+7";

      const c = form.querySelector("input[name='consent']");
      if (c) c.checked = true;

    } catch (err) {
      console.error(err);
      if (status) {
        status.classList.add("is-error");
        status.textContent = "Не удалось отправить. Попробуйте ещё раз или напишите в Telegram/WhatsApp.";
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
})();
