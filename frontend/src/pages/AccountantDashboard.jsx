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
  InputLabel,
  Tooltip,
  Avatar,
  Badge
} from '@mui/material';
import { Link as RouterLink, NavLink } from 'react-router-dom';

import {
  DescriptionOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SettingsOutlined,
  AssignmentTurnedIn,
  Business,
  AttachMoney,
  ArrowUpward,
  MoreVert,
  Search,
  Person,
  FilterList,
  Upload,
  ReportProblemOutlined,
  CalendarToday,
  Comment,
  LocationOn,
  Email,
} from '@mui/icons-material';

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AccountantDashboard = () => {
  const { user, logout, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({ 
    new: 0, 
    processed: 0, 
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
    processedAmount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
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
  
  // Mock companies data for sidebar
  const companies = [
    { id: 1, name: 'Acme Corp', logo: '', color: '#1976d2' },
    { id: 2, name: 'Globex', logo: '', color: '#388e3c' },
    { id: 3, name: 'Initech', logo: '', color: '#fbc02d' },
    { id: 4, name: 'Umbrella', logo: '', color: '#d32f2f' },
  ];

  const documentStatusGroups = [
    { key: 'new', label: 'New' },
    { key: 'in_review', label: 'In Review' },
    { key: 'processed', label: 'Processed' },
    { key: 'rejected', label: 'Rejected' },
  ];
  
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
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month}`;
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

  // Group documents by status for columns
  const statusGroups = [
    { key: 'new', label: 'New Documents', match: ['new'] },
    { key: 'in_processing', label: 'In Processing', match: ['in_review', 'processing'] },
    { key: 'approved', label: 'Approved', match: ['approved', 'processed'] },
    { key: 'rejected', label: 'Rejected', match: ['rejected'] },
  ];

  const groupedDocuments = statusGroups.map(group => ({
    ...group,
    documents: filteredDocuments.filter(doc => group.match.includes(doc.status)),
  }));

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
    <Box sx={{ display: 'flex', bgcolor: 'white', minHeight: '100vh', p: 0, fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 10,
          py: 3,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Box>
          <Box sx={{ px: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontFamily: 'Inter, sans-serif', fontSize: 22 }}>DocsCompta</Typography>
          </Box>
          <List>
            <ListItem 
              button 
              component={NavLink} 
              to="/accountant/dashboard"
              sx={{
                '&.active': {
                  bgcolor: '#f5f7fa',
                  color: '#111',
                  fontWeight: 700,
                },
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              }}
            >
              <ListItemIcon><DashboardOutlined sx={{ fontSize: 22 }} /></ListItemIcon>
              <ListItemText primary={<span style={{fontWeight:600, fontSize:15}}>Dashboard</span>} />
            </ListItem>
            <ListItem 
              button 
              component={NavLink} 
              to="/accountant/documents"
              sx={{
                '&.active': {
                  bgcolor: '#f5f7fa',
                  color: '#111',
                  fontWeight: 700,
                },
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              }}
            >
              <ListItemIcon><DescriptionOutlined sx={{ fontSize: 22 }} /></ListItemIcon>
              <ListItemText primary={<span style={{fontWeight:500, fontSize:15}}>Documents</span>} />
            </ListItem>
            <ListItem 
              button 
              component={NavLink} 
              to="/accountant/reports"
              sx={{
                '&.active': {
                  bgcolor: '#f5f7fa',
                  color: '#111',
                  fontWeight: 700,
                },
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              }}
            >
              <ListItemIcon><BarChartOutlined sx={{ fontSize: 22 }} /></ListItemIcon>
              <ListItemText primary={<span style={{fontWeight:500, fontSize:15}}>Financial Reports</span>} />
            </ListItem>
            <ListItem 
              button 
              component={NavLink} 
              to="/accountant/settings"
              sx={{
                '&.active': {
                  bgcolor: '#f5f7fa',
                  color: '#111',
                  fontWeight: 700,
                },
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              }}
            >
              <ListItemIcon><SettingsOutlined sx={{ fontSize: 22 }} /></ListItemIcon>
              <ListItemText primary={<span style={{fontWeight:500, fontSize:15}}>Settings</span>} />
            </ListItem>
          </List>
        </Box>
        {/* Companies section at the bottom */}
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block', fontSize: 12, letterSpacing: 1 }}>Companies</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {companies.map((company) => (
              <Box key={company.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar sx={{ bgcolor: company.color, width: 28, height: 28, fontSize: 14 }}>{company.name[0]}</Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 14 }}>{company.name}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Main content shifted right with margin */}
      <Box sx={{ flexGrow: 1, ml: '220px', pl: 4, fontFamily: 'Inter, sans-serif', bgcolor: 'white' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, py: 3, bgcolor: '#f6f7ed', border: 'none' }}>
          <TextField
            size="medium"
            placeholder="Search client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: 350,
              bgcolor: '#f6f7ed',
              borderRadius: 2,
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              border: 'none',
              boxShadow: 'none',
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f6f7ed',
                border: 'none',
                boxShadow: 'none',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
              style: { fontFamily: 'Inter, sans-serif', fontSize: 16, border: 'none', boxShadow: 'none', background: '#f6f7ed' }
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="outlined" sx={{ textTransform: 'none', bgcolor: 'white', borderColor: '#eee', fontWeight: 500, fontSize: 15, borderRadius: 2 }}>Sort by</Button>
            <Button startIcon={<FilterList sx={{ fontSize: 20 }}/>} variant="outlined" sx={{ textTransform: 'none', bgcolor: 'white', borderColor: '#eee', fontWeight: 500, fontSize: 15, borderRadius: 2 }}>Filters</Button>
            <Button startIcon={<Person sx={{ fontSize: 20 }}/>} variant="text" sx={{ textTransform: 'none', color: '#222', fontWeight: 500, fontSize: 15 }}>Me</Button>
            <Button variant="contained" sx={{ textTransform: 'none', bgcolor: '#111', color: 'white', borderRadius: 2, fontWeight: 700, px: 3, fontSize: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>+ Add document</Button>
          </Box>
        </Box>

        {/* Top Diagrams/Stats Section as a white card */}
        <Box sx={{ bgcolor: '#f6f7ed', px: 0, pt: 0, pb: 4 }}>
          <Box sx={{ display: 'flex', gap: 3, px: 4, pt: 4, pb: 2, bgcolor: '#f6f7ed', borderRadius: 0, mb: 4 }}>
            {/* Documents this week (bar chart) */}
            <Box sx={{ flex: 2, bgcolor: 'white', borderRadius: 3, p: 3, minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BarChartOutlined sx={{ color: '#222', fontSize: 22, mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 16, fontFamily: 'Inter, sans-serif' }}>Documents this week</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: 60 }}>
                {[3, 7, 5, 2, 6].map((val, i) => (
                  <Box key={i} sx={{ width: 18, height: val * 8, bgcolor: '#222', borderRadius: 1 }} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
                  <Typography key={d} variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>{d}</Typography>
                ))}
              </Box>
            </Box>
            {/* Pending approvals */}
            <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 3, p: 3, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 0 }}>
              <AssignmentTurnedIn sx={{ color: '#1976d2', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', fontSize: 28 }}>8</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Pending approvals</Typography>
            </Box>
            {/* Companies managed */}
            <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 3, p: 3, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 0 }}>
              <Business sx={{ color: '#388e3c', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', fontSize: 28 }}>4</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Companies managed</Typography>
            </Box>
            {/* Documents overdue */}
            <Box sx={{ flex: 1, bgcolor: 'white', borderRadius: 3, p: 3, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 0 }}>
              <ReportProblemOutlined sx={{ color: '#ed6c02', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', fontSize: 28 }}>3</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Documents overdue</Typography>
            </Box>
          </Box>
        </Box>

        {/* Document Cards Section */}
        <Box sx={{ px: 4, pt: 2, pb: 6 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {groupedDocuments.map((group, idx) => (
              <Box key={group.key} sx={{ flex: 1, minWidth: 270 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 16, fontFamily: 'Inter, sans-serif' }}>{group.label}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 14 }}>{group.documents.length} ↑</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {group.documents.map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 3,
                        boxShadow: 0,
                        p: 2,
                        minHeight: 110,
                        transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
                        cursor: 'pointer',
                        border: '1px solid #f0f0f0',
                        color: '#222',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          bgcolor: 'black',
                          color: 'white',
                          minHeight: 240,
                          boxShadow: 6,
                        },
                        '&:hover .card-default-content': {
                          opacity: 0,
                          pointerEvents: 'none',
                        },
                        '&:hover .card-hover-details': {
                          opacity: 1,
                          transform: 'translateY(0)',
                          pointerEvents: 'auto',
                        },
                      }}
                    >
                      <Box 
                        className="card-default-content"
                        sx={{ 
                          transition: 'opacity 0.2s',
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15, fontFamily: 'Inter, sans-serif', transition: 'color 0.25s' }}>
                            {doc.file_name}
                          </Typography>
                          <IconButton size="small" sx={{ color: 'inherit' }}><MoreVert /></IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: 14, fontFamily: 'Inter, sans-serif', transition: 'color 0.25s', color: 'inherit' }}>
                          {doc.vendor_client || '—'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box component="span" sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center',
                              gap: 0.5,
                              bgcolor: 'rgba(0,0,0,0.05)', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1, 
                              fontSize: 13 
                            }}>
                              <CalendarToday sx={{ fontSize: 14 }} />
                              <span>{formatDate(doc.document_date || doc.upload_date || '2023-04-18')}</span>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              component={RouterLink}
                              to={`/companies/${doc.company_id}`}
                              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', cursor: 'pointer', gap: 1 }}
                            >
                              <Avatar
                                src={doc.company_logo || ''}
                                alt={doc.company_name || 'Company'}
                                sx={{ width: 24, height: 24, fontSize: 14, bgcolor: doc.company_logo ? undefined : '#1976d2' }}
                              >
                                {(!doc.company_logo && doc.company_name) ? doc.company_name[0] : ''}
                              </Avatar>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13, fontWeight: 500 }}>
                                {doc.company_name || 'Company Name'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Box
                        className="card-hover-details"
                        sx={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: 0,
                          bottom: 0,
                          padding: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: 'black',
                          color: 'white',
                          opacity: 0,
                          transform: 'translateY(10px)',
                          transition: 'opacity 0.3s, transform 0.3s',
                          pointerEvents: 'none',
                          zIndex: 2,
                          justifyContent: 'center',
                        }}
                      >
                        {/* Document type pill */}
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            bgcolor: 'rgba(255,255,255,0.08)',
                            px: 1.5, py: 0.5,
                            borderRadius: 1,
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'white'
                          }}>
                            {doc.document_type || 'Document'}
                          </Box>
                        </Box>
                        {/* Document name */}
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, fontFamily: 'Inter, sans-serif', mb: 0.5 }}>
                          {doc.file_name || doc.file_path?.split('/').pop() || 'Document.pdf'}
                        </Typography>
                        {/* Vendor/client */}
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, mb: 1 }}>
                          {doc.vendor_client || ''}
                        </Typography>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1 }} />
                        {/* Details row */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 15 }} />
                            <Typography variant="body2" sx={{ fontSize: 13 }}>{formatDate(doc.document_date)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>Opération:</Typography>
                            <Typography variant="body2" sx={{ fontSize: 13 }}>{doc.operation_type}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>Statut:</Typography>
                            <Typography variant="body2" sx={{ fontSize: 13 }}>{doc.status}</Typography>
                          </Box>
                          {doc.reference && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>Référence:</Typography>
                              <Typography variant="body2" sx={{ fontSize: 13 }}>{doc.reference}</Typography>
                            </Box>
                          )}
                        </Box>
                        {/* Company avatar and name at the bottom */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                          <Avatar
                            src={doc.company_logo || ''}
                            alt={doc.company_name || 'Company'}
                            sx={{ width: 24, height: 24, fontSize: 14, bgcolor: doc.company_logo ? undefined : '#1976d2' }}
                          >
                            {(!doc.company_logo && doc.company_name) ? doc.company_name[0] : ''}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontSize: 13, color: 'white', fontWeight: 500 }}>
                            {doc.company_name || 'Company Name'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
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

export default AccountantDashboard; 