import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Trash2, Plus, Calendar, CheckCircle, Clock, AlertTriangle, RefreshCw, X, GitBranch, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { formatDateTime } from '../lib/utils';

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch reports
  const { data, isLoading, refetch } = useQuery<{ reports: any[] }>({
    queryKey: ['user-reports'],
    queryFn: async () => {
      const res = await api.get('/reports');
      return res.data;
    },
  });

  // Fetch repositories for generation modal
  const reposQ = useQuery<{ repos: any[] }>({
    queryKey: ['repositories-list'],
    queryFn: async () => {
      const res = await api.get('/repositories?perPage=50');
      return res.data;
    },
    enabled: isModalOpen,
  });

  const repos = reposQ.data?.repos ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await api.delete(`/reports/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reports'] });
    },
  });

  async function handleDownload(reportId: string, reportTitle: string) {
    try {
      setDownloadingId(reportId);
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      alert('Failed to download report: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleCreateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRepo) {
      alert('Please select a repository');
      return;
    }

    const [owner, repoName] = selectedRepo.split('/');
    if (!owner || !repoName) return;

    try {
      setIsGenerating(true);
      setStatusMessage('Analyzing commits and building PDF...');
      const res = await api.post(`/repositories/${owner}/${repoName}/reports`, {
        branch: branch || 'main',
        title: title || `${selectedRepo} Analysis Report`,
      });

      const reportId = res.data.reportId;
      queryClient.invalidateQueries({ queryKey: ['user-reports'] });
      setIsModalOpen(false);

      // Download automatically
      await handleDownload(reportId, title || `${selectedRepo} Analysis Report`);
      setStatusMessage('Report generated and downloaded successfully!');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      alert('Failed to generate report: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsGenerating(false);
    }
  }

  const reports = data?.reports ?? [];

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analysis Reports</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Generated PDF reports, executive summaries, and vulnerability assessments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="btn btn-secondary flex items-center gap-2 text-xs sm:text-sm"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setIsModalOpen(true);
              if (repos.length > 0 && !selectedRepo) {
                setSelectedRepo(repos[0].full_name);
              }
            }}
            className="btn btn-primary flex items-center gap-2 text-xs sm:text-sm"
            id="generate-report-modal-btn"
          >
            <Plus size={16} />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className="p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 animate-fadeIn">
          <CheckCircle size={16} className="flex-shrink-0 text-indigo-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && reports.length === 0 && (
        <div className="card p-12 text-center space-y-4">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg"
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-accent)' }}
          >
            <FileText size={28} />
          </div>
          <h3 className="text-lg font-bold">No reports generated yet</h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Generate executive summaries, developer stats, risk heuristics, and collaboration reports in PDF format.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary inline-flex items-center gap-2 text-xs sm:text-sm mt-2"
          >
            <Sparkles size={16} />
            <span>Generate Your First PDF Report</span>
          </button>
        </div>
      )}

      {/* Reports List */}
      {!isLoading && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((report: any) => (
            <div
              key={report._id}
              className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0 w-full sm:w-auto">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-accent)' }}
                >
                  <FileText size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base truncate">{report.title}</h4>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs mt-1.5 flex-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDateTime(report.createdAt)}
                    </span>
                    {report.repositoryId && (
                      <span className="flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/20">
                        <GitBranch size={11} />
                        {report.repositoryId}
                      </span>
                    )}
                    <span>
                      Branch: <code className="text-xs px-1 rounded bg-black/20">{report.branch || 'HEAD'}</code>
                    </span>
                    {report.fileSize && (
                      <span className="badge badge-ghost text-[10px]">
                        {(report.fileSize / 1024).toFixed(1)} KB PDF
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <button
                  onClick={() => handleDownload(report._id, report.title)}
                  disabled={downloadingId === report._id || report.status === 'generating'}
                  className="btn btn-primary text-xs flex items-center gap-1.5"
                >
                  <Download size={14} className={downloadingId === report._id ? 'animate-bounce' : ''} />
                  <span>{downloadingId === report._id ? 'Downloading...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete report "${report.title}"?`)) {
                      deleteMutation.mutate(report._id);
                    }
                  }}
                  className="btn btn-ghost p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  title="Delete report"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="card p-6 w-full max-w-lg space-y-4 shadow-2xl relative"
            style={{ border: '1px solid rgba(99, 102, 241, 0.4)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                >
                  <FileText size={18} color="white" />
                </div>
                <h3 className="text-lg font-bold">Generate Intelligence Report</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost p-1 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Target Repository *
                </label>
                {reposQ.isLoading ? (
                  <div className="skeleton h-10 rounded" />
                ) : repos.length > 0 ? (
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="select w-full text-sm"
                    required
                  >
                    <option value="">Select a repository...</option>
                    {repos.map((r: any) => (
                      <option key={r.id} value={r.full_name}>
                        {r.full_name} {r.private ? '(Private)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. owner/repo"
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="input w-full text-sm"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Git Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. main, develop, HEAD"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="input w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Report Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Executive Engineering Audit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input w-full text-sm"
                />
              </div>

              <div className="p-3 rounded-lg text-xs space-y-1 bg-white/5 border border-white/10" style={{ color: 'var(--color-text-secondary)' }}>
                <p className="font-semibold text-white">Report will include:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Executive commit overview &amp; volume metrics</li>
                  <li>Developer contribution leaderboard</li>
                  <li>Commit message type classifications</li>
                  <li>Most frequently modified hot files</li>
                  <li>Deterministic risk heuristics &amp; file findings</li>
                  <li>Multi-contributor overlap and collaboration graph</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !selectedRepo}
                  className="btn btn-primary text-xs sm:text-sm flex items-center gap-2"
                >
                  <Download size={15} className={isGenerating ? 'animate-spin' : ''} />
                  <span>{isGenerating ? 'Generating PDF...' : 'Generate & Download PDF'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
