import nodemailer from "nodemailer";

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

export async function sendEmailLead(lead) {
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
