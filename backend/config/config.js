import dotenv from "dotenv";
dotenv.config();

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[config] Missing required environment variable: ${key}\n` +
      `  → Copy backend/.env.example to backend/.env and fill in the value.`
    );
  }
  return value.trim();
}

function optionalEnv(key, fallback = "") {
  return (process.env[key] || fallback).trim();
}

const PORT         = optionalEnv("PORT", "8787");
const FRONTEND_URL = optionalEnv("FRONTEND_URL", "https://gouthamacharya.vercel.app");
const GROQ_KEY     = optionalEnv("GROQ_API_KEY", "");
const WHATSAPP_NUM = optionalEnv("WHATSAPP_NUMBER", "7619573468");
const GITHUB_RAW   = optionalEnv("GITHUB_URL", "https://github.com/gouthamacharya184-droid");

// ⚠️ SECURITY: JWT_SECRET must be set as an environment variable.
// A previously hardcoded fallback was removed — it was in git history and must be treated as compromised.
// Set a new value in Render: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
const JWT_SECRET   = optionalEnv("JWT_SECRET", "");
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error(
    "[config] CRITICAL: JWT_SECRET is not set or too short. Admin endpoints are disabled until this is fixed.\n" +
    "  Generate: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n" +
    "  Set it in Render Dashboard → Environment Variables."
  );
}

if (!/^\d{7,15}$/.test(WHATSAPP_NUM)) {
  console.warn(`[config] WHATSAPP_NUMBER should contain only digits (7–15 chars). Got: "${WHATSAPP_NUM.slice(0, 4)}..."`);
}

if (!GITHUB_RAW.startsWith("https://github.com/")) {
  console.warn(`[config] GITHUB_URL should start with "https://github.com/".`);
}

const SMTP_HOST   = optionalEnv("SMTP_HOST");
const SMTP_PORT   = optionalEnv("SMTP_PORT", "465");
const SMTP_SECURE = optionalEnv("SMTP_SECURE", "true");
const SMTP_USER   = optionalEnv("SMTP_USER");
const SMTP_PASS   = optionalEnv("SMTP_PASS");
const RECIPIENT   = optionalEnv("RECIPIENT_EMAIL");
const NGROK_URL   = optionalEnv("NGROK_URL");
const ADMIN_KEY   = optionalEnv("ADMIN_API_KEY");

const smtpConfigured = Boolean(
  SMTP_HOST &&
  SMTP_USER &&
  SMTP_PASS &&
  RECIPIENT &&
  SMTP_PASS !== "REPLACE_WITH_NEW_APP_PASSWORD" &&
  !SMTP_PASS.startsWith("REPLACE_")
);

if (!smtpConfigured) {
  console.warn(
    "\n⚠️  [config] SMTP is not fully configured — contact form emails will be logged safely to server logs.\n" +
    "   Set SMTP_HOST, SMTP_USER, SMTP_PASS (App Password), and RECIPIENT_EMAIL in backend/.env to enable live email delivery.\n"
  );
}

export const config = {
  port:            Number(PORT),
  nodeEnv:         optionalEnv("NODE_ENV", "development"),
  isProduction:    optionalEnv("NODE_ENV", "development") === "production",

  frontendUrl:     FRONTEND_URL,
  ngrokUrl:        NGROK_URL,

  groqApiKey:      GROQ_KEY,
  jwtSecret:       JWT_SECRET,
  adminApiKey:     ADMIN_KEY,

  whatsappNumber:  WHATSAPP_NUM,
  githubUrl:       GITHUB_RAW,

  smtp: smtpConfigured
    ? {
        host:   SMTP_HOST,
        port:   Number(SMTP_PORT),
        secure: SMTP_SECURE === "true",
        user:   SMTP_USER,
        pass:   SMTP_PASS,
      }
    : null,

  recipientEmail:  RECIPIENT || null,
  smtpConfigured,
};

console.info(`[config] Loaded ✓ — env=${config.nodeEnv}, port=${config.port}, smtp=${smtpConfigured ? "enabled" : "disabled"}`);
