import React from 'react';
import {
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Build as BuildIcon,
  MonetizationOn as MonetizationOnIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { VehicleStatus } from '../../vehicles/types/vehicleType';
import { VehicleStatusConfig } from '../types/customerVehicles.types';

// Vehicle status configuration
export const VEHICLE_STATUS_CONFIG: Record<VehicleStatus, VehicleStatusConfig> = {
  [VehicleStatus.AVAILABLE]: {
    icon: React.createElement(CheckCircleIcon),
    color: 'success',
    label: 'Available'
  },
  [VehicleStatus.LEASED]: {
    icon: React.createElement(BusinessIcon),
    color: 'primary',
    label: 'Leased'
  },
  [VehicleStatus.MAINTENANCE]: {
    icon: React.createElement(BuildIcon),
    color: 'warning',
    label: 'Maintenance'
  },
  [VehicleStatus.SOLD]: {
    icon: React.createElement(MonetizationOnIcon),
    color: 'default',
    label: 'Sold'
  },
  [VehicleStatus.LIQUID_ASSET]: {
    icon: React.createElement(ArchiveIcon),
    color: 'secondary',
    label: 'Liquid Asset'
  }
};

// Pagination constants
export const DEFAULT_VEHICLES_ROWS_PER_PAGE = 10;
export const VEHICLES_ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
