import Groq from "groq-sdk";
import { config } from "../config/config.js";
import { logger } from "../services/logger.js";
import { chatSchema, sanitizeChatMessage } from "../config/validation.js";
import { portfolioData } from "../config/portfolio.js";

const groq = new Groq({ apiKey: config.groqApiKey });

const PORTFOLIO_CONTEXT = `
[GOUTHAM ACHARYA - RESUME & PORTFOLIO KNOWLEDGE BASE]
- Name: ${portfolioData.profile.name}
- Current Role / Title: ${portfolioData.profile.title}
- Objective: ${portfolioData.profile.objective}
- Location: ${portfolioData.profile.location}
- Contact Email: ${portfolioData.profile.displayEmail} | Phone: ${portfolioData.profile.phone}
- GitHub: ${portfolioData.profile.github}
- Live Portfolio URL: ${portfolioData.profile.portfolioUrl}
- Resume PDF Download URL: ${portfolioData.profile.resumeUrl} (also served at /api/uploads/projects/Goutham_Acharya_Resume.pdf)

[EDUCATION]
1. B.E. in Artificial Intelligence & Machine Learning (AIML)
   - Institution: Moodlakatte Institute of Technology
   - Timeline: 2023 - 2027 (Expected Graduation 2027, 3rd Year) | SGPA: 7.86
2. Diploma in Mechanical Engineering
   - Institution: Government Polytechnic Udupi
   - Timeline: 2021 - 2024 (Completed) | CGPA: 7.26

[TECHNICAL SKILLS]
- Programming: Python, RESTful APIs, API Integration
- Libraries & Frameworks: Pandas, NumPy, Matplotlib, Scikit-learn, FastAPI, Streamlit, LangChain
- AI / ML / NLP: Machine Learning, Data Preprocessing, Model Training, NLP & Text Processing, Retrieval-Augmented Generation (RAG), Large Language Models (LLMs), Prompt Engineering, Vector Databases
- Tools & Environment: Antigravity, Google Colab, Jupyter, Workflow Automation

[KEY PROJECTS]
1. Personal Portfolio Website
   - Stack: React, Tailwind CSS, Vite, Node.js, Express REST API
   - Summary: Responsive personal portfolio with modern glassmorphism UI, interactive components, and secure backend API.
2. LLM Hallucination Detection
   - Stack: Python, RAG, Brave Search, LangChain, LLM APIs
   - Summary: Integrates multiple LLM APIs, uses RAG with Brave Search for live factual web verification, and measures hallucination rates across models.
3. Legal AI Assistant (Chatbot)
   - Stack: Gemini API, Python, RAG, Prompt Engineering, NLP
   - Summary: Conversational AI legal assistant providing plain-language explanations of legal terms, document procedures, and legal concepts.
4. Data Analysis using Python
   - Stack: Python, Pandas, NumPy, Matplotlib, EDA
   - Summary: Tabular data preprocessing, exploratory data analysis (EDA), and insight-driven visualizations.
`;

const SYSTEM_PROMPT = `[CRITICAL: LANGUAGE CONSTRAINT]
- The chatbot MUST respond EXCLUSIVELY in English.
- Under NO circumstances should the chatbot reply in Hindi, Kannada, Spanish, French, or any other language except English.
- If the user writes in a language other than English (e.g., Kannada, Hindi, Spanish, French, etc.), the chatbot MUST translate the query to English internally, and write the entire output response SOLELY in English.
- Non-English character sets and scripts are strictly forbidden in the response.

You are the official AI Portfolio Assistant for Goutham Acharya. You deliver intelligent, accurate, detailed, and professional responses based on Goutham's portfolio and resume background.

${PORTFOLIO_CONTEXT}

When users ask about Goutham Acharya's education, skills, projects, contact info, or resume, use the above exact background to answer confidently and professionally. You explain complex technical concepts simply while maintaining expert insight.

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
