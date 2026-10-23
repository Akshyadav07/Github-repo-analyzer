import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, GitCommit, GitMerge, Tag, AlertCircle, Filter } from 'lucide-react';
import api from '../lib/api';
import { formatDateTime, shortenSha, eventTypeColor } from '../lib/utils';

const EVENT_ICONS: Record<string, any> = {
  commit: GitCommit,
  'pr-merged': GitMerge,
  'pr-opened': GitMerge,
  'pr-closed': GitMerge,
  release: Tag,
};

export function TimelinePage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [typeFilter, setTypeFilter] = useState('all');
  const [branch, setBranch] = useState('HEAD');

  const q = useQuery({
    queryKey: ['timeline', owner, repo, branch],
    queryFn: async () => {
      const res = await api.get(`/repositories/${owner}/${repo}/timeline?branch=${branch}`);
      return res.data;
    },
  });

  const allEvents = q.data?.events ?? [];
  const types = Array.from(new Set(allEvents.map((e: any) => e.type)));

  const filtered = typeFilter === 'all' ? allEvents : allEvents.filter((e: any) => e.type === typeFilter);

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Project Timeline</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Combined event history — {owner}/{repo}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="select">
            <option value="all">All Events</option>
            {types.map((t: any) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="select">
          <option value="HEAD">HEAD</option>
        </select>
      </div>

      {q.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
        </div>
      )}

      {q.isError && (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-3" color="#ef4444" />
          <p className="font-semibold">Failed to load timeline</p>
        </div>
      )}

      {!q.isLoading && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Clock size={40} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-semibold">No events found</p>
        </div>
      )}

      <div className="relative">
        {filtered.length > 0 && <div className="timeline-line" />}
        <div className="space-y-1 pl-8">
          {filtered.map((event: any) => {
            const color = eventTypeColor(event.type);
            const Icon = EVENT_ICONS[event.type] ?? Clock;

            return (
              <div key={event.id} className="relative flex items-start gap-4 pb-4">
                <div className="timeline-dot absolute -left-8 top-3"
                  style={{ background: color, borderColor: 'var(--color-bg)', width: '10px', height: '10px' }} />
                <div className="card p-3 flex-1 hover:card-glow transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={14} color={color} style={{ flexShrink: 0 }} />
                      <span className="text-sm font-medium truncate">{event.title}</span>
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                      {formatDateTime(event.date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-xs flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                    {event.author && <span>{event.author}</span>}
                    {event.sha && (
                      <Link to={`/repositories/${owner}/${repo}/commits/${event.sha}`}
                        className="hover:underline font-mono" style={{ color: color }}>
                        {shortenSha(event.sha)}
                      </Link>
                    )}
                    <span className="badge badge-ghost text-xs">{event.type}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
