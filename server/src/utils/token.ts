import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generate a JWT access token for a user
 * Uses JWT_SECRET from validated environment configuration
 */
export const generateAccessToken = (userId: string) => {
  const secret = process.env.ACCESS_TOKEN_SECRET || env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }
  const expiresIn = env.JWT_EXPIRES_IN || "15m";
  return jwt.sign(
    { userId },
    secret,
    { expiresIn } as SignOptions
  );
};

/**
 * Generate a JWT refresh token for a user
 * Uses JWT_SECRET from validated environment configuration
 */
export const generateRefreshToken = (userId: string) => {
  const secret = process.env.REFRESH_TOKEN_SECRET || env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(
    { userId },
    secret,
    { expiresIn } as SignOptions
  );
};
