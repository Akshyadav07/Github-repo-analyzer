"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const githubService_1 = require("../services/githubService");
const collaborationService_1 = require("../services/collaborationService");
const router = (0, express_1.Router)({ mergeParams: true });
const collaborationService = new collaborationService_1.CollaborationService();
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
        const windowDays = parseInt(String(req.query.windowDays ?? '7'), 10);
        // Fetch commits and their file details
        const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 50 });
        const commitsWithFiles = [];
        for (const commit of commits.slice(0, 30)) {
            const detail = await gh.getCommitDetail(owner, repo, commit.sha);
            if (detail)
                commitsWithFiles.push(detail);
        }
        const overlapFindings = collaborationService.detectOverlaps(commitsWithFiles, windowDays);
        const moduleFindings = collaborationService.detectSharedModules(commitsWithFiles);
        // De-duplicate module findings
        const uniqueModuleFindings = moduleFindings.slice(0, 20);
        const allFindings = [...overlapFindings, ...uniqueModuleFindings];
        // Build developer graph data
        const developerSet = new Set();
        const edges = [];
        for (const finding of allFindings) {
            finding.developers.forEach((d) => developerSet.add(d));
            if (finding.developers.length >= 2) {
                const key = finding.developers.slice().sort().join('|||');
                const existing = edges.find((e) => `${e.from}|||${e.to}` === key || `${e.to}|||${e.from}` === key);
                if (existing) {
                    existing.weight++;
                    existing.findingIds.push(finding.findingId);
                }
                else {
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to analyze collaboration', message: err.message });
    }
});
router.get('/:findingId', authenticate_1.authenticate, async (_req, res) => {
    res.status(404).json({ error: 'Collaboration findings are computed on demand. Use GET /collaboration.' });
});
exports.default = router;
//# sourceMappingURL=collaboration.js.map