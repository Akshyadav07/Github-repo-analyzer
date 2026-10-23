import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { GitHubService } from '../services/githubService';
import { AnalyticsService } from '../services/analyticsService';
import { RiskAnalysisService } from '../services/riskAnalysisService';
import { CollaborationService } from '../services/collaborationService';
import { ReportService, ReportData } from '../services/reportService';
import { Report } from '../models/Report';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const router = Router();
const analyticsService = new AnalyticsService();
const riskService = new RiskAnalysisService();
const collaborationService = new CollaborationService();
const reportService = new ReportService();

function getGitHubService(req: Request): GitHubService {
  const user = req.user as any;
  return new GitHubService(user.accessToken);
}

// Generate a report handler
export async function generateReportHandler(req: Request, res: Response) {
  try {
    const gh = getGitHubService(req);
    const { owner, repo } = req.params as { owner: string; repo: string };
    const { branch = 'HEAD', startDate, endDate, title } = req.body;
    const user = req.user as any;

    const reportId = uuidv4();
    const reportTitle = title ?? `${owner}/${repo} Analysis Report`;

    // Create report record
    const report = await Report.create({
      userId: user._id,
      repositoryId: `${owner}/${repo}`,
      title: reportTitle,
      branch,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: 'generating',
      config: { includeSections: ['overview', 'contributors', 'risks', 'collaboration'] },
    });

    // Gather data
    const { commits } = await gh.getCommits(owner, repo, {
      branch,
      since: startDate,
      until: endDate,
      perPage: 50,
    });

    const commitsWithFiles: any[] = [];
    for (const c of commits.slice(0, 20)) {
      const detail = await gh.getCommitDetail(owner, repo, c.sha);
      if (detail) commitsWithFiles.push(detail);
    }

    const contributors = analyticsService.buildContributorStats(commits);
    const topFiles = analyticsService.buildFileActivity(commitsWithFiles);
    const commitTypes = analyticsService.classifyCommitTypes(commits);

    let riskFindings: any[] = [];
    for (const c of commitsWithFiles) {
      if (c.files) riskFindings.push(...riskService.analyzeCommitFiles(c.sha, c.files));
    }

    const overlapFindings = collaborationService.detectOverlaps(commitsWithFiles);
    const moduleFindings = collaborationService.detectSharedModules(commitsWithFiles);

    const reportData: ReportData = {
      title: reportTitle,
      owner,
      repo,
      branch,
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
      overview: {
        totalCommits: commits.length,
        activeContributors: contributors.length,
        totalAdditions: commits.reduce((s, c) => s + c.additions, 0),
        totalDeletions: commits.reduce((s, c) => s + c.deletions, 0),
      },
      contributors: contributors.slice(0, 20),
      topFiles: topFiles.slice(0, 20),
      commitTypes,
      riskFindings,
      collaborationFindings: [...overlapFindings, ...moduleFindings],
      limitations: commits.length >= 50 ? ['Analysis limited to 50 most recent commits due to API limits.'] : [],
    };

    const filePath = await reportService.generatePDF(reportData, report._id.toString());

    const stats = fs.statSync(filePath);
    await Report.findByIdAndUpdate(report._id, {
      status: 'completed',
      storagePath: filePath,
      fileSize: stats.size,
      generatedAt: new Date(),
    });

    res.json({
      reportId: report._id,
      title: reportTitle,
      status: 'completed',
      message: 'Report generated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate report', message: err.message });
  }
}

router.post('/repositories/:owner/:repo/reports', authenticate, generateReportHandler);
router.post('/generate/:owner/:repo', authenticate, generateReportHandler);

// List user reports
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const reports = await Report.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ reports });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch reports', message: err.message });
  }
});

// Get report detail
router.get('/:reportId', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const report = await Report.findById(req.params.reportId);

    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    if (report.userId.toString() !== user._id.toString()) {
      res.status(403).json({ error: 'You do not have access to this report.' });
      return;
    }

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch report', message: err.message });
  }
});

// Download report
router.get('/:reportId/download', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const report = await Report.findById(req.params.reportId);

    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    if (report.userId.toString() !== user._id.toString()) {
      res.status(403).json({ error: 'You do not have access to this report.' });
      return;
    }

    if (!report.storagePath || !fs.existsSync(report.storagePath)) {
      res.status(404).json({ error: 'Report file not found. Please regenerate the report.' });
      return;
    }

    const filename = `gitscope-report-${report._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fs.createReadStream(report.storagePath).pipe(res);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to download report', message: err.message });
  }
});

// Delete report
router.delete('/:reportId', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const report = await Report.findById(req.params.reportId);

    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    if (report.userId.toString() !== user._id.toString()) {
      res.status(403).json({ error: 'You do not have access to this report.' });
      return;
    }

    // Delete PDF file
    if (report.storagePath && fs.existsSync(report.storagePath)) {
      fs.unlinkSync(report.storagePath);
    }

    await Report.findByIdAndDelete(req.params.reportId);
    res.json({ message: 'Report deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete report', message: err.message });
  }
});

export default router;
