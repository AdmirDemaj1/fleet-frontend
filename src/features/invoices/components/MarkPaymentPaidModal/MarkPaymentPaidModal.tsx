import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Divider,
  InputAdornment,
  useTheme,
  alpha
} from '@mui/material';
import { Payment } from '../../types/invoice.types';
import { LoadingSpinner } from '../../../../shared/components/LoadingSpinner';
import { useGetCustomerCreditBalanceQuery } from '../../api/paymentsApi';

export interface MarkPaymentPaidModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
  onMarkAsPaid: (data: {
    paymentDate: string;
    paymentMethod: string;
    actualAmountReceived: number;
    transactionReference?: string;
    notes?: string;
    overpaymentOption?: 'credit' | 'upcoming_payments';
    getFromCredit?: boolean;
    creditAmount?: number;
  }) => Promise<void>;
  loading?: boolean;
}

export const MarkPaymentPaidModal: React.FC<MarkPaymentPaidModalProps> = ({
  open,
  onClose,
  payment,
  onMarkAsPaid,
  loading = false
}) => {
  const theme = useTheme();
  
  // Form state
  const [formData, setFormData] = useState({
    actualAmountReceived: '',
    paymentMethod: 'bank_transfer',
    transactionReference: '',
    notes: ''
  });
  const [overpaymentOption, setOverpaymentOption] = useState<'credit' | 'upcoming_payments'>('credit');
  const [getFromCredit, setGetFromCredit] = useState(false);
  const [creditMode, setCreditMode] = useState<'full' | 'custom'>('full');
  const [customCreditAmount, setCustomCreditAmount] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const toCents = (v: unknown): number => {
    const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : 0;
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100);
  };

  const fromCents = (cents: number): string => {
    return (cents / 100).toFixed(2);
  };

  // Calculated values
  const totalPaymentAmountCents = payment ? toCents(payment.amount) : 0;
  const alreadyPaidAmountCents = payment ? toCents((payment as any).paidAmount || 0) : 0;
  const paymentAmountCents = Math.max(0, totalPaymentAmountCents - alreadyPaidAmountCents); // remaining due
  const paymentAmount = paymentAmountCents / 100;

  const actualAmountCents = toCents(formData.actualAmountReceived);
  const actualAmount = actualAmountCents / 100;

  const isOverpayment = actualAmountCents > paymentAmountCents;
  const overpaymentAmount = (actualAmountCents - paymentAmountCents) / 100;
  const isUnderpayment = actualAmountCents > 0 && actualAmountCents < paymentAmountCents;
  const underpaymentAmount = (paymentAmountCents - actualAmountCents) / 100;

  const { data: creditData, isLoading: isCreditLoading } =
    useGetCustomerCreditBalanceQuery(payment?.customerId ?? '', {
      skip: !open || !payment?.customerId,
    });
  const availableCreditCents = toCents((creditData as any)?.creditBalance ?? 0);
  const availableCredit = availableCreditCents / 100;
  const maxCreditUsableCents = Math.min(availableCreditCents, Math.max(0, paymentAmountCents - actualAmountCents));
  const maxCreditUsable = maxCreditUsableCents / 100;

  // If there is no credit available (or we haven't loaded it yet), ensure credit usage is off.
  useEffect(() => {
    if (!open) return;
    if (!isUnderpayment) return;
    if (isCreditLoading) return;
    if (availableCredit > 0) return;

    if (getFromCredit) {
      setGetFromCredit(false);
      setCreditMode('full');
      setCustomCreditAmount('');
    }
  }, [availableCredit, getFromCredit, isCreditLoading, isUnderpayment, open]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open && payment) {
      setFormData({
        actualAmountReceived: fromCents(paymentAmountCents),
        paymentMethod: 'bank_transfer',
        transactionReference: '',
        notes: ''
      });
      setOverpaymentOption('credit');
      setGetFromCredit(false);
      setCreditMode('full');
      setCustomCreditAmount('');
      setErrors({});
    }
  }, [open, payment, paymentAmountCents]);

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.actualAmountReceived) {
      newErrors.actualAmountReceived = 'Amount received is required';
    } else if (actualAmount <= 0) {
      newErrors.actualAmountReceived = 'Amount must be greater than 0';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (isUnderpayment && getFromCredit) {
      const maxUsableCents = Math.min(availableCreditCents, Math.max(0, paymentAmountCents - actualAmountCents));
      const maxUsable = maxUsableCents / 100;

      if (availableCredit <= 0) {
        newErrors.getFromCredit = 'Customer has no available credit';
      } else if (creditMode === 'custom') {
        const rawCents = toCents(customCreditAmount);
        if (!customCreditAmount) {
          newErrors.customCreditAmount = 'Credit amount is required';
        } else if (rawCents <= 0) {
          newErrors.customCreditAmount = 'Credit amount must be greater than 0';
        } else if (rawCents > maxUsableCents) {
          newErrors.customCreditAmount = `Credit amount cannot exceed €${maxUsable.toFixed(2)}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !payment) return;

    try {
      await onMarkAsPaid({
        paymentDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        paymentMethod: formData.paymentMethod,
        actualAmountReceived: actualAmount,
        transactionReference: formData.transactionReference || undefined,
        notes: formData.notes || undefined,
        overpaymentOption: isOverpayment ? overpaymentOption : undefined,
        getFromCredit: isUnderpayment ? getFromCredit : undefined,
        creditAmount:
          isUnderpayment && getFromCredit && creditMode === 'custom'
            ? toCents(customCreditAmount) / 100
            : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to mark payment as paid:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!payment) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[24]
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        fontWeight: 600,
        fontSize: '1.5rem',
        color: theme.palette.primary.main
      }}>
        Mark Payment as Paid
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {/* Payment Info */}
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
            Payment Details
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            Remaining Due: €{paymentAmount.toFixed(2)}
          </Typography>
          {alreadyPaidAmountCents > 0 && (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Total: €{fromCents(totalPaymentAmountCents)} • Paid: €{fromCents(alreadyPaidAmountCents)}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Due Date: {new Date(payment.dueDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            Customer Credit: {isCreditLoading ? 'Loading...' : `€${availableCredit.toFixed(2)}`}
          </Typography>
        </Box>

        {/* Amount Received Input */}
        <TextField
          fullWidth
          label="Amount Received"
          type="number"
          value={formData.actualAmountReceived}
          onChange={(e) => handleInputChange('actualAmountReceived', e.target.value)}
          error={!!errors.actualAmountReceived}
          helperText={errors.actualAmountReceived}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
          sx={{ mb: 3 }}
        />

        {/* Overpayment Alert */}
        {isOverpayment && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Overpayment Detected
              </Typography>
              <Typography variant="body2">
                Overpayment amount: €{overpaymentAmount.toFixed(2)}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Overpayment Options */}
        {isOverpayment && (
          <Box sx={{ mb: 3 }}>
            <FormControl component="fieldset">
              <FormLabel 
                component="legend" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.text.primary,
                  mb: 1
                }}
              >
                How would you like to handle the overpayment?
              </FormLabel>
              <RadioGroup
                value={overpaymentOption}
                onChange={(e) => setOverpaymentOption(e.target.value as 'credit' | 'upcoming_payments')}
              >
                <FormControlLabel 
                  value="credit" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Add to Customer Credits
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        The overpayment will be added to the customer's credit balance for future use
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, alignItems: 'flex-start', mt: 1 }}
                />
                <FormControlLabel 
                  value="upcoming_payments" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Apply to Upcoming Payments
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        The overpayment will be applied to reduce upcoming payment amounts
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* Underpayment Alert */}
        {isUnderpayment && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Partial Payment Detected
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Remaining amount: €{underpaymentAmount.toFixed(2)}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={getFromCredit}
                    disabled={isCreditLoading || availableCredit <= 0}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setGetFromCredit(checked);
                      if (!checked) {
                        setCreditMode('full');
                        setCustomCreditAmount('');
                      }
                      if (errors.getFromCredit) {
                        setErrors(prev => ({ ...prev, getFromCredit: '' }));
                      }
                      if (errors.customCreditAmount) {
                        setErrors(prev => ({ ...prev, customCreditAmount: '' }));
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    Get remaining amount from customer credit
                  </Typography>
                }
              />

              {!isCreditLoading && availableCredit <= 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  No customer credit available.
                </Typography>
              )}

              {errors.getFromCredit && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                  {errors.getFromCredit}
                </Typography>
              )}

              {getFromCredit && availableCredit > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                      Credit to apply
                    </FormLabel>
                    <RadioGroup
                      value={creditMode}
                      onChange={(e) => {
                        setCreditMode(e.target.value as 'full' | 'custom');
                        setCustomCreditAmount('');
                        if (errors.customCreditAmount) {
                          setErrors(prev => ({ ...prev, customCreditAmount: '' }));
                        }
                      }}
                    >
                      <FormControlLabel
                        value="full"
                        control={<Radio />}
                        label={
                          <Typography variant="body2">
                            Apply full remaining from credit (up to €{Math.min(availableCredit, underpaymentAmount).toFixed(2)})
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="custom"
                        control={<Radio />}
                        label={<Typography variant="body2">Apply custom credit amount</Typography>}
                      />
                    </RadioGroup>
                  </FormControl>

                  {creditMode === 'custom' && (
                    <TextField
                      fullWidth
                      type="number"
                      label="Credit amount to use"
                      value={customCreditAmount}
                      onChange={(e) => {
                        // Keep input "as typed" (no auto-format/clamp while typing).
                        // Validation/clamping happens on submit via validateForm().
                        setCustomCreditAmount(e.target.value);
                        if (errors.customCreditAmount) {
                          setErrors(prev => ({ ...prev, customCreditAmount: '' }));
                        }
                      }}
                      error={!!errors.customCreditAmount}
                      helperText={errors.customCreditAmount}
                      inputProps={{
                        min: 0,
                        max: maxCreditUsable,
                        step: 0.01,
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      }}
                      sx={{ mt: 1.5 }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Payment Method */}
        <TextField
          fullWidth
          select
          label="Payment Method"
          value={formData.paymentMethod}
          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
          error={!!errors.paymentMethod}
          helperText={errors.paymentMethod}
          SelectProps={{
            native: true
          }}
          sx={{ mb: 3 }}
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="check">Check</option>
          <option value="card">Card Payment</option>
          <option value="other">Other</option>
        </TextField>

        {/* Transaction Reference */}
        <TextField
          fullWidth
          label="Transaction Reference (Optional)"
          value={formData.transactionReference}
          onChange={(e) => handleInputChange('transactionReference', e.target.value)}
          placeholder="e.g., Transfer ID, Check Number"
          sx={{ mb: 3 }}
        />

        {/* Notes */}
        <TextField
          fullWidth
          label="Notes (Optional)"
          multiline
          rows={3}
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Add any additional notes about this payment"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            mr: 2,
            minWidth: 100
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ 
            minWidth: 120,
            bgcolor: theme.palette.success.main,
            '&:hover': {
              bgcolor: theme.palette.success.dark
            }
          }}
        >
          {loading ? <LoadingSpinner size={20} /> : 'Mark as Paid'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarkPaymentPaidModal;
