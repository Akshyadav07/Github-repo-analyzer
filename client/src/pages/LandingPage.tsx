import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Shield,
  Users,
  FileText,
  Zap,
  ArrowRight,
  GitCommit,
  Network,
  BarChart3,
  Lock,
  CheckCircle,
  Sparkles,
  Activity,
  AlertTriangle,
  Download,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Clock,
  Layers,
  Terminal,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

// Sample presets for interactive showcase switcher
const DEMO_REPOSITORIES = [
  {
    id: 'gitscope-ai/platform',
    name: 'gitscope-ai / platform',
    branch: 'main',
    stars: '1.4k',
    totalCommits: '1,428',
    contributors: '16',
    riskScore: '96/100',
    churn: '+8,420 / -2,110',
    commits: [
      {
        sha: '7f9a2b1',
        msg: 'feat(analytics): add real-time contributor collaboration graph calculation',
        author: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
        date: '2h ago',
        adds: '+142',
        dels: '-18',
        tag: 'feat',
      },
      {
        sha: '4c8e10d',
        msg: 'fix(auth): resolve session cookie refresh on mobile Safari browsers',
        author: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
        date: '5h ago',
        adds: '+24',
        dels: '-12',
        tag: 'fix',
      },
      {
        sha: 'b19e42a',
        msg: 'perf(cache): implement multi-layer caching with 15min TTL for commit histories',
        author: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
        date: '1d ago',
        adds: '+88',
        dels: '-5',
        tag: 'perf',
      },
    ],
    diff: {
      file: 'src/services/analyticsService.ts',
      oldCode: [
        '  // calculate overlap without lock-step check',
        '  const overlaps = await findConcurrentEdits(repo, branch);',
        '  return overlaps;',
      ],
      newCode: [
        '  // deterministic window sliding with branch hash comparison',
        '  const overlaps = await findConcurrentEdits(repo, branch, {',
        '    windowHours: 4,',
        '    includeDiffRanges: true,',
        '  });',
        '  return sanitizeCollaborationMatrix(overlaps);',
      ],
    },
  },
  {
    id: 'facebook/react',
    name: 'facebook / react',
    branch: 'main',
    stars: '228k',
    totalCommits: '16,240',
    contributors: '1,612',
    riskScore: '99/100',
    churn: '+14,920 / -9,340',
    commits: [
      {
        sha: 'e91fa43',
        msg: 'Compiler: optimize reactive scope dependency extraction for async components',
        author: 'Dan Abramov',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=faces',
        date: '4h ago',
        adds: '+210',
        dels: '-45',
        tag: 'feat',
      },
      {
        sha: 'c32db77',
        msg: 'Server Components: stream hydration error boundary recovery',
        author: 'Sebastian Markbåge',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=faces',
        date: '1d ago',
        adds: '+76',
        dels: '-19',
        tag: 'perf',
      },
      {
        sha: '8a11bc4',
        msg: 'docs: clarify useActionState hook concurrency semantics',
        author: 'Rachel Nabors',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces',
        date: '2d ago',
        adds: '+34',
        dels: '-12',
        tag: 'docs',
      },
    ],
    diff: {
      file: 'packages/react-reconciler/src/ReactFiberWorkLoop.js',
      oldCode: [
        '  function ensureRootIsScheduled(root, currentTime) {',
        '    const existingCallbackNode = root.callbackNode;',
      ],
      newCode: [
        '  function ensureRootIsScheduled(root, currentTime) {',
        '    const existingCallbackNode = root.callbackNode;',
        '    // mark transition priority lane before microtask enqueue',
        '    markRootUpdated(root, LaneSyncPriority);',
      ],
    },
  },
  {
    id: 'vercel/next.js',
    name: 'vercel / next.js',
    branch: 'canary',
    stars: '124k',
    totalCommits: '23,109',
    contributors: '3,210',
    riskScore: '94/100',
    churn: '+31,400 / -18,200',
    commits: [
      {
        sha: '992a01f',
        msg: 'Turbopack: accelerate module resolution graph with incremental hashing',
        author: 'Tim Neutkens',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop&crop=faces',
        date: '3h ago',
        adds: '+540',
        dels: '-120',
        tag: 'feat',
      },
      {
        sha: '10dfc9b',
        msg: 'fix(router): prevent duplicate prefetch triggers on nested dynamic layout routes',
        author: 'Shu Ding',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
        date: '7h ago',
        adds: '+42',
        dels: '-11',
        tag: 'fix',
      },
      {
        sha: 'e57c612',
        msg: 'refactor(server): optimize edge middleware header normalization',
        author: 'Lee Robinson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces',
        date: '1d ago',
        adds: '+95',
        dels: '-38',
        tag: 'refactor',
      },
    ],
    diff: {
      file: 'packages/next/src/server/web/edge-handler.ts',
      oldCode: [
        '  export function handleEdgeRequest(req: Request) {',
        '    return normalizeHeaders(req.headers);',
      ],
      newCode: [
        '  export function handleEdgeRequest(req: Request) {',
        '    // zero-copy header iteration for streaming response performance',
        '    const headers = new Headers(req.headers);',
        '    headers.set("x-edge-worker-cache", "HIT");',
        '    return headers;',
      ],
    },
  },
];

