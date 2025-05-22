import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText, Box, Typography, Avatar } from '@mui/material';
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
    width: 220,
    flexShrink: 0,
    bgcolor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
  }}>
    <Box sx={{ px: 3, pt: 3, pb: 0 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#1f1f1f' }}>DocsCompta</Typography>
    </Box>
    <List disablePadding>
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
            borderRadius: 0,
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
              bgcolor: '#f5f7fa',
            },
            color: '#222',
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#888' }}>{item.icon}</ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: 500,
              color: '#222',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </ListItem>
      ))}
    </List>
    <Box sx={{ px: 3, pb: 2, pt: 4 }}>
      <Typography variant="caption" sx={{ color: '#888', fontWeight: 700, mb: 1, display: 'block', fontSize: 12, letterSpacing: 1 }}>Companies</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {companies.map((company) => (
          <Box key={company.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ bgcolor: company.color, width: 28, height: 28, fontSize: 14 }}>{company.name[0]}</Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 14, color: '#1f1f1f' }}>{company.name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

export default Sidebar; 