import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Typography
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';

// Sidebar width
const drawerWidth = 240;

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null; // Don't render sidebar for unauthenticated users
  
  // Navigation menu based on user role
  const getNavItems = () => {
    const navItems = [
      { name: 'Dashboard', path: '/', icon: '📊' },
    ];
    
    if (user?.user?.role === 'admin') {
      navItems.push(
        { name: 'Companies', path: '/companies', icon: '🏢' },
        { name: 'Accountants', path: '/accountants', icon: '👤' },
        { name: 'Settings', path: '/settings', icon: '⚙️' }
      );
    } else if (user?.user?.role === 'accountant') {
      navItems.push(
        { name: 'My Companies', path: '/companies', icon: '🏢' },
        { name: 'Documents', path: '/documents', icon: '📄' }
      );
    } else if (user?.user?.role === 'company') {
      navItems.push(
        { name: 'Documents', path: '/documents', icon: '📄' },
        { name: 'Upload', path: '/documents/upload', icon: '📤' }
      );
    }
    
    // Add profile to all roles
    navItems.push(
      { name: 'Profile', path: '/profile', icon: '👤' }
    );
    
    return navItems;
  };
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          mt: '64px', // AppBar height
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Logged in as:
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {user.user.name}
        </Typography>
        <Typography variant="body2" color="primary.main" sx={{ textTransform: 'capitalize' }}>
          {user.user.role}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <List>
        {getNavItems().map((item) => (
          <ListItem 
            key={item.name}
            component={NavLink}
            to={item.path}
            sx={{ 
              color: 'inherit',
              textDecoration: 'none',
              '&.active': {
                bgcolor: 'primary.light',
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;