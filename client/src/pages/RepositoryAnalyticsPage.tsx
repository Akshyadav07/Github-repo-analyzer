import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { GitCommit, Users, Plus, Minus, AlertCircle, TrendingUp, Activity, File, FileText, Download, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { formatNumber, formatRelativeTime, shortenSha } from '../lib/utils';
import { Avatar } from '../components/Avatar';

const COLORS = ['#6366f1', '#22d3ee', '#a78bfa', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

function MetricCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: any; color: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20` }}>
          <Icon size={14} color={color} />
        </div>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{sub}</div>}
    </div>
  );
}

export function RepositoryAnalyticsPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [branch, setBranch] = useState('HEAD');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportNotice, setReportNotice] = useState<string | null>(null);

  async function handleGenerateReport() {
    try {
      setIsGeneratingReport(true);
      setReportNotice('Generating comprehensive PDF report...');
      const res = await api.post(`/repositories/${owner}/${repo}/reports`, {
        branch,
        title: `${owner}/${repo} (${branch}) Executive Intelligence Report`,
      });

      const reportId = res.data.reportId;
      setReportNotice('Report generated! Initiating download...');

      const downloadRes = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([downloadRes.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${owner}_${repo}_intelligence_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      setReportNotice('PDF report downloaded successfully!');
      setTimeout(() => setReportNotice(null), 5000);
    } catch (err: any) {
      alert('Failed to generate report: ' + (err.response?.data?.message || err.message));
      setReportNotice(null);
    } finally {
      setIsGeneratingReport(false);
    }
  }

  const overviewQ = useQuery({
    queryKey: ['repo-overview', owner, repo, branch],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/analytics/overview?branch=${branch}`);
      return res.data;
    },
  });

  const activityQ = useQuery({
    queryKey: ['repo-activity', owner, repo, branch, granularity],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/analytics/activity?branch=${branch}&granularity=${granularity}`);
      return res.data;
    },
  });

  const contributorsQ = useQuery({
    queryKey: ['repo-contributors', owner, repo, branch],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/analytics/contributors?branch=${branch}`);
      return res.data;
    },
  });

  const branchesQ = useQuery({
    queryKey: ['branches', owner, repo],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/branches`);
      return res.data;
    },
  });

  const overview = overviewQ.data;
  const activity = activityQ.data?.activity ?? [];
  const heatmap = activityQ.data?.heatmap ?? [];
  const contributors = contributorsQ.data?.contributors ?? [];
  const commitTypes = contributorsQ.data?.commitTypes ?? [];
  const branches = branchesQ.data?.branches ?? [];

  if (overviewQ.isError) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle size={32} className="mx-auto mb-3" color="#ef4444" />
        <p className="font-semibold">Failed to load analytics</p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {(overviewQ.error as any)?.response?.data?.error ?? 'Check if this repository is accessible.'}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold truncate">{owner}/{repo}</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Repository Analytics Dashboard
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="select text-xs sm:text-sm"
          >
            <option value="HEAD">HEAD (default)</option>
            {branches.map((b: string) => <option key={b} value={b}>{b}</option>)}
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            id="generate-pdf-report-btn"
            title="Generate and download full summary PDF report"
          >
            <FileText size={14} className={isGeneratingReport ? 'animate-spin' : ''} />
            <span>{isGeneratingReport ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          <Link to={`/repositories/${owner}/${repo}/commits`} className="btn btn-primary btn-sm">
            Explore Commits
          </Link>
        </div>
      </div>

      {/* Report Notice Banner */}
      {reportNotice && (
        <div className="p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 animate-fadeIn">
          <CheckCircle size={16} className="flex-shrink-0 text-indigo-400" />
          <span>{reportNotice}</span>
          <Link to="/reports" className="ml-auto underline font-medium hover:text-white">
            View all reports →
          </Link>
        </div>
      )}

      {/* Latest commit */}
      {overview?.latestCommit && (
        <div className="card" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar
              src={overview.latestCommit.authorAvatarUrl}
              username={overview.latestCommit.authorLogin}
              alt={overview.latestCommit.authorLogin ?? overview.latestCommit.authorName}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] sm:text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>LATEST COMMIT</span>
                <code className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                  {shortenSha(overview.latestCommit.sha)}
                </code>
              </div>
              <p className="font-medium text-sm sm:text-base truncate">{overview.latestCommit.message.split('\n')[0]}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {overview.latestCommit.authorLogin ?? overview.latestCommit.authorName} · {formatRelativeTime(overview.latestCommit.authoredAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="metric-grid">
        <MetricCard label="Total Commits" value={overviewQ.isLoading ? '...' : formatNumber(overview?.totalCommits ?? 0)} icon={GitCommit} color="#6366f1" sub={overview?.dataCoverage?.note} />
        <MetricCard label="Contributors" value={overviewQ.isLoading ? '...' : overview?.activeContributors ?? 0} icon={Users} color="#22d3ee" />
        <MetricCard label="Lines Added" value={overviewQ.isLoading ? '...' : `+${formatNumber(overview?.totalAdditions ?? 0)}`} icon={Plus} color="#10b981" />
        <MetricCard label="Lines Deleted" value={overviewQ.isLoading ? '...' : `-${formatNumber(overview?.totalDeletions ?? 0)}`} icon={Minus} color="#ef4444" />
        <MetricCard label="Open Issues" value={overviewQ.isLoading ? '...' : overview?.openIssues ?? 'N/A'} icon={AlertCircle} color="#f59e0b" />
        <MetricCard label="Activity" value={activity.length > 0 ? 'Active' : 'No data'} icon={Activity} color="#a78bfa" />
      </div>

      {/* Commit Activity Chart */}
      <div className="chart-container min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-sm sm:text-base">Commit Activity</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Commits over time (up to 100 most recent)
            </p>
          </div>
          <div className="flex gap-1 flex-wrap">
            {(['daily', 'weekly', 'monthly'] as const).map((g) => (
              <button key={g} onClick={() => setGranularity(g)}
                className={`btn btn-sm ${granularity === g ? 'btn-primary' : 'btn-ghost'}`}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activityQ.isLoading && <div className="skeleton h-48 rounded" />}

        {!activityQ.isLoading && activity.length === 0 && (
          <div className="h-48 flex items-center justify-center text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-center">
              <TrendingUp size={24} className="mx-auto mb-2" />
              <p>No activity data available for this range.</p>
            </div>
          </div>
        )}

        {activity.length > 0 && (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="commits" stroke="#6366f1" fill="url(#commitGrad)" strokeWidth={2} name="Commits" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Contributor comparison */}
        <div className="chart-container min-w-0">
          <h3 className="font-semibold mb-4">Contributor Commits</h3>
          {contributorsQ.isLoading && <div className="skeleton h-48 rounded" />}
          {contributors.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contributors.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="login" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="commits" fill="#6366f1" radius={[0, 4, 4, 0]} name="Commits">
                  {contributors.slice(0, 8).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {!contributorsQ.isLoading && contributors.length === 0 && (
            <div className="h-48 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>No contributor data</div>
          )}
        </div>

        {/* Commit type distribution */}
        <div className="chart-container min-w-0">
          <h3 className="font-semibold mb-1">Commit Types</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Inferred from commit message patterns
          </p>
          {contributorsQ.isLoading && <div className="skeleton h-48 rounded" />}
          {commitTypes.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={commitTypes} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="type" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${Math.round((percent ?? 0) * 100)}%`}>
                  {commitTypes.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {!contributorsQ.isLoading && commitTypes.length === 0 && (
            <div className="h-48 flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>No type data</div>
          )}
        </div>
      </div>

      {/* Code churn */}
      {activity.length > 0 && (
        <div className="chart-container">
          <h3 className="font-semibold mb-1">Code Churn</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Additions and deletions over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
              <Bar dataKey="additions" name="Additions" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="deletions" name="Deletions" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top contributors table */}
      {contributors.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Contributor Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Developer</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Commits</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Additions</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Deletions</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((c: any) => (
                  <tr key={c.login} className="border-b hover:bg-opacity-5 hover:bg-white transition-colors"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {c.avatarUrl && <img src={c.avatarUrl} alt="" className="w-6 h-6 rounded-full" />}
                        <span className="font-medium">{c.login}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono" style={{ color: '#818cf8' }}>{c.commits}</td>
                    <td className="py-2 px-3 text-right font-mono" style={{ color: '#34d399' }}>+{formatNumber(c.additions)}</td>
                    <td className="py-2 px-3 text-right font-mono" style={{ color: '#f87171' }}>-{formatNumber(c.deletions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
            Note: Commit statistics are derived from GitHub API data for the most recent commits. Line counts may be incomplete for commits without diff patches. These numbers are not performance scores.
          </p>
        </div>
      )}
    </div>
  );
}
