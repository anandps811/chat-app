import bcrypt from "bcrypt";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {
  generateAccessToken,
} from "../utils/token.js";
import { DuplicateUserError, InvalidCredentialsError, UnauthorizedError, UnprocessableEntityError } from "../utils/errors.js";
import crypto from "crypto";
import { env } from "../config/env.js";
import { withTransaction } from "../utils/transaction.js";
import { logger } from "../utils/logger.js";

export const signupService = async (name: string, email: string, mobileNumber: string, password: string) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { mobileNumber }]
  });
  
  if (existingUser) {
    const duplicateField = existingUser.email === email ? 'email address' : 'mobile number';
    throw new DuplicateUserError(
      `A user with this ${duplicateField} already exists. Please use a different ${duplicateField} or try logging in.`,
      duplicateField === 'email address' ? 'email' : 'mobileNumber'
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Use transaction to ensure user and refresh token creation are atomic
  const result = await withTransaction(async (session) => {
    // Create user (session is optional - will be null if transactions not supported)
    const createOptions = session ? { session } : {};
    const users = await User.create([{
      name,
      email,
      mobileNumber,
      password: hashedPassword,
    }], createOptions);

    const createdUser = users[0];
    if (!createdUser) {
      throw new UnprocessableEntityError('Failed to create user account. Please try again or contact support if the problem persists.');
    }

    logger.info('New user created in database', {
      userId: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      mobileNumber: createdUser.mobileNumber,
    });

    const accessToken = generateAccessToken(createdUser._id.toString());
    
    // Generate cryptographically secure refresh token
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    
    // Calculate expiration date from environment variable (default: 7 days)
    const expiresInDays = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', '')) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    // Invalidate any existing refresh tokens for this user
    const deleteOptions = session ? { session } : {};
    await RefreshToken.deleteMany({ userId: createdUser._id }, deleteOptions);
    
    // Create new refresh token
    await RefreshToken.create([{
      userId: createdUser._id,
      token: refreshTokenValue,
      expiresAt,
    }], createOptions);

    logger.info('Tokens generated for user', {
      userId: createdUser._id,
    });

    return { user: createdUser, accessToken, refreshToken: refreshTokenValue };
  });

  return result;
};

export const loginService = async (emailOrPhone: string, password: string) => {
  // Check if it's email or phone
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
  const query = isEmail 
    ? { email: emailOrPhone }
    : { mobileNumber: emailOrPhone };
  
  const user = await User.findOne(query).select("+password");
  if (!user) {
    throw new InvalidCredentialsError("Invalid email/phone number or password. Please check your credentials and try again.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new InvalidCredentialsError("Invalid email/phone number or password. Please check your credentials and try again.");
  }

  const accessToken = generateAccessToken(user._id.toString());
  
  // Use transaction to ensure refresh token operations are atomic
  const refreshTokenResult = await withTransaction(async (session) => {
    // Generate cryptographically secure refresh token
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    
    // Calculate expiration date from environment variable (default: 7 days)
    const expiresInDays = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', '')) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    // Invalidate any existing refresh tokens for this user (session is optional)
    const deleteOptions = session ? { session } : {};
    await RefreshToken.deleteMany({ userId: user._id }, deleteOptions);
    
    // Create new refresh token (session is optional)
    const createOptions = session ? { session } : {};
    await RefreshToken.create([{
      userId: user._id,
      token: refreshTokenValue,
      expiresAt,
    }], createOptions);

    return refreshTokenValue;
  });

  return { user, accessToken, refreshToken: refreshTokenResult };
};

/**
 * Refresh token service with token rotation
 * When a refresh token is used, it's invalidated and a new one is issued
 */
export const refreshTokenService = async (token: string) => {
  // Find the refresh token
  const refreshTokenDoc = await RefreshToken.findOne({ token });
  
  if (!refreshTokenDoc) {
    throw new UnauthorizedError("Invalid refresh token. Please log in again to get a new token.");
  }
  
  // Check if token is expired
  if (refreshTokenDoc.expiresAt < new Date()) {
    // Delete expired token
    await RefreshToken.deleteOne({ _id: refreshTokenDoc._id });
    throw new UnauthorizedError("Your refresh token has expired. Please log in again to continue.");
  }
  
  const userId = refreshTokenDoc.userId.toString();
  
  // Verify user still exists
  const user = await User.findById(userId);
  if (!user) {
    // Clean up orphaned token
    await RefreshToken.deleteOne({ _id: refreshTokenDoc._id });
    throw new UnauthorizedError("The user associated with this token no longer exists. Please contact support.");
  }
  
  // Generate new access token
  const accessToken = generateAccessToken(userId);
  
  // Use transaction to ensure token rotation is atomic
  const newRefreshToken = await withTransaction(async (session) => {
    // Token rotation: Invalidate old token and create new one
    const newRefreshTokenValue = crypto.randomBytes(64).toString('hex');
    const expiresInDays = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', '')) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    // Delete old token (session is optional)
    const deleteOptions = session ? { session } : {};
    await RefreshToken.deleteOne({ _id: refreshTokenDoc._id }, deleteOptions);
    
    // Create new refresh token (session is optional)
    const createOptions = session ? { session } : {};
    await RefreshToken.create([{
      userId: user._id,
      token: newRefreshTokenValue,
      expiresAt,
    }], createOptions);
    
    return newRefreshTokenValue;
  });
  
  return { accessToken, refreshToken: newRefreshToken };
};

/**
 * Logout service - invalidates all refresh tokens for the user
 */
export const logoutService = async (userId: string) => {
  // Delete all refresh tokens for this user
  await RefreshToken.deleteMany({ userId });
};
