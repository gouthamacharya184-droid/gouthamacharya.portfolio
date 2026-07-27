import { ArrowDown, Download, Github, MessageCircle, Sparkles, Cpu, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import ProgressiveImage from "./ProgressiveImage";
import { usePortfolio } from "../hooks/usePortfolio";

const typewriterWords = [
  "Python Developer",
  "AI Engineer",
  "LLM Developer",
  "Automation Engineer",
  "RAG Application Builder",
];

/* ── Particle Canvas ─────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Skip on touch devices and prefers-reduced-motion
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Reduced to 40 particles for better performance
    const COUNT = 40;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.1,
      flicker: Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.02 + 0.005,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        p.flicker += p.flickerSpeed;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        const flickeredAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.flicker));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 236, 252, ${flickeredAlpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    // Debounced resize handler
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        W = canvas.offsetWidth;
        H = canvas.offsetHeight;
        canvas.width = W;
        canvas.height = H;
      }, 250);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55 }}
      aria-hidden="true"
    />
  );
}

/* ── Typewriter — single setInterval avoids cascading setState ── */
function useTypewriter(words) {
  const [displayed, setDisplayed] = useState("");
  const stateRef = useRef({ wordIndex: 0, charIndex: 0, deleting: false, pausing: false });

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(words[0] ?? "");
      return;
    }

    const tick = () => {
      const s = stateRef.current;
      const word = words[s.wordIndex] ?? "";

      if (s.pausing) return;

      if (!s.deleting) {
        if (s.charIndex < word.length) {
          s.charIndex++;
          setDisplayed(word.slice(0, s.charIndex));
        } else {
          s.pausing = true;
          setTimeout(() => { s.pausing = false; s.deleting = true; }, 1800);
        }
      } else {
        if (s.charIndex > 0) {
          s.charIndex--;
          setDisplayed(word.slice(0, s.charIndex));
        } else {
          s.deleting = false;
          s.wordIndex = (s.wordIndex + 1) % words.length;
        }
      }
    };

    const interval = setInterval(tick, 55);
    return () => clearInterval(interval);
  }, [words]);

  return displayed;
}

