import { motion, AnimatePresence } from "framer-motion";
import Section from "./Section";
import { useState } from "react";
import { usePortfolio, resolveIcon } from "../hooks/usePortfolio";
import DataSkeleton from "./DataSkeleton";

export default function Skills() {
  const { portfolio, loading } = usePortfolio();

  if (loading) return (
    <Section id="skills" eyebrow="Skills" title="Tools and technologies I work with." description="">
      <DataSkeleton lines={3} />
    </Section>
  );

  const skillGroups = (portfolio?.skillGroups ?? []).map((g) => ({
    ...g,
    IconComponent: resolveIcon(g.icon),
  }));

  const [activeTab, setActiveTab] = useState(skillGroups[0]?.title ?? "");
  const activeGroup = skillGroups.find((g) => g.title === activeTab);

  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="Tools and technologies I work with."
      description="A focused set of capabilities around Python, data, and AI/ML systems."
    >
      {/* Tab bar */}
      <div className="flex overflow-x-auto overflow-y-hidden pb-3 xs:pb-4 mb-3 xs:mb-6 relative gap-2 snap-x custom-scrollbar md:flex-wrap md:overflow-x-visible md:overflow-y-visible">
        {skillGroups.map((group) => {
          const { IconComponent } = group;
          const isActive = activeTab === group.title;
          return (
            <button
              key={group.title}
              onClick={() => setActiveTab(group.title)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 snap-start whitespace-nowrap shrink-0 min-h-[44px] ${
                isActive
                  ? "text-cyan-300 bg-cyan-500/10 border border-cyan-400/25 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                  : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5 hover:border-white/10"
              }`}
            >
              {IconComponent && <IconComponent size={15} strokeWidth={1.8} />}
              {group.title}
              {isActive && (
                <motion.span
                  layoutId="skill-tab-indicator"
                  className="absolute inset-0 rounded-xl bg-cyan-500/8 border border-cyan-400/20 pointer-events-none"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Skill chips */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="relative rounded-2xl border border-white/8 bg-white/[0.02] p-6 xs:p-8 overflow-hidden"
        >
          {/* Corner glow */}
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/8 blur-2xl pointer-events-none" />

          <div className="flex flex-wrap gap-2.5 xs:gap-3 relative z-10">
            {activeGroup.skills.map((skill, index) => (
              <motion.span
                key={skill.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="rounded-xl border border-cyan-400/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-400/35 hover:shadow-[0_0_18px_rgba(34,211,238,0.15)] transition-all duration-200 cursor-default select-none"
              >
                {skill.name}
              </motion.span>
            ))}
          </div>

          {/* Chip count label */}
          <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-slate-600 font-medium">
            {activeGroup.skills.length} skill{activeGroup.skills.length !== 1 ? "s" : ""} in this category
          </p>
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}
