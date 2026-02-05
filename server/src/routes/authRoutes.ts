import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter, refreshLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Authentication routes with rate limiting
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshLimiter, refreshToken);
router.post("/logout", protect, logout);

export default router;
