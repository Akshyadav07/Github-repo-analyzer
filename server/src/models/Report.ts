import mongoose, { Schema, Document, Model } from 'mongoose';

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

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    repositoryId: { type: String },
    jobId: { type: Schema.Types.ObjectId, ref: 'AnalysisJob' },
    title: { type: String, required: true },
    branch: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' },
    storagePath: String,
    fileSize: Number,
    config: {
      includeSections: [String],
    },
    generatedAt: Date,
    error: String,
  },
  { timestamps: true }
);

ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ repositoryId: 1 });

export const Report: Model<IReport> = mongoose.model<IReport>('Report', ReportSchema);
