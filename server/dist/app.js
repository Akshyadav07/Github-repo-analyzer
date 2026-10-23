"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_github2_1 = require("passport-github2");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const env_1 = require("./config/env");
const User_1 = require("./models/User");
const errorHandler_1 = require("./middleware/errorHandler");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const repositories_1 = __importDefault(require("./routes/repositories"));
const commits_1 = __importDefault(require("./routes/commits"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const collaboration_1 = __importDefault(require("./routes/collaboration"));
const risks_1 = __importDefault(require("./routes/risks"));
const timeline_1 = __importDefault(require("./routes/timeline"));
const reports_1 = __importStar(require("./routes/reports"));
const app = (0, express_1.default)();
// Trust proxy
app.set('trust proxy', 1);
// Security
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
// CORS
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Logging
if (env_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Body parsing
app.use(express_1.default.json({ limit: '5mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Rate limiting - Exempt auth & health routes and bypass completely in development mode
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_1.env.NODE_ENV === 'development' ? 10000 : 300,
    skip: (req) => {
        if (env_1.env.NODE_ENV === 'development')
            return true;
        const url = req.originalUrl || req.url || '';
        return url.includes('/auth') || url.includes('/health');
    },
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
const analysisLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: env_1.env.NODE_ENV === 'development' ? 100 : 10,
    skip: () => env_1.env.NODE_ENV === 'development',
    message: { error: 'Analysis rate limit exceeded.' },
});
// Session
app.use((0, express_session_1.default)({
    secret: env_1.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: env_1.env.MONGODB_URI,
        ttl: 7 * 24 * 60 * 60, // 7 days
    }),
    cookie: {
        secure: env_1.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: env_1.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    name: 'gitscope.sid',
}));
// Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: env_1.env.GITHUB_CLIENT_ID,
    clientSecret: env_1.env.GITHUB_CLIENT_SECRET,
    callbackURL: env_1.env.GITHUB_CALLBACK_URL,
    scope: ['user:email', 'read:user', 'repo'],
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        let user = await User_1.User.findOne({ githubId: String(profile.id) });
        const avatar = profile._json?.avatar_url ??
            profile.photos?.[0]?.value ??
            (profile.username ? `https://github.com/${profile.username}.png` : '');
        if (user) {
            user.username = profile.username ?? user.username;
            user.displayName = profile.displayName ?? profile.username ?? user.displayName;
            user.avatarUrl = avatar || user.avatarUrl;
            user.email = profile.emails?.[0]?.value ?? user.email;
            user.accessToken = _accessToken;
            await user.save();
        }
        else {
            user = await User_1.User.create({
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
    }
    catch (err) {
        return done(err, null);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id.toString());
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await User_1.User.findById(id);
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
// Health check (placed first to guarantee accessibility)
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.post('/api/repositories/:owner/:repo/reports', reports_1.generateReportHandler);
app.use('/api/repositories', repositories_1.default);
app.use('/api/repositories/:owner/:repo/commits', commits_1.default);
app.use('/api/repositories/:owner/:repo/analytics', analytics_1.default);
app.use('/api/repositories/:owner/:repo/collaboration', collaboration_1.default);
app.use('/api/repositories/:owner/:repo/risks', risks_1.default);
app.use('/api/repositories/:owner/:repo/timeline', timeline_1.default);
app.use('/api/reports', reports_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map