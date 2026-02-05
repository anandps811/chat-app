/**
 * Generate a JWT access token for a user
 * Uses JWT_SECRET from validated environment configuration
 */
export declare const generateAccessToken: (userId: string) => string;
/**
 * Generate a JWT refresh token for a user
 * Uses JWT_SECRET from validated environment configuration
 */
export declare const generateRefreshToken: (userId: string) => string;
//# sourceMappingURL=token.d.ts.map