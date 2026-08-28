import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getApiBaseUrl } from "../utils/api";
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

  const base = getApiBaseUrl(apiBaseUrl);

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

      setPortfolio(portfolioJson.data);
      setSiteConfig(configJson.data);
    } catch (err) {
      setError("Portfolio data is temporarily unavailable. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <PortfolioContext.Provider value={{ portfolio, siteConfig, loading, error, refetch: fetchAll }}>
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
