export const portfolioData = {
  navigation: [
    { label: "About",        href: "#about" },
    { label: "Experience",   href: "#experience" },
    { label: "Projects",     href: "#projects" },
    { label: "Credentials",  href: "#testimonials" },
    { label: "Blog",         href: "#blog" },
    { label: "Contact",      href: "#contact" },
  ],

  profile: {
    name:      "Goutham Acharya",
    title:     "AIML Student & Automation Developer | Python, LLMs, RAG, AI Agents & Automation",
    location:  "Udupi, Karnataka, India",
    phone:     "7619573468",
    displayEmail: "gouthamacharya184@gmail.com",
    summary:
      "Motivated Artificial Intelligence and Machine Learning (AIML) student with strong foundations in Python, APIs, Generative AI, and workflow automation. Passionate about building AI-powered applications, AI agents, and intelligent automation solutions using Large Language Models (LLMs). Experienced in developing real-world AI projects and integrating modern technologies to solve business problems.",
    objective:
      "Seeking an Automation Developer Intern role to contribute technical skills, learn enterprise automation practices, and deliver impactful AI-driven solutions.",
    github:       "https://github.com/gouthamacharya184-droid",
    portfolioUrl: "https://gouthamacharya.vercel.app/",
    resumeUrl:    "/api/portfolio/resume",
  },

  highlights: [
    { icon: "GraduationCap", label: "3rd Year B.E. (AIML)", sub: "Expected 2027 • SGPA 7.86" },
    { icon: "MapPin",        label: "Udupi, Karnataka", sub: "India" },
    { icon: "Briefcase",     label: "Open to Internships", sub: "Automation & AI Developer" },
  ],

  stats: [
    {
      label:       "GitHub Contributions",
      value:       350,
      suffix:      "+",
      icon:        "GitCommit",
      color:       "text-cyan-400",
      bg:          "bg-cyan-500/10",
      border:      "border-cyan-500/20",
      hoverShadow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]",
    },
    {
      label:       "AI Projects Built",
      value:       4,
      suffix:      "+",
      icon:        "BrainCircuit",
      color:       "text-violet-400",
      bg:          "bg-violet-500/10",
      border:      "border-violet-500/20",
      hoverShadow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    },
    {
      label:       "LLM Evaluations Run",
      value:       250,
      suffix:      "+",
      icon:        "Database",
      color:       "text-emerald-400",
      bg:          "bg-emerald-500/10",
      border:      "border-emerald-500/20",
      hoverShadow: "group-hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]",
    },
    {
      label:       "Prompt Accuracy Target",
      value:       94,
      suffix:      "%",
      icon:        "BadgeCheck",
      color:       "text-amber-400",
      bg:          "bg-amber-500/10",
      border:      "border-amber-500/20",
      hoverShadow: "group-hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]",
    },
  ],

  experience: [
    {
      period:      "Present",
      role:        "AIML Student & Automation Developer",
      company:     "Self-Driven Learning Track & AI Projects",
      description:
        "Building AI-first software applications, intelligent chatbots, automated NLP systems, and hallucination detection workflows while strengthening production-oriented engineering.",
      points: [
        "Developing real-world AI applications using LangChain, Streamlit, and FastAPI",
        "Integrating LLM APIs with RAG and Brave Search for factual verification and output accuracy",
        "Engineering conversational AI interfaces and structured automation pipelines",
      ],
    },
  ],

  education: [
    {
      period:      "2023 - 2027 (Expected)",
      title:       "B.E. in Artificial Intelligence & Machine Learning",
      institution: "Moodlakatte Institute of Technology • SGPA: 7.86",
      icon:        "GraduationCap",
    },
    {
      period:      "2021 - 2024 (Completed)",
      title:       "Diploma in Mechanical Engineering",
      institution: "Government Polytechnic Udupi • CGPA: 7.26",
      icon:        "NotebookPen",
    },
  ],

  projects: [
    {
      title:       "Personal Portfolio Website",
      image:       "/api/uploads/projects/hallucination.webp",
      stack:       ["React", "Tailwind CSS", "Vite", "Node.js", "Express"],
      description:
        "Developed a responsive personal portfolio website using React and Tailwind CSS to showcase projects, technical skills, certifications, and contact information, with a modern, mobile-friendly UI focused on usability, responsive design, and clean visual presentation across all devices.",
      bullets: [
        "Built responsive, mobile-friendly user interface with modern glassmorphic styling",
        "Structured modular Node.js/Express REST backend for dynamic portfolio API data",
        "Optimized asset loading, smooth animations, and secure production deployment",
      ],
      links: { github: "https://github.com/gouthamacharya184-droid", demo: "https://gouthamacharya.vercel.app/" },
    },
    {
      title:       "LLM Hallucination Detection",
      image:       "/api/uploads/projects/hallucination.webp",
      stack:       ["Python", "RAG", "Brave Search", "LangChain", "LLM APIs"],
      description:
        "Large Language Models (LLMs) can generate confident but factually incorrect responses (hallucinations). This project integrates multiple LLM APIs and uses RAG with Brave Search to verify responses against trusted sources, measure factual accuracy, and compare hallucination rates across different models.",
      bullets: [
        "Integrated multiple LLM APIs for automated output comparison",
        "Implemented RAG with Brave Search live web retrieval for factual verification",
        "Measured hallucination rates and accuracy scoring metrics across models",
      ],
      links: { github: "https://github.com/gouthamacharya184-droid" },
    },
    {
      title:       "Legal AI Assistant (Chatbot)",
      image:       "/api/uploads/projects/legal-ai.webp",
      stack:       ["Gemini API", "Python", "RAG", "Prompt Engineering", "NLP"],
      description:
        "Accessing legal information can be complex and time-consuming for individuals without legal expertise. This project uses the Gemini API to provide an AI-powered legal assistant that answers legal queries, explains legal concepts in simple language, and assists users in understanding legal documents and procedures through a conversational interface.",
      bullets: [
        "Leveraged Gemini API for context-aware conversational AI assistance",
        "Engineered legal-domain prompts for simple, accessible explanations",
        "Assisted users in navigating legal documents, terms, and procedures",
      ],
      links: { github: "https://github.com/gouthamacharya184-droid" },
    },
    {
      title:       "Data Analysis using Python",
      image:       "/api/uploads/projects/data-analysis.webp",
      stack:       ["Python", "Pandas", "NumPy", "Matplotlib", "EDA"],
      description:
        "Cleaned and analyzed structured datasets, surfaced patterns through exploratory data analysis (EDA), and visualized key trends for actionable insights.",
      bullets: [
        "Preprocessed and cleaned raw tabular datasets using Pandas & NumPy",
        "Performed exploratory data analysis to extract hidden patterns",
        "Designed clear visual summaries and insight-driven charts with Matplotlib",
      ],
      links: { github: "https://github.com/gouthamacharya184-droid" },
    },
  ],

  skillGroups: [
    {
      title: "Programming",
      icon:  "FileCode2",
      skills: [
        { name: "Python",          level: 92 },
        { name: "RESTful APIs",    level: 80 },
        { name: "API Integration", level: 82 },
      ],
    },
    {
      title: "Libraries & Frameworks",
      icon:  "Database",
      skills: [
        { name: "Pandas",       level: 86 },
        { name: "NumPy",        level: 80 },
        { name: "Matplotlib",   level: 82 },
        { name: "Scikit-Learn", level: 76 },
        { name: "FastAPI",      level: 75 },
        { name: "Streamlit",    level: 78 },
        { name: "LangChain",    level: 75 },
      ],
    },
    {
      title: "AI / ML & NLP",
      icon:  "BrainCircuit",
      skills: [
        { name: "Machine Learning",                     level: 82 },
        { name: "Data Preprocessing",                   level: 85 },
        { name: "Model Training",                       level: 80 },
        { name: "NLP & Text Processing",                level: 78 },
        { name: "Retrieval-Augmented Generation (RAG)",  level: 80 },
        { name: "Large Language Models (LLMs)",         level: 82 },
        { name: "Prompt Engineering",                   level: 84 },
        { name: "Vector Databases",                     level: 75 },
      ],
    },
    {
      title: "Tools & Workflows",
      icon:  "Wrench",
      skills: [
        { name: "Antigravity",         level: 85 },
        { name: "Google Colab",        level: 88 },
        { name: "Jupyter",             level: 88 },
        { name: "Workflow Automation", level: 80 },
      ],
    },
  ],

  strengthCards: [
    {
      title: "AI & Automation Mindset",
      text:  "Passionate about building AI-powered applications, AI agents, and intelligent workflow automation.",
      icon:  "Sparkles",
    },
    {
      title: "Problem Solver",
      text:  "Experienced in breaking down real-world business problems into modular, testable AI solutions.",
      icon:  "LineChart",
    },
    {
      title: "Communication & Teamwork",
      text:  "Able to work independently and contribute effectively in collaborative software teams.",
      icon:  "MessageSquareText",
    },
    {
      title: "Production Focus",
      text:  "Dedicated to building enterprise-grade automation practices and deployable AI features.",
      icon:  "ServerCog",
    },
  ],

  certifications: [
    {
      title:  "Generative AI",
      issuer: "Google / Coursera",
      year:   "2024",
      icon:   "BadgeCheck",
      color:  "text-cyan-400",
      bg:     "bg-cyan-500/10",
      border: "border-cyan-400/20",
    },
    {
      title:  "Programming Fundamentals using Python — Part 1",
      issuer: "NPTEL / Coursera",
      year:   "2024",
      icon:   "BookOpen",
      color:  "text-violet-400",
      bg:     "bg-violet-500/10",
      border: "border-violet-400/20",
    },
    {
      title:  "Programming Fundamentals using Python — Part 2",
      issuer: "NPTEL / Coursera",
      year:   "2024",
      icon:   "BookOpen",
      color:  "text-violet-400",
      bg:     "bg-violet-500/10",
      border: "border-violet-400/20",
    },
  ],

  achievements: [
    {
      title:       "3rd Year B.E. in AIML (SGPA: 7.86)",
      description: "Pursuing specialized degree in Artificial Intelligence & Machine Learning at Moodlakatte Institute of Technology.",
      icon:        "Trophy",
      color:       "text-amber-400",
      bg:          "bg-amber-500/10",
      border:      "border-amber-400/20",
    },
    {
      title:       "Diploma in Mechanical Engineering (CGPA: 7.26)",
      description: "Successfully completed diploma foundation at Government Polytechnic Udupi (2021-2024).",
      icon:        "Award",
      color:       "text-emerald-400",
      bg:          "bg-emerald-500/10",
      border:      "border-emerald-400/20",
    },
  ],

  blogTopics: [
    {
      title:       "Optimizing RAG Pipelines with Brave Search and Vector DBs",
      excerpt:     "Exploring chunking strategies, embedding models, and web search integration for reliable retrieval-augmented generation.",
      status:      "Researching",
      statusColor: "text-amber-400",
      statusBg:    "bg-amber-500/10",
      statusBorder:"border-amber-400/20",
      tags:        ["LLM", "RAG", "Vector DB", "Brave Search"],
    },
    {
      title:       "Detecting LLM Hallucinations in Production",
      excerpt:     "A deep dive into measuring factual accuracy across model outputs and building automated verification pipelines.",
      status:      "Drafting",
      statusColor: "text-cyan-400",
      statusBg:    "bg-cyan-500/10",
      statusBorder:"border-cyan-400/20",
      tags:        ["LLM Evaluation", "Hallucination", "Python"],
    },
    {
      title:       "Building AI Agents and Workflow Automations with LangChain",
      excerpt:     "Moving beyond basic prompts — structured workflows, tool integration, and agentic patterns for enterprise automation.",
      status:      "Researching",
      statusColor: "text-amber-400",
      statusBg:    "bg-amber-500/10",
      statusBorder:"border-amber-400/20",
      tags:        ["LangChain", "AI Agents", "Automation"],
    },
  ],

  socialLinks: [
    {
      label: "GitHub",
      href:  "https://github.com/gouthamacharya184-droid",
      icon:  "Github",
    },
    {
      label: "LinkedIn",
      href:  "https://www.linkedin.com/in/goutham-acharya-523b25282",
      icon:  "Linkedin",
    },
    {
      label: "Instagram",
      href:  "https://www.instagram.com/goutham_acharya_18",
      icon:  "Instagram",
    },
  ],
};

