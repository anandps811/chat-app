import mongoose from 'mongoose';
declare enum ConnectionState {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    DISCONNECTING = "disconnecting",
    ERROR = "error"
}
/**
 * Check if database connection is healthy
 */
export declare const isDatabaseConnected: () => boolean;
/**
 * Connect to MongoDB with retry logic and connection pool configuration
 */
export declare const connectDatabase: () => Promise<void>;
/**
 * Disconnect from MongoDB gracefully
 */
export declare const disconnectDatabase: () => Promise<void>;
/**
 * Get connection statistics
 */
export declare const getConnectionStats: () => {
    state: ConnectionState;
    readyState: mongoose.ConnectionStates;
    reconnectAttempts: number;
    isReconnecting: boolean;
    host: string;
    port: number;
    name: string;
};
export {};
//# sourceMappingURL=db.d.ts.map