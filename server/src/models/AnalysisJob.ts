import mongoose, { Schema, Document, Model } from 'mongoose';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface IAnalysisJob extends Document {
  repositoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  branch: string;
  startDate?: Date;
  endDate?: Date;
  status: JobStatus;
  progress: number; // 0-100
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

const AnalysisJobSchema = new Schema<IAnalysisJob>(
  {
    repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    branch: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'cancelled'], default: 'pending' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    stage: { type: String, default: 'Initializing' },
    commitsRetrieved: { type: Number, default: 0 },
    commitsTotal: { type: Number, default: 0 },
    findingsCount: { type: Number, default: 0 },
    error: String,
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

AnalysisJobSchema.index({ repositoryId: 1, status: 1 });
AnalysisJobSchema.index({ userId: 1, createdAt: -1 });

export const AnalysisJob: Model<IAnalysisJob> = mongoose.model<IAnalysisJob>('AnalysisJob', AnalysisJobSchema);
