/**
 * About.jsx — UI-only component
 *
 * All content data (profile.objective, certifications, strengthCards,
 * highlights) comes from the backend via usePortfolio(). This component
 * only handles rendering and mouse interaction UX.
 */

import { motion, useMotionValue } from "framer-motion";
import { useMemo } from "react";
import Section from "./Section";
import { fadeUp, stagger } from "../utils/motion";
import { usePortfolio, resolveIcon } from "../hooks/usePortfolio";
import { GraduationCap, MapPin, Briefcase } from "lucide-react";
import DataSkeleton, { DataError } from "./DataSkeleton";

function InteractiveCard({ title, text, icon: Icon }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      variants={fadeUp}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 xs:p-6 transition-all duration-300 hover:bg-white/[0.07] hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 rounded-2xl"
        style={{
          background: `radial-gradient(300px circle at ${x}px ${y}px, rgba(34,211,238,0.08), transparent 50%)`,
        }}
      />
      {Icon && (
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-300 shadow-inner group-hover:scale-110 transition-transform duration-300 mb-4">
          <Icon size={22} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="relative z-10 text-base xs:text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors mb-2">{title}</h3>
      <p className="relative z-10 text-sm leading-relaxed text-slate-400">{text}</p>
    </motion.div>
  );
}

export default function About() {
  const { portfolio, loading, error } = usePortfolio();

  if (loading) {
    return (
      <Section id="about" eyebrow="About" title="A concise story with a strong AI direction." description="">
        <DataSkeleton lines={4} />
      </Section>
    );
  }
  if (error) {
    return (
      <Section id="about" eyebrow="About" title="" description="">
        <DataError message={error} />
      </Section>
    );
  }

  const { profile, highlights, strengthCards, certifications } = portfolio;

  // Memoize icon resolution — avoids re-computing on every render
  const resolvedHighlights = useMemo(
    () => highlights.map((h) => ({ ...h, IconComponent: resolveIcon(h.icon) })),
    [highlights]
  );
  const resolvedStrengthCards = useMemo(
    () => strengthCards.map((c) => ({ ...c, icon: resolveIcon(c.icon) })),
    [strengthCards]
  );

  return (
    <Section
      id="about"
      eyebrow="About"
      title="A concise story with a strong AI direction."
      description={profile.objective}
    >
      {/* Mini highlight strip */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 xs:gap-4 mb-8 xs:mb-10"
      >
        {resolvedHighlights.map(({ IconComponent, label, sub }) => (
          <motion.div
            key={label}
            variants={fadeUp}
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5 hover:bg-white/[0.06] hover:border-cyan-400/15 transition-all duration-300 group"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/15 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
              {IconComponent && <IconComponent size={17} strokeWidth={1.8} />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{label}</p>
              <p className="text-[10px] text-slate-500 truncate">{sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Prose card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative rounded-2xl xs:rounded-[2rem] border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-5 xs:p-7 sm:p-10 backdrop-blur-md overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-48 w-48 xs:h-64 xs:w-64 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />

          <p className="relative z-10 text-base xs:text-lg sm:text-xl leading-relaxed text-slate-300 font-light max-w-[65ch]">
            I am an Artificial Intelligence and Machine Learning engineer specializing in building practical, data-driven systems using{" "}
            <span className="text-white font-medium px-2 py-0.5 rounded-md bg-white/5 inline-block border border-white/10">Python</span>,{" "}
            <span className="text-white font-medium px-2 py-0.5 rounded-md bg-white/5 inline-block border border-white/10">advanced analytics</span>,{" "}
            <span className="text-white font-medium px-2 py-0.5 rounded-md bg-white/5 inline-block border border-white/10">prompt design</span>, and applied NLP.
          </p>
          <p className="relative z-10 mt-5 xs:mt-6 text-base xs:text-lg sm:text-xl leading-relaxed text-slate-300 font-light max-w-[65ch]">
            My focus is on designing production-grade AI applications that bridge the gap between experimental models and robust deployment—specializing in{" "}
            <span className="text-cyan-300 font-medium">LLM evaluations</span>, context-aware <span className="text-cyan-300 font-medium">RAG architectures</span>, and domain-specific assistants.
          </p>

          {/* Certifications */}
          <div className="relative z-10 mt-8 xs:mt-10">
            <p className="text-[10px] xs:text-xs uppercase tracking-[0.3em] text-slate-500 mb-4">Certifications</p>
            <div className="flex flex-wrap gap-2 xs:gap-3">
              {certifications.map((item) => (
                <span
                  key={item.title}
                  className="rounded-lg xs:rounded-xl border border-cyan-400/20 bg-cyan-500/8 px-3 xs:px-4 py-2 text-xs xs:text-sm font-medium text-cyan-100 hover:bg-cyan-500/15 hover:border-cyan-400/35 transition-colors"
                >
                  {item.title}{" "}
                  <span className="text-[10px] opacity-70 font-normal">
                    ({item.issuer})
                  </span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Strength cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-3 xs:gap-4"
        >
          {resolvedStrengthCards.map((card) => (
            <InteractiveCard key={card.title} {...card} />
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
