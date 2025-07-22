export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE', 
  LEASED = 'LEASED', 
  COLLATERAL = 'COLLATERAL', 
  MAINTENANCE = 'MAINTENANCE', 
  SOLD = 'SOLD', 
  LIQUID_ASSET = 'LIQUID_ASSET', 
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
}

export enum InsuranceCompany {
  SIGMA = 'SIGMA',
  ALBSIG = 'ALBSIG',
  OTHER = 'OTHER',
}


export interface Vehicle {
  id: string;
  licensePlate: string;
  oldLicensePlate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  fuelType: FuelType;
  legalOwner: string;
  currentClientId: string;
  status: VehicleStatus;
  conditionStatus: ConditionStatus;
  isLiquidAsset: boolean;
  purchaseValue: number;
  depreciatedValue: number;
  marketValue: number;
  insuranceValue: number;
  currentValuation: number;
  lastValuationDate: Date;
  primaryInsuranceCompany: InsuranceCompany;
  tplExpiryDate: Date;
  kaskoExpiryDate: Date;
  passengerInsuranceExpiry: Date;
  currentMileage: number;
  nextMaintenanceDate: Date;
  lastServiceDate: Date;
  purchaseDate: Date;
  registrationExpiry: Date;
  creditStatus: string;
  notes: string;
  additionalData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface VehicleFilters {
  status?: VehicleStatus;
  make?: string;
  model?: string;
  year?: number;
  legalOwner?: string;
  search?: string;
  limit?: number;
  offset?: number;
}