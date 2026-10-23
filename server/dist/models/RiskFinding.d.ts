import mongoose, { Document, Model } from 'mongoose';
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
export declare const RiskFinding: Model<IRiskFinding>;
//# sourceMappingURL=RiskFinding.d.ts.map