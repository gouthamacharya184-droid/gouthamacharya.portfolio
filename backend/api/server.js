import cors             from "cors";
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
  })
);

const allowedOrigins = new Set([
  config.frontendUrl,
  config.frontendUrl?.replace(/\/$/, ""),
  "https://gouthamacharya.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
].filter(Boolean));

if (config.ngrokUrl && config.ngrokUrl.startsWith("https://")) {
  allowedOrigins.add(config.ngrokUrl);
  allowedOrigins.add(config.ngrokUrl.replace(/\/$/, ""));
}

function isOriginAllowed(origin) {
  if (!origin) return true;

  if (allowedOrigins.has(origin) || allowedOrigins.has(origin.replace(/\/$/, ""))) {
    return true;
  }

  // Allow all Vercel deployments (*.vercel.app)
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
    return true;
  }

  // Allow all Netlify deployments (*.netlify.app)
  if (/^https:\/\/[a-zA-Z0-9-]+\.netlify\.app$/.test(origin)) {
    return true;
  }

  // Allow localhost & local IP dev origins
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  // Allow ngrok & render origins
  if (/^https:\/\/[a-zA-Z0-9-]+\.(ngrok-free\.app|ngrok\.io|onrender\.com)$/.test(origin)) {
    return true;
  }

  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Request-ID");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use((req, res, next) => {
  const reqId = req.headers["x-request-id"] || `req_${Math.random().toString(36).slice(2, 11)}`;
  req.requestId = reqId;

  const clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";
  req.clientIp = clientIp;

  res.setHeader("X-Request-ID", reqId);

  logger.info({
    type:      "request_in",
    method:    req.method,
    path:      req.path,
    requestId: reqId,
    ip:        clientIp,
  });

  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      type:       "request_out",
      method:     req.method,
      path:       req.path,
      status:     res.statusCode,
      durationMs: Date.now() - start,
      requestId:  reqId,
    });
  });

  next();
});

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
