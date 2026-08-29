import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  ".pdf":  "application/pdf",
  ".webp": "image/webp",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
};

export default function handler(req, res) {
  const { file } = req.query;
  if (!file || typeof file !== "string") {
    return res.status(400).json({ ok: false, message: "Filename required." });
  }

  const safeFilename = path.basename(file);
  const ext = path.extname(safeFilename).toLowerCase();
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";

  const candidatePaths = [
    path.join(process.cwd(), "frontend/public", safeFilename),
    path.join(process.cwd(), "frontend/public/projects", safeFilename),
    path.join(process.cwd(), "backend/uploads", safeFilename),
    path.join(process.cwd(), "backend/uploads/projects", safeFilename),
    path.join(__dirname, "../../frontend/public", safeFilename),
    path.join(__dirname, "../../backend/uploads", safeFilename),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
      return fs.createReadStream(candidate).pipe(res);
    }
  }

  return res.redirect(302, `/${safeFilename}`);
}
