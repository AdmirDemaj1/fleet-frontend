import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  ArrowForward,
  Payments,
  Percent,
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

  const formatPercentage = (rate: number, decimalPlaces: number = 2): string => {
    return `${(rate * 100).toFixed(decimalPlaces)}%`;
  };

  const getPercentageDecimalPlaces = (rateValue: number): number => {
    const percentageValue = rateValue * 100;
    // Convert to string and remove trailing zeros to determine actual decimal places
    const str = percentageValue.toFixed(10); // Use high precision first
    const trimmed = parseFloat(str).toString(); // This removes trailing zeros
    const decimalPart = trimmed.split('.')[1];
    return decimalPart ? decimalPart.length : 0;
  };

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

      {/* Financial Cards Grid */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {contractConfig.principalAmount !== null && contractConfig.principalAmount !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 1.5 }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Principal
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  {formatCurrency(contractConfig.principalAmount)}
                </Typography>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                  On contract creation
                </Typography>
              </Paper>
            </Grid>
          )}

          {contractConfig.interestAmount !== null && contractConfig.interestAmount !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.secondary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', mr: 1.5 }}>
                    <AttachMoney sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Interest
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                  {formatCurrency(contractConfig.interestAmount)}
                </Typography>
                <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 500 }}>
                  On contract creation
                </Typography>
              </Paper>
            </Grid>
          )}

          {contractConfig.totalCurrentPrincipal !== null && contractConfig.totalCurrentPrincipal !== undefined && contractConfig.contractStatus !== 'completed' && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 1.5 }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total Current Principal
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  {formatCurrency(contractConfig.totalCurrentPrincipal)}
                </Typography>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                  Paid + unpaid principal
                </Typography>
              </Paper>
            </Grid>
          )}

          {contractConfig.totalCurrentInterest !== null && contractConfig.totalCurrentInterest !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.secondary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', mr: 1.5 }}>
                    <AttachMoney sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total Current Interest
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                  {formatCurrency(contractConfig.totalCurrentInterest)}
                </Typography>
                <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 500 }}>
                  Paid + unpaid interest
                </Typography>
              </Paper>
            </Grid>
          )}

          {contractConfig.totalRemainingPrincipal !== null && contractConfig.totalRemainingPrincipal !== undefined && contractConfig.contractStatus !== 'completed' && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.warning.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mr: 1.5 }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total Remaining Principal
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main', mb: 0.5 }}>
                  {formatCurrency(contractConfig.totalRemainingPrincipal)}
                </Typography>
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                  Principal still owed
                </Typography>
              </Paper>
            </Grid>
          )}

          {contractConfig.totalRemainingInterest !== null && contractConfig.totalRemainingInterest !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.warning.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mr: 1.5 }}>
                    <AttachMoney sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total Remaining Interest
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main', mb: 0.5 }}>
                  {formatCurrency(contractConfig.totalRemainingInterest)}
                </Typography>
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                  Interest still owed
                </Typography>
              </Paper>
            </Grid>
          )}

          {contractConfig.totalPrincipalPaid !== null && contractConfig.totalPrincipalPaid !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mr: 1.5 }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total Principal Paid
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                  {formatCurrency(contractConfig.totalPrincipalPaid)}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                  Principal already paid
                </Typography>
              </Paper>
            </Grid>
          )}

          {contractConfig.totalInterestPaid !== null && contractConfig.totalInterestPaid !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mr: 1.5 }}>
                    <AttachMoney sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total Interest Paid
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                  {formatCurrency(contractConfig.totalInterestPaid)}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                  Interest already paid
                </Typography>
              </Paper>
            </Grid>
          )}

          {contractConfig.interestRate !== null && contractConfig.interestRate !== undefined && (
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.15)}` }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mr: 1.5 }}>
                    <Percent sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Interest Rate
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main', mb: 0.5 }}>
                  {formatPercentage(contractConfig.interestRate, getPercentageDecimalPlaces(contractConfig.interestRate))}
                </Typography>
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
                  Current contract rate
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Prepayment Impact Section */}
        {contractConfig.prepaymentImpact?.hasPrepayments && (
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.04),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              borderLeft: `4px solid ${theme.palette.warning.main}`,
            }}
          >
            {/* Section header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.warning.main, 0.15), color: 'warning.dark' }}>
                  <Payments sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'warning.dark', lineHeight: 1.2 }}>
                    Prepayment Impact
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contractConfig.prepaymentImpact.count} prepayment{contractConfig.prepaymentImpact.count !== 1 ? 's' : ''} recorded
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                {formatCurrency(contractConfig.prepaymentImpact.totalAmountPrepaid)}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
                  total prepaid
                </Typography>
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {/* Monthly payment comparison */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.8), border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                    Monthly Payment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Original
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', textDecoration: 'line-through' }}>
                        {formatCurrency(contractConfig.prepaymentImpact.originalMonthlyPayment)}
                      </Typography>
                    </Box>
                    <ArrowForward sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Current
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(contractConfig.prepaymentImpact.currentMonthlyPayment)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Payment reduction & months saved */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.06), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`, height: '100%' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                        Payment Reduction
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        -{formatCurrency(contractConfig.prepaymentImpact.paymentReduction)}
                      </Typography>
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                        per month saved
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`, height: '100%' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                        Months Saved
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                        {contractConfig.prepaymentImpact.monthsSaved}
                      </Typography>
                      <Typography variant="caption" color="info.main" sx={{ fontWeight: 500 }}>
                        off loan term
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Individual prepayments table */}
            {contractConfig.prepaymentImpact.prepayments && contractConfig.prepaymentImpact.prepayments.length > 0 && (
              <Box sx={{ mt: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  Prepayment History
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.06) }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>From Payment #</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Amount</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Previous Payment</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>New Payment</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Payment Reduction</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Months Saved</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Total Interest Impact</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contractConfig.prepaymentImpact.prepayments.map((p: any, index: number) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': { bgcolor: alpha(theme.palette.action.hover, 0.02) },
                            '&:last-child td': { borderBottom: 0 },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                            {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.82rem' }}>#{p.startingPaymentNumber}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'warning.dark' }}>
                            {formatCurrency(p.amountPrepaid)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.82rem', color: 'text.secondary', textDecoration: 'line-through' }}>
                            {formatCurrency(p.previousMonthlyPayment)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.82rem', color: 'success.main' }}>
                            {formatCurrency(p.newMonthlyPayment)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`-${formatCurrency(p.paymentReduction)}`}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: 'success.dark',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.82rem', fontWeight: 600, color: p.monthsSaved > 0 ? 'info.main' : 'text.secondary' }}>
                            {p.monthsSaved > 0 ? `${p.monthsSaved} mo` : '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.82rem' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                                  {formatCurrency(p.totalInterestBefore)}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 12, color: 'warning.main' }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                                  {formatCurrency(p.totalInterestAfter)}
                                </Typography>
                              </Box>
                              <Chip
                                label={`-${formatCurrency(Math.abs(p.totalInterestChange))}`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: 'success.dark',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  height: 20,
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {/* Euribor Impact Section */}
        {contractConfig.euriborImpact?.hasChanges && (
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.04),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderLeft: `4px solid ${theme.palette.info.main}`,
            }}
          >
            {/* Section header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.info.main, 0.15), color: 'info.dark' }}>
                  <TrendingUp sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'info.dark', lineHeight: 1.2 }}>
                    Euribor Rate Changes Impact
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contractConfig.euriborImpact.count} rate change{contractConfig.euriborImpact.count !== 1 ? 's' : ''} recorded
                  </Typography>
                </Box>
              </Box>
              
            </Box>

            <Grid container spacing={2}>
              {/* Euribor rate comparison */}
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.8), border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                    Euribor Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Original
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', textDecoration: 'line-through' }}>
                        {formatPercentage(contractConfig.euriborImpact.originalEuriborRate, getPercentageDecimalPlaces(contractConfig.euriborImpact.originalEuriborRate))}
                      </Typography>
                    </Box>
                    <ArrowForward sx={{ color: 'info.main', fontSize: 20 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color={contractConfig.euriborImpact.currentEuriborRate < contractConfig.euriborImpact.originalEuriborRate ? 'success.main' : 'error.main'} sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Current
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: contractConfig.euriborImpact.currentEuriborRate < contractConfig.euriborImpact.originalEuriborRate ? 'success.main' : 'error.main' }}>
                        {formatPercentage(contractConfig.euriborImpact.currentEuriborRate, getPercentageDecimalPlaces(contractConfig.euriborImpact.currentEuriborRate))}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Interest rate comparison */}
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.8), border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                    Interest Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Original
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', textDecoration: 'line-through' }}>
                        {formatPercentage(contractConfig.euriborImpact.originalInterestRate, getPercentageDecimalPlaces(contractConfig.euriborImpact.originalInterestRate))}
                      </Typography>
                    </Box>
                    <ArrowForward sx={{ color: 'info.main', fontSize: 20 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color={contractConfig.euriborImpact.currentInterestRate < contractConfig.euriborImpact.originalInterestRate ? 'success.main' : 'error.main'} sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Current
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: contractConfig.euriborImpact.currentInterestRate < contractConfig.euriborImpact.originalInterestRate ? 'success.main' : 'error.main' }}>
                        {formatPercentage(contractConfig.euriborImpact.currentInterestRate, getPercentageDecimalPlaces(contractConfig.euriborImpact.currentInterestRate))}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Monthly payment comparison */}
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.8), border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                    Monthly Payment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Original
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', textDecoration: 'line-through' }}>
                        {formatCurrency(contractConfig.euriborImpact.originalMonthlyPayment)}
                      </Typography>
                    </Box>
                    <ArrowForward sx={{ color: 'info.main', fontSize: 20 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color={contractConfig.euriborImpact.currentMonthlyPayment < contractConfig.euriborImpact.originalMonthlyPayment ? 'success.main' : 'error.main'} sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Current
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: contractConfig.euriborImpact.currentMonthlyPayment < contractConfig.euriborImpact.originalMonthlyPayment ? 'success.main' : 'error.main' }}>
                        {formatCurrency(contractConfig.euriborImpact.currentMonthlyPayment)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Individual changes table */}
            {contractConfig.euriborImpact.changes && contractConfig.euriborImpact.changes.length > 0 && (
              <Box sx={{ mt: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  Rate Change History
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.info.main, 0.06) }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>From Payment #</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Euribor Rate</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Interest Rate</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Monthly Payment</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Payment Change</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>Total Interest Impact</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contractConfig.euriborImpact.changes.map((change: any, index: number) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': { bgcolor: alpha(theme.palette.action.hover, 0.02) },
                            '&:last-child td': { borderBottom: 0 },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                            {new Date(change.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.82rem' }}>#{change.startingPaymentNumber}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.82rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                                {formatPercentage(change.oldEuriborRate, getPercentageDecimalPlaces(change.oldEuriborRate))}
                              </Typography>
                              <ArrowForward sx={{ fontSize: 14, color: 'info.main' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: change.newEuriborRate < change.oldEuriborRate ? 'success.main' : 'error.main' }}>
                                {formatPercentage(change.newEuriborRate, getPercentageDecimalPlaces(change.newEuriborRate))}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.82rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                                {formatPercentage(change.oldInterestRate, getPercentageDecimalPlaces(change.oldInterestRate))}
                              </Typography>
                              <ArrowForward sx={{ fontSize: 14, color: 'info.main' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: change.newInterestRate < change.oldInterestRate ? 'success.main' : 'error.main' }}>
                                {formatPercentage(change.newInterestRate, getPercentageDecimalPlaces(change.newInterestRate))}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.82rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                                {formatCurrency(change.oldMonthlyPayment)}
                              </Typography>
                              <ArrowForward sx={{ fontSize: 14, color: 'info.main' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: change.newMonthlyPayment < change.oldMonthlyPayment ? 'success.main' : 'error.main' }}>
                                {formatCurrency(change.newMonthlyPayment)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${change.monthlyPaymentChange < 0 ? '-' : '+'}${formatCurrency(Math.abs(change.monthlyPaymentChange))}`}
                              size="small"
                              sx={{
                                bgcolor: change.monthlyPaymentChange < 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                color: change.monthlyPaymentChange < 0 ? 'success.dark' : 'error.dark',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.82rem' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                                  {formatCurrency(change.totalInterestBefore)}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 12, color: 'info.main' }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: change.totalInterestAfter < change.totalInterestBefore ? 'success.main' : 'error.main' }}>
                                  {formatCurrency(change.totalInterestAfter)}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${change.totalInterestChange < 0 ? '-' : '+'}${formatCurrency(Math.abs(change.totalInterestChange))}`}
                                size="small"
                                sx={{
                                  bgcolor: change.totalInterestChange < 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                  color: change.totalInterestChange < 0 ? 'success.dark' : 'error.dark',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  height: 20,
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
});

ContractFinancialOverview.displayName = 'ContractFinancialOverview';
