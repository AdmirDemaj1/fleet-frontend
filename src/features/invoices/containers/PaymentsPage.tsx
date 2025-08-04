import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material';
import {
  Refresh,
  Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PaymentFilters, PaymentTable } from '../components';
import { usePayments } from '../hooks/usePayments';

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    payments,
    isLoading,
    isError,
    error,
    totalCount,
    filters,
    page,
    rowsPerPage,
    sortBy,
    sortOrder,
    hasActiveFilters,
    handleFiltersChange,
    handleClearFilters,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
    refetch
  } = usePayments();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const handleCreatePayment = () => {
    navigate('/payments/create');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export payments');
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ? String(error) : 'Failed to load payments. Please try again.'}
        </Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Payments & Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all payment transactions
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={payments.length === 0}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 2, 
        mb: 3 
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            {totalCount.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Payments
          </Typography>
        </Paper>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
            {payments.filter(p => p.status === 'paid').length.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Paid
          </Typography>
        </Paper>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
            {payments.filter(p => p.status === 'pending').length.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pending
          </Typography>
        </Paper>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
            {payments.filter(p => p.status === 'overdue').length.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overdue
          </Typography>
        </Paper>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <PaymentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {isLoading ? (
            'Loading payments...'
          ) : (
            <>
              Showing {payments.length} of {totalCount} payments
              {hasActiveFilters && ' (filtered)'}
            </>
          )}
        </Typography>
      </Box>

      {/* Table */}
      <PaymentTable
        payments={payments}
        loading={isLoading}
        page={page}
        pageSize={rowsPerPage}
        totalCount={totalCount}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onPageSizeChange={handleRowsPerPageChange}
        onSortChange={(field: string) => handleSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc')}
        onViewPayment={(paymentId: string) => navigate(`/payments/${paymentId}`)}
        onViewCustomer={handleViewCustomer}
      />

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isRefreshing}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default PaymentsPage;
