function digitsOnly(s) {
  return String(s || "").replace(/\D/g, "");
}

export function validateLead(req, res, next) {
  const b = req.body || {};

  const popup_id = String(b.popup_id || "").trim();
  const tag = String(b.tag || "").trim();
  const name = String(b.name || "").trim();
  const phone = String(b.phone || "").trim();
  const page = String(b.page || "").trim();
  const ua = String(b.ua || "").trim();

  // --- honeypot
  const hpField = String(process.env.HONEYPOT_FIELD || "company").trim();
  const hpValue = String(b[hpField] || "").trim();
  const honeypotTriggered = hpValue.length > 0;

  // --- simple validation (если honeypot — не валидируем строго, просто “успех”)
  if (!honeypotTriggered) {
    if (name.length < 2) {
      return res.status(400).json({ ok: false, error: "Bad name" });
    }
    const phoneDigits = digitsOnly(phone);
    if (phoneDigits.length < 10) {
      return res.status(400).json({ ok: false, error: "Bad phone" });
    }
  }

  req.lead = {
    popup_id,
    tag,
    name,
    phone,
    page,
    ua,
    createdAt: new Date().toISOString(),
    _honeypotTriggered: honeypotTriggered
  };

  next();
}
