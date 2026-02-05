import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { AuthRequest } from './authMiddleware.js';
/**
 * Centralized error handling middleware
 * This should be used as the last middleware in Express app
 */
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => void;
/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: export const handler = asyncHandler(async (req, res) => { ... })
 */
export declare const asyncHandler: (fn: (req: Request | AuthRequest, res: Response, next: NextFunction) => Promise<void> | void) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 Not Found handler
 * This should be placed after all routes but before errorHandler
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.d.ts.map