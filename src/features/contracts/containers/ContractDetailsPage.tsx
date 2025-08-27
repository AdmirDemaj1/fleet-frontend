import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  Skeleton,
  Divider,
  useTheme,
  alpha,
  Paper,
  LinearProgress,
  Avatar,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  AttachMoney,
  CalendarToday,
  Schedule,
  Person,
  Receipt,
  DirectionsCar,
  Security,
  History,
  TrendingUp,
  CheckCircle,
  Pending,
  Error,
  Warning,
  AccountBalance,
  Assignment,
  Timeline,
  EventNote,
  FiberManualRecord,
  Share,
  Print,
  Download,
  Assessment,
  Analytics,
  Speed
} from '@mui/icons-material';
import { useGetContractQuery } from '../api/contractApi';
import { ContractType, ContractStatus } from '../types/contract.types';
import dayjs from 'dayjs';

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: contract, isLoading, error } = useGetContractQuery(id!);

  // Enhanced formatting functions
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM DD, YYYY');
  };

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

  // Enhanced contract configuration
  const contractConfig = useMemo(() => {
    if (!contract) return null;

    const isLoan = contract.type === ContractType.LOAN;
    const totalAmount = parseFloat(contract.totalAmount);
    const remainingAmount = parseFloat(contract.remainingAmount);
    const paidAmount = totalAmount - remainingAmount;
    const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    return {
      isLoan,
      totalAmount,
      remainingAmount,
      paidAmount,
      progressPercentage,
      type: {
        icon: isLoan ? AccountBalance : TrendingUp,
        color: isLoan ? 'primary' : 'secondary',
        label: isLoan ? 'Loan Agreement' : 'Leasing Agreement',
        description: isLoan 
          ? 'Traditional financing with ownership transfer'
          : 'Asset usage with flexible terms'
      },
      status: {
        icon: contract.status === ContractStatus.ACTIVE ? CheckCircle :
              contract.status === ContractStatus.DRAFT ? Pending :
              contract.status === ContractStatus.COMPLETED ? CheckCircle :
              contract.status === ContractStatus.CANCELLED ? Error : Warning,
        color: contract.status === ContractStatus.ACTIVE ? 'success' :
               contract.status === ContractStatus.DRAFT ? 'warning' :
               contract.status === ContractStatus.COMPLETED ? 'info' :
               contract.status === ContractStatus.CANCELLED ? 'error' : 'default',
        label: contract.status.charAt(0).toUpperCase() + contract.status.slice(1)
      }
    };
  }, [contract]);

  // Enhanced loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Skeleton 
                variant="rectangular" 
                height={200} 
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Enhanced error state
  if (error || !contract || !contractConfig) {
    return (
      <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            '& .MuiAlert-message': { fontWeight: 500 }
          }}
        >
          Failed to load contract details. Please try again.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/contracts')}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Back to Contracts
        </Button>
      </Box>
    );
  }

  const isActive = contract.status === ContractStatus.ACTIVE;

  return (
    <Box sx={{ p: 4 }}>
      {/* Premium Header Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              bgcolor: contractConfig.type.color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3,
              boxShadow: theme.shadows[4]
            }}
          >
            <contractConfig.type.icon sx={{ 
              color: 'white', 
              fontSize: 36
            }} />
          </Box>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: contractConfig.type.color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main,
                mb: 1,
                letterSpacing: '-0.02em'
              }}
            >
              {contract.contractNumber}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Chip
                icon={<contractConfig.type.icon />}
                label={contractConfig.type.label}
                color={contractConfig.type.color as any}
                variant="filled"
                sx={{ 
                  fontWeight: 600,
                  '& .MuiChip-icon': { fontSize: 16 }
                }}
              />
              <Chip
                icon={<contractConfig.status.icon />}
                label={contractConfig.status.label}
                color={contractConfig.status.color as any}
                variant={isActive ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              {contractConfig.type.description}
            </Typography>
          </Box>
        </Box>
        
        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Tooltip title="Share Contract">
            <IconButton 
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Contract">
            <IconButton 
              sx={{ 
                bgcolor: alpha(theme.palette.info.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
              }}
            >
              <Print />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/contracts/${contract.id}/edit`)}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            Edit Contract
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 3,
              '&:hover': { boxShadow: 6 }
            }}
          >
            Export PDF
          </Button>
        </Stack>
      </Box>

      {/* Financial Overview Banner */}
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

      <Grid container spacing={4}>
        {/* Contract Information */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Basic Information Card */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                bgcolor: theme.palette.background.paper
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mr: 2,
                    width: 48,
                    height: 48
                  }}
                >
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Contract Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Core contract details and identification
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
                      Contract Number
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {contract.contractNumber}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
                      Contract Type
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {contractConfig.type.label.split(' ')[0]}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
                      Status
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {contractConfig.status.label}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FiberManualRecord sx={{ fontSize: 8, mr: 1 }} />
                      Customer ID
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {contract.customerId?.slice(0, 8)}...
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Timeline Card */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                bgcolor: theme.palette.background.paper
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: 'info.main',
                    mr: 2,
                    width: 48,
                    height: 48
                  }}
                >
                  <Timeline />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Contract Timeline
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Key dates and milestones
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 14, mr: 1, color: 'success.main' }} />
                      Start Date
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatDate(contract.startDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventNote sx={{ fontSize: 14, mr: 1, color: 'warning.main' }} />
                      End Date
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatDate(contract.endDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Schedule sx={{ fontSize: 14, mr: 1, color: 'info.main' }} />
                      Created
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatDate(contract.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <History sx={{ fontSize: 14, mr: 1, color: 'secondary.main' }} />
                      Last Updated
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatDate(contract.updatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Contract Duration
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, dayjs().diff(dayjs(contract.startDate), 'day') / dayjs(contract.endDate).diff(dayjs(contract.startDate), 'day') * 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.grey[500], 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: theme.palette.info.main
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
                    {dayjs(contract.endDate).diff(dayjs(contract.startDate), 'month')} months
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Actions Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                bgcolor: theme.palette.background.paper
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => navigate(`/customers/${contract.customerId}`)}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  View Customer Profile
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => navigate(`/contracts/${contract.id}/payments`)}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: 'success.main',
                      bgcolor: alpha(theme.palette.success.main, 0.05)
                    }
                  }}
                >
                  Payment History
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DirectionsCar />}
                  onClick={() => navigate(`/contracts/${contract.id}/vehicles`)}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: 'info.main',
                      bgcolor: alpha(theme.palette.info.main, 0.05)
                    }
                  }}
                >
                  Vehicle Details
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => navigate(`/contracts/${contract.id}/collaterals`)}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: 'warning.main',
                      bgcolor: alpha(theme.palette.warning.main, 0.05)
                    }
                  }}
                >
                  Collateral Information
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Analytics />}
                  onClick={() => navigate(`/contracts/${contract.id}/analytics`)}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: alpha(theme.palette.secondary.main, 0.05)
                    }
                  }}
                >
                  Performance Analytics
                </Button>
              </Stack>
            </Paper>

            {/* Contract Metrics */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                bgcolor: theme.palette.background.paper
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Key Metrics
              </Typography>
              
              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Compliance
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      98%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={98}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.grey[500], 0.2),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        bgcolor: 'success.main'
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Risk Score
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      Low
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={25}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.grey[500], 0.2),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        bgcolor: 'warning.main'
                      }
                    }}
                  />
                </Box>

                <Divider />

                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Speed sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    A+
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Contract Rating
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}; 