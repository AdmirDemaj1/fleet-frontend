import React, { useState, useEffect } from 'react';
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
  Grid,
  Divider,
  Badge,
  MenuItem,
  Button
} from '@mui/material';
import {
  DirectionsCar,
  Search,
  Remove,
  Add,
  CheckCircle,
  OpenInNew
} from '@mui/icons-material';
import { useGetAvailableVehiclesQuery } from '../../api/contractApi';
import { VehiclePickerProps, VehicleSummary } from '../../types/contract.types';

export const VehiclePicker: React.FC<VehiclePickerProps> = ({
  selectedVehicleIds,
  onVehicleSelect,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleSummary[]>([]);

  // Fetch available vehicles - removed customerId filter
  const {
    data: vehicles = [],
    isLoading,
    error: apiError
  } = useGetAvailableVehiclesQuery({
    search: searchTerm,
    limit: 100
  });

  // Update selected vehicles when IDs change
  useEffect(() => {
    if (selectedVehicleIds.length > 0 && vehicles.length > 0) {
      const selected = vehicles.filter(v => selectedVehicleIds.includes(v.id));
      setSelectedVehicles(selected);
    } else {
      setSelectedVehicles([]);
    }
  }, [selectedVehicleIds, vehicles]);

  const handleVehicleAdd = (vehicle: VehicleSummary) => {
    if (!selectedVehicleIds.includes(vehicle.id)) {
      const newSelectedIds = [...selectedVehicleIds, vehicle.id];
      const newSelectedVehicles = [...selectedVehicles, vehicle];
      setSelectedVehicles(newSelectedVehicles);
      onVehicleSelect(newSelectedIds);
    }
  };

  const handleVehicleRemove = (vehicleId: string) => {
    const newSelectedIds = selectedVehicleIds.filter(id => id !== vehicleId);
    const newSelectedVehicles = selectedVehicles.filter(v => v.id !== vehicleId);
    setSelectedVehicles(newSelectedVehicles);
    onVehicleSelect(newSelectedIds);
  };

  const handleInputChange = (_event: any, newInputValue: string) => {
    setSearchTerm(newInputValue);
  };

  const handleCreateVehicle = () => {
    // Navigate to create vehicle page in a new tab
    window.open('/vehicles/new', '_blank');
  };

  if (apiError) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        Failed to load vehicles. Please try again.
      </Alert>
    );
  }

  const availableVehicles = vehicles.filter(v => !selectedVehicleIds.includes(v.id));

  return (
    <Box>
      {/* Header with Create Vehicle Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3">
          Select Vehicles
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          endIcon={<OpenInNew />}
          onClick={handleCreateVehicle}
          size="small"
        >
          Create Vehicle
        </Button>
      </Box>

      {/* Search and Add Vehicle */}
      <Autocomplete
        options={availableVehicles}
        getOptionLabel={(option) => `${option.year} ${option.make} ${option.model} - ${option.licensePlate}`}
        onInputChange={handleInputChange}
        loading={isLoading}
        filterOptions={(x) => x} // Let the API handle filtering
        onChange={(_event, value) => {
          if (value) {
            handleVehicleAdd(value);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Add Vehicle to Contract"
            placeholder="Search available vehicles..."
            error={!!error}
            helperText={error || 'Search and select vehicles to add to this contract'}
            InputProps={{
              ...params.InputProps,
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <MenuItem
              {...otherProps}
              key={option.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <DirectionsCar sx={{ color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {option.year} {option.make} {option.model}
                  </Typography>
                  <Chip
                    label={option.status}
                    size="small"
                    color={option.status === 'AVAILABLE' ? 'success' : 
                           option.status === 'LEASED' ? 'warning' : 
                           option.status === 'SOLD' ? 'error' : 'default'}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  License: {option.licensePlate} • VIN: {option.vinNumber}
                </Typography>
              </Box>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVehicleAdd(option);
                }}
              >
                <Add />
              </IconButton>
            </MenuItem>
          );
        }}
        noOptionsText={
          searchTerm ? 'No available vehicles found' : 'Start typing to search vehicles'
        }
        loadingText="Loading vehicles..."
        value={null}
      />

      {/* Selected Vehicles Count */}
      {selectedVehicles.length > 0 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Badge badgeContent={selectedVehicles.length} color="primary">
            <Chip
              icon={<DirectionsCar />}
              label="Selected Vehicles"
              variant="outlined"
              color="primary"
            />
          </Badge>
        </Box>
      )}

      {/* Selected Vehicles List */}
      {selectedVehicles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Selected Vehicles ({selectedVehicles.length})
          </Typography>
          
          <Grid container spacing={2}>
            {selectedVehicles.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'success.main',
                    borderRadius: 2,
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 2
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    {/* Remove button */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleVehicleRemove(vehicle.id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white'
                        }
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>

                    {/* Status indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />
                      <Chip
                        label="Selected"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>

                    {/* Vehicle info */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>License:</strong> {vehicle.licensePlate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <strong>VIN:</strong> {vehicle.vinNumber}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Status:</strong>
                        </Typography>
                        <Chip
                          label={vehicle.status}
                          size="small"
                          color={vehicle.status === 'AVAILABLE' ? 'success' : 
                                 vehicle.status === 'LEASED' ? 'warning' : 
                                 vehicle.status === 'SOLD' ? 'error' : 'default'}
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty state */}
      {selectedVehicles.length === 0 && !isLoading && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 3,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <DirectionsCar sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No vehicles selected yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Search and select vehicles to add them to this contract
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
