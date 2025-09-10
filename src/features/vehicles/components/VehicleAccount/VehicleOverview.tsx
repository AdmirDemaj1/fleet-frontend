import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  DirectionsCar,
  Person,
  Security,
  Assignment,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Vehicle } from '../../types/vehicleType';

interface VehicleOverviewProps {
  vehicle: Vehicle;
}

export const VehicleOverview: React.FC<VehicleOverviewProps> = ({ vehicle }) => {
  const theme = useTheme();

  const getDaysUntilExpiry = (expiryDate: string | undefined): number | null => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpiringSoon = (expiryDate: string | undefined, days: number = 30): boolean => {
    const daysUntil = getDaysUntilExpiry(expiryDate);
    return daysUntil !== null && daysUntil <= days && daysUntil > 0;
  };

  const isExpired = (expiryDate: string | undefined): boolean => {
    const daysUntil = getDaysUntilExpiry(expiryDate);
    return daysUntil !== null && daysUntil < 0;
  };

  const hasExpiringDocuments = isExpiringSoon(vehicle.insuranceExpiryDate) || 
                             isExpiringSoon(vehicle.registrationExpiryDate) ||
                             isExpired(vehicle.insuranceExpiryDate) || 
                             isExpired(vehicle.registrationExpiryDate);

  return (
    <Box sx={{ p: 3 }}>
      {/* Alerts for expiring documents */}
      {hasExpiringDocuments && (
        <Alert 
          severity={isExpired(vehicle.insuranceExpiryDate) || isExpired(vehicle.registrationExpiryDate) ? "error" : "warning"} 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            {isExpired(vehicle.insuranceExpiryDate) || isExpired(vehicle.registrationExpiryDate) ? "Expired Documents" : "Documents Expiring Soon"}
          </Typography>
          <List dense sx={{ mt: 1 }}>
            {(isExpiringSoon(vehicle.insuranceExpiryDate) || isExpired(vehicle.insuranceExpiryDate)) && (
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary={`Insurance ${isExpired(vehicle.insuranceExpiryDate) ? 'expired' : 'expires'} on ${vehicle.insuranceExpiryDate ? format(new Date(vehicle.insuranceExpiryDate), 'MMMM dd, yyyy') : ''}`}
                />
              </ListItem>
            )}
            {(isExpiringSoon(vehicle.registrationExpiryDate) || isExpired(vehicle.registrationExpiryDate)) && (
              <ListItem sx={{ pl: 0 }}>
                <ListItemText 
                  primary={`Registration ${isExpired(vehicle.registrationExpiryDate) ? 'expired' : 'expires'} on ${vehicle.registrationExpiryDate ? format(new Date(vehicle.registrationExpiryDate), 'MMMM dd, yyyy') : ''}`}
                />
              </ListItem>
            )}
          </List>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                mb: 2
              }}>
                <DirectionsCar sx={{ color: 'primary.main' }} />
                Vehicle Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    VIN Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                    {vehicle.vin}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    License Plate
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {vehicle.licensePlate}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Make & Model
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {vehicle.make} {vehicle.model}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Year
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {vehicle.year}
                  </Typography>
                </Grid>
                
                {vehicle.color && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Color
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%',
                        bgcolor: vehicle.color.toLowerCase(),
                        border: `1px solid ${theme.palette.divider}`
                      }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {vehicle.color}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {vehicle.fuelType && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Fuel Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {vehicle.fuelType.replace('_', ' ')}
                    </Typography>
                  </Grid>
                )}
                
                {vehicle.transmission && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Transmission
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {vehicle.transmission}
                    </Typography>
                  </Grid>
                )}
                
                {vehicle.mileage && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Mileage
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Intl.NumberFormat('en-US').format(vehicle.mileage)} miles
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                mb: 2
              }}>
                <Person sx={{ color: 'primary.main' }} />
                Customer Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {vehicle.customerId ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Customer Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                      {vehicle.customerName || 'Unknown Customer'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Customer ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {vehicle.customerId}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label="View Customer Profile" 
                    clickable
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 2 }}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: 'text.secondary' 
                }}>
                  <Person sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" gutterBottom>
                    No Customer Assigned
                  </Typography>
                  <Typography variant="body2">
                    This vehicle is not currently associated with any customer.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Insurance Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                mb: 2
              }}>
                <Security sx={{ color: 'primary.main' }} />
                Insurance & Registration
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {vehicle.insuranceProvider && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Insurance Provider
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {vehicle.insuranceProvider.replace('_', ' ')}
                    </Typography>
                  </Grid>
                )}
                
                {vehicle.insurancePolicyNumber && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Policy Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {vehicle.insurancePolicyNumber}
                    </Typography>
                  </Grid>
                )}
                
                {vehicle.insuranceExpiryDate && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Insurance Expiry
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isExpired(vehicle.insuranceExpiryDate) ? (
                        <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
                      ) : isExpiringSoon(vehicle.insuranceExpiryDate) ? (
                        <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
                      ) : (
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      )}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          color: isExpired(vehicle.insuranceExpiryDate) ? 'error.main' :
                                isExpiringSoon(vehicle.insuranceExpiryDate) ? 'warning.main' : 'text.primary'
                        }}
                      >
                        {format(new Date(vehicle.insuranceExpiryDate), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {vehicle.registrationExpiryDate && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Registration Expiry
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isExpired(vehicle.registrationExpiryDate) ? (
                        <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
                      ) : isExpiringSoon(vehicle.registrationExpiryDate) ? (
                        <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
                      ) : (
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      )}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          color: isExpired(vehicle.registrationExpiryDate) ? 'error.main' :
                                isExpiringSoon(vehicle.registrationExpiryDate) ? 'warning.main' : 'text.primary'
                        }}
                      >
                        {format(new Date(vehicle.registrationExpiryDate), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Legal Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                mb: 2
              }}>
                <Assignment sx={{ color: 'primary.main' }} />
                Legal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {vehicle.legalOwner && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Legal Owner
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {vehicle.legalOwner}
                    </Typography>
                  </Grid>
                )}
                
                {vehicle.purchaseDate && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Purchase Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {format(new Date(vehicle.purchaseDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                )}
                
                {vehicle.registrationDate && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Registration Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {format(new Date(vehicle.registrationDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {format(new Date(vehicle.createdAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Updated
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {format(new Date(vehicle.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleOverview;
