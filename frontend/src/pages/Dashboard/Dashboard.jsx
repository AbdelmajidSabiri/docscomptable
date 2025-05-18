import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';
import StatCard from '../../components/common/StatCard';
import ActivityItem from '../../components/common/ActivityItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Fetch data based on user role
  const {
    data: dashboardData,
    loading: dataLoading,
    error: dataError
  } = useFetch(user ? `${API_URL}/stats/${user.user.role === 'admin' ? 'overview' : user.user.role + '/' + user.profile?.id}` : null);
  
  // Fetch recent documents
  const {
    data: recentDocuments,
    loading: documentsLoading,
    error: documentsError
  } = useFetch(user && user.user.role !== 'admin' ? `${API_URL}/documents/recent?limit=5` : null);
  
  // Fetch notifications
  const {
    data: notifications,
    loading: notificationsLoading,
    error: notificationsError
  } = useFetch(user ? `${API_URL}/notifications` : null);
  
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Please log in to view the dashboard.
        </Alert>
      </Container>
    );
  }
  
  if (dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (dataError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {dataError.message || 'Failed to load dashboard data'}
        </Alert>
      </Container>
    );
  }
  
  // Render dashboard based on user role
  if (user.user.role === 'admin') {
    return <AdminDashboard data={dashboardData} notifications={notifications} />;
  } else if (user.user.role === 'accountant') {
    return <AccountantDashboard 
      data={dashboardData} 
      documents={recentDocuments} 
      notifications={notifications}
      documentsLoading={documentsLoading}
    />;
  } else {
    return <CompanyDashboard 
      data={dashboardData} 
      documents={recentDocuments} 
      notifications={notifications}
      documentsLoading={documentsLoading}
    />;
  }
};

