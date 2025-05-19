import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PeopleOutline,
  DescriptionOutlined,
  BusinessOutlined,
  MoreVert,
  PersonAdd,
  ArticleOutlined,
  CloseOutlined,
  GroupAddOutlined
} from '@mui/icons-material';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    documents: 0,
    companies: 0,
    recentActivity: []
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateAccountant = async (values, { resetForm }) => {
    try {
      // Register accountant
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: values.name,
        email: values.email,
        password: values.password,
        role: 'accountant'
      });

      // Show success notification
      setNotification({
        open: true,
        message: 'Accountant account created successfully',
        type: 'success'
      });

      // Close dialog and reset form
      resetForm();
      handleCloseDialog();

      // Refresh dashboard data (optional)
      // fetchDashboardData();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to create accountant account',
        type: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    // Simulate fetching dashboard data
    setTimeout(() => {
      // Mock data for demonstration
      setStats({
        users: 42,
        documents: 156,
        companies: 15,
        recentActivity: [
          {
            id: 1,
            type: 'user',
            action: 'New accountant registered',
            name: 'Marie Dupont',
            timestamp: '2 hours ago'
          },
          {
            id: 2,
            type: 'document',
            action: 'Document processed',
            name: 'Q3 Financial Report',
            timestamp: '5 hours ago'
          },
          {
            id: 3,
            type: 'company',
            action: 'New company added',
            name: 'Tech Solutions Inc.',
            timestamp: '1 day ago'
          },
          {
            id: 4,
            type: 'user',
            action: 'Admin login',
            name: 'System Administrator',
            timestamp: '1 day ago'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getAvatarForActivityType = (type) => {
    switch (type) {
      case 'user':
        return <PeopleOutline />;
      case 'document':
        return <DescriptionOutlined />;
      case 'company':
        return <BusinessOutlined />;
      default:
        return <ArticleOutlined />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, mt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome, {user?.name || 'Administrator'}
        </Typography>
        
        <IconButton
          aria-label="more"
          id="dashboard-menu-button"
          aria-controls={open ? 'dashboard-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVert />
        </IconButton>
        
        <Menu
          id="dashboard-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'dashboard-menu-button',
          }}
        >
          <MenuItem onClick={handleClose}>View Profile</MenuItem>
          <MenuItem onClick={handleClose}>Settings</MenuItem>
          <MenuItem onClick={handleClose}>Reports</MenuItem>
        </Menu>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56, 
                margin: '0 auto 16px' 
              }}>
                <PeopleOutline fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.users}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ 
                bgcolor: 'success.main', 
                width: 56, 
                height: 56, 
                margin: '0 auto 16px' 
              }}>
                <DescriptionOutlined fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.documents}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar sx={{ 
                bgcolor: 'warning.main', 
                width: 56, 
                height: 56, 
                margin: '0 auto 16px' 
              }}>
                <BusinessOutlined fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.companies}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Companies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                Recent Activity
              </Typography>
              <Button size="small" variant="text">View All</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              {stats.recentActivity.map((activity) => (
                <ListItem key={activity.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getAvatarForActivityType(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.action}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.name}
                        </Typography>
                        {` — ${activity.timestamp}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<GroupAddOutlined />}
                fullWidth
                sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}
                onClick={handleOpenDialog}
              >
                Add New Accountant
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<BusinessOutlined />}
                fullWidth
                sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}
              >
                Register Company
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ArticleOutlined />}
                fullWidth
                sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}
              >
                Generate Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Accountant Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add New Accountant</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseOutlined />
            </IconButton>
          </Box>
        </DialogTitle>

        <Formik
          initialValues={{ name: '', email: '', password: '' }}
          validationSchema={Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
          })}
          onSubmit={handleCreateAccountant}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent sx={{ pb: 0 }}>
                <DialogContentText sx={{ mb: 2 }}>
                  Create a new accountant account. The user will be able to log in with these credentials.
                </DialogContentText>
                
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="name"
                  label="Full Name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="email"
                  label="Email Address"
                  type="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="password"
                  label="Password"
                  type="password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />
              </DialogContent>
              
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <PersonAdd />}
                >
                  Create Account
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard; 