import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepository extends Document {
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  isPrivate: boolean;
  defaultBranch: string;
  language?: string;
  stars: number;
  forks: number;
  openIssues: number;
  htmlUrl: string;
  lastMetadataSync?: Date;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema = new Schema<IRepository>(
  {
    githubId: { type: Number, required: true },
    owner: { type: String, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    description: String,
    isPrivate: { type: Boolean, default: false },
    defaultBranch: { type: String, default: 'main' },
    language: String,
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    openIssues: { type: Number, default: 0 },
    htmlUrl: String,
    lastMetadataSync: Date,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

RepositorySchema.index({ userId: 1, fullName: 1 }, { unique: true });

export const Repository: Model<IRepository> = mongoose.model<IRepository>('Repository', RepositorySchema);
