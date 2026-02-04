import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";

export const signupService = async (name: string, email: string, mobileNumber: string, password: string) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { mobileNumber }]
  });
  
  if (existingUser) {
    throw new Error("User with this email or mobile number already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    mobileNumber,
    password: hashedPassword,
  });

  console.log('📝 New user created in database:', {
    userId: user._id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
  });

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  console.log('🔑 Tokens generated for user:', user._id);

  return { user, accessToken, refreshToken };
};

export const loginService = async (emailOrPhone: string, password: string) => {
  // Check if it's email or phone
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
  const query = isEmail 
    ? { email: emailOrPhone }
    : { mobileNumber: emailOrPhone };
  
  const user = await User.findOne(query).select("+password");
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
