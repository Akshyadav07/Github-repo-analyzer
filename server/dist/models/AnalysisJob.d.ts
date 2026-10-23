import mongoose, { Document, Model } from 'mongoose';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface IAnalysisJob extends Document {
    repositoryId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    branch: string;
    startDate?: Date;
    endDate?: Date;
    status: JobStatus;
    progress: number;
    stage: string;
    commitsRetrieved: number;
    commitsTotal: number;
    findingsCount: number;
    error?: string;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AnalysisJob: Model<IAnalysisJob>;
//# sourceMappingURL=AnalysisJob.d.ts.map