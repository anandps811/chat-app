import mongoose, { Schema, Document, Types } from 'mongoose';



export interface IChat extends Document {
  participants: Types.ObjectId[];
  isGroup: boolean;
  groupId?: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  deletedBy?: Types.ObjectId[];
}



const chatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    isGroup: { type: Boolean, default: false },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    lastMessageAt: Date,
    deletedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);


// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ 'messages.createdAt': -1 });

// Ensure unique chat between two users (only for non-group chats)
chatSchema.index(
  { participants: 1 },
  { unique: true, partialFilterExpression: { groupId: { $exists: false } } }
);
// Ensure unique chat per group

export default mongoose.model<IChat>('Chat', chatSchema);

