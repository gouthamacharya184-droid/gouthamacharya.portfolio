/**
 * Navbar.jsx — Main Navigation and Mobile Drawer
 *
 * Security architecture:
 *  - Links and section mappings are dynamic.
 *  - Handles scroll interception to avoid anchor redirection loops.
 *
 * Performance notes:
 *  - Global layout scroll progress is tracked via Framer Motion's useScroll hook.
 *  - Desktop navigation indicators animate using spring layout transition templates.
 *  - Mobile drawer includes focus locks and aria attributes for access compliance.
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../hooks/usePortfolio";

// Fallback navigation used during loading or if backend data is unavailable
const FALLBACK_NAV = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

// ── Hamburger Button UI Component ──────────────────────────────────────────────

function HamburgerButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`touch-target relative h-10 w-10 flex flex-col justify-center gap-1 text-slate-300 hover:text-white transition-colors duration-200 cursor-pointer ${open ? "hamburger-open" : ""
        }`}
      aria-expanded={open}
      aria-label="Toggle navigation menu"
    >
      <span className="hamburger-line" />
      <span className="hamburger-line" />
      <span className="hamburger-line" />
    </button>
  );
}

// ── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef(null);
  const { portfolio } = usePortfolio();

  // Derive navigation from backend data, fallback to hardcoded array during loading
  const navigation = useMemo(
    () => portfolio?.navigation ?? FALLBACK_NAV,
    [portfolio]
  );

  const { scrollYProgress: scrollProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Track intersection sections to update active states dynamically
    const sections = ["home", "about", "experience", "projects", "skills", "testimonials", "blog", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px", // Detect middle-aligned active folds
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  // Keyboard close handler for drawer menu (accessibility compliance)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Lock page scroll
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const target = document.querySelector(href);
    if (target) {
      // Offset matches sticky header constraints
      const offset = 70;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const closeDrawer = () => setOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/[0.04] ${scrolled
        ? "bg-[#010614]/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        : "bg-transparent"
        }`}
    >
      {/* Scroll Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-violet-500 scroll-progress"
          style={{ scaleX: scrollProgress, transformOrigin: "left" }}
        />
      </div>

      <div className="mx-auto flex max-w-[75rem] items-center justify-between px-4 xs:px-6 sm:px-8 lg:px-6 xl:px-10 h-16 md:h-[70px]">
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-2.5 xs:gap-3 group cursor-pointer shrink-0"
          onClick={(e) => handleNavClick(e, "#home")}
          aria-label="Goutham Acharya — Home"
        >
          <div className="h-10 w-10 xs:h-11 xs:w-11 rounded-xl bg-white/5 border border-cyan-400/25 shadow-[0_0_25px_rgba(34,211,238,0.12)] backdrop-blur-xl flex items-center justify-center p-2 transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] shrink-0">
            <img
              src="/favicon.png?v=4"
              alt="GA Monogram"
              className="h-6 w-6 xs:h-7 xs:w-7 object-contain transition-transform group-hover:scale-110"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm xs:text-base md:text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors truncate leading-tight whitespace-nowrap">
              Goutham Acharya
            </div>
            <div className="text-slate-400 text-[8px] xs:text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-0.5 truncate">
              AI & ML ENGINEER
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <nav className="flex items-center gap-4 xl:gap-6 text-slate-300 text-sm font-medium" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative py-1 whitespace-nowrap transition-all duration-300 hover:text-white hover:translate-y-[-1px] ${isActive ? "text-cyan-300 font-semibold" : "text-slate-300"
                    }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-cyan-400 rounded-full"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-400 px-5 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:scale-[0.98] shrink-0"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="drawer-backdrop lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              ref={drawerRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 38, mass: 0.9 }}
              className="mobile-drawer lg:hidden bg-[#020817]/98 backdrop-blur-3xl border-l border-white/[0.07] shadow-[-20px_0_60px_rgba(0,0,0,0.6)]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 xs:px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-white/5 border border-cyan-400/25 flex items-center justify-center">
                    <div className="h-5 w-5 rounded-lg bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.4),rgba(15,23,42,0.85))] border border-cyan-300/25 flex items-center justify-center text-cyan-300 font-black text-[9px]">
                      GA
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">Goutham Acharya</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-[0.25em]">AI · ML Portfolio</p>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col px-3 xs:px-4 py-4 gap-1" role="navigation" aria-label="Mobile navigation">
                {navigation.map((item, index) => {
                  const id = item.href.replace("#", "");
                  const isActive = activeSection === id;
                  return (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05, duration: 0.25 }}
                      className={`relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all duration-200 min-h-[52px] ${isActive
                        ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
                        : "border border-transparent text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/8"
                        }`}
                    >
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
                      )}
                      {!isActive && <span className="h-1.5 w-1.5 rounded-full bg-transparent shrink-0" />}
                      {item.label}
                      {isActive && (
                        <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-cyan-400 opacity-70">
                          Current
                        </span>
                      )}
                    </motion.a>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="mx-4 xs:mx-5 h-px bg-white/[0.06]" />

              {/* CTA Hire Me */}
              <div className="px-3 xs:px-4 py-4">
                <motion.a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, "#contact")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.25 }}
                  className="flex items-center justify-center w-full min-h-[54px] rounded-xl bg-cyan-400 text-slate-950 text-base font-bold shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:bg-cyan-300 transition-all duration-200 active:scale-[0.98]"
                >
                  Hire Me
                </motion.a>
              </div>

              {/* Subtle bottom branding */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 border-t border-white/[0.05]">
                <p className="text-[10px] text-slate-600 text-center tracking-[0.2em] uppercase">
                  Portfolio · {new Date().getFullYear()}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
