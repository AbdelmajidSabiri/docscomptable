import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import useFetch from '../../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CompaniesPage = () => {
  const { user } = useContext(AuthContext);
  
  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    accountant: '',
    search: ''
  });
  
  // Fetch companies based on user role
  const {
    data: companies,
    loading: companiesLoading,
    error: companiesError,
    refetch: refetchCompanies
  } = useFetch(`${API_URL}/companies`);
  
  // Fetch accountants for filter dropdown (admin only)
  const {
    data: accountants,
    loading: accountantsLoading,
    error: accountantsError
  } = useFetch(user?.user?.role === 'admin' ? `${API_URL}/accountants` : null);
  
  // Filtered companies
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  
  // Apply filters when companies data or filters change
  useEffect(() => {
    if (companies) {
      let filtered = [...companies];
      
      // Filter by status
      if (filters.status) {
        filtered = filtered.filter(company => company.status === filters.status);
      }
      
      // Filter by accountant (admin only)
      if (filters.accountant && user?.user?.role === 'admin') {
        filtered = filtered.filter(company => company.accountant_id === filters.accountant);
      }
      
      // Filter by search text
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(company => 
          company.name.toLowerCase().includes(searchLower) || 
          company.taxId.toLowerCase().includes(searchLower) || 
          (company.email && company.email.toLowerCase().includes(searchLower))
        );
      }
      
      setFilteredCompanies(filtered);
    }
  }, [companies, filters, user]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      accountant: '',
      search: ''
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {user?.user?.role === 'admin' ? 'All Companies' : 'My Companies'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.user?.role === 'admin' 
                ? 'Manage and view all companies in the system'
                : 'Manage and view your client companies'}
            </Typography>
          </Box>
          
          {user?.user?.role === 'admin' && (
            <Button
              variant="contained"
              component={Link}
              to="/companies/new"
            >
              Add New Company
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Companies"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, Tax ID or Email"
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {user?.user?.role === 'admin' && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="accountant-filter-label">Accountant</InputLabel>
                <Select
                  labelId="accountant-filter-label"
                  id="accountant-filter"
                  name="accountant"
                  value={filters.accountant}
                  onChange={handleFilterChange}
                  label="Accountant"
                  disabled={accountantsLoading}
                >
                  <MenuItem value="">All Accountants</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                  {accountants?.map(accountant => (
                    <MenuItem key={accountant.id} value={accountant.id}>
                      {accountant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Companies List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Companies
          {filteredCompanies && (
            <Typography component="span" variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
              ({filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'})
            </Typography>
          )}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {companiesLoading ? (
          <LinearProgress />
        ) : companiesError ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="error">
              Error loading companies: {companiesError.message}
            </Typography>
          </Box>
        ) : filteredCompanies?.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Tax ID</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  {user?.user?.role === 'admin' && (
                    <TableCell>Accountant</TableCell>
                  )}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.taxId}</TableCell>
                    <TableCell>{company.email || '-'}</TableCell>
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
                    {user?.user?.role === 'admin' && (
                      <TableCell>
                        {company.accountant_name || 'Unassigned'}
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/companies/${company.id}`}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        component={Link}
                        to={`/documents/${company.id}`}
                        size="small"
                        variant="outlined"
                      >
                        Documents
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No companies found
            </Typography>
            {user?.user?.role === 'admin' && (
              <Button
                variant="contained"
                component={Link}
                to="/companies/new"
                sx={{ mt: 2 }}
              >
                Add New Company
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CompaniesPage;