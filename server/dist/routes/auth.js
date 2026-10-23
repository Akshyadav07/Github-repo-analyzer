"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// Helper to create / retrieve a demo user
async function getOrCreateDemoUser() {
    let demoUser = await User_1.User.findOne({ githubId: 'demo_user_101' });
    if (!demoUser) {
        demoUser = await User_1.User.create({
            githubId: 'demo_user_101',
            username: 'demo-developer',
            displayName: 'Alex Chen (Demo)',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
            email: 'alex.chen@gitscope.ai',
            profileUrl: 'https://github.com',
            accessToken: 'demo_token',
        });
    }
    return demoUser;
}
// Initiate GitHub OAuth
router.get('/github', (req, res, next) => {
    const isMockConfig = !env_1.env.GITHUB_CLIENT_ID ||
        env_1.env.GITHUB_CLIENT_ID.startsWith('mock_') ||
        env_1.env.GITHUB_CLIENT_ID.startsWith('your_') ||
        env_1.env.GITHUB_CLIENT_ID === 'placeholder';
    // If OAuth credentials haven't been configured by the user yet, inform them or offer demo
    if (isMockConfig) {
        if (req.query.force === 'demo') {
            return res.redirect('/api/auth/demo');
        }
        return res.redirect(`${env_1.env.FRONTEND_URL}/login?error=keys_not_configured`);
    }
    // Real GitHub OAuth flow
    passport_1.default.authenticate('github', {
        scope: ['user:email', 'read:user', 'repo'],
    })(req, res, next);
});
// GitHub OAuth Callback
router.get('/github/callback', (req, res, next) => {
    passport_1.default.authenticate('github', (err, user, info) => {
        if (err) {
            console.error('GitHub OAuth callback error:', err);
            const errorMsg = encodeURIComponent(err.message || 'auth_failed');
            return res.redirect(`${env_1.env.FRONTEND_URL}/login?error=${errorMsg}`);
        }
        if (!user) {
            console.warn('GitHub OAuth authentication failed:', info);
            return res.redirect(`${env_1.env.FRONTEND_URL}/login?error=auth_failed`);
        }
        req.login(user, (loginErr) => {
            if (loginErr) {
                console.error('Session login error:', loginErr);
                return res.redirect(`${env_1.env.FRONTEND_URL}/login?error=session_error`);
            }
            return res.redirect(`${env_1.env.FRONTEND_URL}/dashboard`);
        });
    })(req, res, next);
});
// One-click Demo Login for fast testing & evaluation
router.all('/demo', async (req, res, next) => {
    try {
        const demoUser = await getOrCreateDemoUser();
        req.login(demoUser, (err) => {
            if (err)
                return next(err);
            if (req.method === 'POST') {
                return res.json({ success: true, user: demoUser });
            }
            return res.redirect(`${env_1.env.FRONTEND_URL}/dashboard?notice=demo_mode`);
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Demo sign-in failed', message: err.message });
    }
});
// Get current user
router.get('/me', authenticate_1.authenticate, (req, res) => {
    const user = req.user;
    res.json({
        id: user._id,
        githubId: user.githubId,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl || (user.username ? `https://github.com/${user.username}.png` : ''),
        email: user.email,
        profileUrl: user.profileUrl || (user.username ? `https://github.com/${user.username}` : ''),
    });
});
// Logout
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err)
            return next(err);
        req.session.destroy(() => {
            res.clearCookie('gitscope.sid');
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out successfully' });
        });
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map