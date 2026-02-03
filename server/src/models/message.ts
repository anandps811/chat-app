import mongoose, { Schema, Document, Types } from 'mongoose';
export interface IMessage extends Document {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  content?: string;
  imageUrl?: string;
  voiceMessageUrl?: string;
  voiceMessageDuration?: number;
  readBy: Types.ObjectId[];
  likedBy: Types.ObjectId[];
}


const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: String,
    imageUrl: String,
    voiceMessageUrl: String,
    voiceMessageDuration: Number,
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: -1 });
