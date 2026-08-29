/**
 * Footer.jsx — UI-only component
 *
 * Security fix: removed hardcoded phone number and hardcoded Instagram/LinkedIn
 * URLs. Social links now come exclusively from backend via portfolio.socialLinks.
 * Only the WhatsApp backend redirect and GitHub (from profile.github) remain
 * as separate constructs; all others are from the API.
 */

import { usePortfolio, resolveIcon } from "../hooks/usePortfolio";
import { Phone } from "lucide-react";

export default function Footer({ apiBaseUrl }) {
  const { portfolio } = usePortfolio();
  const githubUrl = portfolio?.profile?.github ?? "https://github.com";
  const socialLinks = portfolio?.socialLinks ?? [];
  const backendUrl = (apiBaseUrl ?? "").replace(/\/$/, "");
  const year = new Date().getFullYear();

  const instagramLink = socialLinks.find(({ label }) => label.toLowerCase().includes("instagram"));
  const linkedinLink = socialLinks.find(({ label }) => label.toLowerCase().includes("linkedin"));

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#010614] pt-10 xs:pt-12 pb-8 overflow-hidden z-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(14,165,233,0.05),transparent_45%)] pointer-events-none" />

      <div className="mx-auto flex max-w-[75rem] flex-col px-4 xs:px-6 sm:px-8 md:px-10 xl:px-14 relative z-10">

        {/* Top Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-6 mb-6 xs:mb-8 sm:mb-10">

          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-3 group cursor-pointer shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Goutham Acharya — back to top"
          >
            <div className="h-9 w-9 rounded-xl bg-white/5 border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)] flex items-center justify-center p-1.5 transition-all group-hover:scale-105 group-hover:border-cyan-400/40">
              <img
                src="/favicon.png?v=4"
                alt="GA Monogram"
                className="h-6 w-6 object-contain transition-transform group-hover:scale-110"
              />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Goutham Acharya
              </div>
              <div className="text-slate-500 text-[9px] tracking-[0.3em] uppercase mt-0.5">AI & ML ENGINEER</div>
            </div>
          </a>

          {/* Social Links — from backend API */}
          <div className="flex flex-row flex-wrap items-center justify-center sm:justify-start gap-4 xs:gap-5 sm:gap-7 w-full sm:w-auto">

            {/* 1. Call — via backend redirect */}
            <a
              href={`${backendUrl}/api/social/call`}
              aria-label="Call contact"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Phone size={20} strokeWidth={1.8} aria-hidden="true" />
              <span className="text-[10px] font-medium tracking-wide">Call</span>
            </a>

            {/* 2. GitHub — from backend profile */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <span className="text-[10px] font-medium tracking-wide">GitHub</span>
            </a>

            {/* 3. Instagram — from backend socialLinks */}
            {(() => {
              if (!instagramLink) return null;
              const Icon = resolveIcon(instagramLink.icon);
              return (
                <a
                  href={instagramLink.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram profile"
                  className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-pink-400 transition-colors"
                >
                  {Icon && <Icon size={20} strokeWidth={1.8} aria-hidden="true" />}
                  <span className="text-[10px] font-medium tracking-wide">Instagram</span>
                </a>
              );
            })()}

            {/* 4. LinkedIn — from backend socialLinks */}
            {(() => {
              if (!linkedinLink) return null;
              const Icon = resolveIcon(linkedinLink.icon);
              return (
                <a
                  href={linkedinLink.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn profile"
                  className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {Icon && <Icon size={20} strokeWidth={1.8} aria-hidden="true" />}
                  <span className="text-[10px] font-medium tracking-wide">LinkedIn</span>
                </a>
              );
            })()}

            {/* 5. WhatsApp — via backend redirect */}
            <a
              href={`${backendUrl}/api/social/whatsapp`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp contact"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors group/wa"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-slate-400 group-hover/wa:fill-emerald-400 transition-colors duration-300"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.05c0 2.123.554 4.197 1.604 6.046L0 24l6.101-1.601a11.801 11.801 0 005.947 1.606h.005c6.634 0 12.043-5.412 12.046-12.051a11.81 11.81 0 00-3.447-8.504z" />
              </svg>
              <span className="text-[10px] font-medium tracking-wide">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06] mb-5 xs:mb-6" />

        {/* Bottom */}
        <div className="flex flex-col xs:flex-row items-center justify-between gap-3 text-[11px] xs:text-xs sm:text-sm text-slate-600">
          <p>© {year} Goutham Acharya. All rights reserved.</p>
          <p className="italic text-center xs:text-right">
            Crafting intelligent experiences at the intersection of{" "}
            <span className="text-cyan-500/60 font-semibold not-italic">AI</span>
            {" & "}
            <span className="text-cyan-500/60 font-semibold not-italic">Machine Learning</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
