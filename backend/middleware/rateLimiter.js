import rateLimit from "express-rate-limit";

const tooManyRequestsBody = (action) => ({
  ok:      false,
  code:    "RATE_LIMITED",
  message: `Too many ${action} attempts. Please wait and try again.`,
});

export const contactLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            8,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        tooManyRequestsBody("contact form"),
  skipSuccessfulRequests: false,
});

export const chatLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            20,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        tooManyRequestsBody("AI chat"),
  skipSuccessfulRequests: false,
});

export const generalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            100,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        tooManyRequestsBody("API"),
  skipSuccessfulRequests: false,
});

export const statusLimiter = rateLimit({
  windowMs:       60 * 1000,
  max:            10,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        tooManyRequestsBody("status check"),
});
