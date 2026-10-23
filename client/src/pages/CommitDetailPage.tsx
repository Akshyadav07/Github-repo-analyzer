import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink, CheckCircle, XCircle, Plus, Minus, Copy, Check, ChevronDown, ChevronRight, FileCode } from 'lucide-react';
import api from '../lib/api';
import { formatDateTime, shortenSha } from '../lib/utils';
import { Avatar } from '../components/Avatar';

interface DiffFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

function DiffView({ file, isExpanded }: { file: DiffFile; isExpanded: boolean }) {
  if (!isExpanded) return null;

  if (!file.patch) {
    return (
      <div className="text-xs py-4 px-4 bg-black/10" style={{ color: 'var(--color-text-muted)' }}>
        No patch available for this file. (Binary asset, file moved without modifications, or too large for inline display.)
      </div>
    );
  }

  const lines = file.patch.split('\n');

  return (
    <div className="font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto bg-black/20">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, i) => {
            const isAdded = line.startsWith('+') && !line.startsWith('+++');
            const isRemoved = line.startsWith('-') && !line.startsWith('---');
            const isHunk = line.startsWith('@@');

            return (
              <tr
                key={i}
                style={{
                  background: isAdded
                    ? 'rgba(16, 185, 129, 0.1)'
                    : isRemoved
                    ? 'rgba(239, 68, 68, 0.1)'
                    : isHunk
                    ? 'rgba(99, 102, 241, 0.08)'
                    : 'transparent',
                }}
              >
                <td
                  className="px-2 py-0.5 select-none text-right font-mono text-[10px] w-8 border-r"
                  style={{
                    color: 'var(--color-text-muted)',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {i + 1}
                </td>
                <td
                  className="px-3 py-0.5 whitespace-pre font-mono text-xs"
                  style={{
                    color: isAdded
                      ? '#34d399'
                      : isRemoved
                      ? '#f87171'
                      : isHunk
                      ? '#818cf8'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {line}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CommitDetailPage() {
  const { owner, repo, sha } = useParams<{ owner: string; repo: string; sha: string }>();
  const [copiedSha, setCopiedSha] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});

  const commitQ = useQuery({
    queryKey: ['commit-detail', owner, repo, sha],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/commits/${sha}`);
      return res.data;
    },
  });

  const commit = commitQ.data;

  function toggleFile(filename: string) {
    setExpandedFiles((prev) => ({
      ...prev,
      [filename]: prev[filename] !== undefined ? !prev[filename] : false,
    }));
  }

  function handleCopySha(fullSha: string) {
    navigator.clipboard.writeText(fullSha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  }

  if (commitQ.isLoading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="skeleton h-8 w-1/3 rounded" />
        <div className="skeleton h-48 rounded-xl" />
        <div className="skeleton h-32 rounded-xl" />
      </div>
    );
  }

  if (commitQ.isError || !commit) {
    return (
      <div className="card p-8 text-center space-y-3">
        <p className="font-semibold text-lg">Commit not found or inaccessible</p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          The requested commit SHA could not be loaded from repository {owner}/{repo}.
        </p>
        <Link to={`/repositories/${owner}/${repo}/commits`} className="btn btn-primary btn-sm inline-flex">
          Back to Commits
        </Link>
      </div>
    );
  }

  const files = commit.files ?? [];
  const allExpanded = files.length > 0 && files.every((f: DiffFile) => expandedFiles[f.filename] !== false);

  function toggleAll() {
    const nextState = !allExpanded;
    const update: Record<string, boolean> = {};
    files.forEach((f: DiffFile) => {
      update[f.filename] = nextState;
    });
    setExpandedFiles(update);
  }

  return (
    <div className="animate-fadeIn space-y-6 max-w-5xl">
      {/* Back button */}
      <Link
        to={`/repositories/${owner}/${repo}/commits`}
        className="btn btn-ghost btn-sm inline-flex items-center gap-1.5"
      >
        <ChevronLeft size={16} /> Back to Commits
      </Link>

      {/* Commit header */}
      <div className="card p-5 sm:p-6 space-y-4" style={{ border: '1px solid rgba(99, 102, 241, 0.25)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold leading-snug">
              {commit.message.split('\n')[0]}
            </h1>
            {commit.message.includes('\n') && (
              <pre
                className="text-xs sm:text-sm mt-2.5 p-3 rounded-lg whitespace-pre-wrap font-mono"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}
              >
                {commit.message.split('\n').slice(1).join('\n').trim()}
              </pre>
            )}
          </div>
          <a
            href={commit.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm flex-shrink-0 flex items-center gap-1.5"
            title="Open on GitHub"
          >
            <ExternalLink size={14} /> <span>GitHub</span>
          </a>
        </div>

        {/* Metadata Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Commit SHA</div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-bold">{shortenSha(commit.sha)}</code>
              <button
                onClick={() => handleCopySha(commit.sha)}
                className="btn btn-ghost p-1 text-gray-400 hover:text-white"
                title="Copy Full SHA"
              >
                {copiedSha ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
            <div className="text-[11px] font-mono truncate" style={{ color: 'var(--color-text-muted)' }}>
              {commit.sha}
            </div>
          </div>

          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Author</div>
            <div className="flex items-center gap-2">
              <Avatar
                src={commit.authorAvatarUrl}
                username={commit.authorLogin}
                alt={commit.authorLogin ?? commit.authorName}
                size="xs"
              />
              <span className="text-sm font-medium truncate">
                {commit.authorLogin ?? commit.authorName}
              </span>
            </div>
            {commit.authorEmail && (
              <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {commit.authorEmail}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Authored Date</div>
            <div className="text-sm">{formatDateTime(commit.authoredAt)}</div>
          </div>

          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Verification</div>
            <div className="flex items-center gap-1 text-sm font-medium">
              {commit.verified ? (
                <>
                  <CheckCircle size={15} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Verified Commit</span>
                </>
              ) : (
                <>
                  <XCircle size={15} color="#f59e0b" />
                  <span style={{ color: '#f59e0b' }}>Unverified</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Change Stats */}
        <div className="flex items-center gap-4 pt-3 border-t text-xs sm:text-sm flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
          <span style={{ color: '#34d399' }} className="flex items-center gap-1">
            <Plus size={14} /> {commit.additions.toLocaleString()} additions
          </span>
          <span style={{ color: '#f87171' }} className="flex items-center gap-1">
            <Minus size={14} /> {commit.deletions.toLocaleString()} deletions
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {commit.changedFiles} files changed
          </span>
          {commit.parents?.length > 0 && (
            <span style={{ color: 'var(--color-text-muted)' }}>
              Parent: {commit.parents.slice(0, 2).map((p: string) => shortenSha(p)).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Files changed list */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileCode size={18} style={{ color: 'var(--color-accent)' }} />
              Changed Files ({files.length})
            </h2>
            <button
              onClick={toggleAll}
              className="text-xs hover:underline"
              style={{ color: 'var(--color-accent-light)' }}
            >
              {allExpanded ? 'Collapse All Files' : 'Expand All Files'}
            </button>
          </div>

          {files.map((file: DiffFile) => {
            const isExpanded = expandedFiles[file.filename] !== false;
            return (
              <div key={file.filename} className="card p-0 overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                <div
                  onClick={() => toggleFile(file.filename)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="badge badge-ghost text-[10px] flex-shrink-0 uppercase font-mono">
                      {file.status}
                    </span>
                    <code className="text-xs sm:text-sm truncate font-medium">{file.filename}</code>
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-shrink-0 font-mono">
                    <span style={{ color: '#34d399' }}>+{file.additions}</span>
                    <span style={{ color: '#f87171' }}>-{file.deletions}</span>
                  </div>
                </div>
                <DiffView file={file} isExpanded={isExpanded} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
