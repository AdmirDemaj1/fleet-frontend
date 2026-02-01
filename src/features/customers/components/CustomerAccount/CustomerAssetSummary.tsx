import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Paper,
  Chip,
  Grid,
  Divider,
  useTheme,
  alpha,
  Alert,
  Skeleton
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  DirectionsCar as VehicleIcon,
  CheckCircle as CheckCircleIcon,
  Build as MaintenanceIcon,
  AttachMoney as SoldIcon,
  LocalShipping as LiquidAssetIcon
} from '@mui/icons-material';
import { Vehicle } from '../../../vehicles/types/vehicleType';
import { vehicleApi } from '../../../vehicles/api/vehicleApi';
import { BrandLogo } from '../../../../shared/components';

interface CustomerAssetSummaryProps {
  customerId: string;
}

// Helper function to get the appropriate icon for each vehicle status
const getVehicleStatusIcon = (status: string) => {
  switch(status) {
    case 'AVAILABLE':
      return <CheckCircleIcon fontSize="small" />;
    case 'LEASED':
      return <CheckCircleIcon fontSize="small" />;
    case 'MAINTENANCE':
      return <MaintenanceIcon fontSize="small" />;
    case 'SOLD':
      return <SoldIcon fontSize="small" />;
    case 'LIQUID_ASSET':
      return <LiquidAssetIcon fontSize="small" />;
    default:
      return <VehicleIcon fontSize="small" />;
  }
};

// Helper function to get the color for status chips
const getStatusColor = (status: string) => {
  switch(status) {
    case 'AVAILABLE':
      return 'success';
    case 'LEASED':
      return 'primary';
    case 'MAINTENANCE':
      return 'warning';
    case 'SOLD':
      return 'info';
    case 'LIQUID_ASSET':
      return 'secondary';
    default:
      return 'default';
  }
};

