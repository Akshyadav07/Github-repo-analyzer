import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  githubId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  email?: string;
  profileUrl: string;
  accessToken?: string; // encrypted
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    githubId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    displayName: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    email: { type: String },
    profileUrl: { type: String, default: '' },
    accessToken: { type: String }, // should be encrypted in production
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
