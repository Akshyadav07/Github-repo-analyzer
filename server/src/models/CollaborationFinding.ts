import mongoose, { Schema, Document, Model } from 'mongoose';

export type CollaborationFindingType =
  | 'shared-file'
  | 'overlapping-lines'
  | 'shared-module'
  | 'potential-conflict';

export type CollaborationConfidence = 'verified' | 'probable' | 'possible';

export interface ICollaborationFinding extends Document {
  repositoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  findingType: CollaborationFindingType;
  developers: string[];
  relatedCommits: string[];
  filePaths: string[];
  lineRanges?: Array<{ file: string; start: number; end: number }>;
  evidence: string;
  confidence: CollaborationConfidence;
  confidenceExplanation: string;
  recommendedAction: string;
  reviewStatus: 'pending' | 'reviewed' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

const CollaborationFindingSchema = new Schema<ICollaborationFinding>(
  {
    repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'AnalysisJob' },
    findingType: {
      type: String,
      enum: ['shared-file', 'overlapping-lines', 'shared-module', 'potential-conflict'],
      required: true,
    },
    developers: [{ type: String }],
    relatedCommits: [{ type: String }],
    filePaths: [{ type: String }],
    lineRanges: [
      {
        file: String,
        start: Number,
        end: Number,
      },
    ],
    evidence: { type: String, required: true },
    confidence: { type: String, enum: ['verified', 'probable', 'possible'], required: true },
    confidenceExplanation: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    reviewStatus: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
  },
  { timestamps: true }
);

CollaborationFindingSchema.index({ repositoryId: 1, findingType: 1 });

export const CollaborationFinding: Model<ICollaborationFinding> = mongoose.model<ICollaborationFinding>(
  'CollaborationFinding',
  CollaborationFindingSchema
);
