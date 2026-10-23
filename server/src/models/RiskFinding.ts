import mongoose, { Schema, Document, Model } from 'mongoose';

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type RiskStatus = 'open' | 'reviewed' | 'dismissed' | 'resolved';
export type DetectionMethod = 'deterministic' | 'ai-assisted' | 'heuristic';

export interface IRiskFinding extends Document {
  repositoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  findingId: string;
  category: string;
  severity: RiskSeverity;
  title: string;
  description: string;
  affectedFile: string;
  lineStart?: number;
  lineEnd?: number;
  commitSha: string;
  evidenceSnippet?: string;
  detectionMethod: DetectionMethod;
  confidenceExplanation: string;
  recommendedFix: string;
  suggestedTests?: string;
  status: RiskStatus;
  dismissReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiskFindingSchema = new Schema<IRiskFinding>(
  {
    repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'AnalysisJob' },
    findingId: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'informational'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    affectedFile: { type: String, required: true },
    lineStart: Number,
    lineEnd: Number,
    commitSha: { type: String, required: true },
    evidenceSnippet: String,
    detectionMethod: { type: String, enum: ['deterministic', 'ai-assisted', 'heuristic'], required: true },
    confidenceExplanation: { type: String, required: true },
    recommendedFix: { type: String, required: true },
    suggestedTests: String,
    status: { type: String, enum: ['open', 'reviewed', 'dismissed', 'resolved'], default: 'open' },
    dismissReason: String,
  },
  { timestamps: true }
);

RiskFindingSchema.index({ repositoryId: 1, severity: 1, status: 1 });
RiskFindingSchema.index({ commitSha: 1 });

export const RiskFinding: Model<IRiskFinding> = mongoose.model<IRiskFinding>('RiskFinding', RiskFindingSchema);
