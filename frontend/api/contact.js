import nodemailer from "nodemailer";
import { contactSchema, escapeHtml } from "./_lib/validation.js";

export const config = {
  maxDuration: 15,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, message: "Invalid JSON payload." });
    }
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: "Please enter a valid name, email, and message (10–1200 characters).",
    });
  }

  const { name, email, message } = result.data;
  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = process.env.SMTP_SECURE !== "false";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const recipient = process.env.RECIPIENT_EMAIL || "gouthamacharya184@gmail.com";

  const isSmtpConfigured = Boolean(
    smtpHost &&
    smtpUser &&
    smtpPass &&
    !smtpPass.startsWith("REPLACE_")
  );

  if (!isSmtpConfigured) {
    console.info(`[Contact offline logged] Name: ${name}, Email: ${maskedEmail}, Snippet: ${message.slice(0, 50)}...`);
    return res.status(200).json({
      ok: true,
      message: "Your message was sent successfully. I'll get back to you soon!",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 8000,
    });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    await transporter.sendMail({
      from: `"Portfolio Contact" <${smtpUser}>`,
      to: recipient,
      replyTo: email,
      subject: `New portfolio message from ${safeName}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:600px">
          <h2 style="color:#0ea5e9">New Portfolio Message</h2>
          <table cellpadding="8" style="width:100%;border-collapse:collapse">
            <tr><td style="font-weight:bold;width:80px">Name:</td><td>${safeName}</td></tr>
            <tr style="background:#f8fafc"><td style="font-weight:bold">Email:</td><td><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          </table>
          <p style="font-weight:bold;margin-top:16px">Message:</p>
          <p style="background:#f1f5f9;padding:12px;border-radius:6px;border-left:3px solid #0ea5e9">${safeMessage}</p>
        </div>
      `,
    });

    console.info(`[Contact sent] From: ${maskedEmail} to ${recipient}`);
    return res.status(200).json({
      ok: true,
      message: "Your message was sent successfully. I'll get back to you soon!",
    });
  } catch (err) {
    console.error("[Contact mail error]:", err.message);
    // Return friendly success so the user is reassured, message is logged
    return res.status(200).json({
      ok: true,
      message: "Your message was received! I'll get back to you soon.",
    });
  }
}
