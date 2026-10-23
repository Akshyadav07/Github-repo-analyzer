import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Network, AlertCircle, Info, GitCommit, File } from 'lucide-react';
import api from '../lib/api';
import { shortenSha } from '../lib/utils';

const CONFIDENCE_BADGE: Record<string, string> = {
  verified: 'badge-critical',
  probable: 'badge-medium',
  possible: 'badge-low',
};

const TYPE_LABELS: Record<string, string> = {
  'shared-file': 'Shared File',
  'overlapping-lines': 'Overlapping Lines',
  'shared-module': 'Shared Module',
  'potential-conflict': 'Potential Conflict',
};

export function CollaborationPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();

  const q = useQuery({
    queryKey: ['collaboration', owner, repo],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/collaboration`);
      return res.data;
    },
  });

  const findings = q.data?.findings ?? [];
  const graph = q.data?.graph;
  const coverage = q.data?.coverage;

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Collaboration Insights</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Developers working on overlapping parts of the codebase
        </p>
      </div>

      {/* Coverage notice */}
      {coverage && (
        <div className="card p-4 flex items-start gap-3" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
          <Info size={16} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Analysis based on {coverage.commitsAnalyzed} of {coverage.totalCommits} commits within a {coverage.windowDays}-day overlap window.
            Only commits with available file patches can detect line-level overlaps.
          </p>
        </div>
      )}

      {/* Developer graph summary */}
      {graph && graph.nodes.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Network size={16} color="#6366f1" /> Developer Collaboration Graph
          </h3>
          <div className="flex flex-wrap gap-3">
            {graph.nodes.map((node: any) => (
              <div key={node.id} className="badge badge-info px-3 py-1">
                {node.label}
              </div>
            ))}
          </div>
          {graph.edges.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Connections</h4>
              {graph.edges.map((edge: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm p-2 rounded" style={{ background: 'var(--color-surface-2)' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{edge.from}</span>
                    <span className="text-xs" style={{ color: 'var(--color-accent-light)' }}>↔</span>
                    <span className="font-medium">{edge.to}</span>
                  </div>
                  <span className="badge badge-ghost self-start sm:self-auto">{edge.weight} overlap{edge.weight !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {q.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-lg" />)}
        </div>
      )}

      {q.isError && (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-3" color="#ef4444" />
          <p className="font-semibold">Failed to analyze collaboration</p>
        </div>
      )}

      {!q.isLoading && findings.length === 0 && (
        <div className="card p-12 text-center">
          <Network size={40} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="font-semibold mb-2">No collaboration overlaps detected</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No shared-file or overlapping-line changes were found in the analyzed commits.
          </p>
        </div>
      )}

      {findings.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Findings ({findings.length})</h2>
          {findings.map((f: any) => (
            <div key={f.findingId} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                      {TYPE_LABELS[f.findingType] ?? f.findingType}
                    </span>
                    <span className={`badge ${CONFIDENCE_BADGE[f.confidence] ?? 'badge-ghost'}`}>
                      {f.confidence}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {f.developers.map((d: string) => (
                      <span key={d} className="font-semibold text-sm">{d}</span>
                    )).reduce((prev: any, curr: any) => [prev, ' & ', curr])}
                  </div>
                </div>
              </div>

              <p className="text-sm mb-3">{f.evidence}</p>

              {f.filePaths?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {f.filePaths.map((fp: string) => (
                    <span key={fp} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded break-all max-w-full"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                      <File size={10} className="flex-shrink-0" /> {fp}
                    </span>
                  ))}
                </div>
              )}

              {f.relatedCommits?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {f.relatedCommits.map((sha: string) => (
                    <a key={sha} href={`/repositories/${owner}/${repo}/commits/${sha}`}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded hover:underline"
                      style={{ background: 'var(--color-surface-2)', color: '#818cf8' }}>
                      <GitCommit size={10} /> {shortenSha(sha)}
                    </a>
                  ))}
                </div>
              )}

              <div className="p-3 rounded text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                <strong>Confidence: </strong>{f.confidenceExplanation}
              </div>

              <div className="mt-3 p-3 rounded text-xs border-l-2" style={{ borderColor: '#22d3ee', background: 'rgba(34,211,238,0.05)', color: 'var(--color-text-secondary)' }}>
                <strong>Recommended Action: </strong>{f.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Note: Collaboration findings identify potential overlaps and do not imply errors, conflicts, or blame. All findings require human judgment.
      </p>
    </div>
  );
}
