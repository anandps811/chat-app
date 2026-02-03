import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  refreshToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);



// Create indexes for better query performance
userSchema.index({ email: 1 });
// Note: mobileNumber already has unique: true which creates an index

// Create text index for search functionality
userSchema.index({ 
  name: 'text', 
  email: 'text', 
  mobileNumber: 'text'
});


export default mongoose.model<IUser>("User", userSchema);
