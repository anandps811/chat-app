/**
 * Base error class with status code support
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly field?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    field?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.field = field;

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
  constructor(message: string = 'Validation failed', field?: string) {
    super(message, 400, true, field);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * 409 Conflict - Duplicate resource
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', field?: string) {
    super(message, 409, true, field);
  }
}

/**
 * 422 Unprocessable Entity - Business logic validation failed
 */
export class UnprocessableEntityError extends AppError {
  constructor(message: string = 'Unprocessable entity') {
    super(message, 422);
  }
}

/**
 * Custom error classes for specific domains
 */
export class UserNotFoundError extends NotFoundError {
  constructor(message: string = 'User not found') {
    super(message);
  }
}

export class DuplicateUserError extends ConflictError {
  constructor(message: string = 'User already exists', field?: string) {
    super(message, field);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message: string = 'Invalid credentials') {
    super(message);
  }
}

export class GroupNotFoundError extends NotFoundError {
  constructor(message: string = 'Group not found') {
    super(message);
  }
}

export class PostNotFoundError extends NotFoundError {
  constructor(message: string = 'Post not found') {
    super(message);
  }
}

export class EventNotFoundError extends NotFoundError {
  constructor(message: string = 'Event not found') {
    super(message);
  }
}

export class ChatNotFoundError extends NotFoundError {
  constructor(message: string = 'Chat not found') {
    super(message);
  }
}

