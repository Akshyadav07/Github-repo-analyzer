"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const githubService_1 = require("../services/githubService");
const analyticsService_1 = require("../services/analyticsService");
const router = (0, express_1.Router)({ mergeParams: true });
const analyticsService = new analyticsService_1.AnalyticsService();
function getGitHubService(req) {
    const user = req.user;
    return new githubService_1.GitHubService(user.accessToken);
}
// Overview metrics
router.get('/overview', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const branch = String(req.query.branch ?? 'HEAD');
        const since = req.query.since;
        const until = req.query.until;
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch overview', message: err.message });
    }
});
// Activity chart data
router.get('/activity', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const branch = String(req.query.branch ?? 'HEAD');
        const since = req.query.since;
        const until = req.query.until;
        const granularity = req.query.granularity ?? 'daily';
        const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 100 });
        const activity = analyticsService.buildCommitActivity(commits, granularity);
        const heatmap = analyticsService.buildHeatmap(commits);
        res.json({ activity, heatmap });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch activity', message: err.message });
    }
});
// Contributors
router.get('/contributors', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const branch = String(req.query.branch ?? 'HEAD');
        const since = req.query.since;
        const until = req.query.until;
        const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 100 });
        const contributors = analyticsService.buildContributorStats(commits);
        const commitTypes = analyticsService.classifyCommitTypes(commits);
        const ghContributors = await gh.getContributors(owner, repo);
        res.json({ contributors, commitTypes, githubContributors: ghContributors });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch contributor data', message: err.message });
    }
});
// File activity
router.get('/files', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const branch = String(req.query.branch ?? 'HEAD');
        const since = req.query.since;
        const until = req.query.until;
        // Fetch up to 30 commits with file details
        let allCommits = [];
        const { commits } = await gh.getCommits(owner, repo, { branch, since, until, perPage: 30 });
        // Get file details for each commit (limited to avoid rate limits)
        for (const commit of commits.slice(0, 20)) {
            const detail = await gh.getCommitDetail(owner, repo, commit.sha);
            if (detail)
                allCommits.push(detail);
        }
        const fileActivity = analyticsService.buildFileActivity(allCommits);
        res.json({ files: fileActivity, coverage: { commitsAnalyzed: allCommits.length, total: commits.length } });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch file activity', message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map