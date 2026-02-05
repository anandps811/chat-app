import { Router } from "express";
import { updateProfile, searchUsers } from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

// User routes (require authentication)
router.put("/profile", authenticateToken, updateProfile);
router.get("/search", authenticateToken, searchUsers);

export default router;
