export default function handler(req, res) {
  const { slug } = req.query;
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "7619573468";
  const githubUrl = process.env.GITHUB_URL || "https://github.com/gouthamacharya184-droid";

  switch (slug) {
    case "whatsapp":
      return res.redirect(302, `https://wa.me/${encodeURIComponent(whatsappNumber)}`);
    case "call":
      return res.redirect(302, `tel:${whatsappNumber}`);
    case "github":
      return res.redirect(302, githubUrl);
    default:
      return res.status(404).json({ ok: false, message: "Social link not found." });
  }
}
