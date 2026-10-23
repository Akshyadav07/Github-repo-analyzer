import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Helper to create / retrieve a demo user
async function getOrCreateDemoUser(): Promise<IUser> {
  let demoUser = await User.findOne({ githubId: 'demo_user_101' });
  if (!demoUser) {
    demoUser = await User.create({
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
router.get('/github', (req: Request, res: Response, next: NextFunction) => {
  const isMockConfig =
    !env.GITHUB_CLIENT_ID ||
    env.GITHUB_CLIENT_ID.startsWith('mock_') ||
    env.GITHUB_CLIENT_ID.startsWith('your_') ||
    env.GITHUB_CLIENT_ID === 'placeholder';

  // If OAuth credentials haven't been configured by the user yet, inform them or offer demo
  if (isMockConfig) {
    if (req.query.force === 'demo') {
      return res.redirect('/api/auth/demo');
    }
    return res.redirect(`${env.FRONTEND_URL}/login?error=keys_not_configured`);
  }

  // Real GitHub OAuth flow
  passport.authenticate('github', {
    scope: ['user:email', 'read:user', 'repo'],
  })(req, res, next);
});

// GitHub OAuth Callback
router.get('/github/callback', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('github', (err: any, user: any, info: any) => {
    if (err) {
      console.error('GitHub OAuth callback error:', err);
      const errorMsg = encodeURIComponent(err.message || 'auth_failed');
      return res.redirect(`${env.FRONTEND_URL}/login?error=${errorMsg}`);
    }
    if (!user) {
      console.warn('GitHub OAuth authentication failed:', info);
      return res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Session login error:', loginErr);
        return res.redirect(`${env.FRONTEND_URL}/login?error=session_error`);
      }
      return res.redirect(`${env.FRONTEND_URL}/dashboard`);
    });
  })(req, res, next);
});

// One-click Demo Login for fast testing & evaluation
router.all('/demo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const demoUser = await getOrCreateDemoUser();
    req.login(demoUser, (err) => {
      if (err) return next(err);
      if (req.method === 'POST') {
        return res.json({ success: true, user: demoUser });
      }
      return res.redirect(`${env.FRONTEND_URL}/dashboard?notice=demo_mode`);
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Demo sign-in failed', message: err.message });
  }
});

// Get current user
router.get('/me', authenticate, (req: Request, res: Response) => {
  const user = req.user as any;
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
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('gitscope.sid');
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

export default router;
