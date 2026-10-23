import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Bell, Menu, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Avatar } from './Avatar';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b flex-shrink-0"
      style={{
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
        minHeight: '56px',
        height: '56px',
      }}
    >
      {/* Left: Mobile hamburger menu & branding */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="btn btn-ghost p-2 md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu size={19} />
          </button>
        )}
        <div className="flex items-center gap-2 md:hidden">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            <Zap size={14} color="white" />
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            GitScope
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost p-2"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost p-2 relative hidden sm:inline-flex" title="Notifications">
          <Bell size={16} />
        </button>

        {/* User menu */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
            <Link to="/settings" className="flex items-center gap-2 group">
              <Avatar
                src={user.avatarUrl}
                username={user.username}
                alt={user.displayName || user.username}
                size="sm"
              />
              <span
                className="text-xs sm:text-sm font-medium hidden lg:inline-block max-w-[120px] truncate"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {user.displayName || user.username}
              </span>
            </Link>

            <button
              onClick={logout}
              className="btn btn-ghost p-2 text-red-400/80 hover:text-red-400"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
