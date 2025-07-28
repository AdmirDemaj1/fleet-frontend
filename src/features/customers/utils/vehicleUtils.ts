import { Vehicle, VehicleStatus } from '../../vehicles/types/vehicleType';
import { VehicleOrder, VehicleOrderBy } from '../types/customerVehicles.types';
import { VehicleFilters } from '../types/vehicleFilters.types';

/**
 * Format currency values
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date values
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Get vehicle status display color
 */
export const getVehicleStatusColor = (status: VehicleStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return 'success';
    case VehicleStatus.LEASED:
      return 'primary';
    case VehicleStatus.MAINTENANCE:
      return 'warning';
    case VehicleStatus.SOLD:
      return 'default';
    case VehicleStatus.LIQUID_ASSET:
      return 'secondary';
    default:
      return 'default';
  }
};

/**
 * Get vehicle status display text
 */
export const getVehicleStatusText = (status: VehicleStatus): string => {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return 'Available';
    case VehicleStatus.LEASED:
      return 'Leased';
    case VehicleStatus.MAINTENANCE:
      return 'Maintenance';
    case VehicleStatus.SOLD:
      return 'Sold';
    case VehicleStatus.LIQUID_ASSET:
      return 'Liquid Asset';
    default:
      return status;
  }
};

/**
 * Filter vehicles based on provided filters
 */
export const filterVehicles = (vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] => {
  return vehicles.filter(vehicle => {
    // Search filter (searches across multiple fields)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        vehicle.licensePlate?.toLowerCase().includes(searchTerm) ||
        vehicle.vin?.toLowerCase().includes(searchTerm) ||
        vehicle.make?.toLowerCase().includes(searchTerm) ||
        vehicle.model?.toLowerCase().includes(searchTerm) ||
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status !== vehicle.status) {
      return false;
    }

    // Make filter
    if (filters.make && vehicle.make?.toLowerCase() !== filters.make.toLowerCase()) {
      return false;
    }

    // Model filter
    if (filters.model && !vehicle.model?.toLowerCase().includes(filters.model.toLowerCase())) {
      return false;
    }

    // Year filter
    if (filters.year && vehicle.year?.toString() !== filters.year) {
      return false;
    }

    return true;
  });
};

/**
 * Sort vehicles based on provided criteria
 */
export const sortVehicles = (vehicles: Vehicle[], order: VehicleOrder, orderBy: VehicleOrderBy): Vehicle[] => {
  return [...vehicles].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (orderBy) {
      case 'licensePlate':
        aValue = a.licensePlate || '';
        bValue = b.licensePlate || '';
        break;
      case 'make':
        aValue = a.make || '';
        bValue = b.make || '';
        break;
      case 'model':
        aValue = a.model || '';
        bValue = b.model || '';
        break;
      case 'year':
        aValue = a.year || 0;
        bValue = b.year || 0;
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'currentValuation':
        aValue = a.currentValuation || 0;
        bValue = b.currentValuation || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
        break;
      default:
        aValue = '';
        bValue = '';
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });
};
