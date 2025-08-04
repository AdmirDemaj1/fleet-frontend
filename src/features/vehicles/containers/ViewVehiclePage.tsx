import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  Skeleton
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  DirectionsCar,
  Build,
  AttachMoney,
  Security,
  NavigateNext
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vehicleApi } from '../api/vehicleApi';
import { Vehicle, VehicleStatus, ConditionStatus } from '../types/vehicleType';

export const ViewVehiclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (id) {
      fetchVehicle(id);
    }
  }, [id]);

  const fetchVehicle = async (vehicleId: string) => {
    try {
      setLoading(true);
      const vehicleData = await vehicleApi.getVehicleById(vehicleId);
      setVehicle(vehicleData);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('Failed to load vehicle details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/vehicles/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleApi.deleteVehicle(id!);
        navigate('/vehicles');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setError('Failed to delete vehicle. Please try again later.');
      }
    }
    setAnchorEl(null);
  };

  const handleBack = () => {
    navigate('/vehicles');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return 'success';
      case VehicleStatus.LEASED:
        return 'primary';
      case VehicleStatus.MAINTENANCE:
        return 'warning';
      case VehicleStatus.SOLD:
        return 'info';
      case VehicleStatus.LIQUID_ASSET:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getConditionColor = (condition: ConditionStatus) => {
    switch (condition) {
      case ConditionStatus.EXCELLENT:
        return 'success';
      case ConditionStatus.GOOD:
        return 'primary';
      case ConditionStatus.FAIR:
        return 'warning';
      case ConditionStatus.POOR:
      case ConditionStatus.NEEDS_REPAIR:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Not set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || !vehicle) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Vehicle not found'}
        </Alert>
        <Button variant="contained" onClick={handleBack} startIcon={<ArrowBack />}>
          Back to Vehicles
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      

      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                mr: 3
              }}
            >
              <DirectionsCar sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {vehicle.make} {vehicle.model}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip label={`${vehicle.year}`} size="small" />
                <Chip 
                  label={vehicle.status} 
                  color={getStatusColor(vehicle.status)}
                  size="small" 
                />
                <Chip label={vehicle.licensePlate} variant="outlined" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                VIN: {vehicle.vin}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsCar sx={{ mr: 1 }} />
                Vehicle Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Make & Model" 
                    secondary={`${vehicle.make} ${vehicle.model}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Year" 
                    secondary={vehicle.year}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Color" 
                    secondary={vehicle.color || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Fuel Type" 
                    secondary={vehicle.fuelType || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Condition" 
                    secondary={
                      <Chip 
                        label={vehicle.condition || 'Not specified'} 
                        color={vehicle.condition ? getConditionColor(vehicle.condition) : 'default'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Legal Owner" 
                    secondary={vehicle.legalOwner}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Information */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1 }} />
                Valuation
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Purchase Price" 
                    secondary={formatCurrency(vehicle.purchasePrice)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Depreciated Value" 
                    secondary={formatCurrency(vehicle.depreciatedValue)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Market Value" 
                    secondary={formatCurrency(vehicle.marketValue)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Current Valuation" 
                    secondary={formatCurrency(vehicle.currentValuation)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Liquid Asset" 
                    secondary={
                      <Chip 
                        label={vehicle.isLiquidAsset ? 'Yes' : 'No'} 
                        color={vehicle.isLiquidAsset ? 'primary' : 'default'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Insurance Information */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ mr: 1 }} />
                Insurance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Insurance Provider" 
                    secondary={vehicle.insuranceProvider || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Insurance Policy Number" 
                    secondary={vehicle.insurancePolicyNumber || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Insurance Expiry Date" 
                    secondary={formatDate(vehicle.insuranceExpiryDate)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Registration Expiry" 
                    secondary={formatDate(vehicle.registrationExpiryDate)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Operational Information */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Build sx={{ mr: 1 }} />
                Maintenance & Operations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Current Mileage" 
                    secondary={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'Not recorded'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Purchase Date" 
                    secondary={formatDate(vehicle.purchaseDate)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Registration Date" 
                    secondary={formatDate(vehicle.registrationDate)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Legal Owner" 
                    secondary={vehicle.legalOwner || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Customer" 
                    secondary={vehicle.customerName || 'Not assigned'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance History */}
        {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 && (
          <Grid item xs={12}>
            <Card 
              elevation={0}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Maintenance History
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {vehicle.maintenanceHistory.map((record) => (
                    <ListItem key={record.id}>
                      <ListItemText 
                        primary={record.description}
                        secondary={`${formatDate(record.date)} - $${record.cost} - ${record.mileage} km`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete Vehicle
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ViewVehiclePage;
