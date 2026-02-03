import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

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
      process.env.ACCESS_TOKEN_SECRET!
    ) as any;

    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.sendStatus(403);
  }
};
