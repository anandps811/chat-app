/**
 * Base error class with status code support
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, field) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.field = field ?? undefined;
        // Maintains proper stack trace for where our error was thrown (V8 only)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends AppError {
    constructor(message = 'Validation failed', field) {
        super(message, 400, true, field);
    }
}
/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
/**
 * 409 Conflict - Duplicate resource
 */
export class ConflictError extends AppError {
    constructor(message = 'Resource already exists', field) {
        super(message, 409, true, field);
    }
}
/**
 * 422 Unprocessable Entity - Business logic validation failed
 */
export class UnprocessableEntityError extends AppError {
    constructor(message = 'Unprocessable entity') {
        super(message, 422);
    }
}
/**
 * Custom error classes for specific domains
 */
export class UserNotFoundError extends NotFoundError {
    constructor(message = 'User not found') {
        super(message);
    }
}
export class DuplicateUserError extends ConflictError {
    constructor(message = 'User already exists', field) {
        super(message, field);
    }
}
export class InvalidCredentialsError extends UnauthorizedError {
    constructor(message = 'Invalid credentials') {
        super(message);
    }
}
export class GroupNotFoundError extends NotFoundError {
    constructor(message = 'Group not found') {
        super(message);
    }
}
export class PostNotFoundError extends NotFoundError {
    constructor(message = 'Post not found') {
        super(message);
    }
}
export class EventNotFoundError extends NotFoundError {
    constructor(message = 'Event not found') {
        super(message);
    }
}
export class ChatNotFoundError extends NotFoundError {
    constructor(message = 'Chat not found') {
        super(message);
    }
}
//# sourceMappingURL=errors.js.map