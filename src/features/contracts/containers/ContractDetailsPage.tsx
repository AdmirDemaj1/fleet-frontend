import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Skeleton,
  Alert,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  BusinessCenter,
  TrendingUp,
  Person,
  DirectionsCar,
  Security,
  Receipt,
  History,
  FileDownload,
  AccountBalance,
  CalendarToday,
  AttachMoney,
  Schedule
} from '@mui/icons-material';
import { useGetContractQuery } from '../api/contractApi';
import { ContractType, ContractStatus } from '../types/contract.types';
import dayjs from 'dayjs';

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: contract, isLoading, error } = useGetContractQuery(id!);

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  // Format currency
  const formatCurrency = (amount: string): string => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  // Get status color
  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE:
        return 'success';
      case ContractStatus.DRAFT:
        return 'warning';
      case ContractStatus.COMPLETED:
        return 'info';
      case ContractStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Get type color
  const getTypeColor = (type: ContractType) => {
    switch (type) {
      case ContractType.LOAN:
        return 'primary';
      case ContractType.LEASING:
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="rectangular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width={200} height={32} />
          </Box>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error || !contract) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load contract details. Please try again.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/contracts')}
          >
            Back to Contracts
          </Button>
        </Box>
      </Container>
    );
  }

  const isLoan = contract.type === ContractType.LOAN;
  const isActive = contract.status === ContractStatus.ACTIVE;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/contracts')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {contract.contractNumber}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={isLoan ? 'Loan' : 'Leasing'}
                color={getTypeColor(contract.type)}
                variant="outlined"
                size="small"
              />
              <Chip
                label={contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                color={getStatusColor(contract.status)}
                variant={isActive ? "filled" : "outlined"}
                size="small"
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/contracts/${contract.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => {
                // TODO: Implement delete functionality
                console.log('Delete contract:', contract.id);
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: alpha(
                        isLoan 
                          ? theme.palette.primary.main 
                          : theme.palette.secondary.main,
                        0.1
                      ),
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    {isLoan ? (
                      <BusinessCenter sx={{ color: theme.palette.primary.main }} />
                    ) : (
                      <TrendingUp sx={{ color: theme.palette.secondary.main }} />
                    )}
                  </Box>
                  <Typography variant="h6">Basic Information</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Contract Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {contract.contractNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {isLoan ? 'Loan' : 'Leasing'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {contract.customerId?.slice(0, 8)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ mr: 2, color: theme.palette.success.main }} />
                  <Typography variant="h6">Financial Details</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h6" color="success.main" fontWeight={600}>
                      {formatCurrency(contract.totalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Remaining Amount
                    </Typography>
                    <Typography variant="h6" color="warning.main" fontWeight={600}>
                      {formatCurrency(contract.remainingAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Amount Paid
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency((parseFloat(contract.totalAmount) - parseFloat(contract.remainingAmount)).toString())}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {Math.round(((parseFloat(contract.totalAmount) - parseFloat(contract.remainingAmount)) / parseFloat(contract.totalAmount)) * 100)}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Dates */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday sx={{ mr: 2, color: theme.palette.info.main }} />
                  <Typography variant="h6">Important Dates</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(contract.startDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(contract.endDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(contract.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(contract.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Schedule sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6">Quick Actions</Typography>
                </Box>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Person />}
                      onClick={() => navigate(`/customers/${contract.customerId}`)}
                      size="small"
                    >
                      View Customer
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Receipt />}
                      onClick={() => navigate(`/contracts/${contract.id}/payments`)}
                      size="small"
                    >
                      Payments
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DirectionsCar />}
                      onClick={() => navigate(`/contracts/${contract.id}/vehicles`)}
                      size="small"
                    >
                      Vehicles
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Security />}
                      onClick={() => navigate(`/contracts/${contract.id}/collaterals`)}
                      size="small"
                    >
                      Collaterals
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<History />}
                      onClick={() => navigate(`/contracts/${contract.id}/logs`)}
                      size="small"
                    >
                      Activity Logs
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={() => navigate(`/contracts/${contract.id}/export`)}
                      size="small"
                    >
                      Export Data
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contract Timeline */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contract Timeline
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: theme.palette.success.main,
                      mr: 2
                    }}
                  />
                  <Typography variant="body2">
                    Contract created on {formatDate(contract.createdAt)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: theme.palette.info.main,
                      mr: 2
                    }}
                  />
                  <Typography variant="body2">
                    Contract period: {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: theme.palette.warning.main,
                      mr: 2
                    }}
                  />
                  <Typography variant="body2">
                    Last updated on {formatDate(contract.updatedAt)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 