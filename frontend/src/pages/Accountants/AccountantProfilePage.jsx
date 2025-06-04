import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container, Paper, Typography, Box, Avatar, Button, Divider, Grid, Chip, CircularProgress, Alert,
  Card, CardContent, Stack, IconButton, Tooltip
} from '@mui/material';
import { 
  Business, 
  DescriptionOutlined, 
  Edit, 
  Email, 
  Phone, 
  LocationOn, 
  CalendarToday,
  LinkedIn,
  Twitter,
  Language
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AccountantProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [accountant, setAccountant] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // First get the user's profile to check permissions
        const profileResponse = await axios.get(`${API_URL}/auth/profile`, config);
        const userProfile = profileResponse.data;

        // Check if user has permission to view this profile
        if (userProfile.user.role === 'accountant') {
          // If user is an accountant, they can only view their own profile
          if (userProfile.profile && userProfile.profile.id !== parseInt(id)) {
            setError('You do not have permission to view this profile');
            setLoading(false);
            return;
          }
        } else if (userProfile.user.role !== 'admin') {
          // Only admins can view other accountant profiles
          setError('You do not have permission to view this profile');
          setLoading(false);
          return;
        }

        // If we have permission, fetch the accountant profile
        const accRes = await axios.get(`${API_URL}/accountants/${id}`, config);
        setAccountant(accRes.data.accountant || accRes.data);
        setCompanies(accRes.data.companies || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [id, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !accountant) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Accountant not found'}
          </Alert>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  const initials = accountant.name ? accountant.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      {/* Header Section */}
      <Paper 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: '#f6f7ed',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              fontSize: 40, 
              bgcolor: '#222',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#222' }}>{accountant.name}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>{accountant.email}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={accountant.status} 
                color={accountant.status === 'active' ? 'success' : 'error'} 
                size="small" 
                sx={{ 
                  borderRadius: 1,
                  fontWeight: 500,
                  bgcolor: accountant.status === 'active' ? 'rgba(56, 142, 60, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                  color: accountant.status === 'active' ? '#388e3c' : '#d32f2f'
                }} 
              />
              <Chip 
                label={accountant.role || 'Accountant'} 
                variant="outlined" 
                size="small" 
                sx={{ 
                  borderRadius: 1,
                  fontWeight: 500,
                  borderColor: '#222',
                  color: '#222'
                }} 
              />
            </Stack>
          </Box>
          {(user.role === 'admin' || (user.role === 'accountant' && user.id === accountant.user_id)) && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/accountants/edit/${id}`)}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 500,
                px: 3,
                py: 1,
                bgcolor: '#222',
                '&:hover': {
                  bgcolor: '#000'
                }
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            bgcolor: 'white',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#222' }}>Contact Information</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#222', fontSize: 20 }} />
                  <Typography variant="body1">{accountant.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ color: '#222', fontSize: 20 }} />
                  <Typography variant="body1">{accountant.phone || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn sx={{ color: '#222', fontSize: 20 }} />
                  <Typography variant="body1">{accountant.address || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarToday sx={{ color: '#222', fontSize: 20 }} />
                  <Typography variant="body1">
                    Joined {new Date(accountant.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            bgcolor: 'white',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#222' }}>Statistics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: '#f6f7ed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Business sx={{ color: '#222', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>{companies.length}</Typography>
                      <Typography variant="body2" color="text.secondary">Companies Managed</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: '#f6f7ed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <DescriptionOutlined sx={{ color: '#222', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#222' }}>128</Typography>
                      <Typography variant="body2" color="text.secondary">Documents Processed</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Companies Section */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            bgcolor: 'white'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#222' }}>Companies Managed</Typography>
              {companies.length === 0 ? (
                <Typography color="text.secondary">No companies assigned.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {companies.map(company => (
                    <Grid item xs={12} sm={6} md={4} key={company.id}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s',
                          bgcolor: '#f6f7ed',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            bgcolor: '#fff'
                          }
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#222' }}>{company.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{company.siret}</Typography>
                        <Typography variant="body2" color="text.secondary">{company.contact_email}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccountantProfilePage; 