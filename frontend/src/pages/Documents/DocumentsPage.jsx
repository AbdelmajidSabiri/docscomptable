import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Grid,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Divider,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  Stack,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { documentService } from '../../services/document.service';
import { useAuth } from '../../contexts/AuthContext';

const DocumentsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    operation_type: searchParams.get('operation_type') || '',
    document_type: searchParams.get('document_type') || ''
  });

  // Fetch documents when component mounts or filters change
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const companyId = user.company_id; // Assuming user context has company_id
        const response = await documentService.getByCompany(companyId);
        setDocuments(response);
        setError(null);
      } catch (err) {
        setError('Failed to fetch documents');
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user.company_id]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.operation_type) params.set('operation_type', filters.operation_type);
    if (filters.document_type) params.set('document_type', filters.document_type);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get unique values for filters
  const documentTypes = [...new Set(documents.map(doc => doc.document_type))];
  const operationTypes = [...new Set(documents.map(doc => doc.operation_type))];
  const statuses = ['new', 'processed', 'rejected'];

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return {
          bg: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        };
      case 'processed':
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
        };
      case 'rejected':
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
        };
      default:
        return {
          bg: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[700],
          border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`
        };
    }
  };

  // Filter documents based on current filters and search query
  const filteredDocuments = documents.filter(doc => {
    const matchesFilters = (
      (!filters.status || doc.status === filters.status) &&
      (!filters.operation_type || doc.operation_type === filters.operation_type) &&
      (!filters.document_type || doc.document_type === filters.document_type)
    );

    const matchesSearch = searchQuery === '' || 
      Object.values(doc).some(value => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesFilters && matchesSearch;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress sx={{ 
          height: 4,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
          }
        }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ 
          p: 3,
          background: `linear-gradient(45deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.main, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
        }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ 
        p: 4, 
        mb: 3,
        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})`,
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Documents
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and view all accounting documents
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            component={Link}
            to="/documents/upload"
            startIcon={<UploadFileIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              }
            }}
          >
            Upload Document
          </Button>
        </Box>
      </Paper>

      {/* Search and Filters */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Operation Type</InputLabel>
              <Select
                value={filters.operation_type}
                label="Operation Type"
                onChange={(e) => handleFilterChange('operation_type', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All</MenuItem>
                {operationTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={filters.document_type}
                label="Document Type"
                onChange={(e) => handleFilterChange('document_type', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All</MenuItem>
                {documentTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents Table */}
      <TableContainer 
        component={Paper}
        sx={{ 
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.04)
            }}>
              <TableCell sx={{ fontWeight: 600 }}>Document Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Operation Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vendor/Client</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow 
                key={doc.id}
                sx={{ 
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transition: 'background-color 0.2s ease'
                  }
                }}
              >
                <TableCell>{doc.document_type}</TableCell>
                <TableCell>{doc.operation_type}</TableCell>
                <TableCell>{new Date(doc.document_date).toLocaleDateString()}</TableCell>
                <TableCell>{doc.vendor_client}</TableCell>
                <TableCell>
                  <Chip 
                    label={doc.status}
                    sx={{ 
                      borderRadius: 1.5,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      ...getStatusColor(doc.status)
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Document">
                      <IconButton
                        component={Link}
                        to={`/documents/${doc.id}`}
                        size="small"
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        sx={{
                          color: theme.palette.info.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.info.main, 0.1)
                          }
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        sx={{
                          color: theme.palette.warning.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.warning.main, 0.1)
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        sx={{
                          color: theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1)
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DocumentsPage;