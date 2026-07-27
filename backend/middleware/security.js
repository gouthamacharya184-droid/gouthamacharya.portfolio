import crypto from "crypto";
import { logger } from "../services/logger.js";

function extractClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

export function requestIdMiddleware(req, res, next) {
  const id = crypto.randomUUID();
  req.requestId = id;
  req.clientIp  = extractClientIp(req);
  res.setHeader("X-Request-ID", id);
  next();
}

export function requestLoggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level    = res.statusCode >= 500 ? "error"
                   : res.statusCode >= 400 ? "warn"
                   : "info";

    logger[level]({
      type:      "http_request",
      requestId: req.requestId,
      method:    req.method,
      path:      req.path,
      status:    res.statusCode,
      ip:        req.clientIp,
      durationMs: duration,
    });
  });

  next();
}

export function securityEventMiddleware(req, res, next) {
  res.securityEvent = (type, detail = {}) => {
    logger.warn({
      type:      "security_event",
      event:     type,
      requestId: req.requestId,
      ip:        req.clientIp,
      path:      req.path,
      method:    req.method,
      ...detail,
    });
  };
  next();
}

export const securityMiddleware = [
  requestIdMiddleware,
  securityEventMiddleware,
  requestLoggerMiddleware,
];