const AdminDashboard = ({ data, notifications }) => {
  // Mock recent activity data (would come from API in production)
  const recentActivity = [
    { 
      action: 'New Company Registration', 
      details: 'TechStart Inc. registered by John Smith', 
      date: '1 hour ago',
      icon: '🏢',
      color: 'primary'
    },
    { 
      action: 'Document Processed', 
      details: 'Invoice #2023-056 processed by Jane Doe', 
      date: '3 hours ago',
      icon: '✓',
      color: 'success'
    },
    { 
      action: 'Account Activated', 
      details: 'Acme Corp account activated', 
      date: '5 hours ago',
      icon: '✅',
      color: 'info'
    },
    { 
      action: 'New Accountant', 
      details: 'Robert Johnson joined as accountant', 
      date: 'Yesterday',
      icon: '👤',
      color: 'secondary'
    }
  ];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          System overview and statistics
        </Typography>
      </Box>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="👥" 
            value={data?.users?.total || 0} 
            title="Total Users" 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="👨‍💼" 
            value={data?.accountants?.total || 0} 
            title="Accountants" 
            color="secondary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="🏢" 
            value={data?.companies?.total || 0} 
            title="Companies" 
            color="info" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="📄" 
            value={data?.documents?.total || 0} 
            title="Documents" 
            color="success" 
          />
        </Grid>
      </Grid>
      
      {/* Second row - detailed stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Companies by Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Companies by Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {data?.companies?.byStatus?.active || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {data?.companies?.byStatus?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {data?.companies?.byStatus?.inactive || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inactive
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                component={Link}
                to="/companies"
                size="small"
                sx={{ mt: 1 }}
              >
                View All Companies
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Documents by Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Documents by Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {data?.documents?.byStatus?.processed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {data?.documents?.byStatus?.new || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {data?.documents?.byStatus?.rejected || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                component={Link}
                to="/documents"
                size="small"
                sx={{ mt: 1 }}
              >
                Browse Documents
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Users by Role */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Users by Role
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {data?.users?.byRole?.admin || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admin
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main">
                    {data?.users?.byRole?.accountant || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accountant
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {data?.users?.byRole?.company || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Company
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                component={Link}
                to="/users"
                size="small"
                sx={{ mt: 1 }}
              >
                Manage Users
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Third row - Activity and Tasks */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentActivity.map((activity, index) => (
              <ActivityItem
                key={index}
                action={activity.action}
                details={activity.details}
                date={activity.date}
                icon={activity.icon}
                color={activity.color}
              />
            ))}
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                component={Link}
                to="/activity"
                size="small"
              >
                View All Activity
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Pending Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Approvals
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.companies?.byStatus?.pending > 0 ? (
                    // Mock pending companies data (would come from API)
                    [
                      { id: 101, name: 'TechStart Inc.', date: '2023-05-15' },
                      { id: 102, name: 'Global Enterprises', date: '2023-05-14' }
                    ].map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <Chip label="Company" size="small" color="primary" />
                        </TableCell>
                        <TableCell>{company.name}</TableCell>
                        <TableCell>{new Date(company.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            to={`/companies/${company.id}`}
                            size="small"
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No pending approvals
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const AccountantDashboard = ({ data, documents, notifications, documentsLoading }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Accountant Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your clients and documents overview
        </Typography>
      </Box>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="🏢" 
            value={data?.companies?.total || 0} 
            title="Your Clients" 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="📄" 
            value={data?.documents?.total || 0} 
            title="Total Documents" 
            color="info" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="✅" 
            value={data?.documents?.byStatus?.processed || 0} 
            title="Processed" 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="⏳" 
            value={data?.documents?.byStatus?.new || 0} 
            title="Pending" 
            color="warning" 
          />
        </Grid>
      </Grid>
      
      {/* Second row - Client Management and Documents */}
      <Grid container spacing={3}>
        {/* Client Companies */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Clients
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Mock client companies data (would come from API) */}
                  {[
                    { id: 1, name: 'Acme Corporation', status: 'active' },
                    { id: 2, name: 'TechStart Inc.', status: 'pending' },
                    { id: 3, name: 'Global Enterprises', status: 'active' }
                  ].map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={company.status}
                          size="small"
                          color={
                            company.status === 'active' ? 'success' :
                            company.status === 'pending' ? 'warning' :
                            'error'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          component={Link}
                          to={`/companies/${company.id}`}
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                component={Link}
                to="/companies"
                size="small"
              >
                View All Clients
              </Button>
            </Box>
          </Paper>
          
          {/* Notifications */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {notifications?.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <Box
                  key={notification.id}
                  sx={{
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ mr: 1, fontSize: '1.2rem' }}>🔔</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No new notifications
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Documents */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {documentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : documents?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Document</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.document_type}</TableCell>
                        <TableCell>{doc.company_name}</TableCell>
                        <TableCell>{new Date(doc.document_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={doc.status}
                            size="small"
                            color={
                              doc.status === 'processed' ? 'success' :
                              doc.status === 'new' ? 'warning' :
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            to={`/documents/view/${doc.id}`}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                          {doc.status === 'new' && (
                            <Button
                              component={Link}
                              to={`/documents/process/${doc.id}`}
                              size="small"
                              variant="outlined"
                              color="primary"
                            >
                              Process
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                No documents found
              </Typography>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                component={Link}
                to="/documents"
                size="small"
              >
                View All Documents
              </Button>
              
              <Button
                component={Link}
                to="/documents/upload"
                size="small"
                variant="contained"
              >
                Upload Document
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const CompanyDashboard = ({ data, documents, notifications, documentsLoading }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Company Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your documents and accounting overview
        </Typography>
      </Box>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="📄" 
            value={data?.documents?.total || 0} 
            title="Total Documents" 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="✅" 
            value={data?.documents?.byStatus?.processed || 0} 
            title="Processed" 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="⏳" 
            value={data?.documents?.byStatus?.new || 0} 
            title="Pending" 
            color="warning" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon="❌" 
            value={data?.documents?.byStatus?.rejected || 0} 
            title="Rejected" 
            color="error" 
          />
        </Grid>
      </Grid>
      
      {/* Second row - Documents and Account */}
      <Grid container spacing={3}>
        {/* Recent Documents */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {documentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : documents?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Document Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.document_type}</TableCell>
                        <TableCell>{new Date(doc.document_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={doc.status}
                            size="small"
                            color={
                              doc.status === 'processed' ? 'success' :
                              doc.status === 'new' ? 'warning' :
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            to={`/documents/view/${doc.id}`}
                            size="small"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You haven't uploaded any documents yet
                </Typography>
                <Button
                  component={Link}
                  to="/documents/upload"
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Upload Your First Document
                </Button>
              </Box>
            )}
            
            {documents?.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  component={Link}
                  to="/documents"
                  size="small"
                >
                  View All Documents
                </Button>
                
                <Button
                  component={Link}
                  to="/documents/upload"
                  size="small"
                  variant="contained"
                >
                  Upload Document
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Account Overview and Notifications */}
        <Grid item xs={12} md={4}>
          {/* Account Overview */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Your Accountant
              </Typography>
              <Typography variant="body1">
                Jane Doe
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Account Status
              </Typography>
              <Chip
                label="Active"
                color="success"
                size="small"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Document Upload
              </Typography>
              <Typography variant="body1">
                {documents && documents.length > 0
                  ? new Date(documents[0].upload_date).toLocaleDateString()
                  : 'Never'
                }
              </Typography>
            </Box>
            
            <Button
              component={Link}
              to="/profile"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            >
              View Profile
            </Button>
          </Paper>
          
          {/* Notifications */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {notifications?.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <Box
                  key={notification.id}
                  sx={{
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ mr: 1, fontSize: '1.2rem' }}>🔔</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No new notifications
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;