import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  Chip,
  useTheme,
  alpha,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  DirectionsCar,
  Event,
  Speed,
  AttachMoney,
  Build,
  Security,
  LocalShipping,
  Business,
  Person,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Vehicle, VehicleStatus } from '../../types/vehicleType';
import { BrandLogo } from '../../../../shared/components';
import { hasBrandLogo } from '../../../../shared/utils/brandLogos';

interface VehicleSidebarProps {
  vehicle: Vehicle;
}

export const VehicleSidebar: React.FC<VehicleSidebarProps> = ({ vehicle }) => {
  const theme = useTheme();

  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMileage = (mileage: number | undefined): string => {
    if (!mileage) return 'N/A';
    return new Intl.NumberFormat('en-US').format(mileage) + ' miles';
  };

  const getStatusConfig = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return {
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          icon: CheckCircle,
          label: 'Available'
        };
      case VehicleStatus.LEASED:
        return {
          color: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          icon: Business,
          label: 'Leased'
        };
      case VehicleStatus.MAINTENANCE:
        return {
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          icon: Warning,
          label: 'Maintenance'
        };
      case VehicleStatus.SOLD:
        return {
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          icon: AttachMoney,
          label: 'Sold'
        };
      case VehicleStatus.LIQUID_ASSET:
        return {
          color: theme.palette.secondary.main,
          bgcolor: alpha(theme.palette.secondary.main, 0.1),
          icon: LocalShipping,
          label: 'Liquid Asset'
        };
      default:
        return {
          color: theme.palette.grey[500],
          bgcolor: alpha(theme.palette.grey[500], 0.1),
          icon: ErrorIcon,
          label: status
        };
    }
  };



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

  const getVehicleInitials = () => {
    return `${vehicle.make.charAt(0)}${vehicle.model.charAt(0)}`.toUpperCase();
  };

  const statusConfig = getStatusConfig(vehicle.status);
  const StatusIcon = statusConfig.icon;

  const utilizationRate = 85; // Mock data
  const maintenanceCost = vehicle.maintenanceHistory?.reduce((sum, record) => sum + record.cost, 0) || 0;

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        height: 'fit-content',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'sticky',
        top: 24
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {hasBrandLogo(vehicle.make) ? (
            <BrandLogo 
              brandName={vehicle.make} 
              size={56}
              sx={{}}
            />
          ) : (
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.primary.main,
                fontSize: '1.25rem',
                fontWeight: 700
              }}
            >
              {getVehicleInitials()}
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {vehicle.make} {vehicle.model}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vehicle.year} • {vehicle.licensePlate}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<StatusIcon />}
            label={statusConfig.label}
            sx={{
              bgcolor: statusConfig.bgcolor,
              color: statusConfig.color,
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-icon': {
                color: statusConfig.color,
                fontSize: 16
              }
            }}
          />

        </Stack>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
          Quick Stats
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 2, 
          mb: 3 
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
              {formatCurrency(vehicle.currentValuation)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Current Value
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatMileage(vehicle.currentMileage)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mileage
            </Typography>
          </Box>
        </Box>

        {/* Utilization Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Utilization Rate
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {utilizationRate}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={utilizationRate} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }}
          />
        </Box>
      </Box>

      {/* Vehicle Details */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
          Vehicle Details
        </Typography>
        
        <List dense disablePadding>
          <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">VIN</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
              {vehicle.vin.slice(-8)}
            </Typography>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">Engine</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {vehicle.fuelType || 'N/A'}
            </Typography>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">Transmission</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {vehicle.transmission || 'N/A'}
            </Typography>
          </ListItem>

          {vehicle.color && (
            <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%',
                  bgcolor: vehicle.color.toLowerCase(),
                  border: `1px solid ${theme.palette.divider}`
                }} />
                <Typography variant="body2" color="text.secondary">Color</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {vehicle.color}
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>

      {/* Customer Information */}
      {vehicle.customerId && (
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
            Customer
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 18 }} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {vehicle.customerName || 'Unknown Customer'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customer ID: {vehicle.customerId}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Insurance & Registration */}
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
          Insurance & Registration
        </Typography>
        
        <List dense disablePadding>
          {vehicle.tplExpiryDate && (
            <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ 
                  fontSize: 16, 
                  color: isExpired(vehicle.tplExpiryDate) ? 'error.main' :
                        isExpiringSoon(vehicle.tplExpiryDate) ? 'warning.main' : 'success.main'
                }} />
                <Typography variant="body2" color="text.secondary">TPL Insurance</Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: isExpired(vehicle.tplExpiryDate) ? 'error.main' :
                        isExpiringSoon(vehicle.tplExpiryDate) ? 'warning.main' : 'text.primary'
                }}
              >
                {format(new Date(vehicle.tplExpiryDate), 'MMM dd, yyyy')}
              </Typography>
            </ListItem>
          )}

          {vehicle.registrationExpiry && (
            <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Event sx={{ 
                  fontSize: 16, 
                  color: isExpired(vehicle.registrationExpiry) ? 'error.main' :
                        isExpiringSoon(vehicle.registrationExpiry) ? 'warning.main' : 'success.main'
                }} />
                <Typography variant="body2" color="text.secondary">Registration</Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: isExpired(vehicle.registrationExpiry) ? 'error.main' :
                        isExpiringSoon(vehicle.registrationExpiry) ? 'warning.main' : 'text.primary'
                }}
              >
                {format(new Date(vehicle.registrationExpiry), 'MMM dd, yyyy')}
              </Typography>
            </ListItem>
          )}

          {maintenanceCost > 0 && (
            <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Build sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Maintenance</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatCurrency(maintenanceCost)}
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default VehicleSidebar;