const FEATURES = [
  {
    icon: GitCommit,
    title: 'Complete Commit Intelligence',
    description: 'Explore full commit histories with server-side pagination, branch isolation, and syntax-highlighted unified diffs.',
    badge: 'Core Engine',
    color: '#6366f1',
  },
  {
    icon: Users,
    title: 'Developer Velocity & Churn',
    description: 'Track contributor activity, code churn ratios (+/- lines), and development momentum across every branch.',
    badge: 'Team Velocity',
    color: '#22d3ee',
  },
  {
    icon: Network,
    title: 'Collaboration Overlap Radar',
    description: 'Identify concurrent file edits and overlapping line modifications between teammates before merge conflicts happen.',
    badge: 'Conflict Guard',
    color: '#a78bfa',
  },
  {
    icon: Shield,
    title: 'Deterministic Risk Audits',
    description: 'AST and heuristic rules scan diffs for leaked secrets, vulnerable configurations, and dangerous code patterns.',
    badge: 'Security Scanner',
    color: '#f59e0b',
  },
  {
    icon: BarChart3,
    title: 'High-Density Visualizations',
    description: 'Interactive commit frequency area charts, contributor leaderboards, and commit type distributions built with Recharts.',
    badge: 'Analytics',
    color: '#10b981',
  },
  {
    icon: FileText,
    title: 'Publication-Ready PDF Reports',
    description: 'Generate multi-page executive PDF intelligence reports with one click, covering risks, contributions, and audit summaries.',
    badge: 'Automated Reports',
    color: '#f97316',
  },
];

const WORKFLOW = [
  {
    step: '01',
    title: 'Authorize GitHub OAuth',
    description: 'Sign in securely with read-only permissions via GitHub OAuth 2.0. No write access or passwords needed.',
  },
  {
    step: '02',
    title: 'Select Any Repository',
    description: 'Choose any public or private repository. GitScope AI automatically maps branches and commit trees.',
  },
  {
    step: '03',
    title: 'Deep Ingestion & AST Analysis',
    description: 'Inspect commit diffs, analyze developer overlap graphs, review heuristic risk findings, and timeline trends.',
  },
  {
    step: '04',
    title: 'Export Executive PDF',
    description: 'Export structured, multi-page PDF executive summaries with full metrics for team reviews and audits.',
  },
];

