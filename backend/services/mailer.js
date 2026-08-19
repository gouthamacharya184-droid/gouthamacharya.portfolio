import nodemailer from "nodemailer";
import { config }    from "../config/config.js";
import { escapeHtml } from "../config/validation.js";
import { logger }    from "./logger.js";

function buildTransport() {
  if (!config.smtpConfigured || !config.smtp) return null;

  return nodemailer.createTransport({
    host:   config.smtp.host,
    port:   config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout:   5_000,
    socketTimeout:     15_000,
    pool: false,
  });
}

const transporter = buildTransport();

export async function verifyTransport() {
  if (!transporter) {
    throw new Error("SMTP is not configured.");
  }
  await transporter.verify();
}

export async function sendPortfolioMessage({ name, email, message }) {
  if (!transporter || !config.smtp || !config.recipientEmail) {
    logger.warn({ type: "mail_skipped", reason: "smtp_not_configured" });
    throw new Error("Email service is not available right now.");
  }

  const safeName    = escapeHtml(name);
  const safeEmail   = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const ownerMail = {
    from:    `"Portfolio Contact" <${config.smtp.user}>`,
    to:      config.recipientEmail,
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
    from:    `"Goutham Acharya Portfolio" <${config.smtp.user}>`,
    to:      email,
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
  } catch (err) {
    logger.error({ type: "mail_error", recipient: "owner", err });
    throw new Error("Failed to deliver your message. Please try again later.");
  }

  try {
    await transporter.sendMail(confirmationMail);
    logger.info({ type: "mail_sent", recipient: "sender" });
  } catch (err) {
    logger.warn({ type: "mail_warn", recipient: "sender_confirmation", err });
  }
}
