import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Avatar,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  MoreVert,
  DirectionsCar,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Vehicle, VehicleStatus } from '../../types/vehicleType';
import { BrandLogo } from '../../../../shared/components';
import { hasBrandLogo } from '../../../../shared/utils/brandLogos';

interface VehicleHeaderProps {
  vehicle: Vehicle;
  onEdit: () => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

export const VehicleHeader: React.FC<VehicleHeaderProps> = ({
  vehicle,
  onEdit,
  onMenuOpen
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleBack = () => {
    navigate('/vehicles');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const getStatusColor = (status: VehicleStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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



  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      {/* Header Content */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <IconButton 
            onClick={handleBack} 
            sx={{ 
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderColor: alpha(theme.palette.primary.main, 0.2),
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowBack sx={{ color: theme.palette.text.primary }} />
          </IconButton>

          {hasBrandLogo(vehicle.make) ? (
            <BrandLogo 
              brandName={vehicle.make} 
              size={160}
              sx={{}}
            />
          ) : (
            <Avatar
              sx={{
                width: 160,
                height: 160,
                bgcolor: theme.palette.primary.main,
                fontSize: '2rem',
                fontWeight: 700
              }}
            >
              <DirectionsCar fontSize="large" />
            </Avatar>
          )}

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                {vehicle.make} {vehicle.model}
              </Typography>
              <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {vehicle.year} • {vehicle.licensePlate} • VIN: {vehicle.vin}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip 
                label={vehicle.status.replace('_', ' ')} 
                color={getStatusColor(vehicle.status)} 
                sx={{ fontWeight: 600 }}
              />
              {vehicle.isLiquidAsset && (
                <Chip 
                  label="Liquid Asset" 
                  color="secondary" 
                  sx={{ fontWeight: 600 }}
                />
              )}
              {vehicle.currentValuation && (
                <Chip 
                  label={formatCurrency(vehicle.currentValuation)} 
                  sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    fontWeight: 600 
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Edit />}
            onClick={onEdit}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
              },
              transition: 'all 0.2s ease'
            }}
          >
            Edit Vehicle
          </Button>
          
          <IconButton
            onClick={onMenuOpen}
            sx={{
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderColor: alpha(theme.palette.primary.main, 0.2),
              },
              transition: 'all 0.2s ease'
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VehicleHeader;
