import crypto from "crypto";
import { portfolioData } from "../_lib/portfolioData.js";

const portfolioETag = `"${crypto
  .createHash("sha256")
  .update(JSON.stringify(portfolioData))
  .digest("hex")
  .slice(0, 16)}"`;

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, If-None-Match");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.headers?.["if-none-match"] === portfolioETag) {
    return res.status(304).end();
  }

  res.setHeader("ETag", portfolioETag);
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  return res.status(200).json({
    ok: true,
    data: portfolioData,
  });
}
