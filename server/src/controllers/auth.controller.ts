import { Request, Response, NextFunction } from "express";
import {
  signupService,
  loginService,
  refreshTokenService,
  logoutService,
} from "../services/authService.js";
import { createUserSchema, loginSchema } from "../validations/userValidation.js";

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
      const err = new Error(validationResult.error.message as string);
      (err as any).statusCode = 400;
      throw err;
    }

    const { name, email, mobileNumber, password } = validationResult.data;

    const { accessToken, refreshToken, user } =
      await signupService(name, email, mobileNumber, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Use 'lax' in development for better compatibility
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
    console.log('✅ Account created successfully:', {
      userId: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      (err as any).statusCode = 409;
    }
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
      const err = new Error(validationResult.error.message as string);
      (err as any).statusCode = 400;
      throw err;
    }

    const { emailOrPhone, password } = validationResult.data;

    const { accessToken, refreshToken, user } =
      await loginService(emailOrPhone, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Use 'lax' in development for better compatibility
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
      const err = new Error("Refresh token missing");
      (err as any).statusCode = 401;
      throw err;
    }

    const accessToken = await refreshTokenService(token);
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
      const err = new Error("Unauthorized");
      (err as any).statusCode = 401;
      throw err;
    }

    await logoutService(req.user.id);
    res.clearCookie("refreshToken");
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

