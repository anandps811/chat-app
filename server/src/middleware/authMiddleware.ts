import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
  user?: { userId: string; id: string };
}

/**
 * Legacy authentication middleware (simpler version)
 * Uses JWT_SECRET from validated environment configuration
 */
export const protect = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as any;

    req.user = { id: decoded.userId };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired", message: "Token has expired" });
    }
    return res.sendStatus(403);
  }
};

/**
 * Authentication middleware with detailed error handling
 * Uses JWT_SECRET from validated environment configuration
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as any;

    (req as AuthRequest).user = { userId: decoded.userId, id: decoded.userId };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired", message: "Token has expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: "Invalid token", message: "Invalid or malformed token" });
    }
    return res.status(403).json({ error: "Invalid token", message: "Token verification failed" });
  }
};
