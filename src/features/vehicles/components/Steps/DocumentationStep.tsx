import React from 'react';
import { Grid, Typography, Divider, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { InsuranceCompany } from '../../types/vehicleType';

export const DocumentationStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  
  const insuranceCompanies = [
    { value: InsuranceCompany.SIGMA, label: 'Sigma' },
    { value: InsuranceCompany.ALBSIG, label: 'Albsig' },
    { value: InsuranceCompany.OTHER, label: 'Other' }
  ];
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Documentation & Valuation
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Enter registration, insurance, and valuation information
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Registration Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="registrationDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Registration Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.registrationDate}
              helperText={errors.registrationDate?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="registrationExpiryDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Registration Expiry Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.registrationExpiryDate}
              helperText={errors.registrationExpiryDate?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Insurance Information
        </Typography>
      </Grid>
      
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
              >
                <MenuItem value=""><em>Select insurance provider</em></MenuItem>
                {insuranceCompanies.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.insuranceProvider && (
                <FormHelperText>{errors.insuranceProvider?.message as string}</FormHelperText>
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
              error={!!errors.insurancePolicyNumber}
              helperText={errors.insurancePolicyNumber?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="insuranceExpiryDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Insurance Expiry Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.insuranceExpiryDate}
              helperText={errors.insuranceExpiryDate?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Valuation
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Controller
          name="currentValuation"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Current Valuation ($)"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
              error={!!errors.currentValuation}
              helperText={errors.currentValuation?.message as string}
              value={field.value || ''}
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
              label="Market Value ($)"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
              error={!!errors.marketValue}
              helperText={errors.marketValue?.message as string}
              value={field.value || ''}
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
              label="Depreciated Value ($)"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
              error={!!errors.depreciatedValue}
              helperText={errors.depreciatedValue?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};