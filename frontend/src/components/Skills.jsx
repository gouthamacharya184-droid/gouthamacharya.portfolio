/**
 * Skills.jsx — Skills list / Fold 5
 *
 * Fixes applied:
 *  - useState moved BEFORE early return (Rules of Hooks compliance)
 *  - Added visual progress bars for each skill level
 *  - Added right-side fade gradient overflow indicator on tabs
 */

import { motion, AnimatePresence } from "framer-motion";
import Section from "./Section";
import { useState } from "react";
import { usePortfolio, resolveIcon } from "../hooks/usePortfolio";
import DataSkeleton from "./DataSkeleton";

export default function Skills() {
  const { portfolio, loading } = usePortfolio();

  // Fix 7: useState MUST be called unconditionally before any early return
  const skillGroups = (portfolio?.skillGroups ?? []).map((g) => ({
    ...g,
    IconComponent: resolveIcon(g.icon),
  }));
  const [activeTab, setActiveTab] = useState(skillGroups[0]?.title ?? "");

  if (loading) return (
    <Section id="skills" eyebrow="Skills" title="Tools and technologies I work with." description="">
      <DataSkeleton lines={3} />
    </Section>
  );

  const activeGroup = skillGroups.find((g) => g.title === activeTab)
    ?? skillGroups[0];

  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="Tools and technologies I work with."
      description="A focused set of capabilities around Python, data, and AI/ML systems."
    >
      {/* Fix 9: Tab scroller with right-side fade gradient overflow indicator */}
      <div className="relative mb-8 xs:mb-10">
        <div
          className="flex overflow-x-auto overflow-y-hidden pb-4 relative gap-2 snap-x custom-scrollbar"
          role="tablist"
        >
          {skillGroups.map((group) => {
            const isActive = activeTab === group.title;
            return (
              <button
                key={group.title}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(group.title)}
                className={`relative flex items-center px-4 py-2.5 rounded-xl text-xs xs:text-sm font-semibold transition-colors duration-200 snap-start whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer ${isActive
                    ? "text-cyan-400 bg-cyan-950/20 border border-cyan-500/25"
                    : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5"
                  }`}
              >
                {group.title}
                {isActive && (
                  <motion.span
                    layoutId="active-skill-tab"
                    className="absolute inset-0 rounded-xl bg-cyan-400/5 border border-cyan-400/20 pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {/* Fade gradient — hints at overflow content to the right */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[#010614] to-transparent" />
      </div>

      {/* Fix 8: Skills Grid with visual progress bars */}
      <div className="min-h-[220px] xs:min-h-[260px] sm:min-h-[280px]">
        <AnimatePresence mode="wait">
          {activeGroup && (
            <motion.div
              key={activeGroup.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid gap-4 xxs:gap-5 xs:gap-6 grid-cols-1 xxs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {activeGroup.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-white/10 group-hover:scale-105 group-hover:border-cyan-400/35 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300">
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
                        {skill.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{skill.name}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {typeof skill.level === "number"
                          ? skill.level >= 85 ? "Expert" : skill.level >= 70 ? "Proficient" : "Familiar"
                          : skill.level}
                      </p>
                    </div>
                  </div>
                  {/* Fix 8: Visual progress bar using skill.level numeric value */}
                  {typeof skill.level === "number" && (
                    <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 group-hover:from-cyan-400 group-hover:to-violet-400 transition-all duration-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
