import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Coffee,
  Code2,
  Database,
  FileCode2,
  GitCommit,
  Github,
  GraduationCap,
  Instagram,
  LineChart,
  Linkedin,
  MapPin,
  MessageSquareText,
  NotebookPen,
  ServerCog,
  Sparkles,
  Trophy,
  Wrench,
} from "lucide-react";

const PortfolioContext = createContext(null);

export const ICON_MAP = {
  Award,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Coffee,
  Code2,
  Database,
  FileCode2,
  GitCommit,
  Github,
  GraduationCap,
  Instagram,
  LineChart,
  Linkedin,
  MapPin,
  MessageSquareText,
  NotebookPen,
  ServerCog,
  Sparkles,
  Trophy,
  Wrench,
};

export function resolveIcon(name) {
  return ICON_MAP[name] ?? null;
}

export function PortfolioProvider({ children, apiBaseUrl = "" }) {
  const [portfolio, setPortfolio] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const base = useMemo(() => {
    if (apiBaseUrl) return apiBaseUrl.replace(/\/$/, "");
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      const isLocalHost =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "[::1]" ||
        host.endsWith(".local") ||
        /^192\.168\./.test(host) ||
        /^10\./.test(host) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);

      if (!isLocalHost) {
        return "https://goutham-portfolio.onrender.com";
      }
    }
    return "";
  }, [apiBaseUrl]);

  const getAssetUrl = useCallback((path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return base ? `${base}${cleanPath}` : cleanPath;
  }, [base]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [portfolioRes, configRes] = await Promise.all([
        fetch(`${base}/api/portfolio`, {
          headers: { Accept: "application/json" },
        }),
        fetch(`${base}/api/portfolio/config`, {
          headers: { Accept: "application/json" },
        }),
      ]);

      if (!portfolioRes.ok || !configRes.ok) {
        throw new Error("Failed to load portfolio data from server.");
      }

      const portfolioJson = await portfolioRes.json();
      const configJson    = await configRes.json();

      const data = portfolioJson?.data ? { ...portfolioJson.data } : null;
      if (data && Array.isArray(data.projects)) {
        data.projects = data.projects.map((p) => ({
          ...p,
          image: getAssetUrl(p.image),
        }));
      }

      setPortfolio(data);
      setSiteConfig(configJson.data);
    } catch (err) {
      setError("Portfolio data is temporarily unavailable. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [base, getAssetUrl]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <PortfolioContext.Provider value={{ portfolio, siteConfig, loading, error, refetch: fetchAll, getAssetUrl, apiBaseUrl: base }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolio() must be used inside <PortfolioProvider>.");
  }
  return ctx;
}
