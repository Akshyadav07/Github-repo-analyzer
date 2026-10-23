import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { GitHubService } from '../services/githubService';

const router = Router({ mergeParams: true });

function getGitHubService(req: Request): GitHubService {
  const user = req.user as any;
  return new GitHubService(user.accessToken);
}

// List commits with pagination and filtering
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const {
      branch,
      since,
      until,
      author,
      path,
      page = '1',
      perPage = '30',
    } = req.query as Record<string, string>;

    const result = await gh.getCommits(owner, repo, {
      branch,
      since,
      until,
      author,
      path,
      page: parseInt(page, 10),
      perPage: Math.min(parseInt(perPage, 10), 100),
    });

    res.json(result);
  } catch (err: any) {
    if (err.status === 404) {
      res.status(404).json({ error: 'Repository or branch not found.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch commits', message: err.message });
    }
  }
});

// Get latest commit
router.get('/latest', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const branch = String(req.query.branch ?? 'HEAD');
    const commit = await gh.getLatestCommit(owner, repo, branch);

    if (!commit) {
      res.status(404).json({ error: 'No commits found on this branch.' });
      return;
    }

    res.json(commit);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch latest commit', message: err.message });
  }
});

// Get commit detail
router.get('/:sha', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo, sha } = req.params as { owner: string; repo: string; sha: string };
    const commit = await gh.getCommitDetail(owner, repo, sha);

    if (!commit) {
      res.status(404).json({ error: 'Commit not found.' });
      return;
    }

    res.json(commit);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch commit', message: err.message });
  }
});

// Get commit diff (alias for detail with files)
router.get('/:sha/diff', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo, sha } = req.params as { owner: string; repo: string; sha: string };
    const commit = await gh.getCommitDetail(owner, repo, sha);

    if (!commit) {
      res.status(404).json({ error: 'Commit not found.' });
      return;
    }

    res.json({ sha: commit.sha, files: commit.files ?? [] });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch diff', message: err.message });
  }
});

export default router;
