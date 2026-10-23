import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { GitCommit, ChevronLeft, ChevronRight, Search, Filter, AlertCircle, Plus, Minus, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { formatRelativeTime, shortenSha } from '../lib/utils';
import { Avatar } from '../components/Avatar';

export function CommitExplorerPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');
  const [branch, setBranch] = useState('HEAD');
  const perPage = 20;

  const commitsQ = useQuery<{ commits: any[]; hasMore: boolean }>({
    queryKey: ['commits', owner, repo, page, branch, author],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage), branch });
      if (author) params.set('author', author);
      const res = await api.get(`/repositories/${owner}/${repo}/commits?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const latestQ = useQuery<any>({
    queryKey: ['latest-commit', owner, repo, branch],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/commits/latest?branch=${branch}`);
      return res.data;
    },
  });

  const branchesQ = useQuery<{ branches: any[] }>({
    queryKey: ['branches', owner, repo],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/branches`);
      return res.data;
    },
  });

  const commits = commitsQ.data?.commits ?? [];
  const hasMore = commitsQ.data?.hasMore ?? false;
  const branches = branchesQ.data?.branches ?? [];
  const latest = latestQ.data;

  const filteredCommits = search
    ? commits.filter((c: any) => c.message.toLowerCase().includes(search.toLowerCase()) || c.sha.includes(search))
    : commits;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Commit Explorer</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {owner}/{repo}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select value={branch} onChange={(e) => { setBranch(e.target.value); setPage(1); }} className="select text-xs sm:text-sm">
            <option value="HEAD">HEAD</option>
            {branches.map((b: string) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Latest commit */}
      {latest && (
        <div className="card" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--color-accent)' }}>
            LATEST COMMIT ON {branch.toUpperCase()}
          </div>
          <div className="flex items-start gap-3.5">
            <Avatar
              src={latest.authorAvatarUrl}
              username={latest.authorLogin}
              alt={latest.authorLogin ?? latest.authorName}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <Link to={`/repositories/${owner}/${repo}/commits/${latest.sha}`}
                className="font-semibold hover:underline block truncate text-sm sm:text-base">
                {latest.message.split('\n')[0]}
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                <code>{shortenSha(latest.sha)}</code>
                <span>{latest.authorLogin ?? latest.authorName}</span>
                <span>{formatRelativeTime(latest.authoredAt)}</span>
                {latest.verified && (
                  <span className="flex items-center gap-1 text-green-400"><CheckCircle size={11} />Verified</span>
                )}
                <span style={{ color: '#34d399' }}>+{latest.additions}</span>
                <span style={{ color: '#f87171' }}>-{latest.deletions}</span>
                <span>{latest.changedFiles} files</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search commit messages or SHA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-xs sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Filter by author..."
            value={author}
            onChange={(e) => { setAuthor(e.target.value); setPage(1); }}
            className="input w-full sm:w-48 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Commit list */}
      {commitsQ.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      )}

      {commitsQ.isError && (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-3" color="#ef4444" />
          <p className="font-semibold">Failed to load commits</p>
        </div>
      )}

      {!commitsQ.isLoading && filteredCommits.length === 0 && (
        <div className="card p-8 text-center">
          <GitCommit size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-semibold">No commits found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Try adjusting your filters or selecting a different branch.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filteredCommits.map((commit: any) => (
          <Link
            key={commit.sha}
            to={`/repositories/${owner}/${repo}/commits/${commit.sha}`}
            className="card p-4 flex items-start gap-4 hover:card-glow cursor-pointer block"
            style={{ textDecoration: 'none' }}
          >
            <Avatar
              src={commit.authorAvatarUrl}
              username={commit.authorLogin}
              alt={commit.authorLogin ?? commit.authorName}
              size="sm"
            />

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{commit.message.split('\n')[0]}</p>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                <code className="px-1 rounded" style={{ background: 'var(--color-surface-2)' }}>{shortenSha(commit.sha)}</code>
                <span>{commit.authorLogin ?? commit.authorName}</span>
                <span>{formatRelativeTime(commit.authoredAt)}</span>
                {commit.verified && (
                  <span className="flex items-center gap-1 text-green-400"><CheckCircle size={10} />Verified</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Page {page}</span>
          <button
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-secondary btn-sm"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
