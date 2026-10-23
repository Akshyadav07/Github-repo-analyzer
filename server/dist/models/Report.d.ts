import mongoose, { Document, Model } from 'mongoose';
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';
export interface IReport extends Document {
    userId: mongoose.Types.ObjectId;
    repositoryId?: string;
    jobId?: mongoose.Types.ObjectId;
    title: string;
    branch: string;
    startDate?: Date;
    endDate?: Date;
    status: ReportStatus;
    storagePath?: string;
    fileSize?: number;
    config: {
        includeSections: string[];
    };
    generatedAt?: Date;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Report: Model<IReport>;
//# sourceMappingURL=Report.d.ts.map