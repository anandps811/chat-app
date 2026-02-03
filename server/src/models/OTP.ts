import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  emailOrPhone: string;
  otp: string;
  type: 'email' | 'phone';
  purpose: 'password-reset' | 'email-verification';
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    emailOrPhone: {
      type: String,
      required: [true, 'Email or phone is required'],
      trim: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      minlength: [4, 'OTP must be exactly 4 digits'],
      maxlength: [4, 'OTP must be exactly 4 digits'],
      match: [/^\d{4}$/, 'OTP must contain only 4 digits'],
    },
    type: {
      type: String,
      enum: ['email', 'phone'],
      required: [true, 'Type is required'],
    },
    purpose: {
      type: String,
      enum: ['password-reset', 'email-verification'],
      default: 'password-reset',
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      // Index with expireAfterSeconds is defined below
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
otpSchema.index({ emailOrPhone: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model<IOTP>('OTP', otpSchema);

export default OTP;

