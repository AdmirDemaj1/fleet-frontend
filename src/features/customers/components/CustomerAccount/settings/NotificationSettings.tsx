import React from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, useTheme, alpha } from '@mui/material';
import { NotificationsActive } from '@mui/icons-material';

interface NotificationSettingsProps {
  customerId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Notification Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose how you want to be notified
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          <NotificationsActive sx={{ mr: 1 }} />
          Notification Settings
        </Typography>

        <FormControlLabel
          control={<Switch defaultChecked disabled />}
          label="Email Notifications"
          sx={{ mb: 2, display: 'block' }}
        />
        <FormControlLabel
          control={<Switch disabled />}
          label="SMS Notifications"
          sx={{ mb: 2, display: 'block' }}
        />
        <FormControlLabel
          control={<Switch defaultChecked disabled />}
          label="Payment Reminders"
          sx={{ display: 'block' }}
        />
      </Paper>
    </Box>
  );
};
