import { z } from 'zod';
import mongoose from 'mongoose';
/**
 * Validation for MongoDB ObjectId
 */
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid ID format' });
/**
 * Validation for chat ID parameter
 */
export const chatIdParamSchema = z.object({
    chatId: objectIdSchema,
});
/**
 * Validation for user ID parameter
 */
export const userIdParamSchema = z.object({
    userId: objectIdSchema,
});
/**
 * Validation for message ID parameter
 */
export const messageIdParamSchema = z.object({
    messageId: objectIdSchema,
});
/**
 * Validation for chat and message IDs
 */
export const chatMessageIdParamsSchema = z.object({
    chatId: objectIdSchema,
    messageId: objectIdSchema,
});
/**
 * Validation for pagination query parameters
 */
export const paginationQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).optional().default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional().default(50),
});
/**
 * Validation for send message request body
 */
export const sendMessageSchema = z.object({
    content: z.string().max(5000, 'Message content must not exceed 5000 characters').optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    voiceMessageUrl: z.string().url('Invalid voice message URL').optional(),
    voiceMessageDuration: z.number().int().min(0).max(3600, 'Voice message duration must not exceed 3600 seconds').optional(),
}).refine((data) => data.content || data.imageUrl || data.voiceMessageUrl, {
    message: 'Message content, image, or voice message is required',
    path: ['content'],
});
/**
 * Validation for update profile request body
 */
export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').trim().optional(),
    email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').trim().optional(),
});
/**
 * Validation for search users query parameter
 */
export const searchUsersQuerySchema = z.object({
    q: z.string().min(1, 'Search query is required').max(100, 'Search query must not exceed 100 characters').trim(),
});
//# sourceMappingURL=chatValidation.js.map