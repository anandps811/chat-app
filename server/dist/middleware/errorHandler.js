import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
/**
 * Check if error is a MongoDB duplicate key error
 */
const isMongoDuplicateError = (error) => {
    return (error !== null &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000 &&
        'keyPattern' in error &&
        error.keyPattern !== null &&
        typeof error.keyPattern === 'object');
};
/**
 * Check if error is a Mongoose validation error
 */
const isMongooseValidationError = (error) => {
    return error instanceof mongoose.Error.ValidationError;
};
/**
 * Check if error is a Mongoose cast error (invalid ObjectId, etc.)
 */
const isMongooseCastError = (error) => {
    return error instanceof mongoose.Error.CastError;
};
/**
 * Format Zod validation errors
 */
const formatZodError = (error) => {
    const issues = error.issues.map((issue) => {
        const field = issue.path.join('.') || 'unknown';
        let message = issue.message || 'Validation error';
        // Enhance common validation error messages
        // Zod v4 type checking - use type guards for safe property access
        if (issue.code === 'too_small') {
            const tooSmallIssue = issue;
            if ('minimum' in tooSmallIssue && typeof tooSmallIssue.minimum === 'number') {
                message = `${field} must be at least ${tooSmallIssue.minimum} characters long`;
            }
        }
        else if (issue.code === 'too_big') {
            const tooBigIssue = issue;
            if ('maximum' in tooBigIssue && typeof tooBigIssue.maximum === 'number') {
                message = `${field} must not exceed ${tooBigIssue.maximum} characters`;
            }
        }
        else if (issue.code === 'invalid_type') {
            const invalidTypeIssue = issue;
            if ('expected' in invalidTypeIssue && 'received' in invalidTypeIssue) {
                message = `${field} must be of type ${invalidTypeIssue.expected}, but received ${invalidTypeIssue.received}`;
            }
        }
        else if (issue.code === 'invalid_format') {
            const invalidFormatIssue = issue;
            if ('format' in invalidFormatIssue) {
                if (invalidFormatIssue.format === 'email') {
                    message = `Please provide a valid email address for ${field}`;
                }
                else {
                    message = `${field} format is invalid. ${message}`;
                }
            }
        }
        return {
            field,
            message,
        };
    });
    const mainMessage = issues.length === 1 && issues[0]
        ? issues[0].message
        : `Validation failed for ${issues.length} field(s). Please check the details and try again.`;
    return {
        error: 'Validation failed',
        message: mainMessage,
        details: issues,
    };
};
/**
 * Format MongoDB duplicate key error
 */
const formatMongoDuplicateError = (error) => {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    const fieldName = field === 'email' ? 'email address' :
        field === 'mobileNumber' ? 'mobile number' :
            field;
    return {
        error: 'Resource already exists',
        message: `A user with this ${fieldName} already exists. Please use a different ${fieldName} or try logging in.`,
        details: [{
                field,
                message: `This ${fieldName} is already registered`,
            }],
    };
};
/**
 * Format Mongoose validation error
 */
const formatMongooseValidationError = (error) => {
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
const formatMongooseCastError = (error) => {
    const fieldName = error.path || 'field';
    const value = error.value || 'provided value';
    let message = `Invalid ${fieldName} format`;
    if (fieldName.includes('Id') || fieldName.includes('_id')) {
        message = `Invalid ID format. Please provide a valid ${fieldName.replace('Id', ' ID').replace('_id', ' ID')}`;
    }
    return {
        error: 'Invalid input',
        message,
        details: [{
                field: fieldName,
                message: `The value "${value}" is not a valid format for ${fieldName}`,
            }],
    };
};
/**
 * Centralized error handling middleware
 * This should be used as the last middleware in Express app
 */
export const errorHandler = (err, req, res, _next) => {
    let errorResponse;
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
        errorResponse = formatMongoDuplicateError(err);
    }
    // Handle Mongoose validation errors
    else if (isMongooseValidationError(err)) {
        statusCode = 400;
        errorResponse = formatMongooseValidationError(err);
    }
    // Handle Mongoose cast errors
    else if (isMongooseCastError(err)) {
        statusCode = 400;
        errorResponse = formatMongooseCastError(err);
    }
    // Handle JSON syntax errors (from express.json middleware)
    else if (err instanceof SyntaxError && 'body' in err) {
        statusCode = 400;
        errorResponse = {
            error: 'Invalid JSON',
            message: 'The request body contains invalid JSON. Please check your request format and try again.',
        };
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorResponse = {
            error: 'Invalid token',
            message: 'The provided authentication token is invalid or malformed. Please log in again.',
        };
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorResponse = {
            error: 'Token expired',
            message: 'Your session has expired. Please refresh your token or log in again.',
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
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * 404 Not Found handler
 * This should be placed after all routes but before errorHandler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.path}`,
    });
};
//# sourceMappingURL=errorHandler.js.map