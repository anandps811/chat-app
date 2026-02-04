import { z } from 'zod';

/**
 * Environment variables schema using Zod
 * This ensures all required environment variables are present and properly typed
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  // Database Configuration
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_MAX_POOL_SIZE: z.string().default('10').transform(Number),
  MONGODB_MIN_POOL_SIZE: z.string().default('2').transform(Number),
  MONGODB_CONNECT_TIMEOUT_MS: z.string().default('30000').transform(Number),
  MONGODB_SOCKET_TIMEOUT_MS: z.string().default('45000').transform(Number),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.string().default('30000').transform(Number),
  MONGODB_HEARTBEAT_FREQUENCY_MS: z.string().default('10000').transform(Number),
  MONGODB_RETRY_WRITES: z.string().default('true').transform((val) => val === 'true'),
  MONGODB_RETRY_READS: z.string().default('true').transform((val) => val === 'true'),
  MONGODB_MAX_RECONNECT_ATTEMPTS: z.string().default('10').transform(Number),
  MONGODB_RECONNECT_INTERVAL_MS: z.string().default('5000').transform(Number),

  // JWT Configuration
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'), // Access token expiration (15 minutes)
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'), // Refresh token expiration (7 days)

  // Mailjet Email Configuration (Optional)
  MJ_APIKEY_PUBLIC: z.string().optional(),
  MJ_APIKEY_PRIVATE: z.string().optional(),
  MJ_FROM_EMAIL: z.string().email().optional(),
  MJ_SENDER_EMAIL: z.string().email().optional(),
  MJ_FROM_NAME: z.string().optional(),

  // Twilio SMS Configuration (Optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Email Sending Configuration
  SEND_Email: z.string().optional().transform((val) => val === 'true'),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).optional(),
});

/**
 * Validate and parse environment variables
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
      // Use console.error here since logger might not be initialized yet
      console.error('❌ Environment variable validation failed:\n', missingVars);
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
};

/**
 * Validated environment variables
 * Import this instead of using process.env directly
 */
export const env = parseEnv();

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;

