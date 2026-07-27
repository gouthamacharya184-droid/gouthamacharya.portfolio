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
    await sendPortfolioMessage(result.data);
    logger.info({
      type: "contact_sent_successfully",
      email: result.data.email.replace(/(.{2}).+(@.+)/, "$1***$2"),
    });

    return res.status(200).json({
      ok: true,
      message: "Message sent! I'll get back to you soon.",
    });
  } catch (error) {
    logger.error({ type: "contact_delivery_failed", msg: error.message });
    return res.status(500).json({
      ok: false,
      message: error.message || "Failed to send email. Please check server SMTP configuration.",
    });
  }
};
