/**
 * vite.config.js — Vite development server configuration
 *
 * Architecture: Vercel Full-Stack (Serverless)
 *  - Frontend: React + Vite (src/, index.html, public/)
 *  - Backend:  Vercel Serverless Functions (api/)
 *  - Hosting:  Vercel only — NO Render, NO Express server
 *
 * Dev notes:
 *  - `allowedHosts` is read from VITE_ALLOWED_HOST env var (not hardcoded).
 *    Set it in .env.local for local dev if you use ngrok or mobile testing.
 *  - During local dev, run `vercel dev` (port 3000) in one terminal and
 *    `npm run dev` (port 5173) in another. The Vite proxy forwards /api/*
 *    to the Vercel dev server so serverless functions work locally.
 *  - `hmr.clientPort: 443` enables HMR through ngrok HTTPS tunnels.
 */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env vars for the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // Allow all hosts so phones/tablets on the same WiFi can open the dev server.
  // In production there is no Vite dev server, so this only affects local dev.
  const allowedHosts = env.VITE_ALLOWED_HOST
    ? ["localhost", "127.0.0.1", env.VITE_ALLOWED_HOST]
    : "all";

  // Only override HMR clientPort when behind an HTTPS reverse proxy (e.g. ngrok).
  // Locally, leave hmr unset so Vite uses the same port as the dev server (5173).
  const hmrConfig = env.VITE_ALLOWED_HOST
    ? { clientPort: 443 }
    : {};

  return {
    plugins: [react()],
    server: {
      host:        "0.0.0.0",
      port:        5173,
      strictPort:  true,
      allowedHosts,
      hmr: hmrConfig,
      proxy: {
        // During local dev, all /api/* requests are forwarded to the
        // Vercel dev server. Run `vercel dev` (default port 3000) in a
        // separate terminal alongside `npm run dev` (port 5173).
        "/api": {
          target:       "http://127.0.0.1:3000",
          changeOrigin: true,
          secure:       false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-framer": ["framer-motion"],
            "vendor-markdown": ["react-markdown", "react-syntax-highlighter"],
            "vendor-icons": ["lucide-react"],
          },
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
    },
  };
});
