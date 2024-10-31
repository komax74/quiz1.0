import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Brain, Settings } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { usePlatformSettingsContext } from './context/PlatformSettingsContext';
import HomePage from './components/HomePage';
import StartPage from './components/StartPage';
import QuizPage from './components/QuizPage';
import ResultsPage from './components/ResultsPage';
import LeaderboardPage from './components/LeaderboardPage';
import PlayerStatsPage from './components/PlayerStatsPage';
import GlobalLeaderboardPage from './components/GlobalLeaderboardPage';
import AdminLogin from './components/admin/AdminLogin';
import Dashboard from './components/admin/Dashboard';
import QuizForm from './components/admin/QuizForm';
import QuestionEditor from './components/admin/QuestionEditor';
import AdminSettings from './components/admin/AdminSettings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const { settings } = usePlatformSettingsContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Logo"
                  style={{ height: `${settings.logoHeight || 32}px` }}
                  className="object-contain"
                />
              ) : (
                <Brain className="h-8 w-8 text-indigo-600" />
              )}
              <span className="ml-2 text-xl font-bold text-gray-900">
                {settings.platformName || 'BrainQuest'}
              </span>
            </Link>
            {isAuthenticated && (
              <div className="flex items-center">
                <Link
                  to="/admin/settings"
                  className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                  title="Platform Settings"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:quizId" element={<StartPage />} />
        <Route path="/quiz/:quizId/questions" element={<QuizPage />} />
        <Route path="/quiz/:quizId/results" element={<ResultsPage />} />
        <Route path="/quiz/:quizId/leaderboard" element={<LeaderboardPage />} />
        <Route path="/player/:playerName" element={<PlayerStatsPage />} />
        <Route path="/global-leaderboard" element={<GlobalLeaderboardPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quiz/new"
          element={
            <ProtectedRoute>
              <QuizForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quiz/edit/:quizId"
          element={
            <ProtectedRoute>
              <QuizForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quiz/:quizId/questions"
          element={
            <ProtectedRoute>
              <QuestionEditor />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}