import React from "react";

/**
 * ErrorBoundary.jsx — Top-level error boundary
 *
 * Prevents the entire app from showing a blank white screen when any
 * component throws an unhandled error. Provides a readable fallback UI.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development; could send to a logging service in prod
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#010614] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-rose-400"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-3">Something went wrong</h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              An unexpected error occurred. Details are displayed below:
            </p>
            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/40 text-left overflow-x-auto max-h-48 custom-scrollbar">
                <p className="text-xs font-bold text-rose-300 font-mono mb-1">
                  {this.state.error.toString()}
                </p>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-rose-400/80 font-mono whitespace-pre-wrap leading-normal">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
