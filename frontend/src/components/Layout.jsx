import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import AuthContext from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Navigation items based on user role
  const getNavItems = () => {
    const navItems = [
      { name: 'Dashboard', path: '/' },
    ];
    
    if (user?.user?.role === 'admin') {
      navItems.push(
        { name: 'Companies', path: '/companies' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Settings', path: '/admin/settings' }
      );
    } else if (user?.user?.role === 'accountant') {
      navItems.push(
        { name: 'Companies', path: '/companies' },
        { name: 'Documents', path: '/documents' }
      );
    } else if (user?.user?.role === 'company') {
      navItems.push(
        { name: 'Documents', path: '/documents' },
        { name: 'Upload', path: '/documents/upload' }
      );
    }
    
    return navItems;
  };
  
  // Dropdown menu items
  const dropdownItems = [
    { name: 'Profile', path: '/profile' },
    { name: 'Change Password', path: '/change-password' },
    { name: 'Help', path: '/help' },
  ];
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top Navigation Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo & Brand */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
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
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              DocsCompta
            </Typography>
            
            {/* Navigation Links - Desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {getNavItems().map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  to={item.path}
                  sx={{ 
                    my: 2, 
                    color: 'white', 
                    display: 'block',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
            
            {/* Notifications & User Menu */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
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
              
              {/* User Profile Menu */}
              <Box sx={{ position: 'relative' }}>
                <Tooltip title="Open profile menu">
                  <IconButton
                    component={Link}
                    to="/profile"
                    sx={{ p: 0 }}
                  >
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {user?.user?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                
                {/* Dropdown menu options - can be implemented with additional state if needed */}
              </Box>
              
              {/* Logout Button */}
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleLogout}
                sx={{ ml: 2 }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          pt: { xs: 8, sm: 9 } // Adjust top padding to account for AppBar height
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;