import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import companyService from '../../services/company.service';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Divider,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  InputAdornment,
  Fade
} from '@mui/material';
import { Add, Delete, Visibility, Business, Search } from '@mui/icons-material';

const headerBg = '#f6f7ed'; // Match Documents page background

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [transferCompanyId, setTransferCompanyId] = useState('');
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await companyService.getAll();
        setCompanies(data);
      } catch (err) {
        setError('Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Filter logic
  const filteredCompanies = companies.filter(company => {
    if (filters.status && company.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = company.name.toLowerCase().includes(searchLower);
      const taxIdMatch = (company.taxId || company.tax_id || '').toLowerCase().includes(searchLower);
      const emailMatch = (company.email || '').toLowerCase().includes(searchLower);
      if (!nameMatch && !taxIdMatch && !emailMatch) return false;
    }
    return true;
  });

  // Dialog handlers
  const handleOpenAddDialog = () => setAddDialogOpen(true);
  const handleCloseAddDialog = () => setAddDialogOpen(false);
  const handleOpenDeleteDialog = (company) => { setSelectedCompany(company); setDeleteDialogOpen(true); };
  const handleCloseDeleteDialog = () => { setSelectedCompany(null); setDeleteDialogOpen(false); setTransferCompanyId(''); };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <Box sx={{ flex: 1, ml: 0, bgcolor: '#f6f7ed', p: 0, position: 'relative', zIndex: 1 }}>
        {/* Header matching Documents page */}
        <Box sx={{ width: '100%', p: 0, background: headerBg, borderBottom: 'none', pt: '70px' }}>
          <Container maxWidth="lg" sx={{ px: 0, pl: 6, ml: 0, pt: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
              <Box>
                <Typography variant="h2" sx={{ color: '#1f1f1f', fontWeight: 900, letterSpacing: -1, mb: 0.5, fontFamily: 'Inter, sans-serif', fontSize: 36, lineHeight: 1 }}>
                  Companies {filteredCompanies.length > 0 && (
                    <Typography component="span" variant="h4" sx={{ color: '#1976d2', fontWeight: 700, fontSize: 36, ml: 1 }}>
                      ({filteredCompanies.length})
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body1" sx={{ color: '#888', fontWeight: 400, fontSize: 18, lineHeight: 1.2 }}>
                  Manage and view all companies you handle
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddDialog}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 16,
                  px: 3,
                  py: 1,
                  minWidth: 0,
                  height: 40,
                  boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.08)',
                  background: '#1976d2',
                  color: '#fff',
                  textTransform: 'none',
                  '&:hover': {
                    background: '#115293',
                  }
                }}
              >
                Add Company
              </Button>
            </Box>
          </Container>
        </Box>
        {/* Main content: search/filter and companies grid, both in one Container */}
        <Container maxWidth="lg" sx={{ mb: 4, px: 0, pl: 6, ml: 0 }}>
          {/* Search and Filters */}
          <Box sx={{ mb: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search companies..."
                    value={filters.search}
                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2, bgcolor: '#f6f7ed' }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f6f7ed',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth sx={{ borderRadius: 2, height: 40 }} onClick={() => setFilters({ status: '', search: '' })}>
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          {/* Companies Grid or Empty State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress size={40} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredCompanies.length === 0 ? (
            <Fade in={true}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" color="text.secondary" fontWeight={700} mb={2}>
                  No companies found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Try adjusting your search or filters, or add a new company.
                </Typography>
              </Box>
            </Fade>
          ) : (
            <Grid container spacing={4} sx={{ mt: 3 }}>
              {filteredCompanies.map((company, idx) => (
                <Grid item xs={12} sm={6} md={4} key={company.id}>
                  <Fade in={true} style={{ transitionDelay: `${idx * 80}ms` }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: '#fff',
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                        border: '1px solid #f0f0f0',
                        transition: 'transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px) scale(1.01)',
                          boxShadow: '0 8px 24px 0 rgba(25,118,210,0.08)',
                          borderColor: '#1976d2',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        minHeight: 260,
                        height: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#e3eafc', color: '#1976d2', width: 56, height: 56, fontWeight: 700, fontSize: 28 }}>
                          <Business fontSize="large" />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#1f1f1f', letterSpacing: -0.5 }}>{company.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{company.email}</Typography>
                          <Stack direction="row" spacing={1} mt={1}>
                            <Chip
                              label={company.status}
                              color={company.status === 'active' ? 'success' : company.status === 'pending' ? 'warning' : 'default'}
                              size="small"
                              sx={{ fontWeight: 600, textTransform: 'capitalize', px: 1.5 }}
                            />
                            <Chip label={company.taxId || company.tax_id} size="small" sx={{ fontWeight: 600, bgcolor: '#f6f7ed' }} />
                          </Stack>
                        </Box>
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          component={Link}
                          to={`/companies/${company.id}`}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2, height: 40, minWidth: 110 }}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleOpenDeleteDialog(company)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2, height: 40, minWidth: 110 }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
          {/* Add Company Dialog */}
          <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Add color="primary" /> Add New Company</DialogTitle>
            <DialogContent>
              <DialogContentText>Enter the details for the new company.</DialogContentText>
              <TextField margin="normal" label="Company Name" fullWidth />
              <TextField margin="normal" label="Tax ID" fullWidth />
              <TextField margin="normal" label="Email" fullWidth />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddDialog}>Cancel</Button>
              <Button variant="contained">Add</Button>
            </DialogActions>
          </Dialog>
          {/* Delete Company Dialog */}
          <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Delete color="error" /> Delete Company</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete <b>{selectedCompany?.name}</b>?<br />
                You can transfer all documents to another company or delete them.
              </DialogContentText>
              <FormControl fullWidth margin="normal">
                <InputLabel>Transfer Documents To</InputLabel>
                <Select
                  value={transferCompanyId}
                  onChange={e => setTransferCompanyId(e.target.value)}
                  label="Transfer Documents To"
                >
                  <MenuItem value="">Delete All Documents</MenuItem>
                  {filteredCompanies.filter(c => c.id !== selectedCompany?.id).map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
              <Button variant="contained" color="error">Delete</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default CompaniesPage;