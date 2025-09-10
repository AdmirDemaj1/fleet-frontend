import React from 'react';
import { Box, Typography, Paper, Button, useTheme, alpha } from '@mui/material';
import { Security, Delete } from '@mui/icons-material';

interface DataPrivacySettingsProps {
  customerId: string;
}

export const DataPrivacySettings: React.FC<DataPrivacySettingsProps> = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Data & Privacy
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Control your data and privacy settings
        </Typography>
      </Box>

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
          <Security sx={{ mr: 1 }} />
          Privacy Controls
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Download My Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get a copy of all your personal data
            </Typography>
          </Box>
          <Button
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
            disabled
          >
            Request Data
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500, color: 'error.main' }}>
              Delete Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Permanently delete your account and all data
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            sx={{ textTransform: 'none', borderRadius: 2 }}
            disabled
          >
            Delete Account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
