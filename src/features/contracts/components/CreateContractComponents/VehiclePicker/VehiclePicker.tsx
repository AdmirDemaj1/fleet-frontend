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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  DirectionsCar,
  Search,
  Clear,
  Add,
  CheckCircle,
  Refresh,
  Security,
  Warning
} from '@mui/icons-material';
import { useGetAvailableVehiclesQuery } from '../../../api/contractApi';
import { VehiclePickerProps, VehicleSummary } from '../../../types/contract.types';
import { vehicleApi } from '../../../../vehicles/api/vehicleApi';
import { useUploadDocumentMutation } from '../../../../vehicles/api/vehicleDocumentApi';
import { VehicleDocumentType } from '../../../../vehicles/types/vehicleType';
import { VehicleCreationModal, BrandLogo } from '../../../../../shared/components';
import { Vehicle } from '../../../../vehicles/types/vehicleType';
import { VehicleCompletionModal, REQUIRED_VEHICLE_DOCUMENT_TYPES, VehicleDocumentUpload } from './VehicleCompletionModal';
import { useNotification } from '../../../../../shared/hooks/useNotification';

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
  isCompletionModalOpen: boolean;
  pendingVehicle: EnhancedVehicleSummary | null;
  isCompletingVehicle: boolean;
}

export const VehiclePicker: React.FC<VehiclePickerProps> = ({
  selectedVehicleIds,
  onVehicleSelect,
  onVehicleDataChange,
  vehicleAsCollateral = false,
  onVehicleAsCollateralChange,
  error
}) => {
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  const [uploadDocument] = useUploadDocumentMutation();
  
  const [state, setState] = useState<VehiclePickerState>({
    searchTerm: '',
    selectedVehicle: null,
    isOpen: false,
    hasInteracted: false,
    isCreateModalOpen: false,
    isCreatingVehicle: false,
    isCompletionModalOpen: false,
    pendingVehicle: null,
    isCompletingVehicle: false
  });

  // Debounced search term to improve performance
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  // Parse search term to extract make and model
  const parseSearchTerm = (searchTerm: string) => {
    if (!searchTerm.trim()) return { make: undefined, model: undefined };
    
    // Try to parse format like "1999 Volkswagen Gof - TR 3896 R"
    const parts = searchTerm.trim().split(/\s+/);
    if (parts.length >= 3) {
      // Skip year (first part), extract make and model
      const make = parts[1];
      const model = parts[2];
      return { make, model };
    }
    
    // Fallback: use search as is
    return { make: undefined, model: undefined, search: searchTerm };
  };

  const parsedSearch = parseSearchTerm(debouncedSearchTerm);

  // Fetch ONLY available vehicles with documents
  const {
    data: vehiclesResponse = [],
    isLoading,
    error: apiError,
    refetch
  } = useGetAvailableVehiclesQuery({
    ...parsedSearch,
    status: 'AVAILABLE',
    includeDocuments: true
  });

  // Debug logging for API responses
  console.log('🔍 VehiclePicker Debug:');
  console.log('  🔍 Original Search Term:', debouncedSearchTerm);
  console.log('  🔧 Parsed Search Params:', parsedSearch);
  console.log('  📊 API Response:', vehiclesResponse);
  console.log('  ⚠️ API Error:', apiError);
  console.log('  🔄 Is Loading:', isLoading);

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

  // Check if a vehicle is complete (has license plate and required documents)
  const isVehicleComplete = useCallback((vehicle: EnhancedVehicleSummary): boolean => {
    // Check license plate
    if (!vehicle.licensePlate) return false;
    
    // Check required documents
    const existingDocTypes = (vehicle as any).documents?.map((d: any) => d.type) || [];
    const hasAllDocs = REQUIRED_VEHICLE_DOCUMENT_TYPES.every(type => 
      existingDocTypes.includes(type)
    );
    
    return hasAllDocs;
  }, []);

  // Get what's missing from a vehicle
  const getVehicleMissingItems = useCallback((vehicle: EnhancedVehicleSummary): string[] => {
    const missing: string[] = [];
    
    if (!vehicle.licensePlate) {
      missing.push('License Plate');
    }
    
    const existingDocTypes = (vehicle as any).documents?.map((d: any) => d.type) || [];
    REQUIRED_VEHICLE_DOCUMENT_TYPES.forEach(type => {
      if (!existingDocTypes.includes(type)) {
        const label = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        missing.push(label);
      }
    });
    
    return missing;
  }, []);

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

  // Handle vehicle selection - check if complete first
  const handleVehicleSelect = useCallback((vehicle: EnhancedVehicleSummary | null) => {
    if (vehicle) {
      // Check if vehicle is complete
      if (!isVehicleComplete(vehicle)) {
        // Vehicle is incomplete - show completion modal
        setState(prev => ({
          ...prev,
          pendingVehicle: vehicle,
          isCompletionModalOpen: true,
          hasInteracted: true
        }));
        return;
      }
      
      // Vehicle is complete - proceed with selection
      setState(prev => ({
        ...prev,
        selectedVehicle: vehicle,
        hasInteracted: true
      }));
      
      onVehicleSelect([vehicle.id]); // Single vehicle array
      // Also pass the full vehicle data including documents
      if (onVehicleDataChange) {
        onVehicleDataChange([vehicle]);
      }
    } else {
      // Clearing selection
      setState(prev => ({
        ...prev,
        selectedVehicle: null,
        hasInteracted: true
      }));
      onVehicleSelect([]); // Empty array
      if (onVehicleDataChange) {
        onVehicleDataChange([]);
      }
    }
  }, [onVehicleSelect, onVehicleDataChange, isVehicleComplete]);

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
    const plateInfo = vehicle.licensePlate || 'No Plate';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${plateInfo}`;
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
        mileage: newVehicle.currentMileage,
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
      // Also pass the full vehicle data
      if (onVehicleDataChange) {
        onVehicleDataChange([enhancedVehicle]);
      }
      
      // Refresh the vehicle list
      refetch();
      
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      setState(prev => ({ ...prev, isCreatingVehicle: false }));
    }
  }, [onVehicleSelect, onVehicleDataChange, refetch]);

  // Handle closing completion modal
  const handleCloseCompletionModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCompletionModalOpen: false,
      pendingVehicle: null,
      isCompletingVehicle: false
    }));
  }, []);

  // Handle vehicle completion (adding license plate and/or documents)
  const handleVehicleCompletion = useCallback(async (data: {
    licensePlate?: string;
    documents?: VehicleDocumentUpload[];
  }) => {
    const vehicle = state.pendingVehicle;
    if (!vehicle) return;

    setState(prev => ({ ...prev, isCompletingVehicle: true }));

    try {
      let updatedVehicle: EnhancedVehicleSummary = { ...vehicle };

      // Update license plate if provided
      if (data.licensePlate) {
        console.log('🔧 Updating vehicle license plate:', data.licensePlate);
        await vehicleApi.updateVehicle(vehicle.id, {
          licensePlate: data.licensePlate
        });
        // Explicitly set the license plate from the provided data to ensure it's updated
        updatedVehicle = {
          ...updatedVehicle,
          licensePlate: data.licensePlate // Use the provided value directly
        };
        console.log('✅ Vehicle updated with license plate:', updatedVehicle.licensePlate);
      }

      // Upload documents if provided
      if (data.documents && data.documents.length > 0) {
        const uploadPromises = data.documents.map(doc => 
          uploadDocument({
            file: doc.file,
            data: {
              type: doc.type as VehicleDocumentType,
              title: doc.title,
              expiryDate: doc.expiryDate, // Use the expiry date provided by user
              vehicleId: vehicle.id,
            }
          }).unwrap()
        );
        
        await Promise.all(uploadPromises);
        
        // Add documents to the vehicle object
        const newDocs = data.documents.map(doc => ({
          id: `new-${Date.now()}-${doc.type}`,
          type: doc.type,
          title: doc.title,
          fileName: doc.file.name,
          filePath: '',
          status: 'completed',
          createdAt: new Date().toISOString(),
          downloadUrl: '',
          previewUrl: ''
        }));
        
        updatedVehicle = {
          ...updatedVehicle,
          documents: [...(updatedVehicle.documents || []), ...newDocs]
        } as EnhancedVehicleSummary;
      }

      console.log('🚗 Final updated vehicle data:', {
        id: updatedVehicle.id,
        licensePlate: updatedVehicle.licensePlate,
        make: updatedVehicle.make,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        vinNumber: updatedVehicle.vinNumber,
        documentsCount: updatedVehicle.documents?.length || 0
      });

      // Now select the completed vehicle
      setState(prev => ({
        ...prev,
        selectedVehicle: updatedVehicle,
        pendingVehicle: null,
        isCompletionModalOpen: false,
        isCompletingVehicle: false
      }));

      onVehicleSelect([updatedVehicle.id]);
      if (onVehicleDataChange) {
        // Pass the updated vehicle data with the new license plate
        onVehicleDataChange([updatedVehicle]);
        console.log('📤 Passed updated vehicle data to parent with licensePlate:', updatedVehicle.licensePlate);
      }

      showSuccess('Vehicle information updated successfully!');
      
      // Refresh the vehicle list
      refetch();

    } catch (err) {
      console.error('Failed to complete vehicle:', err);
      showError('Failed to update vehicle information');
      setState(prev => ({ ...prev, isCompletingVehicle: false }));
      throw err;
    }
  }, [state.pendingVehicle, onVehicleSelect, onVehicleDataChange, uploadDocument, refetch, showSuccess, showError]);

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
          const isComplete = isVehicleComplete(option);
          const missingItems = !isComplete ? getVehicleMissingItems(option) : [];
          
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
              <BrandLogo 
                brandName={option.make}
                size={120}
              />
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
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
                  {!isComplete && (
                    <Tooltip title={`Missing: ${missingItems.join(', ')}`}>
                      <Chip
                        icon={<Warning sx={{ fontSize: 14 }} />}
                        label="Incomplete"
                        size="small"
                        color="warning"
                        variant="filled"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Tooltip>
                  )}
                  {option.isVerified && isComplete && (
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
                  🏷️ {option.licensePlate || <em style={{ color: theme.palette.warning.main }}>No plate</em>} • 🔢 {option.vinNumber}
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
                <BrandLogo 
                  brandName={state.selectedVehicle.make}
                  size={150}
                />
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

                {/* Collateral Checkbox */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={vehicleAsCollateral}
                        onChange={(e) => {
                          if (onVehicleAsCollateralChange) {
                            onVehicleAsCollateralChange(e.target.checked);
                          }
                        }}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security sx={{ fontSize: 18, color: vehicleAsCollateral ? 'primary.main' : 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: vehicleAsCollateral ? 600 : 400 }}>
                          Use this vehicle as collateral
                        </Typography>
                      </Box>
                    }
                  />
                  {vehicleAsCollateral && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="caption">
                        This vehicle will be added as collateral for the contract with an estimated value of ${(state.selectedVehicle.marketValue || state.selectedVehicle.currentValuation || 0).toLocaleString()}
                      </Typography>
                    </Alert>
                  )}
                </Box>
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

      {/* Vehicle Completion Modal - for adding missing info */}
      <VehicleCompletionModal
        open={state.isCompletionModalOpen}
        onClose={handleCloseCompletionModal}
        vehicle={state.pendingVehicle}
        onComplete={handleVehicleCompletion}
        isLoading={state.isCompletingVehicle}
      />
    </Box>
  );
};
