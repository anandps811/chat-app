import { Schema } from 'mongoose';
const messageSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: String,
    imageUrl: String,
    voiceMessageUrl: String,
    voiceMessageDuration: Number,
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
messageSchema.index({ chatId: 1, createdAt: -1 });
//# sourceMappingURL=message.js.map