/**
 * Base error class with status code support
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly field: string | undefined;
    constructor(message: string, statusCode?: number, isOperational?: boolean, field?: string);
}
/**
 * 400 Bad Request - Validation errors
 */
export declare class ValidationError extends AppError {
    constructor(message?: string, field?: string);
}
/**
 * 401 Unauthorized - Authentication required
 */
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
/**
 * 403 Forbidden - Insufficient permissions
 */
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
/**
 * 404 Not Found - Resource not found
 */
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
/**
 * 409 Conflict - Duplicate resource
 */
export declare class ConflictError extends AppError {
    constructor(message?: string, field?: string);
}
/**
 * 422 Unprocessable Entity - Business logic validation failed
 */
export declare class UnprocessableEntityError extends AppError {
    constructor(message?: string);
}
/**
 * Custom error classes for specific domains
 */
export declare class UserNotFoundError extends NotFoundError {
    constructor(message?: string);
}
export declare class DuplicateUserError extends ConflictError {
    constructor(message?: string, field?: string);
}
export declare class InvalidCredentialsError extends UnauthorizedError {
    constructor(message?: string);
}
export declare class GroupNotFoundError extends NotFoundError {
    constructor(message?: string);
}
export declare class PostNotFoundError extends NotFoundError {
    constructor(message?: string);
}
export declare class EventNotFoundError extends NotFoundError {
    constructor(message?: string);
}
export declare class ChatNotFoundError extends NotFoundError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map