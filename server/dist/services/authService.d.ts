export declare const signupService: (name: string, email: string, mobileNumber: string, password: string) => Promise<{
    user: import("mongoose").Document<unknown, {}, import("../models/User.js").IUser, {}, {}> & import("../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    };
    accessToken: string;
    refreshToken: string;
}>;
export declare const loginService: (emailOrPhone: string, password: string) => Promise<{
    user: import("mongoose").Document<unknown, {}, import("../models/User.js").IUser, {}, {}> & import("../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    };
    accessToken: string;
    refreshToken: string;
}>;
/**
 * Refresh token service with token rotation
 * When a refresh token is used, it's invalidated and a new one is issued
 */
export declare const refreshTokenService: (token: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
/**
 * Logout service - invalidates all refresh tokens for the user
 */
export declare const logoutService: (userId: string) => Promise<void>;
//# sourceMappingURL=authService.d.ts.map