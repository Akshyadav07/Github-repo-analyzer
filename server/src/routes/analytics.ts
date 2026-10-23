import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { GitHubService } from '../services/githubService';
import { AnalyticsService } from '../services/analyticsService';

const router = Router({ mergeParams: true });
const analyticsService = new AnalyticsService();

function getGitHubService(req: Request): GitHubService {
  const user = req.user as any;
  return new GitHubService(user.accessToken);
}

// Overview metrics
router.get('/overview', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const branch = String(req.query.branch ?? 'HEAD');
    const since = req.query.since as string | undefined;
    const until = req.query.until as string | undefined;

    // Fetch commits (up to 100 for overview)
    const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 100 });
    const contributors = analyticsService.buildContributorStats(commits);
    const latestCommit = commits[0] ?? null;
    const repoData = await gh.getRepo(owner, repo);

    const totalAdditions = commits.reduce((s, c) => s + c.additions, 0);
    const totalDeletions = commits.reduce((s, c) => s + c.deletions, 0);

    res.json({
      totalCommits: commits.length,
      activeContributors: contributors.length,
      totalAdditions,
      totalDeletions,
      openIssues: repoData.open_issues_count,
      latestCommit,
      branch,
      since,
      until,
      dataCoverage: {
        commitsRetrieved: commits.length,
        note: commits.length === 100 ? 'Limited to 100 commits for overview. Use commit explorer for full history.' : 'All commits in range retrieved.',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch overview', message: err.message });
  }
});

// Activity chart data
router.get('/activity', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const branch = String(req.query.branch ?? 'HEAD');
    const since = req.query.since as string | undefined;
    const until = req.query.until as string | undefined;
    const granularity = (req.query.granularity as 'daily' | 'weekly' | 'monthly') ?? 'daily';

    const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 100 });
    const activity = analyticsService.buildCommitActivity(commits, granularity);
    const heatmap = analyticsService.buildHeatmap(commits);

    res.json({ activity, heatmap });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch activity', message: err.message });
  }
});

// Contributors
router.get('/contributors', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const branch = String(req.query.branch ?? 'HEAD');
    const since = req.query.since as string | undefined;
    const until = req.query.until as string | undefined;

    const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 100 });
    const contributors = analyticsService.buildContributorStats(commits);
    const commitTypes = analyticsService.classifyCommitTypes(commits);
    const ghContributors = await gh.getContributors(owner, repo);

    res.json({ contributors, commitTypes, githubContributors: ghContributors });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch contributor data', message: err.message });
  }
});

// File activity
router.get('/files', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const branch = String(req.query.branch ?? 'HEAD');
    const since = req.query.since as string | undefined;
    const until = req.query.until as string | undefined;

    // Fetch up to 30 commits with file details
    let allCommits: any[] = [];
    const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 30 });
    
    // Get file details for each commit (limited to avoid rate limits)
    for (const commit of commits.slice(0, 20)) {
      const detail = await gh.getCommitDetail(owner, repo, commit.sha);
      if (detail) allCommits.push(detail);
    }

    const fileActivity = analyticsService.buildFileActivity(allCommits);

    res.json({ files: fileActivity, coverage: { commitsAnalyzed: allCommits.length, total: commits.length } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch file activity', message: err.message });
  }
});

export default router;
