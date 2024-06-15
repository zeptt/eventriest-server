import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
});
