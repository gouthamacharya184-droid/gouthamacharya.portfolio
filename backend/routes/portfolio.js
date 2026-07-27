import express from "express";
import { getPortfolio, getPortfolioConfig } from "../controllers/portfolioController.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/", generalLimiter, getPortfolio);
router.get("/config", generalLimiter, getPortfolioConfig);

export default router;
