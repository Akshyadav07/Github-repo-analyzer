import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { GitHubService } from '../services/githubService';
import { RiskAnalysisService } from '../services/riskAnalysisService';

const router = Router({ mergeParams: true });
const riskService = new RiskAnalysisService();

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
    const severity = req.query.severity as string | undefined;

    const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 20 });

    let allFindings: ReturnType<RiskAnalysisService['analyzeCommitFiles']> = [];

    for (const commit of commits) {
      const detail = await gh.getCommitDetail(owner, repo, commit.sha);
      if (detail?.files) {
        const findings = riskService.analyzeCommitFiles(commit.sha, detail.files);
        allFindings.push(...findings);
      }
    }

    // Filter by severity if requested
    if (severity) {
      allFindings = allFindings.filter((f) => f.severity === severity);
    }

    const summary = {
      total: allFindings.length,
      critical: allFindings.filter((f) => f.severity === 'critical').length,
      high: allFindings.filter((f) => f.severity === 'high').length,
      medium: allFindings.filter((f) => f.severity === 'medium').length,
      low: allFindings.filter((f) => f.severity === 'low').length,
      informational: allFindings.filter((f) => f.severity === 'informational').length,
    };

    res.json({
      findings: allFindings,
      summary,
      coverage: {
        commitsAnalyzed: commits.length,
        note: 'Deterministic heuristic analysis only. AI-assisted analysis requires AI_API_KEY configuration.',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to run risk analysis', message: err.message });
  }
});

router.patch('/:findingId', authenticate, async (req: Request, res: Response) => {
  // In production, findings would be stored in MongoDB and updated here
  const { status, dismissReason } = req.body;
  const validStatuses = ['open', 'reviewed', 'dismissed', 'resolved'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  res.json({ findingId: req.params.findingId, status, dismissReason, message: 'Finding status updated.' });
});

export default router;
