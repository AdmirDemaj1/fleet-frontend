export interface CustomerAccountLogsProps {
  customerId: string;
}

export interface EventTypeOption {
  value: string;
  label: string;
}

export interface LogFilters {
  entityId: string;
  entityType: string;
  search: string;
  limit: number;
  offset: number;
  sortOrder: 'desc' | 'asc';
  eventTypes?: string[];
  startDate?: string;
  endDate?: string;
}

export type DateRange = '7days' | '30days' | 'all';

export interface LogsTableState {
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  dateRange: DateRange;
  startDate: Date | null;
  endDate: Date | null;
  selectedEventTypes: string[];
  sortOrder: 'desc' | 'asc';
  showFilters: boolean;
}
