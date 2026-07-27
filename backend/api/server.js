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

app.locals.isMaintenanceMode = false;

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'none'"],
        styleSrc:    ["'none'"],
        imgSrc:      ["'none'"],
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
    // Fix 4: Explicit CORP + COOP for production-grade isolation
    crossOriginResourcePolicy: { policy: "same-site" },
    crossOriginOpenerPolicy:   { policy: "same-origin" },
  })
);

const allowedOrigins = new Set([
  config.frontendUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);
if (config.ngrokUrl && config.ngrokUrl.startsWith("https://")) {
  allowedOrigins.add(config.ngrokUrl);
}

// Fix 3: Removed Access-Control-Allow-Credentials: true — app uses Bearer
// tokens (not cookies), so credentials header is unnecessary and misleading.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = allowedOrigins.has(origin);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
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

// Static Assets & Uploads Serving
app.use("/api/assets", express.static(path.join(__dirname, "../assets")));
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads")));

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
