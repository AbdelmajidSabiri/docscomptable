import { useContext } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/layout/MainLayout.css';

const MainLayout = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <Box className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </Box>
    );
  }
  
  return (
    <Box className="main-layout">
      {user && <Sidebar />}
      
      <Box className="main-content">
        <Header />
        
        <Box className="page-container">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;