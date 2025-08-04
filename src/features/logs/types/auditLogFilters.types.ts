export interface AuditLogFilters {
  search: string;
  eventType: string;
  entityType: string;
  startDate: string;
  endDate: string;
}

export interface AuditLogFilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}
