import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
/**
 * Generate a JWT access token for a user
 * Uses JWT_SECRET from validated environment configuration
 */
export const generateAccessToken = (userId) => {
    const secret = process.env.ACCESS_TOKEN_SECRET || env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT secret is not configured");
    }
    const expiresIn = env.JWT_EXPIRES_IN || "15m";
    return jwt.sign({ userId }, secret, { expiresIn });
};
/**
 * Generate a JWT refresh token for a user
 * Uses JWT_SECRET from validated environment configuration
 */
export const generateRefreshToken = (userId) => {
    const secret = process.env.REFRESH_TOKEN_SECRET || env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT secret is not configured");
    }
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN || "7d";
    return jwt.sign({ userId }, secret, { expiresIn });
};
//# sourceMappingURL=token.js.map