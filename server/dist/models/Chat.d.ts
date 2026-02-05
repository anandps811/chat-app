import mongoose, { Document, Types } from 'mongoose';
export interface IChat extends Document {
    participants: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    lastMessageAt?: Date;
    deletedBy?: Types.ObjectId[];
    messages: Types.DocumentArray<any>;
}
declare const _default: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, {}> & IChat & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Chat.d.ts.map