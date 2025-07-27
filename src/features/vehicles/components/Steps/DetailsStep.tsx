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
  Checkbox,
  Box,
  Chip,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, useFormContext } from 'react-hook-form';
import { FuelType, ConditionStatus } from '../../types/vehicleType';
import dayjs from 'dayjs';

export const DetailsStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  
  const fuelTypes = [
    { 
      value: FuelType.GASOLINE, 
      label: 'Gasoline',
      icon: '⛽',
      description: 'Traditional gasoline engine'
    },
    { 
      value: FuelType.DIESEL, 
      label: 'Diesel',
      icon: '🛢️',
      description: 'Diesel fuel engine'
    },
    { 
      value: FuelType.ELECTRIC, 
      label: 'Electric',
      icon: '🔋',
      description: 'Battery electric vehicle'
    },
    { 
      value: FuelType.HYBRID, 
      label: 'Hybrid',
      icon: '⚡',
      description: 'Gasoline-electric hybrid'
    },
    { 
      value: FuelType.LPG, 
      label: 'LPG',
      icon: '💨',
      description: 'Liquefied petroleum gas'
    }
  ];

  const conditionTypes = [
    { 
      value: ConditionStatus.EXCELLENT, 
      label: 'Excellent',
      color: 'success' as const,
      description: 'Like new condition'
    },
    { 
      value: ConditionStatus.GOOD, 
      label: 'Good',
      color: 'info' as const,
      description: 'Minor wear, well maintained'
    },
    { 
      value: ConditionStatus.FAIR, 
      label: 'Fair',
      color: 'warning' as const,
      description: 'Some wear and tear'
    },
    { 
      value: ConditionStatus.POOR, 
      label: 'Poor',
      color: 'error' as const,
      description: 'Significant wear or damage'
    },
    { 
      value: ConditionStatus.NEEDS_REPAIR, 
      label: 'Needs Repair',
      color: 'error' as const,
      description: 'Requires immediate attention'
    }
  ];

  const transmissionTypes = [
    { value: 'automatic', label: 'Automatic', description: 'Automatic transmission' },
    { value: 'manual', label: 'Manual', description: 'Manual transmission' },
    { value: 'semi-automatic', label: 'Semi-Automatic', description: 'Semi-automatic transmission' },
    { value: 'cvt', label: 'CVT', description: 'Continuously Variable Transmission' }
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box mb={2}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
              Vehicle Details & Specifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Provide technical specifications and ownership details for the vehicle.
            </Typography>
          </Box>
        </Grid>
        
        {/* Technical Specifications */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
            Technical Specifications
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="mileage"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Mileage"
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">km</InputAdornment>,
                }}
                inputProps={{ min: 0, max: 999999 }}
                error={!!errors.mileage}
                helperText={errors.mileage?.message as string || 'Current odometer reading in kilometers'}
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
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Select fuel type</em>
                  </MenuItem>
                  {fuelTypes.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography variant="body1">{option.icon}</Typography>
                        <Box>
                          <Typography variant="body1">{option.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.fuelType ? (
                  <FormHelperText>{errors.fuelType?.message as string}</FormHelperText>
                ) : (
                  <FormHelperText>Type of fuel the vehicle uses</FormHelperText>
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
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Select transmission type</em>
                  </MenuItem>
                  {transmissionTypes.map(option => (
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
                {errors.transmission ? (
                  <FormHelperText>{errors.transmission?.message as string}</FormHelperText>
                ) : (
                  <FormHelperText>Vehicle transmission type</FormHelperText>
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
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Select condition</em>
                  </MenuItem>
                  {conditionTypes.map(option => (
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
                {errors.condition ? (
                  <FormHelperText>{errors.condition?.message as string}</FormHelperText>
                ) : (
                  <FormHelperText>Current physical condition of the vehicle</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
            Ownership & Financial Information
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
                helperText={errors.legalOwner?.message as string || 'Name of the legal owner or entity'}
                value={field.value || ''}
                inputProps={{ maxLength: 100 }}
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
            name="isLiquidAsset"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                <FormControl error={!!errors.isLiquidAsset}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        {...field}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          Mark as Liquid Asset
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vehicle can be quickly converted to cash
                        </Typography>
                      </Box>
                    }
                  />
                  {errors.isLiquidAsset && (
                    <FormHelperText>{errors.isLiquidAsset?.message as string}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Controller
            name="purchaseDate"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <DatePicker
                {...field}
                label="Purchase Date"
                value={value ? dayjs(value) : null}
                onChange={(newValue) => {
                  onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
                }}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.purchaseDate,
                    helperText: errors.purchaseDate?.message as string || 'Date when the vehicle was purchased',
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
            name="purchasePrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Purchase Price"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, max: 10000000 }}
                error={!!errors.purchasePrice}
                helperText={errors.purchasePrice?.message as string || 'Original purchase price in USD'}
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
    </Box>
  );
};