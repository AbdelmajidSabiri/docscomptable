import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import DocumentsPage from './pages/DocumentsPage';
import NotFound from './pages/NotFound';
import TestLogin from './pages/TestLogin';
import CompaniesPage from './pages/Companies/CompaniesPage';
import CompanyProfilePage from './pages/Companies/CompanyProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import AccountantProfilePage from './pages/Accountants/AccountantProfilePage';

// Import global styles
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-login" element={<TestLogin />} />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected admin routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
          
          {/* Protected accountant routes */}
          <Route element={<ProtectedRoute requiredRole="accountant" />}>
            <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
            <Route path="/accountant/documents" element={<DocumentsPage />} />
            <Route path="/accountant/companies" element={<CompaniesPage />} />
            <Route path="/accountant/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Protected user routes */}
          <Route element={<ProtectedRoute requiredRole="user" />}>
            <Route path="/user/dashboard" element={<AccountantDashboard />} />
          </Route>
          
          {/* Direct routes for debugging - no protection */}
          <Route path="/direct/admin" element={<AdminDashboard />} />
          <Route path="/direct/user" element={<AccountantDashboard />} />
          
          {/* Default dashboard route - redirects based on user role */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          {/* Company profile route */}
          <Route path="/companies/:id" element={<CompanyProfilePage />} />
          
          {/* Accountant profile route */}
          <Route path="/accountants/:id" element={<AccountantProfilePage />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Helper component to redirect to the appropriate dashboard based on user role
const DashboardRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  console.log('DashboardRedirect - User:', user);
  console.log('DashboardRedirect - IsAuthenticated:', isAuthenticated);
  console.log('DashboardRedirect - Loading:', loading);
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Debug the user role
  console.log('User role for redirection:', user?.role);
  
  switch (user?.role) {
    case 'admin':
      console.log('Redirecting to admin dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    case 'accountant':
      console.log('Redirecting to accountant dashboard');
      return <Navigate to="/accountant/dashboard" replace />;
    case 'user':
      console.log('Redirecting to user dashboard');
      return <Navigate to="/user/dashboard" replace />;
    default:
      console.log('Unknown role, redirecting to login. Role:', user?.role);
      return <Navigate to="/login" replace />;
  }
};

export default App;