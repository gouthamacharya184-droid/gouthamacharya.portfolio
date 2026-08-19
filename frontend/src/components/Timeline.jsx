import { motion } from "framer-motion";
import Section from "./Section";
import { usePortfolio, resolveIcon } from "../hooks/usePortfolio";
import DataSkeleton from "./DataSkeleton";

export default function Timeline() {
  const { portfolio, loading } = usePortfolio();
  if (loading) return (
    <Section id="experience" eyebrow="Experience & Education" title="A learning path grounded in practical AI work." description="">
      <DataSkeleton lines={5} />
    </Section>
  );
  const experience = portfolio?.experience ?? [];
  const education  = portfolio?.education  ?? [];

  // Resolve icon strings → Lucide components for education items
  const resolvedEducation = education.map((e) => ({ ...e, IconComponent: resolveIcon(e.icon) }));

  return (
    <Section
      id="experience"
      eyebrow="Experience & Education"
      title="A learning path grounded in practical AI work."
      description="Built from resume milestones, academic direction, and portfolio projects."
    >
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-2">

        {/* ── Experience ── */}
        <div className="rounded-2xl xs:rounded-[2rem] border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-4 xxs:p-5 xs:p-8 sm:p-10 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

          <p className="text-[10px] xs:text-xs uppercase tracking-[0.3em] text-slate-500 mb-8 xs:mb-10">Experience</p>

          <div className="relative space-y-8 xs:space-y-10 pl-6 xxs:pl-7 xs:pl-10">
            {/* Static line */}
            <div className="absolute left-[8px] xs:left-[11px] top-2 bottom-0 w-px bg-white/8" />
            {/* Animated gradient line */}
            <motion.div
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute left-[8px] xs:left-[11px] top-2 w-px bg-gradient-to-b from-cyan-400 via-violet-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            />

            {experience.map((item, index) => (
              <motion.div
                key={`${item.role}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                {/* Node */}
                <div className="absolute left-[-34px] xs:left-[-46px] top-1.5 h-3 w-3 xs:h-4 xs:w-4 rounded-full border-2 border-slate-950 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />

                <p className="text-[9px] xs:text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">{item.period}</p>
                <h3 className="text-base xs:text-xl sm:text-2xl font-bold text-white tracking-tight">{item.role}</h3>
                <p className="mt-1 text-xs xs:text-sm font-medium text-slate-400">{item.company}</p>
                <p className="mt-4 text-xs xs:text-sm leading-relaxed text-slate-300">{item.description}</p>

                <ul className="mt-4 space-y-2.5 xs:space-y-3 text-xs xs:text-sm text-slate-300 bg-white/[0.02] border border-white/5 rounded-xl xs:rounded-2xl p-4 xs:p-5">
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Education ── */}
        <div className="rounded-2xl xs:rounded-[2rem] border border-white/8 bg-gradient-to-bl from-white/[0.05] to-transparent p-4 xxs:p-5 xs:p-8 sm:p-10 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

          <p className="text-[10px] xs:text-xs uppercase tracking-[0.3em] text-slate-500 mb-8 xs:mb-10">Education</p>

          <div className="space-y-5 relative z-10">
            {resolvedEducation.map(({ period, title, institution, IconComponent }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group rounded-xl xs:rounded-2xl border border-white/8 bg-slate-900/30 p-5 xs:p-6 hover:bg-slate-900/50 transition-all duration-300 hover:border-cyan-400/15 hover:shadow-[0_0_20px_rgba(34,211,238,0.06)]"
              >
                <div className="flex items-start gap-4 xs:gap-5">
                  <div className="flex h-12 w-12 xs:h-14 xs:w-14 flex-shrink-0 items-center justify-center rounded-xl xs:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/10 text-cyan-300 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    {IconComponent && <IconComponent size={22} strokeWidth={1.5} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] xs:text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">{period}</p>
                    <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-white leading-snug">{title}</h3>
                    <p className="mt-1.5 text-xs xs:text-sm text-slate-400">{institution}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
