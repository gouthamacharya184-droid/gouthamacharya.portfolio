import React, { useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const titleId = useId();

  // Close on Escape key
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen, handleKey]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[size] || 'max-w-md';

  return (
    <AnimatePresence>
      {isOpen && (
        /* On mobile: full-screen bottom sheet style with sm:centered modal */
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm">
          {/* Backdrop click handler */}
          <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

          {/* Modal Panel — slides up on mobile, scales in on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? "Modal dialog" : undefined}
            className={`relative w-full ${sizeClasses} bg-[#050e1f] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-[0_-20px_80px_rgba(0,0,0,0.7)] sm:shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[92svh] sm:max-h-[90svh] z-10`}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 xs:px-6 py-3 xs:py-5 border-b border-white/8 shrink-0">
              <h2 id={titleId} className="text-sm xs:text-base font-bold text-white truncate pr-4">
                {title ?? ""}
              </h2>
              <button
                onClick={onClose}
                className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto overscroll-contain p-4 xs:p-6 text-sm text-slate-300 -webkit-overflow-scrolling-touch">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
