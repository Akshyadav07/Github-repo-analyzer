import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { GitHubService } from '../services/githubService';

const router = Router({ mergeParams: true });

function getGitHubService(req: Request): GitHubService {
  const user = req.user as any;
  return new GitHubService(user.accessToken);
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const branch = String(req.query.branch ?? 'HEAD');
    const since = req.query.since as string | undefined;
    const until = req.query.until as string | undefined;
    const types = req.query.types ? String(req.query.types).split(',') : null;

    const [commitsResult, prs, tags] = await Promise.allSettled([
      gh.getCommits(owner, repo, { branch, since, until, perPage: 100 }),
      gh.getPullRequests(owner, repo, 'all'),
      gh.getTags(owner, repo),
    ]);

    const events: Array<{
      id: string;
      type: string;
      title: string;
      date: string;
      author?: string;
      sha?: string;
      number?: number;
      url?: string;
    }> = [];

    if (commitsResult.status === 'fulfilled') {
      for (const c of commitsResult.value.commits) {
        events.push({
          id: c.sha,
          type: 'commit',
          title: c.message.split('\n')[0].substring(0, 100),
          date: c.authoredAt,
          author: c.authorLogin ?? c.authorName,
          sha: c.sha,
          url: c.htmlUrl,
        });
      }
    }

    if (prs.status === 'fulfilled') {
      for (const pr of prs.value) {
        const eventDate = pr.mergedAt ?? pr.closedAt ?? pr.createdAt;
        events.push({
          id: `pr-${pr.number}`,
          type: pr.mergedAt ? 'pr-merged' : pr.state === 'closed' ? 'pr-closed' : 'pr-opened',
          title: `#${pr.number}: ${pr.title}`,
          date: eventDate,
          author: pr.user,
          number: pr.number,
        });
      }
    }

    if (tags.status === 'fulfilled') {
      for (const tag of tags.value) {
        events.push({
          id: `tag-${tag.sha}`,
          type: 'release',
          title: `Release: ${tag.name}`,
          date: new Date().toISOString(), // Tags don't always have dates in list API
          sha: tag.sha,
        });
      }
    }

    // Filter by type if requested
    const filteredEvents = types ? events.filter((e) => types.includes(e.type)) : events;

    // Sort by date descending
    filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ events: filteredEvents, total: filteredEvents.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch timeline', message: err.message });
  }
});

export default router;
