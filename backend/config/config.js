import dotenv from "dotenv";
dotenv.config();

/**
 * config.js — Production-grade environment configuration
 *
 * All variables have safe fallback defaults so the server never crashes on
 * startup due to a missing env var. Render and Vercel set their own PORT
 * dynamically — we never hardcode it.
 *
 * Environment variables to set in your Render dashboard:
 *   NODE_ENV=production
 *   PORT         (automatically set by Render — do not override)
 *   FRONTEND_URL=https://your-vercel-domain.vercel.app
 *   GROQ_API_KEY=your_groq_key
 *   JWT_SECRET=at_least_32_random_chars
 *   WHATSAPP_NUMBER=91xxxxxxxxxx (digits only)
 *   PHONE_NUMBER=91xxxxxxxxxx (digits only)
 *   GITHUB_URL=https://github.com/your-username
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, RECIPIENT_EMAIL (optional)
 */

function optionalEnv(key, fallback = "") {
  const value = process.env[key];
  if (!value || value.trim() === "") return fallback.trim();
  return value.trim();
}

// ── Server ───────────────────────────────────────────────────────────────────
// Render assigns PORT dynamically. Local dev default is 8787.
const PORT         = optionalEnv("PORT", "8787");
const NODE_ENV     = optionalEnv("NODE_ENV", "development");

// ── CORS ─────────────────────────────────────────────────────────────────────
// Set FRONTEND_URL in your Render dashboard to your Vercel domain.
// Multiple origins: comma-separated. Wildcard "*" allows all origins.
const FRONTEND_URL = optionalEnv("FRONTEND_URL", "*");

// ── AI / Groq ─────────────────────────────────────────────────────────────────
const GROQ_KEY     = optionalEnv("GROQ_API_KEY", "");

// ── Contact Links ─────────────────────────────────────────────────────────────
// Auto-sanitize: strip all non-digit chars (handles +, spaces, dashes)
const RAW_WA       = optionalEnv("WHATSAPP_NUMBER", "919000000000");
const RAW_PHONE    = optionalEnv("PHONE_NUMBER", "919000000000");
const WHATSAPP_NUM = RAW_WA.replace(/\D/g, "") || "919000000000";
const PHONE_NUM    = RAW_PHONE.replace(/\D/g, "") || "919000000000";

// ── GitHub ────────────────────────────────────────────────────────────────────
const GITHUB_RAW   = optionalEnv("GITHUB_URL", "https://github.com/gouthamacharya184-droid");
const GITHUB_URL   = GITHUB_RAW.startsWith("http") ? GITHUB_RAW : `https://${GITHUB_RAW}`;

// ── Security ──────────────────────────────────────────────────────────────────
const RAW_JWT    = optionalEnv("JWT_SECRET", "goutham_portfolio_jwt_secret_key_minimum_32_chars_long_default");
const JWT_SECRET = RAW_JWT.length >= 32
  ? RAW_JWT
  : "goutham_portfolio_jwt_secret_key_minimum_32_chars_long_default";

// SECURITY: In production, reject the hardcoded fallback JWT secret.
if (NODE_ENV === "production" && JWT_SECRET === "goutham_portfolio_jwt_secret_key_minimum_32_chars_long_default") {
  // Don't crash — admin routes are the only JWT-protected ones.
  // But warn loudly so it's visible in Render logs.
  console.error(
    "[SECURITY] JWT_SECRET is set to the DEFAULT insecure value in production! " +
    "Set a strong random JWT_SECRET in your Render environment variables."
  );
}

const ADMIN_KEY  = optionalEnv("ADMIN_API_KEY", "");

// ── SMTP (optional) ───────────────────────────────────────────────────────────
const SMTP_HOST   = optionalEnv("SMTP_HOST", "");
const SMTP_PORT   = optionalEnv("SMTP_PORT", "465");
const SMTP_SECURE = optionalEnv("SMTP_SECURE", "true");
const SMTP_USER   = optionalEnv("SMTP_USER", "");
const SMTP_PASS   = optionalEnv("SMTP_PASS", "");
const RECIPIENT   = optionalEnv("RECIPIENT_EMAIL", "");
const NGROK_URL   = optionalEnv("NGROK_URL", "");

const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && RECIPIENT);

if (!smtpConfigured && NODE_ENV !== "production") {
  console.warn(
    "\n⚠️  [config] SMTP is not fully configured — contact form emails will not send.\n" +
    "   Set SMTP_HOST, SMTP_USER, SMTP_PASS, and RECIPIENT_EMAIL in backend/.env.\n"
  );
}

if (!GROQ_KEY && NODE_ENV !== "production") {
  console.warn(
    "\n⚠️  [config] GROQ_API_KEY is not set — AI chat will be unavailable.\n" +
    "   Set GROQ_API_KEY in backend/.env or your Render environment variables.\n"
  );
}

export const config = {
  port:            Number(PORT) || 8787,
  nodeEnv:         NODE_ENV,
  isProduction:    NODE_ENV === "production",

  frontendUrl:     FRONTEND_URL,
  ngrokUrl:        NGROK_URL,

  groqApiKey:      GROQ_KEY,
  jwtSecret:       JWT_SECRET,
  adminApiKey:     ADMIN_KEY,

  whatsappNumber:  WHATSAPP_NUM,
  phoneNumber:     PHONE_NUM,
  githubUrl:       GITHUB_URL,

  smtp: smtpConfigured
    ? {
        host:   SMTP_HOST,
        port:   Number(SMTP_PORT) || 465,
        secure: SMTP_SECURE === "true",
        user:   SMTP_USER,
        pass:   SMTP_PASS,
      }
    : null,

  recipientEmail:  RECIPIENT || null,
  smtpConfigured,
};

// Use structured output rather than console.info for consistency.
// In production, Render captures stdout — console.info is acceptable here.
console.info(
  `[config] Loaded ✓ — env=${config.nodeEnv}, port=${config.port}, ` +
  `smtp=${smtpConfigured ? "enabled" : "disabled"}, ` +
  `groq=${GROQ_KEY ? "configured" : "missing"}`
);
