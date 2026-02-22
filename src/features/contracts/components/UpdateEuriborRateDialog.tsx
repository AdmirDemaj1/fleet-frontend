import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Avatar,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  TrendingUp,
  Percent,
  CalendarToday,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useUpdateEuriborRateMutation } from '../api/contractApi';
import { useNotification } from '../../../shared/hooks/useNotification';
import { euriborApi } from '../../euribor/api/euriborApi';
import { EuriborTenor } from '../../euribor/types/euribor.types';
import { EuriborRate } from '../../euribor/types/euribor.types';
import { useGetCurrentPaymentsByContractQuery } from '../../invoices/api/paymentsApi';
import { PaymentType, Payment, PaymentStatus } from '../../invoices/types/invoice.types';
import dayjs from 'dayjs';

const EMPTY_PAYMENTS: Payment[] = [];

interface UpdateEuriborRateDialogProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  currentEuriborRate?: number;
  currentMargin?: number;
}

export const UpdateEuriborRateDialog: React.FC<UpdateEuriborRateDialogProps> = ({
  open,
  onClose,
  contractId,
  currentEuriborRate,
  currentMargin,
}) => {
  const theme = useTheme();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [selectedEuriborRateId, setSelectedEuriborRateId] = useState<string>('');
  const [availableEuriborRates, setAvailableEuriborRates] = useState<EuriborRate[]>([]);
  const [loadingEuriborRates, setLoadingEuriborRates] = useState<boolean>(false);
  const [margin, setMargin] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedPaymentNumber, setSelectedPaymentNumber] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [closestPayments, setClosestPayments] = useState<{ previous: Payment | null; next: Payment | null }>({ previous: null, next: null });
  const [errors, setErrors] = useState<{ euriborRate?: string; margin?: string; effectiveDate?: string; paymentNumber?: string }>({});

  const [updateEuriborRate, { isLoading }] = useUpdateEuriborRateMutation();

  // Fetch scheduled payments for the contract when date is selected
  // Only fetch when dialog is open and date is selected - RTK Query handles caching
  const { data: paymentsData, isLoading: isLoadingPayments } = useGetCurrentPaymentsByContractQuery(
    {
      contractId,
      type: PaymentType.SCHEDULED,
    },
    {
      skip: !effectiveDate || !open,
    }
  );
  const allPayments = (paymentsData as Payment[] | undefined) ?? EMPTY_PAYMENTS;

  // Filter payments to only include those with payment numbers and are unpaid
  const scheduledPayments = React.useMemo(() => {
    return (allPayments as Payment[]).filter(
      (payment: Payment) =>
        payment.paymentNumber !== null &&
        payment.paymentNumber !== undefined &&
        typeof payment.paymentNumber === 'number' &&
        payment.status !== PaymentStatus.PAID // Only include unpaid payments
    ) as Payment[];
  }, [allPayments]);

  // Fetch available Euribor rates when dialog opens
  useEffect(() => {
    const fetchAvailableEuriborRates = async () => {
      if (open) {
        setLoadingEuriborRates(true);
        try {
          const response = await euriborApi.getAll({
            tenor: EuriborTenor.TWELVE_MONTHS,
            isActive: true,
            limit: 100,
          });
          const rates = response.data || [];
          setAvailableEuriborRates(rates);
          console.log('📊 Available Euribor rates for selection:', rates.length);
        } catch (error) {
          console.error('❌ Error fetching available Euribor rates:', error);
          showError('Failed to load Euribor rates. Please try again.');
        } finally {
          setLoadingEuriborRates(false);
        }
      }
    };

    fetchAvailableEuriborRates();
  }, [open, showError]);

  // Initialize form with current values when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedEuriborRateId('');
      setMargin(currentMargin?.toString() || '');
      setEffectiveDate(null);
      setSelectedPaymentNumber(null);
      setSelectedPaymentId(null);
      setClosestPayments({ previous: null, next: null });
      setErrors({});
    }
  }, [open, currentMargin]);

  // Find closest payments when date is selected
  useEffect(() => {
    if (effectiveDate && scheduledPayments.length > 0) {
      const selectedDate = effectiveDate.startOf('day');
      
      let previousPayment: Payment | null = null;
      let nextPayment: Payment | null = null;
      let previousDiff = Infinity;
      let nextDiff = Infinity;

      scheduledPayments.forEach((payment) => {
        // Use dueDate for comparison (paymentDate might not be set for scheduled payments)
        const paymentDate = dayjs(payment.dueDate).startOf('day');
        const diff = paymentDate.diff(selectedDate, 'days');
        
        if (diff < 0 && Math.abs(diff) < previousDiff) {
          // This is a previous payment closer to the selected date
          previousPayment = payment;
          previousDiff = Math.abs(diff);
        } else if (diff >= 0 && diff < nextDiff) {
          // This is a next payment closer to the selected date
          nextPayment = payment;
          nextDiff = diff;
        }
      });

      setClosestPayments({ previous: previousPayment, next: nextPayment });
      
      // Auto-select the next payment if available, otherwise previous
      if (nextPayment && 'paymentNumber' in nextPayment) {
        const nextPaymentTyped = nextPayment as Payment;
        const nextPaymentNumber = nextPaymentTyped.paymentNumber;
        if (typeof nextPaymentNumber === 'number') {
          setSelectedPaymentNumber(nextPaymentNumber);
          setSelectedPaymentId(nextPaymentTyped.id);
        } else {
          setSelectedPaymentNumber(null);
          setSelectedPaymentId(null);
        }
      } else if (previousPayment && 'paymentNumber' in previousPayment) {
        const previousPaymentTyped = previousPayment as Payment;
        const previousPaymentNumber = previousPaymentTyped.paymentNumber;
        if (typeof previousPaymentNumber === 'number') {
          setSelectedPaymentNumber(previousPaymentNumber);
          setSelectedPaymentId(previousPaymentTyped.id);
        } else {
          setSelectedPaymentNumber(null);
          setSelectedPaymentId(null);
        }
      } else {
        setSelectedPaymentNumber(null);
        setSelectedPaymentId(null);
      }
    } else {
      setClosestPayments({ previous: null, next: null });
      setSelectedPaymentNumber(null);
      setSelectedPaymentId(null);
    }
  }, [effectiveDate, scheduledPayments]);

  const validateForm = (): boolean => {
    const newErrors: { euriborRate?: string; margin?: string; effectiveDate?: string } = {};

    // Validate Euribor rate selection
    if (!selectedEuriborRateId || selectedEuriborRateId.trim() === '') {
      newErrors.euriborRate = 'Please select a Euribor rate';
    } else {
      const selectedRate = availableEuriborRates.find(r => r.id === selectedEuriborRateId);
      if (!selectedRate) {
        newErrors.euriborRate = 'Selected rate not found';
      }
    }

    // Validate effective date (optional - future dates are allowed)
    // No validation needed for future dates

    // Validate margin (optional)
    if (margin && margin.trim() !== '') {
      const marginValue = parseFloat(margin);
      if (isNaN(marginValue)) {
        newErrors.margin = 'Please enter a valid number';
      } else if (marginValue < 0) {
        newErrors.margin = 'Margin must be greater than or equal to 0';
      } else if (marginValue > 1) {
        // If > 1, assume it's percentage format and convert
        // We'll handle this in handleSubmit
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const selectedRate = availableEuriborRates.find(r => r.id === selectedEuriborRateId);
      if (!selectedRate) {
        showError('Selected Euribor rate not found');
        return;
      }

      const updateData: any = {
        euriborRateId: selectedEuriborRateId, // Send the rate ID instead of the rate value
      };

      // Include effective date if provided
      if (effectiveDate) {
        updateData.effectiveDate = effectiveDate.format('YYYY-MM-DD');
      }

      // Include selected payment number and ID if provided
      if (selectedPaymentNumber !== null) {
        updateData.activeFromPaymentNumber = selectedPaymentNumber;
      }
      if (selectedPaymentId !== null) {
        updateData.activeFromPaymentId = selectedPaymentId;
      }

      // Only include margin if provided
      if (margin && margin.trim() !== '') {
        let marginValue = parseFloat(margin);
        // If margin > 1, assume it's percentage format and convert to decimal
        if (marginValue > 1) {
          marginValue = marginValue / 100;
        }
        updateData.margin = marginValue;
      }

      console.log('🔄 Updating Euribor rate with:', {
        euriborRateId: updateData.euriborRateId,
        margin: updateData.margin,
        effectiveDate: updateData.effectiveDate,
        activeFromPaymentNumber: updateData.activeFromPaymentNumber,
        activeFromPaymentId: updateData.activeFromPaymentId,
        selectedRateValue: selectedRate.rateValue,
        selectedRateDate: selectedRate.rateDate,
      });

      const response = await updateEuriborRate({
        contractId,
        data: updateData,
      }).unwrap();

      // Display the message from the API response
      if (response?.data?.message) {
        if (response.data.skippedRecalculation) {
          // Show as info when recalculation was skipped
          showInfo(response.data.message);
        } else {
          // Show as success when recalculation was performed
          showSuccess(response.data.message);
        }
      } else {
      showSuccess('Euribor rate updated successfully');
      }
      handleClose();
    } catch (error: any) {
      console.error('Error updating Euribor rate:', error);
      showError(
        error?.data?.message ||
        error?.message ||
        'Failed to update Euribor rate. Please try again.'
      );
    }
  };

  const handleClose = () => {
    setSelectedEuriborRateId('');
    setMargin('');
    setEffectiveDate(null);
    setSelectedPaymentNumber(null);
    setSelectedPaymentId(null);
    setClosestPayments({ previous: null, next: null });
    setErrors({});
    onClose();
  };

  const selectedRate = availableEuriborRates.find(r => r.id === selectedEuriborRateId);
  const isFormValid = selectedEuriborRateId && !errors.euriborRate && !errors.margin && !errors.effectiveDate && !errors.paymentNumber;
  
  // Format payment for display
  const formatPayment = (payment: Payment) => {
    const dateStr = dayjs(payment.dueDate).format('MMM DD, YYYY');
    const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
    return `Payment #${payment.paymentNumber} - ${dateStr} (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount)})`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: 'info.main',
              width: 40,
              height: 40,
            }}
          >
            <TrendingUp />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Update Euribor Rate
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update the Euribor rate for this contract. This will recalculate the amortization schedule with the new rate.
        </Typography>

        {currentEuriborRate !== undefined && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Current Euribor Rate:</strong> {(currentEuriborRate * 100).toFixed(4)}%
              {currentMargin !== undefined && (
                <> | <strong>Current Margin:</strong> {(currentMargin * 100).toFixed(2)}%</>
              )}
            </Typography>
          </Alert>
        )}

        <FormControl fullWidth error={!!errors.euriborRate} required sx={{ mb: 3 }}>
          <InputLabel id="euribor-rate-select-label">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp fontSize="small" />
              New Euribor Rate
            </Box>
          </InputLabel>
          <Select
            labelId="euribor-rate-select-label"
            value={selectedEuriborRateId}
            onChange={(e) => {
              setSelectedEuriborRateId(e.target.value);
              if (errors.euriborRate) {
                setErrors({ ...errors, euriborRate: undefined });
              }
            }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp fontSize="small" />
                New Euribor Rate
              </Box>
            }
            disabled={loadingEuriborRates}
            renderValue={(value) => {
              if (loadingEuriborRates) {
                return 'Loading rates...';
              }
              if (!value) {
                return 'Select Euribor Rate';
              }
              const rate = availableEuriborRates.find(r => r.id === value);
              if (rate) {
                return `${(rate.rateValue * 100).toFixed(4)}% (${dayjs(rate.rateDate).format('MMM DD, YYYY')})`;
              }
              return 'Select Euribor Rate';
            }}
          >
            {loadingEuriborRates ? (
              <MenuItem disabled value="">
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Loading rates...
              </MenuItem>
            ) : availableEuriborRates.length === 0 ? (
              <MenuItem disabled value="">
                No Euribor rates available
              </MenuItem>
            ) : (
              availableEuriborRates.map((rate) => (
                <MenuItem key={rate.id} value={rate.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {(rate.rateValue * 100).toFixed(4)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(rate.rateDate).format('MMM DD, YYYY')}
                      {rate.rateSource && ` • ${rate.rateSource}`}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
          <FormHelperText>
            {errors.euriborRate ||
              (selectedRate
                ? `Selected rate: ${(selectedRate.rateValue * 100).toFixed(4)}% from ${dayjs(selectedRate.rateDate).format('MMM DD, YYYY')}`
                : 'Select a 12-month Euribor rate to apply')}
          </FormHelperText>
        </FormControl>

        <DatePicker
          label="Effective Date (Optional)"
          value={effectiveDate}
          onChange={(newDate) => {
            setEffectiveDate(newDate);
            setSelectedPaymentNumber(null);
            setSelectedPaymentId(null);
            if (errors.effectiveDate) {
              setErrors({ ...errors, effectiveDate: undefined });
            }
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.effectiveDate,
              helperText: errors.effectiveDate || 'Select when the Euribor rate change should take effect. Leave empty to apply immediately.',
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            },
          }}
          sx={{ mb: 3 }}
        />

        {/* Payment Selection - Show when date is selected */}
        {effectiveDate && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              Active from payment...
            </Typography>
            {isLoadingPayments ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Loading payment schedule...
                </Typography>
              </Box>
            ) : closestPayments.previous || closestPayments.next ? (
              <FormControl fullWidth error={!!errors.paymentNumber}>
                <Select
                  value={selectedPaymentNumber || ''}
                  onChange={(e) => {
                    const paymentNumber = e.target.value as number;
                    setSelectedPaymentNumber(paymentNumber);
                    // Find and set the payment ID
                    let payment: Payment | null = null;
                    if (closestPayments.previous && closestPayments.previous.paymentNumber === paymentNumber) {
                      payment = closestPayments.previous;
                    } else if (closestPayments.next && closestPayments.next.paymentNumber === paymentNumber) {
                      payment = closestPayments.next;
                    }
                    setSelectedPaymentId(payment?.id || null);
                    if (errors.paymentNumber) {
                      setErrors({ ...errors, paymentNumber: undefined });
                    }
                  }}
                  displayEmpty
                  renderValue={(value) => {
                    if (!value) return 'Select a payment';
                    let payment: Payment | null = null;
                    if (closestPayments.previous && closestPayments.previous.paymentNumber === value) {
                      payment = closestPayments.previous;
                    } else if (closestPayments.next && closestPayments.next.paymentNumber === value) {
                      payment = closestPayments.next;
                    }
                    return payment ? formatPayment(payment) : `Payment #${value}`;
                  }}
                >
                  {closestPayments.previous && (
                    <MenuItem value={closestPayments.previous.paymentNumber!}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatPayment(closestPayments.previous)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Previous payment
                        </Typography>
                      </Box>
                    </MenuItem>
                  )}
                  {closestPayments.next && (
                    <MenuItem value={closestPayments.next.paymentNumber!}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatPayment(closestPayments.next)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Next payment
                        </Typography>
                      </Box>
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  {errors.paymentNumber || 'Select which payment the new rate should become active from'}
                </FormHelperText>
              </FormControl>
            ) : (
              <Alert severity="info" sx={{ py: 1 }}>
                <Typography variant="body2">
                  No payment schedule available for this contract.
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        <TextField
          fullWidth
          label="Margin (Optional)"
          type="number"
          value={margin}
          onChange={(e) => {
            setMargin(e.target.value);
            if (errors.margin) {
              setErrors({ ...errors, margin: undefined });
            }
          }}
          placeholder="0.03"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Percent sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            inputProps: {
              step: '0.01',
              min: 0,
            },
          }}
          sx={{ mb: 2 }}
          error={!!errors.margin}
          helperText={
            errors.margin ||
            'Enter the margin as a decimal (e.g., 0.03 for 3%). Leave empty to keep current margin.'
          }
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid}
          startIcon={isLoading ? <CircularProgress size={16} /> : <TrendingUp />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: 'info.main',
            '&:hover': {
              bgcolor: 'info.dark',
            },
          }}
        >
          {isLoading ? 'Updating...' : 'Update Rate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

