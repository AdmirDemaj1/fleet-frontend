import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  Button,
  Stack,
  TablePagination
} from '@mui/material';
import {
  Receipt,
  CheckCircle,
  Schedule,
  Warning,
  Error as ErrorIcon,
  Pending,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetPaymentsByContractQuery } from '../../invoices/api/paymentsApi';
import { format } from 'date-fns';

interface ContractPaymentsProps {
  contractId: string;
}

export const ContractPayments: React.FC<ContractPaymentsProps> = ({ contractId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Direct pagination state management - using offset instead of page
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Calculate offset from page
  const offset = page * rowsPerPage;

  // Enhanced pagination handlers
  const handlePageChange = React.useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page
  }, []);

  // Create a unique query key using offset instead of page
  const queryKey = React.useMemo(() => {
    return {
      contractId,
      offset,
      limit: rowsPerPage
    };
  }, [contractId, offset, rowsPerPage]);

  const { data: paymentsResponse, isLoading, error, isFetching } = useGetPaymentsByContractQuery(queryKey, {
    // Force refetch when parameters change
    refetchOnMountOrArgChange: true
  });

  const payments = paymentsResponse?.data || [];
  const totalCount = paymentsResponse?.meta?.total || 0;

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          textColor: theme.palette.success.main,
          icon: CheckCircle
        };
      case 'pending':
        return {
          label: 'Pending',
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          textColor: theme.palette.warning.main,
          icon: Pending
        };
      case 'overdue':
        return {
          label: 'Overdue',
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          textColor: theme.palette.error.main,
          icon: ErrorIcon
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          textColor: theme.palette.info.main,
          icon: Schedule
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: theme.palette.text.secondary,
          bgcolor: alpha(theme.palette.text.secondary, 0.1),
          textColor: theme.palette.text.secondary,
          icon: Warning
        };
    }
  };

  const handlePaymentClick = (paymentId: string) => {
    navigate(`/payments/${paymentId}`);
  };

  const handleViewAllPayments = () => {
    navigate(`/payments?contractId=${contractId}`);
  };

  if (isLoading) {
    return (
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
          <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
          <Box>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={150} height={20} />
          </Box>
        </Box>
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load contract payments. Please try again.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: 'success.main',
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            <Receipt />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Contract Payments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount > 0 
                ? `Showing ${Math.min(page * rowsPerPage + 1, totalCount)}-${Math.min((page + 1) * rowsPerPage, totalCount)} of ${totalCount} payments`
                : 'Payment schedule and history'
              }
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={handleViewAllPayments}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          View All
        </Button>
      </Box>

      {payments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.grey[500], 0.1),
              color: 'text.secondary',
              mx: 'auto',
              mb: 2
            }}
          >
            <Receipt />
          </Avatar>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No Payments Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No payment records available for this contract.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment: any) => {
                const statusConfig = getStatusConfig(payment.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <TableRow 
                    key={payment.id}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => handlePaymentClick(payment.id)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(payment.dueDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<StatusIcon />}
                        label={statusConfig.label}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.bgcolor,
                          color: statusConfig.textColor,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: statusConfig.color,
                            fontSize: 16
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {payment.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentClick(payment.id);
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          minWidth: 'auto',
                          px: 2
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <Box sx={{ 
          mt: 2, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          pt: 2
        }}>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiTablePagination-toolbar': {
                px: 0,
                minHeight: 52
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 500,
                color: 'text.secondary'
              },
              '& .MuiTablePagination-select': {
                fontWeight: 600
              },
              '& .MuiIconButton-root': {
                borderRadius: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                },
                '&.Mui-disabled': {
                  opacity: 0.3
                }
              }
            }}
          />
        </Box>
      )}
    </Paper>
  );
};
