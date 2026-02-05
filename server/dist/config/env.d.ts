import { z } from 'zod';
/**
 * Environment variables schema using Zod
 * This ensures all required environment variables are present and properly typed
 */
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    PORT: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    MONGODB_URI: z.ZodString;
    MONGODB_MAX_POOL_SIZE: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    MONGODB_MIN_POOL_SIZE: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    MONGODB_CONNECT_TIMEOUT_MS: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    MONGODB_SOCKET_TIMEOUT_MS: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    MONGODB_HEARTBEAT_FREQUENCY_MS: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    MONGODB_RETRY_WRITES: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    MONGODB_RETRY_READS: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<boolean, string>>;
    MONGODB_MAX_RECONNECT_ATTEMPTS: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    MONGODB_RECONNECT_INTERVAL_MS: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    MJ_APIKEY_PUBLIC: z.ZodOptional<z.ZodString>;
    MJ_APIKEY_PRIVATE: z.ZodOptional<z.ZodString>;
    MJ_FROM_EMAIL: z.ZodOptional<z.ZodString>;
    MJ_SENDER_EMAIL: z.ZodOptional<z.ZodString>;
    MJ_FROM_NAME: z.ZodOptional<z.ZodString>;
    TWILIO_ACCOUNT_SID: z.ZodOptional<z.ZodString>;
    TWILIO_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
    TWILIO_PHONE_NUMBER: z.ZodOptional<z.ZodString>;
    SEND_Email: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean, string | undefined>>;
    LOG_LEVEL: z.ZodOptional<z.ZodEnum<{
        error: "error";
        warn: "warn";
        info: "info";
        http: "http";
        debug: "debug";
    }>>;
    ALLOWED_ORIGINS: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Validated environment variables
 * Import this instead of using process.env directly
 */
export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    MONGODB_URI: string;
    MONGODB_MAX_POOL_SIZE: number;
    MONGODB_MIN_POOL_SIZE: number;
    MONGODB_CONNECT_TIMEOUT_MS: number;
    MONGODB_SOCKET_TIMEOUT_MS: number;
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: number;
    MONGODB_HEARTBEAT_FREQUENCY_MS: number;
    MONGODB_RETRY_WRITES: boolean;
    MONGODB_RETRY_READS: boolean;
    MONGODB_MAX_RECONNECT_ATTEMPTS: number;
    MONGODB_RECONNECT_INTERVAL_MS: number;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    SEND_Email: boolean;
    MJ_APIKEY_PUBLIC?: string | undefined;
    MJ_APIKEY_PRIVATE?: string | undefined;
    MJ_FROM_EMAIL?: string | undefined;
    MJ_SENDER_EMAIL?: string | undefined;
    MJ_FROM_NAME?: string | undefined;
    TWILIO_ACCOUNT_SID?: string | undefined;
    TWILIO_AUTH_TOKEN?: string | undefined;
    TWILIO_PHONE_NUMBER?: string | undefined;
    LOG_LEVEL?: "error" | "warn" | "info" | "http" | "debug" | undefined;
    ALLOWED_ORIGINS?: string | undefined;
};
/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;
export {};
//# sourceMappingURL=env.d.ts.map