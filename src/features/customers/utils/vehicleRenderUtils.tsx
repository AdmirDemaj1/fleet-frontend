import { Chip } from '@mui/material';
import { VehicleStatus } from '../../vehicles/types/vehicleType';
import { VEHICLE_STATUS_CONFIG } from '../constants/vehicleConstants';

/**
 * Render vehicle status cell with appropriate styling
 */
export const renderVehicleStatusCell = (status: VehicleStatus | string) => {
  const config = VEHICLE_STATUS_CONFIG[status as VehicleStatus];
  
  if (!config) {
    return (
      <Chip
        label={status}
        size="small"
        variant="outlined"
        color="default"
      />
    );
  }

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      variant="outlined"
      color={config.color}
    />
  );
};
