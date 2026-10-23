import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RepositoryAnalyticsPage } from './pages/RepositoryAnalyticsPage';
import { CommitExplorerPage } from './pages/CommitExplorerPage';
import { CommitDetailPage } from './pages/CommitDetailPage';
import { CollaborationPage } from './pages/CollaborationPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { TimelinePage } from './pages/TimelinePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/repositories" element={<DashboardPage />} />
                <Route path="/repositories/:owner/:repo" element={<RepositoryAnalyticsPage />} />
                <Route path="/repositories/:owner/:repo/developers" element={<RepositoryAnalyticsPage />} />
                <Route path="/repositories/:owner/:repo/commits" element={<CommitExplorerPage />} />
                <Route path="/repositories/:owner/:repo/commits/:sha" element={<CommitDetailPage />} />
                <Route path="/repositories/:owner/:repo/collaboration" element={<CollaborationPage />} />
                <Route path="/repositories/:owner/:repo/risks" element={<RiskAnalysisPage />} />
                <Route path="/repositories/:owner/:repo/timeline" element={<TimelinePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
