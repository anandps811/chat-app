import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  // Note: refreshToken field removed - refresh tokens are now stored in separate RefreshToken collection
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    // Note: refreshToken field removed - refresh tokens are now stored in separate RefreshToken collection
  },
  { timestamps: true }
);




// Create text index for search functionality
userSchema.index({ 
  name: 'text', 
  email: 'text', 
  mobileNumber: 'text'
});


export default mongoose.model<IUser>("User", userSchema);
