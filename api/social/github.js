export default function handler(req, res) {
  const url = process.env.GITHUB_URL || "https://github.com/gouthamacharya184-droid";
  return res.redirect(302, url);
}
