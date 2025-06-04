import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText, Box, Typography, Avatar, Divider } from '@mui/material';
import { DashboardOutlined, DescriptionOutlined, BarChartOutlined, SettingsOutlined } from '@mui/icons-material';

const companies = [
  { id: 1, name: 'Acme Corp', color: '#1976d2' },
  { id: 2, name: 'Globex', color: '#388e3c' },
  { id: 3, name: 'Initech', color: '#fbc02d' },
  { id: 4, name: 'Umbrella', color: '#d32f2f' },
];

const navItems = [
  { label: 'Dashboard', to: '/accountant/dashboard', icon: <DashboardOutlined /> },
  { label: 'Documents', to: '/accountant/documents', icon: <DescriptionOutlined /> },
  { label: 'Companies', to: '/accountant/companies', icon: <BarChartOutlined /> },
  { label: 'Settings', to: '/accountant/settings', icon: <SettingsOutlined /> },
];

const Sidebar = () => (
  <Box sx={{
    width: 240,
    flexShrink: 0,
    bgcolor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
    borderRight: '1px solid #eaeaea',
  }}>
    <Box sx={{ width: '100%' }}>
      {/* Logo Section */}
      <Box sx={{ 
        px: 3, 
        pt: 3, 
        pb: 2,
        width: '100%',
        borderBottom: '1px solid #eaeaea',
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            fontFamily: 'Inter, sans-serif', 
            fontSize: 22, 
            color: '#1f1f1f',
            textAlign: 'center',
          }}
        >
          DocsCompta
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List 
        sx={{ 
          width: '100%',
          pt: 5,
          pb: 0,
        }}
      >
        {navItems.map((item) => (
          <ListItem
            button
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{
              height: 44,
              px: 3,
              py: 0,
              my: 0.25,
              mx: 1,
              borderRadius: 1,
              '&.active': {
                bgcolor: '#f5f7fa',
                color: '#1f1f1f',
                fontWeight: 700,
                '& .MuiListItemIcon-root': {
                  color: '#1f1f1f',
                },
                '& .MuiListItemText-primary': {
                  fontWeight: 700,
                  color: '#1f1f1f',
                },
              },
              '&:hover': {
                bgcolor: '#ffeaea',
                color: '#d32f2f',
                '& .MuiListItemIcon-root': {
                  color: '#d32f2f',
                },
                '& .MuiListItemText-primary': {
                  color: '#d32f2f',
                },
              },
              color: '#222',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40, 
              color: 'inherit',
              transition: 'color 0.2s ease-in-out',
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 500,
                color: 'inherit',
                fontFamily: 'Inter, sans-serif',
                transition: 'color 0.2s ease-in-out',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>

    {/* Companies Section */}
    <Box sx={{ 
      width: '100%',
      borderTop: '1px solid #eaeaea',
      mt: 33,
    }}>
      <Box sx={{ 
        px: 3, 
        py: 2,
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#888', 
            fontWeight: 700, 
            mb: 1, 
            display: 'block', 
            fontSize: 12, 
            letterSpacing: 1,
            px: 1,
          }}
        >
          Companies
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.75,
          px: 1,
        }}>
          {companies.map((company) => (
            <Box 
              key={company.id} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 0.75,
                borderRadius: 1,
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#f5f7fa',
                  cursor: 'pointer',
                },
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: company.color, 
                  width: 28, 
                  height: 28, 
                  fontSize: 14,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {company.name[0]}
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500, 
                  fontSize: 14, 
                  color: '#1f1f1f',
                  transition: 'color 0.2s ease-in-out',
                  '&:hover': {
                    color: '#d32f2f',
                  },
                }}
              >
                {company.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  </Box>
);

export default Sidebar; 