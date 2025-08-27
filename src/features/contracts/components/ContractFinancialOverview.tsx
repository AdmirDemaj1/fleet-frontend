import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Avatar,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  AttachMoney,
  Assessment
} from '@mui/icons-material';

interface ContractFinancialOverviewProps {
  contractConfig: any;
}

export const ContractFinancialOverview: React.FC<ContractFinancialOverviewProps> = ({ contractConfig }) => {
  const theme = useTheme();

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: alpha(theme.palette.success.main, 0.1),
        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        borderRadius: 3,
        p: 4,
        mb: 4
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AttachMoney sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {formatCurrency(contractConfig.totalAmount)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Total Contract Value
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Payment Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatPercentage(contractConfig.progressPercentage)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={contractConfig.progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.grey[500], 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: theme.palette.success.main
                }
              }}
            />
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Amount Paid
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                {formatCurrency(contractConfig.paidAmount)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Remaining
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {formatCurrency(contractConfig.remainingAmount)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                mx: 'auto',
                mb: 2
              }}
            >
              <Assessment sx={{ fontSize: 28 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Contract Health
            </Typography>
            <Chip
              label={contractConfig.progressPercentage > 80 ? 'Excellent' : 
                    contractConfig.progressPercentage > 50 ? 'Good' : 
                    contractConfig.progressPercentage > 20 ? 'Fair' : 'Needs Attention'}
              color={contractConfig.progressPercentage > 80 ? 'success' : 
                    contractConfig.progressPercentage > 50 ? 'primary' : 
                    contractConfig.progressPercentage > 20 ? 'warning' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};
