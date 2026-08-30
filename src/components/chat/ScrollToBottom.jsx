import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function ScrollToBottom({ onClick, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="absolute bottom-24 right-6 z-30 h-9 w-9 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-cyan-400 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
