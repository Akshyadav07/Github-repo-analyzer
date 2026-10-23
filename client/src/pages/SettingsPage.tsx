import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Sun, Moon, Shield, GitBranch, CheckCircle2, LogOut, Terminal } from 'lucide-react';

import { Avatar } from '../components/Avatar';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="animate-fadeIn max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your account profile, appearance, and integrations
        </p>
      </div>

      {/* Profile Card */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <User size={18} style={{ color: 'var(--color-accent)' }} />
          GitHub Profile
        </h2>
        {user ? (
          <div className="flex items-center gap-4 flex-wrap">
            <Avatar
              src={user.avatarUrl}
              username={user.username}
              alt={user.displayName || user.username}
              size="xl"
            />
            <div>
              <h3 className="text-lg font-bold">{user.displayName || user.username}</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                @{user.username} {user.email ? `• ${user.email}` : ''}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge badge-success flex items-center gap-1 text-xs">
                  <CheckCircle2 size={12} /> Connected via GitHub
                </span>
                {user.profileUrl && (
                  <a
                    href={user.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:underline flex items-center gap-1"
                    style={{ color: 'var(--color-accent-light)' }}
                  >
                    <GitBranch size={12} /> View on GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Not logged in.
          </p>
        )}
      </div>

      {/* Appearance Card */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          {theme === 'dark' ? <Moon size={18} style={{ color: 'var(--color-accent)' }} /> : <Sun size={18} style={{ color: 'var(--color-accent)' }} />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Interface Theme</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Choose between dark mode and light mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary flex items-center gap-2 text-xs"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
          </button>
        </div>
      </div>

      {/* Integration Card */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Shield size={18} style={{ color: 'var(--color-accent)' }} />
          Security & Access
        </h2>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          GitScope AI uses OAuth 2.0 with minimal required GitHub scopes (`repo`, `read:user`, `user:email`) to read repository metrics, commits, and metadata safely.
        </p>
        <div className="pt-2">
          <button
            onClick={logout}
            className="btn btn-danger flex items-center gap-2 text-xs"
          >
            <LogOut size={14} />
            <span>Sign Out of GitScope AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
