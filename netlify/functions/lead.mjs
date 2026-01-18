// Netlify Function: POST /api/lead -> /.netlify/functions/lead
// Работает без Express.

import nodemailer from "nodemailer";
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

async function sendTelegramLead(lead) {
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

function isConfigured() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_TO &&
    process.env.MAIL_FROM
  );
}

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

async function sendEmailLead(lead) {
  if (!isConfigured()) return;

  const host = process.env.SMTP_HOST.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER.trim();
  const pass = process.env.SMTP_PASS;
  const to = process.env.MAIL_TO.trim();
  const fromEmail = process.env.MAIL_FROM.trim();
  const fromName = (process.env.FROM_NAME || "Website").trim();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  const serviceTitle = getServiceTitle(lead);
  const prettyDate = formatPrettyDate(lead.createdAt);

  const phoneRaw = String(lead.phone || "").trim();
  const phoneDigits = digitsOnly(phoneRaw);
  const telHref = phoneDigits ? `tel:+${phoneDigits}` : "";

  const wish = String(lead.wish || lead.comment || "").trim();

  const subject = `Новая заявка${serviceTitle ? `: ${serviceTitle}` : ""} — ${lead.name || "без имени"} (${lead.phone || "без телефона"})`;

  const html = `
    <h2>Новая заявка</h2>
    ${serviceTitle ? `<p><b>Услуга:</b> ${escapeHtml(serviceTitle)}</p>` : ""}
    <ul>
      <li><b>Имя:</b> ${escapeHtml(lead.name || "-")}</li>
      <li><b>Телефон:</b> ${
        telHref
          ? `<a href="${telHref}">${escapeHtml(phoneRaw)}</a>`
          : escapeHtml(phoneRaw || "-")
      }</li>
      ${wish ? `<li><b>Пожелания:</b> ${escapeHtml(wish)}</li>` : ""}
      ${prettyDate ? `<li><b>Время:</b> ${escapeHtml(prettyDate)}</li>` : ""}
    </ul>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html
  });
}

function json(statusCode, obj, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...extraHeaders
    },
    body: JSON.stringify(obj)
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false });
  }

  let b = {};
  try {
    b = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Bad JSON" });
  }

  const popup_id = String(b.popup_id || "").trim();
  const tag = String(b.tag || "").trim();
  const name = String(b.name || "").trim();
  const phone = String(b.phone || "").trim();
  const page = String(b.page || "").trim();
  const ua = String(b.ua || "").trim();
  const wish = String(b.wish || b.comment || "").trim();

  // honeypot
  const hpField = String(process.env.HONEYPOT_FIELD || "company").trim();
  const hpValue = String(b[hpField] || "").trim();
  const honeypotTriggered = hpValue.length > 0;

  if (!honeypotTriggered) {
    if (name.length < 2) {
      return json(400, { ok: false, error: "Bad name" });
    }
    const phoneDigits = digitsOnly(phone);
    if (phoneDigits.length < 10) {
      return json(400, { ok: false, error: "Bad phone" });
    }
  }

  const lead = {
    popup_id,
    tag,
    name,
    phone,
    page,
    ua,
    wish,
    createdAt: new Date().toISOString(),
    _honeypotTriggered: honeypotTriggered
  };

  // honeypot triggered => молча "успех", но ничего не делаем
  if (lead._honeypotTriggered) {
    return json(200, { ok: true });
  }

  try {
    await Promise.all([
      sendTelegramLead(lead),
      sendEmailLead(lead)
    ]);
    return json(200, { ok: true });
  } catch (err) {
    console.error("❌ Lead send error:", err);
    return json(500, { ok: false });
  }
}
