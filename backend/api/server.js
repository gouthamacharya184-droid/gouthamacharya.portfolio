import compression     from "compression";
import cors            from "cors";
import express          from "express";
import helmet           from "helmet";
import path             from "path";
import { fileURLToPath } from "url";
import { config }       from "../config/config.js";
import { logger }       from "../services/logger.js";
import { verifyTransport } from "../services/mailer.js";
import { securityMiddleware } from "../middleware/security.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

// Import Modular Routers
import portfolioRouter from "../routes/portfolio.js";
import chatRouter      from "../routes/chat.js";
import contactRouter   from "../routes/contact.js";
import socialRouter    from "../routes/social.js";
import adminRouter     from "../routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust the first proxy (Render, Vercel, ngrok, etc.)
app.set("trust proxy", 1);
app.locals.isMaintenanceMode = false;
app.disable("x-powered-by");

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── CORS Configuration ───────────────────────────────────────────────────────
const defaultAllowedOrigins = [
  "https://goutham-acharya.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const envOrigins = (process.env.FRONTEND_URL || config.frontendUrl || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow direct, curl, or server-to-server health checks without origin header
      if (!origin) return callback(null, true);

      // Dev mode or wildcard allowed
      if (!config.isProduction || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      const cleanOrigin = origin.trim().replace(/\/$/, "");
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === "*") return true;
        if (cleanOrigin === allowed) return true;
        // Allow Vercel preview deploys and Render subdomains
        if (cleanOrigin.endsWith(".vercel.app") || cleanOrigin.endsWith(".onrender.com")) return true;
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn({ type: "cors_rejected", origin });
        callback(new Error("CORS policy error: Origin not allowed."));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key", "Accept"],
  })
);

// Middleware Pipeline
app.use(securityMiddleware);
app.use(generalLimiter);
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: "10kb" }));

// Static Assets & Uploads Serving for backend media
const staticOptions = { maxAge: "1d", etag: true };
app.use("/api/assets", express.static(path.join(__dirname, "../assets"), staticOptions));
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads"), staticOptions));

// ── Root & Health Routes ──────────────────────────────────────────────────────
// Root GET /
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Backend API is running" });
});

// GET /api/health
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Modular API Routes ───────────────────────────────────────────────────────
app.use("/api/portfolio", portfolioRouter);
app.use("/api/chat", chatRouter);
app.use("/api/contact", contactRouter);
app.use("/api/social", socialRouter);
app.use("/api", adminRouter); // Mounts /auth/login and /admin/*

// ── 404 Handler for Unmatched API Endpoints ─────────────────────────────────
app.use((req, res) => {
  logger.warn({ type: "not_found", path: req.path, method: req.method });
  res.status(404).json({
    ok: false,
    message: "The requested API endpoint was not found.",
  });
});

// ── Centralized Error Handling Middleware ───────────────────────────────────
app.use((err, req, res, next) => {
  const requestId = req.requestId ?? "unknown";

  logger.error({
    type: "unhandled_error",
    requestId,
    path: req.path,
    method: req.method,
    err: err.message || err,
  });

  if (err.message?.includes("CORS")) {
    return res.status(403).json({ ok: false, message: "CORS policy error: Origin not allowed." });
  }

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "An internal server error occurred. Please try again later.",
    requestId,
  });
});

// ── Server Initialization ───────────────────────────────────────────────────
const PORT = process.env.PORT || config.port || 10000;
let httpServer;

const start = async () => {
  try {
    await verifyTransport();
    logger.info({ type: "smtp_verified" });
  } catch (err) {
    logger.warn({ type: "smtp_unavailable", msg: err.message });
  }

  httpServer = app.listen(PORT, "0.0.0.0", () => {
    logger.info({
      type: "server_started",
      port: PORT,
      env: config.nodeEnv,
    });
    console.log(`Backend API running on port ${PORT}`);
  });
};

start();

const shutdown = (signal) => {
  logger.info({ type: "shutdown_initiated", signal });
  if (httpServer) {
    httpServer.close(() => {
      logger.info({ type: "shutdown_complete" });
      process.exit(0);
    });
    setTimeout(() => {
      logger.error({ type: "shutdown_forced" });
      process.exit(1);
    }, 10_000).unref();
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ type: "unhandled_rejection", reason: String(reason) });
});

export default app;
