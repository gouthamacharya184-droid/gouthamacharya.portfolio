import { config } from "../config/config.js";

export const whatsappRedirect = (_req, res) => {
  const url = `https://wa.me/${encodeURIComponent(config.whatsappNumber)}`;
  res.redirect(302, url);
};

export const githubRedirect = (_req, res) => {
  res.redirect(302, config.githubUrl);
};

export const callRedirect = (_req, res) => {
  res.redirect(302, `tel:${config.phoneNumber}`);
};
