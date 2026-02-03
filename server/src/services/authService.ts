import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const refreshTokenService = async (token: string) => {
  const user = await User.findOne({ refreshToken: token });
  if (!user) throw new Error("Invalid refresh token");

  const accessToken = generateAccessToken(user._id.toString());
  return accessToken;
};

export const logoutService = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
