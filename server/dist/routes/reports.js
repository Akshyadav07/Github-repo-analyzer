"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportHandler = generateReportHandler;
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const githubService_1 = require("../services/githubService");
const analyticsService_1 = require("../services/analyticsService");
const riskAnalysisService_1 = require("../services/riskAnalysisService");
const collaborationService_1 = require("../services/collaborationService");
const reportService_1 = require("../services/reportService");
const Report_1 = require("../models/Report");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const analyticsService = new analyticsService_1.AnalyticsService();
const riskService = new riskAnalysisService_1.RiskAnalysisService();
const collaborationService = new collaborationService_1.CollaborationService();
const reportService = new reportService_1.ReportService();
function getGitHubService(req) {
    const user = req.user;
    return new githubService_1.GitHubService(user.accessToken);
}
// Generate a report handler
async function generateReportHandler(req, res) {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const { branch = 'HEAD', startDate, endDate, title } = req.body;
        const user = req.user;
        const reportId = (0, uuid_1.v4)();
        const reportTitle = title ?? `${owner}/${repo} Analysis Report`;
        // Create report record
        const report = await Report_1.Report.create({
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
        const commitsWithFiles = [];
        for (const c of commits.slice(0, 20)) {
            const detail = await gh.getCommitDetail(owner, repo, c.sha);
            if (detail)
                commitsWithFiles.push(detail);
        }
        const contributors = analyticsService.buildContributorStats(commits);
        const topFiles = analyticsService.buildFileActivity(commitsWithFiles);
        const commitTypes = analyticsService.classifyCommitTypes(commits);
        let riskFindings = [];
        for (const c of commitsWithFiles) {
            if (c.files)
                riskFindings.push(...riskService.analyzeCommitFiles(c.sha, c.files));
        }
        const overlapFindings = collaborationService.detectOverlaps(commitsWithFiles);
        const moduleFindings = collaborationService.detectSharedModules(commitsWithFiles);
        const reportData = {
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
        const stats = fs_1.default.statSync(filePath);
        await Report_1.Report.findByIdAndUpdate(report._id, {
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to generate report', message: err.message });
    }
}
router.post('/repositories/:owner/:repo/reports', authenticate_1.authenticate, generateReportHandler);
router.post('/generate/:owner/:repo', authenticate_1.authenticate, generateReportHandler);
// List user reports
router.get('/', authenticate_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const reports = await Report_1.Report.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50);
        res.json({ reports });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports', message: err.message });
    }
});
// Get report detail
router.get('/:reportId', authenticate_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const report = await Report_1.Report.findById(req.params.reportId);
        if (!report) {
            res.status(404).json({ error: 'Report not found.' });
            return;
        }
        if (report.userId.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'You do not have access to this report.' });
            return;
        }
        res.json(report);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch report', message: err.message });
    }
});
// Download report
router.get('/:reportId/download', authenticate_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const report = await Report_1.Report.findById(req.params.reportId);
        if (!report) {
            res.status(404).json({ error: 'Report not found.' });
            return;
        }
        if (report.userId.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'You do not have access to this report.' });
            return;
        }
        if (!report.storagePath || !fs_1.default.existsSync(report.storagePath)) {
            res.status(404).json({ error: 'Report file not found. Please regenerate the report.' });
            return;
        }
        const filename = `gitscope-report-${report._id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        fs_1.default.createReadStream(report.storagePath).pipe(res);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to download report', message: err.message });
    }
});
// Delete report
router.delete('/:reportId', authenticate_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const report = await Report_1.Report.findById(req.params.reportId);
        if (!report) {
            res.status(404).json({ error: 'Report not found.' });
            return;
        }
        if (report.userId.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'You do not have access to this report.' });
            return;
        }
        // Delete PDF file
        if (report.storagePath && fs_1.default.existsSync(report.storagePath)) {
            fs_1.default.unlinkSync(report.storagePath);
        }
        await Report_1.Report.findByIdAndDelete(req.params.reportId);
        res.json({ message: 'Report deleted successfully.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete report', message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map