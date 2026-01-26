import React, { useState, useMemo, useReducer, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Receipt,
  CheckCircle,
  Schedule,
  Warning,
  Error as ErrorIcon,
  Pending,
  Visibility,
  Add,
  AttachMoney,
  FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentPaymentsByContractQuery, useCreatePrepaymentMutation } from '../../invoices/api/paymentsApi';
import { Payment, PaymentStatus, PaymentType } from '../../invoices/types/invoice.types';
import { format } from 'date-fns';
import { useNotification } from '../../../shared/hooks/useNotification';
import { ContractStatus } from '../types/contract.types';

interface ContractPaymentsProps {
  contractId: string;
  contractStatus?: ContractStatus;
}

// Dialog state interface for useReducer
interface ExtraPaymentDialogState {
  isOpen: boolean;
  amount: string;
  date: string;
  method: string;
  transactionReference: string;
  notes: string;
  prepaymentOption: 'reduce_term' | 'reduce_payment';
  startingFromPaymentNumber: number | null;
  startingFromPaymentId: string | null;
}

type DialogAction =
  | { type: 'OPEN_DIALOG' }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_METHOD'; payload: string }
  | { type: 'SET_TRANSACTION_REFERENCE'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'SET_PREPAYMENT_OPTION'; payload: 'reduce_term' | 'reduce_payment' }
  | { type: 'SET_STARTING_PAYMENT'; payload: { number: number | null; id: string | null } }
  | { type: 'RESET_STARTING_PAYMENT' };

const initialDialogState: ExtraPaymentDialogState = {
  isOpen: false,
  amount: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  method: 'bank_transfer',
  transactionReference: '',
  notes: '',
  prepaymentOption: 'reduce_payment',
  startingFromPaymentNumber: null,
  startingFromPaymentId: null,
};

function dialogReducer(state: ExtraPaymentDialogState, action: DialogAction): ExtraPaymentDialogState {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        ...initialDialogState,
        isOpen: true,
        date: format(new Date(), 'yyyy-MM-dd'),
      };
    case 'CLOSE_DIALOG':
      return initialDialogState;
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'SET_DATE':
      return {
        ...state,
        date: action.payload,
        startingFromPaymentNumber: null,
        startingFromPaymentId: null,
      };
    case 'SET_METHOD':
      return { ...state, method: action.payload };
    case 'SET_TRANSACTION_REFERENCE':
      return { ...state, transactionReference: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_PREPAYMENT_OPTION':
      return { ...state, prepaymentOption: action.payload };
    case 'SET_STARTING_PAYMENT':
      return {
        ...state,
        startingFromPaymentNumber: action.payload.number,
        startingFromPaymentId: action.payload.id,
      };
    case 'RESET_STARTING_PAYMENT':
      return {
        ...state,
        startingFromPaymentNumber: null,
        startingFromPaymentId: null,
      };
    default:
      return state;
  }
}

