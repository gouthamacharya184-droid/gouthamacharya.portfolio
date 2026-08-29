import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handler(req, res) {
  const possiblePaths = [
    path.join(process.cwd(), "frontend/public/Goutham_Acharya_Resume.pdf"),
    path.join(process.cwd(), "frontend/public/resume.pdf"),
    path.join(process.cwd(), "public/resume.pdf"),
    path.join(__dirname, "../../frontend/public/resume.pdf"),
    path.join(__dirname, "../../backend/uploads/resume.pdf"),
  ];

  let resumePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      resumePath = p;
      break;
    }
  }

  if (resumePath) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="Goutham_Acharya_Resume.pdf"');
    res.setHeader("Cache-Control", "public, max-age=3600");
    const fileStream = fs.createReadStream(resumePath);
    return fileStream.pipe(res);
  }

  // Fallback redirect to static public asset
  return res.redirect(302, "/resume.pdf");
}
