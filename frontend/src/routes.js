import { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';

// Dashboard Pages
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import AccountantDashboard from './pages/Dashboard/AccountantDashboard';
import CompanyDashboard from './pages/Dashboard/CompanyDashboard';

// Accountant Pages
import AccountantsPage from './pages/Accountants/AccountantsPage';
import AccountantDetailPage from './pages/Accountants/AccountantDetailPage';

// Company Pages
import CompaniesPage from './pages/Companies/CompaniesPage';
import CompanyDetailPage from './pages/Companies/CompanyDetailPage';

// Document Pages
import DocumentsPage from './pages/Documents/DocumentsPage';
import DocumentUploadPage from './pages/Documents/DocumentUploadPage';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';

// Protected Route Component
const ProtectedRoute = ({ element, roles = [] }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (roles.length > 0 && !roles.includes(user?.user?.role)) {
    return <Navigate to="/" />;
  }
  
  return element;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  const getDashboard = () => {
    if (!isAuthenticated) return <LoginPage />;
    
    const role = user?.user?.role;
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      case 'company':
        return <CompanyDashboard />;
      default:
        return <LoginPage />;
    }
  };
  
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
      
      <Route path="/" element={<MainLayout />}>
        <Route index element={getDashboard()} />
        
        {/* Protected Routes */}
        <Route path="profile" element={<ProtectedRoute element={<ProfilePage />} />} />
        <Route path="settings" element={<ProtectedRoute element={<SettingsPage />} />} />
        
        {/* Admin Routes */}
        <Route path="accountants" element={<ProtectedRoute element={<AccountantsPage />} roles={['admin']} />} />
        <Route path="accountants/:id" element={<ProtectedRoute element={<AccountantDetailPage />} roles={['admin']} />} />
        
        {/* Admin & Accountant Routes */}
        <Route path="companies" element={<ProtectedRoute element={<CompaniesPage />} roles={['admin', 'accountant']} />} />
        <Route path="companies/:id" element={<ProtectedRoute element={<CompanyDetailPage />} roles={['admin', 'accountant', 'company']} />} />
        
        {/* Document Routes */}
        <Route path="documents/:companyId" element={<ProtectedRoute element={<DocumentsPage />} />} />
        <Route path="documents/upload/:companyId" element={<ProtectedRoute element={<DocumentUploadPage />} />} />
        <Route path="documents/view/:id" element={<ProtectedRoute element={<DocumentDetailPage />} />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;