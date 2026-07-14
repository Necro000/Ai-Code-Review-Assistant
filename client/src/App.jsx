import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import NewReviewPage from './pages/NewReviewPage';
import HistoryPage from './pages/HistoryPage';
import ReviewDetailPage from './pages/ReviewDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import WorkspacePage from './pages/WorkspacePage';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage';
import AdminPage from './pages/AdminPage';
import PRReviewPage from './pages/PRReviewPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/review/new" element={<NewReviewPage />} />
            <Route path="/review/:id" element={<ReviewDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/workspace/:id" element={<WorkspaceDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pr/review" element={<PRReviewPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            {/* NotFound page within layout context */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
