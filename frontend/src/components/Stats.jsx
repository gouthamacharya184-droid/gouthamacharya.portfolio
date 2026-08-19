/**
 * Stats.jsx — Animated stats counter
 *
 * Data (labels, values, icons) comes from backend via usePortfolio().
 * Animation and counter logic are pure UI concerns — correctly in the frontend.
 */

import { motion, useInView } from "framer-motion";
import Section from "./Section";
import { useRef, useEffect, useState } from "react";
import { usePortfolio, resolveIcon } from "../hooks/usePortfolio";
import DataSkeleton from "./DataSkeleton";

function useCountUp(target, duration = 1800, enabled = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };

    requestAnimationFrame(step);
  }, [enabled, target, duration]);

  return count;
}

function StatCard({ stat, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count  = useCountUp(stat.value, 1600 + index * 200, inView);
  const Icon   = resolveIcon(stat.icon);

  const display = count >= 1000
    ? count.toLocaleString() + stat.suffix
    : count + stat.suffix;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-6 hover:bg-white/[0.05] transition-all duration-500 cursor-default ${stat.hoverShadow}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${stat.color.replace("text-", "via-")} to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
      {Icon && (
        <div className={`inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl mb-4 border ${stat.bg} ${stat.border} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      )}
      <div className={`text-3xl sm:text-4xl font-black mb-1 tracking-tight tabular-nums ${stat.color}`}>
        {display}
      </div>
      <p className="text-xs sm:text-sm text-slate-400 font-medium">{stat.label}</p>
    </motion.div>
  );
}

export default function Stats() {
  const { portfolio, loading } = usePortfolio();

  if (loading) {
    return (
      <Section id="stats" eyebrow="By the Numbers" title="Quantifying the journey." description="">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xs:gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 animate-pulse h-32" />
          ))}
        </div>
      </Section>
    );
  }

  const stats = portfolio?.stats ?? [];

  return (
    <Section
      id="stats"
      eyebrow="By the Numbers"
      title="Quantifying the journey."
      description="A quick glance at the metrics behind the late-night coding sessions and model training runs."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xs:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>
    </Section>
  );
}
