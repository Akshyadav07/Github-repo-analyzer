import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, Star, GitFork, Lock, Globe, ArrowRight, Loader, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatRelativeTime } from '../lib/utils';
import { Avatar } from '../components/Avatar';

function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="skeleton h-5 w-2/3 mb-3 rounded" />
      <div className="skeleton h-3 w-full mb-2 rounded" />
      <div className="skeleton h-3 w-4/5 mb-4 rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [repoSearch, setRepoSearch] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => {
      const res = await api.get('/repositories?perPage=30');
      return res.data;
    },
  });

  const repos = data?.repos ?? [];
  const filteredRepos = repoSearch
    ? repos.filter((r: any) =>
        r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
        r.full_name.toLowerCase().includes(repoSearch.toLowerCase()) ||
        r.language?.toLowerCase().includes(repoSearch.toLowerCase())
      )
    : repos;

  return (
    <div className="animate-fadeIn">
      {/* Welcome header */}
      <div className="mb-8">
        <div className="flex items-center gap-3.5 mb-2">
          <Avatar
            src={user?.avatarUrl}
            username={user?.username}
            alt={user?.displayName || user?.username}
            size="lg"
            className="ring-2 ring-indigo-500/30"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Welcome back, {user?.displayName || user?.username}!
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Select a repository to explore commits, risk intelligence, and collaboration graphs.
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="metric-grid mb-8">
        {[
          { label: 'Accessible Repos', value: repos.length > 0 ? `${repos.length}+` : '—', icon: GitBranch, color: '#6366f1' },
          { label: 'Public Repos', value: repos.filter((r: any) => !r.private).length > 0 ? repos.filter((r: any) => !r.private).length : '—', icon: Globe, color: '#22d3ee' },
          { label: 'Private Repos', value: repos.filter((r: any) => r.private).length > 0 ? repos.filter((r: any) => r.private).length : '—', icon: Lock, color: '#a78bfa' },
        ].map((m) => (
          <div key={m.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={14} color={m.color} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Repositories header and search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Your Repositories</h2>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Showing {filteredRepos.length} of {repos.length} repositories
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search repositories..."
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              className="input pl-8 py-1.5 text-xs sm:text-sm w-full"
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-3" color="#ef4444" />
          <p className="font-medium mb-1">Failed to load repositories</p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {(error as any)?.response?.data?.error ?? 'Please try again.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredRepos.length === 0 && (
        <div className="card p-12 text-center">
          <GitBranch size={40} className="mx-auto mb-4" color="#6366f1" />
          <h3 className="font-semibold mb-2">No repositories matched</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {repoSearch ? `No repositories match "${repoSearch}". Try a different search term.` : 'Make sure you have repositories on GitHub.'}
          </p>
        </div>
      )}

      {!isLoading && filteredRepos.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo: any, i: number) => (
            <motion.div
              key={repo.full_name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card hover:card-glow cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <GitBranch size={16} color="#6366f1" style={{ flexShrink: 0 }} />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{repo.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{repo.owner.login}</div>
                  </div>
                </div>
                <span className="badge badge-ghost ml-2 flex-shrink-0">
                  {repo.private ? <Lock size={10} /> : <Globe size={10} />}
                  {repo.private ? 'Private' : 'Public'}
                </span>
              </div>

              {repo.description && (
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {repo.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={11} />{repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork size={11} />{repo.forks_count}
                </span>
                <span>{formatRelativeTime(repo.updated_at)}</span>
              </div>

              <Link
                to={`/repositories/${repo.owner.login}/${repo.name}`}
                className="btn btn-primary btn-sm w-full"
              >
                Analyze Repository
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
