import express from "express";
import { whatsappRedirect, githubRedirect } from "../controllers/socialController.js";

const router = express.Router();

router.get("/whatsapp", whatsappRedirect);
router.get("/github", githubRedirect);

export default router;
