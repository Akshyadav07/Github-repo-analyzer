import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function shortenSha(sha: string): string {
  return sha.substring(0, 7);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#f87171';
    case 'high': return '#fb923c';
    case 'medium': return '#fbbf24';
    case 'low': return '#34d399';
    default: return '#818cf8';
  }
}

export function eventTypeColor(type: string): string {
  switch (type) {
    case 'commit': return '#6366f1';
    case 'pr-merged': return '#a78bfa';
    case 'pr-opened': return '#22d3ee';
    case 'pr-closed': return '#ef4444';
    case 'release': return '#10b981';
    default: return '#64748b';
  }
}
