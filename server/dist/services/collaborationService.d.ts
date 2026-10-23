import { GitHubCommit, GitHubCommitFile } from './githubService';
export interface CollaborationResult {
    findingId: string;
    findingType: 'shared-file' | 'overlapping-lines' | 'shared-module' | 'potential-conflict';
    developers: string[];
    relatedCommits: string[];
    filePaths: string[];
    lineRanges?: Array<{
        file: string;
        start: number;
        end: number;
    }>;
    evidence: string;
    confidence: 'verified' | 'probable' | 'possible';
    confidenceExplanation: string;
    recommendedAction: string;
}
interface CommitWithFiles extends GitHubCommit {
    files?: GitHubCommitFile[];
}
export declare class CollaborationService {
    detectOverlaps(commits: CommitWithFiles[], windowDays?: number): CollaborationResult[];
    detectSharedModules(commits: CommitWithFiles[]): CollaborationResult[];
}
export {};
//# sourceMappingURL=collaborationService.d.ts.map