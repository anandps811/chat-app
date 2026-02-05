import mongoose, { Schema } from 'mongoose';
const refreshTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
}, {
    timestamps: true,
});
// Index for faster lookups
refreshTokenSchema.index({ userId: 1, token: 1 });
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
//# sourceMappingURL=RefreshToken.js.map