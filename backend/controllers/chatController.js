import Groq from "groq-sdk";
import { config } from "../config/config.js";
import { logger } from "../services/logger.js";
import { chatSchema, sanitizeChatMessage } from "../config/validation.js";
import { buildSystemPromptWithContext } from "../services/knowledgeBase.js";

const groq = new Groq({ apiKey: config.groqApiKey });

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
];

let lastWorkingModelIndex = 0;
let cachedStatus = null;
let lastStatusCheckMs = 0;
const STATUS_TTL_MS = 60_000;

export const getChatStatus = async (req, res) => {
  const isMaintenanceMode = req.app.locals.isMaintenanceMode || false;
  if (isMaintenanceMode) {
    return res.status(503).json({ status: "offline", reason: "maintenance" });
  }

  if (!config.groqApiKey) {
    return res.status(503).json({ status: "offline", reason: "missing_api_key" });
  }

  const now = Date.now();
  if (cachedStatus && (now - lastStatusCheckMs < STATUS_TTL_MS)) {
    const httpStatus = cachedStatus.status === "online" ? 200 : 503;
    return res.status(httpStatus).json(cachedStatus);
  }

  try {
    // Fast ping model with lightweight 8b instant model to avoid 70b cold start delays
    await groq.chat.completions.create({
      messages: [{ role: "user", content: "hi" }],
      model: "llama-3.1-8b-instant",
      max_tokens: 1,
    });
    cachedStatus = { status: "online" };
    lastStatusCheckMs = now;
    return res.status(200).json(cachedStatus);
  } catch (error) {
    logger.warn({ type: "ai_status_check_failed", msg: error.message });

    // 429 = rate limited → API key is valid and the service is reachable, still online
    if (error.status === 429 || error.message?.includes("429")) {
      cachedStatus = { status: "online" };
      lastStatusCheckMs = now;
      return res.status(200).json(cachedStatus);
    }

    // 401 / 403 = invalid or revoked key → permanently offline until config changes
    // 5xx / network errors = Groq service is down → temporarily offline
    // Any other error = treat as offline so the UI reflects reality
    cachedStatus = { status: "offline", reason: "ai_unreachable" };
    lastStatusCheckMs = now;
    return res.status(503).json(cachedStatus);
  }
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

  return res.status(503).json({
    ok: false,
    message: "The AI assistant is currently experiencing high demand. Please try again in a moment.",
  });
};
