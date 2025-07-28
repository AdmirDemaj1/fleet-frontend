import React from 'react';
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
  Receipt as InvoiceIcon
} from '@mui/icons-material';

// Event type options for log filters (matching API documentation)
export const LOG_EVENT_TYPE_OPTIONS = [
  { value: '', label: 'All Events', icon: null },
  { 
    value: 'entity_created', 
    label: 'Created',
    icon: React.createElement(AddIcon, { fontSize: 'small' })
  },
  { 
    value: 'entity_updated', 
    label: 'Updated',
    icon: React.createElement(EditIcon, { fontSize: 'small' })
  },
  { 
    value: 'entity_deleted', 
    label: 'Deleted',
    icon: React.createElement(DeleteIcon, { fontSize: 'small' })
  },
  { 
    value: 'status_changed', 
    label: 'Status Changed',
    icon: React.createElement(VisibilityIcon, { fontSize: 'small' })
  },
  { 
    value: 'payment_made', 
    label: 'Payment Made',
    icon: React.createElement(PaymentIcon, { fontSize: 'small' })
  }
];

// Entity type options for log filters (matching API documentation)
export const LOG_ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'All Entities', icon: null },
  { 
    value: 'customer', 
    label: 'Customer',
    icon: React.createElement(PersonIcon, { fontSize: 'small' })
  },
  { 
    value: 'contract', 
    label: 'Contract',
    icon: React.createElement(ContractIcon, { fontSize: 'small' })
  },
  { 
    value: 'vehicle', 
    label: 'Vehicle',
    icon: React.createElement(VehicleIcon, { fontSize: 'small' })
  },
  { 
    value: 'payment', 
    label: 'Payment',
    icon: React.createElement(InvoiceIcon, { fontSize: 'small' })
  },
  { 
    value: 'collateral', 
    label: 'Collateral',
    icon: React.createElement(BusinessIcon, { fontSize: 'small' })
  }
];

// Date range helper functions
export const getDateRangeOptions = () => [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' }
];

// Helper function to calculate date ranges
export const calculateDateRange = (range: string): { startDate: string; endDate: string } | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
      };
    case '7days':
      return {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: now.toISOString()
      };
    case '30days':
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: now.toISOString()
      };
    case '90days':
      return {
        startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: now.toISOString()
      };
    default:
      return null;
  }
};
