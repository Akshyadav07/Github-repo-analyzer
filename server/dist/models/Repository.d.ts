import mongoose, { Document, Model } from 'mongoose';
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
export declare const Repository: Model<IRepository>;
//# sourceMappingURL=Repository.d.ts.map