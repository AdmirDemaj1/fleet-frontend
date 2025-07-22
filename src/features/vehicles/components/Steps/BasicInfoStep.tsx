import React from 'react';
import { Grid, Typography, MenuItem, TextField, FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { VehicleStatus } from '../../types/vehicleType';

export const BasicInfoStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Basic Vehicle Information
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Enter the primary identification details for the vehicle
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="licensePlate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="License Plate"
              required
              fullWidth
              error={!!errors.licensePlate}
              helperText={errors.licensePlate?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="vin"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="VIN (Vehicle Identification Number)"
              required
              fullWidth
              error={!!errors.vin}
              helperText={errors.vin?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="make"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Make"
              required
              fullWidth
              placeholder="e.g. Toyota, BMW"
              error={!!errors.make}
              helperText={errors.make?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Model"
              required
              fullWidth
              placeholder="e.g. Corolla, X5"
              error={!!errors.model}
              helperText={errors.model?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Controller
          name="year"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Year"
              type="number"
              required
              fullWidth
              inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              error={!!errors.year}
              helperText={errors.year?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Color"
              fullWidth
              error={!!errors.color}
              helperText={errors.color?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl required fullWidth error={!!errors.status}>
              <InputLabel id="status-label">Vehicle Status</InputLabel>
              <Select
                {...field}
                labelId="status-label"
                label="Vehicle Status"
                value={field.value || ''}
              >
                {Object.values(VehicleStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ').split(' ').map(word => 
                      word.charAt(0) + word.slice(1).toLowerCase()
                    ).join(' ')}
                  </MenuItem>
                ))}
              </Select>
              {errors.status && (
                <FormHelperText>{errors.status?.message as string}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
    </Grid>
  );
};