/**
 * App.jsx — Application root
 *
 * Security architecture:
 *  - <PortfolioProvider> wraps the entire app. ALL portfolio content
 *    (profile, projects, skills, etc.) is fetched from the backend API
 *    on mount. No content data is hardcoded in any frontend file.
 *  - `apiBaseUrl` is derived from the VITE_API_BASE_URL env var (production)
 *    or left empty (development, where Vite proxy handles /api/*).
 *
 * Performance notes:
 *  - Noise overlay removed (was causing constant GPU repaints at 5fps).
 *  - Background simplified to a single static gradient (no CSS variable transitions).
 *  - Scroll handler throttled via requestAnimationFrame to avoid per-pixel callbacks.
 *  - Loader timeout reduced to 600ms.
 *  - Theme state/toggle removed (dark-only, no toggle visible in UI).
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortfolioProvider } from "./hooks/usePortfolio";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Timeline from "./components/Timeline";
import Blog from "./components/Blog";
import Testimonials from "./components/Testimonials";
import ErrorBoundary from "./components/ErrorBoundary";
import Chatbot from "./components/Chatbot";
import { ChatProvider } from "./hooks/useChat";
import NeuralNetworkBackground from "./components/NeuralNetworkBackground";

// ── Loader ────────────────────────────────────────────────────────────────────

function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#010614]"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-14 w-14 xs:h-16 xs:w-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border border-cyan-400/20 flex items-center justify-center p-2">
            <img src="/favicon.png?v=4" alt="GA Monogram" className="h-full w-full object-contain" />
          </div>
        </div>
        <p className="text-[10px] xs:text-xs uppercase tracking-[0.4em] text-slate-500 font-medium">
          Loading portfolio
        </p>
      </div>
    </motion.div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // Hide scroll-to-top button on mobile/tablet (≤ 1024px)
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches
  );
  const rafRef = useRef(null);

  // Derive the API base URL with production fallback.
  const apiBaseUrl = useMemo(() => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host !== "localhost" && host !== "127.0.0.1" && !host.startsWith("192.168.")) {
        return "https://goutham-portfolio.onrender.com";
      }
    }
    return "";
  }, []);

  useEffect(() => {
    // Track viewport changes (e.g. rotation, resize)
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleMq = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handleMq);

    // Throttle scroll handler via rAF — avoids firing on every pixel
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > 400);
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Reduced from 1100ms — let the browser paint first, then remove loader
    const timeout = window.setTimeout(() => setIsLoading(false), 600);

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    return () => {
      mq.removeEventListener("change", handleMq);
      window.clearTimeout(timeout);
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Apply dark class once on mount — dark-only site
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ErrorBoundary>
      <PortfolioProvider apiBaseUrl={apiBaseUrl}>
        <ChatProvider apiBaseUrl={apiBaseUrl}>
          <div className="min-h-screen bg-[#010614] text-white overflow-x-hidden relative selection:bg-cyan-500/30 selection:text-cyan-100">
            <AnimatePresence>{isLoading ? <Loader /> : null}</AnimatePresence>

            {/* Static background gradient — no animation, no repaint cost */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.08),transparent_50%),linear-gradient(to_bottom,#010614,#010614)]" />
            {/* Subtle dot grid — static, no transitions */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(56,189,248,0.05) 1px, transparent 0)", backgroundSize: "48px 48px" }} />

            {/* Dynamic interactive neural network background */}
            <NeuralNetworkBackground />

            <div className="relative z-20">
              <Navbar />

              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0.35 : 1 }}
                transition={{ duration: 0.7 }}
                className="relative overflow-hidden"
              >
                <Hero apiBaseUrl={apiBaseUrl} />
                <About />
                <Timeline />
                <Projects />
                <Skills />
                <Testimonials />
                <Blog />
                <Contact apiBaseUrl={apiBaseUrl} />
              </motion.main>

              <Footer apiBaseUrl={apiBaseUrl} />
            </div>

            {/* Floating UI Elements */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
              <div className="pointer-events-auto flex flex-col items-end gap-4">
                <AnimatePresence>
                  {isDesktop && showScrollTop && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="h-12 w-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-cyan-400 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg"
                      aria-label="Scroll back to top"
                      title="Scroll to Top"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
                <Chatbot apiBaseUrl={apiBaseUrl} />
              </div>
            </div>
          </div>
        </ChatProvider>
      </PortfolioProvider>
    </ErrorBoundary>
  );
}