export default function Hero() {
  const { portfolio } = usePortfolio();
  const profile = portfolio?.profile ?? { name: "Goutham Acharya", location: "", github: "#" };
  const currentText = useTypewriter(typewriterWords);

  return (
    <>
      <section
        id="home"
        className="relative z-10 px-4 xxs:px-4 xs:px-6 sm:px-8 md:px-10 xl:px-14 pt-20 xs:pt-24 sm:pt-28 pb-10 xs:pb-12 sm:pb-16 min-h-[100svh] flex items-center overflow-hidden"
      >
        {/* Particle Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <ParticleCanvas />
        </div>

        {/* ── Grid: on mobile stacks with image on TOP ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 xs:gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center w-full max-w-[70rem] mx-auto relative z-10">

          {/* ── Profile Image (order-first on mobile, order-last on desktop) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end order-first lg:order-last"
          >
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-[250px] xxs:max-w-[270px] xs:max-w-[320px] sm:max-w-[390px] md:max-w-[440px] lg:max-w-[440px] xl:max-w-[490px] mx-auto lg:mx-0 group cursor-default"
            >
              {/* Glow effects — reduced on mobile */}
              <div className="absolute -inset-4 sm:-inset-6 bg-[radial-gradient(circle,rgba(14,165,233,0.2),transparent_65%)] blur-2xl sm:blur-3xl pointer-events-none animate-pulse-slow" />
              <div className="hidden sm:block absolute -inset-10 bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_60%)] blur-3xl pointer-events-none mix-blend-screen" />

              {/* Profile Image container without background frame */}
              <div className="relative">
                <ProgressiveImage
                  src="/profile.webp"
                  alt="Goutham Acharya profile photo"
                  loading="eager"
                  className="w-full h-auto max-h-[340px] xs:max-h-[410px] sm:max-h-[480px] md:max-h-[550px] lg:max-h-[530px] object-cover object-top"
                />
              </div>

            </motion.div>
          </motion.div>

          {/* ── Text Content (order-last on mobile, order-first on desktop) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left order-last lg:order-first"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full border border-cyan-400/20 bg-[#071225]/70 shadow-[0_0_30px_rgba(14,165,233,0.08)] backdrop-blur-md mb-4 xs:mb-5 sm:mb-6"
            >
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse shrink-0" />
                <Sparkles size={11} />
              </div>
              <span className="text-cyan-200 tracking-[0.12em] text-[9px] xs:text-[10px] sm:text-[11px] uppercase font-semibold">
                Available for internships
              </span>
            </motion.div>

            {/* Name — fluid clamp typography */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="font-black tracking-tight mb-3 xs:mb-4 sm:mb-5 leading-[1.1] text-white"
              style={{ fontSize: "var(--text-hero)" }}
            >
              {profile.name}
            </motion.h1>

            {/* Typewriter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex items-center mb-3 xs:mb-4 max-w-full"
            >
              <div className="flex items-center gap-2 px-3 xs:px-4 py-2 rounded-full border border-violet-400/15 bg-[#071225]/85 backdrop-blur-lg text-xs sm:text-sm text-slate-200 shadow-[0_0_20px_rgba(139,92,246,0.08)] max-w-full overflow-hidden">
                <Cpu size={13} className="text-violet-400 shrink-0" />
                <span className="truncate max-w-[200px] xs:max-w-[220px] sm:max-w-none inline-block">{currentText}</span>
                <span className="w-0.5 h-4 bg-cyan-400 animate-pulse shrink-0 ml-0.5" aria-hidden="true" />
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.7 }}
              className="text-slate-300 leading-relaxed max-w-[90%] xs:max-w-xl mb-6 xs:mb-7 sm:mb-8 font-light"
              style={{ fontSize: "var(--text-body-lg)" }}
            >
              AI Engineer specializing in{" "}
              <span className="font-semibold text-white">Python, Large Language Models (LLMs), RAG pipelines, FastAPI, and NLP</span>.{" "}
              I design and develop scalable, production-ready AI systems that transform complex data into{" "}
              <span className="text-cyan-400 font-semibold">intelligent, reliable, and real-world solutions.</span>
            </motion.p>

            {/* Primary CTA buttons — stacked on mobile, row on sm+ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-col xxs:flex-col xs:flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 w-full sm:w-auto"
            >
              <a
                href="#projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 text-slate-950 px-5 xs:px-6 py-3 xs:py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-pulse-glow min-h-[48px] w-full sm:w-auto"
              >
                View My Work <ArrowDown size={15} strokeWidth={2.5} />
              </a>
              <a
                href="/api/uploads/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-5 xs:px-6 py-3 xs:py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:border-cyan-400/35 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-200 min-h-[48px] w-full sm:w-auto"
              >
                Download CV <Download size={15} strokeWidth={2.5} />
              </a>
            </motion.div>

            {/* Secondary social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
            >
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071225]/90 px-4 xs:px-5 py-2.5 xs:py-3 text-xs xs:text-sm text-slate-300 hover:border-cyan-400/30 hover:text-white transition-all duration-200 min-h-[48px] w-full sm:w-auto"
              >
                <Github size={15} /> GitHub
              </a>
              <a
                href="/api/social/call"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071225]/90 px-4 xs:px-5 py-2.5 xs:py-3 text-xs xs:text-sm text-slate-300 hover:border-cyan-400/30 hover:text-white transition-all duration-200 min-h-[48px] w-full sm:w-auto"
              >
                <Phone size={15} /> Call
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071225]/90 px-4 xs:px-5 py-2.5 xs:py-3 text-xs xs:text-sm text-slate-300 hover:border-cyan-400/30 hover:text-white transition-all duration-200 min-h-[48px] w-full sm:w-auto"
              >
                <MessageCircle size={15} /> Contact Me
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator — visible on all screens >= xs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-5 xs:bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
          role="button"
          aria-label="Scroll to About section"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-[9px] xs:text-[10px] uppercase tracking-[0.3em] text-slate-500 group-hover:text-cyan-400 transition-colors duration-300 font-bold">
            Scroll
          </span>
          <div className="w-px h-8 xs:h-10 bg-gradient-to-b from-cyan-500/50 to-transparent relative overflow-hidden">
            <motion.div
              animate={{ y: [0, 40] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-cyan-400"
            />
          </div>
        </motion.div>
      </section>
    </>
  );
}
