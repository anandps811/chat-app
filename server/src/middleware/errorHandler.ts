import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Interface for error response
 */
interface ErrorResponse {
  error: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
  stack?: string;
}

/**
 * Check if error is a MongoDB duplicate key error
 */
const isMongoDuplicateError = (error: unknown): boolean => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 11000 &&
    'keyPattern' in error &&
    error.keyPattern !== null &&
    typeof error.keyPattern === 'object'
  );
};

/**
 * Check if error is a Mongoose validation error
 */
const isMongooseValidationError = (error: unknown): boolean => {
  return error instanceof mongoose.Error.ValidationError;
};

/**
 * Check if error is a Mongoose cast error (invalid ObjectId, etc.)
 */
const isMongooseCastError = (error: unknown): boolean => {
  return error instanceof mongoose.Error.CastError;
};

/**
 * Format Zod validation errors
 */
const formatZodError = (error: ZodError): ErrorResponse => {
  return {
    error: 'Validation failed',
    message: 'Invalid input data',
    details: error.issues.map((issue) => ({
      field: issue.path.join('.') || 'unknown',
      message: issue.message || 'Validation error',
    })),
  };
};

/**
 * Format MongoDB duplicate key error
 */
const formatMongoDuplicateError = (error: any): ErrorResponse => {
  const field = Object.keys(error.keyPattern || {})[0] || 'field';
  return {
    error: 'Resource already exists',
    message: `A resource with this ${field} already exists`,
  };
};

/**
 * Format Mongoose validation error
 */
const formatMongooseValidationError = (error: mongoose.Error.ValidationError): ErrorResponse => {
  const details = Object.values(error.errors).map((err) => ({
    field: err.path || 'unknown',
    message: err.message || 'Validation error',
  }));

  return {
    error: 'Validation failed',
    message: 'Invalid input data',
    details,
  };
};

/**
 * Format Mongoose cast error
 */
const formatMongooseCastError = (error: mongoose.Error.CastError): ErrorResponse => {
  return {
    error: 'Invalid input',
    message: `Invalid ${error.path || 'field'}: ${error.value}`,
  };
};

/**
 * Centralized error handling middleware
 * This should be used as the last middleware in Express app
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let errorResponse: ErrorResponse;
  let statusCode = 500;

  // Handle known AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorResponse = {
      error: err.name.replace('Error', '').replace(/([A-Z])/g, ' $1').trim(),
      message: err.message,
    };

    if (err.field) {
      errorResponse.details = [
        {
          field: err.field,
          message: err.message,
        },
      ];
    }
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    errorResponse = formatZodError(err);
  }
  // Handle MongoDB duplicate key errors
  else if (isMongoDuplicateError(err)) {
    statusCode = 409;
    errorResponse = formatMongoDuplicateError(err as any);
  }
  // Handle Mongoose validation errors
  else if (isMongooseValidationError(err)) {
    statusCode = 400;
    errorResponse = formatMongooseValidationError(err as mongoose.Error.ValidationError);
  }
  // Handle Mongoose cast errors
  else if (isMongooseCastError(err)) {
    statusCode = 400;
    errorResponse = formatMongooseCastError(err as mongoose.Error.CastError);
  }
  // Handle JSON syntax errors (from express.json middleware)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    errorResponse = {
      error: 'Invalid JSON',
      message: 'The request body contains invalid JSON.',
    };
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse = {
      error: 'Invalid token',
      message: 'Invalid or malformed token',
    };
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse = {
      error: 'Token expired',
      message: 'Token has expired',
    };
  }
  // Handle unknown errors
  else {
    // Log error for debugging
    logger.error('Unhandled error', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    errorResponse = {
      error: 'Internal server error',
      message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    };

    // Include stack trace in development
    if (env.NODE_ENV === 'development' && err.stack) {
      errorResponse.stack = err.stack;
    }
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: export const handler = asyncHandler(async (req, res) => { ... })
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 * This should be placed after all routes but before errorHandler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
  });
};

