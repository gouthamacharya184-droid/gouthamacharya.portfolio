import crypto from "crypto";
import os from "os";
import { config } from "../config/config.js";
import { logger, getRecentSecurityEvents } from "../services/logger.js";
import { signToken } from "../middleware/auth.js";

export const handleLogin = (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ ok: false, message: "Password is required." });
  }

  if (!config.adminApiKey) {
    return res.status(503).json({ ok: false, message: "Admin authentication is disabled." });
  }

  const expectedBuf = Buffer.from(config.adminApiKey, "utf8");
  const providedBuf = Buffer.from(password, "utf8");
  const isValid =
    expectedBuf.length === providedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, providedBuf);

  if (!isValid) {
    res.securityEvent?.("ADMIN_LOGIN_FAILED");
    return res.status(401).json({ ok: false, message: "Invalid password." });
  }

  const token = signToken({ role: "admin", sub: "admin" });
  res.securityEvent?.("ADMIN_LOGIN_SUCCESS");
  return res.status(200).json({ ok: true, token });
};

export const getStats = (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const loadavg = os.loadavg();
  const cpus = os.cpus().length;
  const isMaintenanceMode = req.app.locals.isMaintenanceMode || false;

  return res.status(200).json({
    ok: true,
    data: {
      uptimeSeconds: uptime,
      nodeVersion: process.version,
      platform: process.platform,
      cpus,
      loadAverage: loadavg,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + " MB",
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + " MB",
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + " MB",
      },
      maintenanceMode: isMaintenanceMode,
    },
  });
};

export const getLogs = (req, res) => {
  const events = getRecentSecurityEvents();
  return res.status(200).json({
    ok: true,
    data: events,
  });
};

export const toggleMaintenance = (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== "boolean") {
    return res.status(400).json({ ok: false, message: "enabled parameter must be a boolean." });
  }

  req.app.locals.isMaintenanceMode = enabled;
  res.securityEvent?.("MAINTENANCE_MODE_CHANGED", { enabled });
  logger.info({ type: "maintenance_mode_changed", enabled });

  return res.status(200).json({
    ok: true,
    message: `Maintenance mode has been ${enabled ? "enabled" : "disabled"}.`,
  });
};
