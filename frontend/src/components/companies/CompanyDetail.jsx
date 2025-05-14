import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CompanyDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  // Fetch company data
  const {
    data: company,
    loading: companyLoading,
    error: companyError
  } = useFetch(`${API_URL}/companies/${id}`);
  
  // Fetch company documents
  const {
    data: documents,
    loading: documentsLoading,
    error: documentsError
  } = useFetch(`${API_URL}/documents/company/${id}`);
  
  // Fetch company accountant (if applicable)
  const {
    data: accountant,
    loading: accountantLoading,
    error: accountantError
  } = useFetch(company?.accountant_id ? `${API_URL}/accountants/${company.accountant_id}` : null);
  
  // Recent activity - simplified for demo
  const recentActivity = [
    { id: 1, type: 'Document Uploaded', description: 'Invoice #2023-056 uploaded', date: '2025-05-10' },
    { id: 2, type: 'Document Processed', description: 'Receipt #R789 marked as processed', date: '2025-05-08' },
    { id: 3, type: 'Profile Updated', description: 'Company details updated', date: '2025-05-05' }
  ];
  
  // Stats for the dashboard
  const getStats = () => {
    if (!documents) return { total: 0, processed: 0, pending: 0, rejected: 0 };
    
    return {
      total: documents.length,
      processed: documents.filter(doc => doc.status === 'processed').length,
      pending: documents.filter(doc => doc.status === 'new').length,
      rejected: documents.filter(doc => doc.status === 'rejected').length
    };
  };
  
  const stats = getStats();
  
  // Check if user has permission to view/edit company
  const canEdit = user && (
    user.user.role === 'admin' || 
    (user.user.role === 'accountant' && company?.accountant_id === user.profile?.id)
  );
  
  if (companyLoading) {
    return <LinearProgress />;
  }
  
  if (companyError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {companyError.message || 'Error loading company data'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/companies" variant="outlined">
            Back to Companies
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!company) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Company not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/companies" variant="outlined">
            Back to Companies
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {company.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.secondary">
                {company.taxId}
              </Typography>
              <Chip
                label={company.status}
                size="small"
                color={
                  company.status === 'active' ? 'success' :
                  company.status === 'pending' ? 'warning' :
                  'error'
                }
              />
            </Box>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              component={Link}
              to="/companies"
              sx={{ mr: 2 }}
            >
              Back to Companies
            </Button>
            
            {canEdit && (
              <Button
                variant="contained"
                component={Link}
                to={`/companies/edit/${id}`}
              >
                Edit Company
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Company Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Company Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Legal Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.name}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Tax ID / Registration Number
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.taxId}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Registration Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.registration_date ? new Date(company.registration_date).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.email}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Contact Phone
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.phone || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {company.address || 'N/A'}
                </Typography>
              </Grid>
              
              {accountant && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assigned Accountant
                    </Typography>
                    <Typography variant="body1">
                      {accountant.name} ({accountant.email})
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          {/* Document Stats */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Documents
                    </Typography>
                    <Typography variant="h4">
                      {stats.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Processed
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.processed}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {stats.pending}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Rejected
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {stats.rejected}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                component={Link}
                to={`/documents/${company.id}`}
              >
                View All Documents
              </Button>
            </Box>
          </Paper>
          
          {/* Recent Documents */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {documentsLoading ? (
              <LinearProgress />
            ) : documentsError ? (
              <Alert severity="error">
                Error loading documents
              </Alert>
            ) : documents && documents.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Document Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.slice(0, 5).map((doc) => (
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
                            size="small"
                            component={Link}
                            to={`/documents/view/${doc.id}`}
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
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No documents found for this company
                </Typography>
                {canEdit && (
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/documents/upload/${company.id}`}
                    sx={{ mt: 2 }}
                  >
                    Upload First Document
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to={`/documents/upload/${company.id}`}
                  disabled={!canEdit}
                >
                  Upload Document
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to={`/documents/${company.id}`}
                >
                  View All Documents
                </Button>
              </Grid>
              
              {user.user.role === 'admin' && (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={Link}
                    to={`/companies/assign/${company.id}`}
                  >
                    Assign Accountant
                  </Button>
                </Grid>
              )}
              
              {canEdit && (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={Link}
                    to={`/companies/edit/${company.id}`}
                  >
                    Edit Company Details
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          {/* Recent Activity */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentActivity.length > 0 ? (
              <Box>
                {recentActivity.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle2">
                      {activity.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(activity.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No recent activity
              </Typography>
            )}
          </Paper>
          
          {/* Company Status */}
          {user.user.role === 'admin' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Company Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Status
                </Typography>
                <Chip
                  label={company.status}
                  color={
                    company.status === 'active' ? 'success' :
                    company.status === 'pending' ? 'warning' :
                    'error'
                  }
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Member Since
                </Typography>
                <Typography variant="body2">
                  {new Date(company.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {new Date(company.updated_at).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color={company.status === 'active' ? 'error' : 'success'}
                  // This would typically have a confirmation modal in a real app
                  onClick={() => alert('Status change functionality would be implemented here')}
                >
                  {company.status === 'active' ? 'Deactivate Company' : 'Activate Company'}
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompanyDetailPage;