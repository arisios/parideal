import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import SharedProfile from './pages/SharedProfile';
import AuthPage from './pages/AuthPage';
import AdminPanel from './pages/AdminPanel';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import LoadingSpinner from './components/LoadingSpinner';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-parideal flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/resultado" element={<Result />} />
          <Route path="/p/:token" element={<SharedProfile />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/chat/:profileId" element={<Chat />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '12px',
            border: '1px solid rgba(111, 45, 168, 0.2)',
            boxShadow: '0 4px 20px rgba(75, 30, 109, 0.15)',
          },
          success: {
            iconTheme: { primary: '#C21874', secondary: '#fff' },
          },
        }}
      />
    </AuthProvider>
  );
}
