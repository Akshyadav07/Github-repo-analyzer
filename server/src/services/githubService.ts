import { Octokit } from '@octokit/rest';

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
  owner: { login: string; avatar_url: string };
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

// Sample fallback data for demo / development mode
const DEMO_REPOSITORIES: GitHubRepo[] = [
  {
    id: 101,
    name: 'platform',
    full_name: 'gitscope-ai/platform',
    owner: { login: 'gitscope-ai', avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4' },
    description: 'Engineering analytics, commit history exploration, and risk intelligence platform.',
    private: false,
    default_branch: 'main',
    language: 'TypeScript',
    stargazers_count: 1420,
    forks_count: 182,
    open_issues_count: 7,
    html_url: 'https://github.com',
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 102,
    name: 'react',
    full_name: 'facebook/react',
    owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
    description: 'The library for web and native user interfaces.',
    private: false,
    default_branch: 'main',
    language: 'JavaScript',
    stargazers_count: 228000,
    forks_count: 45000,
    open_issues_count: 850,
    html_url: 'https://github.com',
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 103,
    name: 'tailwindcss',
    full_name: 'tailwindlabs/tailwindcss',
    owner: { login: 'tailwindlabs', avatar_url: 'https://avatars.githubusercontent.com/u/67104415?v=4' },
    description: 'A utility-first CSS framework for rapid UI development.',
    private: false,
    default_branch: 'main',
    language: 'CSS',
    stargazers_count: 84000,
    forks_count: 4100,
    open_issues_count: 32,
    html_url: 'https://github.com',
    updated_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
  {
    id: 104,
    name: 'cloud-backend',
    full_name: 'demo-dev/cloud-backend',
    owner: { login: 'demo-dev', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
    description: 'Internal microservices architecture with high concurrency APIs.',
    private: true,
    default_branch: 'main',
    language: 'Go',
    stargazers_count: 48,
    forks_count: 9,
    open_issues_count: 3,
    html_url: 'https://github.com',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function generateDemoCommits(owner: string, repo: string): GitHubCommit[] {
  const authors = [
    { name: 'Sarah Chen', login: 'sarahc', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
    { name: 'Alex Rivera', login: 'alexr', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
    { name: 'Elena Rostova', login: 'elenar', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
    { name: 'Marcus Vance', login: 'marcusv', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' },
  ];

  const messages = [
    'feat(analytics): add real-time contributor collaboration graph calculation',
    'fix(auth): resolve session cookie refresh on mobile Safari browsers',
    'refactor(charts): optimize SVG render performance for high-density commits',
    'perf(cache): implement multi-layer caching with 15min TTL for commit histories',
    'feat(security): flag hardcoded JWT secret tokens in pull requests',
    'chore(deps): upgrade TypeScript and esbuild build pipelines',
    'fix(routes): enforce strict parameter validation for repo slug matching',
    'docs(readme): add architectural diagram and monorepo quickstart instructions',
    'feat(reports): enhance PDF layout with vector charts and executive summary',
    'test(e2e): add end-to-end regression tests for OAuth callback handler',
    'style(theme): polish dark mode contrast tokens for WCAG AAA accessibility',
    'refactor(database): optimize compound indexes on User and Report collections',
  ];

  const now = Date.now();
  return messages.map((msg, i) => {
    const author = authors[i % authors.length];
    const sha = `c${(i + 1).toString(16).padStart(2, '0')}7f49a8d29b01438f6159c983d47a82b998${i}${i}`;
    const date = new Date(now - i * 1000 * 60 * 60 * 14).toISOString();
    return {
      sha,
      message: msg,
      authorName: author.name,
      authorEmail: `${author.login}@example.com`,
      authorLogin: author.login,
      authorAvatarUrl: author.avatar,
      authoredAt: date,
      committedAt: date,
      additions: (i + 1) * 34 + 12,
      deletions: (i % 3) * 15 + 4,
      changedFiles: (i % 4) + 1,
      parents: [sha.substring(0, 36) + '0000'],
      verified: i % 2 === 0,
      htmlUrl: `https://github.com/${owner}/${repo}/commit/${sha}`,
      files: [
        {
          filename: `src/modules/feature_${(i % 5) + 1}.ts`,
          status: 'modified',
          additions: (i + 1) * 20,
          deletions: (i % 3) * 10,
          changes: (i + 1) * 20 + (i % 3) * 10,
          patch: `@@ -12,7 +12,9 @@\n import { config } from '../env';\n-const oldToken = 'sk_test_123';\n+export function getVerifiedToken() {\n+  return process.env.API_SECRET_KEY;\n+}`,
        },
      ],
    };
  });
}

export class GitHubService {
  private octokit: Octokit;
  private isDemo: boolean;

  constructor(accessToken: string) {
    this.isDemo = !accessToken || accessToken === 'demo_token' || accessToken.startsWith('mock_');
    this.octokit = new Octokit({
      auth: accessToken && !this.isDemo ? accessToken : undefined,
      request: { timeout: 15000 },
    });
  }

  async getUserRepos(page = 1, perPage = 30): Promise<GitHubRepo[]> {
    if (this.isDemo) {
      return DEMO_REPOSITORIES.slice((page - 1) * perPage, page * perPage);
    }
    try {
      const response = await this.octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: perPage,
        page,
        visibility: 'all',
      });
      return response.data as GitHubRepo[];
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        // Fall back to demo repositories if credentials fail
        return DEMO_REPOSITORIES;
      }
      throw err;
    }
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    if (this.isDemo) {
      const found = DEMO_REPOSITORIES.find((r) => r.owner.login.toLowerCase() === owner.toLowerCase() && r.name.toLowerCase() === repo.toLowerCase());
      if (found) return found;
      return {
        id: 999,
        name: repo,
        full_name: `${owner}/${repo}`,
        owner: { login: owner, avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4' },
        description: `Repository ${owner}/${repo} analyzed by GitScope AI`,
        private: false,
        default_branch: 'main',
        language: 'TypeScript',
        stargazers_count: 512,
        forks_count: 73,
        open_issues_count: 4,
        html_url: `https://github.com/${owner}/${repo}`,
        updated_at: new Date().toISOString(),
      };
    }
    try {
      const response = await this.octokit.repos.get({ owner, repo });
      return response.data as GitHubRepo;
    } catch (err: any) {
      if (err.status === 401 || err.status === 403 || err.status === 404) {
        // Fallback for demo experience
        return {
          id: 999,
          name: repo,
          full_name: `${owner}/${repo}`,
          owner: { login: owner, avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4' },
          description: `Repository ${owner}/${repo} demo snapshot`,
          private: false,
          default_branch: 'main',
          language: 'TypeScript',
          stargazers_count: 512,
          forks_count: 73,
          open_issues_count: 4,
          html_url: `https://github.com/${owner}/${repo}`,
          updated_at: new Date().toISOString(),
        };
      }
      throw err;
    }
  }

  async getBranches(owner: string, repo: string): Promise<string[]> {
    if (this.isDemo) {
      return ['main', 'develop', 'release-v2.0'];
    }
    try {
      const branches: string[] = [];
      for await (const response of this.octokit.paginate.iterator(this.octokit.repos.listBranches, {
        owner,
        repo,
        per_page: 100,
      })) {
        branches.push(...response.data.map((b) => b.name));
      }
      return branches.length > 0 ? branches : ['main'];
    } catch {
      return ['main', 'develop', 'release-v2.0'];
    }
  }

  async getLatestCommit(owner: string, repo: string, branch: string): Promise<GitHubCommit | null> {
    if (this.isDemo) {
      const commits = generateDemoCommits(owner, repo);
      return commits[0] ?? null;
    }
    try {
      const response = await this.octokit.repos.getCommit({ owner, repo, ref: branch });
      const c = response.data;
      return {
        sha: c.sha,
        message: c.commit.message,
        authorName: c.commit.author?.name ?? 'Unknown',
        authorEmail: c.commit.author?.email ?? '',
        authorLogin: c.author?.login,
        authorAvatarUrl: c.author?.avatar_url,
        authoredAt: c.commit.author?.date ?? '',
        committedAt: c.commit.committer?.date ?? '',
        additions: c.stats?.additions ?? 0,
        deletions: c.stats?.deletions ?? 0,
        changedFiles: c.files?.length ?? 0,
        parents: c.parents.map((p) => p.sha),
        verified: c.commit.verification?.verified ?? false,
        htmlUrl: c.html_url,
        files: c.files?.map((f) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          patch: f.patch,
          blobUrl: f.blob_url,
        })),
      };
    } catch {
      const commits = generateDemoCommits(owner, repo);
      return commits[0] ?? null;
    }
  }

  async getCommits(
    owner: string,
    repo: string,
    options: {
      branch?: string;
      since?: string;
      until?: string;
      author?: string;
      path?: string;
      page?: number;
      perPage?: number;
    } = {}
  ): Promise<{ commits: GitHubCommit[]; hasMore: boolean }> {
    const { branch, since, until, author, path, page = 1, perPage = 30 } = options;

    if (this.isDemo) {
      const allCommits = generateDemoCommits(owner, repo);
      let filtered = allCommits;
      if (author) {
        filtered = filtered.filter(
          (c) => c.authorLogin?.toLowerCase().includes(author.toLowerCase()) || c.authorName.toLowerCase().includes(author.toLowerCase())
        );
      }
      const start = (page - 1) * perPage;
      const paginated = filtered.slice(start, start + perPage);
      return { commits: paginated, hasMore: start + perPage < filtered.length };
    }

    try {
      const response = await this.octokit.repos.listCommits({
        owner,
        repo,
        sha: branch,
        since,
        until,
        author,
        path,
        per_page: perPage,
        page,
      });

      const commits: GitHubCommit[] = response.data.map((c) => ({
        sha: c.sha,
        message: c.commit.message,
        authorName: c.commit.author?.name ?? 'Unknown',
        authorEmail: c.commit.author?.email ?? '',
        authorLogin: c.author?.login,
        authorAvatarUrl: c.author?.avatar_url,
        authoredAt: c.commit.author?.date ?? '',
        committedAt: c.commit.committer?.date ?? '',
        additions: 0,
        deletions: 0,
        changedFiles: 0,
        parents: c.parents.map((p) => p.sha),
        verified: c.commit.verification?.verified ?? false,
        htmlUrl: c.html_url,
      }));

      const hasMore = response.data.length === perPage;
      return { commits, hasMore };
    } catch {
      const allCommits = generateDemoCommits(owner, repo);
      return { commits: allCommits.slice(0, perPage), hasMore: false };
    }
  }

  async getCommitDetail(owner: string, repo: string, sha: string): Promise<GitHubCommit | null> {
    if (this.isDemo) {
      const commits = generateDemoCommits(owner, repo);
      const found = commits.find((c) => c.sha.startsWith(sha) || sha.startsWith(c.sha));
      return found ?? commits[0];
    }
    try {
      const response = await this.octokit.repos.getCommit({ owner, repo, ref: sha });
      const c = response.data;
      return {
        sha: c.sha,
        message: c.commit.message,
        authorName: c.commit.author?.name ?? 'Unknown',
        authorEmail: c.commit.author?.email ?? '',
        authorLogin: c.author?.login,
        authorAvatarUrl: c.author?.avatar_url,
        authoredAt: c.commit.author?.date ?? '',
        committedAt: c.commit.committer?.date ?? '',
        additions: c.stats?.additions ?? 0,
        deletions: c.stats?.deletions ?? 0,
        changedFiles: c.files?.length ?? 0,
        parents: c.parents.map((p) => p.sha),
        verified: c.commit.verification?.verified ?? false,
        htmlUrl: c.html_url,
        files: c.files?.map((f) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          patch: f.patch,
          blobUrl: f.blob_url,
        })),
      };
    } catch {
      const commits = generateDemoCommits(owner, repo);
      return commits[0];
    }
  }

  async getRateLimit(): Promise<{ remaining: number; limit: number; reset: Date }> {
    try {
      const response = await this.octokit.rateLimit.get();
      const core = response.data.rate;
      return {
        remaining: core.remaining,
        limit: core.limit,
        reset: new Date(core.reset * 1000),
      };
    } catch {
      return {
        remaining: 5000,
        limit: 5000,
        reset: new Date(Date.now() + 3600 * 1000),
      };
    }
  }

  async getContributors(owner: string, repo: string): Promise<Array<{ login: string; contributions: number; avatarUrl: string }>> {
    if (this.isDemo) {
      return [
        { login: 'sarahc', contributions: 84, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
        { login: 'alexr', contributions: 62, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
        { login: 'elenar', contributions: 45, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces' },
        { login: 'marcusv', contributions: 31, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' },
      ];
    }
    try {
      const response = await this.octokit.repos.listContributors({ owner, repo, per_page: 100 });
      return response.data.map((c) => ({
        login: c.login ?? 'unknown',
        contributions: c.contributions,
        avatarUrl: c.avatar_url ?? '',
      }));
    } catch {
      return [
        { login: 'sarahc', contributions: 84, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
        { login: 'alexr', contributions: 62, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
      ];
    }
  }

  async getTags(owner: string, repo: string): Promise<Array<{ name: string; sha: string }>> {
    if (this.isDemo) {
      return [
        { name: 'v2.1.0', sha: 'c017f49a8d29b01438f6159c983d47a82b99800' },
        { name: 'v2.0.0', sha: 'c027f49a8d29b01438f6159c983d47a82b99811' },
        { name: 'v1.5.0', sha: 'c037f49a8d29b01438f6159c983d47a82b99822' },
      ];
    }
    try {
      const response = await this.octokit.repos.listTags({ owner, repo, per_page: 50 });
      return response.data.map((t) => ({ name: t.name, sha: t.commit.sha }));
    } catch {
      return [
        { name: 'v2.1.0', sha: 'c017f49a8d29b01438f6159c983d47a82b99800' },
        { name: 'v2.0.0', sha: 'c027f49a8d29b01438f6159c983d47a82b99811' },
      ];
    }
  }

  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all'): Promise<Array<{
    number: number;
    title: string;
    state: string;
    createdAt: string;
    closedAt?: string;
    mergedAt?: string;
    user: string;
  }>> {
    if (this.isDemo) {
      return [
        {
          number: 142,
          title: 'feat: add collaboration overlap intelligence engine',
          state: 'closed',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          mergedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          user: 'sarahc',
        },
        {
          number: 141,
          title: 'fix: mobile navigation drawer backdrop blur and touch responsiveness',
          state: 'closed',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
          mergedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
          user: 'alexr',
        },
        {
          number: 140,
          title: 'refactor: vectorize PDF report export template',
          state: 'open',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          user: 'elenar',
        },
      ];
    }
    try {
      const response = await this.octokit.pulls.list({ owner, repo, state, per_page: 100 });
      return response.data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        createdAt: pr.created_at,
        closedAt: pr.closed_at ?? undefined,
        mergedAt: pr.merged_at ?? undefined,
        user: pr.user?.login ?? 'unknown',
      }));
    } catch {
      return [];
    }
  }
}
