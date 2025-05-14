import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Button,
  Tooltip,
  Badge
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Logo & Brand */}
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            mr: 2,
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
            display: { xs: 'none', sm: 'block' }
          }}
        >
          DocsCompta
        </Typography>
        
        {/* Mobile Brand */}
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            mr: 2,
            display: { xs: 'flex', sm: 'none' },
            flexGrow: 1,
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          DC
        </Typography>
        
        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Notifications & User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && (
            <>
              {/* Notifications */}
              <IconButton
                size="large"
                aria-label="show new notifications"
                color="inherit"
                component={Link}
                to="/notifications"
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={3} color="error">
                  🔔
                </Badge>
              </IconButton>
              
              {/* User Profile */}
              <Tooltip title="Profile">
                <IconButton
                  component={Link}
                  to="/profile"
                  sx={{ p: 0, mx: 1 }}
                  aria-label="user profile"
                >
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user?.user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              {/* Logout Button */}
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleLogout}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
            </>
          )}
          
          {!user && location.pathname !== '/login' && (
            <Button
              color="inherit"
              component={Link}
              to="/login"
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;