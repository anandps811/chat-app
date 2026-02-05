import { Request, Response, NextFunction } from "express";
import {
  signupService,
  loginService,
  refreshTokenService,
  logoutService,
} from "../services/authService.js";
import { createUserSchema, loginSchema } from "../validations/userValidation.js";
import { ValidationError, ConflictError, UnauthorizedError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.message);
    }

    const { name, email, mobileNumber, password } = validationResult.data;

    const { accessToken, refreshToken, user } =
      await signupService(name, email, mobileNumber, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax", // Use 'lax' in development for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: "/", // Ensure cookie is available for all paths
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    // Log successful account creation
    logger.info('Account created successfully', {
      userId: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    // Error is already a custom error class from service layer
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.message);
    }

    const { emailOrPhone, password } = validationResult.data;

    const { accessToken, refreshToken, user } =
      await loginService(emailOrPhone, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax", // Use 'lax' in development for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: "/", // Ensure cookie is available for all paths
    });

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new UnauthorizedError("Refresh token is missing. Please log in to get a new token.");
    }

    const { accessToken, refreshToken: newRefreshToken } = await refreshTokenService(token);
    
    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: "/",
    });
    
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw new UnauthorizedError("Authentication required. Please log in to perform this action.");
    }

    await logoutService(req.user.id);
    res.clearCookie("refreshToken");
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

