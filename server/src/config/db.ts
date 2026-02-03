import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const MONGODB_URI = env.MONGODB_URI;

// Connection state management
enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error',
}

let connectionState: ConnectionState = ConnectionState.DISCONNECTED;
let reconnectAttempts = 0;
let reconnectTimer: NodeJS.Timeout | null = null;
let isReconnecting = false;

/**
 * Calculate exponential backoff delay
 */
const calculateBackoffDelay = (attempt: number): number => {
  const baseDelay = env.MONGODB_RECONNECT_INTERVAL_MS;
  const maxDelay = 30000; // 30 seconds max
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return delay;
};

/**
 * Connection options with pool configuration
 */
const getConnectionOptions = (): mongoose.ConnectOptions => {
  return {
    // Connection pool settings
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    minPoolSize: env.MONGODB_MIN_POOL_SIZE,
    
    // Timeout settings
    connectTimeoutMS: env.MONGODB_CONNECT_TIMEOUT_MS,
    socketTimeoutMS: env.MONGODB_SOCKET_TIMEOUT_MS,
    serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    heartbeatFrequencyMS: env.MONGODB_HEARTBEAT_FREQUENCY_MS,
    
    // Retry settings
    retryWrites: env.MONGODB_RETRY_WRITES,
    retryReads: env.MONGODB_RETRY_READS,
  };
};

/**
 * Check if database connection is healthy
 */
export const isDatabaseConnected = (): boolean => {
  return (
    connectionState === ConnectionState.CONNECTED &&
    mongoose.connection.readyState === mongoose.ConnectionStates.connected
  );
};

/**
 * Attempt to reconnect to the database with exponential backoff
 */
const attemptReconnect = async (): Promise<void> => {
  if (isReconnecting) {
    return;
  }

  if (reconnectAttempts >= env.MONGODB_MAX_RECONNECT_ATTEMPTS) {
    logger.error('Max reconnection attempts reached. Stopping reconnection attempts.', {
      attempts: reconnectAttempts,
      maxAttempts: env.MONGODB_MAX_RECONNECT_ATTEMPTS,
    });
    connectionState = ConnectionState.ERROR;
    isReconnecting = false;
    return;
  }

  isReconnecting = true;
  reconnectAttempts++;
  const delay = calculateBackoffDelay(reconnectAttempts - 1);

  logger.warn('Attempting to reconnect to database', {
    attempt: reconnectAttempts,
    maxAttempts: env.MONGODB_MAX_RECONNECT_ATTEMPTS,
    delayMs: delay,
  });

  reconnectTimer = setTimeout(async () => {
    try {
      await mongoose.connect(MONGODB_URI, getConnectionOptions());
      // Connection successful - reset state
      reconnectAttempts = 0;
      connectionState = ConnectionState.CONNECTED;
      isReconnecting = false;
      logger.info('Database reconnection successful', {
        attempt: reconnectAttempts,
      });
    } catch (error) {
      logger.error('Database reconnection attempt failed', {
        error,
        attempt: reconnectAttempts,
        maxAttempts: env.MONGODB_MAX_RECONNECT_ATTEMPTS,
      });
      isReconnecting = false;
      // Try again
      await attemptReconnect();
    }
  }, delay);
};

/**
 * Connect to MongoDB with retry logic and connection pool configuration
 */
export const connectDatabase = async (): Promise<void> => {
  // If already connected, verify connection health
  if (connectionState === ConnectionState.CONNECTED && isDatabaseConnected()) {
    logger.info('Database already connected');
    return;
  }

  // If already connecting, wait for connection
  if (connectionState === ConnectionState.CONNECTING) {
    logger.info('Database connection already in progress, waiting...');
    // Wait for connection to complete (max 30 seconds)
    const maxWait = 30000;
    const startTime = Date.now();
    while (connectionState === ConnectionState.CONNECTING && Date.now() - startTime < maxWait) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (isDatabaseConnected()) {
      return;
    }
  }

  // Validate MONGODB_URI is set
  if (!MONGODB_URI) {
    const error = new Error(
      'MONGODB_URI environment variable is not set. Please set it in your .env file.'
    );
    logger.error('Database connection error: MONGODB_URI not set');
    connectionState = ConnectionState.ERROR;
    throw error;
  }

  connectionState = ConnectionState.CONNECTING;

  try {
    const options = getConnectionOptions();
    logger.info('Connecting to MongoDB', {
      uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // Mask credentials
      maxPoolSize: options.maxPoolSize,
      minPoolSize: options.minPoolSize,
      connectTimeoutMS: options.connectTimeoutMS,
    });

    await mongoose.connect(MONGODB_URI, options);
    
    connectionState = ConnectionState.CONNECTED;
    reconnectAttempts = 0;
    isReconnecting = false;
    
    logger.info('Database connected successfully', {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    });
  } catch (error) {
    connectionState = ConnectionState.ERROR;
    logger.error('Database connection error', { error });
    
    // Attempt automatic reconnection
    if (reconnectAttempts < env.MONGODB_MAX_RECONNECT_ATTEMPTS) {
      logger.info('Scheduling automatic reconnection...');
      await attemptReconnect();
    } else {
      throw error;
    }
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.DISCONNECTING) {
    return;
  }

  // Clear any pending reconnection attempts
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  isReconnecting = false;

  connectionState = ConnectionState.DISCONNECTING;

  try {
    await mongoose.disconnect();
    connectionState = ConnectionState.DISCONNECTED;
    logger.info('Database disconnected gracefully');
  } catch (error) {
    logger.error('Error disconnecting database', { error });
    connectionState = ConnectionState.ERROR;
    throw error;
  }
};

/**
 * Get connection statistics
 */
export const getConnectionStats = () => {
  return {
    state: connectionState,
    readyState: mongoose.connection.readyState,
    reconnectAttempts,
    isReconnecting,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
};

// Handle connection events
mongoose.connection.on('connected', () => {
  connectionState = ConnectionState.CONNECTED;
  reconnectAttempts = 0;
  isReconnecting = false;
  logger.info('Mongoose connected to MongoDB', {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  });
});

mongoose.connection.on('error', (err) => {
  const wasDisconnecting = connectionState === ConnectionState.DISCONNECTING;
  connectionState = ConnectionState.ERROR;
  logger.error('Mongoose connection error', { error: err });
  
  // Attempt reconnection if not already reconnecting and not manually disconnecting
  if (!isReconnecting && !wasDisconnecting) {
    attemptReconnect();
  }
});

mongoose.connection.on('disconnected', () => {
  const wasDisconnecting = connectionState === ConnectionState.DISCONNECTING;
  connectionState = ConnectionState.DISCONNECTED;
  logger.warn('Mongoose disconnected from MongoDB', {
    reconnectAttempts,
    maxAttempts: env.MONGODB_MAX_RECONNECT_ATTEMPTS,
  });
  
  // Attempt reconnection if not already reconnecting and not manually disconnected
  if (!isReconnecting && !wasDisconnecting) {
    attemptReconnect();
  }
});

mongoose.connection.on('reconnected', () => {
  connectionState = ConnectionState.CONNECTED;
  reconnectAttempts = 0;
  isReconnecting = false;
  logger.info('Mongoose reconnected to MongoDB', {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  });
});

mongoose.connection.on('connecting', () => {
  connectionState = ConnectionState.CONNECTING;
  logger.debug('Mongoose connecting to MongoDB');
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    await disconnectDatabase();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error });
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception', { error });
  await disconnectDatabase();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  // Don't exit on unhandled rejection, but log it
});
