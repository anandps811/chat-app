import mongoose from 'mongoose';
/**
 * Execute a function within a MongoDB transaction if supported, otherwise execute without transaction
 * Automatically handles commit/rollback on success/failure
 *
 * @param callback - Function that receives a session (or null) and performs operations
 * @returns The result of the callback function
 */
export declare const withTransaction: <T>(callback: (session: mongoose.ClientSession | null) => Promise<T>) => Promise<T>;
//# sourceMappingURL=transaction.d.ts.map