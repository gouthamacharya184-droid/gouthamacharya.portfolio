/**
 * Keep-Alive Cron Script for Render Free Tier
 *
 * Usage:
 *   node backend/scripts/keep-alive.js
 * Or run via cron / GitHub Action every 10 minutes.
 *
 * Hits /api/health which responds in < 5ms and performs 0 DB/LLM calls.
 */

import http from "http";
import https from "https";

const BACKEND_URL = process.env.RENDER_BACKEND_URL || "https://goutham-portfolio-backend.onrender.com";

function pingHealthEndpoint() {
  const healthUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/health`;
  const client = healthUrl.startsWith("https") ? https : http;

  console.log(`[Keep-Alive] Pinging ${healthUrl} at ${new Date().toISOString()}`);

  const start = Date.now();
  const req = client.get(healthUrl, { timeout: 10000 }, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const duration = Date.now() - start;
      if (res.statusCode === 200) {
        console.log(`[Keep-Alive] SUCCESS: Received 200 OK in ${duration}ms. Backend kept warm.`);
      } else {
        console.warn(`[Keep-Alive] WARNING: Status code ${res.statusCode} in ${duration}ms.`);
      }
    });
  });

  req.on("error", (err) => {
    console.error(`[Keep-Alive] ERROR: Request failed: ${err.message}`);
  });

  req.on("timeout", () => {
    req.destroy();
    console.error("[Keep-Alive] ERROR: Request timed out after 10000ms.");
  });
}

pingHealthEndpoint();
