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

const PORT         = requireEnv("PORT");
const FRONTEND_URL = requireEnv("FRONTEND_URL");
const GROQ_KEY     = requireEnv("GROQ_API_KEY");
const WHATSAPP_NUM = requireEnv("WHATSAPP_NUMBER");
const GITHUB_RAW   = requireEnv("GITHUB_URL");
const JWT_SECRET   = requireEnv("JWT_SECRET");

if (!/^\d{7,15}$/.test(WHATSAPP_NUM)) {
  throw new Error(
    `[config] WHATSAPP_NUMBER must contain only digits (7–15 chars). ` +
    `Got: "${WHATSAPP_NUM.slice(0, 4)}..." — remove any +, spaces, or country code prefix.`
  );
}

if (!GITHUB_RAW.startsWith("https://github.com/")) {
  throw new Error(
    `[config] GITHUB_URL must start with "https://github.com/". ` +
    `Got a value that does not match. Check your .env file.`
  );
}

if (JWT_SECRET.length < 32) {
  throw new Error(
    `[config] JWT_SECRET is too short (${JWT_SECRET.length} chars). ` +
    `Use at least 32 characters. Generate with:\n` +
    `  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  );
}

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
