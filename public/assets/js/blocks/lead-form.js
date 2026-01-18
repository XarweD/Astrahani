(() => {
  const form = document.querySelector('.lead-form__form');
  if (!form) return;

  const phone = form.querySelector('[data-phone]');
  const errorEl = form.querySelector('.lf-error');
  const submitBtn = form.querySelector('button[type="submit"]');

  const ensurePlus = () => {
    if (!phone) return;
    const v = (phone.value || '').trim();
    if (v === '') {
      phone.value = '+7';
      return;
    }
    if (!v.startsWith('+')) {
      phone.value = '+' + v.replace(/\+/g, '');
    }
  };

  const setMsg = (text, isOk = false) => {
    if (!errorEl) return;
    errorEl.textContent = text || '';
    // Без правок CSS: просто чуть меняем цвет через inline
    errorEl.style.color = isOk ? '#b7ff39' : '#ff6a8a';
  };

  const digitsOnly = (s) => String(s || '').replace(/\D/g, '');

  if (phone) {
    phone.addEventListener('focus', () => {
      if ((phone.value || '').trim() === '') phone.value = '+7';
      ensurePlus();
      requestAnimationFrame(() => {
        try { phone.setSelectionRange(phone.value.length, phone.value.length); } catch (e) {}
      });
    });

    phone.addEventListener('input', () => {
      ensurePlus();
    });

    phone.addEventListener('blur', () => {
      if (!phone.value) return;
      phone.value = phone.value.replace(/\s+/g, ' ').trim();
      ensurePlus();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMsg('');

    const nameEl = form.querySelector('input[name="name"]');
    const phoneEl = form.querySelector('input[name="phone"]');
    const consentEl = form.querySelector('input[name="consent"]');
    const messageEl = form.querySelector('textarea[name="message"]');
    const honeypotEl = form.querySelector('input[name="company"]');

    const name = (nameEl?.value || '').trim();
    const phoneVal = (phoneEl?.value || '').trim();
    const consentOk = !!(consentEl && consentEl.checked);

    // ✅ делаем как на бекенде: минимум 10 цифр
    const phoneDigits = digitsOnly(phoneVal);
    const phoneOk = phoneDigits.length >= 10;

    const nameOk = name.length >= 2;

    if (!nameOk || !phoneOk || !consentOk) {
      if (!nameOk) setMsg('Введите имя (минимум 2 символа).');
      else if (!phoneOk) setMsg('Введите корректный номер телефона (минимум 10 цифр).');
      else if (!consentOk) setMsg('Подтвердите согласие на обработку данных.');
      return;
    }

    // ✅ Пожелания клиента (для этой формы)
    const wish = (messageEl?.value || '').trim();

    // ✅ эти значения можно менять, если захочешь сегментацию
    const popup_id = form.dataset.popupId || 'lead-form';
    const tag = form.dataset.tag || 'lead-form';

    const payload = {
      popup_id,
      tag,
      name,
      phone: phoneVal,
      wish, // ✅ важно: telegram/mailer уже читают lead.wish
      company: (honeypotEl?.value || '').trim(), // ✅ honeypot
      page: window.location.href,
      ua: navigator.userAgent
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.prevText = submitBtn.textContent || '';
        submitBtn.textContent = 'Отправляем...';
      }

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // успех
      setMsg('Заявка отправлена! Мы скоро свяжемся с вами.', true);
      form.reset();
      if (phone) phone.value = '';
    } catch (err) {
      setMsg('Не удалось отправить. Попробуйте ещё раз или напишите в Telegram/WhatsApp.');
      console.error(err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.prevText || 'Подобрать программу';
      }
    }
  });
})();
