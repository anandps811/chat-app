/**
 * General API rate limiter - applies to all routes
 * Allows 100 requests per 15 minutes per IP
 */
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for authentication routes
 * Prevents brute force attacks on login/signup
 * Allows 15 requests per 15 minutes per IP
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for OTP requests
 * Prevents abuse of OTP generation
 * Allows 5 requests per hour per IP
 */
export declare const otpLimiter: import("express-rate-limit").RateLimitRequestHandler;
/** * Rate limiter for token refresh routes
 * Prevents abuse of token refresh functionality
 * Allows 30 requests per 15 minutes per IP
 */
export declare const refreshLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map