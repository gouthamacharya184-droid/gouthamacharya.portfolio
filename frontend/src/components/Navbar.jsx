import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../hooks/usePortfolio";

/* ── Animated Hamburger ─────────────────────────────────── */
function HamburgerButton({ open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-[5px] h-12 w-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-slate-200 hover:bg-white/10 transition-all duration-200 shrink-0 ${open ? "hamburger-open" : ""}`}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={open}
      aria-controls="mobile-drawer"
    >
      <span className="hamburger-line" />
      <span className="hamburger-line" />
      <span className="hamburger-line" />
    </button>
  );
}

export default function Navbar() {
  const { portfolio } = usePortfolio();
  const navigation = portfolio?.navigation ?? [];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrollProgress, setScrollProgress] = useState(0);
  const drawerRef = useRef(null);

  // Scroll state + progress
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const total = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? window.scrollY / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section via IntersectionObserver
  useEffect(() => {
    const ids = ["home", ...navigation.map((n) => n.href.replace("#", ""))];
    const observers = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [navigation]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  // Close drawer on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeDrawer = useCallback(() => setOpen(false), []);

  const handleNavClick = useCallback((e, href) => {
    e.preventDefault();
    setOpen(false);
    document.body.style.overflow = "";
    document.body.style.touchAction = "";

    setTimeout(() => {
      if (href === "#home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const element = document.getElementById(href.replace("#", ""));
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 150);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#020817]/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      {/* ── Scroll Progress Bar ── */}
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
          <div className="h-10 w-10 xs:h-11 xs:w-11 md:h-12 md:w-12 rounded-xl bg-white/5 border border-cyan-400/25 shadow-[0_0_25px_rgba(34,211,238,0.12)] backdrop-blur-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] shrink-0">
            <div className="h-6 w-6 xs:h-7 xs:w-7 rounded-lg bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.4),rgba(15,23,42,0.85))] border border-cyan-300/25 flex items-center justify-center text-cyan-300 font-black text-[10px] xs:text-xs tracking-wider">
              GA
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-sm xs:text-base md:text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors truncate leading-tight whitespace-nowrap">
              Goutham Acharya
            </div>
            <div className="text-slate-400 text-[8px] xs:text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-0.5 truncate">
              AI · ML
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-8">
          <nav className="flex items-center gap-4 xl:gap-6 text-slate-300 text-sm font-medium" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative py-1 whitespace-nowrap transition-all duration-300 hover:text-white hover:translate-y-[-1px] ${
                    isActive ? "text-cyan-300 font-semibold" : "text-slate-300"
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
            className="h-10 px-5 flex items-center justify-center rounded-xl bg-cyan-400 text-slate-950 text-sm font-bold shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.45)] active:scale-[0.98]"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <HamburgerButton open={open} onClick={() => setOpen((v) => !v)} />
        </div>
      </div>

      {/* ── Mobile Drawer with Backdrop ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="drawer-backdrop lg:hidden"
              onClick={closeDrawer}
              aria-hidden="true"
            />

            {/* Slide-in Drawer */}
            <motion.div
              key="mobile-drawer"
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
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
                    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                      className={`relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all duration-200 min-h-[52px] ${
                        isActive
                          ? "bg-cyan-500/10 border border-cyan-400/20 text-cyan-300"
                          : "border border-transparent text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/8"
                      }`}
                    >
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                      )}
                      {!isActive && <span className="h-1.5 w-1.5 rounded-full bg-transparent shrink-0" />}
                      {item.label}
                      {isActive && (
                        <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-cyan-400/60">
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
                  className="flex items-center justify-center w-full min-h-[54px] rounded-xl bg-cyan-400 text-slate-950 text-base font-bold shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-cyan-300 transition-all duration-200 active:scale-[0.98]"
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
