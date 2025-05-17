import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

// Layout components
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import CompaniesPage from './pages/Companies/CompaniesPage';
import CompanyDetailPage from './pages/Companies/CompanyDetailPage';
import AccountantsPage from './pages/Accountants/AccountantsPage';
import AccountantDetailPage from './pages/Accountants/AccountantDetailPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';
import DocumentUploadPage from './pages/Documents/DocumentUploadPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFound from './pages/NotFoundPage';

// Import global styles
import './styles/index.css';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#333',
      light: '#555',
      dark: '#111',
    },
    secondary: {
      main: '#28c76f',
      light: '#50e99a',
      dark: '#1b9d57',
    },
    error: {
      main: '#ea5455',
    },
    warning: {
      main: '#ff9f43',
    },
    info: {
      main: '#00cfe8',
    },
    success: {
      main: '#28c76f',
    },
    background: {
      default: '#f8f8f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* All other routes use the MainLayout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="companies/:id" element={<CompanyDetailPage />} />
              <Route path="accountants" element={<AccountantsPage />} />
              <Route path="accountants/:id" element={<AccountantDetailPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="documents/:companyId" element={<DocumentsPage />} />
              <Route path="documents/view/:id" element={<DocumentDetailPage />} />
              <Route path="documents/upload/:companyId" element={<DocumentUploadPage />} />
              <Route path="profile" element={<ProfilePage />} />
              
              {/* Add other routes as needed */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;