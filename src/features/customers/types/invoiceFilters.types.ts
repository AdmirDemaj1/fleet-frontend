export interface InvoiceFilters {
  search: string;
  status: string;
  type: string;
  dateRange: string;
  amountRange: string;
}

export interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFilterChange: (newFilters: InvoiceFilters) => void;
  invoicesCount?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactElement | null;
}

export interface InvoiceFilterState {
  advancedOpen: boolean;
  hasActiveFilters: boolean;
  filterCount: number;
}
