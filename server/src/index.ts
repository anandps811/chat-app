import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { initializeSocket } from './config/socket.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';

const app = express();
const httpServer = createServer(app);
const PORT = env.PORT;

// Security headers - must be applied early
app.use(securityHeaders);

// CORS configuration
const getCorsOrigin = (): string | string[] | boolean => {
  // In development, allow all origins for easier local development
  if (env.NODE_ENV === 'development') {
    return true;
  }

  // In production, use whitelist from environment variable
  if (env.ALLOWED_ORIGINS) {
    const origins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean);
    if (origins.length > 0) {
      return origins;
    }
  }

  // Fallback: in production without ALLOWED_ORIGINS, allow all (not recommended)
  // Log a warning about this
  if (env.NODE_ENV === 'production') {
    logger.warn('CORS: ALLOWED_ORIGINS not set in production. Allowing all origins (not recommended for security).');
  }
  
  return true;
};

app.use(cors({
  origin: getCorsOrigin(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));

// Parse cookies - must be before routes
app.use(cookieParser());

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Chat app Backend API is running!' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
app.use('/api/auth', authRoutes);
// User profile and search routes
app.use('/api/users', userRoutes);
// Chat routes
app.use('/api/chats', chatRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Centralized error handler - must be last
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    // Initialize Socket.IO
    initializeSocket(httpServer);
    
    httpServer.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`Socket.IO server initialized`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`Log level: ${env.LOG_LEVEL || (env.NODE_ENV === 'production' ? 'info' : 'debug')}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();

export default app;
