export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE', // Available for lease/use
  LEASED = 'LEASED', // Currently leased out
  // COLLATERAL = 'COLLATERAL', // Used as loan collateral
  MAINTENANCE = 'MAINTENANCE', // Under maintenance
  SOLD = 'SOLD', // Sold to customer
  LIQUID_ASSET = 'LIQUID_ASSET', // Liquidated/retired assets
}

export enum ConditionStatus {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  NEEDS_REPAIR = 'NEEDS_REPAIR',
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  LPG = 'LPG'
}

export enum InsuranceCompany {
  SIGMA = 'SIGMA',
  ALBSIG = 'ALBSIG',
  OTHER = 'OTHER',
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
  condition?: ConditionStatus;
  mileage?: number;
  fuelType?: FuelType;
  transmission?: string;
  currentValuation?: number;
  marketValue?: number;
  depreciatedValue?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  registrationDate?: string;
  registrationExpiryDate?: string;
  insuranceProvider?: InsuranceCompany;
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
  limit?: number;
  offset?: number;
}

export interface VehicleFilters {
  status?: VehicleStatus;
  legalOwner?: string;
  make?: string;
  model?: string;
  year?: number;
  isLiquidAsset?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  offset: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedVehicleResponse {
  data: Vehicle[];
  meta: PaginationMeta;
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