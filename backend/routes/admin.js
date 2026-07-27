import express from "express";
import { handleLogin, getStats, getLogs, toggleMaintenance } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/auth/login", generalLimiter, handleLogin);
router.get("/admin/stats", generalLimiter, requireAuth, requireRole("admin"), getStats);
router.get("/admin/logs", generalLimiter, requireAuth, requireRole("admin"), getLogs);
router.post("/admin/maintenance", generalLimiter, requireAuth, requireRole("admin"), toggleMaintenance);

export default router;
