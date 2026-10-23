import { Document, Model } from 'mongoose';
export interface IUser extends Document {
    githubId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    email?: string;
    profileUrl: string;
    accessToken?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: Model<IUser>;
//# sourceMappingURL=User.d.ts.map