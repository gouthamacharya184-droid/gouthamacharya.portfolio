import Groq from "groq-sdk";
import { config } from "../config/config.js";
import { logger } from "../services/logger.js";
import { chatSchema, sanitizeChatMessage } from "../config/validation.js";
import { buildSystemPromptWithContext, getKnowledgeFallbackResponse } from "../services/knowledgeBase.js";

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama-3.2-3b-preview",
  "llama-3.2-1b-preview",
];

let lastWorkingModelIndex = 0;

export const getChatStatus = async (req, res) => {
  const isMaintenanceMode = req.app.locals.isMaintenanceMode || false;
  if (isMaintenanceMode) {
    return res.status(503).json({ status: "offline", reason: "maintenance" });
  }

  // Instantly return online status (HTTP 200) without blocking on Groq API ping
  return res.status(200).json({ status: "online", hasApiKey: Boolean(config.groqApiKey) });
};

export const handleChat = async (req, res) => {
  const isMaintenanceMode = req.app.locals.isMaintenanceMode || false;
  if (isMaintenanceMode) {
    return res.status(503).json({
      ok: false,
      message: "The AI assistant is temporarily offline for maintenance. Please try again later.",
    });
  }

  const result = chatSchema.safeParse(req.body);
  if (!result.success) {
    res.securityEvent?.("CHAT_VALIDATION_FAILED", {
      issues: result.error.issues.map((i) => i.message),
    });
    return res.status(400).json({
      ok: false,
      message: result.error.issues[0]?.message ?? "Invalid message.",
    });
  }

  const { message: rawMessage, history = [] } = result.data;
  const sanitizedMessage = sanitizeChatMessage(rawMessage);

  if (!sanitizedMessage) {
    return res.status(400).json({
      ok: false,
      message: "Message content cannot be blank.",
    });
  }

  // Format valid history entries (max 10 recent messages)
  const formattedHistory = (history || [])
    .slice(-10)
    .filter((h) => h.content && typeof h.content === "string")
    .map((h) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: sanitizeChatMessage(h.content),
    }));

  // Construct system prompt containing RAG portfolio context
  const systemPrompt = buildSystemPromptWithContext(sanitizedMessage, formattedHistory);

  const messagesPayload = [
    { role: "system", content: systemPrompt },
    ...formattedHistory,
    { role: "user", content: sanitizedMessage },
  ];

  // Try streaming via Groq if API key is present
  if (config.groqApiKey) {
    try {
      const groq = new Groq({ apiKey: config.groqApiKey });
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
            messages: messagesPayload,
            model: modelName,
            stream: true,
            temperature: 0.6,
            max_tokens: 1500,
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
            res.write("\n\n[Response stream interrupted. Please try again.]");
            res.end();
            return;
          }
        }
      }
    } catch (err) {
      logger.error({ type: "groq_init_failed", msg: err.message });
    }
  }

  // Fallback if Groq API is missing, rate-limited, or unavailable:
  // Stream structured portfolio knowledge answer seamlessly
  const fallbackAnswer = getKnowledgeFallbackResponse(sanitizedMessage);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-AI-Model", "portfolio-knowledge-base");
  return res.status(200).send(fallbackAnswer);
};
