import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AccountantDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: '',
    content: ''
  });
  
  // Fetch accountant data
  const {
    data: accountant,
    loading: accountantLoading,
    error: accountantError,
    refetch: refetchAccountant
  } = useFetch(`${API_URL}/accountants/${id}`);
  
  // Fetch companies managed by this accountant
  const {
    data: companies,
    loading: companiesLoading,
    error: companiesError,
    refetch: refetchCompanies
  } = useFetch(`${API_URL}/companies?accountant=${id}`);
  
  // Check if user is authorized to view this page
  const isAuthorized = user && (
    user.user.role === 'admin' || 
    (user.user.role === 'accountant' && user.user.id === parseInt(id))
  );
  
  // Action handlers
  const handleDeactivate = () => {
    setConfirmDialog({
      open: true,
      action: 'deactivate',
      title: `Deactivate ${accountant.name}`,
      content: 'Are you sure you want to deactivate this accountant? They will not be able to log in or access any data. This action can be reversed.'
    });
  };
  
  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      action: 'delete',
      title: `Delete ${accountant.name}`,
      content: 'Are you sure you want to permanently delete this accountant? This action cannot be undone and will affect all associated companies.'
    });
  };
  
  const handleConfirmAction = async () => {
    // Here you would implement the actual API calls
    // For now, just close the dialog
    
    // Mock implementation - would be replaced with actual API call
    if (confirmDialog.action === 'deactivate') {
      console.log('Deactivating accountant:', id);
      // await accountantService.update(id, { status: 'inactive' });
      // refetchAccountant();
    } else if (confirmDialog.action === 'delete') {
      console.log('Deleting accountant:', id);
      // await accountantService.delete(id);
      // navigate('/accountants');
    }
    
    setConfirmDialog({ ...confirmDialog, open: false });
  };
  
  const handleCloseDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };
  
  // If user is not authorized
  if (!isAuthorized) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          You do not have permission to view this page.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/" variant="outlined">
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (accountantLoading) {
    return <LinearProgress />;
  }
  
  if (accountantError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {accountantError.message || 'Error loading accountant data'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/accountants" variant="outlined">
            Back to Accountants
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!accountant) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Accountant not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button component={Link} to="/accountants" variant="outlined">
            Back to Accountants
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
              {accountant.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.secondary">
                {accountant.email}
              </Typography>
              <Chip
                label={accountant.status}
                size="small"
                color={accountant.status === 'active' ? 'success' : 'error'}
              />
            </Box>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              component={Link}
              to="/accountants"
              sx={{ mr: 2 }}
            >
              Back to Accountants
            </Button>
            
            {user.user.role === 'admin' && (
              <Button
                variant="contained"
                component={Link}
                to={`/accountants/edit/${id}`}
              >
                Edit Accountant
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Accountant Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Accountant Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {accountant.name}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {accountant.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {accountant.phone || 'N/A'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Registration Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {accountant.created_at ? new Date(accountant.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Managed Companies */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Managed Companies
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {companiesLoading ? (
              <LinearProgress />
            ) : companiesError ? (
              <Alert severity="error">
                Error loading companies data
              </Alert>
            ) : companies && companies.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Tax ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.map((company) => (
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
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            component={Link}
                            to={`/companies/${company.id}`}
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
                  This accountant has no companies assigned.
                </Typography>
                {user.user.role === 'admin' && (
                  <Button
                    component={Link}
                    to="/companies/new"
                    variant="contained"
                    sx={{ mt: 2 }}
                  >
                    Assign Company
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Stats */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Stats
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {companies?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Companies
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {/* Total document count would come from API */}
                      128
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Documents
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {/* Active count would come from API */}
                      98
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {/* Pending count would come from API */}
                      30
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Actions */}
          {user.user.role === 'admin' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={Link}
                    to={`/accountants/edit/${id}`}
                  >
                    Edit Profile
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={Link}
                    to={`/companies/new?accountant=${id}`}
                  >
                    Add Company
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color={accountant.status === 'active' ? 'error' : 'success'}
                    onClick={handleDeactivate}
                  >
                    {accountant.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                  >
                    Delete Account
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="error" 
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountantDetailPage;