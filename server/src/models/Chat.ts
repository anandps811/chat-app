import mongoose, { Schema, Document, Types } from 'mongoose';

// Message subdocument schema
const messageSubSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: String,
  // Image and voice message support (available via REST API, not yet via Socket.IO)
  imageUrl: String,
  voiceMessageUrl: String,
  voiceMessageDuration: Number,
  readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export interface IChat extends Document {
  participants: Types.ObjectId[];
  // Reserved for future group chat feature (not currently implemented)
  // isGroup: boolean;
  // groupId?: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  deletedBy?: Types.ObjectId[];
  messages: Types.DocumentArray<any>;
}

const chatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    // Reserved for future group chat feature (not currently implemented)
    // isGroup: { type: Boolean, default: false },
    // groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    lastMessageAt: Date,
    deletedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [messageSubSchema],
  },
  { timestamps: true }
);


// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ 'messages.createdAt': -1 });

// Ensure unique chat between two users
chatSchema.index(
  { participants: 1 },
  { unique: true }
);
// Note: Group chat support removed - unique index now applies to all chats

export default mongoose.model<IChat>('Chat', chatSchema);

