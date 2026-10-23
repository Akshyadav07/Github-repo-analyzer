import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield, AlertCircle, Filter, ExternalLink, Info } from 'lucide-react';
import api from '../lib/api';
import { shortenSha } from '../lib/utils';

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
  informational: 'badge-info',
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'informational'];

export function RiskAnalysisPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const q = useQuery({
    queryKey: ['risks', owner, repo],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/risks`);
      return res.data;
    },
  });

  const allFindings = q.data?.findings ?? [];
  const summary = q.data?.summary ?? {};
  const coverage = q.data?.coverage;

  const categories = Array.from(new Set(allFindings.map((f: any) => f.category)));

  const filtered = allFindings.filter((f: any) => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    return true;
  });

  const sortedFindings = [...filtered].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Risk & Bug Analysis</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Potential issues detected in recent commits — {owner}/{repo}
        </p>
      </div>

      {/* Coverage notice */}
      {coverage && (
        <div className="card p-4 flex items-start gap-3" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
          <Info size={16} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{coverage.note}</p>
        </div>
      )}

      {/* Summary */}
      <div className="metric-grid">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="card p-4">
            <div className="text-xs mb-1 capitalize" style={{ color: 'var(--color-text-muted)' }}>{key}</div>
            <div className="text-2xl font-bold" style={{
              color: key === 'critical' ? '#f87171' : key === 'high' ? '#fb923c' : key === 'medium' ? '#fbbf24' : key === 'low' ? '#34d399' : 'var(--color-text-primary)'
            }}>
              {String(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="select">
            <option value="all">All Severities</option>
            {SEVERITY_ORDER.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select">
          <option value="all">All Categories</option>
          {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {q.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-lg" />)}
        </div>
      )}

      {q.isError && (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-3" color="#ef4444" />
          <p className="font-semibold">Failed to run risk analysis</p>
        </div>
      )}

      {!q.isLoading && allFindings.length === 0 && (
        <div className="card p-12 text-center">
          <Shield size={40} className="mx-auto mb-4" color="#10b981" />
          <h3 className="font-semibold mb-2">No risk findings detected</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No patterns matching the heuristic rules were found in the analyzed commits.
          </p>
        </div>
      )}

      {sortedFindings.length > 0 && (
        <div className="space-y-4">
          {sortedFindings.map((f: any) => (
            <div key={f.findingId} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${SEVERITY_BADGE[f.severity] ?? 'badge-ghost'}`}>
                    {f.severity.toUpperCase()}
                  </span>
                  <span className="badge badge-ghost">{f.category}</span>
                  <span className="badge badge-ghost">{f.detectionMethod}</span>
                </div>
              </div>

              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>{f.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs mb-3">
                <div className="min-w-0">
                  <span style={{ color: 'var(--color-text-muted)' }}>File: </span>
                  <code className="text-xs break-all">{f.affectedFile}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Commit: </span>
                  <a href={`/repositories/${owner}/${repo}/commits/${f.commitSha}`}
                    className="hover:underline font-mono" style={{ color: '#818cf8' }}>
                    {shortenSha(f.commitSha)}
                  </a>
                </div>
              </div>

              {f.evidenceSnippet && (
                <div className="mb-3">
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Evidence</div>
                  <pre className="text-xs p-3 rounded overflow-x-auto" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                    {f.evidenceSnippet}
                  </pre>
                </div>
              )}

              <div className="p-3 rounded text-xs mb-2" style={{ background: 'rgba(245,158,11,0.06)', borderLeft: '2px solid #f59e0b', color: 'var(--color-text-secondary)' }}>
                <strong>Confidence: </strong>{f.confidenceExplanation}
              </div>

              <div className="p-3 rounded text-xs" style={{ background: 'rgba(16,185,129,0.06)', borderLeft: '2px solid #10b981', color: 'var(--color-text-secondary)' }}>
                <strong>Recommended Fix: </strong>{f.recommendedFix}
              </div>

              {f.suggestedTests && (
                <div className="mt-2 p-3 rounded text-xs" style={{ background: 'rgba(99,102,241,0.06)', borderLeft: '2px solid #6366f1', color: 'var(--color-text-secondary)' }}>
                  <strong>Suggested Tests: </strong>{f.suggestedTests}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Risk findings are generated using deterministic heuristics and pattern matching. They are not authoritative bug detections.
        All findings require human review before taking action. False positives are expected.
      </p>
    </div>
  );
}
