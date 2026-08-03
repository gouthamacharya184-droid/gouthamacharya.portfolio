import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { portfolioData } from "../config/portfolio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SYSTEM_PROMPT_FILE = path.join(__dirname, "../config/systemPrompt.txt");

function loadMasterSystemPrompt() {
  try {
    if (fs.existsSync(SYSTEM_PROMPT_FILE)) {
      return fs.readFileSync(SYSTEM_PROMPT_FILE, "utf-8").trim();
    }
  } catch (err) {
    console.error("[knowledgeBase] Failed to load systemPrompt.txt:", err.message);
  }
  return "You are Goutham's AI Portfolio Assistant, an intelligent, professional, and highly capable conversational agent designed to represent Goutham.";
}

/**
 * Knowledge Base & RAG Context Builder for Goutham Acharya's Portfolio AI
 * 
 * Formats all structured portfolio data into comprehensive, contextual knowledge blocks.
 * Dynamically ranks and injects relevant context into the LLM system prompt based on user query.
 */

function formatProfileContext() {
  const p = portfolioData.profile || {};
  return `
### ABOUT GOUTHAM ACHARYA:
- Name: ${p.name || "Goutham Acharya"}
- Title: ${p.title || "AI Engineering & Automation Specialist"}
- Location: ${p.location || "Udupi, Karnataka, India"}
- Email: ${p.displayEmail || "gouthamacharya184@gmail.com"}
- GitHub: ${p.github || "https://github.com/gouthamacharya184-droid"}
- Summary: ${p.summary || ""}
- Career Objective: ${p.objective || ""}
- Bio: ${p.bioParagraph1 || ""} ${p.bioParagraph2 || ""}
`.trim();
}

function formatExperienceContext() {
  const exp = portfolioData.experience || [];
  if (exp.length === 0) return "";
  const items = exp.map((e) => `
- Role: ${e.role} at ${e.company} (${e.period})
  Description: ${e.description}
  Key Contributions: ${e.points ? e.points.join("; ") : ""}
`).join("\n");
  return `### WORK EXPERIENCE & LEARNING TRACK:\n${items}`.trim();
}

function formatEducationContext() {
  const edu = portfolioData.education || [];
  if (edu.length === 0) return "";
  const items = edu.map((e) => `- ${e.title} at ${e.institution} (${e.period})`).join("\n");
  return `### EDUCATION:\n${items}`.trim();
}

function formatProjectsContext() {
  const projects = portfolioData.projects || [];
  if (projects.length === 0) return "";
  const items = projects.map((p, i) => `
${i + 1}. **${p.title}**
   - Tech Stack: ${p.stack ? p.stack.join(", ") : ""}
   - Description: ${p.description}
   - Key Achievements: ${p.bullets ? p.bullets.join("; ") : ""}
   - Impact & Significance: ${p.impact || ""}
   - GitHub Repository: ${p.links?.github || "https://github.com/gouthamacharya184-droid"}
`).join("\n");
  return `### SELECTED PORTFOLIO PROJECTS:\n${items}`.trim();
}

function formatSkillsContext() {
  const groups = portfolioData.skillGroups || [];
  if (groups.length === 0) return "";
  const items = groups.map((g) => {
    const list = (g.skills || []).map((s) => `${s.name} (${typeof s.level === 'number' ? s.level + '%' : s.level})`).join(", ");
    return `- **${g.title}**: ${list}`;
  }).join("\n");
  return `### TECHNICAL SKILLS & PROFICIENCY:\n${items}`.trim();
}

function formatCertificationsAndAchievementsContext() {
  const certs = portfolioData.certifications || [];
  const achs = portfolioData.achievements || [];
  
  let result = "### CERTIFICATIONS & ACHIEVEMENTS:\n";
  if (certs.length > 0) {
    result += "Certifications:\n" + certs.map((c) => `- ${c.title} by ${c.issuer} (${c.year})`).join("\n") + "\n";
  }
  if (achs.length > 0) {
    result += "Achievements:\n" + achs.map((a) => `- ${a.title}: ${a.description}`).join("\n") + "\n";
  }
  return result.trim();
}

function formatBlogTopicsContext() {
  const blogs = portfolioData.blogTopics || [];
  if (blogs.length === 0) return "";
  const items = blogs.map((b) => `- "${b.title}" (${b.status}): ${b.excerpt} [Tags: ${b.tags ? b.tags.join(", ") : ""}]`).join("\n");
  return `### ACTIVE RESEARCH & UPCOMING WRITING TOPICS:\n${items}`.trim();
}

