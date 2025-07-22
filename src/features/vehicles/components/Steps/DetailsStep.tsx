import React from 'react';
import { 
  Grid, 
  Typography, 
  MenuItem, 
  Divider, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  FormHelperText,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { FuelType, ConditionStatus } from '../../types/vehicleType';

export const DetailsStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  
  const fuelTypes = [
    { value: FuelType.GASOLINE, label: 'Gasoline' },
    { value: FuelType.DIESEL, label: 'Diesel' },
    { value: FuelType.ELECTRIC, label: 'Electric' },
    { value: FuelType.HYBRID, label: 'Hybrid' },
    { value: FuelType.LPG, label: 'LPG' }
  ];

  const conditionTypes = [
    { value: ConditionStatus.EXCELLENT, label: 'Excellent' },
    { value: ConditionStatus.GOOD, label: 'Good' },
    { value: ConditionStatus.FAIR, label: 'Fair' },
    { value: ConditionStatus.POOR, label: 'Poor' },
    { value: ConditionStatus.NEEDS_REPAIR, label: 'Needs Repair' }
  ];

  const transmissionTypes = [
    { value: 'automatic', label: 'Automatic' },
    { value: 'manual', label: 'Manual' },
    { value: 'semi-automatic', label: 'Semi-Automatic' },
    { value: 'cvt', label: 'CVT' }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Vehicle Details & Specifications
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Provide technical specifications and ownership details
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="mileage"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Mileage (km)"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
              error={!!errors.mileage}
              helperText={errors.mileage?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="fuelType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.fuelType}>
              <InputLabel id="fuelType-label">Fuel Type</InputLabel>
              <Select
                {...field}
                labelId="fuelType-label"
                label="Fuel Type"
                value={field.value || ''}
              >
                <MenuItem value=""><em>Select fuel type</em></MenuItem>
                {fuelTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.fuelType && (
                <FormHelperText>{errors.fuelType?.message as string}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="transmission"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.transmission}>
              <InputLabel id="transmission-label">Transmission</InputLabel>
              <Select
                {...field}
                labelId="transmission-label"
                label="Transmission"
                value={field.value || ''}
              >
                <MenuItem value=""><em>Select transmission type</em></MenuItem>
                {transmissionTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.transmission && (
                <FormHelperText>{errors.transmission?.message as string}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="condition"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.condition}>
              <InputLabel id="condition-label">Condition</InputLabel>
              <Select
                {...field}
                labelId="condition-label"
                label="Condition"
                value={field.value || ''}
              >
                <MenuItem value=""><em>Select condition</em></MenuItem>
                {conditionTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.condition && (
                <FormHelperText>{errors.condition?.message as string}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Ownership Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="legalOwner"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Legal Owner"
              fullWidth
              placeholder="Enter company or individual name"
              error={!!errors.legalOwner}
              helperText={errors.legalOwner?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="isLiquidAsset"
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <FormControl error={!!errors.isLiquidAsset}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                }
                label="Mark as Liquid Asset"
              />
              {errors.isLiquidAsset && (
                <FormHelperText>{errors.isLiquidAsset?.message as string}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="purchaseDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Purchase Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.purchaseDate}
              helperText={errors.purchaseDate?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Controller
          name="purchasePrice"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Purchase Price ($)"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
              error={!!errors.purchasePrice}
              helperText={errors.purchasePrice?.message as string}
              value={field.value || ''}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};