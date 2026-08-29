export default function handler(req, res) {
  const number = process.env.WHATSAPP_NUMBER || "7619573468";
  return res.redirect(302, `tel:${number}`);
}
