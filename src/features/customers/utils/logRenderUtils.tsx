import React from 'react';
import { Chip, Box } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  DirectionsCar as VehicleIcon,
  Description as ContractIcon,
  Receipt as InvoiceIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { LOG_EVENT_TYPE_OPTIONS, LOG_ENTITY_TYPE_OPTIONS } from '../constants/logFiltersConstants';

// Get icon for event type
export const getLogEventTypeIcon = (eventType?: string) => {
  switch (eventType) {
    case 'entity_created':
      return <AddIcon fontSize="small" color="success" />;
    case 'entity_updated':
      return <EditIcon fontSize="small" color="primary" />;
    case 'entity_deleted':
      return <DeleteIcon fontSize="small" color="error" />;
    case 'status_changed':
      return <VisibilityIcon fontSize="small" color="warning" />;
    case 'payment_made':
      return <PaymentIcon fontSize="small" color="success" />;
    default:
      return <HistoryIcon fontSize="small" color="action" />;
  }
};

// Get icon for entity type  
export const getLogEntityTypeIcon = (entityType?: string) => {
  switch (entityType) {
    case 'customer':
      return <PersonIcon fontSize="small" color="primary" />;
    case 'company':
      return <BusinessIcon fontSize="small" color="primary" />;
    case 'vehicle':
      return <VehicleIcon fontSize="small" color="info" />;
    case 'contract':
      return <ContractIcon fontSize="small" color="secondary" />;
    case 'invoice':
      return <InvoiceIcon fontSize="small" color="success" />;
    default:
      return <HistoryIcon fontSize="small" color="action" />;
  }
};

/**
 * Render event type cell with appropriate styling
 */
export const renderEventTypeCell = (eventType: string) => {
  const config = LOG_EVENT_TYPE_OPTIONS.find(option => option.value === eventType);
  
  if (!config || !eventType) {
    return (
      <Chip
        label={eventType || 'Unknown'}
        size="small"
        variant="outlined"
        color="default"
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {config.icon && (
        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </Box>
      )}
      <Chip
        label={config.label}
        size="small"
        variant="outlined"
        color="primary"
      />
    </Box>
  );
};

/**
 * Render entity type cell with appropriate styling
 */
export const renderEntityTypeCell = (entityType: string) => {
  const config = LOG_ENTITY_TYPE_OPTIONS.find(option => option.value === entityType);
  
  if (!config || !entityType) {
    return (
      <Chip
        label={entityType || 'Unknown'}
        size="small"
        variant="outlined"
        color="default"
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {config.icon && (
        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </Box>
      )}
      <Chip
        label={config.label}
        size="small"
        variant="filled"
        color="secondary"
      />
    </Box>
  );
};
