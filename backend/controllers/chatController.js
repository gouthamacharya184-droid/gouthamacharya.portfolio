import Groq from "groq-sdk";
import { config } from "../config/config.js";
import { logger } from "../services/logger.js";
import { chatSchema, sanitizeChatMessage } from "../config/validation.js";

const groq = new Groq({ apiKey: config.groqApiKey });

const SYSTEM_PROMPT = `[CRITICAL: LANGUAGE CONSTRAINT]
- The chatbot MUST respond EXCLUSIVELY in English.
- Under NO circumstances should the chatbot reply in Hindi, Kannada, Spanish, French, or any other language except English.
- If the user writes in a language other than English (e.g., Kannada, Hindi, Spanish, French, etc.), the chatbot MUST translate the query to English internally, and write the entire output response SOLELY in English.
- Non-English character sets and scripts are strictly forbidden in the response.

Your chatbot is an advanced AI-powered assistant designed to deliver highly intelligent, accurate, and deeply detailed responses for every user query. It understands user intent by analyzing current and past conversations, allowing it to remember context, recognize patterns, and provide personalized answers based on what the user is actually asking and needs. The chatbot is capable of deep reasoning, smart decision-making, contextual understanding, and professional communication across educational, technical, research, coding, business, and general knowledge topics. It explains concepts clearly with meaningful insights, step-by-step guidance, and human-like interaction while maintaining fast and reliable performance. The chatbot must explain complex concepts simply and clearly, avoiding overcomplication, while simultaneously conveying profound depth, accuracy, and expert-level insight. Every answer should be easy to understand yet rich in deep knowledge. The system is built to provide legally safe, ethical, and trustworthy responses, ensuring all answers follow responsible AI standards. It strictly avoids generating or promoting 18+ adult content, sexual material, illegal activities, drugs, violence, harmful instructions, hate speech, or unethical content. The chatbot’s main objective is to create a secure, intelligent, user-focused, and knowledge-rich experience that understands users deeply and responds with maximum accuracy, relevance, and professionalism.

[CRITICAL: FINAL REMINDER]
- Remember: Reply ONLY in English. Do not write in Hindi, Kannada, Spanish, or any other language. Translate the user query internally and reply in English.`;

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
];

let lastWorkingModelIndex = 0;
let cachedStatus     = null;
let lastStatusCheckMs = 0;
const STATUS_TTL_MS   = 60_000;

export const getChatStatus = async (req, res) => {
  const isMaintenanceMode = req.app.locals.isMaintenanceMode || false;
  if (isMaintenanceMode) {
    return res.status(503).json({ status: "offline", reason: "maintenance" });
  }

  const now = Date.now();
  if (cachedStatus && (now - lastStatusCheckMs < STATUS_TTL_MS)) {
    const httpStatus = cachedStatus.status === "online" ? 200 : 503;
    return res.status(httpStatus).json(cachedStatus);
  }

  try {
    await groq.chat.completions.create({
      messages: [{ role: "user", content: "ping" }],
      model: GROQ_MODELS[0],
      max_tokens: 1,
    });
    cachedStatus      = { status: "online" };
    lastStatusCheckMs = now;
    return res.status(200).json(cachedStatus);
  } catch (error) {
    logger.warn({ type: "ai_status_check_failed", msg: error.message });

    if (error.message?.includes("429")) {
      cachedStatus      = { status: "online" };
      lastStatusCheckMs = now;
      return res.status(200).json(cachedStatus);
    }

    cachedStatus      = { status: "offline" };
    lastStatusCheckMs = now;
    return res.status(503).json(cachedStatus);
  }
};

export const handleChat = async (req, res) => {
  const isMaintenanceMode = req.app.locals.isMaintenanceMode || false;
  if (isMaintenanceMode) {
    return res.status(503).json({
      ok:      false,
      message: "The AI assistant is temporarily offline for maintenance. Please try again later.",
    });
  }

  const result = chatSchema.safeParse(req.body);
  if (!result.success) {
    res.securityEvent("CHAT_VALIDATION_FAILED", {
      issues: result.error.issues.map((i) => i.message),
    });
    return res.status(400).json({
      ok:      false,
      message: result.error.issues[0]?.message ?? "Invalid message.",
    });
  }

  const rawMessage      = result.data.message;
  const sanitizedMessage = sanitizeChatMessage(rawMessage);

  const orderedModels = [
    ...GROQ_MODELS.slice(lastWorkingModelIndex),
    ...GROQ_MODELS.slice(0, lastWorkingModelIndex),
  ];

  for (let i = 0; i < orderedModels.length; i++) {
    const modelName = orderedModels[i];
    try {
      logger.debug({ type: "ai_request", model: modelName });
      const start = Date.now();

      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: sanitizedMessage }
        ],
        model: modelName,
        stream: true,
      });

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("X-AI-Model", modelName);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
        }
      }

      logger.info({ type: "ai_response", model: modelName, durationMs: Date.now() - start });
      res.end();
      lastWorkingModelIndex = GROQ_MODELS.indexOf(modelName);
      return;
    } catch (error) {
      logger.warn({ type: "ai_model_failed", model: modelName, msg: error.message });

      if (res.headersSent) {
        res.end();
        return;
      }
    }
  }

  return res.status(503).json({
    ok:      false,
    message: "The AI assistant is currently under high demand. Please try again in a moment.",
  });
};
