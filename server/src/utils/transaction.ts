import mongoose from 'mongoose';
import { logger } from './logger.js';

/**
 * Check if MongoDB instance supports transactions (replica set or mongos)
 */
const supportsTransactions = async (): Promise<boolean> => {
  try {
    // Wait for MongoDB connection to be ready
    let readyState = mongoose.connection.readyState;
    if (readyState !== mongoose.ConnectionStates.connected) {
      // Connection not ready, wait a bit and check again (max 2 seconds)
      const maxWait = 2000;
      const startTime = Date.now();
      while (readyState !== mongoose.ConnectionStates.connected && Date.now() - startTime < maxWait) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        readyState = mongoose.connection.readyState;
      }
      // If still not ready, assume no transactions for now
      if (readyState !== mongoose.ConnectionStates.connected) {
        return false;
      }
    }
    
    const admin = mongoose.connection.db?.admin();
    if (!admin) {
      return false;
    }
    
    const serverStatus = await admin.serverStatus();
    // Transactions are supported on replica sets or mongos
    return serverStatus.repl !== undefined || serverStatus.process === 'mongos';
  } catch (error) {
    // If we can't determine, assume transactions are not supported
    // Don't log here - we'll log once after the check is complete
    return false;
  }
};

// Cache the transaction support check
let transactionSupportChecked = false;
let transactionsSupported = false;
let warningLogged = false; // Track if warning has been logged

/**
 * Execute a function within a MongoDB transaction if supported, otherwise execute without transaction
 * Automatically handles commit/rollback on success/failure
 * 
 * @param callback - Function that receives a session (or null) and performs operations
 * @returns The result of the callback function
 */
export const withTransaction = async <T>(
  callback: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<T> => {
  // Check transaction support once and cache the result
  if (!transactionSupportChecked) {
    transactionsSupported = await supportsTransactions();
    transactionSupportChecked = true;
    
    // Log warning only once
    if (!transactionsSupported && !warningLogged) {
      warningLogged = true;
      logger.warn(
        'MongoDB transactions are not supported (standalone instance detected). ' +
        'Operations will execute without transactions. For production, consider using a replica set.'
      );
    }
  }

  // If transactions are not supported, execute without transaction
  if (!transactionsSupported) {
    try {
      // Execute without session (operations will not be transactional)
      return await callback(null);
    } catch (error) {
      logger.error('Operation failed (non-transactional)', { error });
      throw error;
    }
  }

  // Use actual transaction for replica sets/mongos
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Transaction aborted', { error });
    throw error;
  } finally {
    session.endSession();
  }
};
