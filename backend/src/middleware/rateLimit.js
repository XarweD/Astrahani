import rateLimit from "express-rate-limit";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const max = Number(process.env.RATE_LIMIT_MAX || 10);

export const leadRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests" }
});
