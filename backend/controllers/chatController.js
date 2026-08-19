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

function generatePortfolioFallbackResponse(query) {
  const q = query.toLowerCase();

  if (q.includes("resume") || q.includes("cv") || q.includes("download") || q.includes("pdf")) {
    return `You can view and download Goutham Acharya's updated resume directly using the link below:\n\n📄 **[Download Goutham Acharya's Resume (PDF)](${portfolioData.profile.resumeUrl})**\n\n**Quick Summary:**\n- **Target Role:** Automation Developer Intern / AIML Engineer\n- **Education:** 3rd Year B.E. in AIML at Moodlakatte Institute of Technology (SGPA: 7.86)\n- **Key Skills:** Python, LangChain, RAG, LLMs, Streamlit, FastAPI, Data Preprocessing, Vector DBs`;
  }

  if (q.includes("education") || q.includes("college") || q.includes("degree") || q.includes("sgpa") || q.includes("marks") || q.includes("cgpa") || q.includes("study") || q.includes("studying")) {
    return `**Goutham Acharya's Educational Background:**\n\n1. **Bachelor of Engineering (B.E.) in Artificial Intelligence & Machine Learning (AIML)**\n   - **Institution:** Moodlakatte Institute of Technology\n   - **Timeline:** 2023 - 2027 (Currently in 3rd Year / Expected 2027)\n   - **SGPA:** 7.86\n\n2. **Diploma in Mechanical Engineering**\n   - **Institution:** Government Polytechnic Udupi\n   - **Timeline:** 2021 - 2024 (Completed)\n   - **CGPA:** 7.26`;
  }

  if (q.includes("project") || q.includes("build") || q.includes("work") || q.includes("portfolio") || q.includes("hallucination") || q.includes("legal") || q.includes("analysis")) {
    return `**Key Projects Built by Goutham Acharya:**\n\n1. **Personal Portfolio Website**\n   - **Tech Stack:** React, Tailwind CSS, Vite, Node.js, Express REST API\n   - **Details:** Built a responsive modern UI showcasing projects, skills, certifications, and contact options with dynamic backend APIs.\n\n2. **LLM Hallucination Detection**\n   - **Tech Stack:** Python, RAG, Brave Search, LangChain, LLM APIs\n   - **Details:** Integrates multiple LLMs, uses live web retrieval via Brave Search to verify responses against trusted sources, and measures factual accuracy.\n\n3. **Legal AI Assistant (Chatbot)**\n   - **Tech Stack:** Gemini API, Python, RAG, Prompt Engineering, NLP\n   - **Details:** AI-powered legal assistant that answers legal queries, simplifies legal jargon, and helps users understand legal documents.\n\n4. **Data Analysis using Python**\n   - **Tech Stack:** Python, Pandas, NumPy, Matplotlib, EDA\n   - **Details:** Preprocessed tabular datasets, performed exploratory data analysis, and created visual summaries for data-driven insights.`;
  }

  if (q.includes("skill") || q.includes("python") || q.includes("langchain") || q.includes("rag") || q.includes("stack") || q.includes("tool") || q.includes("framework")) {
    return `**Goutham Acharya's Technical Skill Set:**\n\n- **Programming:** Python, RESTful APIs, API Integration\n- **Libraries & Frameworks:** Pandas, NumPy, Matplotlib, Scikit-learn, FastAPI, Streamlit, LangChain\n- **AI / ML & NLP:** Machine Learning, Data Preprocessing, Model Training, NLP, Retrieval-Augmented Generation (RAG), LLMs, Prompt Engineering, Vector Databases\n- **Developer Tools:** Antigravity, Google Colab, Jupyter Notebooks, Workflow Automation`;
  }

  if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("hire") || q.includes("intern") || q.includes("github") || q.includes("reach")) {
    return `**Get in Touch with Goutham Acharya:**\n\n- **Email:** [gouthamacharya184@gmail.com](mailto:gouthamacharya184@gmail.com)\n- **Phone:** +91 7619573468\n- **GitHub:** [github.com/gouthamacharya184-droid](https://github.com/gouthamacharya184-droid)\n- **Portfolio:** [gouthamacharya.vercel.app](https://gouthamacharya.vercel.app/)\n- **Location:** Udupi, Karnataka, India\n- **Status:** Open for Automation Developer & AI Engineering Internships!`;
  }

  return `Hello! I am Goutham Acharya's AI Portfolio Assistant.\n\nGoutham is an AIML engineering student (3rd Year, SGPA 7.86) specializing in **Python, LLMs, RAG pipelines, LangChain, AI Agents, and Workflow Automation**.\n\nHere is what you can ask me about:\n- 🎓 **Education & Academic Record**\n- 🚀 **Projects & AI Applications**\n- 🛠️ **Technical Skills & Tools**\n- 📄 **Resume / CV Download**\n- 📬 **Contact Info & Internship Availability**\n\nHow can I assist you today?`;
}

export const getChatStatus = async (req, res) => {
  const isMaintenanceMode = req.app.locals.isMaintenanceMode || false;
  if (isMaintenanceMode) {
    return res.status(503).json({ status: "offline", reason: "maintenance" });
  }

  try {
    await groq.chat.completions.create({
      messages: [{ role: "user", content: "ping" }],
      model: GROQ_MODELS[0],
      max_tokens: 1,
    });
    return res.status(200).json({ status: "online", provider: "groq" });
  } catch (error) {
    logger.warn({ type: "ai_status_check_fallback", msg: error.message });
    // Always return online so the assistant remains functional via Portfolio Knowledge engine
    return res.status(200).json({ status: "online", provider: "portfolio_engine" });
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

  const rawMessage       = result.data.message;
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

  // Fallback to Portfolio Knowledge Engine stream
  try {
    const fallbackText = generatePortfolioFallbackResponse(sanitizedMessage);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-AI-Model", "portfolio-knowledge-engine");

    const chunks = fallbackText.match(/.{1,20}/g) || [fallbackText];
    for (const chunk of chunks) {
      res.write(chunk);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    res.end();
  } catch (err) {
    logger.error({ type: "ai_fallback_failed", msg: err.message });
    if (!res.headersSent) {
      res.status(500).json({ ok: false, message: "Error processing chat." });
    } else {
      res.end();
    }
  }
};

