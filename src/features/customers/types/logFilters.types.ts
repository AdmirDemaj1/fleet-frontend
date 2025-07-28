import { ReactElement } from 'react';

// Log filter state interface
export interface LogFilters {
  search: string;
  eventType: string;
  entityType: string;
  startDate: string;
  endDate: string;
}

export interface LogFiltersProps {
  filters: LogFilters;
  onFilterChange: (newFilters: LogFilters) => void;
  logsCount?: number;
}

// Sort order types
export type LogOrder = 'asc' | 'desc';
export type LogOrderBy = 'timestamp' | 'eventType' | 'entityType';

// Filter option interfaces
export interface FilterOption {
  value: string;
  label: string;
}

export interface EventTypeOption extends FilterOption {
  icon: ReactElement | null;
}

// Filter configuration types
export type FilterKey = keyof LogFilters;

export interface FilterChipData {
  key: FilterKey;
  label: string;
  icon: ReactElement;
}
