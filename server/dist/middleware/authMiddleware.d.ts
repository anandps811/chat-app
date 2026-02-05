import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        id: string;
    };
}
/**
 * Legacy authentication middleware (simpler version)
 * Uses JWT_SECRET from validated environment configuration
 */
export declare const protect: (req: any, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Authentication middleware with detailed error handling
 * Uses JWT_SECRET from validated environment configuration
 */
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMiddleware.d.ts.map