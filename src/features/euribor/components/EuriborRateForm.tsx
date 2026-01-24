import React, { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { Save, Cancel, TrendingUp } from '@mui/icons-material';

import {
  EuriborRateFormProps,
  CreateEuriborRateDto,
  EuriborTenor,
  EuriborRateSource
} from '../types/euribor.types';
import { 
  getTenorDisplayName, 
  formatRateAsPercentage
} from '../utils/euriborUtils';

export const EuriborRateForm: React.FC<EuriborRateFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false
}) => {
  // Separate state for rate value display to handle input properly
  const [rateValueDisplay, setRateValueDisplay] = useState<string>(
    initialData?.rateValue !== undefined ? initialData.rateValue.toString() : ''
  );

  const methods = useForm<CreateEuriborRateDto>({
    defaultValues: {
      rateDate: dayjs().format('YYYY-MM-DD'),
      tenor: EuriborTenor.TWELVE_MONTHS,
      rateValue: 0,
      rateSource: EuriborRateSource.MANUAL,
      createdBy: localStorage.getItem('userEmail') || 'admin@company.com',
      metadata: {
        validationStatus: 'pending',
        sourceUrl: '',
        importBatch: '',
        notes: ''
      },
      effectiveFrom: dayjs().add(1, 'day').toISOString(),
      isActive: true,
      ...initialData
    },
    mode: 'onChange'
  });

  const {
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    handleSubmit,
    reset
  } = methods;

  const watchedData = watch();

  // Auto-update effective date when rate date changes
  useEffect(() => {
    if (watchedData.rateDate) {
      const effectiveDate = dayjs(watchedData.rateDate).add(1, 'day').toISOString();
      setValue('effectiveFrom', effectiveDate, { shouldValidate: true });
    }
  }, [watchedData.rateDate, setValue]);

  // Generate import batch ID for manual entries
  useEffect(() => {
    if (watchedData.rateSource === EuriborRateSource.MANUAL && !watchedData.metadata?.importBatch) {
      const batchId = `manual-${dayjs().format('YYYY-MM-DD-HHmmss')}`;
      setValue('metadata.importBatch', batchId, { shouldValidate: true });
    }
  }, [watchedData.rateSource, watchedData.metadata?.importBatch, setValue]);

  // Update display value when rate value changes externally (e.g., when editing)
  useEffect(() => {
    if (initialData?.rateValue !== undefined && rateValueDisplay === '') {
      setRateValueDisplay(initialData.rateValue.toString());
    }
  }, [initialData?.rateValue, rateValueDisplay]);

  const onFormSubmit = useCallback(async (data: CreateEuriborRateDto) => {
    try {
      console.log('📊 Submitting Euribor rate:', data);
      await onSubmit(data);
    } catch (error) {
      console.error('📊 Form submission error:', error);
    }
  }, [onSubmit]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      reset();
    }
  }, [onCancel, reset]);


  // Handle rate value input change
  const handleRateValueChange = useCallback((inputValue: string) => {
    setRateValueDisplay(inputValue);
    
    // Convert to number and update form value
    const numericValue = inputValue === '' ? 0 : parseFloat(inputValue);
    
    if (!isNaN(numericValue)) {
      setValue('rateValue', numericValue, { shouldValidate: true });
    }
  }, [setValue]);

  // Handle rate value blur (final validation)
  const handleRateValueBlur = useCallback(() => {
    const numericValue = parseFloat(rateValueDisplay) || 0;
    
    // Update form value
    setValue('rateValue', numericValue, { shouldValidate: true });
    
    // Format display value if it's a valid number
    if (!isNaN(numericValue) && rateValueDisplay !== '') {
      setRateValueDisplay(numericValue.toString());
    }
  }, [rateValueDisplay, setValue]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Card elevation={2}>
            <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                <Typography variant="h6">
                  {isEdit ? 'Edit 12M Euribor Rate' : 'Create New 12M Euribor Rate'}
                </Typography>
              </Box>
            }
            subheader="Set daily 12-month Euribor interest rate"
          />

          <CardContent>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <Grid container spacing={3}>
                {/* Rate Information Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Rate Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Rate Date */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Rate Date *"
                    value={watchedData.rateDate ? dayjs(watchedData.rateDate) : null}
                    onChange={(newDate) => {
                      const dateString = newDate ? newDate.format('YYYY-MM-DD') : '';
                      setValue('rateDate', dateString, { shouldValidate: true });
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.rateDate,
                        helperText: errors.rateDate?.message || 'Date for which this rate is valid',
                        required: true
                      }
                    }}
                    maxDate={dayjs().add(1, 'year')}
                  />
                </Grid>

                {/* Tenor - Hidden field (always 12M) */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tenor"
                    value="12 Months"
                    disabled
                    helperText="This system uses 12-month Euribor rate only"
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>

                {/* Rate Value */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Rate Value *"
                    type="text"
                    value={rateValueDisplay}
                    onChange={(e) => handleRateValueChange(e.target.value)}
                    onBlur={handleRateValueBlur}
                    error={!!errors.rateValue}
                    helperText={
                      errors.rateValue?.message || 
                      `Decimal format (e.g., -0.0010 for -0.10%). Preview: ${formatRateAsPercentage(watchedData.rateValue || 0)}`
                    }
                    InputProps={{
                      inputProps: {
                        inputMode: 'decimal',
                        // allow negative decimals like "-0.0012"
                        pattern: '-?[0-9]*\\.?[0-9]*'
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="textSecondary">
                            {formatRateAsPercentage(watchedData.rateValue || 0)}
                          </Typography>
                        </InputAdornment>
                      )
                    }}
                    placeholder="0.0375"
                    required
                  />
                </Grid>

                {/* Rate Source */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.rateSource} required>
                    <InputLabel>Rate Source</InputLabel>
                    <Select
                      value={watchedData.rateSource}
                      onChange={(e) => setValue('rateSource', e.target.value as EuriborRateSource, { shouldValidate: true })}
                      label="Rate Source"
                    >
                      {Object.values(EuriborRateSource).map((source) => (
                        <MenuItem key={source} value={source}>
                          {source === EuriborRateSource.BLOOMBERG ? 'Bloomberg' : 
                           source === EuriborRateSource.REUTERS ? 'Reuters' :
                           source === EuriborRateSource.MANUAL ? 'Manual' :
                           source === EuriborRateSource.API ? 'API' : source}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {errors.rateSource?.message || 'Source of the interest rate data'}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                {/* Metadata Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Created By */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Created By *"
                    value={watchedData.createdBy}
                    onChange={(e) => setValue('createdBy', e.target.value, { shouldValidate: true })}
                    error={!!errors.createdBy}
                    helperText={errors.createdBy?.message || 'Email of the person creating this rate'}
                    required
                  />
                </Grid>

                {/* Effective From */}
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Effective From *"
                    value={watchedData.effectiveFrom ? dayjs(watchedData.effectiveFrom) : null}
                    onChange={(newDate) => {
                      const dateString = newDate ? newDate.toISOString() : '';
                      setValue('effectiveFrom', dateString, { shouldValidate: true });
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.effectiveFrom,
                        helperText: errors.effectiveFrom?.message || 'When this rate becomes effective',
                        required: true
                      }
                    }}
                  />
                </Grid>

                {/* Source URL */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Source URL"
                    value={watchedData.metadata?.sourceUrl || ''}
                    onChange={(e) => setValue('metadata.sourceUrl', e.target.value, { shouldValidate: true })}
                    error={!!errors.metadata?.sourceUrl}
                    helperText={errors.metadata?.sourceUrl?.message || 'URL where this rate was obtained (optional)'}
                    placeholder="https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/"
                  />
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={watchedData.metadata?.notes || ''}
                    onChange={(e) => setValue('metadata.notes', e.target.value, { shouldValidate: true })}
                    error={!!errors.metadata?.notes}
                    helperText={errors.metadata?.notes?.message || 'Additional notes or comments (optional)'}
                    placeholder="Any additional information about this rate..."
                  />
                </Grid>

                {/* Is Active */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={watchedData.isActive}
                        onChange={(e) => setValue('isActive', e.target.checked, { shouldValidate: true })}
                      />
                    }
                    label="Active Rate"
                  />
                  <Typography variant="caption" color="textSecondary" display="block">
                    Only active rates will be used for calculations
                  </Typography>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
                      startIcon={<Cancel />}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isValid || loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                      {loading ? 'Saving...' : isEdit ? 'Update Rate' : 'Create Rate'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>

            {/* Form Debug Info (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Debug Info:</strong> Form Valid: {isValid ? 'Yes' : 'No'}, 
                    Dirty: {isDirty ? 'Yes' : 'No'}, 
                    Rate: {formatRateAsPercentage(watchedData.rateValue || 0)}
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      </FormProvider>
    </LocalizationProvider>
  );
};
