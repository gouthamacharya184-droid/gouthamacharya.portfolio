export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    engine: "Vercel Edge / Serverless Network",
  });
}
