export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const githubUrl = process.env.GITHUB_URL || "https://github.com/gouthamacharya184-droid";
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "7619573468";

  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  return res.status(200).json({
    ok: true,
    data: {
      githubUrl,
      whatsappUrl: `https://wa.me/${whatsappNumber}`,
      apiBase: "",
    },
  });
}
