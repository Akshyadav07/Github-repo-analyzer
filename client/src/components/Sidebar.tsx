import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  GitCommit,
  Users,
  Network,
  Shield,
  Clock,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const topNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/repositories', icon: GitBranch, label: 'Repositories' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function getRepoNavItems(owner: string, repo: string) {
  const base = `/repositories/${owner}/${repo}`;
  return [
    { to: base, icon: LayoutDashboard, label: 'Analytics', end: true },
    { to: `${base}/commits`, icon: GitCommit, label: 'Commits' },
    { to: `${base}/developers`, icon: Users, label: 'Developers' },
    { to: `${base}/collaboration`, icon: Network, label: 'Collaboration' },
    { to: `${base}/risks`, icon: Shield, label: 'Risk Analysis' },
    { to: `${base}/timeline`, icon: Clock, label: 'Timeline' },
  ];
}

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const params = useParams<{ owner?: string; repo?: string }>();
  const hasRepo = !!(params.owner && params.repo);

  return (
    <aside
      className={`sidebar flex flex-col fixed inset-y-0 left-0 z-50 md:static transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
      style={{
        width: collapsed ? '68px' : '240px',
      }}
    >
      {/* Logo & Mobile Close */}
      <div
        className="flex items-center justify-between px-4 py-4 sm:py-5 border-b"
        style={{ borderColor: 'var(--color-border)', minHeight: '56px' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            <Zap size={16} color="white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0">
              <div className="font-bold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                GitScope AI
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                Repository Intel
              </div>
            </div>
          )}
        </div>

        {/* Close button on mobile */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="btn btn-ghost p-1.5 md:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Top level */}
        <div className="mb-4">
          {(!collapsed || mobileOpen) && (
            <div
              className="px-2 py-1 text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Main
            </div>
          )}
          {topNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Repo-specific nav */}
        {hasRepo && (
          <div>
            {(!collapsed || mobileOpen) && (
              <div
                className="px-2 py-1 text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Repository
              </div>
            )}
            {(!collapsed || mobileOpen) && (
              <div
                className="px-2 mb-2 text-xs font-medium truncate"
                style={{ color: 'var(--color-accent-light)' }}
              >
                {params.owner}/{params.repo}
              </div>
            )}
            {getRepoNavItems(params.owner!, params.repo!).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Desktop Collapse toggle */}
      <button
        onClick={onToggle}
        className="btn btn-ghost m-2 justify-center hidden md:flex"
        style={{ borderTop: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: '0.5rem' }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!collapsed && <span className="text-xs">Collapse</span>}
      </button>
    </aside>
  );
}
