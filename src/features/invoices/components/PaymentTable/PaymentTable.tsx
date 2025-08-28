import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  TableSortLabel,
  Skeleton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Receipt
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Payment, PaymentStatus } from '../../types/invoice.types';
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHODS } from '../../constants/paymentConstants';
import { customerApi } from '../../../customers/api/customerApi';

interface PaymentTableProps {
  payments: Payment[];
  loading?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (field: string) => void;
  onViewPayment?: (paymentId: string) => void;
  onViewCustomer?: (customerId: string) => void;
  onViewContract?: (contractId: string) => void;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  loading = false,
  page = 0,
  pageSize = 10,
  totalCount = 0,
  sortBy,
  sortOrder = 'desc',
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onViewPayment,
  onViewCustomer,
  onViewContract
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);
  const [customerNames, setCustomerNames] = React.useState<Record<string, string>>({});
  const [loadingCustomers, setLoadingCustomers] = React.useState<Set<string>>(new Set());

  // Fetch customer names for visible payments
  React.useEffect(() => {
    if (!payments || payments.length === 0) return;

    const uniqueCustomerIds = [...new Set(payments.map(p => p.customerId))].filter(id => 
      id && !customerNames[id] && !loadingCustomers.has(id)
    );

    if (uniqueCustomerIds.length === 0) return;

    // Mark customers as loading
    setLoadingCustomers(prev => new Set([...prev, ...uniqueCustomerIds]));

    // Fetch customer names
    const fetchCustomerNames = async () => {
      const fetchPromises = uniqueCustomerIds.map(async (customerId) => {
        try {
          const customerResponse = await customerApi.getById(customerId);
          const customer = customerResponse.customer || customerResponse;
          
          let customerName = 'Unknown Customer';
          if (customer && customer.type) {
            if (customer.type === 'individual' || customer.type === 'endorser') {
              customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer';
            } else if (customer.type === 'business') {
              customerName = customer.legalName || 'Unknown Business';
            }
          }
          
          return { customerId, customerName };
        } catch (error) {
          return { customerId, customerName: `${customerId.substring(0, 8)}...` };
        }
      });

      try {
        const results = await Promise.allSettled(fetchPromises);
        const newCustomerNames: Record<string, string> = {};
        
        results.forEach((result, index) => {
          const customerId = uniqueCustomerIds[index];
          if (result.status === 'fulfilled') {
            newCustomerNames[result.value.customerId] = result.value.customerName;
          } else {
            newCustomerNames[customerId] = `${customerId.substring(0, 8)}...`;
          }
        });

        setCustomerNames(prev => ({ ...prev, ...newCustomerNames }));
      } catch (error) {
        // Fallback for failed requests
        const fallbackNames: Record<string, string> = {};
        uniqueCustomerIds.forEach(id => {
          fallbackNames[id] = `${id.substring(0, 8)}...`;
        });
        setCustomerNames(prev => ({ ...prev, ...fallbackNames }));
      } finally {
        // Remove from loading state
        setLoadingCustomers(prev => {
          const newSet = new Set(prev);
          uniqueCustomerIds.forEach(id => newSet.delete(id));
          return newSet;
        });
      }
    };

    fetchCustomerNames();
  }, [payments]); // Only depend on payments, not page/pageSize

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, payment: Payment) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayment(null);
  };

  const handleSort = (field: string) => {
    if (onSortChange) {
      onSortChange(field);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numericAmount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  };

  const getPaymentMethodInfo = (method?: string) => {
    if (!method) return null;
    return PAYMENT_METHODS.find(m => m.value === method);
  };

  const isOverdue = (payment: Payment) => {
    if (payment.status === PaymentStatus.PAID) return false;
    const dueDate = typeof payment.dueDate === 'string' ? new Date(payment.dueDate) : payment.dueDate;
    return dueDate < new Date();
  };

  const getDaysPastDue = (dueDate: Date | string) => {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderSkeletonRow = () => (
    <TableRow>
      {Array.from({ length: 9 }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton variant="text" />
        </TableCell>
      ))}
    </TableRow>
  );

  const renderPaymentRow = (payment: Payment) => {
    // Check if payment is actually a Payment object
    if (!payment || typeof payment !== 'object' || !payment.id) {
      console.error('Invalid payment object:', payment);
      return (
        <TableRow>
          <TableCell colSpan={10}>
            <Typography variant="body2" color="error">
              Invalid payment data
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    const statusConfig = PAYMENT_STATUS_CONFIG[payment.status];
    const StatusIcon = statusConfig?.icon;
    const paymentMethodInfo = getPaymentMethodInfo(payment.paymentMethod);
    const overdue = isOverdue(payment);
    const daysPastDue = overdue ? getDaysPastDue(payment.dueDate) : 0;

    return (
      <TableRow
        key={payment.id}
        hover
        onClick={() => onViewPayment?.(payment.id)}
        sx={{ 
          cursor: 'pointer',
          '&:hover': { 
            backgroundColor: 'action.hover' 
          }
        }}
      >
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {payment.id.substring(0, 8)}...
          </Typography>
        </TableCell>
        
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatCurrency(payment.amount)}
          </Typography>
          {payment.appliedAmount && parseFloat(String(payment.appliedAmount)) !== parseFloat(String(payment.amount)) && (
            <Typography variant="caption" color="text.secondary">
              Applied: {formatCurrency(payment.appliedAmount)}
            </Typography>
          )}
        </TableCell>
        
        <TableCell>
          <Typography variant="body2">
            {formatDate(payment.dueDate)}
          </Typography>
          {overdue && (
            <Typography variant="caption" color="error.main">
              {daysPastDue} days overdue
            </Typography>
          )}
        </TableCell>
        
        <TableCell>
          {payment.paymentDate ? (
            <Typography variant="body2">
              {formatDate(payment.paymentDate)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Not paid
            </Typography>
          )}
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
                color: statusConfig.color
              }
            }}
          />
        </TableCell>
        
        <TableCell>
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {payment.type.replace('_', ' ')}
          </Typography>
        </TableCell>
        
        <TableCell>
          {paymentMethodInfo ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: paymentMethodInfo.color,
                  fontSize: '0.75rem'
                }}
              >
                <paymentMethodInfo.icon sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="body2">
                {paymentMethodInfo.label}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Not specified
            </Typography>
          )}
        </TableCell>
        
        <TableCell>
          <Box 
            component="span"
            onClick={(e) => {
              e.stopPropagation();
              onViewCustomer?.(payment.customerId);
            }}
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
              '&:hover': {
                color: 'primary.dark'
              }
            }}
          >
            <Typography variant="body2">
              {loadingCustomers.has(payment.customerId) ? (
                <Skeleton variant="text" width={100} height={20} />
              ) : (
                customerNames[payment.customerId] || `${payment.customerId.substring(0, 8)}...`
              )}
            </Typography>
          </Box>
        </TableCell>
        
        <TableCell>
          <Box 
            component="span"
            onClick={(e) => {
              e.stopPropagation();
              onViewContract?.(payment.contractId);
            }}
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
              '&:hover': {
                color: 'primary.dark'
              }
            }}
          >
            <Typography variant="body2">
               {payment.contractId.substring(0, 8)}...
            </Typography>
          </Box>
        </TableCell>
        
        <TableCell onClick={(e) => e.stopPropagation()}>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, payment)}
          >
            <MoreVert />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'id'}
                  direction={sortBy === 'id' ? sortOrder : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  Payment ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'amount'}
                  direction={sortBy === 'amount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'dueDate'}
                  direction={sortBy === 'dueDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('dueDate')}
                >
                  Due Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'paymentDate'}
                  direction={sortBy === 'paymentDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('paymentDate')}
                >
                  Payment Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'type'}
                  direction={sortBy === 'type' ? sortOrder : 'asc'}
                  onClick={() => handleSort('type')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Contract</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, index) => (
                  <React.Fragment key={index}>{renderSkeletonRow()}</React.Fragment>
                ))
              : payments.map(renderPaymentRow)
            }
            
            {!loading && payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No payments found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange?.(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => onPageSizeChange?.(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { onViewPayment?.(selectedPayment!.id); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); /* Add receipt generation logic */ }}>
          <Receipt sx={{ mr: 1 }} fontSize="small" />
          Generate Receipt
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default PaymentTable;
