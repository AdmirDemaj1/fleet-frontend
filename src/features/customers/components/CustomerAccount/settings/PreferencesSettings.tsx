import React from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, useTheme, alpha } from '@mui/material';
import { Tune } from '@mui/icons-material';

interface PreferencesSettingsProps {
  customerId: string;
}

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your application experience
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
          <Tune sx={{ mr: 1 }} />
          Application Preferences
        </Typography>

        <FormControlLabel
          control={<Switch defaultChecked disabled />}
          label="Dark Mode"
          sx={{ mb: 2, display: 'block' }}
        />
        <FormControlLabel
          control={<Switch disabled />}
          label="Compact View"
          sx={{ mb: 2, display: 'block' }}
        />
        <FormControlLabel
          control={<Switch defaultChecked disabled />}
          label="Auto-save Forms"
          sx={{ display: 'block' }}
        />
      </Paper>
    </Box>
  );
};
