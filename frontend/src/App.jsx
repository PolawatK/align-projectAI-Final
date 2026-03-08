import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import Navbar from './components/Navbar.jsx';
import UserBar from './components/UserBar.jsx';
import Toast from './components/Toast.jsx';
import AuthPage from './pages/AuthPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ScannerPage from './pages/ScannerPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0C0B09' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Toast />
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<LandingPage />} />

        {/* Protected */}
        <Route path="/scanner" element={
          <ProtectedRoute>
            <Navbar />
            <ScannerPage />
            <UserBar />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <DashboardPage />
            <UserBar />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
