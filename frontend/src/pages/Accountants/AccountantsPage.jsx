import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, 
  Chip,
  LinearProgress
} from '@mui/material';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AccountantsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  // Fetch accountants
  const { 
    data: accountants, 
    loading, 
    error, 
    refetch 
  } = useFetch(`${API_URL}/accountants`);
  
  // Filtered accountants
  const filteredAccountants = accountants?.filter(accountant => 
    accountant.name.toLowerCase().includes(search.toLowerCase()) ||
    accountant.email.toLowerCase().includes(search.toLowerCase())
  );
  
  if (user?.user?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1">
          You do not have permission to access this page.
        </Typography>
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
              Accountants
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage accountant users in the system
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            component={Link}
            to="/accountants/new"
          >
            Add New Accountant
          </Button>
        </Box>
      </Paper>
      
      {/* Search & Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Accountants"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="body2" color="text.secondary">
              {filteredAccountants?.length || 0} accountants found
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Accountants List */}
      <Paper sx={{ p: 3 }}>
        {loading ? (
          <LinearProgress />
        ) : error ? (
          <Typography color="error">
            Error loading accountants: {error.message}
          </Typography>
        ) : filteredAccountants?.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Companies</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccountants.map((accountant) => (
                  <TableRow key={accountant.id}>
                    <TableCell>{accountant.name}</TableCell>
                    <TableCell>{accountant.email}</TableCell>
                    <TableCell>{accountant.phone || 'N/A'}</TableCell>
                    <TableCell>{accountant.companies_count || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        label={accountant.status} 
                        color={accountant.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/accountants/${accountant.id}`}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        component={Link}
                        to={`/accountants/edit/${accountant.id}`}
                        size="small"
                        variant="outlined"
                      >
                        Edit
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
              No accountants found
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/accountants/new"
              sx={{ mt: 2 }}
            >
              Add Your First Accountant
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AccountantsPage;