import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";
import { updateProfile, searchUsers } from "../controllers/user.controller.js";
import { protect, authenticateToken } from "../middleware/authMiddleware.js";
import { authLimiter, refreshLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Authentication routes with rate limiting
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshLimiter, refreshToken);
router.post("/logout", protect, logout);

// User routes (require authentication)
router.put("/users/profile", authenticateToken, updateProfile);
router.get("/users/search", authenticateToken, searchUsers);

export default router;
