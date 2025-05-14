import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useAuth from './hooks/useAuth';

// Layout components
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AccountantsPage from './pages/Accountants/AccountantsPage';
import CompaniesPage from './pages/Companies/CompaniesPage';
import CompanyDetailPage from './pages/Companies/CompanyDetailPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';
import DocumentUploadPage from './pages/Documents/DocumentUploadPage';
import DocumentProcessPage from './pages/Documents/DocumentProcessPage';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (roles.length > 0 && !roles.includes(user.user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/accountants" element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <AccountantsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Company routes */}
        <Route path="/companies" element={
          <ProtectedRoute roles={['admin', 'accountant']}>
            <Layout>
              <CompaniesPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/companies/:id" element={
          <ProtectedRoute roles={['admin', 'accountant']}>
            <Layout>
              <CompanyDetailPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Document routes */}
        <Route path="/documents/:companyId" element={
          <ProtectedRoute>
            <Layout>
              <DocumentsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents/view/:id" element={
          <ProtectedRoute>
            <Layout>
              <DocumentDetailPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents/upload/:companyId" element={
          <ProtectedRoute>
            <Layout>
              <DocumentUploadPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents/process/:id" element={
          <ProtectedRoute roles={['admin', 'accountant']}>
            <Layout>
              <DocumentProcessPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;