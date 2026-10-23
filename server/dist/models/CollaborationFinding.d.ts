import mongoose, { Document, Model } from 'mongoose';
export type CollaborationFindingType = 'shared-file' | 'overlapping-lines' | 'shared-module' | 'potential-conflict';
export type CollaborationConfidence = 'verified' | 'probable' | 'possible';
export interface ICollaborationFinding extends Document {
    repositoryId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    jobId?: mongoose.Types.ObjectId;
    findingType: CollaborationFindingType;
    developers: string[];
    relatedCommits: string[];
    filePaths: string[];
    lineRanges?: Array<{
        file: string;
        start: number;
        end: number;
    }>;
    evidence: string;
    confidence: CollaborationConfidence;
    confidenceExplanation: string;
    recommendedAction: string;
    reviewStatus: 'pending' | 'reviewed' | 'dismissed';
    createdAt: Date;
    updatedAt: Date;
}
export declare const CollaborationFinding: Model<ICollaborationFinding>;
//# sourceMappingURL=CollaborationFinding.d.ts.map