import Groq from "groq-sdk";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "groq/compound-mini",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
];

export const config = {
  maxDuration: 15,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const xaiApiKey = process.env.XAI_API_KEY?.trim();
  const groqApiKey = process.env.GROQ_API_KEY?.trim();

  if (!xaiApiKey && !groqApiKey) {
    return res.status(503).json({
      status: "offline",
      reason: "missing_api_key",
      message: "Neither XAI_API_KEY nor GROQ_API_KEY is configured in Vercel environment variables.",
    });
  }

  // Check xAI Grok API
  if (xaiApiKey) {
    try {
      const response = await fetch(XAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${xaiApiKey}`,
        },
        body: JSON.stringify({
          model: "grok-2-latest",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
      });

      if (response.ok) {
        return res.status(200).json({
          status: "online",
          provider: "xai-grok",
          model: "grok-2-latest",
        });
      }
    } catch (err) {
      console.warn("[xAI status check error]:", err.message);
    }
  }

  // Check Groq API
  if (groqApiKey) {
    const groq = new Groq({ apiKey: groqApiKey });
    for (const model of GROQ_MODELS) {
      try {
        await groq.chat.completions.create({
          messages: [{ role: "user", content: "ping" }],
          model,
          max_tokens: 1,
        });
        return res.status(200).json({
          status: "online",
          provider: "groq",
          model,
        });
      } catch (err) {
        const isAuthErr = err.status === 401 || err.statusCode === 401;
        if (isAuthErr) break;
      }
    }
  }

  return res.status(503).json({
    status: "offline",
    reason: "api_unavailable",
    message: "AI model service could not be reached.",
  });
}
