import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  GitBranch,
  Shield,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Zap,
  Lock,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const errorParam = searchParams.get('error');
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  // If user is already authenticated, redirect smoothly to dashboard without refresh
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  const handleDemoLogin = () => {
    window.location.href = '/api/auth/demo';
  };

  function getErrorMessage(error: string) {
    switch (error) {
      case 'session_expired':
        return 'Your previous session expired. Please sign in again.';
      case 'auth_failed':
        return 'GitHub authorization was declined or cancelled. Please try again.';
      case 'keys_not_configured':
        return 'GitHub OAuth credentials are not configured yet in server/.env. You can sign in using Instant Demo Mode below!';
      default:
        return `Authentication notice: ${decodeURIComponent(error)}`;
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg)',
        backgroundImage:
          'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Subtle ambient lighting glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[350px] h-[250px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl transition-all shadow-2xl"
          style={{
            background: 'rgba(19, 25, 41, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div
              className="w-13 h-13 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Zap size={26} className="text-white" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Sign in to GitScope AI
            </h1>
            <p className="text-xs sm:text-sm mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Engineering intelligence, commit analytics &amp; risk audit
            </p>
          </div>

          {/* Error / Alert banner */}
          {errorParam && (
            <div className="mb-5 p-3 rounded-xl text-xs flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 text-red-400 animate-fadeIn">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1 leading-relaxed">
                {getErrorMessage(errorParam)}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            {/* Continue with GitHub */}
            <button
              onClick={handleGitHubLogin}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md group relative overflow-hidden"
              style={{
                background: '#24292f',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
              id="github-login-btn"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <GitHubIcon size={19} />
              <span className="font-semibold">Continue with GitHub</span>
              <ArrowRight size={15} className="ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Instant Demo Mode */}
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all cursor-pointer border group"
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                borderColor: 'rgba(99, 102, 241, 0.25)',
                color: 'var(--color-text-primary)',
              }}
              id="demo-login-btn"
              title="Explore full platform with simulated repositories and complete features"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400 flex-shrink-0" />
                <span>Instant Demo Mode</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                No setup
              </span>
            </button>
          </div>

          {/* Trust & Security Highlights */}
          <div
            className="pt-4 border-t space-y-2 text-xs"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {[
              { icon: Shield, text: 'Read-only access — we never modify your repositories' },
              { icon: Lock, text: 'Enterprise OAuth 2.0 with encrypted HTTP-only session cookies' },
              { icon: FileText, text: 'Real-time timeline analysis, collaboration graphs & PDF export' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <item.icon size={13} className="text-indigo-400 flex-shrink-0" />
                <span className="truncate">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Collapsible GitHub OAuth Setup Guide */}
          <div
            className="mt-5 pt-3.5 border-t text-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              type="button"
              onClick={() => setShowConfigHelp((v) => !v)}
              className="text-xs hover:underline inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{ color: 'var(--color-accent-light)' }}
            >
              <HelpCircle size={13} />
              <span>{showConfigHelp ? 'Hide OAuth configuration guide' : 'How to connect your own GitHub OAuth keys?'}</span>
              {showConfigHelp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showConfigHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3.5 rounded-xl text-left text-xs space-y-2 border text-slate-300"
                style={{
                  background: 'var(--color-surface-2)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p className="font-semibold text-white">
                  To register your own GitHub OAuth App:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Go to <strong>GitHub Settings &gt; Developer Settings &gt; OAuth Apps</strong>.</li>
                  <li>Click <strong>New OAuth App</strong>.</li>
                  <li>
                    Homepage URL: <code className="px-1.5 py-0.5 rounded bg-black/40 text-indigo-300">http://localhost:5173</code>
                  </li>
                  <li>
                    Authorization callback URL: <code className="px-1.5 py-0.5 rounded bg-black/40 text-indigo-300">http://localhost:5000/api/auth/github/callback</code>
                  </li>
                  <li>
                    Paste your <strong>Client ID</strong> &amp; <strong>Client Secret</strong> into <code className="px-1.5 py-0.5 rounded bg-black/40 text-indigo-300">server/.env</code>.
                  </li>
                </ol>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-5 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <Link to="/" className="hover:underline hover:text-white transition-colors">
            ← Back to GitScope AI Overview
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
