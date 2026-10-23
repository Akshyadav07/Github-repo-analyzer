import { GitHubCommit } from './githubService';
export interface CommitActivityPoint {
    date: string;
    commits: number;
    additions: number;
    deletions: number;
}
export interface ContributorStat {
    login: string;
    avatarUrl: string;
    commits: number;
    additions: number;
    deletions: number;
    filesChanged: number;
    firstCommit?: string;
    lastCommit?: string;
}
export interface FileActivityStat {
    filename: string;
    changes: number;
    additions: number;
    deletions: number;
    contributors: string[];
    lastModified?: string;
}
export interface CommitTypeStat {
    type: string;
    count: number;
    percentage: number;
}
export declare class AnalyticsService {
    buildCommitActivity(commits: GitHubCommit[], granularity?: 'daily' | 'weekly' | 'monthly', startDate?: Date, endDate?: Date): CommitActivityPoint[];
    buildContributorStats(commits: GitHubCommit[]): ContributorStat[];
    buildFileActivity(commits: GitHubCommit[]): FileActivityStat[];
    classifyCommitTypes(commits: GitHubCommit[]): CommitTypeStat[];
    buildHeatmap(commits: GitHubCommit[]): Array<{
        date: string;
        count: number;
    }>;
}
//# sourceMappingURL=analyticsService.d.ts.map