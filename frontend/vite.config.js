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

  // Build the allowed hosts list dynamically
  const allowedHosts = [
    "localhost",
    "127.0.0.1",
  ];
  if (env.VITE_ALLOWED_HOST) {
    allowedHosts.push(env.VITE_ALLOWED_HOST);
  }

  return {
    plugins: [react()],
    server: {
      host:        "0.0.0.0",
      port:        5173,
      strictPort:  true,
      allowedHosts,
      hmr: {
        // Required for HMR to work through an HTTPS reverse proxy (ngrok)
        clientPort: 443,
      },
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
    preview: {
      port: 4173,
    },
  };
});
