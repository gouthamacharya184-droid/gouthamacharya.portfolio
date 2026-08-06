import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/config.js";
import { escapeHtml } from "../config/validation.js";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MESSAGES_FILE = path.join(__dirname, "../scratch/contact_messages.json");

// Async file write helper so message saving doesn't block the event loop.
async function saveMessageToFile(messageData) {
  try {
    const dir = path.dirname(MESSAGES_FILE);
    await fs.promises.mkdir(dir, { recursive: true });

    let existing = [];
    try {
      const raw = await fs.promises.readFile(MESSAGES_FILE, "utf-8");
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }

    existing.push({
      ...messageData,
      receivedAt: new Date().toISOString(),
    });

    await fs.promises.writeFile(MESSAGES_FILE, JSON.stringify(existing, null, 2), "utf-8");
    logger.info({ type: "contact_message_saved_locally", email: messageData.email });
    return true;
  } catch (err) {
    logger.error({ type: "save_message_failed", err: err.message });
    return false;
  }
}

function buildTransport() {
  if (!config.smtpConfigured || !config.smtp) return null;

  const portNum = Number(config.smtp.port) || 465;
  const isSecure = config.smtp.secure !== undefined ? config.smtp.secure : portNum === 465;

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: portNum,
    secure: isSecure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    connectionTimeout: 15_000,
    greetingTimeout:  10_000,
    socketTimeout:    20_000,
    pool: false,
    // CVE GHSA-r7g4: Enforce strict TLS certificate validation — never downgrade
    tls: {
      rejectUnauthorized: true,
    },
    // CVE GHSA-wqvq / GHSA-p6gq: Disable file and URL access to prevent SSRF
    disableFileAccess: true,
    disableUrlAccess:  true,
  });
}

/**
 * verifyTransport — Checks SMTP availability. Returns true if available.
 * This function never throws for missing configuration; it returns false instead.
 * Use with a timeout when called from startup to avoid blocking server boot.
 */
export async function verifyTransport() {
  const transporter = buildTransport();
  if (!transporter) {
    // SMTP not configured — caller should continue without blocking.
    return false;
  }

  // Wrap verify with a timeout to avoid long startup waits.
  const verifyPromise = transporter.verify();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("transporter_verify_timeout")), 10_000).unref()
  );

  try {
    await Promise.race([verifyPromise, timeoutPromise]);
    return true;
  } catch (err) {
    logger.warn({ type: "smtp_verify_failed", err: err?.message || String(err) });
    return false;
  }
}

export async function sendPortfolioMessage({ name, email, message }) {
  // Save message locally so data is never lost (do not await to avoid blocking request)
  // We'll still await below to ensure storage before returning in error cases.
  await saveMessageToFile({ name, email, message });

  const transporter = buildTransport();

  if (!transporter || !config.smtp || !config.recipientEmail) {
    logger.warn({ type: "mail_skipped_stored_locally", reason: "smtp_not_configured" });
    // Return a structured error rather than throwing an internal exception
    throw new Error("Email service is not configured. Message stored locally.");
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const ownerMail = {
    from: `"Portfolio Contact" <${config.smtp.user}>`,
    to: config.recipientEmail,
    replyTo: email,
    subject: `New portfolio message from ${safeName}`,
    text: [
      `Name:    ${name}`,
      `Email:   ${email}`,
      ``,
      `Message:`,
      message,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:600px">
        <h2 style="color:#0ea5e9">New Portfolio Message</h2>
        <table cellpadding="8" style="width:100%;border-collapse:collapse">
          <tr>
            <td style="font-weight:bold;width:80px">Name:</td>
            <td>${safeName}</td>
          </tr>
          <tr style="background:#f8fafc">
            <td style="font-weight:bold">Email:</td>
            <td><a href="mailto:${safeEmail}">${safeEmail}</a></td>
          </tr>
        </table>
        <p style="font-weight:bold;margin-top:16px">Message:</p>
        <p style="background:#f1f5f9;padding:12px;border-radius:6px;border-left:3px solid #0ea5e9">
          ${safeMessage}
        </p>
      </div>
    `,
  };

  const confirmationMail = {
    from: `"Goutham Acharya Portfolio" <${config.smtp.user}>`,
    to: email,
    subject: "Thanks for reaching out — message received",
    text: [
      `Hi ${name},`,
      ``,
      `Thanks for your message! I've received your note and will get back to you soon.`,
      ``,
      `Best regards,`,
      `Goutham Acharya`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:600px">
        <p>Hi ${safeName},</p>
        <p>Thanks for your message! I've received your note and will get back to you soon.</p>
        <p style="margin-top:24px">Best regards,<br /><strong>Goutham Acharya</strong></p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin-top:24px" />
        <p style="font-size:12px;color:#94a3b8">
          This is an automated confirmation. Do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(ownerMail);
    logger.info({ type: "mail_sent", recipient: "owner" });
    try {
      await transporter.sendMail(confirmationMail);
      logger.info({ type: "mail_sent", recipient: "sender" });
    } catch (err) {
      logger.warn({ type: "mail_warn", recipient: "sender_confirmation", err: err.message });
    }
    return { status: "sent", emailSent: true };
  } catch (err) {
    logger.error({ type: "mail_error", recipient: "owner", err: err.message });
    let friendlyReason = err.message;
    if (err.message.includes("535") || err.message.includes("BadCredentials") || err.message.includes("Username and Password not accepted")) {
      friendlyReason = "Gmail SMTP authentication failed (535 Bad Credentials). Please update SMTP_PASS in backend/.env with a valid 16-character Gmail App Password.";
    }
    throw new Error(friendlyReason);
  }
}
