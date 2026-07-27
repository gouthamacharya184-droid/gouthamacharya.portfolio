import express from "express";
import { getChatStatus, handleChat } from "../controllers/chatController.js";
import { chatLimiter, statusLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/status", statusLimiter, getChatStatus);
router.post("/", chatLimiter, handleChat);

export default router;
