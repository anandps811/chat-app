import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    // Note: refreshToken field removed - refresh tokens are now stored in separate RefreshToken collection
}, { timestamps: true });
// Create text index for search functionality
userSchema.index({
    name: 'text',
    email: 'text',
    mobileNumber: 'text'
});
export default mongoose.model("User", userSchema);
//# sourceMappingURL=User.js.map