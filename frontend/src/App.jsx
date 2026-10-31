import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Recommendations from './pages/Recommendations';
import Sessions from './pages/Sessions';
import Feedback from './pages/Feedback';
import Progress from './pages/Progress';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#94a3b8' 
      }}>
        Loading SkillSphere AI...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main Layout Wrapper for Authenticated Pages
const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <div className="main-content">
        <Navbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout><Profile /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/skills" element={
            <ProtectedRoute>
              <AppLayout><Skills /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/recommendations" element={
            <ProtectedRoute>
              <AppLayout><Recommendations /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/sessions" element={
            <ProtectedRoute>
              <AppLayout><Sessions /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/feedback" element={
            <ProtectedRoute>
              <AppLayout><Feedback /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/progress" element={
            <ProtectedRoute>
              <AppLayout><Progress /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
