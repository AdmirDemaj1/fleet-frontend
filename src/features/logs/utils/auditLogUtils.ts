import { format, formatDistanceToNow } from 'date-fns';
import { AuditLogResponseDto } from '../types/audit.types';

export const formatAuditLogTimestamp = (timestamp: string): string => {
  try {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
  } catch (e) {
    return timestamp;
  }
};

export const formatAuditLogDescription = (log: AuditLogResponseDto): string => {
  const eventTypeMap: Record<string, string> = {
    'create': 'Created',
    'update': 'Updated', 
    'delete': 'Deleted',
    'entity_created': 'Created',
    'entity_updated': 'Updated',
    'login': 'Logged in',
    'logout': 'Logged out',
    'status_changed': 'Status changed'
  };

  const eventLabel = eventTypeMap[log.eventType] || log.eventType;
  const entityLabel = log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1);
  
  return `${eventLabel} ${entityLabel}: ${log.entityId}`;
};

export const formatRelativeTimestamp = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (e) {
    return timestamp;
  }
};

export const getChangesSummary = (log: AuditLogResponseDto): string => {
  if (log.eventType === 'entity_created' && log.newValues) {
    const keys = Object.keys(log.newValues);
    return `Created with ${keys.length} field${keys.length !== 1 ? 's' : ''}`;
  }
  
  if (log.eventType === 'entity_updated' && log.oldValues && log.newValues) {
    const oldKeys = Object.keys(log.oldValues);
    const newKeys = Object.keys(log.newValues);
    const changedKeys = newKeys.filter(key => 
      JSON.stringify(log.oldValues![key]) !== JSON.stringify(log.newValues![key])
    );
    return `Updated ${changedKeys.length} field${changedKeys.length !== 1 ? 's' : ''}`;
  }
  
  if (log.eventType === 'delete' && log.oldValues) {
    const keys = Object.keys(log.oldValues);
    return `Deleted with ${keys.length} field${keys.length !== 1 ? 's' : ''}`;
  }
  
  return 'No changes recorded';
};
