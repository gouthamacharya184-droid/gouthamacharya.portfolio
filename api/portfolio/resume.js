export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.redirect(302, "/Goutham_Acharya_Resume.pdf");
}
