import rateLimit from "express-rate-limit";

const tooManyRequestsBody = (action) => ({
  ok:      false,
  code:    "RATE_LIMITED",
  message: `Too many ${action} attempts. Please wait and try again.`,
});

// keyGenerator uses req.ip which, with `app.set('trust proxy', 1)` in server.js,
// correctly resolves the REAL visitor IP from X-Forwarded-For headers set by
// Render's/Vercel's load balancers. Without trust proxy, all requests appear to
// come from the same proxy IP and a single user could trigger the limit for everyone.
const keyGenerator = (req) => req.ip;

export const contactLimiter = rateLimit({
  windowMs:              15 * 60 * 1000,
  max:                   8,
  standardHeaders:       true,
  legacyHeaders:         false,
  message:               tooManyRequestsBody("contact form"),
  skipSuccessfulRequests: false,
  keyGenerator,
});

export const chatLimiter = rateLimit({
  windowMs:              1 * 60 * 1000,
  max:                   10,
  standardHeaders:       true,
  legacyHeaders:         false,
  message:               tooManyRequestsBody("AI chat"),
  skipSuccessfulRequests: false,
  keyGenerator,
});

export const generalLimiter = rateLimit({
  windowMs:              15 * 60 * 1000,
  max:                   200,
  standardHeaders:       true,
  legacyHeaders:         false,
  message:               tooManyRequestsBody("API"),
  skipSuccessfulRequests: false,
  keyGenerator,
});

export const statusLimiter = rateLimit({
  windowMs:      60 * 1000,
  max:           15,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        tooManyRequestsBody("status check"),
  keyGenerator,
});
