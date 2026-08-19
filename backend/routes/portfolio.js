import express from "express";
import { getPortfolio, getPortfolioConfig, downloadResume } from "../controllers/portfolioController.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/", generalLimiter, getPortfolio);
router.get("/config", generalLimiter, getPortfolioConfig);
router.get("/resume", generalLimiter, downloadResume);

export default router;

