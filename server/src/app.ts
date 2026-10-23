import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import { env } from './config/env';
import { User, IUser } from './models/User';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import repositoryRoutes from './routes/repositories';
import commitRoutes from './routes/commits';
import analyticsRoutes from './routes/analytics';
import collaborationRoutes from './routes/collaboration';
import riskRoutes from './routes/risks';
import timelineRoutes from './routes/timeline';
import reportRoutes, { generateReportHandler } from './routes/reports';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting - Exempt auth & health routes and bypass completely in development mode
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 10000 : 300,
  skip: (req) => {
    if (env.NODE_ENV === 'development') return true;
    const url = req.originalUrl || req.url || '';
    return url.includes('/auth') || url.includes('/health');
  },
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.NODE_ENV === 'development' ? 100 : 10,
  skip: () => env.NODE_ENV === 'development',
  message: { error: 'Analysis rate limit exceeded.' },
});

// Session
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.MONGODB_URI,
      ttl: 7 * 24 * 60 * 60, // 7 days
    }),
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    name: 'gitscope.sid',
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'read:user', 'repo'],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        let user = await User.findOne({ githubId: String(profile.id) });

        const avatar =
          profile._json?.avatar_url ??
          profile.photos?.[0]?.value ??
          (profile.username ? `https://github.com/${profile.username}.png` : '');

        if (user) {
          user.username = profile.username ?? user.username;
          user.displayName = profile.displayName ?? profile.username ?? user.displayName;
          user.avatarUrl = avatar || user.avatarUrl;
          user.email = profile.emails?.[0]?.value ?? user.email;
          user.accessToken = _accessToken;
          await user.save();
        } else {
          user = await User.create({
            githubId: String(profile.id),
            username: profile.username ?? 'unknown',
            displayName: profile.displayName ?? profile.username ?? 'GitHub User',
            avatarUrl: avatar,
            email: profile.emails?.[0]?.value,
            profileUrl: profile.profileUrl ?? (profile.username ? `https://github.com/${profile.username}` : ''),
            accessToken: _accessToken,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Health check (placed first to guarantee accessibility)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.post('/api/repositories/:owner/:repo/reports', generateReportHandler);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/repositories/:owner/:repo/commits', commitRoutes);
app.use('/api/repositories/:owner/:repo/analytics', analyticsRoutes);
app.use('/api/repositories/:owner/:repo/collaboration', collaborationRoutes);
app.use('/api/repositories/:owner/:repo/risks', riskRoutes);
app.use('/api/repositories/:owner/:repo/timeline', timelineRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
