import { Request, Response } from 'express';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';
import {
  updateProfileSchema,
  searchUsersQuerySchema,
} from '../validations/chatValidation.js';

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const currentUserId = authReq.user?.userId;

  if (!currentUserId) {
    throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
  }

  // Validate body
  const bodyValidation = updateProfileSchema.safeParse(req.body);
  if (!bodyValidation.success) {
    throw new ValidationError(bodyValidation.error.issues[0]?.message || 'Invalid profile data. Please check the provided information and try again.');
  }
  const { name, email, bio } = bodyValidation.data;

  const user = await User.findById(currentUserId);
  if (!user) {
    throw new NotFoundError('User account not found. Your account may have been deleted. Please contact support.');
  }

  // Update fields if provided
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  // Note: User model doesn't have bio field, you may need to add it
  // if (bio !== undefined) user.bio = bio;

  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

/**
 * Search users
 */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const currentUserId = authReq.user?.userId;

  if (!currentUserId) {
    throw new UnauthorizedError('Authentication required. Please log in to access this resource.');
  }

  // Validate query params
  const queryValidation = searchUsersQuerySchema.safeParse(req.query);
  if (!queryValidation.success) {
    // Return empty array if query is invalid or missing (graceful degradation)
    res.json({ users: [] });
    return;
  }
  const { q } = queryValidation.data;

  // Search users by name, email, or mobile number (excluding current user)
  const users = await User.find({
    $and: [
      { _id: { $ne: currentUserId } },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { mobileNumber: { $regex: q, $options: 'i' } },
        ],
      },
    ],
  })
    .select('name email picture')
    .limit(20)
    .lean();

  res.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      picture: (user as any).picture || '',
    })),
  });
});
