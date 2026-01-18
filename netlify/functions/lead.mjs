import nodemailer from "nodemailer";

/** ---------------- Helpers ---------------- */

function digitsOnly(s) {
  return String(s || "").replace(/\D/g, "");
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

function formatPrettyDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
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

function json(statusCode, obj, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    },
    body: JSON.stringify(obj)
  };
}

function corsHeaders() {
  // Можно ограничить доменом, но пока пусть будет так (быстрее запустить)
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

/** ---------------- Telegram ---------------- */

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

/** ---------------- Email (SMTP) ---------------- */

function mailConfigured() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_TO &&
    process.env.MAIL_FROM
  );
}

async function sendEmailLead(lead) {
  if (!mailConfigured()) return;

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

  const subject =
    `Новая заявка${serviceTitle ? `: ${serviceTitle}` : ""} — ${lead.name || "без имени"} (${lead.phone || "без телефона"})`;

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

/** ---------------- Handler ---------------- */

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false }, corsHeaders());
  }

  let b = {};
  try {
    b = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Bad JSON" }, corsHeaders());
  }

  const lead = {
    popup_id: String(b.popup_id || "").trim(),
    tag: String(b.tag || "").trim(),
    name: String(b.name || "").trim(),
    phone: String(b.phone || "").trim(),
    page: String(b.page || "").trim(),
    ua: String(b.ua || "").trim(),
    wish: String(b.wish || b.comment || "").trim(),
    createdAt: new Date().toISOString()
  };

  // Honeypot (антиспам)
  const hpField = String(process.env.HONEYPOT_FIELD || "company").trim();
  const hpValue = String(b[hpField] || "").trim();
  const honeypotTriggered = hpValue.length > 0;

  if (!honeypotTriggered) {
    if (lead.name.length < 2) return json(400, { ok: false, error: "Bad name" }, corsHeaders());
    const phoneDigits = digitsOnly(lead.phone);
    if (phoneDigits.length < 10) return json(400, { ok: false, error: "Bad phone" }, corsHeaders());
  } else {
    // спам — делаем вид, что всё ок
    return json(200, { ok: true }, corsHeaders());
  }

  try {
    await Promise.all([sendTelegramLead(lead), sendEmailLead(lead)]);
    return json(200, { ok: true }, corsHeaders());
  } catch (e) {
    console.error("Lead error:", e);
    return json(500, { ok: false }, corsHeaders());
  }
}
