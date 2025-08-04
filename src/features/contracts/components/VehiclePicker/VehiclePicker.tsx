import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Button,
  Fade,
  Tooltip,
  InputAdornment,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import {
  DirectionsCar,
  Search,
  Clear,
  Add,
  CheckCircle,
  Refresh
} from '@mui/icons-material';
import { useGetAvailableVehiclesQuery } from '../../api/contractApi';
import { VehiclePickerProps, VehicleSummary } from '../../types/contract.types';
import { vehicleApi } from '../../../vehicles/api/vehicleApi';
import { VehicleCreationModal } from '../../../../shared/components';
import { Vehicle } from '../../../vehicles/types/vehicleType';

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Enhanced VehicleSummary for available vehicles only
interface EnhancedVehicleSummary extends VehicleSummary {
  status: 'AVAILABLE';
  isVerified?: boolean;
  mileage?: number;
  fuelType?: string;
  color?: string;
}

interface VehiclePickerState {
  searchTerm: string;
  selectedVehicle: EnhancedVehicleSummary | null;
  isOpen: boolean;
  hasInteracted: boolean;
  isCreateModalOpen: boolean;
  isCreatingVehicle: boolean;
}

export const VehiclePicker: React.FC<VehiclePickerProps> = ({
  selectedVehicleIds,
  onVehicleSelect,
  error
}) => {
  const theme = useTheme();
  
  const [state, setState] = useState<VehiclePickerState>({
    searchTerm: '',
    selectedVehicle: null,
    isOpen: false,
    hasInteracted: false,
    isCreateModalOpen: false,
    isCreatingVehicle: false
  });

  // Debounced search term to improve performance
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  // Fetch ONLY available vehicles
  const {
    data: vehiclesResponse = [],
    isLoading,
    error: apiError,
    refetch
  } = useGetAvailableVehiclesQuery({
    search: debouncedSearchTerm,
    limit: 50,
    status: 'AVAILABLE'
  });

  // Process vehicles - only available ones
  const allVehicles = useMemo(() => 
    vehiclesResponse
      .filter(vehicle => vehicle.status === 'AVAILABLE')
      .map(vehicle => ({
        ...vehicle,
        status: 'AVAILABLE' as const,
        isVerified: (vehicle as any).isVerified ?? true,
        mileage: (vehicle as any).mileage,
        fuelType: (vehicle as any).fuelType,
        color: (vehicle as any).color
      })) as EnhancedVehicleSummary[],
    [vehiclesResponse]
  );

  // Get available vehicles (excluding selected one)
  const availableVehicles = useMemo(() => 
    state.selectedVehicle 
      ? allVehicles.filter(v => v.id !== state.selectedVehicle!.id)
      : allVehicles,
    [allVehicles, state.selectedVehicle]
  );

  // Update selected vehicle when IDs change
  useEffect(() => {
    const vehicleId = selectedVehicleIds[0]; // Only first vehicle since we allow only one
    if (vehicleId && allVehicles.length > 0) {
      const selected = allVehicles.find(v => v.id === vehicleId);
      if (selected && selected.id !== state.selectedVehicle?.id) {
        setState(prev => ({ ...prev, selectedVehicle: selected }));
      }
    } else if (!vehicleId && state.selectedVehicle) {
      setState(prev => ({ ...prev, selectedVehicle: null }));
    }
  }, [selectedVehicleIds, allVehicles, state.selectedVehicle?.id]);

  // Handle vehicle selection - immediately select
  const handleVehicleSelect = useCallback((vehicle: EnhancedVehicleSummary | null) => {
    setState(prev => ({
      ...prev,
      selectedVehicle: vehicle,
      hasInteracted: true
    }));
    
    if (vehicle) {
      onVehicleSelect([vehicle.id]); // Single vehicle array
    } else {
      onVehicleSelect([]); // Empty array
    }
  }, [onVehicleSelect]);

  // Handle input change
  const handleInputChange = useCallback((_event: any, newInputValue: string) => {
    setState(prev => ({
      ...prev,
      hasInteracted: true,
      searchTerm: newInputValue
    }));
  }, []);

  // Handle open/close
  const handleOpen = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const handleClose = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Get vehicle display name
  const getVehicleDisplayName = useCallback((vehicle: EnhancedVehicleSummary) => {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}`;
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Vehicle creation modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, isCreateModalOpen: true }));
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setState(prev => ({ ...prev, isCreateModalOpen: false }));
  }, []);

  const handleCreateVehicle = useCallback(async (vehicleData: Partial<Vehicle>) => {
    try {
      setState(prev => ({ ...prev, isCreatingVehicle: true }));
      
      const newVehicle = await vehicleApi.createVehicle(vehicleData);
      
      // Transform the created vehicle to match our enhanced type
      const enhancedVehicle: EnhancedVehicleSummary = {
        id: newVehicle.id,
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year,
        licensePlate: newVehicle.licensePlate,
        vinNumber: newVehicle.vin,
        status: 'AVAILABLE',
        isVerified: true,
        mileage: newVehicle.mileage,
        fuelType: newVehicle.fuelType,
        color: newVehicle.color
      };

      // Select the newly created vehicle
      setState(prev => ({ 
        ...prev, 
        selectedVehicle: enhancedVehicle,
        isCreateModalOpen: false,
        isCreatingVehicle: false
      }));
      
      // Notify parent component
      onVehicleSelect([enhancedVehicle.id]);
      
      // Refresh the vehicle list
      refetch();
      
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      setState(prev => ({ ...prev, isCreatingVehicle: false }));
    }
  }, [onVehicleSelect, refetch]);

  // Error handling
  if (apiError) {
    return (
      <Alert 
        severity="error" 
        sx={{ mt: 1 }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={handleRefresh}
            aria-label="retry loading vehicles"
          >
            <Refresh />
          </IconButton>
        }
      >
        Failed to load available vehicles. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        p: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Select Vehicle
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose one available vehicle for this contract
          </Typography>
        </Box>
        <Tooltip title="Create a new vehicle">
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleOpenCreateModal}
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Create Vehicle
          </Button>
        </Tooltip>
      </Box>

      {/* Vehicle Selection Autocomplete */}
      <Autocomplete
        options={availableVehicles}
        getOptionLabel={getVehicleDisplayName}
        value={state.selectedVehicle}
        onChange={(_event, value) => {
          handleVehicleSelect(value);
        }}
        onInputChange={handleInputChange}
        onOpen={handleOpen}
        onClose={handleClose}
        open={state.isOpen}
        loading={isLoading}
        filterOptions={(x) => x} // API handles filtering
        blurOnSelect={true} // Close dropdown after selection
        clearOnBlur={false} // Don't clear on blur
        selectOnFocus={false} // Don't select on focus
        handleHomeEndKeys
        openOnFocus={true} // Open dropdown when focused
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Vehicle"
            placeholder="Search available vehicles..."
            error={!!error}
            helperText={
              error || 
              `${availableVehicles.length} available vehicles found${state.selectedVehicle ? ' (1 selected)' : ''}`
            }
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isLoading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                }
              }
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          const isSelected = option.id === state.selectedVehicle?.id;
          
          return (
            <MenuItem
              {...otherProps}
              key={option.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[2]
                }
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.success.main,
                  width: 40,
                  height: 40
                }}
              >
                <DirectionsCar />
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {option.year} {option.make} {option.model}
                  </Typography>
                  <Chip
                    label="Available"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  {option.isVerified && (
                    <Tooltip title="Verified vehicle">
                      <CheckCircle 
                        sx={{ 
                          fontSize: 16, 
                          color: theme.palette.success.main 
                        }} 
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  🏷️ {option.licensePlate} • 🔢 {option.vinNumber}
                </Typography>
                
                {(option.mileage || option.fuelType || option.color) && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {option.mileage && (
                      <Typography variant="caption" color="text.secondary">
                        📏 {option.mileage?.toLocaleString()} km
                      </Typography>
                    )}
                    {option.fuelType && (
                      <Typography variant="caption" color="text.secondary">
                        ⛽ {option.fuelType}
                      </Typography>
                    )}
                    {option.color && (
                      <Typography variant="caption" color="text.secondary">
                        🎨 {option.color}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </MenuItem>
          );
        }}
        PaperComponent={(props) => (
          <Paper 
            {...props} 
            sx={{ 
              mt: 1, 
              maxHeight: 300, 
              overflow: 'auto',
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }} 
          />
        )}
        noOptionsText={
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <DirectionsCar sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {state.searchTerm ? 'No available vehicles found' : 'Start typing to search available vehicles'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Only vehicles with AVAILABLE status are shown
            </Typography>
          </Box>
        }
        loadingText={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, justifyContent: 'center' }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Loading available vehicles...</Typography>
          </Box>
        }
      />

      {/* Selected Vehicle Display */}
      {state.selectedVehicle && (
        <Fade in timeout={300}>
          <Card
            elevation={0}
            sx={{
              mt: 3,
              border: '2px solid',
              borderColor: 'success.main',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.02),
              transition: 'all 0.3s ease'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.success.main,
                    width: 50,
                    height: 50
                  }}
                >
                  <DirectionsCar />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {state.selectedVehicle.year} {state.selectedVehicle.make} {state.selectedVehicle.model}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label="Selected"
                      size="small"
                      color="success"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {state.selectedVehicle.isVerified && (
                      <Chip
                        label="Verified"
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
                <Tooltip title="Remove selection">
                  <IconButton
                    color="error"
                    onClick={() => handleVehicleSelect(null)}
                    sx={{
                      bgcolor: 'background.paper',
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'white'
                      }
                    }}
                  >
                    <Clear />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  🏷️ License Plate: <strong>{state.selectedVehicle.licensePlate}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  🔢 VIN: <strong style={{ fontFamily: 'monospace' }}>{state.selectedVehicle.vinNumber}</strong>
                </Typography>
                {state.selectedVehicle.color && (
                  <Typography variant="body2" color="text.secondary">
                    🎨 Color: <strong>{state.selectedVehicle.color}</strong>
                  </Typography>
                )}
                {state.selectedVehicle.mileage && (
                  <Typography variant="body2" color="text.secondary">
                    📏 Mileage: <strong>{state.selectedVehicle.mileage.toLocaleString()} km</strong>
                  </Typography>
                )}
                {state.selectedVehicle.fuelType && (
                  <Typography variant="body2" color="text.secondary">
                    ⛽ Fuel Type: <strong>{state.selectedVehicle.fuelType}</strong>
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Empty state */}
      {!state.selectedVehicle && !isLoading && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No vehicle selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search and select an available vehicle for this contract
          </Typography>
        </Paper>
      )}

      {/* Vehicle Creation Modal */}
      <VehicleCreationModal
        open={state.isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateVehicle}
        isCreating={state.isCreatingVehicle}
      />
    </Box>
  );
};
