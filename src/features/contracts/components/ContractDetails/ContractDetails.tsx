import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, useFormContext } from 'react-hook-form';
import { ContractType } from '../../types/contract.types';
import dayjs from 'dayjs';

export const ContractDetails: React.FC = () => {
  const { control, formState: { errors }, watch } = useFormContext();
  
  const contractType = watch('type');
  const startDate = watch('startDate');

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
            Contract Details
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter the basic contract information including dates and terms.
          </Typography>
        </Grid>

        {/* Contract Type */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Contract type is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel id="contract-type-label">Contract Type</InputLabel>
                <Select
                  {...field}
                  labelId="contract-type-label"
                  label="Contract Type"
                  value={field.value || ''}
                >
                  <MenuItem value={ContractType.LOAN}>Loan</MenuItem>
                  <MenuItem value={ContractType.LEASING}>Leasing</MenuItem>
                </Select>
                {errors.type && (
                  <FormHelperText>{errors.type.message as string}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Contract Number */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="contractNumber"
            control={control}
            rules={{ required: 'Contract number is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Contract Number"
                fullWidth
                required
                error={!!errors.contractNumber}
                helperText={errors.contractNumber?.message as string || 'Unique contract identifier'}
                value={field.value || ''}
              />
            )}
          />
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="startDate"
            control={control}
            rules={{ required: 'Start date is required' }}
            render={({ field: { value, onChange, ...field } }) => (
              <DatePicker
                {...field}
                label="Contract Start Date"
                value={value ? dayjs(value) : null}
                onChange={(newValue) => {
                  onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                }}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate?.message as string || 'When the contract becomes effective'
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="endDate"
            control={control}
            rules={{ required: 'End date is required' }}
            render={({ field: { value, onChange, ...field } }) => (
              <DatePicker
                {...field}
                label="Contract End Date"
                value={value ? dayjs(value) : null}
                onChange={(newValue) => {
                  onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                }}
                minDate={startDate ? dayjs(startDate).add(1, 'day') : dayjs().add(1, 'day')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate?.message as string || 'When the contract expires'
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Total Amount */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="totalAmount"
            control={control}
            rules={{ 
              required: 'Total amount is required',
              min: { value: 1, message: 'Amount must be greater than 0' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Total Contract Amount"
                type="number"
                fullWidth
                required
                InputProps={{
                  startAdornment: <span style={{ marginRight: '8px' }}>$</span>
                }}
                inputProps={{ min: 0, step: 0.01 }}
                error={!!errors.totalAmount}
                helperText={errors.totalAmount?.message as string || 'Total value of the contract'}
                value={field.value || ''}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            )}
          />
        </Grid>

        {/* Terms Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Contract Terms & Conditions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="terms.paymentFrequency"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Payment Frequency</InputLabel>
                        <Select
                          {...field}
                          label="Payment Frequency"
                          value={field.value || 'monthly'}
                        >
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="bi-weekly">Bi-Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="quarterly">Quarterly</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="terms.lateFeePercentage"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Late Fee Percentage"
                        type="number"
                        fullWidth
                        InputProps={{
                          endAdornment: <span style={{ marginLeft: '8px' }}>%</span>
                        }}
                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                        helperText="Percentage charged for late payments"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="terms.additionalTerms"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Additional Terms"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Enter any additional terms and conditions..."
                        helperText="Optional additional contract terms"
                        value={field.value || ''}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};