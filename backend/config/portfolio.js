export const portfolioData = {
  navigation: [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Credentials", href: "#testimonials" },
    { label: "Blog", href: "#blog" },
    { label: "Contact", href: "#contact" },
  ],

  profile: {
    name: "Goutham Acharya",
    title: "AI Engineering & Automation Specialist | Python, LLMs, RAG & NLP",
    location: "Udupi, Karnataka, India",
    summary:
      "AI Engineer specializing in Python, Large Language Models (LLMs), RAG pipelines, FastAPI, and NLP. I design and develop scalable, production-ready AI systems that transform complex data into intelligent, reliable, and real-world solutions.",
    objective:
      "Seeking an AI Engineering or Python Developer internship to deploy robust LLM solutions, optimize vector-based retrieval accuracy, and build production-grade intelligent features.",
    github: "https://github.com/gouthamacharya184-droid",
    displayEmail: "gouthamacharya184@gmail.com",
    // Bio prose — rendered dynamically in About.jsx (replaces hardcoded text)
    bioParagraph1: "I am an Artificial Intelligence and Machine Learning engineer specializing in building practical, data-driven systems using Python, advanced analytics, prompt design, and applied NLP.",
    bioParagraph2: "My focus is on designing production-grade AI applications that bridge the gap between experimental models and robust deployment — specializing in LLM evaluations, context-aware RAG architectures, and domain-specific assistants.",
    bioHighlights: ["Python", "advanced analytics", "prompt design"],
    bioCyanHighlights: ["LLM evaluations", "RAG architectures"],
  },

  highlights: [
    { icon: "GraduationCap", label: "4th Year B.E.", sub: "AI & ML Engineering" },
    { icon: "MapPin", label: "Udupi, Karnataka", sub: "India" },
    { icon: "Briefcase", label: "Open to Internships", sub: "AI / ML / NLP roles" },
  ],

  experience: [
    {
      period: "Present",
      role: "AIML Student & Builder",
      company: "Self-Driven Learning Track",
      description:
        "Building AI-first portfolio projects around hallucination detection, legal chatbots, data analysis, and workflow automation while strengthening production-oriented thinking.",
      points: [
        "Working with machine learning fundamentals, preprocessing, and evaluation",
        "Exploring LLM behavior across prompts, data pipelines, and response validation",
        "Expanding into FastAPI and AI workflow automation for deployable products",
      ],
    },
  ],

  education: [
    {
      period: "Current",
      title: "Bachelor of Engineering in Artificial Intelligence & Machine Learning",
      institution: "Pursuing • 4th Year",
      icon: "GraduationCap",
    },
    {
      period: "Completed",
      title: "Diploma in Mechanical Engineering",
      institution: "Completed",
      icon: "NotebookPen",
    },
  ],

  projects: [
    {
      title: "LLM Hallucination Detection",
      image: "/api/assets/hallucination.webp",
      stack: ["Python", "Excel", "LLM Evaluation", "Prompt Analysis"],
      description:
        "Compared outputs from multiple LLMs using identical queries, organized response data, and created a simple scoring system to identify inconsistencies and hallucinated answers.",
      bullets: [
        "Collected comparable responses from multiple models",
        "Structured outputs into reusable Excel datasets",
        "Designed a lightweight response accuracy scoring approach",
      ],
      impact: "Demonstrates a structured evaluation mindset for LLM quality — moving from raw outputs to validated, comparable metrics. A critical skill for production AI deployments where reliability matters.",
      links: { github: "https://github.com/gouthamacharya184-droid" },
    },
    {
      title: "Data Analysis using Python",
      image: "/api/assets/data-analysis.webp",
      stack: ["Python", "Pandas", "Matplotlib", "EDA"],
      description:
        "Cleaned and analyzed structured datasets, surfaced patterns through exploratory analysis, and visualized trends for clearer decision-making.",
      bullets: [
        "Preprocessed CSV and Excel datasets with Pandas",
        "Performed exploratory data analysis to find trends",
        "Created visual summaries and insight-driven charts",
      ],
      impact: "Showcases strong data pipeline fluency — transforming raw, unstructured data into clean, analysis-ready inputs and communicating findings through clear visualizations. Foundation for any AI/ML data preparation workflow.",
      links: { github: "https://github.com/gouthamacharya184-droid" },
    },
    {
      title: "Legal AI Assistant",
      image: "/api/assets/legal-ai.webp",
      stack: ["Gemini", "JSON", "Prompt Engineering", "RAG"],
      description:
        "Built a legal-information chatbot workflow, analyzed model responses for quality issues, and improved accuracy with prompt iteration and context-aware retrieval.",
      bullets: [
        "Collected legal-domain responses with varied queries",
        "Stored and organized outputs in JSON format",
        "Applied prompt techniques and RAG-style thinking for better responses",
      ],
      impact: "Applies RAG-style retrieval and prompt engineering in a high-stakes domain, demonstrating the ability to build AI tools that require factual accuracy, context awareness, and responsible output filtering.",
      links: { github: "https://github.com/gouthamacharya184-droid" },
    },
  ],

  skillGroups: [
    {
      title: "Programming",
      icon: "FileCode2",
      skills: [
        { name: "Python", level: 90 },
        { name: "RESTful APIs", level: 68 },
      ],
    },
    {
      title: "Libraries & Data",
      icon: "Database",
      skills: [
        { name: "Pandas", level: 86 },
        { name: "NumPy", level: 78 },
        { name: "Matplotlib", level: 82 },
        { name: "Scikit-Learn", level: 76 },
      ],
    },
    {
      title: "AI / ML / NLP",
      icon: "BrainCircuit",
      skills: [
        { name: "Machine Learning", level: 82 },
        { name: "Data Preprocessing", level: 84 },
        { name: "Natural Language Processing (NLP)", level: 77 },
        { name: "Prompt Engineering", level: 80 },
        { name: "Large Language Models (LLMs)", level: 79 },
        { name: "Retrieval-Augmented Generation (RAG)", level: 72 },
      ],
    },
    {
      title: "Tools",
      icon: "Wrench",
      skills: [
        { name: "Jupyter", level: 88 },
        { name: "Google Colab", level: 85 },
        { name: "FastAPI", level: 62 },
        { name: "Workflow Automation", level: 64 },
      ],
    },
  ],

  strengthCards: [
    {
      title: "AI Mindset",
      text: "Strong interest in AI, emerging tools, and practical real-world applications.",
      icon: "Sparkles",
    },
    {
      title: "Problem Solver",
      text: "Comfortable breaking down unclear problems into smaller, testable steps.",
      icon: "LineChart",
    },
    {
      title: "Communication",
      text: "Able to work independently and contribute within team environments.",
      icon: "MessageSquareText",
    },
    {
      title: "Build Focus",
      text: "Interested in moving from experiments to product-shaped AI workflows.",
      icon: "ServerCog",
    },
  ],

  certifications: [
    {
      title: "Generative AI",
      issuer: "Infosys Springboard",
      year: "2025",
      icon: "BadgeCheck",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-400/20",
    },
    {
      title: "Programming Fundamentals using Python — Part 1",
      issuer: "Infosys Springboard",
      year: "2024",
      icon: "BookOpen",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-400/20",
    },
    {
      title: "Programming Fundamentals using Python — Part 2",
      issuer: "Infosys Springboard",
      year: "2024",
      icon: "BookOpen",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-400/20",
    },
  ],

  achievements: [
    {
      title: "4th Year B.E. in AI & ML",
      description: "Pursuing a specialised engineering degree focused on practical AI systems, machine learning pipelines, and real-world NLP workflows.",
      icon: "Trophy",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-400/20",
    },
    {
      title: "Self-Driven AI Builder",
      description: "Built 3+ end-to-end projects across hallucination detection, legal AI chatbots, and exploratory data analysis — without a formal internship.",
      icon: "Award",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-400/20",
    },
  ],

  blogTopics: [
    {
      title: "Optimizing RAG Pipelines for Better Retrieval",
      excerpt: "Exploring chunking strategies, embedding models, and vector database choices for building reliable retrieval-augmented generation workflows.",
      status: "Researching",
      statusColor: "text-amber-400",
      statusBg: "bg-amber-500/10",
      statusBorder: "border-amber-400/20",
      tags: ["LLM", "RAG", "Vector DB"],
    },
    {
      title: "LLM Hallucination: Causes and Detection Methods",
      excerpt: "A deep dive into why large language models confidently produce wrong answers, and practical evaluation approaches to catch inconsistencies.",
      status: "Drafting",
      statusColor: "text-cyan-400",
      statusBg: "bg-cyan-500/10",
      statusBorder: "border-cyan-400/20",
      tags: ["LLM Evaluation", "Hallucination", "Python"],
    },
    {
      title: "Prompt Engineering Patterns That Actually Work",
      excerpt: "Moving beyond basic prompts — structured techniques like chain-of-thought, few-shot, and role prompting for reliable AI outputs.",
      status: "Researching",
      statusColor: "text-amber-400",
      statusBg: "bg-amber-500/10",
      statusBorder: "border-amber-400/20",
      tags: ["Prompt Engineering", "NLP"],
    },
  ],

  socialLinks: [
    {
      label: "GitHub",
      href: "https://github.com/gouthamacharya184-droid",
      icon: "Github",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/goutham-acharya-523b25282",
      icon: "Linkedin",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/goutham_acharya_18",
      icon: "Instagram",
    },
  ],
};
