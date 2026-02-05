import { z } from 'zod';
// User registration validation schema - now includes optional personal info
export const createUserSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .trim(),
    mobileNumber: z
        .string()
        .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
        .refine((val) => /^[0-9]+$/.test(val), {
        message: 'Mobile number must contain only digits',
    }),
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must not exceed 100 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    // Optional personal info fields
    countryCode: z.string().regex(/^\+\d{1,4}$/, 'Country code must be in +XX format').optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format').optional(),
    aboutMe: z.string().max(1000, 'About me must not exceed 1000 characters').optional(),
    skills: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
    networkVisibility: z.enum(['public', 'friends']).optional(),
});
// Login validation schema - accepts either email or mobile number
export const loginSchema = z.object({
    emailOrPhone: z
        .string()
        .min(1, 'Email or phone number is required')
        .trim(),
    password: z
        .string()
        .min(1, 'Password is required'),
}).refine((data) => {
    // Check if it's a valid email or a valid 10-digit phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailOrPhone);
    const isPhone = /^[0-9]{10}$/.test(data.emailOrPhone);
    return isEmail || isPhone;
}, {
    message: 'Must be a valid email address or 10-digit phone number',
    path: ['emailOrPhone'],
});
// Personal info update validation schema
export const updatePersonalInfoSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must not exceed 100 characters').trim().optional(),
    email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
    mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').optional(),
});
// Forgot password validation schema
export const forgotPasswordSchema = z.object({
    emailOrPhone: z
        .string()
        .min(1, 'Email or phone number is required')
        .trim(),
}).refine((data) => {
    // Check if it's a valid email or a valid 10-digit phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailOrPhone);
    const isPhone = /^[0-9]{10}$/.test(data.emailOrPhone);
    return isEmail || isPhone;
}, {
    message: 'Must be a valid email address or 10-digit phone number',
    path: ['emailOrPhone'],
});
// Request OTP validation schema (same as forgot password, but can have purpose)
export const requestOTPSchema = z.object({
    emailOrPhone: z
        .string()
        .min(1, 'Email or phone number is required')
        .trim(),
    purpose: z.enum(['password-reset', 'email-verification']).default('email-verification'),
}).refine((data) => {
    // Check if it's a valid email or a valid 10-digit phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailOrPhone);
    const isPhone = /^[0-9]{10}$/.test(data.emailOrPhone);
    return isEmail || isPhone;
}, {
    message: 'Must be a valid email address or 10-digit phone number',
    path: ['emailOrPhone'],
});
// Verify OTP validation schema
export const verifyOTPSchema = z.object({
    emailOrPhone: z
        .string()
        .min(1, 'Email or phone number is required')
        .trim(),
    otp: z
        .string()
        .length(4, 'OTP must be exactly 4 digits')
        .regex(/^\d{4}$/, 'OTP must contain only digits'),
    purpose: z.enum(['password-reset', 'email-verification']).default('password-reset'),
});
// Reset password validation schema
export const resetPasswordSchema = z.object({
    emailOrPhone: z
        .string()
        .min(1, 'Email or phone number is required')
        .trim(),
    otp: z
        .string()
        .length(4, 'OTP must be exactly 4 digits')
        .regex(/^\d{4}$/, 'OTP must contain only digits'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must not exceed 100 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});
//# sourceMappingURL=userValidation.js.map