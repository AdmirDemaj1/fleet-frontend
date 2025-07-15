export interface AuditLogResponseDto {
    id: string;
    eventType: string;
    entityType: string;
    entityId: string;
    oldValues: Record<string, any> | null;
    newValues: Record<string, any> | null;
    metadata: Record<string, any> | null;
    userId: string;
    createdAt: string;
    actionTimestamp: string;
  }
  
  export interface FindAuditLogsDto {
    entityType?: string;
    entityId?: string;
    userId?: string;
  }
  export interface AuditLogResponseDto {
    id: string;
    entityId: string;
    entityType: string;
    userId: string;
    eventType: string;
    actionTimestamp: string;
    createdAt: string;
    oldValues: Record<string, any> | null;
    newValues: Record<string, any> | null;
    metadata: Record<string, any> | null;
  }
  
  export interface FindAuditLogsDto {
    search?: string;
    limit?: number;
    offset?: number;
    entityId?: string;
    entityType?: string;
    userId?: string;
    eventTypes?: string[];
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }
  
  export interface CustomerLogFilters {
    customerId: string;
    limit?: number;
    offset?: number;
    search?: string;
    sortOrder?: 'asc' | 'desc';
    eventTypes?: string[];
    startDate?: string;
    endDate?: string;
  }