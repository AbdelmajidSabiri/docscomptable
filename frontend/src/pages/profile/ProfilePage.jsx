import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Divider, 
  Alert, 
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ProfilePage = () => {
  const { user, token, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // State for profile data
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    taxId: ''
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // State for delete account dialog
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Fetch user profile and accountant details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // First get the user profile
        const profileResponse = await axios.get(`${API_URL}/auth/profile`, config);
        const userProfile = profileResponse.data;
        
        if (userProfile.user.role === 'accountant' && userProfile.profile) {
          // If user is an accountant, get their accountant details
          const accountantResponse = await axios.get(
            `${API_URL}/accountants/${userProfile.profile.id}`,
            config
          );
          
          setProfileData({
            user: userProfile.user,
            profile: accountantResponse.data.accountant
          });
          
          // Update form data with accountant details
          setFormData({
            name: userProfile.user.name || '',
            email: userProfile.user.email || '',
            phone: accountantResponse.data.accountant.phone || '',
            address: accountantResponse.data.accountant.address || '',
            company: '',
            taxId: ''
          });
        } else {
          // For other roles, just use the profile data
          setProfileData(userProfile);
          
          // Update form data with profile details
          setFormData({
            name: userProfile.user.name || '',
            email: userProfile.user.email || '',
            phone: userProfile.profile?.phone || '',
            address: userProfile.profile?.address || '',
            company: userProfile.user.role === 'company' ? userProfile.profile?.companyName || '' : '',
            taxId: userProfile.user.role === 'company' ? userProfile.profile?.taxId || '' : ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle profile form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Handle profile update submission
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      if (user.role === 'accountant') {
        // Update accountant profile
        await axios.put(
          `${API_URL}/accountants/${profileData.profile.id}`,
          {
            name: formData.name,
            phone: formData.phone,
            address: formData.address
          },
          config
        );
      } else {
        // Update user profile
        await axios.put(
          `${API_URL}/auth/profile`,
          formData,
          config
        );
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle password change submission
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        config
      );
      
      setSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle delete account confirmation
  const handleDeleteAccount = () => {
    setDeleteDialog(true);
  };
  
  // Handle confirm delete account
  const confirmDeleteAccount = async () => {
    setSubmitting(true);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`${API_URL}/auth/account`, config);
      setDeleteDialog(false);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setSubmitting(false);
      setDeleteDialog(false);
    }
  };
  
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          You must be logged in to view this page.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button fullWidth variant="contained" onClick={() => navigate('/login')}>
            Login
          </Button>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: 0, bgcolor: '#f6f7ed', p: 4 }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                {profileData?.user?.name?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Your Profile
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your account settings and preferences
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Profile Information" />
              <Tab label="Security" />
              <Tab label="Preferences" />
            </Tabs>
          </Paper>
          
          {/* Tab Panels */}
          <Box>
            {/* Profile Information Tab */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    {success && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Profile updated successfully!
                      </Alert>
                    )}
                    
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    )}
                    
                    <Box component="form" onSubmit={handleProfileUpdate}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled
                            helperText="Email cannot be changed"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        
                        {user.user.role === 'company' && (
                          <>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Company Name"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                required
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Tax ID / Registration Number"
                                name="taxId"
                                value={formData.taxId}
                                onChange={handleInputChange}
                                required
                              />
                            </Grid>
                          </>
                        )}
                        
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={submitting}
                            >
                              {submitting ? <CircularProgress size={24} /> : 'Update Profile'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Account Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Account Type
                        </Typography>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                          {user.user.role}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body1">
                          {user.user.created_at ? new Date(user.user.created_at).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                      
                      {user.user.role === 'accountant' && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Managed Companies
                          </Typography>
                          <Typography variant="body1">
                            {user.profile?.companies_count || 0} companies
                          </Typography>
                        </Box>
                      )}
                      
                      {user.user.role === 'company' && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Assigned Accountant
                          </Typography>
                          <Typography variant="body1">
                            {user.profile?.accountant_name || 'Not assigned'}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Security Tab */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Change Password
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    {success && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Password changed successfully!
                      </Alert>
                    )}
                    
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    )}
                    
                    <Box component="form" onSubmit={handlePasswordUpdate}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                            helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Passwords do not match' : ''}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={submitting}
                            >
                              {submitting ? <CircularProgress size={24} /> : 'Change Password'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                  
                  <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Delete Account
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Two-Factor Authentication
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        fullWidth
                      >
                        Enable 2FA
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Login History
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        Recent logins:
                      </Typography>
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Today, 10:30 AM - Paris, France
                        </Typography>
                        <Typography variant="body2">
                          Yesterday, 8:15 PM - Paris, France
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="text"
                        sx={{ mt: 2 }}
                        fullWidth
                      >
                        View Full History
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Preferences Tab */}
            {tabValue === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Notification Preferences
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Email Notifications
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          Document status updates
                        </Typography>
                        <Button variant="outlined" size="small">
                          Enabled
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          New document uploads
                        </Typography>
                        <Button variant="outlined" size="small">
                          Enabled
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          Account activity alerts
                        </Typography>
                        <Button variant="outlined" size="small">
                          Enabled
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                          Marketing and newsletters
                        </Typography>
                        <Button variant="outlined" color="error" size="small">
                          Disabled
                        </Button>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        In-App Notifications
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          Document status updates
                        </Typography>
                        <Button variant="outlined" size="small">
                          Enabled
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          New document uploads
                        </Typography>
                        <Button variant="outlined" size="small">
                          Enabled
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                          System notifications
                        </Typography>
                        <Button variant="outlined" size="small">
                          Enabled
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Interface Settings
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          Dark Mode
                        </Typography>
                        <Button variant="outlined" color="error" size="small">
                          Off
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          Compact View
                        </Typography>
                        <Button variant="outlined" color="error" size="small">
                          Off
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                          Show Tooltips
                        </Typography>
                        <Button variant="outlined" size="small">
                          On
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Language & Region
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          Language
                        </Typography>
                        <Button variant="outlined" size="small">
                          English
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1">
                          Date Format
                        </Typography>
                        <Button variant="outlined" size="small">
                          DD/MM/YYYY
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">
                          Currency
                        </Typography>
                        <Button variant="outlined" size="small">
                          EUR (€)
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
          
          {/* Delete Account Confirmation Dialog */}
          <Dialog
            open={deleteDialog}
            onClose={() => setDeleteDialog(false)}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title" color="error">
              Delete Your Account?
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                This action will permanently delete your account and all associated data. This cannot be undone. Please confirm that you want to proceed.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={confirmDeleteAccount} color="error" autoFocus>
                {submitting ? <CircularProgress size={24} /> : 'Delete Permanently'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default ProfilePage;