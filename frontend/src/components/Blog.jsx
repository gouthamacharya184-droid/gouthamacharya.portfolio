/**
 * Blog.jsx — UI-only component
 *
 * Blog topic data comes from backend via usePortfolio(). This component
 * only renders the content it receives — no data hardcoded here.
 */

import { motion } from "framer-motion";
import { ArrowRight, PenLine, Sparkles } from "lucide-react";
import Section from "./Section";
import { fadeUp, stagger } from "../utils/motion";
import { usePortfolio } from "../hooks/usePortfolio";
import DataSkeleton from "./DataSkeleton";

export default function Blog() {
  const { portfolio, loading } = usePortfolio();

  if (loading) {
    return (
      <Section id="blog" eyebrow="Writing & Thoughts" title="Ideas I'm developing." description="">
        <DataSkeleton lines={3} />
      </Section>
    );
  }

  const topics      = portfolio?.blogTopics ?? [];
  const githubUrl   = portfolio?.profile?.github ?? "https://github.com";

  return (
    <Section
      id="blog"
      eyebrow="Writing & Thoughts"
      title="Ideas I'm developing into articles."
      description="Topics I'm actively researching and writing about — rooted in real experiments, not theory."
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid gap-4 xs:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      >
        {topics.map((article) => (
          <motion.article
            key={article.title}
            variants={fadeUp}
            className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-cyan-400/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.07)]"
          >
            <div className={`inline-flex items-center gap-1.5 self-start rounded-full border ${article.statusBorder} ${article.statusBg} px-2.5 py-1 mb-4`}>
              <PenLine size={11} className={article.statusColor} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${article.statusColor}`}>{article.status}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors leading-snug">
              {article.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-grow mb-5">{article.excerpt}</p>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              {article.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-medium text-slate-400">{tag}</span>
              ))}
            </div>
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-8 flex flex-col items-center gap-3 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/5 px-4 py-2 text-xs text-cyan-400">
          <Sparkles size={13} />
          Articles will be published on Medium / Dev.to — stay tuned!
        </div>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
        >
          Follow my GitHub for project updates <ArrowRight size={15} />
        </a>
      </motion.div>
    </Section>
  );
}
