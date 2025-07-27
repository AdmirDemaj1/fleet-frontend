import { ReactElement } from 'react';

// Contract filter state interface
export interface ContractFilters {
  search: string;
  status: string;
  type: string;
  dateRange: string;
  amountRange: string;
}

export interface ContractFiltersProps {
  filters: ContractFilters;
  onFilterChange: (newFilters: ContractFilters) => void;
  contractsCount?: number;
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
export type FilterKey = keyof ContractFilters;

export interface FilterChipData {
  key: FilterKey;
  label: string;
  icon: ReactElement;
}
