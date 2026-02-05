import { Document, Types } from 'mongoose';
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
//# sourceMappingURL=message.d.ts.map