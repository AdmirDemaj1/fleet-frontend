import { CustomerLog, LogOrder, LogOrderBy } from '../types/customerLogs.types';
import { LogFilters } from '../types/logFilters.types';

/**
 * Format date values for logs
 */
export const formatLogDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format log timestamp for display
 */
export const formatLogTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Format log description based on event and entity details
 */
export const formatLogDescription = (log: CustomerLog): string => {
  const { eventType, entityType, entityId } = log;
  
  const eventAction = eventType?.replace('_', ' ') || 'action performed';
  const entity = entityType || 'entity';
  
  let description = `${eventAction} on ${entity}`;
  
  if (entityId) {
    description += ` (ID: ${entityId})`;
  }
  
  return description.charAt(0).toUpperCase() + description.slice(1);
};

/**
 * Get event type display text with proper formatting
 */
export const formatEventType = (eventType: string): string => {
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get entity type display text with proper formatting
 */
export const formatEntityType = (entityType: string): string => {
  return entityType.charAt(0).toUpperCase() + entityType.slice(1);
};

/**
 * Get performer display name
 */
export const getPerformerName = (log: CustomerLog): string => {
  if (log.performedByName) {
    return log.performedByName;
  }
  if (log.performedBy) {
    return log.performedBy;
  }
  return 'System';
};

/**
 * Filter logs based on provided filters
 */
export const filterLogs = (logs: CustomerLog[], filters: LogFilters): CustomerLog[] => {
  return logs.filter(log => {
    // Search filter (searches across multiple fields)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        log.description?.toLowerCase().includes(searchTerm) ||
        log.eventType?.toLowerCase().includes(searchTerm) ||
        log.entityType?.toLowerCase().includes(searchTerm) ||
        log.entityId?.toLowerCase().includes(searchTerm) ||
        getPerformerName(log).toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Event type filter
    if (filters.eventType && filters.eventType !== log.eventType) {
      return false;
    }

    // Entity type filter
    if (filters.entityType && filters.entityType !== log.entityType) {
      return false;
    }

    // Date range filters
    if (filters.startDate) {
      const logDate = new Date(log.timestamp || log.createdAt);
      const startDate = new Date(filters.startDate);
      if (logDate < startDate) return false;
    }

    if (filters.endDate) {
      const logDate = new Date(log.timestamp || log.createdAt);
      const endDate = new Date(filters.endDate);
      if (logDate > endDate) return false;
    }

    return true;
  });
};

/**
 * Sort logs based on provided criteria
 */
export const sortLogs = (logs: CustomerLog[], order: LogOrder, orderBy: LogOrderBy): CustomerLog[] => {
  return [...logs].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (orderBy) {
      case 'timestamp':
      case 'createdAt':
        aValue = new Date(a.timestamp || a.createdAt || 0).getTime();
        bValue = new Date(b.timestamp || b.createdAt || 0).getTime();
        break;
      case 'eventType':
        aValue = a.eventType || '';
        bValue = b.eventType || '';
        break;
      case 'entityType':
        aValue = a.entityType || '';
        bValue = b.entityType || '';
        break;
      case 'description':
        aValue = a.description || '';
        bValue = b.description || '';
        break;
      default:
        aValue = '';
        bValue = '';
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });
};
