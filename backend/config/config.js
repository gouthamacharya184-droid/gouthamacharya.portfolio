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
const FRONTEND_URL = optionalEnv("FRONTEND_URL", "*");
const GROQ_KEY     = optionalEnv("GROQ_API_KEY", "");
const RAW_WA       = optionalEnv("WHATSAPP_NUMBER", "919000000000");
const RAW_PHONE    = optionalEnv("PHONE_NUMBER", "919000000000");
const GITHUB_RAW   = optionalEnv("GITHUB_URL", "https://github.com/gouthamacharya184-droid");
const RAW_JWT      = optionalEnv("JWT_SECRET", "goutham_portfolio_jwt_secret_key_minimum_32_chars_long_default");

// Clean digits only for WhatsApp & Phone numbers
const WHATSAPP_NUM = RAW_WA.replace(/\D/g, "") || "919000000000";
const PHONE_NUM    = RAW_PHONE.replace(/\D/g, "") || "919000000000";

const GITHUB_URL = GITHUB_RAW.startsWith("http") ? GITHUB_RAW : `https://${GITHUB_RAW}`;

const JWT_SECRET = RAW_JWT.length >= 32
  ? RAW_JWT
  : "goutham_portfolio_jwt_secret_key_minimum_32_chars_long_default";

const SMTP_HOST   = optionalEnv("SMTP_HOST");
const SMTP_PORT   = optionalEnv("SMTP_PORT", "465");
const SMTP_SECURE = optionalEnv("SMTP_SECURE", "true");
const SMTP_USER   = optionalEnv("SMTP_USER");
const SMTP_PASS   = optionalEnv("SMTP_PASS");
const RECIPIENT   = optionalEnv("RECIPIENT_EMAIL");
const NGROK_URL   = optionalEnv("NGROK_URL");
const ADMIN_KEY   = optionalEnv("ADMIN_API_KEY");

const smtpConfigured =
  SMTP_HOST && SMTP_USER && SMTP_PASS && RECIPIENT;

if (!smtpConfigured) {
  console.warn(
    "\n⚠️  [config] SMTP is not fully configured — contact form emails will not send.\n" +
    "   Set SMTP_HOST, SMTP_USER, SMTP_PASS, and RECIPIENT_EMAIL in backend/.env.\n"
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
  phoneNumber:     PHONE_NUM,
  githubUrl:       GITHUB_URL,

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
