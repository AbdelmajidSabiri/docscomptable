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
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="main-layout">
      {user && <Sidebar />}
      
      <div className="main-content">
        {user && <Header />}
        
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;