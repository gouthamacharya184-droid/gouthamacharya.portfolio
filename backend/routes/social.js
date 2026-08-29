import express from "express";
import { whatsappRedirect, githubRedirect, callRedirect } from "../controllers/socialController.js";

const router = express.Router();

router.get("/whatsapp", whatsappRedirect);
router.get("/call", callRedirect);
router.get("/github", githubRedirect);

export default router;
