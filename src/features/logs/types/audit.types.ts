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