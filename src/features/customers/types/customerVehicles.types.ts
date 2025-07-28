import { ReactElement } from 'react';
import { Vehicle } from '../../vehicles/types/vehicleType';

// Vehicle order types
export type VehicleOrder = 'asc' | 'desc';
export type VehicleOrderBy = 'licensePlate' | 'make' | 'model' | 'year' | 'status' | 'currentValuation' | 'createdAt';

// Component props
export interface CustomerAccountVehiclesProps {
  customerId?: string;
}

// Status configuration type
export interface VehicleStatusConfig {
  icon: ReactElement;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  label: string;
}

// Notification state
export interface VehicleNotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Dialog states
export interface VehicleDialogStates {
  deleteDialogOpen: boolean;
  vehicleToDelete: string | null;
}

// Menu state
export interface VehicleMenuState {
  anchorEl: HTMLElement | null;
  selectedVehicle: Vehicle | null;
}
