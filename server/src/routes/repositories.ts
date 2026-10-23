import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { GitHubService } from '../services/githubService';

const router = Router();

function getGitHubService(req: Request): GitHubService {
  const user = req.user as any;
  return new GitHubService(user.accessToken);
}

// List all repos
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const perPage = parseInt(String(req.query.perPage ?? '30'), 10);
    const repos = await gh.getUserRepos(page, perPage);
    res.json({ repos, page, perPage });
  } catch (err: any) {
    if (err.status === 401) {
      res.status(401).json({ error: 'GitHub token expired or invalid. Please log in again.' });
    } else if (err.status === 403) {
      res.status(403).json({ error: 'GitHub rate limit exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch repositories', message: err.message });
    }
  }
});

// Get repo detail
router.get('/:owner/:repo', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const repoData = await gh.getRepo(owner, repo);
    res.json(repoData);
  } catch (err: any) {
    if (err.status === 404) {
      res.status(404).json({ error: 'Repository not found or you do not have access to it.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch repository', message: err.message });
    }
  }
});

// Get branches
router.get('/:owner/:repo/branches', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const branches = await gh.getBranches(owner, repo);
    res.json({ branches });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch branches', message: err.message });
  }
});

// Get analysis status placeholder
router.get('/:owner/:repo/analysis-status', authenticate, async (req: Request, res: Response) => {
  res.json({ status: 'idle', message: 'No analysis running' });
});

export default router;
