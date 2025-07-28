import React from 'react';
import {
  CheckCircle,
  Business,
  Build,
  MonetizationOn,
  Archive
} from '@mui/icons-material';
import { VehicleStatus } from '../../vehicles/types/vehicleType';

// Status options for vehicle filters
export const VEHICLE_STATUS_OPTIONS = [
  { value: '', label: 'All Status', icon: null },
  { 
    value: VehicleStatus.AVAILABLE, 
    label: 'Available',
    icon: React.createElement(CheckCircle, { fontSize: 'small' })
  },
  { 
    value: VehicleStatus.LEASED, 
    label: 'Leased',
    icon: React.createElement(Business, { fontSize: 'small' })
  },
  { 
    value: VehicleStatus.MAINTENANCE, 
    label: 'Maintenance',
    icon: React.createElement(Build, { fontSize: 'small' })
  },
  { 
    value: VehicleStatus.SOLD, 
    label: 'Sold',
    icon: React.createElement(MonetizationOn, { fontSize: 'small' })
  },
  { 
    value: VehicleStatus.LIQUID_ASSET, 
    label: 'Liquid Asset',
    icon: React.createElement(Archive, { fontSize: 'small' })
  }
];

// Year options for vehicle filters
export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 50; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return [{ value: '', label: 'All Years' }, ...years];
};
