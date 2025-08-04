import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField, 
  Box,
  InputAdornment,
  Paper,
  Alert
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export const DocumentationStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  
  // const insuranceCompanies = [
  //   { 
  //     value: InsuranceCompany.SIGMA, 
  //     label: 'Sigma',
  //     description: 'Sigma Insurance Company'
  //   },
  //   { 
  //     value: InsuranceCompany.ALBSIG, 
  //     label: 'Albsig',
  //     description: 'Albanian Signal Insurance'
  //   },
  //   { 
  //     value: InsuranceCompany.OTHER, 
  //     label: 'Other',
  //     description: 'Other insurance provider'
  //   }
  // ];

  // // Watch registration dates for validation
  // const registrationDate = watch('registrationDate');
  // const insuranceExpiryDate = watch('insuranceExpiryDate');
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box mb={2}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
              Documentation & Valuation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter registration, insurance, and valuation information for the vehicle.
            </Typography>
          </Box>
        </Grid>
        
        {/* COMMENTED OUT - Backend validation error */}
        {/* Registration Section */}
        {/* <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
              📋 Registration Information
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="registrationDate"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <DatePicker
                      {...field}
                      label="Registration Date"
                      value={value ? dayjs(value) : null}
                      onChange={(newValue) => {
                        onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.registrationDate,
                          helperText: errors.registrationDate?.message as string || 'Initial vehicle registration date',
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="registrationExpiryDate"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <DatePicker
                      {...field}
                      label="Registration Expiry Date"
                      value={value ? dayjs(value) : null}
                      onChange={(newValue) => {
                        onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
                      }}
                      minDate={registrationDate ? dayjs(registrationDate) : undefined}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.registrationExpiryDate,
                          helperText: errors.registrationExpiryDate?.message as string || 'When the registration expires',
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid> */}
        
        {/* COMMENTED OUT - Backend validation error */}
        {/* Insurance Section */}
        {/* <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'blue.50' }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
              🛡️ Insurance Information
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="insuranceProvider"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.insuranceProvider}>
                      <InputLabel id="insurance-provider-label">Insurance Provider</InputLabel>
                      <Select
                        {...field}
                        labelId="insurance-provider-label"
                        label="Insurance Provider"
                        value={field.value || ''}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">
                          <em>Select insurance provider</em>
                        </MenuItem>
                        {insuranceCompanies.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box>
                              <Typography variant="body1">{option.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.insuranceProvider ? (
                        <FormHelperText>{errors.insuranceProvider?.message as string}</FormHelperText>
                      ) : (
                        <FormHelperText>Company providing insurance coverage</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="insurancePolicyNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Policy Number"
                      fullWidth
                      placeholder="Enter insurance policy number"
                      error={!!errors.insurancePolicyNumber}
                      helperText={errors.insurancePolicyNumber?.message as string || 'Insurance policy identification number'}
                      value={field.value || ''}
                      inputProps={{ maxLength: 50 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="insuranceExpiryDate"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <DatePicker
                      {...field}
                      label="Insurance Expiry Date"
                      value={value ? dayjs(value) : null}
                      onChange={(newValue) => {
                        onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
                      }}
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.insuranceExpiryDate,
                          helperText: errors.insuranceExpiryDate?.message as string || 'When the insurance expires',
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              
              {insuranceExpiryDate && dayjs(insuranceExpiryDate).isBefore(dayjs().add(30, 'day')) && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Notice:</strong> Insurance expires within 30 days. Consider renewing soon.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid> */}
        
        {/* Valuation Section */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'green.50' }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
              💰 Financial Valuation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter current market values and assessments for the vehicle.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="currentValuation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Current Valuation"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{ min: 0, max: 10000000 }}
                      error={!!errors.currentValuation}
                      helperText={errors.currentValuation?.message as string || 'Current assessed value'}
                      value={field.value || ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Controller
                  name="marketValue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Market Value"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{ min: 0, max: 10000000 }}
                      error={!!errors.marketValue}
                      helperText={errors.marketValue?.message as string || 'Current market price'}
                      value={field.value || ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Controller
                  name="depreciatedValue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Depreciated Value"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{ min: 0, max: 10000000 }}
                      error={!!errors.depreciatedValue}
                      helperText={errors.depreciatedValue?.message as string || 'Book value after depreciation'}
                      value={field.value || ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> All documentation fields are optional but recommended for complete record keeping. 
              Accurate valuations help with financial reporting and asset management.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};