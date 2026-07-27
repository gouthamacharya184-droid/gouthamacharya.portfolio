import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const baseLogger = pino({
  level: isProduction ? "info" : "debug",

  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize:        true,
          translateTime:   "SYS:HH:MM:ss.l",
          ignore:          "pid,hostname",
          messageFormat:   "{type} — {msg}",
          levelFirst:      true,
        },
      },

  base: {
    service: "portfolio-backend",
    env:     process.env.NODE_ENV ?? "development",
  },

  redact: {
    paths:  ["*.password", "*.pass", "*.secret", "*.apiKey", "*.token", "*.key"],
    censor: "[REDACTED]",
  },

  serializers: {
    err: pino.stdSerializers.err,
  },
});

// ── In-Memory Security Audit Log Buffer ──────────────────────────────────────
const securityEventsBuffer = [];
const MAX_BUFFER_SIZE = 100;

function addToBuffer(obj) {
  if (obj && typeof obj === "object") {
    const type = obj.type;
    if (type === "security_event" || type === "http_request" || type === "cors_rejected" || type === "cors_config") {
      securityEventsBuffer.push({
        timestamp: new Date().toISOString(),
        ...obj,
      });
      if (securityEventsBuffer.length > MAX_BUFFER_SIZE) {
        securityEventsBuffer.shift();
      }
    }
  }
}

export function getRecentSecurityEvents() {
  return [...securityEventsBuffer];
}

const intercept = (method) => {
  const original = baseLogger[method].bind(baseLogger);
  baseLogger[method] = (obj, ...args) => {
    try {
      addToBuffer(obj);
    } catch (err) {
      // Don't let buffer failures affect the main logger
    }
    original(obj, ...args);
  };
};

intercept("info");
intercept("warn");
intercept("error");

export const logger = baseLogger;
