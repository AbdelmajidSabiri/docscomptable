import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
import { Link as RouterLink } from 'react-router-dom';

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
  Notifications,
  Sort,
  AddBusiness,
  CheckCircle,
  Close,
  Done,
  Warning,
  Info
} from '@mui/icons-material';

import axios from 'axios';
import Sidebar from '../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AccountantDashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
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
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
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

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    
    if (sortBy === 'document_date' || sortBy === 'upload_date') {
      const dateA = aValue ? new Date(aValue) : new Date(0);
      const dateB = bValue ? new Date(bValue) : new Date(0);
      return sortOrder === 'desc' 
        ? dateB - dateA
        : dateA - dateB;
    }
    
    if (sortBy === 'amount') {
      const amountA = parseFloat(aValue) || 0;
      const amountB = parseFloat(bValue) || 0;
      return sortOrder === 'desc'
        ? amountB - amountA
        : amountA - amountB;
    }
    
    // For string values (like vendor_client)
    const strA = String(aValue).toLowerCase();
    const strB = String(bValue).toLowerCase();
    return sortOrder === 'desc'
      ? strB.localeCompare(strA)
      : strA.localeCompare(strB);
  });

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setShowSort(false);
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
    setShowFilters(false);
  };

  // Handle add company
  const handleAddCompany = () => {
    setShowAddCompany(true);
  };

  // Handle notifications
  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Handle add document
  const handleAddDocument = () => {
    setUploadDialogOpen(true);
  };

  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setNotificationError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/notifications/accountant`, config);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotificationError('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, config);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`${API_URL}/notifications/read-all`, {}, config);
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Fetch notifications when component mounts
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Done sx={{ color: '#4caf50' }} />;
      case 'warning':
        return <Warning sx={{ color: '#ff9800' }} />;
      case 'error':
        return <ReportProblemOutlined sx={{ color: '#f44336' }} />;
      default:
        return <Info sx={{ color: '#2196f3' }} />;
    }
  };

  // Format notification time
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Add this function near the top of the component
  const handleMeClick = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(`${API_URL}/auth/me`, config);
      console.log('Profile response:', response.data);
      if (response.data.profile) {
        navigate(`/accountants/${response.data.profile.id}`);
      } else {
        console.error('No profile found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  console.log('Me button user:', user);

  return (
    <Box sx={{ display: 'flex', bgcolor: 'white', minHeight: '100vh', p: 0, fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, fontFamily: 'Inter, sans-serif', bgcolor: 'white' }}>
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
            <Button
              startIcon={<AddBusiness sx={{ fontSize: 20 }}/>}
              variant="outlined"
              onClick={handleAddCompany}
              sx={{ textTransform: 'none', bgcolor: 'white', borderColor: '#eee', fontWeight: 500, fontSize: 15, borderRadius: 2 }}
            >
              Add Company
            </Button>
            <IconButton
              onClick={handleNotifications}
              sx={{ position: 'relative' }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <Notifications sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>
            {user && user.id ? (
              <Button
                startIcon={<Person sx={{ fontSize: 20 }}/>} 
                variant="text"
                onClick={handleMeClick}
                sx={{ textTransform: 'none', color: '#222', fontWeight: 500, fontSize: 15 }}
              >
                Me
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                sx={{ textTransform: 'none', color: '#222', fontWeight: 500, fontSize: 15 }}
              >
                Me
              </Button>
            )}
          </Box>
        </Box>

        {/* Notifications Menu */}
        <Dialog
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          PaperProps={{
            sx: {
              position: 'absolute',
              top: '80px',
              right: '200px',
              minWidth: '380px',
              maxWidth: '380px',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {notifications.some(n => !n.read) && (
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: 13,
                    color: 'primary.main'
                  }}
                >
                  Mark all as read
                </Button>
              )}
              <IconButton 
                size="small" 
                onClick={() => setShowNotifications(false)}
                sx={{ color: 'text.secondary' }}
              >
                <Close sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
          }}>
            {loadingNotifications ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : notificationError ? (
              <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                {notificationError}
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                color: 'text.secondary'
              }}>
                <Notifications sx={{ fontSize: 40, color: '#eee', mb: 1 }} />
                <Typography variant="body2">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              notifications.map((notification) => (
                <Box
                  key={notification.id}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid #f5f5f5',
                    bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: notification.read ? 400 : 600,
                        mb: 0.5,
                        color: notification.read ? 'text.secondary' : 'text.primary'
                      }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        mb: 1,
                        fontSize: 13
                      }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: 'text.secondary',
                        fontSize: 12
                      }}>
                        {formatNotificationTime(notification.created_at)}
                      </Typography>
                    </Box>
                    {!notification.read && (
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mt: 1
                      }} />
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Dialog>

        {/* Add Company Dialog */}
        <Dialog
          open={showAddCompany}
          onClose={() => setShowAddCompany(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Company</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Company Name"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Company Address"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Tax ID"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Contact Email"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddCompany(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setShowAddCompany(false)}>Add Company</Button>
          </DialogActions>
        </Dialog>

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
        <Box sx={{ height: 120, bgcolor: 'white' }} />
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