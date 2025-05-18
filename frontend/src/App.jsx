import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layout components
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import CompaniesPage from './pages/Companies/CompaniesPage';
import CompanyDetailPage from './pages/Companies/CompanyDetailPage';
import TasksPage from './pages/Tasks/TasksPage';
import ActivityPage from './pages/Activity/ActivityPage';
import SettingsPage from './pages/Settings/SettingsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFound from './pages/NotFoundPage';

// Import global styles
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* All other routes use the MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<CompaniesPage />} />
            <Route path="customers/:id" element={<CompanyDetailPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Project routes */}
            <Route path="projects/bizconnect" element={<div>BizConnect Project</div>} />
            <Route path="projects/growth-hub" element={<div>Growth Hub Project</div>} />
            <Route path="projects/conversion-path" element={<div>Conversion Path Project</div>} />
            <Route path="projects/marketing" element={<div>Marketing Project</div>} />
            
            {/* Member routes */}
            <Route path="members/:memberId" element={<div>Member Profile</div>} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;