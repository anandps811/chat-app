export interface TokenPayload {
    userId: string;
    email: string;
}
/**
 * Generate a JWT access token for a user
 */
export declare const generateToken: (payload: TokenPayload) => string;
/**
 * Generate a refresh token (random secure string)
 * Refresh tokens are stored in the database and don't contain user info
 */
export declare const generateRefreshToken: () => string;
/**
 * Get refresh token expiration date
 */
export declare const getRefreshTokenExpiration: () => Date;
/**
 * Verify and decode a JWT token
 */
export declare const verifyToken: (token: string) => TokenPayload;
/**
 * Decode token without verification (for debugging purposes)
 */
export declare const decodeToken: (token: string) => TokenPayload | null;
//# sourceMappingURL=jwtService.d.ts.map