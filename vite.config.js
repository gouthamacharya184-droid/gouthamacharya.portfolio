/**
 * vite.config.js — Vite development server configuration
 *
 * Security notes:
 *  - `allowedHosts` is read from VITE_ALLOWED_HOST env var (not hardcoded).
 *    This prevents committing a specific ngrok domain that may change.
 *    Set it in frontend/.env.local for local dev if you use ngrok.
 *  - `proxy` rewrites all /api/* requests to the backend during dev,
 *    so the frontend never needs to know the backend origin at runtime.
 *  - `hmr.clientPort: 443` enables HMR through ngrok HTTPS tunnels.
 */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env vars for the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // Allow all hosts so phones/tablets on the same WiFi can open the dev server
  // (e.g. http://192.168.x.x:5173 from a mobile device).
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
        // During dev, all /api/* requests are forwarded to the backend.
        // This keeps the frontend origin-agnostic and avoids CORS in dev.
        "/api": {
          target:       "http://127.0.0.1:8787",
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