const CustomerAssetSummary: React.FC<CustomerAssetSummaryProps> = ({ customerId }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles for the customer
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await vehicleApi.getVehiclesByCustomerId(customerId);
        setVehicles(response.data || []);
      } catch (err) {
        console.error('Failed to fetch customer vehicles:', err);
        setError('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchVehicles();
    }
  }, [customerId]);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Safely get the status display text with fallback
  const getStatusText = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format currency
  // TODO: This code is duplicated in a lot of places, we should create a shared function for this.
  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format mileage
  const formatMileage = (mileage: number | undefined | null) => {
    if (!mileage) return 'N/A';
    return `${mileage.toLocaleString()} km`;
  };

  // Count leased vehicles
  const leasedVehicleCount = vehicles.filter(v => v.status === 'LEASED').length;

  if (loading) {
    return (
      <Paper 
        elevation={2}
        sx={{ 
          p: 3,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
          width: '100%'
        }}
      >
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={180} height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={240} height={20} />
            <Skeleton variant="text" width={150} height={16} sx={{ mt: 0.5 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={90} height={24} />
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Vehicle Skeletons */}
        {[...Array(2)].map((_, index) => (
          <Box
            key={index}
            sx={{
              mb: 1,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            {/* Accordion Summary Skeleton */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={200} height={24} />
                <Skeleton variant="text" width={120} height={20} />
              </Box>
              <Skeleton variant="rounded" width={70} height={24} />
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
            
            {/* Expanded Content Skeleton (for first item) */}
            {index === 0 && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[...Array(12)].map((_, fieldIndex) => (
                    <Grid item xs={12} sm={6} key={fieldIndex}>
                      <Skeleton variant="text" width={140} height={16} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width={200} height={20} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        ))}
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={2}
        sx={{ 
          p: 3,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
          width: '100%'
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 3,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
        width: '100%'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
            Vehicle Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} associated with this customer
          </Typography>
          {vehicles.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Total Value: {formatCurrency(vehicles.reduce((sum, v) => sum + (v.currentValuation || 0), 0))}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            icon={<CheckCircleIcon />} 
            label={`${leasedVehicleCount} Leased`} 
            color="primary"
            variant="outlined"
            size="small"
          />
          {vehicles.filter(v => v.status === 'AVAILABLE').length > 0 && (
            <Chip 
              label={`${vehicles.filter(v => v.status === 'AVAILABLE').length} Available`} 
              color="success"
              variant="outlined"
              size="small"
            />
          )}
          {vehicles.filter(v => v.isLiquidAsset).length > 0 && (
            <Chip 
              label={`${vehicles.filter(v => v.isLiquidAsset).length} Liquid Assets`} 
              color="warning"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {vehicles.map((vehicle, index) => (
        <Accordion 
          key={vehicle.id}
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{
            mb: 1,
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            '&:before': {
              display: 'none',
            },
            '&:hover': {
              bgcolor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              margin: 0,
              mb: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            sx={{
              minHeight: 56,
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box 
                sx={{ 
                  mr: 2, 
                  display: 'flex', 
                  alignItems: 'center'
                }}
              >
                <BrandLogo brandName={vehicle.make} size={40} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 500 }}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {vehicle.licensePlate}
                </Typography>
              </Box>
              <Chip 
                icon={getVehicleStatusIcon(vehicle.status)}
                label={getStatusText(vehicle.status)}
                color={getStatusColor(vehicle.status) as any}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ '& .MuiGrid-item': { pb: 2 } }}>
              {/* Basic Vehicle Information */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  VIN Number
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {vehicle.vin}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  License Plate
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.licensePlate}</Typography>
              </Grid>
              {vehicle.oldLicensePlate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Old License Plate
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.oldLicensePlate}</Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Color
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.color || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Fuel Type
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.fuelType || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Condition Status
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{getStatusText(vehicle.conditionStatus)}</Typography>
              </Grid>

              {/* Ownership & Legal Information */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Legal Owner
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.legalOwner || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Current Client ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {vehicle.currentClientId || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Contract ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {(vehicle as any).contractId || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Liquid Asset Status
                </Typography>
                <Box>
                  <Chip 
                    label={vehicle.isLiquidAsset ? 'Yes' : 'No'} 
                    color={vehicle.isLiquidAsset ? 'warning' : 'success'}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', height: 24 }}
                  />
                </Box>
              </Grid>

              {/* Financial Information */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Current Valuation
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', fontSize: '1rem', lineHeight: 1.4 }}>
                  {formatCurrency(vehicle.currentValuation)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Market Value
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{formatCurrency(vehicle.marketValue)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Depreciated Value
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{formatCurrency(vehicle.depreciatedValue)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Purchase Price
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{formatCurrency(vehicle.purchasePrice)}</Typography>
              </Grid>

              {/* Dates */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Purchase Date
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {vehicle.purchaseDate 
                    ? new Date(vehicle.purchaseDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : 'N/A'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Registration Expiry
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {vehicle.registrationExpiry 
                    ? new Date(vehicle.registrationExpiry).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : 'N/A'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Last Valuation Date
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {(vehicle as any).lastValuationDate 
                    ? new Date((vehicle as any).lastValuationDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : 'N/A'
                  }
                </Typography>
              </Grid>

              {/* Insurance Information */}
              {vehicle.primaryInsuranceCompany && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Primary Insurance Company
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.primaryInsuranceCompany}</Typography>
                </Grid>
              )}
              {vehicle.tplExpiryDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    TPL Insurance Expiry
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {new Date(vehicle.tplExpiryDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Grid>
              )}
              {vehicle.kaskoExpiryDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Kasko Insurance Expiry
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {new Date(vehicle.kaskoExpiryDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Grid>
              )}
              {vehicle.passengerInsuranceExpiry && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Passenger Insurance Expiry
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {new Date(vehicle.passengerInsuranceExpiry).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Grid>
              )}

              {/* Maintenance & Service Information */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Current Mileage
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{formatMileage(vehicle.currentMileage)}</Typography>
              </Grid>
              {vehicle.nextMaintenanceDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Next Maintenance Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {new Date(vehicle.nextMaintenanceDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Grid>
              )}
              {vehicle.lastServiceDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Last Service Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {new Date(vehicle.lastServiceDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Grid>
              )}

              {/* Additional Information */}
              {vehicle.creditStatus && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Credit Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.creditStatus}</Typography>
                </Grid>
              )}
              {vehicle.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{vehicle.notes}</Typography>
                </Grid>
              )}

              {/* System Information */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Created At
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {new Date(vehicle.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                  Last Updated
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {new Date(vehicle.updatedAt).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </Typography>
              </Grid>
              {vehicle.createdBy && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Created By
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.createdBy}</Typography>
                </Grid>
              )}
              {vehicle.updatedBy && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5 }}>
                    Updated By
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{vehicle.updatedBy}</Typography>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      
      {vehicles.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <VehicleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">No vehicles found for this customer.</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CustomerAssetSummary;