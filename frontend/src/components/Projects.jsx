/**
 * Projects.jsx — Grid of selected builds / Fold 4
 *
 * Security architecture:
 *  - Links, descriptions, title and stacked technologies are loaded dynamically
 *    from `usePortfolio` context hooks.
 *
 * Performance notes:
 *  - Cards utilize spring-damped 3D tilt effects via Framer Motion useSpring.
 *  - Modal updates/close logic run standard react state changes without blocking thread.
 */

import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import Section from "./Section";
import { fadeUp, stagger } from "../utils/motion";
import Modal from "./ui/Modal";
import ProgressiveImage from "./ProgressiveImage";
import { usePortfolio } from "../hooks/usePortfolio";
import DataSkeleton from "./DataSkeleton";
import { ChevronRight, Github, Info } from "lucide-react";

// ── Interactive Tilt Component (GPU accelerated) ─────────────────────────────

function ProjectTiltCard({ children, disabled }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    if (disabled) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={disabled ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative z-10 w-full cursor-pointer tilt-card group/card"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl xs:rounded-[2rem] opacity-0 transition duration-300 group-hover/card:opacity-100 z-30"
        style={{
          background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(34, 211, 238, 0.15), transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

export default function Projects() {
  const { portfolio, loading, getAssetUrl } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState(null);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

  if (loading) return (
    <Section id="projects" eyebrow="Projects" title="Selected builds." description="">
      <DataSkeleton lines={4} />
    </Section>
  );

  const projects = portfolio?.projects ?? [];

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Selected builds around analysis, reliability, and AI workflows."
      description="Each project highlights structured thinking, experimentation, and applied problem solving."
    >
      {/* All 3 projects in equal 3-col grid */}
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid gap-5 xs:gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <motion.div key={project.title} variants={fadeUp} className="flex">
            <ProjectTiltCard disabled={isTouch}>
              <article onClick={() => setSelectedProject(project)} className="group relative overflow-hidden rounded-2xl xs:rounded-[2rem] border border-cyan-400/10 bg-white/[0.04] transition-colors duration-300 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(34,211,238,0.12)] hover:border-cyan-400/25 h-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020817]/80 pointer-events-none z-10" />
                <div className="relative overflow-hidden border-b border-white/8 bg-[#071225]/60 aspect-video">
                  <div className="absolute inset-0 bg-cyan-500/15 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <ProgressiveImage src={getAssetUrl(project.image)} alt={project.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#010614]/80 backdrop-blur-md p-2 rounded-full border border-white/10 text-cyan-400"><Info size={16} /></div>
                  </div>
                </div>
                <div className="p-4 xxs:p-5 xs:p-6 sm:p-7 flex flex-col flex-grow relative z-20" style={{ transform: "translateZ(20px)" }}>
                  <div className="flex flex-wrap gap-1.5 xs:gap-2 mb-3 xs:mb-4">
                    {project.stack.map((item) => (
                      <span key={item} className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-2.5 py-1 text-[9px] xs:text-[10px] uppercase tracking-wide text-cyan-200">{item}</span>
                    ))}
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-white group-hover:text-cyan-300 transition-colors leading-snug">{project.title}</h3>
                  <p className="mt-3 text-xs xs:text-sm leading-relaxed text-slate-400 flex-grow line-clamp-3">{project.description}</p>
                  <div className="mt-5 xs:mt-6 flex items-center justify-between pt-4 xs:pt-5 border-t border-cyan-400/8">
                    <span className="text-[10px] xs:text-xs font-semibold uppercase tracking-widest text-cyan-400/60 group-hover:text-cyan-400 transition-colors flex items-center gap-1">View Details <ChevronRight size={13} /></span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <a href={project.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 xs:gap-2 rounded-full border border-cyan-400/20 bg-[#071225]/80 px-3 xs:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs text-slate-200 hover:bg-cyan-400/10 hover:text-white transition-all">
                        <Github size={13} /> Code
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </ProjectTiltCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.title} size="4xl">
        {selectedProject && (
          <div className="grid gap-6 xs:gap-8 md:gap-10 grid-cols-1 md:grid-cols-[0.45fr_0.55fr]">
            <div className="space-y-5 xs:space-y-6">
              <div className="rounded-xl xs:rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl">
                <ProgressiveImage src={getAssetUrl(selectedProject.image)} alt={selectedProject.title} className="w-full h-auto aspect-video" />
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] xs:text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.stack.map((tech) => (
                    <span key={tech} className="px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs xs:text-sm text-slate-300">{tech}</span>
                  ))}
                </div>
              </div>
              <a href={selectedProject.links.github} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-cyan-500 px-5 xs:px-6 py-3 xs:py-4 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <Github size={18} /> View Source Code
              </a>
            </div>
            <div className="space-y-6 xs:space-y-8">
              <div className="space-y-3 xs:space-y-4">
                <h4 className="text-[10px] xs:text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">Overview</h4>
                <p className="text-sm xs:text-base sm:text-lg leading-relaxed text-slate-200">{selectedProject.description}</p>
              </div>
              <div className="space-y-3 xs:space-y-4">
                <h4 className="text-[10px] xs:text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">Key Features & Achievements</h4>
                <ul className="space-y-3">
                  {selectedProject.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex gap-3 xs:gap-4 p-3 xs:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="h-5 w-5 xs:h-6 xs:w-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] xs:text-xs font-bold text-cyan-400">{idx + 1}</span>
                      </div>
                      <p className="text-xs xs:text-sm text-slate-300 leading-relaxed">{bullet}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 xs:p-6 rounded-xl xs:rounded-2xl bg-gradient-to-br from-cyan-500/8 to-transparent border border-cyan-500/10">
                <h4 className="text-[10px] xs:text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold mb-2 xs:mb-3">Project Impact</h4>
                {/* Fix 21: Dynamic project.impact from backend — removes hardcoded boilerplate */}
                <p className="text-xs xs:text-sm text-slate-400 leading-relaxed italic">
                  {selectedProject.impact || "This project demonstrates a structured approach to problem-solving in the AI domain, focusing on data reliability and high-quality model outputs."}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Section>
  );
}
