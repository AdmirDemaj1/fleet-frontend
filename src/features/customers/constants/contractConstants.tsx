import {
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as PendingIcon,
} from '@mui/icons-material';
import { StatusConfig, TypeConfig } from '../types/customerContracts.types';

// Status configuration
export const CONTRACT_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: { icon: <PendingIcon fontSize="small" />, color: 'default' as const, label: 'Draft' },
  active: { icon: <CheckCircleIcon fontSize="small" />, color: 'success' as const, label: 'Active' },
  pending: { icon: <PendingIcon fontSize="small" />, color: 'warning' as const, label: 'Pending' },
  completed: { icon: <CheckCircleIcon fontSize="small" />, color: 'info' as const, label: 'Completed' },
  cancelled: { icon: <ErrorIcon fontSize="small" />, color: 'error' as const, label: 'Cancelled' }
};

// Contract type configuration
export const CONTRACT_TYPE_CONFIG: Record<string, TypeConfig> = {
  loan: { label: 'Loan', color: '#1976d2' },
  leasing: { label: 'Leasing', color: '#9c27b0' }
};

// Table configuration
export const DEFAULT_ROWS_PER_PAGE = 10;
export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
