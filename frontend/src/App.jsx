import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';

// Layout components
import Layout from './components/Layout';

// Pages
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';

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
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Role-based route wrapper
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
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
            
            <Route path="/change-password" element={
              <ProtectedRoute>
                <Layout>
                  <ChangePassword />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={
              <RoleRoute allowedRoles={['admin']}>
                <Layout>
                  <Routes>
                    <Route path="users" element={<div>Admin Users Management</div>} />
                    <Route path="settings" element={<div>Admin Settings</div>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </RoleRoute>
            } />
            
            {/* Company routes */}
            <Route path="/documents/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<div>All Documents</div>} />
                    <Route path=":id" element={<div>Document Details</div>} />
                    <Route path="upload" element={<div>Upload Document</div>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Company/Accountant routes */}
            <Route path="/companies/*" element={
              <RoleRoute allowedRoles={['admin', 'accountant']}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<div>Companies List</div>} />
                    <Route path=":id" element={<div>Company Details</div>} />
                    <Route path="new" element={<div>Add New Company</div>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </RoleRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;