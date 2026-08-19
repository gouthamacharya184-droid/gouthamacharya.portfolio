/**
 * DataSkeleton.jsx — Loading placeholder while backend data is being fetched
 *
 * Shown by any component that is waiting for portfolio data from the API.
 * Prevents blank/broken renders during the initial fetch.
 */

export default function DataSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} aria-busy="true" aria-label="Loading...">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg bg-white/5"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
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
