import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
  user?: { userId: string; id: string };
}

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
    const secret = process.env.ACCESS_TOKEN_SECRET || env.JWT_SECRET;
    const decoded = jwt.verify(
      token,
      secret
    ) as any;

    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.sendStatus(403);
  }
};

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

  try {
    const secret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server configuration error", message: "JWT secret not configured" });
    }
    const decoded = jwt.verify(
      token || 'null',
      secret
    ) as any;

    (req as AuthRequest).user = { userId: decoded.userId, id: decoded.userId };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired", message: "Token has expired" });
    }
    return res.status(403).json({ error: "Invalid token", message: "Invalid or malformed token" });
  }
};
