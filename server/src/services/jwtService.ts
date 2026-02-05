import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import crypto from 'crypto';
import { UnauthorizedError } from '../utils/errors.js';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT access token for a user
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string,
  } as SignOptions);
};

/**
 * Generate a refresh token (random secure string)
 * Refresh tokens are stored in the database and don't contain user info
 */
export const generateRefreshToken = (): string => {
  // Generate a cryptographically secure random token
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Get refresh token expiration date
 */
export const getRefreshTokenExpiration = (): Date => {
  const expiresInDays = parseInt(JWT_REFRESH_EXPIRES_IN.replace('d', '')) || 7;
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expiresInDays);
  return expirationDate;
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    } else {
      throw new UnauthorizedError('Token verification failed');
    }
  }
};

/**
 * Decode token without verification (for debugging purposes)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
};
