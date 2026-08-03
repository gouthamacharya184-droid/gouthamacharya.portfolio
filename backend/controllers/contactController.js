import { logger } from "../services/logger.js";
import { sendPortfolioMessage } from "../services/mailer.js";
import { contactSchema } from "../config/validation.js";

export const handleContact = async (req, res) => {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    res.securityEvent?.("CONTACT_VALIDATION_FAILED", {
      issues: result.error.issues.map((i) => i.message),
    });
    return res.status(400).json({
      ok: false,
      message: "Please enter a valid name, email, and message (10–1200 characters).",
    });
  }

  try {
    const result_data = result.data;
    await sendPortfolioMessage(result_data);
    logger.info({
      type: "contact_sent_successfully",
      email: result_data.email.replace(/(.{2}).+(@.+)/, "$1***$2"),
    });

    return res.status(200).json({
      ok: true,
      message: "Message received! Thank you for reaching out — I'll reply as soon as possible.",
    });
  } catch (error) {
    // Log the true error server-side; NEVER expose SMTP internals to the client.
    logger.error({ type: "contact_delivery_failed", msg: error.message });
    // Message is already persisted locally by mailer.js — return a graceful success
    // so visitors are not confused by SMTP failures unrelated to their submission.
    return res.status(200).json({
      ok: true,
      message: "Message received! Thank you for reaching out — I'll reply as soon as possible.",
    });
  }
};
