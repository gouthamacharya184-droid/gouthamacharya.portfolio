import express from "express";
import { whatsappRedirect, githubRedirect, callRedirect } from "../controllers/socialController.js";

const router = express.Router();

router.get("/whatsapp", whatsappRedirect);
router.get("/github", githubRedirect);
router.get("/call", callRedirect);

export default router;
