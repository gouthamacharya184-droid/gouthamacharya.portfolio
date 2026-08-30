import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-1 py-1">
      {[0, 120, 240].map((d, i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-cyan-400/60"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: d / 1000, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
