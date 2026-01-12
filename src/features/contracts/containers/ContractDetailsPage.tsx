import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Alert,
  Skeleton
} from '@mui/material';
import { useGetContractQuery } from '../api/contractApi';
import { ContractType, ContractStatus } from '../types/contract.types';
import {
  ContractHeader,
  ContractFinancialOverview,
  ContractInformation,
  ContractTimeline,
  ContractPaymentSchedule,
  ContractPayments,
  ContractQuickActions,
  ContractDocuments
} from '../components';
import {
  AccountBalance,
  TrendingUp,
  CheckCircle,
  Pending,
  Error,
  Warning
} from '@mui/icons-material';

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: contract, isLoading, error } = useGetContractQuery(id!);

  // Enhanced contract configuration
  const contractConfig = useMemo(() => {
    if (!contract) return null;

    const isLoan = contract.type === ContractType.LOAN;
    
    // Parse principal and interest amounts
    const principalAmount = contract.principalAmount ? parseFloat(contract.principalAmount) : null;
    const interestAmount = contract.interestAmount ? parseFloat(contract.interestAmount) : null;
    const remainingPrincipalAmount = contract.remainingPrincipalAmount ? parseFloat(contract.remainingPrincipalAmount) : null;
    const remainingInterestAmount = contract.remainingInterestAmount ? parseFloat(contract.remainingInterestAmount) : null;

    // Calculate total value as principal + interest when available, fallback to contract totalAmount
    const totalAmount = (principalAmount && interestAmount) 
      ? principalAmount + interestAmount 
      : parseFloat(contract.totalAmount);
    
    // Calculate remaining amount as remainingPrincipal + remainingInterest when available, fallback to contract remainingAmount
    const remainingAmount = (remainingPrincipalAmount !== null && remainingInterestAmount !== null)
      ? remainingPrincipalAmount + remainingInterestAmount
      : parseFloat(contract.remainingAmount);
    
    const paidAmount = totalAmount - remainingAmount;
    const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    // Calculate paid amounts for principal and interest
    const paidPrincipalAmount = principalAmount && remainingPrincipalAmount ? principalAmount - remainingPrincipalAmount : null;
    const paidInterestAmount = interestAmount && remainingInterestAmount ? interestAmount - remainingInterestAmount : null;

    return {
      isLoan,
      totalAmount,
      remainingAmount,
      paidAmount,
      progressPercentage,
      principalAmount,
      interestAmount,
      remainingPrincipalAmount,
      remainingInterestAmount,
      paidPrincipalAmount,
      paidInterestAmount,
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
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <ContractHeader contract={contract} contractConfig={contractConfig} />

      {/* Financial Overview */}
      <ContractFinancialOverview contractConfig={contractConfig} />

      <Grid container spacing={4}>
        {/* Left Column - Contract Information */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* Contract Information */}
            <Grid item xs={12}>
              <ContractInformation contract={contract} contractConfig={contractConfig} />
            </Grid>

            {/* Contract Timeline */}
            <Grid item xs={12}>
              <ContractTimeline contract={contract} />
            </Grid>

            {/* Contract Payment Schedule */}
            <Grid item xs={12}>
              <ContractPaymentSchedule contract={contract} />
            </Grid>

            {/* Contract Payments */}
            <Grid item xs={12}>
              <ContractPayments contractId={contract.id} />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Actions & Metrics */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <ContractQuickActions 
                contractId={contract.id} 
                customerId={contract.customerId}
                contract={contract}
              />
            </Grid>

            {/* Contract Metrics */}
            <Grid item xs={12}>
              <ContractDocuments contractId={contract.id} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}; 