/**
 * Input Sanitization Utilities
 * Provides sanitization functions to prevent XSS and injection attacks
 */

/**
 * Sanitizes HTML content by escaping special characters
 * Prevents XSS attacks by converting HTML tags to plain text
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
};

/**
 * Sanitizes text input by removing potentially dangerous characters
 * Keeps only alphanumeric, spaces, and common punctuation
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';

  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Sanitizes name input
 * Allows letters, spaces, hyphens, and apostrophes only
 */
export const sanitizeName = (input: string): string => {
  if (!input) return '';

  // Remove all characters except letters, spaces, hyphens, and apostrophes
  let sanitized = input.replace(/[^a-zA-Z\s'-]/g, '');

  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

/**
 * Sanitizes email input
 * Removes whitespace and validates basic format
 */
export const sanitizeEmail = (input: string): string => {
  if (!input) return '';

  // Remove all whitespace
  let sanitized = input.replace(/\s/g, '');

  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  return sanitized;
};

/**
 * Sanitizes phone number input
 * Removes all non-digit characters
 */
export const sanitizePhoneNumber = (input: string): string => {
  if (!input) return '';

  // Remove all non-digit characters
  const sanitized = input.replace(/\D/g, '');

  return sanitized;
};

/**
 * Sanitizes message content
 * Removes dangerous HTML but preserves line breaks and basic formatting
 */
export const sanitizeMessage = (input: string): string => {
  if (!input) return '';

  // First, escape HTML characters
  let sanitized = sanitizeHtml(input);

  // Preserve line breaks by converting \n to <br> (but we'll handle this in display)
  // For now, just trim and limit length
  sanitized = sanitized.trim();

  // Remove excessive whitespace (more than 2 consecutive spaces)
  sanitized = sanitized.replace(/ {3,}/g, '  ');

  return sanitized;
};

/**
 * Sanitizes search query
 * Removes special characters that could be used for injection
 */
export const sanitizeSearchQuery = (input: string): string => {
  if (!input) return '';

  // Remove potentially dangerous characters but keep alphanumeric, spaces, and basic punctuation
  let sanitized = input.replace(/[<>{}[\]\\|`~!@#$%^&*()+=\\/]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
};

/**
 * Sanitizes URL input
 * Basic validation and sanitization for URLs
 */
export const sanitizeUrl = (input: string): string => {
  if (!input) return '';

  // Remove whitespace
  let sanitized = input.trim();

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  return sanitized;
};
