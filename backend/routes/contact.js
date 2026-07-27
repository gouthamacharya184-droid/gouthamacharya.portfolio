import express from "express";
import { handleContact } from "../controllers/contactController.js";
import { contactLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", contactLimiter, handleContact);

export default router;
