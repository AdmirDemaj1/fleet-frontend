import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import {
  Calculate,
  AccountBalance,
  TrendingUp,
  Schedule,
  AttachMoney
} from '@mui/icons-material';
import { ContractType } from '../../types/contract.types';
import { LoanFormProps } from '../../types/contract.types';
import { useCalculateLoanPaymentQuery } from '../../api/contractApi';

export const LoanForm: React.FC<LoanFormProps> = ({
  data,
  onChange,
  errors = {},
  contractType,
  totalAmount = 0
}) => {
  const { control, formState: { errors: formErrors }, watch } = useFormContext();
  const contractStartDate = watch('startDate');
  const contractEndDate = watch('endDate');
  
  const [localData, setLocalData] = useState(data || {
    contractNumber: '',
    startDate: '',
    endDate: '', 
    interestRate: 0,
    loanTermMonths: 0,
    monthlyPayment: 0,
    processingFee: 0,
    earlyRepaymentPenalty: 0,
    paymentScheduleType: 'monthly_fixed'
  });

  // Auto-calculate payment when principal, rate, or term changes
  const shouldCalculate = localData.interestRate && 
                         localData.loanTermMonths && 
                         localData.interestRate > 0 && 
                         localData.loanTermMonths > 0;

  const {
    data: calculationResult,
    isLoading: isCalculating
  } = useCalculateLoanPaymentQuery({
    principal: totalAmount || 0,
    interestRate: localData.interestRate || 0,
    termMonths: localData.loanTermMonths || 0
  }, {
    skip: !shouldCalculate
  });

  useEffect(() => {
    if (calculationResult && !localData.monthlyPayment) {
      const updatedData = {
        ...localData,
        monthlyPayment: calculationResult.monthlyPayment
      };
      setLocalData(updatedData);
      onChange(updatedData);
    }
  }, [calculationResult, localData, onChange]);

  const handleFieldChange = (field: string, value: any) => {
    const updatedData = {
      ...localData,
      [field]: value
    };
    setLocalData(updatedData);
    onChange(updatedData);
  };

  const calculateTotalInterest = () => {
    if (localData.monthlyPayment && localData.loanTermMonths) {
      const totalPaid = localData.monthlyPayment * localData.loanTermMonths;
      const totalInterest = totalPaid - totalAmount;
      return totalInterest > 0 ? totalInterest : 0;
    }
    return 0;
  };

  const paymentScheduleOptions = [
    { value: 'monthly_fixed', label: 'Monthly Fixed Payment' },
    { value: 'monthly_declining', label: 'Monthly Declining Balance' },
    { value: 'quarterly', label: 'Quarterly Payment' },
    { value: 'custom', label: 'Custom Schedule' }
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalance color="primary" />
        {contractType === ContractType.LOAN ? 'Loan Details' : 'Leasing Details'}
      </Typography>

      <Grid container spacing={3}>
        {/* Contract Number for Loan Details */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="loanDetails.contractNumber"
            control={control}
            rules={{ required: 'Loan contract number is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Loan Contract Number"
                required
                error={!!(formErrors.loanDetails as any)?.contractNumber}
                helperText={(formErrors.loanDetails as any)?.contractNumber?.message as string || 'Unique loan agreement identifier'}
                value={field.value || ''}
              />
            )}
          />
        </Grid>

        {/* Loan Start Date */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="loanDetails.startDate"
            control={control}
            rules={{ required: 'Loan start date is required' }}
            render={({ field: { value, onChange, ...field } }) => (
              <DatePicker
                {...field}
                label="Loan Start Date"
                value={value ? dayjs(value) : (contractStartDate ? dayjs(contractStartDate) : null)}
                onChange={(newValue) => {
                  onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                }}
                minDate={contractStartDate ? dayjs(contractStartDate) : dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!(formErrors.loanDetails as any)?.startDate,
                    helperText: (formErrors.loanDetails as any)?.startDate?.message as string || 'When loan payments begin'
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Loan End Date */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="loanDetails.endDate"
            control={control}
            rules={{ required: 'Loan end date is required' }}
            render={({ field: { value, onChange, ...field } }) => (
              <DatePicker
                {...field}
                label="Loan End Date"
                value={value ? dayjs(value) : (contractEndDate ? dayjs(contractEndDate) : null)}
                onChange={(newValue) => {
                  onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                }}
                minDate={contractStartDate ? dayjs(contractStartDate).add(1, 'day') : dayjs().add(1, 'day')}
                maxDate={contractEndDate ? dayjs(contractEndDate) : undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!(formErrors.loanDetails as any)?.endDate,
                    helperText: (formErrors.loanDetails as any)?.endDate?.message as string || 'When loan is fully repaid'
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Interest Rate */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Annual Interest Rate"
            type="number"
            value={localData.interestRate || ''}
            onChange={(e) => handleFieldChange('interestRate', parseFloat(e.target.value) || 0)}
            error={!!errors.interestRate}
            helperText={errors.interestRate || 'Enter as decimal (e.g., 0.12 for 12%)'}
            InputProps={{
              startAdornment: <InputAdornment position="start"><TrendingUp /></InputAdornment>,
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
            inputProps={{
              min: 0,
              max: 1,
              step: 0.01
            }}
          />
        </Grid>

        {/* Loan Term */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Loan Term"
            type="number"
            value={localData.loanTermMonths || ''}
            onChange={(e) => handleFieldChange('loanTermMonths', parseInt(e.target.value) || 0)}
            error={!!errors.loanTermMonths}
            helperText={errors.loanTermMonths || 'Number of months'}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Schedule /></InputAdornment>,
              endAdornment: <InputAdornment position="end">months</InputAdornment>
            }}
            inputProps={{
              min: 1,
              max: 360
            }}
          />
        </Grid>

        {/* Monthly Payment */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Monthly Payment"
            type="number"
            value={localData.monthlyPayment || ''}
            onChange={(e) => handleFieldChange('monthlyPayment', parseFloat(e.target.value) || 0)}
            error={!!errors.monthlyPayment}
            helperText={errors.monthlyPayment || (isCalculating ? 'Calculating...' : 'Auto-calculated or enter manually')}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            inputProps={{
              min: 0,
              step: 0.01
            }}
          />
        </Grid>

        {/* Processing Fee */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Processing Fee"
            type="number"
            value={localData.processingFee || ''}
            onChange={(e) => handleFieldChange('processingFee', parseFloat(e.target.value) || 0)}
            error={!!errors.processingFee}
            helperText={errors.processingFee || 'One-time loan processing fee (optional)'}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            inputProps={{
              min: 0,
              step: 0.01
            }}
          />
        </Grid>

        {/* Early Repayment Penalty */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Early Repayment Penalty"
            type="number"
            value={localData.earlyRepaymentPenalty || ''}
            onChange={(e) => handleFieldChange('earlyRepaymentPenalty', parseFloat(e.target.value) || 0)}
            error={!!errors.earlyRepaymentPenalty}
            helperText={errors.earlyRepaymentPenalty || 'Penalty rate for early repayment (optional)'}
            InputProps={{
              startAdornment: <InputAdornment position="start"><TrendingUp /></InputAdornment>,
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
            inputProps={{
              min: 0,
              max: 1,
              step: 0.01
            }}
          />
        </Grid>

        {/* Payment Schedule Type */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.paymentScheduleType}>
            <InputLabel>Payment Schedule Type</InputLabel>
            <Select
              value={localData.paymentScheduleType || 'monthly_fixed'}
              label="Payment Schedule Type"
              onChange={(e) => handleFieldChange('paymentScheduleType', e.target.value)}
            >
              {paymentScheduleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Loan Summary Card */}
      {localData.monthlyPayment && localData.loanTermMonths && (
        <Card elevation={0} sx={{ mt: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calculate color="primary" />
              Loan Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ${localData.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption">Monthly Payment</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ${(localData.monthlyPayment * localData.loanTermMonths).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption">Total Amount Payable</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ${calculateTotalInterest().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption">Total Interest</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {((localData.interestRate || 0) * 100).toFixed(2)}%
                  </Typography>
                  <Typography variant="caption">Annual Interest Rate</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<Schedule />}
                label={`${localData.loanTermMonths} months`}
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<AttachMoney />}
                label={localData.paymentScheduleType?.replace('_', ' ') || 'Monthly Fixed'}
                variant="outlined"
                size="small"
              />
              {localData.processingFee && (
                <Chip
                  label={`Processing Fee: $${localData.processingFee}`}
                  variant="outlined"
                  size="small"
                  color="warning"
                />
              )}
              {localData.earlyRepaymentPenalty && (
                <Chip
                  label={`Early Penalty: ${(localData.earlyRepaymentPenalty * 100).toFixed(2)}%`}
                  variant="outlined"
                  size="small"
                  color="error"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Calculation Info */}
      {isCalculating && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Calculating loan payment details...
        </Alert>
      )}
    </Box>
  );
};
