import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

import {
  Description,
  Upload,
  Visibility,
  MoreVert,
  Search,
  Notifications,
  Person,
  Settings,
  Dashboard,
  AssignmentTurnedIn,
  CloudUpload,
  HourglassEmpty,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const UserDashboard = () => {
  const { user, logout, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({ new: 0, processed: 0, rejected: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    document_type: 'invoice',
    operation_type: 'purchase',
    vendor_client: '',
    document_date: new Date().toISOString().split('T')[0],
    reference: '',
    amount: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Fetch user documents
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch user profile to get company ID
        const userProfile = await axios.get(`${API_URL}/auth/profile`, config);
        if (userProfile.data && userProfile.data.user) {
          const userId = userProfile.data.user.id;
          
          // Fetch user's company
          const companyResponse = await axios.get(`${API_URL}/companies`, config);
          
          if (companyResponse.data && companyResponse.data.length > 0) {
            const companyId = companyResponse.data[0].id;
            
            // Fetch documents for the company
            const documentsResponse = await axios.get(
              `${API_URL}/documents/company/${companyId}`,
              config
            );
            
            setDocuments(documentsResponse.data || []);
            
            // Calculate stats
            const newStats = documentsResponse.data.reduce((acc, doc) => {
              acc[doc.status] = (acc[doc.status] || 0) + 1;
              return acc;
            }, {});
            
            setStats({
              new: newStats.new || 0,
              processed: newStats.processed || 0,
              rejected: newStats.rejected || 0
            });
            
            // Generate mock recent activity for now
            setRecentActivity([
              {
                id: 1,
                type: 'document_upload',
                message: 'You uploaded a new invoice',
                date: new Date(Date.now() - 1000 * 60 * 60).toISOString()
              },
              {
                id: 2,
                type: 'document_processed',
                message: 'Your document was processed by your accountant',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
              },
              {
                id: 3,
                type: 'document_rejected',
                message: 'A document was rejected - additional information needed',
                date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Handle uploading a new document
  const handleUploadDocument = async () => {
    try {
      setUploading(true);
      setUploadError('');
      
      if (!uploadData.file) {
        setUploadError('Please select a file');
        setUploading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('document', uploadData.file);
      formData.append('document_type', uploadData.document_type);
      formData.append('operation_type', uploadData.operation_type);
      formData.append('vendor_client', uploadData.vendor_client);
      formData.append('document_date', uploadData.document_date);
      formData.append('reference', uploadData.reference);
      formData.append('amount', uploadData.amount);
      
      // Here we would normally append the company_id
      // For this demo, we'll just log it
      console.log('Would upload document with data:', uploadData);
      
      // Mock successful upload
      setTimeout(() => {
        const newDoc = {
          id: documents.length + 1,
          file_name: uploadData.file.name,
          document_type: uploadData.document_type,
          operation_type: uploadData.operation_type,
          vendor_client: uploadData.vendor_client,
          document_date: uploadData.document_date,
          reference: uploadData.reference,
          amount: uploadData.amount,
          upload_date: new Date().toISOString(),
          status: 'new'
        };
        
        setDocuments([newDoc, ...documents]);
        setStats({...stats, new: stats.new + 1});
        setUploadDialogOpen(false);
        setUploading(false);
        
        // Reset form
        setUploadData({
          document_type: 'invoice',
          operation_type: 'purchase',
          vendor_client: '',
          document_date: new Date().toISOString().split('T')[0],
          reference: '',
          amount: '',
          file: null
        });
      }, 1500);
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadError(error.response?.data?.message || 'Error uploading document');
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadData({...uploadData, file: event.target.files[0]});
    }
  };

  // Filter documents based on search term and status filter
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vendor_client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Format date helper
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'info';
      case 'processed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <HourglassEmpty />;
      case 'processed': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      default: return <Description />;
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left side navigation */}
      <Box
        component="nav"
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: 'background.paper',
          height: '100vh',
          borderRight: 1,
          borderColor: 'divider',
          position: 'fixed',
          py: 2,
          display: { xs: 'none', sm: 'block' }
        }}
      >
        <Box sx={{ px: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>DocsCompta</Typography>
          <Typography variant="body2" color="text.secondary">Document Management</Typography>
        </Box>
        
        <List component="nav">
          <ListItem button selected>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem button>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText primary="Documents" />
          </ListItem>
          
          <ListItem button>
            <ListItemIcon>
              <Upload />
            </ListItemIcon>
            <ListItemText primary="Upload" />
          </ListItem>
          
          <Divider sx={{ my: 2 }} />
          
          <ListItem button>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          
          <ListItem button onClick={logout}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: '240px' },
          bgcolor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Welcome, {user?.name || 'User'}
          </Typography>
          
          <Box>
            <IconButton>
              <Notifications />
            </IconButton>
            <IconButton>
              <Person />
            </IconButton>
          </Box>
        </Box>
        
        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">New Documents</Typography>
                    <Typography variant="h4">{stats.new}</Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'info.light', 
                    p: 1, 
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <HourglassEmpty sx={{ color: 'info.main' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Processed Documents</Typography>
                    <Typography variant="h4">{stats.processed}</Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'success.light', 
                    p: 1, 
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <AssignmentTurnedIn sx={{ color: 'success.main' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Rejected Documents</Typography>
                    <Typography variant="h4">{stats.rejected}</Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'error.light', 
                    p: 1, 
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Cancel sx={{ color: 'error.main' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Documents & Activity */}
        <Grid container spacing={3}>
          {/* Documents */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Documents</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload Document
                  </Button>
                </Box>
                
                <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="processed">Processed</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Document</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                          <TableRow key={doc.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Description sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {doc.file_name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{doc.document_type}</TableCell>
                            <TableCell>{formatDate(doc.document_date || doc.upload_date)}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={doc.status}
                                color={getStatusColor(doc.status)}
                                icon={getStatusIcon(doc.status)}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small">
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton size="small">
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No documents found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                
                <List>
                  {recentActivity.map((activity) => (
                    <ListItem key={activity.id} divider>
                      <ListItemText
                        primary={activity.message}
                        secondary={formatDate(activity.date)}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ 
                          variant: 'caption',
                          color: 'text.secondary'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Upload document dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          {uploadError && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {uploadError}
            </Typography>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={uploadData.document_type}
                  label="Document Type"
                  onChange={(e) => setUploadData({...uploadData, document_type: e.target.value})}
                >
                  <MenuItem value="invoice">Invoice</MenuItem>
                  <MenuItem value="receipt">Receipt</MenuItem>
                  <MenuItem value="delivery_note">Delivery Note</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Operation Type</InputLabel>
                <Select
                  value={uploadData.operation_type}
                  label="Operation Type"
                  onChange={(e) => setUploadData({...uploadData, operation_type: e.target.value})}
                >
                  <MenuItem value="purchase">Purchase</MenuItem>
                  <MenuItem value="sale">Sale</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="dense"
                label="Vendor/Client"
                value={uploadData.vendor_client}
                onChange={(e) => setUploadData({...uploadData, vendor_client: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Document Date"
                type="date"
                value={uploadData.document_date}
                onChange={(e) => setUploadData({...uploadData, document_date: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Reference"
                value={uploadData.reference}
                onChange={(e) => setUploadData({...uploadData, reference: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Amount"
                type="number"
                value={uploadData.amount}
                onChange={(e) => setUploadData({...uploadData, amount: e.target.value})}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
                sx={{ mt: 1 }}
              >
                {uploadData.file ? uploadData.file.name : 'Upload File'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUploadDocument}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard; 