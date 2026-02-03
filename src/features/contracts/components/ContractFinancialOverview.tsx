import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  AccountBalance,
  Schedule,
  CreditCard
} from '@mui/icons-material';

interface ContractFinancialOverviewProps {
  contractConfig: any;
}

export const ContractFinancialOverview = React.memo<ContractFinancialOverviewProps>(({ contractConfig }) => {
  const theme = useTheme();

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatCurrencyWithDecimals = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  // Calculate progress percentage with proper validation
  const calculateProgressPercentage = (): number => {
    // If progressPercentage is already provided and valid, use it
    if (contractConfig.progressPercentage && 
        typeof contractConfig.progressPercentage === 'number' && 
        contractConfig.progressPercentage >= 0 && 
        contractConfig.progressPercentage <= 100) {
      return contractConfig.progressPercentage;
    }

    // Calculate from paid and total amounts
    if (contractConfig.paidAmount && contractConfig.totalAmount) {
      const paidAmount = typeof contractConfig.paidAmount === 'string' 
        ? parseFloat(contractConfig.paidAmount.replace(/[,$]/g, '')) 
        : parseFloat(contractConfig.paidAmount);
      const totalAmount = typeof contractConfig.totalAmount === 'string' 
        ? parseFloat(contractConfig.totalAmount.replace(/[,$]/g, '')) 
        : parseFloat(contractConfig.totalAmount);
      
      if (totalAmount > 0) {
        const percentage = (paidAmount / totalAmount) * 100;
        return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
      }
    }

    return 0;
  };

  const progressPercentage = calculateProgressPercentage();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        mb: 4, // Add margin bottom for spacing
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
        }
      }}
    >
      {/* Header Section */}
      <Box sx={{ p: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: 'success.main',
              mr: 2,
              width: 56,
              height: 56,
              boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}`
            }}
          >
            <AttachMoney sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Financial Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contract value and payment progress
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Progress Bar - Center of Attention */}
      <Box sx={{ p: 3, py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Payment Progress
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                color: 'primary.main',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {formatPercentage(progressPercentage)}
            </Typography>
          </Box>
          
          {/* Custom Progress Bar */}
          <Box sx={{ position: 'relative' }}>
            {/* Background Track */}
            <Box
              sx={{
                height: 20,
                borderRadius: 10,
                bgcolor: alpha(theme.palette.grey[400], 0.2),
                border: `1px solid ${alpha(theme.palette.grey[400], 0.1)}`,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Filled Progress */}
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.min(Math.max(progressPercentage, 0), 100)}%`,
                  background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 50%, ${theme.palette.success.main} 100%)`,
                  borderRadius: 10,
                  transition: 'width 0.8s ease-in-out',
                  position: 'relative',
                  boxShadow: `inset 0 1px 2px ${alpha(theme.palette.success.dark, 0.2)}`,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.common.white, 0.4)} 50%, transparent 100%)`,
                    borderRadius: 10
                  }
                }}
              />
            </Box>
            
            {/* Progress indicator dot */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: `${Math.min(Math.max(progressPercentage, 0), 100)}%`,
                transform: 'translate(-50%, -50%)',
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: 'success.main',
                border: `3px solid ${theme.palette.background.paper}`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.5)}`,
                transition: 'left 0.8s ease-in-out',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.background.paper,
                }
              }}
            />
          </Box>
        </Box>

        {/* Financial Cards Grid - Including Total Value */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.04),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 16px ${alpha(theme.palette.info.main, 0.15)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: 'info.main',
                    mr: 1.5
                  }}
                >
                  <TrendingUp sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Total Value
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main', mb: 0.5 }}>
                {formatCurrency(contractConfig.totalAmount)}
              </Typography>
              <Typography variant="caption" color="info.main" sx={{ fontWeight: 500 }}>
                Contract value
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.04),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.15)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    mr: 1.5
                  }}
                >
                  <AccountBalance sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Amount Paid
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                {formatCurrency(contractConfig.paidAmount)}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                {formatPercentage(progressPercentage)} of total
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.04),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 16px ${alpha(theme.palette.warning.main, 0.15)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.main',
                    mr: 1.5
                  }}
                >
                  <Schedule sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Remaining
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main', mb: 0.5 }}>
                {formatCurrency(contractConfig.remainingAmount)}
              </Typography>
              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                {formatPercentage(100 - progressPercentage)} remaining
              </Typography>
            </Paper>
          </Grid>

          {contractConfig.creditBalance !== null && contractConfig.creditBalance !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.secondary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.15)}`
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: 'secondary.main',
                      mr: 1.5
                    }}
                  >
                    <CreditCard sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Credit Balance
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                  {formatCurrencyWithDecimals(contractConfig.creditBalance)}
                </Typography>
                <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 500 }}>
                  Available credit
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Principal and Interest Breakdown */}
        {(contractConfig.principalAmount || contractConfig.interestAmount) && (
          <>
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Principal & Interest Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed breakdown of contract financial composition
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {contractConfig.principalAmount && (
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.15)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          mr: 1.5
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Principal Amount
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Total Principal
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatCurrency(contractConfig.principalAmount)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Paid
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {contractConfig.paidPrincipalAmount ? formatCurrency(contractConfig.paidPrincipalAmount) : '€0'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Remaining
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                          {contractConfig.remainingPrincipalAmount ? formatCurrency(contractConfig.remainingPrincipalAmount) : '€0'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {contractConfig.interestAmount && (
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.15)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: 'secondary.main',
                          mr: 1.5
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                        Interest Amount
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Total Interest
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        {formatCurrency(contractConfig.interestAmount)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Paid
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {contractConfig.paidInterestAmount ? formatCurrency(contractConfig.paidInterestAmount) : '€0'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Remaining
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                          {contractConfig.remainingInterestAmount ? formatCurrency(contractConfig.remainingInterestAmount) : '€0'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>
    </Paper>
  );
});

ContractFinancialOverview.displayName = 'ContractFinancialOverview';
