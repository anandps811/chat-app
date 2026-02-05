import mongoose, { Document } from 'mongoose';
export interface IOTP extends Document {
    emailOrPhone: string;
    otp: string;
    type: 'email' | 'phone';
    purpose: 'password-reset' | 'email-verification';
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
}
declare const OTP: mongoose.Model<IOTP, {}, {}, {}, mongoose.Document<unknown, {}, IOTP, {}, {}> & IOTP & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default OTP;
//# sourceMappingURL=OTP.d.ts.map