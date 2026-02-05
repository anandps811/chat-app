import { z } from 'zod';
/**
 * Validation for chat ID parameter
 */
export declare const chatIdParamSchema: z.ZodObject<{
    chatId: z.ZodString;
}, z.core.$strip>;
/**
 * Validation for user ID parameter
 */
export declare const userIdParamSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
/**
 * Validation for message ID parameter
 */
export declare const messageIdParamSchema: z.ZodObject<{
    messageId: z.ZodString;
}, z.core.$strip>;
/**
 * Validation for chat and message IDs
 */
export declare const chatMessageIdParamsSchema: z.ZodObject<{
    chatId: z.ZodString;
    messageId: z.ZodString;
}, z.core.$strip>;
/**
 * Validation for pagination query parameters
 */
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>>;
}, z.core.$strip>;
/**
 * Validation for send message request body
 */
export declare const sendMessageSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    voiceMessageUrl: z.ZodOptional<z.ZodString>;
    voiceMessageDuration: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
/**
 * Validation for update profile request body
 */
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
/**
 * Validation for search users query parameter
 */
export declare const searchUsersQuerySchema: z.ZodObject<{
    q: z.ZodString;
}, z.core.$strip>;
export type SearchUsersQuery = z.infer<typeof searchUsersQuerySchema>;
//# sourceMappingURL=chatValidation.d.ts.map