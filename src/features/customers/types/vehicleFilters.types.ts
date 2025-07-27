import { ReactElement } from 'react';

// Vehicle filter state interface
export interface VehicleFilters {
  search: string;
  status: string;
  make: string;
  model: string;
  year: string;
}

export interface VehicleFiltersProps {
  filters: VehicleFilters;
  onFilterChange: (newFilters: VehicleFilters) => void;
  vehiclesCount?: number;
}

// Filter option interfaces
export interface FilterOption {
  value: string;
  label: string;
}

export interface StatusOption extends FilterOption {
  icon: ReactElement | null;
}

// Filter configuration types
export type FilterKey = keyof VehicleFilters;

export interface FilterChipData {
  key: FilterKey;
  label: string;
  icon: ReactElement;
}
