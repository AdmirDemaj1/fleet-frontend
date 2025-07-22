export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  LEASED = 'LEASED',
  MAINTENANCE = 'MAINTENANCE',
  COLLATERAL = 'COLLATERAL',
  SOLD = 'SOLD',
  OTHER = 'OTHER'
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  status: VehicleStatus;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  currentValuation?: number;
  marketValue?: number;
  depreciatedValue?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  registrationDate?: string;
  registrationExpiryDate?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  maintenanceHistory?: MaintenanceRecord[];
  documents?: Document[];
  customerId?: string;
  customerName?: string;
  isLiquidAsset?: boolean;
  legalOwner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
  mileage: number;
  performed: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

export interface VehicleQueryParams {
  status?: VehicleStatus;
  legalOwner?: string;
  make?: string;
  model?: string;
  year?: number;
  isLiquidAsset?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VehicleStatistics {
  totalVehicles: number;
  availableVehicles: number;
  leasedVehicles: number;
  collateralVehicles: number;
  maintenanceVehicles: number;
  liquidAssets: number;
  totalValue: number;
}