export const ContractPayments = React.memo<ContractPaymentsProps>(({ contractId, contractStatus }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const isCompletedContract = contractStatus === ContractStatus.COMPLETED;
  
  // Filter state management
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Extra Payment Dialog State - consolidated with useReducer
  const [dialogState, dispatch] = useReducer(dialogReducer, initialDialogState);
  const [createPrepayment, { isLoading: isCreatingPayment }] = useCreatePrepaymentMutation();

  // Fetch current payments for the contract with filters
  // RTK Query automatically handles caching and refetching when args change
  const { data: payments = [], isLoading, error } = useGetCurrentPaymentsByContractQuery({
    contractId,
    ...(statusFilter && { status: statusFilter as any }),
    ...(typeFilter && { type: typeFilter as any }),
  });

  const totalCount = payments.length;

  // Find conflicting unpaid payment when prepayment date is selected
  const conflictingPayment = useMemo(() => {
    if (!dialogState.date || !dialogState.isOpen) return null;

    const selectedDate = format(new Date(dialogState.date), 'yyyy-MM-dd');

    // Find unpaid scheduled payments that match the prepayment date
    const conflict = payments.find((payment: Payment) => {
      const paymentDueDate = format(new Date(payment.dueDate), 'yyyy-MM-dd');
      const isUnpaid = payment.status !== PaymentStatus.PAID;
      const isScheduled = payment.type === PaymentType.SCHEDULED;

      return paymentDueDate === selectedDate && isUnpaid && isScheduled;
    });

    return conflict || null;
  }, [dialogState.date, payments, dialogState.isOpen]);

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

  // Memoized event handlers for performance
  const handlePaymentClick = useCallback((paymentId: string) => {
    navigate(`/payments/${paymentId}`);
  }, [navigate]);

  const handleViewAllPayments = useCallback(() => {
    navigate(`/payments?contractId=${contractId}`);
  }, [navigate, contractId]);

  // Filter handlers - memoized
  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleTypeFilterChange = useCallback((value: string) => {
    setTypeFilter(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter('');
    setTypeFilter('');
  }, []);

  const handleOpenExtraPaymentDialog = useCallback(() => {
    if (isCompletedContract) return;
    dispatch({ type: 'OPEN_DIALOG' });
  }, [isCompletedContract]);

  const handleCloseExtraPaymentDialog = useCallback(() => {
    dispatch({ type: 'CLOSE_DIALOG' });
  }, []);

  const handleSubmitExtraPayment = useCallback(async () => {
    if (isCompletedContract) {
      showError('This contract is completed. Payments can no longer be modified.');
      return;
    }
    if (!dialogState.amount || parseFloat(dialogState.amount) <= 0) {
      showError('Please enter a valid payment amount');
      return;
    }

    if (!dialogState.method) {
      showError('Please select a payment method');
      return;
    }

    try {
      const prepaymentData = {
        contractId,
        amount: parseFloat(dialogState.amount),
        paymentDate: dialogState.date,
        paymentMethod: dialogState.method as 'cash' | 'bank_transfer' | 'online_banking' | 'credit_card' | 'debit_card' | 'check' | 'other',
        ...(dialogState.transactionReference && { transactionReference: dialogState.transactionReference }),
        ...(dialogState.notes && { notes: dialogState.notes }),
        prepaymentOption: dialogState.prepaymentOption,
        ...(dialogState.startingFromPaymentNumber !== null && { startingFromPaymentNumber: dialogState.startingFromPaymentNumber }),
        ...(dialogState.startingFromPaymentId !== null && { startingFromPaymentId: dialogState.startingFromPaymentId }),
      };

      const response = await createPrepayment(prepaymentData).unwrap();

      if (response.requiresApproval) {
        showSuccess(response.message || 'Prepayment request submitted for approval');
      } else {
        showSuccess('Prepayment recorded successfully');
      }

      dispatch({ type: 'CLOSE_DIALOG' });

      // Refetch payments to show the new payment
      // The query will automatically refetch due to cache invalidation
    } catch (error: any) {
      console.error('Error creating prepayment:', error);
      showError(
        error?.data?.message ||
        error?.message ||
        'Failed to record prepayment. Please try again.'
      );
    }
  }, [isCompletedContract, dialogState, contractId, createPrepayment, showError, showSuccess]);

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
                ? `${totalCount} payment${totalCount !== 1 ? 's' : ''}`
                : 'Payment schedule and history'
              }
            </Typography>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenExtraPaymentDialog}
            disabled={isCompletedContract}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark'
              }
            }}
          >
            Extra Payment
          </Button>
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
        </Stack>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
              Filters:
            </Typography>
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="late">Late</MenuItem>
              <MenuItem value="defaulted">Defaulted</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              label="Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="advance">Advance</MenuItem>
              <MenuItem value="extra">Extra</MenuItem>
            </Select>
          </FormControl>

          {(statusFilter || typeFilter) && (
            <Button
              size="small"
              onClick={handleClearFilters}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary'
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
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


      {/* Extra Payment Dialog */}
      <Dialog
        open={dialogState.isOpen}
        onClose={handleCloseExtraPaymentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: 'success.main',
                width: 40,
                height: 40
              }}
            >
              <AttachMoney />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Record Prepayment
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {isCompletedContract && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              This contract is completed. Payments can no longer be modified.
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Record a prepayment that exceeds the scheduled amount for this contract.
          </Typography>

          <TextField
            fullWidth
            label="Payment Amount"
            type="number"
            value={dialogState.amount}
            onChange={(e) => dispatch({ type: 'SET_AMOUNT', payload: e.target.value })}
            disabled={isCompletedContract}
            placeholder="0.00"
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: 'text.secondary' }}>
                  <AttachMoney sx={{ fontSize: 20 }} />
                </Box>
              ),
            }}
            sx={{ mb: 3 }}
            required
            error={dialogState.amount !== '' && parseFloat(dialogState.amount) <= 0}
            helperText={
              dialogState.amount !== '' && parseFloat(dialogState.amount) <= 0
                ? 'Amount must be greater than 0'
                : ''
            }
          />

          <TextField
            fullWidth
            label="Payment Date"
            type="date"
            value={dialogState.date}
            onChange={(e) => dispatch({ type: 'SET_DATE', payload: e.target.value })}
            disabled={isCompletedContract}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 3 }}
            required
          />

          {/* Conflict Warning */}
          {conflictingPayment && (
            <Alert 
              severity="warning" 
              sx={{ mb: 3 }}
              icon={<Warning />}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Date Conflict Detected
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                The selected date ({formatDate(conflictingPayment.dueDate)}) conflicts with an existing unpaid payment:
              </Typography>
              <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Payment #{conflictingPayment.paymentNumber || 'N/A'} - {formatCurrency(conflictingPayment.amount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due Date: {formatDate(conflictingPayment.dueDate)} | Status: {conflictingPayment.status}
                </Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel id="affect-payment-label">Affect the payment from the prepayment?</InputLabel>
                <Select
                  labelId="affect-payment-label"
                  value={dialogState.startingFromPaymentNumber !== null ? dialogState.startingFromPaymentNumber : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== '') {
                      dispatch({
                        type: 'SET_STARTING_PAYMENT',
                        payload: { number: Number(value), id: conflictingPayment.id }
                      });
                    } else {
                      dispatch({ type: 'RESET_STARTING_PAYMENT' });
                    }
                  }}
                  label="Affect the payment from the prepayment?"
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Don't affect any payment</em>
                  </MenuItem>
                  {conflictingPayment.paymentNumber && (
                    <MenuItem value={conflictingPayment.paymentNumber}>
                      Affect Payment #{conflictingPayment.paymentNumber}
                    </MenuItem>
                  )}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {dialogState.startingFromPaymentNumber !== null
                    ? `The prepayment will be applied starting from Payment #${dialogState.startingFromPaymentNumber}`
                    : 'The prepayment will be recorded independently'}
                </Typography>
              </FormControl>
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 3 }} required>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={dialogState.method}
              onChange={(e) => dispatch({ type: 'SET_METHOD', payload: e.target.value })}
              label="Payment Method"
              disabled={isCompletedContract}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="online_banking">Online Banking</MenuItem>
              <MenuItem value="credit_card">Credit Card</MenuItem>
              <MenuItem value="debit_card">Debit Card</MenuItem>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Transaction Reference"
            value={dialogState.transactionReference}
            onChange={(e) => dispatch({ type: 'SET_TRANSACTION_REFERENCE', payload: e.target.value })}
            disabled={isCompletedContract}
            placeholder="Optional transaction reference or confirmation number"
            sx={{ mb: 3 }}
            inputProps={{ maxLength: 100 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Prepayment Option</InputLabel>
            <Select
              value={dialogState.prepaymentOption}
              onChange={(e) => dispatch({ type: 'SET_PREPAYMENT_OPTION', payload: e.target.value as 'reduce_term' | 'reduce_payment' })}
              label="Prepayment Option"
              disabled={isCompletedContract}
            >
              <MenuItem value="reduce_payment">Reduce Payment (keep same term, lower payments)</MenuItem>
              <MenuItem value="reduce_term">Reduce Term (keep same payment, fewer months)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Notes"
            value={dialogState.notes}
            onChange={(e) => dispatch({ type: 'SET_NOTES', payload: e.target.value })}
            disabled={isCompletedContract}
            placeholder="Optional additional notes about the prepayment"
            multiline
            rows={3}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseExtraPaymentDialog}
            disabled={isCreatingPayment}
            sx={{
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitExtraPayment}
            disabled={isCompletedContract || isCreatingPayment || !dialogState.amount || parseFloat(dialogState.amount) <= 0 || !dialogState.method}
            startIcon={isCreatingPayment ? <CircularProgress size={16} /> : <AttachMoney />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark'
              }
            }}
          >
            {isCreatingPayment ? 'Recording...' : 'Record Prepayment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
});

ContractPayments.displayName = 'ContractPayments';
