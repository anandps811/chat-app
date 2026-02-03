import { Router } from "express";
import {
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import { protect } from "../middleware/authMiddleware";
import { authLimiter, refreshLimiter } from "../middleware/rateLimiter";

const router = Router();

// Authentication routes with rate limiting
router.post("/signup", authLimiter, login);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshLimiter, refreshToken);
router.post("/logout", protect, logout);

export default router;
