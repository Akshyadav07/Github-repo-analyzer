import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { GitHubService } from '../services/githubService';
import { CollaborationService } from '../services/collaborationService';

const router = Router({ mergeParams: true });
const collaborationService = new CollaborationService();

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
    const windowDays = parseInt(String(req.query.windowDays ?? '7'), 10);

    // Fetch commits and their file details
    const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 50 });

    const commitsWithFiles = [];
    for (const commit of commits.slice(0, 30)) {
      const detail = await gh.getCommitDetail(owner, repo, commit.sha);
      if (detail) commitsWithFiles.push(detail);
    }

    const overlapFindings = collaborationService.detectOverlaps(commitsWithFiles, windowDays);
    const moduleFindings = collaborationService.detectSharedModules(commitsWithFiles);

    // De-duplicate module findings
    const uniqueModuleFindings = moduleFindings.slice(0, 20);

    const allFindings = [...overlapFindings, ...uniqueModuleFindings];

    // Build developer graph data
    const developerSet = new Set<string>();
    const edges: Array<{ from: string; to: string; weight: number; findingIds: string[] }> = [];

    for (const finding of allFindings) {
      finding.developers.forEach((d) => developerSet.add(d));
      if (finding.developers.length >= 2) {
        const key = finding.developers.slice().sort().join('|||');
        const existing = edges.find((e) => `${e.from}|||${e.to}` === key || `${e.to}|||${e.from}` === key);
        if (existing) {
          existing.weight++;
          existing.findingIds.push(finding.findingId);
        } else {
          edges.push({
            from: finding.developers[0],
            to: finding.developers[1],
            weight: 1,
            findingIds: [finding.findingId],
          });
        }
      }
    }

    res.json({
      findings: allFindings,
      graph: {
        nodes: Array.from(developerSet).map((d) => ({ id: d, label: d })),
        edges,
      },
      coverage: {
        commitsAnalyzed: commitsWithFiles.length,
        totalCommits: commits.length,
        windowDays,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to analyze collaboration', message: err.message });
  }
});

router.get('/:findingId', authenticate, async (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Collaboration findings are computed on demand. Use GET /collaboration.' });
});

export default router;
