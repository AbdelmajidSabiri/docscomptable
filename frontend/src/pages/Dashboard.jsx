import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Tabs,
  Tab,
  Button,
  Divider,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import useAuth from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Stats Card Component
const StatsCard = ({ title, value, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {loading ? (
        <LinearProgress sx={{ my: 2 }} />
      ) : (
        <Typography variant="h3" component="div">
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch notifications for all users
  const { 
    data: notificationsData, 
    loading: notificationsLoading, 
    error: notificationsError,
    refetch: refetchNotifications
  } = useFetch(`${API_URL}/notifications`);
  
  // Role-specific data fetching
  const {
    data: companiesData,
    loading: companiesLoading,
    error: companiesError,
    refetch: refetchCompanies
  } = useFetch(
    user?.user?.role === 'admin' || user?.user?.role === 'accountant' 
      ? `${API_URL}/companies` 
      : null
  );
  
  const {
    data: documentsData,
    loading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments
  } = useFetch(
    user?.user?.role === 'company' && user?.profile?.id
      ? `${API_URL}/documents/company/${user.profile.id}`
      : null
  );
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (!user) {
    return <LinearProgress />;
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header/Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {user.user.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.user.role === 'admin' && 'Manage your entire accounting system from here.'}
              {user.user.role === 'accountant' && 'Track your client companies and their documents.'}
              {user.user.role === 'company' && `Welcome to your ${user.profile.companyName} dashboard.`}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Main Dashboard Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Overview" />
                {user.user.role === 'admin' && <Tab label="Companies" />}
                {user.user.role === 'accountant' && <Tab label="My Companies" />}
                <Tab label="Documents" />
                <Tab label="Settings" />
              </Tabs>
            </Box>
            
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Dashboard Overview
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {/* Stats Cards */}
                  {user.user.role === 'admin' && (
                    <>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatsCard 
                          title="Companies" 
                          value={companiesData?.length || 0}
                          loading={companiesLoading}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatsCard 
                          title="Accountants" 
                          value={companiesData?.filter(c => c.status === 'active')?.length || 0}
                          loading={companiesLoading}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatsCard 
                          title="Documents" 
                          value="1,245"
                          loading={false}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatsCard 
                          title="Pending Approval" 
                          value={companiesData?.filter(c => c.status === 'pending')?.length || 0}
                          loading={companiesLoading}
                        />
                      </Grid>
                    </>
                  )}
                  
                  {user.user.role === 'accountant' && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatsCard 
                          title="My Companies" 
                          value={companiesData?.length || 0}
                          loading={companiesLoading}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatsCard 
                          title="Active Documents" 
                          value="156"
                          loading={false}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatsCard 
                          title="Pending Review" 
                          value="24"
                          loading={false}
                        />
                      </Grid>
                    </>
                  )}
                  
                  {user.user.role === 'company' && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatsCard 
                          title="Documents" 
                          value={documentsData?.length || 0}
                          loading={documentsLoading}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatsCard 
                          title="Processed" 
                          value={documentsData?.filter(d => d.status === 'processed')?.length || 0}
                          loading={documentsLoading}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatsCard 
                          title="Pending" 
                          value={documentsData?.filter(d => d.status === 'new')?.length || 0}
                          loading={documentsLoading}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
                
                {/* Recent Activity Section */}
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                
                {user.user.role === 'company' && documentsData && (
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Document Type</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {documentsData?.slice(0, 5).map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>{doc.documentType}</TableCell>
                            <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={doc.status} 
                                size="small"
                                color={
                                  doc.status === 'processed' ? 'success' :
                                  doc.status === 'new' ? 'warning' : 
                                  'default'
                                }
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                component={Link}
                                to={`/documents/${doc.id}`}
                                variant="outlined"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!documentsData?.length && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No documents found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                
                {(user.user.role === 'admin' || user.user.role === 'accountant') && companiesData && (
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Company</TableCell>
                          <TableCell>Tax ID</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companiesData?.slice(0, 5).map((company) => (
                          <TableRow key={company.id}>
                            <TableCell>{company.name}</TableCell>
                            <TableCell>{company.taxId}</TableCell>
                            <TableCell>
                              <Chip 
                                label={company.status} 
                                size="small"
                                color={
                                  company.status === 'active' ? 'success' :
                                  company.status === 'pending' ? 'warning' : 
                                  'default'
                                }
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                component={Link}
                                to={`/companies/${company.id}`}
                                variant="outlined"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!companiesData?.length && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No companies found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                
                {/* Quick Actions */}
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {user.user.role === 'company' && (
                    <Grid item>
                      <Button 
                        variant="contained" 
                        component={Link}
                        to="/documents/upload"
                      >
                        Upload Document
                      </Button>
                    </Grid>
                  )}
                  
                  {user.user.role === 'admin' && (
                    <>
                      <Grid item>
                        <Button 
                          variant="contained" 
                          component={Link}
                          to="/companies/new"
                        >
                          Add Company
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button 
                          variant="outlined" 
                          component={Link}
                          to="/admin/users"
                        >
                          Manage Users
                        </Button>
                      </Grid>
                    </>
                  )}
                  
                  {user.user.role === 'accountant' && (
                    <Grid item>
                      <Button 
                        variant="contained" 
                        component={Link}
                        to="/companies"
                      >
                        View All Companies
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
            
            {/* Companies Tab (Admin/Accountant) */}
            {activeTab === 1 && 
             (user.user.role === 'admin' || user.user.role === 'accountant') && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {user.user.role === 'admin' ? 'All Companies' : 'My Companies'}
                  </Typography>
                  
                  {user.user.role === 'admin' && (
                    <Button 
                      variant="contained" 
                      component={Link}
                      to="/companies/new"
                    >
                      Add Company
                    </Button>
                  )}
                </Box>
                
                {companiesLoading ? (
                  <LinearProgress />
                ) : companiesError ? (
                  <Typography color="error">
                    Error loading companies: {companiesError.message}
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Company Name</TableCell>
                          <TableCell>Tax ID</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companiesData?.map((company) => (
                          <TableRow key={company.id}>
                            <TableCell>{company.name}</TableCell>
                            <TableCell>{company.taxId}</TableCell>
                            <TableCell>
                              <Chip 
                                label={company.status} 
                                size="small"
                                color={
                                  company.status === 'active' ? 'success' :
                                  company.status === 'pending' ? 'warning' : 
                                  'default'
                                }
                              />
                            </TableCell>
                            <TableCell>{company.email}</TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                component={Link}
                                to={`/companies/${company.id}`}
                                sx={{ mr: 1 }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                component={Link}
                                to={`/documents/${company.id}`}
                                variant="outlined"
                              >
                                Documents
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!companiesData?.length && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No companies found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Documents Tab */}
            {(activeTab === 2 && (user.user.role === 'admin' || user.user.role === 'accountant')) || 
             (activeTab === 1 && user.user.role === 'company') && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Documents
                  </Typography>
                  
                  {user.user.role === 'company' && (
                    <Button 
                      variant="contained" 
                      component={Link}
                      to="/documents/upload"
                    >
                      Upload Document
                    </Button>
                  )}
                </Box>
                
                {user.user.role === 'company' ? (
                  documentsLoading ? (
                    <LinearProgress />
                  ) : documentsError ? (
                    <Typography color="error">
                      Error loading documents: {documentsError.message}
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Document Type</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Processed By</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {documentsData?.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>{doc.documentType}</TableCell>
                              <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={doc.status} 
                                  size="small"
                                  color={
                                    doc.status === 'processed' ? 'success' :
                                    doc.status === 'new' ? 'warning' : 
                                    'default'
                                  }
                                />
                              </TableCell>
                              <TableCell>{doc.processedBy || '-'}</TableCell>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  component={Link}
                                  to={`/documents/${doc.id}`}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {!documentsData?.length && (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                No documents found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
                ) : (
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Please select a company to view their documents
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Settings Tab */}
            {(activeTab === 3 && (user.user.role === 'admin' || user.user.role === 'accountant')) || 
             (activeTab === 2 && user.user.role === 'company') && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Profile Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {user.user.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user.user.email}
                      </Typography>
                    </Grid>
                    {user.user.role === 'company' && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Company Name
                          </Typography>
                          <Typography variant="body1">
                            {user.profile.companyName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Tax ID
                          </Typography>
                          <Typography variant="body1">
                            {user.profile.taxId}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        component={Link}
                        to="/profile"
                        sx={{ mt: 1 }}
                      >
                        Edit Profile
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Security
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/change-password"
                    sx={{ mt: 1 }}
                  >
                    Change Password
                  </Button>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Notifications */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            
            {notificationsLoading ? (
              <LinearProgress />
            ) : notificationsError ? (
              <Typography color="error">
                Error loading notifications
              </Typography>
            ) : (
              <List>
                {notificationsData?.length > 0 ? (
                  notificationsData.slice(0, 5).map(notification => (
                    <ListItem key={notification.id} divider>
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No notifications"
                    />
                  </ListItem>
                )}
              </List>
            )}
            
            {notificationsData?.length > 5 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  component={Link}
                  to="/notifications"
                  size="small"
                >
                  View All Notifications
                </Button>
              </Box>
            )}
          </Paper>
          
          {/* Help Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Need Help?
            </Typography>
            
            <Typography variant="body2" paragraph>
              If you have any questions or need assistance, our support team is here to help.
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>Email:</strong> support@docscompta.com<br />
              <strong>Phone:</strong> +1 (555) 123-4567<br />
              <strong>Hours:</strong> Monday - Friday, 9am - 5pm
            </Typography>
            
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/help"
              sx={{ mt: 1 }}
            >
              Visit Help Center
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;