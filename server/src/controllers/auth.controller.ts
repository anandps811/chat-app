import { Request, Response, NextFunction } from "express";
import {
  loginService,
  refreshTokenService,
  logoutService,
} from "../services/authService.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error("Email and password are required");
      (err as any).statusCode = 400;
      throw err;
    }

    const { accessToken, refreshToken, user } =
      await loginService(email, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

