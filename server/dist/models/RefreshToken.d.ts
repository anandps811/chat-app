import mongoose, { Document } from 'mongoose';
export interface IRefreshToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
declare const RefreshToken: mongoose.Model<IRefreshToken, {}, {}, {}, mongoose.Document<unknown, {}, IRefreshToken, {}, {}> & IRefreshToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default RefreshToken;
//# sourceMappingURL=RefreshToken.d.ts.map