/**
 * Testimonials.jsx — Certifications & Achievements section
 *
 * All certification and achievement data comes from the backend via
 * usePortfolio(). Icons are resolved from string identifiers via resolveIcon().
 * This component handles only rendering — no data logic.
 */

import { motion } from "framer-motion";
import Section from "./Section";
import { fadeUp, stagger } from "../utils/motion";
import { usePortfolio, resolveIcon } from "../hooks/usePortfolio";
import DataSkeleton from "./DataSkeleton";

export default function Testimonials() {
  const { portfolio, loading } = usePortfolio();

  if (loading) {
    return (
      <Section id="testimonials" eyebrow="Certifications & Achievements" title="Credentials that back the work." description="">
        <DataSkeleton lines={4} />
      </Section>
    );
  }

  const certifications = portfolio?.certifications ?? [];
  const achievements = portfolio?.achievements ?? [];

  return (
    <Section
      id="testimonials"
      eyebrow="Certifications & Achievements"
      title="Credentials that back the work."
      description="Verified certifications and milestones earned through continuous self-study and hands-on project building."
      className="pt-0 sm:pt-2"
    >
      {/* Certifications grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid gap-4 sm:grid-cols-3 mb-6"
      >
        {certifications.map((cert) => {
          const Icon = resolveIcon(cert.icon);
          return (
            <motion.div
              key={cert.title}
              variants={fadeUp}
              className={`card-premium group relative rounded-2xl border ${cert.border} bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-colors duration-300 flex flex-col gap-3`}
            >
              {Icon && (
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${cert.bg} ${cert.border} border ${cert.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white leading-snug">{cert.title}</p>
                <p className="text-xs text-slate-500 mt-1">{cert.issuer} · {cert.year}</p>
              </div>
              <div className={`absolute top-3 right-3 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${cert.bg} ${cert.color} border ${cert.border}`}>
                Certified
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Achievements */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {achievements.map((item) => {
          const Icon = resolveIcon(item.icon);
          return (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className={`card-premium group relative rounded-2xl border ${item.border} bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors duration-300 flex gap-4`}
            >
              {Icon && (
                <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.border} border ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} strokeWidth={1.6} />
                </div>
              )}
              <div>
                <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
