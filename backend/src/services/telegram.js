function getServiceTitle(lead) {
  const id = String(lead.popup_id || "").trim();
  const tag = String(lead.tag || "").trim();

  const mapByPopupId = {
    "service-1": "Маленькое чудо",
    "service-2": "Классический праздник",
    "service-3": "История с героями"
  };

  const mapByTag = {
    "services-small": "Маленькое чудо",
    "services-classic": "Классический праздник",
    "services-heroes": "История с героями"
  };

  return mapByPopupId[id] || mapByTag[tag] || "";
}

function digitsOnly(s) {
  return String(s || "").replace(/\D/g, "");
}

function formatPrettyDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  // Без timeZone — максимально совместимо на Windows
  return d.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendTelegramLead(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const serviceTitle = getServiceTitle(lead);
  const prettyDate = formatPrettyDate(lead.createdAt);

  const phoneRaw = String(lead.phone || "").trim();
  const phoneDigits = digitsOnly(phoneRaw);

  const telHref = phoneDigits ? `tel:+${phoneDigits}` : "";
  const phoneHtml = telHref
    ? `<a href="${telHref}">${escapeHtml(phoneRaw)}</a>`
    : escapeHtml(phoneRaw || "-");

  const wish = String(lead.wish || lead.comment || "").trim();

  const textHtml =
`📩 <b>Новая заявка</b>
${serviceTitle ? `🎉 <b>Услуга:</b> ${escapeHtml(serviceTitle)}\n` : ""}👤 <b>Имя:</b> ${escapeHtml(lead.name || "-")}
📞 <b>Телефон:</b> ${phoneHtml}
${wish ? `📝 <b>Пожелания:</b> ${escapeHtml(wish)}\n` : ""}${prettyDate ? `🕒 <b>Время:</b> ${escapeHtml(prettyDate)}` : ""}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: textHtml,
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Telegram sendMessage failed: ${resp.status} ${body}`);
  }
}
