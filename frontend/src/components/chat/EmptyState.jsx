import React from 'react';
import { motion } from 'framer-motion';
import { Bot, HelpCircle, Code, Briefcase, FileText, Send } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: HelpCircle,
    label: "Background",
    text: "Tell me about Goutham's AI engineering background."
  },
  {
    icon: Code,
    label: "Skills",
    text: "What tools and frameworks is he expert in?"
  },
  {
    icon: Briefcase,
    label: "Projects",
    text: "Show me his top AI / RAG projects."
  },
  {
    icon: FileText,
    label: "Contact",
    text: "How can I contact Goutham or view his resume?"
  }
];

export default function EmptyState({ onSend, fullscreen, disabled = false }) {
  return (
    <div className={`w-full flex flex-col items-center justify-center text-center ${
      fullscreen ? "space-y-8 py-10" : "space-y-6 py-4"
    }`}>
      <div className="flex flex-col items-center">
        {/* Animated Avatar Glow */}
        <motion.div
          initial={{ scale: 0.9, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`relative rounded-[24px] bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.12)] ${
            fullscreen ? "h-16 w-16 mb-4" : "h-12 w-12 mb-3"
          }`}
        >
          <Bot size={fullscreen ? 30 : 24} className="text-cyan-400" />
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#0d1117]"></span>
          </span>
        </motion.div>

        <h2 className={`font-bold text-white tracking-tight leading-snug ${
          fullscreen ? "text-2xl sm:text-3xl mb-2" : "text-lg mb-1.5"
        }`}>
          Ask Goutham's AI Assistant
        </h2>
        <p className={`text-slate-400 max-w-md mx-auto leading-relaxed ${
          fullscreen ? "text-sm" : "text-xs px-2"
        }`}>
          I'm trained on Goutham's background to help you learn about his skills, projects, and goals. Choose a topic below or type anything!
        </p>
      </div>

      {/* Grid of Suggestions */}
      <div className={`grid w-full max-w-xl ${
        fullscreen ? "grid-cols-2 gap-3" : "grid-cols-1 gap-2 px-2"
      }`}>
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={idx}
              whileHover={disabled ? {} : { scale: 1.02, y: -1, backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(34,211,238,0.25)" }}
              whileTap={disabled ? {} : { scale: 0.98 }}
              onClick={() => !disabled && onSend(item.text)}
              disabled={disabled}
              className={`flex items-center gap-3 text-left rounded-xl bg-white/[0.015] border border-white/5 transition-all duration-200 group relative overflow-hidden shadow-sm ${
                disabled
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : 'text-slate-300 hover:text-cyan-300 cursor-pointer'
              } ${
                fullscreen ? "px-4 py-3" : "px-3 py-2.5"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-400/20 transition-all shrink-0">
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold group-hover:text-cyan-400/70 transition-colors">
                  {item.label}
                </p>
                <p className={`text-slate-300 font-medium truncate ${fullscreen ? "text-xs mt-0.5" : "text-[11px] mt-0.5"}`}>
                  {item.text}
                </p>
              </div>
              <Send size={11} className="text-slate-600 group-hover:text-cyan-400 absolute right-4 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300" />
            </motion.button>
          );
        })}
      </div>

      {disabled && (
        <p className="text-rose-400/70 text-[11px] font-medium mt-2">
          AI assistant is currently offline. Please try again later.
        </p>
      )}
    </div>
  );
}
