import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary', // primary, secondary, transparent, danger
  size = 'md', // sm, md, lg
  className = '',
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]",
    secondary: "bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 hover:text-white",
    transparent: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
    danger: "bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4.5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
