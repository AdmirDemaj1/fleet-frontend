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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculated values
  const paymentAmount = payment ? Number(payment.amount) : 0;
  const actualAmount = Number(formData.actualAmountReceived) || 0;
  const isOverpayment = actualAmount > paymentAmount;
  const overpaymentAmount = isOverpayment ? actualAmount - paymentAmount : 0;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open && payment) {
      setFormData({
        actualAmountReceived: payment.amount.toString(),
        paymentMethod: 'bank_transfer',
        transactionReference: '',
        notes: ''
      });
      setOverpaymentOption('credit');
      setErrors({});
    }
  }, [open, payment]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !payment) return;

    try {
      await onMarkAsPaid({
        paymentDate: new Date().toISOString(),
        paymentMethod: formData.paymentMethod,
        actualAmountReceived: actualAmount,
        transactionReference: formData.transactionReference || undefined,
        notes: formData.notes || undefined,
        overpaymentOption: isOverpayment ? overpaymentOption : undefined
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
            Due Amount: €{Number(payment.amount).toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Due Date: {new Date(payment.dueDate).toLocaleDateString()}
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
