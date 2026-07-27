/**
 * Contact.jsx — UI only
 *
 * Security notes:
 *  - No credentials, API keys, or private email addresses are stored here.
 *  - Client-side validation (email regex, field lengths) is UX feedback only.
 *    The backend re-validates everything via Zod before processing.
 *  - The contact form POSTs to /api/contact — all business logic is on the backend.
 *  - Raw API error responses are never forwarded to the user (generic messages only).
 */
import { LoaderCircle, MailCheck, MessageCircleWarning, Send, Mail, Copy, Check, X as XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import Section from "./Section";
import { usePortfolio, resolveIcon } from "../hooks/usePortfolio";
import { fadeUp } from "../utils/motion";

// NOTE: DISPLAY_EMAIL is now served from the backend (portfolio.profile.displayEmail).
// This constant is intentionally removed from the frontend — all portfolio content
// is a single source of truth on the backend.
const initialState = { name: "", email: "", message: "" };
const inputClass =
  "w-full min-h-[48px] rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] focus:bg-slate-950/80";

function EmailCopyChip({ email }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silent fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-cyan-400/25 hover:bg-cyan-500/5 transition-all duration-200 w-full text-left"
      title="Copy email address"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-cyan-400">
        <Mail size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-0.5">Email</p>
        <p className="text-sm font-medium text-slate-200 truncate">{email}</p>
      </div>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={16} className="text-emerald-400 shrink-0" />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy size={15} className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// RFC-5322 simplified email regex
const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());

export default function Contact({ apiBaseUrl }) {
  const { portfolio } = usePortfolio();
  const displayEmail = portfolio?.profile?.displayEmail ?? "";
  const socialLinks = portfolio?.socialLinks ?? [];

  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  const backendUrl = useMemo(() => apiBaseUrl.replace(/\/$/, ""), [apiBaseUrl]);

  // Fix 19: Memoize email validation — previously computed 4x per render
  const emailValid = useMemo(() => isValidEmail(form.email), [form.email]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((cur) => ({ ...cur, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });
    try {
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Use server message if present, or a generic fallback.
        // NEVER display raw Error objects — they may contain backend internals.
        throw new Error(payload.message || "Unable to send message right now.");
      }
      setForm(initialState);
      setStatus({ type: "success", message: payload.message || "Message sent! I'll get back to you soon." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let's build something valuable together."
      description="For opportunities, collaborations, and AI-focused conversations."
      className="pb-24 xs:pb-28"
    >
      <div className="grid gap-6 xs:gap-8 grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">

        {/* Left info card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-2xl xs:rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 xxs:p-5 xs:p-8 flex flex-col gap-4 xs:gap-5"
        >
          <div>
            <p className="text-[10px] xs:text-xs uppercase tracking-[0.25em] text-slate-500">Connect</p>
            <h3 className="mt-3 xs:mt-4 text-2xl xs:text-3xl font-bold text-white">{portfolio?.profile?.name ?? "Goutham Acharya"}</h3>
            <p className="mt-3 xs:mt-4 text-sm xs:text-base leading-relaxed text-slate-400">
              I'm open to internship opportunities, project collaboration, and conversations around
              practical AI, NLP, LLM quality, and workflow automation.
            </p>
          </div>

          {/* Email copy chip — email comes from backend portfolio.profile.displayEmail */}
          <EmailCopyChip email={displayEmail} />

          {/* Social links */}
          <div className="flex flex-wrap gap-2 xs:gap-3">
            {socialLinks.map(({ label, href, icon: iconName }) => {
              const Icon = resolveIcon(iconName);
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm text-white hover:bg-white/10 transition-all"
                >
                  {Icon && <Icon size={14} />}
                  {label}
                </a>
              );
            })}

          </div>

          <div className="rounded-xl xs:rounded-2xl border border-white/8 bg-slate-900/40 p-4 xs:p-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              Sensitive contact data stays on the backend. The form posts to a secured API, validates input, and
              forwards the message through email transport configured in environment variables.
            </p>
          </div>
        </motion.div>

        {/* Right form */}
        <motion.form
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          onSubmit={submitForm}
          className="rounded-2xl xs:rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 xxs:p-5 xs:p-8"
        >
          <div className="grid gap-4 xs:gap-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-xs xs:text-sm font-medium text-slate-300">Name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} required maxLength={80} autoComplete="name" className={inputClass} placeholder="Your name" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="email" className="text-xs xs:text-sm font-medium text-slate-300">Email</label>
                <AnimatePresence mode="wait">
                  {form.email && (
                    emailValid ? (
                      <motion.span
                        key="valid"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400"
                      >
                        <Check size={13} /> Valid email
                      </motion.span>
                    ) : (
                      <motion.span
                        key="invalid"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-rose-400"
                      >
                        <XIcon size={13} /> Invalid email
                      </motion.span>
                    )
                  )}
                </AnimatePresence>
              </div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  maxLength={120}
                  autoComplete="email"
                  className={`${inputClass} pr-10 ${form.email
                      ? emailValid
                        ? "border-emerald-500/50 focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
                        : "border-rose-500/50 focus:border-rose-400/60 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                      : ""
                    }`}
                  placeholder="your@email.com"
                />
                <AnimatePresence mode="wait">
                  {form.email && (
                    <motion.div
                      key={emailValid ? "ok" : "bad"}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      {emailValid
                        ? <Check size={16} className="text-emerald-400" />
                        : <XIcon size={16} className="text-rose-400" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-xs xs:text-sm font-medium text-slate-300">Message</label>
              <textarea id="message" name="message" value={form.message} onChange={onChange} required rows={6} maxLength={1200} className={`${inputClass} resize-none`} placeholder="Tell me about your opportunity or project" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 xs:py-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] min-h-[52px]"
            >
              {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}
              {loading ? "Sending..." : "Send Message"}
            </button>
            {status.type === "success" && (
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-500/8 px-4 py-3 text-xs xs:text-sm text-emerald-200">
                <MailCheck size={15} className="shrink-0" />{status.message}
              </div>
            )}
            {status.type === "error" && (
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-rose-400/20 bg-rose-500/8 px-4 py-3 text-xs xs:text-sm text-rose-200">
                <MessageCircleWarning size={15} className="shrink-0" />{status.message}
              </div>
            )}
          </div>
        </motion.form>
      </div>
    </Section>
  );
}
