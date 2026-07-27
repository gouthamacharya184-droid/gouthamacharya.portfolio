import crypto from "crypto";
import { portfolioData } from "../config/portfolio.js";
import { config } from "../config/config.js";

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
