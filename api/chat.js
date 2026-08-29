import Groq from "groq-sdk";
import { chatSchema, sanitizeChatMessage } from "./_lib/validation.js";
import { SYSTEM_PROMPT } from "./_lib/systemPrompt.js";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const XAI_MODELS = ["grok-2-latest", "grok-beta", "grok-2"];

const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "groq/compound-mini",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
];

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "Portfolio AI Chatbot API",
      status: "online",
      provider: process.env.XAI_API_KEY ? "xai-grok" : (process.env.GROQ_API_KEY ? "groq" : "unconfigured"),
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const xaiApiKey = process.env.XAI_API_KEY?.trim();
  const groqApiKey = process.env.GROQ_API_KEY?.trim();

  if (!xaiApiKey && !groqApiKey) {
    return res.status(503).json({
      ok: false,
      message: "AI assistant service is not configured. Please set XAI_API_KEY or GROQ_API_KEY in environment variables.",
    });
  }

  // Parse and validate request body
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, message: "Invalid JSON body." });
    }
  }

  const result = chatSchema.safeParse(body);
  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: result.error.issues[0]?.message ?? "Invalid message.",
    });
  }

  const rawMessage = result.data.message;
  const sanitizedMessage = sanitizeChatMessage(rawMessage);

  // Build conversation message list
  const messages = [{ role: "system", content: SYSTEM_PROMPT }];

  if (Array.isArray(body?.history) && body.history.length > 0) {
    for (const item of body.history.slice(-6)) {
      if (item && typeof item.content === "string" && (item.role === "user" || item.role === "assistant")) {
        messages.push({
          role: item.role,
          content: sanitizeChatMessage(item.content),
        });
      }
    }
  }

  messages.push({ role: "user", content: sanitizedMessage });

  // 1. Try xAI Grok API if XAI_API_KEY is configured
  if (xaiApiKey) {
    for (const modelName of XAI_MODELS) {
      try {
        const response = await fetch(XAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${xaiApiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            stream: true,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          console.warn(`[xAI] Model ${modelName} returned status ${response.status}:`, errText);
          continue;
        }

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("X-AI-Provider", "xai-grok");
        res.setHeader("X-AI-Model", modelName);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (trimmed.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  res.write(content);
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        res.end();
        return;
      } catch (err) {
        console.warn(`[xAI] Request to ${modelName} failed:`, err.message);
        if (res.headersSent) {
          res.end();
          return;
        }
      }
    }
  }

  // 2. Fallback to Groq API if GROQ_API_KEY is configured
  if (groqApiKey) {
    const groq = new Groq({ apiKey: groqApiKey });
    for (const modelName of GROQ_MODELS) {
      try {
        const stream = await groq.chat.completions.create({
          messages,
          model: modelName,
          stream: true,
        });

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("X-AI-Provider", "groq");
        res.setHeader("X-AI-Model", modelName);

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            res.write(content);
          }
        }

        res.end();
        return;
      } catch (err) {
        console.warn(`[Groq] Model ${modelName} failed:`, err.message);
        if (res.headersSent) {
          res.end();
          return;
        }
      }
    }
  }

  return res.status(503).json({
    ok: false,
    message: "The AI assistant service is currently unavailable. Please try again later.",
  });
}
