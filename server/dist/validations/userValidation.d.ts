import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    mobileNumber: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    countryCode: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        Male: "Male";
        Female: "Female";
        Other: "Other";
    }>>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    aboutMe: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString>>;
    goals: z.ZodOptional<z.ZodArray<z.ZodString>>;
    networkVisibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        friends: "friends";
    }>>;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export declare const loginSchema: z.ZodObject<{
    emailOrPhone: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const updatePersonalInfoSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    mobileNumber: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdatePersonalInfoInput = z.infer<typeof updatePersonalInfoSchema>;
export declare const forgotPasswordSchema: z.ZodObject<{
    emailOrPhone: z.ZodString;
}, z.core.$strip>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export declare const requestOTPSchema: z.ZodObject<{
    emailOrPhone: z.ZodString;
    purpose: z.ZodDefault<z.ZodEnum<{
        "password-reset": "password-reset";
        "email-verification": "email-verification";
    }>>;
}, z.core.$strip>;
export type RequestOTPInput = z.infer<typeof requestOTPSchema>;
export declare const verifyOTPSchema: z.ZodObject<{
    emailOrPhone: z.ZodString;
    otp: z.ZodString;
    purpose: z.ZodDefault<z.ZodEnum<{
        "password-reset": "password-reset";
        "email-verification": "email-verification";
    }>>;
}, z.core.$strip>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export declare const resetPasswordSchema: z.ZodObject<{
    emailOrPhone: z.ZodString;
    otp: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=userValidation.d.ts.map