/**
 * Input Validation Utilities
 * Provides validation functions for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check length limits
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long (max 254 characters)' };
  }

  return { isValid: true };
};

/**
 * Validates phone number (10 digits)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length !== 10) {
    return { isValid: false, error: 'Phone number must be exactly 10 digits' };
  }

  // Check if all digits are the same (suspicious)
  if (/^(\d)\1{9}$/.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true, error: undefined };
};

/**
 * Validates email or phone number
 */
export const validateEmailOrPhone = (identifier: string): ValidationResult => {
  if (!identifier || identifier.trim().length === 0) {
    return { isValid: false, error: 'Email or phone number is required' };
  }

  // Try email first
  const emailResult = validateEmail(identifier);
  if (emailResult.isValid) {
    return emailResult;
  }

  // Try phone number
  const phoneResult = validatePhoneNumber(identifier);
  if (phoneResult.isValid) {
    return phoneResult;
  }

  return { isValid: false, error: 'Please enter a valid email or phone number' };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      error: 'Password must contain at least one letter and one number',
    };
  }

  return { isValid: true };
};

/**
 * Validates name (full name)
 */
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Name is too long (max 100 characters)' };
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    };
  }

  return { isValid: true };
};

/**
 * Validates message content
 */
export const validateMessage = (message: string): ValidationResult => {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length > 5000) {
    return { isValid: false, error: 'Message is too long (max 5000 characters)' };
  }

  return { isValid: true };
};

/**
 * Validates bio text
 */
export const validateBio = (bio: string): ValidationResult => {
  // Bio is optional, so empty is valid
  if (!bio || bio.trim().length === 0) {
    return { isValid: true };
  }

  const trimmedBio = bio.trim();

  if (trimmedBio.length > 500) {
    return { isValid: false, error: 'Bio is too long (max 500 characters)' };
  }

  return { isValid: true };
};

/**
 * Validates search query
 */
export const validateSearchQuery = (query: string): ValidationResult => {
  if (!query || query.trim().length === 0) {
    return { isValid: false, error: 'Search query is required' };
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 1) {
    return { isValid: false, error: 'Search query must be at least 1 character' };
  }

  if (trimmedQuery.length > 100) {
    return { isValid: false, error: 'Search query is too long (max 100 characters)' };
  }

  return { isValid: true };
};
