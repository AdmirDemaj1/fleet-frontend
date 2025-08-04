import React from 'react';
import {
  Add as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as UserIcon,
  DirectionsCar as VehicleIcon,
  Assignment as ContractIcon,
  Business as CustomerIcon,
  Payment as PaymentIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export const getAuditLogEventTypeIcon = (eventType: string): React.ReactNode => {
  switch(eventType.toLowerCase()) {
    case 'create':
    case 'entity_created':
      return <CreateIcon fontSize="small" />;
    case 'update':
    case 'entity_updated':
    case 'status_changed':
      return <UpdateIcon fontSize="small" />;
    case 'delete':
      return <DeleteIcon fontSize="small" />;
    case 'login':
      return <LoginIcon fontSize="small" />;
    case 'logout':
      return <LogoutIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

export const getAuditLogEntityTypeIcon = (entityType: string): React.ReactNode => {
  switch(entityType.toLowerCase()) {
    case 'user':
      return <UserIcon fontSize="small" />;
    case 'customer':
      return <CustomerIcon fontSize="small" />;
    case 'vehicle':
      return <VehicleIcon fontSize="small" />;
    case 'contract':
    case 'collateral':
      return <ContractIcon fontSize="small" />;
    case 'payment':
      return <PaymentIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

// Alias functions to match the import in AuditPage
export const getLogEventTypeIcon = getAuditLogEventTypeIcon;
export const getLogEntityTypeIcon = getAuditLogEntityTypeIcon;

/**
 * Format log timestamp for display
 */
export const formatLogTimestamp = (timestamp: string): string => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
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
