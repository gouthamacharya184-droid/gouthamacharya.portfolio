/**
 * DataSkeleton.jsx — Loading placeholder while backend data is being fetched
 *
 * Fixes applied:
 *  - Added shimmer animation gradient for a more polished loading experience.
 *    The shimmer uses CSS keyframes defined in styles.css (animate-shimmer-text
 *    is already in global styles). We use a local inline keyframe via Tailwind's
 *    arbitrary background approach and animate-pulse for simplicity.
 */

export default function DataSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading...">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg overflow-hidden relative"
          style={{ width: `${85 - i * 10}%` }}
        >
          {/* Base layer */}
          <div className="absolute inset-0 bg-white/5 rounded-lg" />
          {/* Shimmer overlay — slides across the skeleton bar */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 60%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: `skeleton-shimmer ${1.5 + i * 0.15}s ease-in-out infinite`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

/** Full-section error state */
export function DataError({ message }) {
  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/5 px-6 py-8 text-center">
      <p className="text-sm text-rose-300">{message ?? "Content unavailable. Please try refreshing."}</p>
    </div>
  );
}
