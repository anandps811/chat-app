import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import crypto from 'crypto';
import { UnauthorizedError } from '../utils/errors.js';
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;
/**
 * Generate a JWT access token for a user
 */
export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
/**
 * Generate a refresh token (random secure string)
 * Refresh tokens are stored in the database and don't contain user info
 */
export const generateRefreshToken = () => {
    // Generate a cryptographically secure random token
    return crypto.randomBytes(64).toString('hex');
};
/**
 * Get refresh token expiration date
 */
export const getRefreshTokenExpiration = () => {
    const expiresInDays = parseInt(JWT_REFRESH_EXPIRES_IN.replace('d', '')) || 7;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expiresInDays);
    return expirationDate;
};
/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Token has expired');
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid token');
        }
        else {
            throw new UnauthorizedError('Token verification failed');
        }
    }
};
/**
 * Decode token without verification (for debugging purposes)
 */
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    }
    catch (error) {
        return null;
    }
};
//# sourceMappingURL=jwtService.js.map