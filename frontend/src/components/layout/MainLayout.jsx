import { useContext } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Footer from '../common/Footer';
import { AuthContext } from '../../contexts/AuthContext';

const MainLayout = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        {user && <Sidebar />}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            pt: 10, // Space for header
            ml: user ? { sm: '240px' } : 0, // Space for sidebar when user is logged in
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default MainLayout;