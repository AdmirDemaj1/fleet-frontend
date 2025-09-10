import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Lock,
  Key,
  Shield
} from '@mui/icons-material';

interface SecuritySettingsProps {
  customerId: string;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Security Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account security and authentication
        </Typography>
      </Box>

      {/* Password Security */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          mb: 3
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          <Lock sx={{ mr: 1 }} />
          Password & Authentication
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last changed 3 months ago
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Key />}
            sx={{ textTransform: 'none', borderRadius: 2 }}
            disabled
          >
            Update Password
          </Button>
        </Box>

        <FormControlLabel
          control={<Switch defaultChecked disabled />}
          label="Two-Factor Authentication (2FA)"
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
          Add an extra layer of security to your account
        </Typography>
      </Paper>

      {/* Account Security */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          <Shield sx={{ mr: 1 }} />
          Account Security
        </Typography>

        <FormControlLabel
          control={<Switch defaultChecked disabled />}
          label="Login Notifications"
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
          Get notified when someone logs into your account
        </Typography>

        <FormControlLabel
          control={<Switch disabled />}
          label="Suspicious Activity Alerts"
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
          Receive alerts for unusual account activity
        </Typography>
      </Paper>
    </Box>
  );
};
