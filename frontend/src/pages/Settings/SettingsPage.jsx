import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  Alert,
  Snackbar,
  MenuItem,
} from '@mui/material';
import {
  NotificationsOutlined,
  SecurityOutlined,
  Save,
} from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      documentUpdates: true,
    },
    security: {
      sessionTimeout: 30,
    },
    preferences: {
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
    }
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSave = () => {
    // For now, just show a success message
    // We'll implement actual saving when we have the backend ready
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4 }}>
            Settings
          </Typography>

          <Grid container spacing={3}>
            {/* Notifications Settings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotificationsOutlined sx={{ mr: 1 }} />
                  <Typography variant="h6">Notifications</Typography>
                </Box>
                <List>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.email}
                          onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                        />
                      }
                      label="Email Notifications"
                    />
                  </ListItem>
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.documentUpdates}
                          onChange={(e) => handleSettingChange('notifications', 'documentUpdates', e.target.checked)}
                        />
                      }
                      label="Document Updates"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Security Settings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityOutlined sx={{ mr: 1 }} />
                  <Typography variant="h6">Security</Typography>
                </Box>
                <List>
                  <ListItem>
                    <TextField
                      select
                      label="Session Timeout (minutes)"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                      fullWidth
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={120}>2 hours</MenuItem>
                    </TextField>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Preferences */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Preferences</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Language"
                      value={settings.preferences.language}
                      onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Date Format"
                      value={settings.preferences.dateFormat}
                      onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default SettingsPage;
