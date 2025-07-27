import React from 'react';
import { 
  Grid, 
  Typography, 
  MenuItem, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  FormHelperText,
  Box,
  Chip
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { VehicleStatus } from '../../types/vehicleType';

export const BasicInfoStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  
  const currentYear = new Date().getFullYear();
  
  const vehicleStatusOptions = [
    { 
      value: VehicleStatus.AVAILABLE, 
      label: 'Available',
      color: 'success' as const,
      description: 'Ready for lease or use'
    },
    { 
      value: VehicleStatus.LEASED, 
      label: 'Leased',
      color: 'info' as const,
      description: 'Currently leased out'
    },
    { 
      value: VehicleStatus.MAINTENANCE, 
      label: 'Maintenance',
      color: 'warning' as const,
      description: 'Under maintenance'
    },
    { 
      value: VehicleStatus.SOLD, 
      label: 'Sold',
      color: 'default' as const,
      description: 'Sold to customer'
    },
    { 
      value: VehicleStatus.LIQUID_ASSET, 
      label: 'Liquid Asset',
      color: 'secondary' as const,
      description: 'Liquidated/retired asset'
    }
  ];
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box mb={2}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
              Basic Vehicle Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter the primary identification details for the vehicle. All fields marked with * are required.
            </Typography>
          </Box>
        </Grid>
        
        {/* License Plate & VIN */}
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
                helperText={errors.licensePlate?.message as string || 'Enter the vehicle\'s license plate number'}
                value={field.value || ''}
                inputProps={{ 
                  maxLength: 15,
                  style: { textTransform: 'uppercase' }
                }}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
            name="vin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="VIN (Vehicle Identification Number)"
                required
                fullWidth
                error={!!errors.vin}
                helperText={errors.vin?.message as string || 'Must be exactly 17 characters'}
                value={field.value || ''}
                inputProps={{ 
                  maxLength: 17,
                  style: { textTransform: 'uppercase' }
                }}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            )}
          />
        </Grid>
        
        {/* Make & Model */}
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
                placeholder="e.g., Toyota, BMW, Ford"
                error={!!errors.make}
                helperText={errors.make?.message as string || 'Vehicle manufacturer'}
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
            name="model"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Model"
                required
                fullWidth
                placeholder="e.g., Corolla, X5, F-150"
                error={!!errors.model}
                helperText={errors.model?.message as string || 'Vehicle model name'}
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
        
        {/* Year & Color */}
        <Grid item xs={12} sm={6}>
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
                inputProps={{ 
                  min: 1900, 
                  max: currentYear + 1,
                  step: 1
                }}
                error={!!errors.year}
                helperText={errors.year?.message as string || `Manufacturing year (1900-${currentYear + 1})`}
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
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Color"
                fullWidth
                placeholder="e.g., Black, White, Silver"
                error={!!errors.color}
                helperText={errors.color?.message as string || 'Vehicle exterior color (optional)'}
                value={field.value || ''}
                inputProps={{ maxLength: 30 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            )}
          />
        </Grid>
        
        {/* Status */}
        <Grid item xs={12}>
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
                  sx={{
                    borderRadius: 2
                  }}
                >
                  {vehicleStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Chip 
                          label={option.label} 
                          color={option.color}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.status ? (
                  <FormHelperText>{errors.status?.message as string}</FormHelperText>
                ) : (
                  <FormHelperText>Current operational status of the vehicle</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};