/**
 * ProgressiveImage.jsx
 *
 * Performance fix: removed the JS `new Image()` pre-loader that was causing
 * a double-fetch (one via JS, one via the native <img> element). Now uses
 * native onLoad/onError handlers directly on the <img> tag.
 *
 * Animation fix: removed `filter: blur()` from Framer Motion to avoid
 * expensive per-frame CSS filter paints. Uses opacity-only transition instead.
 */
import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function ProgressiveImage({
  src,
  alt,
  className,
  style,
  loading = "lazy",
  priority = false,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-800/60 to-cyan-900/20 ${className || ""}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-2 text-slate-600">
          <ImageOff size={32} strokeWidth={1.2} />
          <span className="text-xs font-medium uppercase tracking-wider">Image unavailable</span>
        </div>
      </div>
    );
  }

  // Priority / eager mode: no skeleton, just render immediately for LCP
  if (priority || loading === "eager") {
    return (
      <div className={`relative overflow-hidden ${className || ""}`} style={style}>
        <img
          src={src}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className || ""}`} style={style}>
      {/* Skeleton shown until image loads */}
      <div
        className={`absolute inset-0 bg-slate-800/50 transition-opacity duration-500 z-0 ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* Native img — single network request, opacity-only fade in */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className="w-full h-full object-cover relative z-10 transition-opacity duration-500"
        style={{ opacity: isLoaded ? 1 : 0 }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  );
}
