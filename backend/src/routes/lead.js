import express from "express";
import { leadRateLimiter } from "../middleware/rateLimit.js";
import { validateLead } from "../middleware/validateLead.js";
import { sendTelegramLead } from "../services/telegram.js";
import { sendEmailLead } from "../services/mailer.js";

export const leadRouter = express.Router();

/**
 * POST /api/lead
 * body: { popup_id, tag, name, phone, page, ua, ...honeypot? }
 */
leadRouter.post("/lead", leadRateLimiter, validateLead, async (req, res) => {
  const lead = req.lead; // подготовленный объект из validateLead

  // honeypot triggered => молча "успех", но ничего не делаем
  if (lead._honeypotTriggered) {
    return res.json({ ok: true });
  }

  try {
    await Promise.all([
      sendTelegramLead(lead),
      sendEmailLead(lead),
    ]);

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ Lead send error:", err);
    // фронту лучше не палить детали
    return res.status(500).json({ ok: false });
  }
});
