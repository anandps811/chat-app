import helmet from 'helmet';
import { env } from '../config/env.js';

/**
 * Security headers middleware using Helmet
 * Configures various HTTP headers to help protect the app from common vulnerabilities
 */
export const securityHeaders = helmet({
  // Content Security Policy - adjust based on your frontend domains
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'], // Allow images from any source (for user uploads)
      connectSrc: ["'self'", 'http://localhost:*', 'http://10.0.2.2:*', 'http://192.168.*:*', 'https:'], // Allow API connections from various origins
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Set to true if you need COEP
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources (for API access)
  // DNS Prefetch Control
  dnsPrefetchControl: true,
  // Frameguard - prevents clickjacking
  frameguard: { action: 'deny' },
  // Hide Powered-By header
  hidePoweredBy: true,
  // HSTS (HTTP Strict Transport Security) - only in production
  hsts: env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  } : false,
  // IE No Open
  ieNoOpen: true,
  // No Sniff - prevents MIME type sniffing
  noSniff: true,
  // Origin Agent Cluster
  originAgentCluster: true,

  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },
  // XSS Protection (legacy, but still useful)
  xssFilter: true,
});

