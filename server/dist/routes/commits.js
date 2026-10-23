"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const githubService_1 = require("../services/githubService");
const router = (0, express_1.Router)({ mergeParams: true });
function getGitHubService(req) {
    const user = req.user;
    return new githubService_1.GitHubService(user.accessToken);
}
// List commits with pagination and filtering
router.get('/', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const { branch, since, until, author, path, page = '1', perPage = '30', } = req.query;
        const result = await gh.getCommits(owner, repo, {
            branch,
            since,
            until,
            author,
            path,
            page: parseInt(page, 10),
            perPage: Math.min(parseInt(perPage, 10), 100),
        });
        res.json(result);
    }
    catch (err) {
        if (err.status === 404) {
            res.status(404).json({ error: 'Repository or branch not found.' });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch commits', message: err.message });
        }
    }
});
// Get latest commit
router.get('/latest', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo } = req.params;
        const branch = String(req.query.branch ?? 'HEAD');
        const commit = await gh.getLatestCommit(owner, repo, branch);
        if (!commit) {
            res.status(404).json({ error: 'No commits found on this branch.' });
            return;
        }
        res.json(commit);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch latest commit', message: err.message });
    }
});
// Get commit detail
router.get('/:sha', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo, sha } = req.params;
        const commit = await gh.getCommitDetail(owner, repo, sha);
        if (!commit) {
            res.status(404).json({ error: 'Commit not found.' });
            return;
        }
        res.json(commit);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch commit', message: err.message });
    }
});
// Get commit diff (alias for detail with files)
router.get('/:sha/diff', authenticate_1.authenticate, async (req, res) => {
    try {
        const gh = getGitHubService(req);
        const { owner, repo, sha } = req.params;
        const commit = await gh.getCommitDetail(owner, repo, sha);
        if (!commit) {
            res.status(404).json({ error: 'Commit not found.' });
            return;
        }
        res.json({ sha: commit.sha, files: commit.files ?? [] });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch diff', message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=commits.js.map