import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { logger } from "../services/logger.js";

const JWT_ALGORITHM  = "HS256";
const JWT_EXPIRES_IN = "1h";
const BEARER_PREFIX  = "Bearer ";

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    algorithm:  JWT_ALGORITHM,
    expiresIn:  JWT_EXPIRES_IN,
    issuer:     "goutham-portfolio",
    audience:   "portfolio-api",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, {
    algorithms: [JWT_ALGORITHM],
    issuer:     "goutham-portfolio",
    audience:   "portfolio-api",
  });
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"] || "";

  if (!authHeader.startsWith(BEARER_PREFIX)) {
    res.securityEvent?.("AUTH_MISSING_TOKEN", { path: req.path });
    return res.status(401).json({
      ok:      false,
      code:    "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }

  const token = authHeader.slice(BEARER_PREFIX.length);

  try {
    const decoded  = verifyToken(token);
    req.user       = decoded;
    next();
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    res.securityEvent?.("AUTH_FAILED", {
      reason: isExpired ? "token_expired" : "invalid_token",
      path:   req.path,
    });

    logger.warn({
      type:      "auth_failure",
      reason:    isExpired ? "expired" : "invalid",
      requestId: req.requestId,
      ip:        req.clientIp,
    });

    return res.status(401).json({
      ok:      false,
      code:    isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      message: isExpired
        ? "Session expired. Please log in again."
        : "Invalid authentication token.",
    });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok:      false,
        code:    "UNAUTHORIZED",
        message: "Authentication required.",
      });
    }

    if (req.user.role !== role) {
      res.securityEvent?.("AUTHZ_DENIED", {
        required: role,
        actual:   req.user.role,
        path:     req.path,
      });

      logger.warn({
        type:      "authz_failure",
        required:  role,
        actual:    req.user?.role,
        userId:    req.user?.sub,
        requestId: req.requestId,
        ip:        req.clientIp,
      });

      return res.status(403).json({
        ok:      false,
        code:    "FORBIDDEN",
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
}

export function requireApiKey(req, res, next) {
  if (!config.adminApiKey) {
    return res.status(503).json({
      ok:      false,
      code:    "NOT_CONFIGURED",
      message: "This endpoint is not available.",
    });
  }

  const providedKey = req.headers["x-api-key"] || "";

  const expectedHash = crypto.createHash("sha256").update(String(config.adminApiKey)).digest();
  const providedHash = crypto.createHash("sha256").update(String(providedKey)).digest();
  const isValid = crypto.timingSafeEqual(expectedHash, providedHash);

  if (!isValid) {
    res.securityEvent?.("API_KEY_REJECTED", { path: req.path });
    logger.warn({
      type:      "api_key_failure",
      requestId: req.requestId,
      ip:        req.clientIp,
      path:      req.path,
    });
    return res.status(401).json({
      ok:      false,
      code:    "INVALID_API_KEY",
      message: "Invalid or missing API key.",
    });
  }

  next();
}
