import React from 'react';
import { Box, Typography, Paper, Button, useTheme, alpha } from '@mui/material';
import { CreditCard, Add } from '@mui/icons-material';

interface PaymentSettingsProps {
  customerId: string;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Payment Methods
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your payment methods and billing information
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          textAlign: 'center'
        }}
      >
        <CreditCard sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No Payment Methods
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add a payment method to make transactions easier
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ textTransform: 'none', borderRadius: 2 }}
          disabled
        >
          Add Payment Method
        </Button>
      </Paper>
    </Box>
  );
};
