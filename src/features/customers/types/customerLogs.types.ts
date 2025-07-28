import { ReactElement } from 'react';

// Log order types
export type LogOrder = 'asc' | 'desc';
export type LogOrderBy = 'timestamp' | 'eventType' | 'entityType' | 'description' | 'createdAt';

// Enhanced log interface that matches the API response
export interface CustomerLog {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  metadata?: {
    customerId?: string;
    customerType?: string;
    [key: string]: any;
  };
  userId: string;
  createdAt: string;
  actionTimestamp: string;
  // Legacy fields for backward compatibility
  timestamp?: string | Date;
  performedByName?: string;
  customerId?: string;
}

export interface CustomerAccountLogsProps {
  customerId?: string;
}

export interface EventTypeOption {
  value: string;
  label: string;
  icon?: ReactElement;
}

// Notification state
export interface LogNotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Menu state
export interface LogMenuState {
  anchorEl: HTMLElement | null;
  selectedLog: CustomerLog | null;
}

// Legacy types (keeping for compatibility)
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