const FAQS = [
  {
    q: 'Does GitScope AI store my source code?',
    a: 'No. GitScope AI uses official GitHub REST APIs with strictly read-only scopes. We fetch commit metadata and diffs on-demand and never store entire repositories or blob contents on disk.',
  },
  {
    q: 'Can I analyze private repositories?',
    a: 'Yes! When you sign in with your GitHub account, GitScope AI can access any repository your account has read permissions for, including private team or organization repositories.',
  },
  {
    q: 'What is Collaboration Overlap detection?',
    a: 'Our collaboration engine cross-references commits within sliding time windows (e.g. 4 hours) to identify when multiple developers modified overlapping lines in the same files, warning you before merge conflicts occur.',
  },
  {
    q: 'How does Instant Demo Mode work?',
    a: 'Instant Demo Mode lets you explore the complete platform immediately with simulated repositories, commits, and risk audits without needing GitHub credentials or OAuth configuration.',
  },
  {
    q: 'Can I download PDF reports?',
    a: 'Yes. Every repository has an automated PDF intelligence report generator that produces publication-ready multi-page PDFs with velocity charts, contributor breakdowns, and risk findings.',
  },
];

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Selected repo in preview showcase
  const [selectedRepoIdx, setSelectedRepoIdx] = useState(0);
  const activeRepo = DEMO_REPOSITORIES[selectedRepoIdx];

  // Active showcase tab
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'risks' | 'reports'>('overview');

  // Selected commit for diff viewing inside showcase
  const [selectedCommitSha, setSelectedCommitSha] = useState(activeRepo.commits[0].sha);

  // Quick repo search bar input
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Find matching repo or navigate to login
      const match = DEMO_REPOSITORIES.findIndex((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match !== -1) {
        setSelectedRepoIdx(match);
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div
      className="min-h-screen text-[var(--color-text-primary)] selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors"
      style={{
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Background Radial Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none -z-0">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] rounded-full blur-[140px] opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, #22d3ee 50%, transparent 80%)' }}
        />
        <div
          className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full blur-[120px] opacity-15"
          style={{ background: '#a78bfa' }}
        />
      </div>

      {/* Navigation Bar (Sleek Laptop-Proportioned Header) */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors"
        style={{
          background: theme === 'dark' ? 'rgba(10, 13, 26, 0.82)' : 'rgba(255, 255, 255, 0.88)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-8.5 h-8.5 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Zap size={18} color="white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-none">
                GitScope <span style={{ color: 'var(--color-accent-light)' }}>AI</span>
              </span>
              <span
                className="text-[9.5px] font-mono tracking-wider mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                v2.0 REPO INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Nav Links for Laptop/Desktop */}
          <div
            className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <a href="#showcase" className="hover:text-[var(--color-text-primary)] transition-colors">
              Live Showcase
            </a>
            <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">
              Capabilities
            </a>
            <a href="#workflow" className="hover:text-[var(--color-text-primary)] transition-colors">
              Workflow
            </a>
            <a href="#security" className="hover:text-[var(--color-text-primary)] transition-colors">
              Security
            </a>
            <a href="#faq" className="hover:text-[var(--color-text-primary)] transition-colors">
              FAQ
            </a>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border transition-all cursor-pointer hover:bg-[var(--color-surface-2)]"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link
              to="/login"
              className="btn btn-secondary btn-sm text-xs font-semibold hidden sm:inline-flex"
            >
              <Sparkles size={13} className="text-cyan-400" />
              <span>Demo Mode</span>
            </Link>

            <Link
              to="/login"
              className="btn btn-primary btn-sm text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-indigo-500/25"
              id="landing-signin-btn"
            >
              <GitHubIcon size={14} />
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (Laptop-Optimized Heights & Padding) */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-12 text-center max-w-5xl mx-auto z-10">
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5 shadow-sm border"
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            color: 'var(--color-accent-light)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          <span>Next-Generation GitHub Repository Intelligence</span>
        </motion.div>

        {/* Hero Headline (Engineered for Laptop Viewports) */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12] mb-4 sm:mb-5"
        >
          Understand Every Commit. <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            See the Whole Codebase.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xs sm:text-sm lg:text-base max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Transform raw Git histories into actionable engineering intelligence. Inspect commits with full syntax diffs, track developer velocity, detect collaboration overlaps, and export executive PDF reports.
        </motion.p>

        {/* Interactive Quick Repository Search / Demo Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-6"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 p-1.5 rounded-xl border shadow-lg transition-all focus-within:border-indigo-500/60"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="pl-2.5 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or preview repository (e.g. facebook/react)"
              className="flex-1 bg-transparent border-none text-xs sm:text-sm outline-none px-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5"
            >
              <span>Explore</span>
              <ArrowRight size={13} />
            </button>
          </form>

          {/* Preset quick chips */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2.5 flex-wrap text-[11px]">
            <span style={{ color: 'var(--color-text-muted)' }}>Quick preview:</span>
            {DEMO_REPOSITORIES.map((repo, idx) => (
              <button
                key={repo.id}
                onClick={() => {
                  setSelectedRepoIdx(idx);
                  setSelectedCommitSha(repo.commits[0].sha);
                }}
                className={`px-2 py-0.5 rounded-md font-mono text-[10.5px] border transition-all cursor-pointer ${
                  selectedRepoIdx === idx
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-semibold'
                    : 'bg-black/10 dark:bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {repo.id.split('/')[1]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto"
        >
          <Link
            to="/login"
            className="w-full sm:w-auto btn btn-primary btn-lg flex items-center justify-center gap-2.5 shadow-xl hover:shadow-indigo-500/30 text-xs sm:text-sm font-semibold"
            id="hero-get-started-btn"
          >
            <GitHubIcon size={17} />
            <span>Continue with GitHub</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto btn btn-secondary btn-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-medium border"
            style={{ borderColor: 'var(--color-border)' }}
            id="hero-demo-btn"
          >
            <Sparkles size={15} className="text-cyan-400" />
            <span>Try Instant Demo Mode</span>
          </Link>
        </motion.div>

        {/* Trust Badges Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-[11px] sm:text-xs flex-wrap"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle size={13} className="text-emerald-400" /> Read-Only Access
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={13} className="text-emerald-400" /> Official OAuth 2.0
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={13} className="text-emerald-400" /> Multi-Page PDF Export
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle size={13} className="text-emerald-400" /> Zero Code Blob Storage
          </span>
        </motion.div>
      </section>

      {/* Interactive Laptop/Desktop Product Showcase Preview */}
      <section id="showcase" className="px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl overflow-hidden border shadow-2xl relative"
          style={{
            borderColor: 'rgba(99, 102, 241, 0.3)',
            background: '#0d111e',
            boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.12)',
          }}
        >
          {/* macOS Chrome Header with Controls */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2"
            style={{
              background: '#090d18',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Window Dots & Repo Identity */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs font-mono">
                <GitBranch size={13} className="text-indigo-400" />
                <span className="font-semibold text-slate-200">{activeRepo.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-sans font-medium">
                  {activeRepo.branch}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  ★ {activeRepo.stars}
                </span>
              </div>
            </div>

            {/* Showcase View Tabs */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 text-xs font-medium">
              {[
                { id: 'overview', label: 'Velocity & Churn', icon: Activity },
                { id: 'commits', label: 'Commits & Diff', icon: GitCommit },
                { id: 'risks', label: 'Risk Scanner', icon: Shield },
                { id: 'reports', label: 'Executive PDF', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showcase Tab Content */}
          <div className="p-4 sm:p-6 min-h-[360px] bg-[#0c101d] text-slate-100">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key={`overview-${activeRepo.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 sm:space-y-5"
                >
                  {/* Metric Cards Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: 'Total Commits', value: activeRepo.totalCommits, sub: '+42 this week', icon: GitCommit, color: '#6366f1' },
                      { label: 'Contributors', value: activeRepo.contributors, sub: 'active team members', icon: Users, color: '#22d3ee' },
                      { label: 'Heuristic Health', value: activeRepo.riskScore, sub: 'clean security score', icon: Shield, color: '#10b981' },
                      { label: 'Code Churn', value: activeRepo.churn, sub: 'lines modified', icon: Activity, color: '#f59e0b' },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="p-3 sm:p-3.5 rounded-xl border bg-slate-900/60 border-white/5"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-medium text-slate-400">
                            {m.label}
                          </span>
                          <m.icon size={14} style={{ color: m.color }} />
                        </div>
                        <div className="text-lg sm:text-xl font-black text-white">
                          {m.value}
                        </div>
                        <div className="text-[10px] mt-0.5 text-slate-500 font-mono">
                          {m.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity Bar Chart with Legend & Day Labels */}
                  <div className="p-4 rounded-xl border bg-slate-900/60 border-white/5">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>Commit Frequency &amp; Velocity Curve</span>
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] bg-emerald-500/20 text-emerald-400 font-mono">
                            Live Stream
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Daily commit distribution categorized by conventional commit tags
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" /> Features
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" /> Fixes
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Refactor
                        </span>
                      </div>
                    </div>

                    {/* Chart Bars */}
                    <div className="h-28 flex items-end gap-1.5 sm:gap-2 pt-3 px-1 border-b border-white/5 pb-2">
                      {[32, 45, 20, 60, 85, 52, 40, 78, 92, 65, 48, 88, 70, 95, 62, 80, 54, 72, 90, 84, 76, 98, 68, 85].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div
                            className="w-full rounded-t transition-all group-hover:brightness-125"
                            style={{
                              height: `${(h / 100) * 80}px`,
                              background:
                                i % 3 === 0
                                  ? 'linear-gradient(to top, rgba(99, 102, 241, 0.4), #6366f1)'
                                  : i % 3 === 1
                                  ? 'linear-gradient(to top, rgba(34, 211, 238, 0.4), #22d3ee)'
                                  : 'linear-gradient(to top, rgba(16, 185, 129, 0.4), #10b981)',
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[9.5px] text-slate-500 font-mono pt-1.5 px-1">
                      <span>14 days ago</span>
                      <span>7 days ago</span>
                      <span>Yesterday</span>
                      <span>Today</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'commits' && (
                <motion.div
                  key={`commits-${activeRepo.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4"
                >
                  {/* Commits List (5 cols on laptop) */}
                  <div className="lg:col-span-6 space-y-2.5">
                    <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                      <span>RECENT COMMITS ({activeRepo.commits.length})</span>
                      <span className="text-[10px] text-indigo-400">Click to inspect diff</span>
                    </div>

                    {activeRepo.commits.map((c) => {
                      const isSelected = selectedCommitSha === c.sha;
                      return (
                        <div
                          key={c.sha}
                          onClick={() => setSelectedCommitSha(c.sha)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md'
                              : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={c.avatar}
                              alt={c.author}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/10"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate text-white">
                                {c.msg}
                              </p>
                              <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                                <code className="text-indigo-300 font-mono">{c.sha}</code>
                                <span>•</span>
                                <span>{c.author}</span>
                                <span>•</span>
                                <span>{c.date}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono flex-shrink-0">
                            <span className="text-emerald-400">{c.adds}</span>
                            <span className="text-rose-400">{c.dels}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Unified Syntax Diff (6 cols on laptop) */}
                  <div className="lg:col-span-6 rounded-xl border bg-slate-950/80 border-white/10 p-3.5 font-mono text-xs overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5 text-[11px]">
                        <span className="text-slate-300 flex items-center gap-1.5 font-medium truncate">
                          <Code2 size={13} className="text-indigo-400 flex-shrink-0" />
                          <span>{activeRepo.diff.file}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 flex-shrink-0">
                          Unified Diff View
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] leading-relaxed overflow-x-auto">
                        <div className="text-slate-500 text-[10px]">
                          @@ -18,6 +18,8 @@ static analysis router
                        </div>
                        {activeRepo.diff.oldCode.map((line, i) => (
                          <div
                            key={`old-${i}`}
                            className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded flex items-center gap-2"
                          >
                            <span className="text-rose-500 select-none font-bold">-</span>
                            <span>{line}</span>
                          </div>
                        ))}
                        {activeRepo.diff.newCode.map((line, i) => (
                          <div
                            key={`new-${i}`}
                            className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-2"
                          >
                            <span className="text-emerald-400 select-none font-bold">+</span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Deterministic heuristic parser</span>
                      <Link to="/login" className="text-indigo-400 hover:underline flex items-center gap-1">
                        <span>Inspect in full IDE</span>
                        <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'risks' && (
                <motion.div
                  key="risks"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="badge badge-medium text-xs font-semibold">
                        SECURITY RISK • HIGH
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        src/config/jwt.ts • AST Rule #SEC-104
                      </span>
                    </div>
                    <h5 className="font-bold text-xs sm:text-sm text-amber-200">
                      Hardcoded Fallback Secret in Development Config
                    </h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Detected potential default fallback string literal assignment for <code className="text-amber-300 font-mono text-[11px]">process.env.JWT_SECRET</code>. Ensure fallback defaults are strictly disallowed in production builds.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-indigo-500/10 border-indigo-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="badge badge-low text-xs font-semibold">
                        COLLABORATION OVERLAP • CONFLICT GUARD
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Sarah Chen &amp; Alex Rivera • 4h window
                      </span>
                    </div>
                    <h5 className="font-bold text-xs sm:text-sm text-indigo-200">
                      Concurrent Edits in src/services/analyticsService.ts
                    </h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Both developers modified overlapping line ranges (L120-L160) within 4 hours. Automated conflict guard flagged this before git merge stage.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 sm:p-6 rounded-xl border text-center space-y-3 bg-indigo-950/20 border-indigo-500/30"
                >
                  <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center bg-indigo-600/20 text-indigo-400 shadow-md">
                    <FileText size={24} />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    Publication-Ready PDF Executive Reports
                  </h4>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                    Compiled directly from raw git history. Includes executive summary, contributor activity matrix, heuristic risk table, and limitations documentation.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/login"
                      className="btn btn-primary btn-sm inline-flex items-center gap-2 text-xs shadow-lg"
                    >
                      <Download size={13} />
                      <span>Download Sample Executive Report (PDF)</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter Strip (Laptop Responsive) */}
      <section
        className="border-y transition-colors py-8 sm:py-10"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-400 font-mono">
              100%
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
              Read-Only Security Scopes
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-cyan-400 font-mono">
              50+
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
              Commits/Sec Ingestion Engine
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 font-mono">
              0
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
              Private Code Blobs Stored
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-400 font-mono">
              &lt; 1s
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
              Heuristic Risk Scan Time
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (Laptop 3-Column Layout) */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-22 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
            Engineered For Modern Teams
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-1">
            Complete Codebase Intelligence. <br />
            <span style={{ color: 'var(--color-accent-light)' }}>Zero Configuration Required.</span>
          </h2>
          <p className="text-xs sm:text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            Purpose-built for software engineers, team leads, and security auditors who need clarity across repositories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              whileHover={{ y: -4 }}
              className="p-5 sm:p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}35` }}
                >
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <span
                  className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border"
                  style={{
                    background: 'var(--color-surface-2)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {f.badge}
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2 group-hover:text-indigo-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Workflow (Horizontal Laptop Timeline) */}
      <section
        id="workflow"
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-22 border-t transition-colors"
        style={{
          background: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-14">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Step-by-Step
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">How GitScope AI Works</h2>
            <p className="text-xs sm:text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Get started in under 30 seconds with existing GitHub credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {WORKFLOW.map((step) => (
              <div
                key={step.step}
                className="p-5 rounded-2xl border relative flex flex-col justify-between"
                style={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div>
                  <div
                    className="text-2xl sm:text-3xl font-black mb-3 font-mono"
                    style={{ color: 'var(--color-accent-light)' }}
                  >
                    {step.step}
                  </div>
                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Security Section */}
      <section id="security" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-22 max-w-6xl mx-auto">
        <div
          className="rounded-3xl p-6 sm:p-10 border relative overflow-hidden"
          style={{
            borderColor: 'rgba(99, 102, 241, 0.3)',
            background:
              theme === 'dark'
                ? 'linear-gradient(135deg, rgba(19, 25, 41, 0.95) 0%, rgba(15, 20, 36, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 244, 255, 0.98) 100%)',
          }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Shield size={13} />
                <span>Security &amp; Privacy First</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Your Source Code Never Leaves Your Control.
              </h3>
              <p className="text-xs sm:text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                GitScope AI communicates exclusively through official GitHub REST APIs with granular, read-only permissions. We never clone entire git blobs, modify branches, or store private repository contents permanently.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
              {[
                { title: 'Read-Only Scopes', desc: 'No write permissions or push access requested' },
                { title: 'Encrypted Sessions', desc: 'Secure HttpOnly Lax session cookies' },
                { title: 'Zero Passwords', desc: 'Authenticated via official GitHub OAuth 2.0' },
                { title: 'Audit Transparency', desc: 'Every analysis query is traceable in reports' },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className="p-3.5 rounded-xl border"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>{badge.title}</span>
                  </div>
                  <p className="text-[11px] mt-1 pl-5" style={{ color: 'var(--color-text-secondary)' }}>
                    {badge.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section
        id="faq"
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-22 border-t transition-colors"
        style={{
          background: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Questions &amp; Answers
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border overflow-hidden transition-all"
                  style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-indigo-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-4 text-xs sm:text-sm leading-relaxed border-t"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        <p className="pt-3">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-22 text-center border-t transition-colors" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Analyze Your Repositories?
          </h2>
          <p className="text-xs sm:text-sm max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Connect in seconds with GitHub OAuth or try Instant Demo Mode with simulated platform data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link to="/login" className="btn btn-primary btn-lg flex items-center gap-2 shadow-lg">
              <GitHubIcon size={17} />
              <span>Continue with GitHub</span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg flex items-center gap-2">
              <Sparkles size={15} className="text-cyan-400" />
              <span>Try Instant Demo Mode</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 sm:px-8 py-8 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>GitScope AI Platform • All systems operational</span>
        </div>
        <p className="text-center sm:text-right">
          Built for engineering teams. Not affiliated with GitHub, Inc.
        </p>
      </footer>
    </div>
  );
}
