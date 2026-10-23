"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const githubService_1 = require("../services/githubService");
const riskAnalysisService_1 = require("../services/riskAnalysisService");
const router = (0, express_1.Router)({ mergeParams: true });
const riskService = new riskAnalysisService_1.RiskAnalysisService();
function getGitHubService(req) {
    const user = req.user;
    return new githubService_1.GitHubService(user.accessToken);
}
router.get('/', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const branch = String(req.query.branch ?? 'HEAD');
        const since = req.query.since;
        const until = req.query.until;
        const severity = req.query.severity;
        const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 20 });
        let allFindings = [];
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to run risk analysis', message: err.message });
    }
});
router.patch('/:findingId', authenticate_1.authenticate, async (req, res) => {
    // In production, findings would be stored in MongoDB and updated here
    const { status, dismissReason } = req.body;
    const validStatuses = ['open', 'reviewed', 'dismissed', 'resolved'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
    }
    res.json({ findingId: req.params.findingId, status, dismissReason, message: 'Finding status updated.' });
});
exports.default = router;
//# sourceMappingURL=risks.js.map