import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generate a JWT access token for a user
 * Uses JWT_SECRET from validated environment configuration
 */
export const generateAccessToken = (userId: string) => {
  const expiresIn = env.JWT_EXPIRES_IN || "15m";
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn } as SignOptions
  );
};

/**
 * Generate a JWT refresh token for a user
 * Uses JWT_SECRET from validated environment configuration
 */
export const generateRefreshToken = (userId: string) => {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn } as SignOptions
  );
};
