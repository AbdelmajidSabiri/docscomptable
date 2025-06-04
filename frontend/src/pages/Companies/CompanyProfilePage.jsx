import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Paper, 
  Divider, 
  Alert,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  alpha
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, PhotoCamera, Business as BusinessIcon, Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationIcon, Person as PersonIcon, CalendarToday as CalendarIcon, Description as DescriptionIcon, Upload as UploadIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import companyService from '../../services/company.service';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CompanyProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedCompany, setEditedCompany] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await companyService.getById(id);
        setCompany(data);
        setEditedCompany(data);
      } catch (err) {
        setError('Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedCompany(company);
  };

  const handleSave = () => {
    setConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      const updatedCompany = await companyService.update(id, editedCompany);
      setCompany(updatedCompany);
      setEditMode(false);
      setConfirmDialog(false);
    } catch (err) {
      setError('Failed to update company profile.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await companyService.uploadProfilePicture(id, file);
      setCompany(prev => ({
        ...prev,
        profile_picture: result.profile_picture
      }));
    } catch (err) {
      setError('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const canEdit = user?.user?.role === 'admin' || 
    (user?.user?.role === 'accountant' && company?.accountant_id === user?.profile?.id) ||
    (user?.user?.role === 'company' && company?.user_id === user?.user?.id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">Company not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={3}>
            <Box position="relative">
              <Avatar
                src={company.profile_picture ? `${process.env.REACT_APP_API_URL}/${company.profile_picture}` : undefined}
                sx={{ 
                  width: 120, 
                  height: 120,
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              {canEdit && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'grey.100' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  disabled={uploading}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                  />
                  {uploading ? <CircularProgress size={24} color="inherit" /> : <PhotoCamera />}
                </IconButton>
              )}
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {company.name}
              </Typography>
              <Chip 
                label={company.status || 'Active'} 
                color={company.status === 'active' ? 'success' : 'warning'}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '& .MuiChip-label': { fontWeight: 500 }
                }}
              />
            </Box>
          </Box>
          {canEdit && !editMode && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': { backgroundColor: 'grey.100' }
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Information */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Company Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="name"
                    value={editMode ? editedCompany.name : company.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SIRET"
                    name="siret"
                    value={editMode ? editedCompany.siret : company.siret}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    name="contact_name"
                    value={editMode ? editedCompany.contact_name : company.contact_name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    name="contact_email"
                    value={editMode ? editedCompany.contact_email : company.contact_email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    name="contact_phone"
                    value={editMode ? editedCompany.contact_phone : company.contact_phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={editMode ? editedCompany.address : company.address}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <LocationIcon sx={{ alignSelf: 'flex-start', mt: 1, color: 'text.secondary' }} />
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Additional Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Assigned Accountant
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {company.accountant_name || 'Not assigned'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Activation Date
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {company.activation_date && !isNaN(new Date(company.activation_date))
                      ? format(new Date(company.activation_date), 'PPP', { locale: fr })
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BusinessIcon color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {company.status || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card elevation={0} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  {!editMode && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      sx={{ py: 1.5 }}
                    >
                      Edit Information
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={() => navigate(`/documents/${company.id}`)}
                    sx={{ py: 1.5 }}
                  >
                    View Documents
                  </Button>
                  {user?.user?.role === 'admin' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate(`/companies/assign/${company.id}`)}
                      sx={{ py: 1.5 }}
                    >
                      Assign Accountant
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {editMode && (
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Save Changes
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{ py: 1.5 }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{ py: 1.5 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Save Confirmation Dialog */}
      <Dialog 
        open={confirmDialog} 
        onClose={() => setConfirmDialog(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Save Changes</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save the changes to this company's profile?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmSave} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanyProfilePage; 