export interface GitHubCommit {
    sha: string;
    message: string;
    authorName: string;
    authorEmail: string;
    authorLogin?: string;
    authorAvatarUrl?: string;
    authoredAt: string;
    committedAt: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    parents: string[];
    verified: boolean;
    htmlUrl: string;
    files?: GitHubCommitFile[];
}
export interface GitHubCommitFile {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
    blobUrl?: string;
}
export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
        avatar_url: string;
    };
    description?: string;
    private: boolean;
    default_branch: string;
    language?: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    html_url: string;
    updated_at: string;
}
export declare class GitHubService {
    private octokit;
    private isDemo;
    constructor(accessToken: string);
    getUserRepos(page?: number, perPage?: number): Promise<GitHubRepo[]>;
    getRepo(owner: string, repo: string): Promise<GitHubRepo>;
    getBranches(owner: string, repo: string): Promise<string[]>;
    getLatestCommit(owner: string, repo: string, branch: string): Promise<GitHubCommit | null>;
    getCommits(owner: string, repo: string, options?: {
        branch?: string;
        since?: string;
        until?: string;
        author?: string;
        path?: string;
        page?: number;
        perPage?: number;
    }): Promise<{
        commits: GitHubCommit[];
        hasMore: boolean;
    }>;
    getCommitDetail(owner: string, repo: string, sha: string): Promise<GitHubCommit | null>;
    getRateLimit(): Promise<{
        remaining: number;
        limit: number;
        reset: Date;
    }>;
    getContributors(owner: string, repo: string): Promise<Array<{
        login: string;
        contributions: number;
        avatarUrl: string;
    }>>;
    getTags(owner: string, repo: string): Promise<Array<{
        name: string;
        sha: string;
    }>>;
    getPullRequests(owner: string, repo: string, state?: 'open' | 'closed' | 'all'): Promise<Array<{
        number: number;
        title: string;
        state: string;
        createdAt: string;
        closedAt?: string;
        mergedAt?: string;
        user: string;
    }>>;
}
//# sourceMappingURL=githubService.d.ts.map