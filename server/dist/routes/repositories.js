"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const githubService_1 = require("../services/githubService");
const router = (0, express_1.Router)();
function getGitHubService(req) {
    const user = req.user;
    return new githubService_1.GitHubService(user.accessToken);
}
// List all repos
router.get('/', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const page = parseInt(String(req.query.page ?? '1'), 10);
        const perPage = parseInt(String(req.query.perPage ?? '30'), 10);
        const repos = await gh.getUserRepos(page, perPage);
        res.json({ repos, page, perPage });
    }
    catch (err) {
        if (err.status === 401) {
            res.status(401).json({ error: 'GitHub token expired or invalid. Please log in again.' });
        }
        else if (err.status === 403) {
            res.status(403).json({ error: 'GitHub rate limit exceeded. Please try again later.' });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch repositories', message: err.message });
        }
    }
});
// Get repo detail
router.get('/:owner/:repo', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const repoData = await gh.getRepo(owner, repo);
        res.json(repoData);
    }
    catch (err) {
        if (err.status === 404) {
            res.status(404).json({ error: 'Repository not found or you do not have access to it.' });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch repository', message: err.message });
        }
    }
});
// Get branches
router.get('/:owner/:repo/branches', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const branches = await gh.getBranches(owner, repo);
        res.json({ branches });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch branches', message: err.message });
    }
});
// Get analysis status placeholder
router.get('/:owner/:repo/analysis-status', authenticate_1.authenticate, async (req, res) => {
    res.json({ status: 'idle', message: 'No analysis running' });
});
exports.default = router;
//# sourceMappingURL=repositories.js.map