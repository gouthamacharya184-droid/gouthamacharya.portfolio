import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { portfolioData } from "../config/portfolio.js";
import { config } from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const portfolioETag = `"${crypto
  .createHash("sha256")
  .update(JSON.stringify(portfolioData))
  .digest("hex")
  .slice(0, 16)}"`;

export const getPortfolio = (req, res) => {
  if (req.headers["if-none-match"] === portfolioETag) {
    return res.status(304).end();
  }

  res.setHeader("ETag", portfolioETag);
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  res.status(200).json({
    ok:   true,
    data: portfolioData,
  });
};

export const getPortfolioConfig = (req, res) => {
  if (req.headers["if-none-match"] === portfolioETag) {
    return res.status(304).end();
  }

  res.setHeader("ETag", portfolioETag);
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  res.status(200).json({
    ok:   true,
    data: {
      githubUrl:     config.githubUrl,
      whatsappUrl:   `https://wa.me/${config.whatsappNumber}`,
      apiBase:       "",
    },
  });
};

export const downloadResume = (req, res) => {
  const possiblePaths = [
    path.join(__dirname, "../uploads/Goutham_Acharya_Resume.pdf"),
    path.join(__dirname, "../uploads/resume.pdf"),
  ];

  let resumePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      resumePath = p;
      break;
    }
  }

  if (!resumePath) {
    return res.status(404).json({ ok: false, message: "Resume file not found." });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="Goutham_Acharya_Resume.pdf"');
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.sendFile(resumePath);
};