function formatSocialContext() {
  const links = portfolioData.socialLinks || [];
  const items = links.map((l) => `- ${l.label}: ${l.href}`).join("\n");
  return `### SOCIAL & CONTACT LINKS:\n- Email: gouthamacharya184@gmail.com\n${items}`.trim();
}

/**
 * Builds the complete system prompt including all relevant portfolio knowledge context.
 */
export function buildSystemPromptWithContext(userQuery = "", history = []) {
  const masterPrompt = loadMasterSystemPrompt();
  const profileCtx = formatProfileContext();
  const expCtx = formatExperienceContext();
  const eduCtx = formatEducationContext();
  const projectsCtx = formatProjectsContext();
  const skillsCtx = formatSkillsContext();
  const certsCtx = formatCertificationsAndAchievementsContext();
  const blogCtx = formatBlogTopicsContext();
  const socialCtx = formatSocialContext();

  const fullKnowledgeBase = `
=== DYNAMIC PORTFOLIO KNOWLEDGE BASE CONTEXT ===

${profileCtx}

${skillsCtx}

${projectsCtx}

${expCtx}

${eduCtx}

${certsCtx}

${blogCtx}

${socialCtx}

==================================================
`;

  return `${masterPrompt}\n\n${fullKnowledgeBase}`.trim();
}

/**
 * Smart contextual fallback generator for portfolio queries when external LLM service is offline or rate limited.
 */
export function getKnowledgeFallbackResponse(query = "") {
  const q = query.toLowerCase();
  const p = portfolioData.profile || {};

  if (q.includes("skill") || q.includes("python") || q.includes("tech") || q.includes("know") || q.includes("stack")) {
    const groups = portfolioData.skillGroups || [];
    const skillsList = groups.map(g => `**${g.title}**: ${g.skills.map(s => s.name).join(", ")}`).join("\n- ");
    return `### Goutham's Technical Skills & Expertise:\n- ${skillsList}\n\nGoutham specializes in **Python, LLM evaluation, RAG architectures, FastAPI, and NLP workflows**.`;
  }

  if (q.includes("project") || q.includes("work") || q.includes("build") || q.includes("hallucination") || q.includes("legal") || q.includes("analysis")) {
    const projects = portfolioData.projects || [];
    const projList = projects.map(p => `**${p.title}** (${p.stack.join(", ")}):\n  ${p.description}`).join("\n\n");
    return `### Selected Portfolio Projects:\n\n${projList}\n\nAll source code is available on [Goutham's GitHub](${p.github || "https://github.com/gouthamacharya184-droid"}).`;
  }

  if (q.includes("contact") || q.includes("email") || q.includes("reach") || q.includes("hire") || q.includes("github") || q.includes("phone") || q.includes("whatsapp")) {
    return `### Contact & Connect with Goutham:\n- **Email**: ${p.displayEmail || "gouthamacharya184@gmail.com"}\n- **Location**: ${p.location || "Udupi, Karnataka, India"}\n- **GitHub**: [gouthamacharya184-droid](${p.github || "https://github.com/gouthamacharya184-droid"})\n\nYou can also use the contact form at the bottom of the page to send a direct message!`;
  }

  if (q.includes("education") || q.includes("college") || q.includes("degree") || q.includes("study") || q.includes("university")) {
    const edu = portfolioData.education || [];
    const eduList = edu.map(e => `- **${e.title}** (${e.institution}, ${e.period})`).join("\n");
    return `### Education & Background:\n${eduList}\n\nGoutham is currently pursuing his **Bachelor of Engineering in Artificial Intelligence & Machine Learning (4th Year)**.`;
  }

  return `Hello! I'm **Goutham's AI Portfolio Assistant** 👋\n\nGoutham Acharya is an **AI Engineer & Automation Specialist** based in Udupi, Karnataka, India. He specializes in **Python, LLMs, RAG pipelines, and NLP**.\n\nHere are some quick things you can ask me about:\n- 🛠️ **Skills**: Python, Pandas, FastAPI, Scikit-Learn, Prompt Engineering\n- 🚀 **Projects**: LLM Hallucination Detection, Legal AI Assistant, Data Analysis\n- 🎓 **Education**: B.E. in Artificial Intelligence & Machine Learning (4th Year)\n- 📬 **Contact**: Email, GitHub, and WhatsApp\n\nHow can I help you today?`;
}
