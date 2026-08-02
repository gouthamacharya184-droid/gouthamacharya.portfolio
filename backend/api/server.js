import compression     from "compression";
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

// Trust the first proxy (Render, Vercel, ngrok, etc.) so that:
// 1. Rate limiters read the real client IP from X-Forwarded-For
// 2. req.secure reflects HTTPS correctly
// 3. req.ip returns the actual visitor IP, not the load-balancer IP
app.set("trust proxy", 1);

app.locals.isMaintenanceMode = false;

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'none'"],
        styleSrc:    ["'none'"],
        imgSrc:      ["'self'", "data:", "blob:"],
        connectSrc:  ["'self'"],
        frameAncestors: ["'none'"],
        baseUri:     ["'self'"],
        formAction:  ["'self'"],
      },
    },
    hsts: {
      maxAge:            31_536_000,
      includeSubDomains: true,
      preload:           true,
    },
    noSniff: true,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy:   { policy: "same-origin" },
  })
);

const configuredOrigins = (config.frontendUrl || "*")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Direct or server-to-server requests
  if (configuredOrigins.includes("*")) return true;

  const cleanOrigin = origin.trim().replace(/\/$/, "");
  if (configuredOrigins.includes(cleanOrigin)) return true;

  // Allow standard local development ports
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) return true;

  // Allow Vercel & Render cloud previews/deployments
  if (cleanOrigin.endsWith(".vercel.app") || cleanOrigin.endsWith(".onrender.com")) return true;

  if (config.ngrokUrl && cleanOrigin === config.ngrokUrl.replace(/\/$/, "")) return true;

  return false;
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Always send Vary: Origin so CDNs/proxies don't serve a cached CORS
  // response for one origin to a different origin
  res.setHeader("Vary", "Origin");

  if (isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, Accept");
    res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight for 24h
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// Fix 1+2: Removed duplicate inline request-id / logger middleware — these
// are now exclusively handled by securityMiddleware (requestIdMiddleware +
// requestLoggerMiddleware + securityEventMiddleware) applied below.
app.use(securityMiddleware);
app.use(generalLimiter);
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: "10kb" }));

// Static Assets & Uploads Serving (with caching headers)
const staticOptions = { maxAge: "1d", etag: true };
app.use("/api/assets", express.static(path.join(__dirname, "../assets"), staticOptions));
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads"), staticOptions));
app.use("/assets", express.static(path.join(__dirname, "../assets"), staticOptions));
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), staticOptions));

// Public health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// Modular Routes
app.use("/api/portfolio", portfolioRouter);
app.use("/api/chat", chatRouter);
app.use("/api/contact", contactRouter);
app.use("/api/social", socialRouter);
app.use("/api", adminRouter); // Mounts /auth/login and /admin/*

// Root — minimal HTML, no framework/version disclosure
app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(
    "<!doctype html><html><head><title>Portfolio API</title></head>" +
    "<body><h1>Portfolio API</h1><p>Status: <a href=\"/api/health\">/api/health</a></p></body></html>"
  );
});

app.use((req, res) => {
  logger.warn({ type: "not_found", path: req.path, method: req.method });
  res.status(404).json({
    ok:      false,
    message: "The requested resource was not found.",
  });
});

app.use((err, req, res, next) => {
  const requestId = req.requestId ?? "unknown";

  logger.error({
    type:      "unhandled_error",
    requestId,
    path:      req.path,
    method:    req.method,
    err,
  });

  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ ok: false, message: "Origin not allowed." });
  }

  res.status(500).json({
    ok:        false,
    message:   "An internal error occurred. Please try again later.",
    requestId,
  });
});

let httpServer;

const start = async () => {
  try {
    await verifyTransport();
    logger.info({ type: "smtp_verified" });
  } catch (err) {
    logger.warn({ type: "smtp_unavailable", msg: err.message });
  }

  httpServer = app.listen(config.port, "0.0.0.0", () => {
    logger.info({
      type: "server_started",
      port: config.port,
      env:  config.nodeEnv,
    });
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
