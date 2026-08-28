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
import { getApiBaseUrl } from "../utils/api";

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
  const socialLinks  = portfolio?.socialLinks ?? [];

  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  const backendUrl = useMemo(() => getApiBaseUrl(apiBaseUrl), [apiBaseUrl]);

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
            <a
              href={`${backendUrl}/api/social/whatsapp`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/8 px-3 xs:px-4 py-1.5 xs:py-2 text-xs xs:text-sm text-emerald-200 hover:bg-emerald-500/15 transition-all group/wa"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-400 group-hover/wa:fill-white transition-colors duration-300" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.05c0 2.123.554 4.197 1.604 6.046L0 24l6.101-1.601a11.801 11.801 0 005.947 1.606h.005c6.634 0 12.043-5.412 12.046-12.051a11.81 11.81 0 00-3.447-8.504z"/>
              </svg>
              WhatsApp
            </a>
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
                    isValidEmail(form.email) ? (
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
                  className={`${inputClass} pr-10 ${
                    form.email
                      ? isValidEmail(form.email)
                        ? "border-emerald-500/50 focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
                        : "border-rose-500/50 focus:border-rose-400/60 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                      : ""
                  }`}
                  placeholder="your@email.com"
                />
                <AnimatePresence mode="wait">
                  {form.email && (
                    <motion.div
                      key={isValidEmail(form.email) ? "ok" : "bad"}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      {isValidEmail(form.email)
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
